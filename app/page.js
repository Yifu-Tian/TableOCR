"use client"
import ListData from "@/components/ListData"
import React, { useState, useRef, useContext } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { renderPdfPageWithTable } from './renderpdf';
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';

export default function Home() {
  const [uploading, setUploading] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [isRendering, setIsRendering] = useState(false);
  const canvasRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [progress, setProgress] = useState({ current: 0, total: 0});


  const handleChange = async (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    if (file && file.type === 'application/pdf') {
      setIsRendering(true);
      try {
        const images = await renderPdfPageWithTable(file, setProgress); // 调用渲染PDF图像的函数
        setImageSrc(images);
      } catch (error) {
        console.error('Error processing PDF:', error);
      } finally {
	setIsRendering(false);
      }
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = document.getElementById('test-form');
    const formData = new FormData(form);

    setUploading(true);

    await fetch('/api/ocr-table', {
      method: 'POST',
      body: formData
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Server responded with an error: ' + res.status);
        }
        return res.json();
      })
      .then((data) => console.log('result', data))
      .catch((err) => console.log(err))
      .finally(() => setUploading(false));
  };
  return (
    
    <main className="container py-8 px-6 flex flex-col min-h-screen items-center justify-center gap-4">
      <div className="flex flex-col w-full max-w-lg items-end gap-4">
        <div className="w-full p-6 shadow-md rounded-md border border-black/30">
          <h1 className="text-xl font-bold mb-4">Convert PDF/Image to Excel Document</h1>
          <form id="test-form" onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            <input type="file" name="file" accept="application/pdf,image/png,image/jpeg" formEncType="multipart/form-data" required onChange={handleChange}/>
            <button type="submit" className="w-full bg-gray-800 text-white font-semibold px-6 py-3 rounded-md disabled:bg-gray-500 hover:bg-gray-700 transition-colors" disabled={uploading}>
              Submit File
            </button>
          </form>
          {uploading && <p className="mt-4">Uploading...</p>}
          {isRendering && <p className="mt-4">Detecting tables in PDF...Page {progress.current}/{progress.total}</p>}
        </div>
        {imageSrc && (
          <div>
            <p>PDF Page Preview</p>
            {imageSrc.map((src, index) => (
              <div key={index}>
                <img src={src} alt={`PDF Page Preview ${index + 1}`} className="w-full h-auto" />
              </div>
            ))}
          </div>
        )}
      </div>
      <ListData />
    </main>
  
  );
}
