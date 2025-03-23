export const getRecordingListClient = async () => {
  try {
    const response = await fetch("/api/list-sessions", { method: "GET" });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching recording details:", error);
    return [];
  }
  // const token = process.env.NEXT_PUBLIC_DUMMY_JWT;

  // if (!token) {
  //   return [];
  // }

  // try {
  //   const myHeaders = new Headers();
  //   myHeaders.append("Content-Type", "application/json");
  //   myHeaders.append("Authorization", `Bearer ${token}`);

  //   const response = await fetch(
  //     "https://api.zoom.us/v2/videosdk/recordings?from=2025-02-01&to=2025-12-02",
  //     {
  //       method: "GET",
  //       headers: myHeaders,
  //     }
  //   );

  //   if (!response.ok) {
  //     return null;
  //   }

  //   const data = await response.json();

  //   const recordings = data.sessions.map((x: any) => ({
  //     id: x.session_id,
  //     name: x.session_name,
  //     recordings: x.recording_files
  //       .filter((y: any) => y.file_extension === "MP4")
  //       .map((y: any) => ({
  //         id: y.id,
  //         type: y.recording_type,
  //         fileExt: y.file_extension,
  //         size: y.file_size,
  //         downloadUrl: y.external_storage_url,
  //       })),
  //   }));

  //   return recordings;
  // } catch (error) {
  //   return [];
  // }
};

export const getDetailRecording = async (id: string) => {
  try {
    const response = await fetch(`/api/list-sessions/${id}`, { method: "GET" });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching recording details:", error);
    return [];
  }
  // const token = process.env.NEXT_PUBLIC_DUMMY_JWT;

  // if (!token) {
  //   return [];
  // }

  // try {
  //   const myHeaders = new Headers();
  //   myHeaders.append("Content-Type", "application/json");
  //   myHeaders.append("Authorization", `Bearer ${token}`);

  //   const response = await fetch(
  //     `https://api.zoom.us/v2/videosdk/sessions/${id}/recordings`,
  //     {
  //       method: "GET",
  //       headers: myHeaders,
  //     }
  //   );

  //   if (!response.ok) {
  //     return null;
  //   }

  //   const data = await response.json();

  //   return {
  //     ...data,
  //     recording_files: data.recording_files.filter(
  //       (item: any) => item.file_type === "MP4"
  //     ),
  //   };
  // } catch (error) {
  //   return [];
  // }
};
