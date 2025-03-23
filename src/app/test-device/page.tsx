import React from "react";
import dynamic from "next/dynamic";

const TestDevicesWithZoom = dynamic(
  () => import("@/components/TestDevicesWithZoom"),
  { ssr: false }
);

const TestDevicePage = () => {
  return (
    <div>
      <TestDevicesWithZoom />
    </div>
  );
};

export default TestDevicePage;
