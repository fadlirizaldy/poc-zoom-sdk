"use client";
import { getRecordingListClient } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const ListRecording = () => {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getRecordingListClient()
      .then((data) => setData(data))
      .finally(() => {
        setLoading(false);
      });
  }, []);

  console.log("DATAA", data);

  return (
    <div className="mt-5">
      <h2 className="font-semibold text-2xl">Recordings</h2>
      {loading ? (
        <p>Loading..</p>
      ) : (
        <table className="table-auto border border-slate-500">
          <thead className="border border-slate-500">
            <tr>
              <th className="border border-slate-500 px-2">No</th>
              <th className="border border-slate-500 px-2">Id</th>
              <th className="border border-slate-500 px-2">Session Name</th>
              <th className="border border-slate-500 px-2">Detail</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((item: any, idx) => (
              <tr key={item.id}>
                <td className="border border-slate-500 p-2">{idx + 1}</td>
                <td className="border border-slate-500 p-2">{item.id}</td>
                <td className="border border-slate-500 p-2">{item.name}</td>
                <td className="p-2">
                  <button
                    className="border border-slate-300 rounded-md p-2"
                    onClick={() => router.push(`/detail?id=${item.id}`)}
                  >
                    Detail
                  </button>
                </td>
                {/* {item?.recordings.map((x: any) => (
                <td>
                  <a href={x.downloadUrl} target="_blank">
                    Download
                  </a>
                  {`(${Math.floor(x.size / 1000)} KB)`}
                </td>
              ))} */}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ListRecording;
