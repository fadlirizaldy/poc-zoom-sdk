import { RecordingFile } from "@/components/detail-content";
import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: "ap-southeast-1",
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_ID as string,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY as string,
  },
});

const fetchS3Files = async () => {
  try {
    const listCommand = new ListObjectsV2Command({
      Bucket: "aiho-invite-s3-dev",
      Prefix: "cmr/byos",
    });

    const listResponse = await s3Client.send(listCommand);
    if (!listResponse.Contents) {
      return;
    }

    const s3Files = listResponse.Contents.map((item) => ({
      key: item.Key,
      name: item.Key?.split("/").pop(),
      size: item.Size,
      lastModified: item.LastModified,
    }));

    return s3Files;
  } catch (error) {
    console.log(error);
  }
};

export const getS3Recording = async (listRecording: RecordingFile[]) => {
  const s3Files = await fetchS3Files();

  // Extract filenames from Zoom URLs
  const zoomFiles = listRecording.map((item) => ({
    id: item.id,
    url: item.external_storage_url?.split("/").pop(),
  }));

  const matchedFiles = zoomFiles.map((zoomFile) => {
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
        Key: file.s3Key as any,
      });

      const url = await getSignedUrl(s3Client, getCommand, {
        expiresIn: 3600,
      });

      return {
        key: file.s3Key,
        url: url,
        size: file.s3Size,
        lastModified: file.s3LastModified,
        name: file.s3Key?.split("/").pop(),
      };
    })
  );

  return videoUrls;
};
