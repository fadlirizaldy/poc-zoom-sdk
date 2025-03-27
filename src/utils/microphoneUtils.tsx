import * as sdk from "microsoft-cognitiveservices-speech-sdk";

export const microphone = (
  startText: string,
  stopText: string,
  speechRecognizer: sdk.SpeechRecognizer | null,
  onRecognized: (value: string) => void,
  onFinishListening: () => void
) => {
  const audioPlayer: HTMLAudioElement = document.getElementById(
    "audioPlayer"
  ) as HTMLAudioElement;

  if (!speechRecognizer) {
    return;
  }

  speechRecognizer.sessionStopped = () => {
    console.log("Speech recognizer has stopped.");
    onFinishListening();
  };

  speechRecognizer.recognizing = () => {
    // microphoneBtn.disabled = true;
  };

  // Check if the microphone button shows the start state
  // if (microphoneBtn.innerHTML === stopText) {
  //   // Stop recognition
  //   microphoneBtn.disabled = true;

  //   speechRecognizer.stopContinuousRecognitionAsync(
  //     () => {
  //       microphoneBtn.innerHTML = startText;
  //       microphoneBtn.disabled = false;
  //     },
  //     err => {
  //       console.error("Failed to stop continuous recognition:", err);
  //       microphoneBtn.disabled = false;
  //     }
  //   );

  //   return;
  // }

  if (audioPlayer) {
    audioPlayer.play();
  }

  // Start listening and accumulate recognized speech
  speechRecognizer.recognized = async (s, e) => {
    if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
      let userQuery = e.result.text.trim();
      if (userQuery === "") {
        return;
      }
      // microphoneBtn.disabled = false;

      onRecognized(userQuery);
    }
  };

  // Start continuous recognition
  speechRecognizer.startContinuousRecognitionAsync(
    () => {
      console.log("listening...");
      // microphoneBtn.innerHTML = stopText;
    },
    (err) => {
      console.error("Failed to start continuous recognition:", err);
    }
  );
};
