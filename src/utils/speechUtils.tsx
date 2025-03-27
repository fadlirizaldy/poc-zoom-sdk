import * as sdk from "microsoft-cognitiveservices-speech-sdk";

const azureSubscriptionKey = "0bd46896daad4c1a887dd833048f4d67";
const azureServiceRegion = "southeastasia";

export const getSpeechSynthesizer = () => {
  const speechSynthesizer = sdk.SpeechConfig.fromSubscription(
    azureSubscriptionKey,
    azureServiceRegion
  );

  return speechSynthesizer;
};

export const getSpeechRecognizer = () => {
  const speechRecognitionConfig = sdk.SpeechConfig.fromEndpoint(
    new URL(
      `wss://${azureServiceRegion}.stt.speech.microsoft.com/speech/universal/v2`
    ),
    azureSubscriptionKey
  );

  speechRecognitionConfig.setProperty(
    sdk.PropertyId.SpeechServiceConnection_LanguageIdMode,
    "Continuous"
  );

  const sttLocales = "id-ID,en-US,de-DE,es-ES,fr-FR,it-IT,ja-JP,ko-KR,zh-CN".split(
    ","
  );
  const autoDetectSourceLanguageConfig =
    sdk.AutoDetectSourceLanguageConfig.fromLanguages(sttLocales);

  const speechRecognizer = sdk.SpeechRecognizer.FromConfig(
    speechRecognitionConfig,
    autoDetectSourceLanguageConfig,
    sdk.AudioConfig.fromDefaultMicrophoneInput()
  );

  return speechRecognizer;
};
