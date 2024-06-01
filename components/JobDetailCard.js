import React, { useState, useContext } from 'react';
import { format } from 'date-fns';
import { downloadExcel } from '@/lib/helper';
import { BiRefresh } from "react-icons/bi"
import { FaTrashAlt } from 'react-icons/fa';
export default function JobDetailCard({ public_id, state, created_at, providers }){
  const [status, setStatus] = useState(state);
  const [loading, setLoading] = useState(false);

  const onDelete = (public_id) => {
    const card = document.getElementById(public_id);
    if (card) {
	card.remove();
    }
  };

  const updateStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ocr-table/detail?id=${public_id}`);
      const data = await response.json();
      setStatus(data.status);
    } catch (error) {
      console.error('Error fetching status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    onDelete(public_id);
  };
  const handleFileDownload = async(provider) => {
      const jobDetail = await fetch(`/api/ocr-table/detail?id=${public_id}`)
          .then(res => res.json())
          .catch(err => console.log(err))
        
      downloadExcel(jobDetail, provider)
    }


  return (
    <div id={public_id} className="relative p-4 pr-11 shadow-md rounded-md border border-black/30 text-sm">
      <button
        className="absolute right-2 top-2 border border-gray-800 text-gray-800 font-semibold p-2 rounded-md hover:bg-gray-800 hover:text-white transition-colors"
        onClick={updateStatus}
        disabled={loading}
      >
        <BiRefresh size={20} />
      </button>
      <button
        className="absolute right-2 bottom-2 border border-red-600 text-red-600 font-semibold p-2 rounded-md hover:bg-red-600 hover:text-white transition-colors"
        onClick={handleDelete}
	disabled={loading}
      >
        <FaTrashAlt size={20} />
      </button>
      {!loading ? (
        <>
          <p className="font-medium">ID: {public_id}</p>
          <p className="font-medium">
            Created at: {created_at ? format(new Date(created_at), 'dd-MMM-yyyy HH:mm:SS') : 'Invalid Date'}
          </p>
          <p className="mt-2">Status: {status}</p>
          {status === 'finished' && (
            <div className="flex flex-col gap-2">
              <p className="font-semibold">Download results</p>
              <hr/>
              <div className="flex flex-wrap gap-2">
                {providers.split(',').map((provider) => (
                  <button
                    key={provider}
                    className="py-2 px-4 bg-gray-800 text-white font-semibold rounded-md"
                    onClick={() => handleFileDownload(provider)}
                  >
                    download
                  </button>
                ))}
              </div>
	      
            </div>
          )}
        </>
      ) : (
        <p className="text-lg font-medium">Loading...</p>
      )}
    </div>
  )
}

