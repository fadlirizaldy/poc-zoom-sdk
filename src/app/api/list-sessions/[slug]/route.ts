import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const id = params.slug;
  const token = process.env.NEXT_PUBLIC_DUMMY_JWT; // Your Zoom JWT token

  if (!token) {
    return NextResponse.json({ error: "Unauthorized", status: 401, data: [] });
  }

  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${token}`);

    const response = await fetch(
      `https://api.zoom.us/v2/videosdk/sessions/${id}/recordings`,
      {
        method: "GET",
        headers: myHeaders,
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    return NextResponse.json({
      status: 200,
      data: {
        ...data,
        recording_files: data.recording_files.filter(
          (item: any) => item.file_type === "MP4"
        ),
      },
    });
  } catch (error) {
    return NextResponse.json({
      error: "Failed to fetch recording details",
      status: 404,
      data: [],
    });
  }
}
