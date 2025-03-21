"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getDetailRecording } from "@/lib/api-client";
import { getS3Recording } from "@/lib/getS3Recording";

export interface IDataDetail {
  timezone: string;
  duration: number;
  session_id: string;
  session_name: string;
  session_key: string;
  start_time: string;
  total_size: number;
  recording_count: number;
  recording_files: RecordingFile[];
}

export interface RecordingFile {
  id: string;
  status: string;
  recording_start: string;
  recording_end: string;
  file_type: string;
  file_size: number;
  recording_type: string;
  file_extension: string;
  external_storage_url: string;
}

interface IVideoURLS {
  key: string;
  lastModified: string;
  name: string;
  size: number;
  url: string;
}

const DetailPage = () => {
  const params = useSearchParams();
  const id = params.get("id");
  const [data, setData] = useState<IDataDetail>();
  const [videoUrls, setVideoUrls] = useState<IVideoURLS[]>([]);

  useEffect(() => {
    if (id) {
      getDetailRecording(id as any).then((response) => {
        setData(response as any);
      });
    }
  }, [id]);

  useEffect(() => {
    if (data) {
      getS3Recording(data.recording_files).then((res) => {
        setVideoUrls(res as any);
      });
    }
  }, [data]);

  return (
    <div className="p-4">
      <h2 className="font-medium text-xl">Detail Page</h2>

      <div>
        <p>Session Id: {data?.session_id}</p>
        <p>Session Name: {data?.session_name}</p>
        <p>
          Time:{" "}
          {new Date(data?.start_time as any).toLocaleString("en-US", {
            timeZone: "UTC",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          })}
        </p>
      </div>

      <div>
        {videoUrls?.map((record) => (
          <video
            key={record.key}
            src={record.url}
            height={300}
            width={300}
            controls
          />
        ))}
      </div>
    </div>
  );
};

export default DetailPage;
