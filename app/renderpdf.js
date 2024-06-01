import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
export async function renderPdfPageWithTable(file, setProgress){
  const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;
  const numPages = pdf.numPages;
  let imageData = null;
  let foundTable = false;

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    setProgress({ current: pageNum, total: numPages });
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    await page.render({ canvasContext: context, viewport }).promise;
    const dataUrl = canvas.toDataURL();

    const { data: { text } } = await Tesseract.recognize(canvas, 'eng');
    if (text.includes('Table')) {
      imageData = dataUrl;
      foundTable = true;
      break;
    }
  }

  if (!imageData) {
    throw new Error('No table found in the PDF.');
  }

  return imageData;
};

