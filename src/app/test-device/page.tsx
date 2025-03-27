import React from "react";
import dynamic from "next/dynamic";

const TestDevicesWithZoom = dynamic(
  () => import("@/components/TestDevicesWithZoom"),
  { ssr: false }
);
const TestSpeechToText = dynamic(
  () => import("@/components/SpeechToTextComponent"),
  { ssr: false }
);

const TestDevicePage = () => {
  return (
    <div>
      {/* <TestDevicesWithZoom /> */}
      <TestSpeechToText />
    </div>
  );
};

export default TestDevicePage;
