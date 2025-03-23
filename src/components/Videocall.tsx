"use client";

import { CSSProperties, useRef, useState } from "react";
import ZoomVideo, {
  type VideoClient,
  VideoQuality,
  type VideoPlayer,
  type SessionInfo,
} from "@zoom/videosdk";
import { CameraButton, MicButton } from "./MuteButtons";
import { PhoneOff } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";

// interface ISessionInfo {
//   isInMeeting: boolean
//   password: string
//   topic: string
//   userName: string
//   userId: number
//   sessionId: string
// }
const Videocall = (props: { slug: string; JWT: string }) => {
  const session = props.slug;
  const jwt = props.JWT;
  console.log("jwt", jwt);

  const [inSession, setInSession] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo>();
  const client = useRef<typeof VideoClient>(ZoomVideo.createClient());

  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [isVideoMuted, setIsVideoMuted] = useState(
    !client.current.getCurrentUserInfo()?.bVideoOn
  );
  const [isAudioMuted, setIsAudioMuted] = useState(
    client.current.getCurrentUserInfo()?.muted ?? true
  );
  const [isLoading, setIsLoading] = useState(false);

  const joinSession = async () => {
    // INIT
    try {
      await client.current.init("en-US", "Global", { patchJsMedia: true });
      client.current.on(
        "peer-video-state-change",
        (payload) => void renderVideo(payload)
      );

      console.log("start!: ", { session, jwt, userName });

      setIsLoading(true);
      await client.current
        .join(session, jwt, userName)
        .catch((e) => {
          console.log("error join: ", e);
        })
        .finally(() => setIsLoading(false));

      setInSession(true);

      const mediaStream = client.current.getMediaStream();

      // START SHARE SCREEN
      // if (mediaStream.isStartShareScreenWithVideoElement()) {
      //   await mediaStream
      //     .startShareScreen(
      //       document.querySelector("#my-screen-share-content-video") as any
      //     )
      //     .catch((e) => {
      //       throw new Error(e);
      //     });
      //   // screen share successfully started and rendered
      // } else {
      //   await mediaStream
      //     .startShareScreen(
      //       document.querySelector("#my-screen-share-content-canvas") as any
      //     )
      //     .catch((e) => {
      //       throw new Error(e);
      //     });
      //   // screen share successfully started and rendered
      // }

      // START AUDIO
      await mediaStream.startAudio().catch((e) => {
        throw new Error(e);
      });
      // mediaStream.unmuteAudio()
      setIsAudioMuted(mediaStream.isAudioMuted());
      await mediaStream.startVideo({ hd: false }).catch((e) => {
        throw new Error(e);
      });

      setIsVideoMuted(!mediaStream.isCapturingVideo());
      await client.current.getRecordingClient().startCloudRecording();

      setSessionInfo(client.current.getSessionInfo());
      console.log("session info", client.current.getSessionInfo());

      await renderVideo({
        action: "Start",
        userId: client.current.getCurrentUserInfo().userId,
      });
    } catch (error) {
      console.log("ERROR", error);
      alert("there's error");
    }
  };

  const renderVideo = async (event: {
    action: "Start" | "Stop";
    userId: number;
  }) => {
    const mediaStream = client.current.getMediaStream();
    if (event.action === "Stop") {
      const element = await mediaStream.detachVideo(event.userId);
      Array.isArray(element)
        ? element.forEach((el) => el.remove())
        : element.remove();
    } else {
      const userVideo = await mediaStream.attachVideo(
        event.userId,
        VideoQuality.Video_720P
      );
      videoContainerRef.current!.appendChild(userVideo as VideoPlayer);
    }
  };

  const leaveSession = async () => {
    await client.current.getRecordingClient().stopCloudRecording();
    client.current.off(
      "peer-video-state-change",
      (payload: { action: "Start" | "Stop"; userId: number }) =>
        void renderVideo(payload)
    );
    await client.current.leave().catch((e) => console.log("leave error", e));
    // hard refresh to clear the state
    window.location.href = "/";
  };

  return (
    <div className="flex h-full w-full flex-1 flex-col">
      <h1 className="text-center text-3xl font-bold mb-4 mt-0">
        Session: {session}
      </h1>
      <div className="flex gap-4" style={inSession ? {} : { display: "none" }}>
        {/* @ts-expect-error html component */}
        <video-player-container ref={videoContainerRef} style={videoPlayerStyle} />
        <div className="flex gap-5 justify-center w-1/2">
          <video
            id="my-screen-share-content-video"
            className="w-full border border-red-400"
          ></video>
          <canvas
            id="my-screen-share-content-canvas"
            className="hidden w-1/2 border border-red-400"
          ></canvas>
        </div>
      </div>
      {!inSession ? (
        <div className="mx-auto flex w-64 flex-col self-center">
          <div className="w-4" />
          <Button
            className="flex flex-1"
            onClick={joinSession}
            title="join session"
            disabled={isLoading}
          >
            {isLoading ? "Loading" : "Join"}
          </Button>
          <Link
            href={"/test-device"}
            className="text-center mt-3 text-blue-700 hover:text-blue-500"
          >
            Test device here
          </Link>
        </div>
      ) : (
        <div className="flex w-full flex-col justify-around self-center">
          <div className="mt-4 flex w-[30rem] flex-1 justify-around self-center rounded-md bg-white p-4">
            <CameraButton
              client={client}
              isVideoMuted={isVideoMuted}
              setIsVideoMuted={setIsVideoMuted}
              renderVideo={renderVideo}
            />
            <MicButton
              isAudioMuted={isAudioMuted}
              client={client}
              setIsAudioMuted={setIsAudioMuted}
            />
            <Button onClick={leaveSession} title="leave session">
              <PhoneOff />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Videocall;

const videoPlayerStyle = {
  height: "75vh",
  width: "50%",
  marginTop: "1.5rem",
  marginLeft: "3rem",
  marginRight: "3rem",
  alignContent: "center",
  borderRadius: "10px",
  overflow: "hidden",
} as CSSProperties;

const userName = `User-${new Date().getTime().toString().slice(8)}`;
