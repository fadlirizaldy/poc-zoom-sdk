import { getListRecording } from "@/lib/api";
import React from "react";

const RecordingList = async () => {
  const data = await getListRecording();

  return (
    <div className="p-5">
      <h2 className="font-bold text-2xl">Recording List</h2>

      <div>
        <table className="table-auto border border-slate-500">
          <thead className="border border-slate-500">
            <tr>
              <th>Id</th>
              <th>Name</th>
              <th>Recording 1</th>
              <th>Recording 2</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((item: any) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                {item?.recordings.map((x: any, idx: number) => (
                  <td key={idx}>
                    <a href={x.downloadUrl} target="_blank">
                      Download
                    </a>
                    {`(${Math.floor(x.size / 1000)} KB)`}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecordingList;
