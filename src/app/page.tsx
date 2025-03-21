"use client";
import ListRecording from "@/components/list-recording";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface IVideos {
  key: string | undefined;
  url: string;
  size: number | undefined;
  lastModified: Date | undefined;
  name: string | undefined;
}

export default function Home() {
  const [sessionName, setSessionName] = useState("");
  const router = useRouter();

  return (
    <main className="flex flex-col items-center justify-between p-24">
      <h1 className="text-3xl font-bold text-center my-4">Zoom VideoSDK</h1>
      <Input
        type="text"
        className="w-full max-w-xs"
        placeholder="Session Name"
        value={sessionName}
        onChange={(e) => setSessionName(e.target.value)}
      />
      <Button
        className="w-full max-w-xs mt-8"
        disabled={!sessionName}
        onClick={() => router.push(`/call/${sessionName}`)}
      >
        Create Session
      </Button>

      <ListRecording />
    </main>
  );
}
