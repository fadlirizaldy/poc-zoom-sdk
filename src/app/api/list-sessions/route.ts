import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.NEXT_PUBLIC_DUMMY_JWT; // Your Zoom JWT token

  if (!token) {
    return NextResponse.json({ error: "Unauthorized", status: 401, data: [] });
  }

  try {
    const zoomResponse = await fetch(
      "https://api.zoom.us/v2/videosdk/recordings?from=2025-02-01&to=2025-12-02",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!zoomResponse.ok) {
      return NextResponse.json({
        error: "Failed to fetch recording details",
        status: zoomResponse.status,
        data: [],
      });
    }

    const data = await zoomResponse.json();

    const recordings = data.sessions.map((x: any) => ({
      id: x.session_id,
      name: x.session_name,
      recordings: x.recording_files
        .filter((y: any) => y.file_extension === "MP4")
        .map((y: any) => ({
          id: y.id,
          type: y.recording_type,
          fileExt: y.file_extension,
          size: y.file_size,
          downloadUrl: y.external_storage_url,
        })),
    }));

    return NextResponse.json({ status: 200, data: recordings });
  } catch (error) {
    return NextResponse.json({
      error: "Failed to fetch recording",
      status: 404,
      data: [],
    });
  }
}
