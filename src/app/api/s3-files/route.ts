// app/api/s3-files/route.ts
import { NextResponse } from "next/server";
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { RecordingFile } from "@/components/detail-content";

const s3Client = new S3Client({
  region: "ap-southeast-1",
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_ID as string,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY as string,
  },
});

async function fetchS3Files() {
  try {
    const listCommand = new ListObjectsV2Command({
      Bucket: "aiho-invite-s3-dev",
      Prefix: "cmr/byos",
    });

    const listResponse = await s3Client.send(listCommand);
    if (!listResponse.Contents) {
      return [];
    }

    return listResponse.Contents.map((item) => ({
      key: item.Key,
      name: item.Key?.split("/").pop(),
      size: item.Size,
      lastModified: item.LastModified,
    }));
  } catch (error) {
    console.error("Error fetching S3 files:", error);
    return [];
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const listRecording: RecordingFile[] = body.recordings;
    const s3Files = await fetchS3Files();

    // Extract filenames from Zoom URLs
    const zoomFiles = listRecording?.map((item) => ({
      id: item.id,
      url: item.external_storage_url?.split("/").pop(),
    }));

    const matchedFiles = zoomFiles?.map((zoomFile) => {
      const s3File = s3Files?.find((s3) => s3.name === zoomFile.url);
      return s3File
        ? {
            ...zoomFile,
            s3Key: s3File.key,
            s3Size: s3File.size,
            s3LastModified: s3File.lastModified,
          }
        : { ...zoomFile, s3Key: null, s3LastModified: undefined, s3Size: null };
    });

    const videoUrls = await Promise.all(
      matchedFiles.map(async (file) => {
        const getCommand = new GetObjectCommand({
          Bucket: "aiho-invite-s3-dev",
          Key: file.s3Key as string,
        });

        const signedUrl = await getSignedUrl(s3Client, getCommand, {
          expiresIn: 3600,
        });

        return {
          key: file.s3Key,
          url: signedUrl,
          size: file.s3Size,
          lastModified: file.s3LastModified,
          name: file.s3Key?.split("/").pop(),
        };
      })
    );

    return NextResponse.json(videoUrls);
  } catch (error) {
    console.error("Error generating signed URLs:", error);
    return NextResponse.json({ error: "Failed to fetch S3 files" }, { status: 500 });
  }
}
