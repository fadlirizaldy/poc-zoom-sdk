"use client";

import { getDetailRecording } from "@/lib/api-client";
import { fetchS3Files } from "@/lib/getS3Recording";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";

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

const DetailPageContent = () => {
  const params = useSearchParams();
  let id = params.get("id");
  console.log("idddd", id);

  const [data, setData] = useState<IDataDetail>();
  const [videoUrls, setVideoUrls] = useState<IVideoURLS[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (id) {
      getDetailRecording(decodeURIComponent(id)).then((response) => {
        setData(response as any);
      });
    }
  }, [id]);

  useEffect(() => {
    if (data) {
      setIsLoading(true);
      fetchS3Files(data.recording_files)
        .then((res) => {
          setVideoUrls(res as any);
        })
        .finally(() => setIsLoading(false));
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

      {isLoading ? (
        <div>Loading..</div>
      ) : (
        <div className="mt-4">
          {videoUrls && videoUrls.length > 0 ? (
            videoUrls?.map((record) => (
              <video
                key={record.key}
                src={record.url}
                height={300}
                width={300}
                controls
              />
            ))
          ) : (
            <p className="text-slate-400 italic">No video recording</p>
          )}
        </div>
      )}
    </div>
  );
};

export default DetailPageContent;
