import { NextResponse } from "next/server";

export async function GET() {
  console.log("TOKENN", process.env.NEXT_PUBLIC_DUMMY_JWT);
  const token = process.env.NEXT_PUBLIC_DUMMY_JWT;

  if (!token) {
    return NextResponse.json(
      { status: "error", message: "Token is missing" },
      { status: 401 }
    );
  }

  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${token}`);

    const response = await fetch(
      "https://api.zoom.us/v2/videosdk/recordings?from=2025-02-01&to=2025-04-02",
      {
        method: "GET",
        headers: myHeaders,
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { status: "error", message: "Failed to fetch recordings" },
        { status: response.status }
      );
    }

    const data = await response.json();

    const recordings = data.sessions.map((x: any) => ({
      id: x.session_id,
      name: x.session_name,
      recordings: x.recording_files
        .filter(
          (y: any) =>
            y.recording_type !== "audio_transcript" &&
            y.recording_type !== "timeline"
        )
        .map((y: any) => ({
          id: y.id,
          type: y.recording_type,
          fileExt: y.file_extension,
          size: y.file_size,
          downloadUrl: y.download_url,
        })),
    }));

    return NextResponse.json({ status: "success", data: recordings });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: (error as any).message },
      { status: 500 }
    );
  }
}
