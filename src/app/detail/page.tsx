"use client";

import DetailPageContent from "@/components/detail-content";
import React, { Suspense, useEffect, useState } from "react";

const DetailPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DetailPageContent />
    </Suspense>
  );
};

export default DetailPage;
