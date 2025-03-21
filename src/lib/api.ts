"use server";
export const getAPIToken = () => {
  return process.env.NEXT_PUBLIC_DUMMY_JWT;
};

export const getListRecording = async () => {
  const response = await fetch("http://localhost:3000/api/list-sessions");
  const data = await response.json();
  return data.data;
};
