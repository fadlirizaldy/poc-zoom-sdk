"use client";

import { useState, useRef } from "react";

const VideoRecorder = () => {
  const [recording, setRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }

    mediaRecorder.current = new MediaRecorder(stream, { mimeType: "video/mp4" });

    mediaRecorder.current.ondataavailable = async (event) => {
      if (event.data.size > 0) {
        uploadChunk(event.data); // Upload chunk in real-time
      }
    };

    mediaRecorder.current.start(2000); // Record in 2-second chunks
    setRecording(true);
  };

  const stopRecording = async () => {
    mediaRecorder.current?.stop();
    setRecording(false);

    // Get the final video from the server
    const finalUrl = await fetch("http://localhost:2010/get-final-video")
      .then((res) => res.json())
      .then((data) => data.url);

    setVideoUrl(finalUrl); // Set video for instant preview
  };

  const uploadChunk = async (blob: Blob) => {
    const formData = new FormData();
    formData.append("file", blob, `chunk-${Date.now()}.mp4`);

    await fetch("http://localhost:2010/upload-chunk", {
      method: "POST",
      body: formData,
    });
  };

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline />
      {videoUrl && (
        <div>
          <h3>Recorded Video:</h3>
          <video src={videoUrl} controls />
        </div>
      )}
      <button onClick={recording ? stopRecording : startRecording}>
        {recording ? "Stop Recording" : "Start Recording"}
      </button>
    </div>
  );
};

export default VideoRecorder;
