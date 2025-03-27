"use client";

import * as sdk from "microsoft-cognitiveservices-speech-sdk";

import React, { useEffect, useRef, useState } from "react";
import ZoomVideo, {
  type VideoClient,
  VideoQuality,
  type VideoPlayer,
  type SessionInfo,
} from "@zoom/videosdk";
import { Button } from "./ui/button";
import { getSpeechRecognizer } from "@/utils/speechUtils";
import { setupWebRTC } from "@/utils/webRTC";
import { microphone } from "@/utils/microphoneUtils";

export interface IMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const TestSpeechToText = () => {
  const client = useRef<typeof VideoClient>(ZoomVideo.createClient());
  const videoDevices = useRef<MediaDeviceInfo[] | null>(null);
  const audioDevices = useRef<MediaDeviceInfo[] | null>(null);

  const localVideoTrack = useRef<any>();
  // const localAudioTrack = useRef<any>();
  const microphoneTester = useRef<any>(null);
  const remoteVideo = useRef<HTMLDivElement>(null);

  const speechRecognizer = useRef<sdk.SpeechRecognizer | null>(null);

  const [isTesting, setIsTesting] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [contMsg, setContMsg] = useState("");
  const [message, setMessage] = useState<IMessage[]>([]);
  const [recordedUrl, setRecordedUrl] = useState<string>("");
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  console.log("chunkss", recordedChunks);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    speechRecognizer.current = getSpeechRecognizer();
  }, []);

  const initXHR = () => {
    const xhr = new XMLHttpRequest();

    xhr.open(
      "GET",
      `https://southeastasia.tts.speech.microsoft.com/cognitiveservices/avatar/relay/token/v1`
    );
    xhr.setRequestHeader(
      "Ocp-Apim-Subscription-Key",
      "0bd46896daad4c1a887dd833048f4d67"
    );
    xhr.addEventListener("readystatechange", () => {
      if (xhr.readyState === 4) {
        const responseData = JSON.parse(xhr.responseText);
        const iceServerUrl = responseData.Urls[0];
        const iceServerUsername = responseData.Username;
        const iceServerCredential = responseData.Password;
        setupWebRTC(
          iceServerUrl,
          iceServerUsername,
          iceServerCredential,
          remoteVideo.current!
        );
      }
    });
    xhr.send();
  };

  useEffect(() => {
    console.log(contMsg);
  }, [contMsg]);

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

  const handleContMsg = (value: string) => {
    setContMsg((prev) => prev + value + " ");
  };

  const handleMessage = (content: string, role: "user" | "assistant" | "system") => {
    const _message = message;

    const newMessage: IMessage = {
      role,
      content,
    };

    console.log("NEW MESS", newMessage);
    setMessage([..._message, newMessage]);

    // reset spoken message from user
    setContMsg("");
  };

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
      let audioStream: MediaStream | null = null;
      if (tmpMicrophoneDevices.length > 0) {
        // const localTrackAudio = await ZoomVideo.createLocalAudioTrack(
        //   tmpMicrophoneDevices[0].deviceId
        // );
        // await localTrackAudio.start();
        // localAudioTrack.current = localTrackAudio;

        // Create audio stream directly from microphone
        audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            deviceId: tmpMicrophoneDevices[0].deviceId,
            echoCancellation: true,
            noiseSuppression: true,
          },
        });
      }

      // Get video stream from preview element
      const videoElement = document.querySelector(
        "#local-preview-video"
      ) as HTMLVideoElement;
      const videoStream = (videoElement as any).captureStream();

      // Combine audio and video streams
      const combinedStream = new MediaStream();

      // Add video tracks
      videoStream.getVideoTracks().forEach((track: any) => {
        combinedStream.addTrack(track);
      });

      // Add audio tracks if available
      if (audioStream) {
        audioStream.getAudioTracks().forEach((track) => {
          combinedStream.addTrack(track);
        });
      }

      // Start recording
      const chunks: Blob[] = [];
      mediaRecorderRef.current = new MediaRecorder(combinedStream, {
        mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
          ? "video/webm;codecs=vp9,opus"
          : "video/webm",
      });

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, {
          type: mediaRecorderRef.current?.mimeType || "video/webm",
        });
        setRecordedUrl(URL.createObjectURL(blob));

        // Clean up streams
        combinedStream.getTracks().forEach((track) => track.stop());
        if (audioStream) {
          audioStream.getTracks().forEach((track) => track.stop());
        }
      };

      mediaRecorderRef.current.start(100); // Collect data every 100ms

      videoDevices.current = tmpVideoDevices;
      audioDevices.current = tmpMicrophoneDevices;

      initXHR();

      microphone(
        "Start Microphone",
        "Stop Microphone",
        speechRecognizer.current!,
        (value) => {
          handleContMsg(value);
        },
        () => handleMessage(contMsg, "user")
      );
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
    speechRecognizer.current?.stopContinuousRecognitionAsync();
    localVideoTrack.current.stop();
    // localAudioTrack.current.stop();
    mediaRecorderRef.current?.stop();
    microphoneTester.current?.destroy(); // Stop speaker test
    microphoneTester.current = null;

    // Remove caption message listener
    client.current.off("caption-message", () => {});
    setIsTesting(false);
  };

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      if (recordedUrl) {
        URL.revokeObjectURL(recordedUrl);
      }
    };
  }, [recordedUrl]);

  console.log(
    "DEVICEE",
    videoDevices,
    localVideoTrack,
    "AUDIO",
    audioDevices,
    recordedUrl
  );

  return (
    <div className="flex h-full w-full flex-1 flex-col mt-10 items-center">
      <h1 className="text-center text-xl font-bold mb-4 mt-0">Device Testing</h1>

      <div className="flex justify-center space-x-2 mb-4">
        <Button className="flex-1" onClick={isTesting ? stopTesting : startTesting}>
          {isTesting ? "Stop Testing" : "Start Testing"}
        </Button>
      </div>

      <div>{recordedUrl && <video src={recordedUrl} controls></video>}</div>

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

      <div className="mt-4 text-center">
        <p>Text: {contMsg}</p>
      </div>
    </div>
  );
};

export default TestSpeechToText;
