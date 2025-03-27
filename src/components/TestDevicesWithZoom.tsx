"use client";

import React, { useEffect, useRef, useState } from "react";
import ZoomVideo, {
  type VideoClient,
  VideoQuality,
  type VideoPlayer,
  type SessionInfo,
} from "@zoom/videosdk";
import { Button } from "./ui/button";

const TestDevicesWithZoom = () => {
  const client = useRef<typeof VideoClient>(ZoomVideo.createClient());
  const videoDevices = useRef<MediaDeviceInfo[] | null>(null);
  const audioDevices = useRef<MediaDeviceInfo[] | null>(null);

  const localVideoTrack = useRef<any>();
  const localAudioTrack = useRef<any>();
  const microphoneTester = useRef<any>(null);
  const liveTranscription = useRef<any>(null);

  const [isTesting, setIsTesting] = useState(false);
  const [micLevel, setMicLevel] = useState(0);

  const [transcriptions, setTranscriptions] = useState<string[]>([]);

  // useEffect(() => {
  //   if (isTesting) {
  //     const trans = async () => {
  //       try {
  //         const liveTranscriptionTranslation =
  //           client.current.getLiveTranscriptionClient();

  //         console.log("popop");
  //         await liveTranscriptionTranslation.startLiveTranscription();

  //         // Listen for transcription messages
  //         client.current.on("caption-message", (payload) => {
  //           console.log(`${payload} said: ${payload.text}`);
  //           setTranscriptions((prev) => [
  //             ...prev,
  //             `${payload.displayName}: ${payload.text}`,
  //           ]);
  //         });
  //       } catch (error) {
  //         console.log("error", error);
  //       }
  //     };
  //     trans();
  //   }
  // }, [isTesting]);

  const startTesting = async () => {
    try {
      await client.current.init("en-US", "Global", { patchJsMedia: true });

      const devices = await ZoomVideo.getDevices();
      const tmpVideoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );

      const tmpMicrophoneDevices = devices.filter(
        (device) => device.kind === "audioinput"
      );

      // START VIDEO
      if (tmpVideoDevices.length > 0) {
        const localTrackVideo = await ZoomVideo.createLocalVideoTrack(
          tmpVideoDevices[0].deviceId
        );
        await localTrackVideo.start(
          document.querySelector("#local-preview-video") as any
        );
        localVideoTrack.current = localTrackVideo;
      }

      // START AUDIO
      if (tmpMicrophoneDevices.length > 0) {
        const localTrackAudio = await ZoomVideo.createLocalAudioTrack(
          tmpMicrophoneDevices[0].deviceId
        );
        await localTrackAudio.start();
        localAudioTrack.current = localTrackAudio;
      }

      videoDevices.current = tmpVideoDevices;
      audioDevices.current = tmpMicrophoneDevices;

      // START LIVE TRANSCRIPTION
      // const liveTranscriptionTranslation =
      //   client.current.getLiveTranscriptionClient();

      // console.log("liveee", liveTranscriptionTranslation);
      // // Start live transcription
      // await liveTranscriptionTranslation.startLiveTranscription();
      // // liveTranscriptionTranslation.setTranslationLanguage("id");
      // // liveTranscriptionTranslation.setSpeakingLanguage("id");

      // // Set up transcription event listener
      // client.current.on("caption-message", (payload) => {
      //   console.log(`${payload.displayName} said: ${payload.text}`);
      //   setTranscriptions((prev) => [
      //     ...prev,
      //     `${payload.displayName}: ${payload.text}`,
      //   ]);
      // });

      setIsTesting(true);
    } catch (error) {
      console.error("Error starting test:", error);
    }
  };

  // useEffect(() => {
  //   if (isTesting && localAudioTrack.current) {
  //     microphoneTester.current = localAudioTrack.current.testMicrophone({
  //       speakerId: null, // No need for speaker output
  //       onAnalyseFrequency: (v: number) => {
  //         setMicLevel(v); // Dynamically update mic level
  //       },
  //     });

  //     return () => {
  //       microphoneTester.current?.stop();
  //       microphoneTester.current = null;
  //     };
  //   }
  // }, [isTesting]);

  const stopTesting = async () => {
    localVideoTrack.current.stop();
    localAudioTrack.current.stop();
    microphoneTester.current?.destroy(); // Stop speaker test
    microphoneTester.current = null;

    // Stop live transcription
    const liveTranscriptionTranslation = client.current.getLiveTranscriptionClient();
    liveTranscriptionTranslation.disableCaptions(true);

    // Remove caption message listener
    client.current.off("caption-message", () => {});
    setIsTesting(false);
  };

  return (
    <div className="flex h-full w-full flex-1 flex-col mt-10 items-center">
      <h1 className="text-center text-xl font-bold mb-4 mt-0">Device Testing</h1>

      <div className="flex justify-center space-x-2 mb-4">
        <Button className="flex-1" onClick={isTesting ? stopTesting : startTesting}>
          {isTesting ? "Stop Testing" : "Start Testing"}
        </Button>
      </div>

      {isTesting && (
        <div>
          <h2>Text:</h2>
          <p>{transcriptions}</p>
        </div>
      )}

      <div className={`${isTesting ? "block" : "hidden"}`}>
        {/* @ts-expect-error html component */}
        <video-player-container class="local-preview-container">
          <video id="local-preview-video"></video>
          {/* @ts-expect-error html component */}
        </video-player-container>
        <label htmlFor="speaker-output-level">Outputlevel:</label>
        {/* <progress id="speaker-output-level" max="100" value="0"></progress> */}
        <input
          id="mic-input-level"
          type="range"
          min="0"
          max="100"
          readOnly
          value={micLevel}
        />
      </div>
    </div>
  );
};

export default TestDevicesWithZoom;
