import * as sdk from "microsoft-cognitiveservices-speech-sdk";

export const setupWebRTC = (
  iceServerUrl: any,
  iceServerUsername: any,
  iceServerCredential: any,
  // startButton: HTMLButtonElement,
  remoteVideo: HTMLDivElement
) => {
  const peerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: [iceServerUrl],
        username: iceServerUsername,
        credential: iceServerCredential,
      },
    ],
  });

  // disable start button on start session
  // startButton.disabled = true;

  peerConnection.ontrack = (e) => {
    console.log("trackkk", e);
    if (e.track.kind === "audio") {
      let audioElement = document.createElement("audio");
      audioElement.id = "audioPlayer";
      audioElement.srcObject = e.streams[0];
      audioElement.autoplay = true;

      audioElement.onplaying = () => {
        console.log(`WebRTC ${e.track.kind} channel connected.`);
      };

      // Clean up existing audio element if there is any
      //   const remoteVideoDiv = document.getElementById("remoteVideo");

      const remoteVideoDiv = remoteVideo;

      if (remoteVideoDiv) {
        Array.from(remoteVideoDiv.childNodes).forEach((child) => {
          if ((child as HTMLElement).localName === e.track.kind) {
            remoteVideoDiv.removeChild(child);
          }
        });
        remoteVideoDiv.appendChild(audioElement);
      }
    }
  };

  // Listen to data channel, to get the event from the server
  peerConnection.addEventListener("datachannel", (event) => {
    const dataChannel = event.channel;
    dataChannel.onmessage = (e) => {
      console.log(
        "[" + new Date().toISOString() + "] WebRTC event received: " + e.data
      );
    };
  });

  // This is a workaround to make sure the data channel listening is working by creating a data channel from the client side
  const c = peerConnection.createDataChannel("eventChannel");

  // Make necessary update to the web page when the connection state changes
  peerConnection.oniceconnectionstatechange = (e) => {
    console.log("WebRTC status: " + peerConnection.iceConnectionState);
    if (peerConnection.iceConnectionState === "disconnected") {
      // handle idle
    }
  };

  // Offer to receive 1 audio
  peerConnection.addTransceiver("audio", { direction: "sendrecv" });
};
