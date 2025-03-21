"use client";

import React, { useRef, useState, useEffect } from "react";
import { Button } from "./ui/button";
import ZoomVideo from "@zoom/videosdk";

const TestDevices = () => {
  const client = useRef(ZoomVideo.createClient());
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState("");
  const [selectedVideoDevice, setSelectedVideoDevice] = useState("");
  const [audioLevel, setAudioLevel] = useState(0);
  const audioLevelIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize client on component mount
    const initClient = async () => {
      try {
        await client.current.init("en-US", "Global", { patchJsMedia: true });
        // Get available devices
        await getDeviceList();
      } catch (error) {
        console.error("Failed to initialize Zoom client:", error);
      }
    };

    initClient();

    return () => {
      // Clean up when component unmounts
      stopTesting();
      if (audioLevelIntervalRef.current) {
        clearInterval(audioLevelIntervalRef.current);
      }
    };
  }, []);

  const getDeviceList = async () => {
    try {
      // Get available audio and video devices using browser's API
      const devices = await navigator.mediaDevices.enumerateDevices();

      const audioInputs = devices.filter((device) => device.kind === "audioinput");
      const videoInputs = devices.filter((device) => device.kind === "videoinput");

      setAudioDevices(audioInputs);
      setVideoDevices(videoInputs);

      // Set default selections
      if (audioInputs.length > 0) {
        setSelectedAudioDevice(audioInputs[0].deviceId);
      }
      if (videoInputs.length > 0) {
        setSelectedVideoDevice(videoInputs[0].deviceId);
      }
    } catch (error) {
      console.error("Failed to get device list:", error);
    }
  };

  const startTesting = async () => {
    try {
      setIsTesting(true);
      const mediaStream = client.current.getMediaStream();

      // Set selected devices
      if (selectedAudioDevice) {
        await mediaStream.switchMicrophone(selectedAudioDevice);
      }
      if (selectedVideoDevice) {
        await mediaStream.switchCamera(selectedVideoDevice);
      }

      // Start audio testing
      await mediaStream.startAudio().catch((e) => {
        throw new Error(`Failed to start audio: ${e}`);
      });

      // Start video testing
      await mediaStream.startVideo().catch((e) => {
        throw new Error(`Failed to start video: ${e}`);
      });

      // Unmute audio and video for testing
      mediaStream.unmuteAudio();
      setIsAudioMuted(false);
      setIsVideoMuted(false);

      // Render local video preview
      const userId = client.current.getCurrentUserInfo()?.userId;
      if (userId) {
        await renderVideo({
          action: "Start",
          userId,
        });
      }

      // Start audio level monitoring
      startAudioLevelMonitoring();
    } catch (error) {
      console.error("Failed to start testing:", error);
      alert(`Testing failed: ${error}`);
      stopTesting();
    }
  };

  const stopTesting = () => {
    if (!isTesting) return;

    try {
      const mediaStream = client.current.getMediaStream();
      const userId = client.current.getCurrentUserInfo()?.userId;

      // Stop video and audio
      if (mediaStream) {
        mediaStream.stopVideo();
        mediaStream.stopAudio();

        // Remove video element
        if (userId) {
          renderVideo({
            action: "Stop",
            userId,
          });
        }
      }

      // Stop audio level monitoring
      if (audioLevelIntervalRef.current) {
        clearInterval(audioLevelIntervalRef.current);
        audioLevelIntervalRef.current = null;
      }

      setIsVideoMuted(true);
      setIsAudioMuted(true);
      setIsTesting(false);
      setAudioLevel(0);
    } catch (error) {
      console.error("Error stopping test:", error);
    }
  };

  const startAudioLevelMonitoring = () => {
    const mediaStream = client.current.getMediaStream();

    // Stop any existing interval
    if (audioLevelIntervalRef.current) {
      clearInterval(audioLevelIntervalRef.current);
    }

    // Start monitoring audio levels every 100ms
    audioLevelIntervalRef.current = setInterval(() => {
      const level = mediaStream.getAudioInputLevel();
      setAudioLevel(level);
    }, 100);
  };

  const toggleAudio = () => {
    const mediaStream = client.current.getMediaStream();

    if (isAudioMuted) {
      mediaStream.unmuteAudio();
      setIsAudioMuted(false);
    } else {
      mediaStream.muteAudio();
      setIsAudioMuted(true);
    }
  };

  const toggleVideo = () => {
    const mediaStream = client.current.getMediaStream();

    if (isVideoMuted) {
      mediaStream.unmuteVideo();
      setIsVideoMuted(false);
    } else {
      mediaStream.muteVideo();
      setIsVideoMuted(true);
    }
  };

  const renderVideo = async (event: {
    action: "Start" | "Stop";
    userId: number;
  }) => {
    const mediaStream = client.current.getMediaStream();

    if (!mediaStream || !videoContainerRef.current) return;

    if (event.action === "Stop") {
      try {
        const element = await mediaStream.detachVideo(event.userId);
        if (Array.isArray(element)) {
          element.forEach((el) => el.remove());
        } else if (element) {
          element.remove();
        }
      } catch (error) {
        console.error("Failed to detach video:", error);
      }
    } else {
      try {
        const userVideo = await mediaStream.attachVideo(event.userId, "video");

        if (userVideo && videoContainerRef.current) {
          videoContainerRef.current.innerHTML = "";
          videoContainerRef.current.appendChild(userVideo);
        }
      } catch (error) {
        console.error("Failed to attach video:", error);
      }
    }
  };

  const changeAudioDevice = async (deviceId: string) => {
    setSelectedAudioDevice(deviceId);

    if (isTesting) {
      const mediaStream = client.current.getMediaStream();
      await mediaStream.switchMicrophone(deviceId);
    }
  };

  const changeVideoDevice = async (deviceId: string) => {
    setSelectedVideoDevice(deviceId);

    if (isTesting) {
      const mediaStream = client.current.getMediaStream();
      await mediaStream.switchCamera(deviceId);

      // Re-render video after changing camera
      const userId = client.current.getCurrentUserInfo()?.userId;
      if (userId) {
        await renderVideo({
          action: "Start",
          userId,
        });
      }
    }
  };

  return (
    <div className="flex h-full w-full flex-1 flex-col mt-10 items-center">
      <h1 className="text-center text-xl font-bold mb-4 mt-0">Device Testing</h1>

      <div className="w-full max-w-md mb-4">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Camera</label>
          <select
            className="w-full p-2 border rounded"
            value={selectedVideoDevice}
            onChange={(e) => changeVideoDevice(e.target.value)}
            disabled={isTesting}
          >
            {videoDevices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${device.deviceId.slice(0, 5)}...`}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Microphone</label>
          <select
            className="w-full p-2 border rounded"
            value={selectedAudioDevice}
            onChange={(e) => changeAudioDevice(e.target.value)}
            disabled={isTesting}
          >
            {audioDevices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Microphone ${device.deviceId.slice(0, 5)}...`}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-center space-x-2 mb-4">
        <Button className="flex-1" onClick={isTesting ? stopTesting : startTesting}>
          {isTesting ? "Stop Testing" : "Start Testing"}
        </Button>

        {isTesting && (
          <>
            <Button className="bg-blue-500 hover:bg-blue-600" onClick={toggleAudio}>
              {isAudioMuted ? "Unmute Audio" : "Mute Audio"}
            </Button>
            <Button className="bg-blue-500 hover:bg-blue-600" onClick={toggleVideo}>
              {isVideoMuted ? "Unmute Video" : "Mute Video"}
            </Button>
          </>
        )}
      </div>

      {isTesting && !isAudioMuted && (
        <div className="mb-4 w-full max-w-md">
          <label className="block text-sm font-medium mb-1">Audio Level</label>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-green-500 h-4 rounded-full"
              style={{ width: `${Math.min(audioLevel * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      <div
        className="w-full max-w-md overflow-hidden bg-black rounded-lg"
        style={{ height: "300px" }}
      >
        <div ref={videoContainerRef} className="w-full h-full" />
      </div>
    </div>
  );
};

export default TestDevices;
