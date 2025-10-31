/**
 * Extract text from a PDF file using pdf.js
 * Handles both text-based and scanned PDFs
 */

// These are moved here so only initial setup takes place
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// The imported value is now the required string URL:
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

import * as Tesseract from 'tesseract.js';

export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';

    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');

      fullText += pageText + '\n\n';
    }

    // If no text was extracted, it might be a scanned PDF
    if (fullText.trim().length < 50) {
      return await extractTextFromPDFWithOCR(file);
    }

    return fullText.trim();
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

/**
 * Extract text from scanned PDF using OCR
 * Falls back to this when regular text extraction yields minimal results
 */
const extractTextFromPDFWithOCR = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';

    // Convert each page to image and run OCR
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });

      // Create canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Render page to canvas
      await page.render({ canvasContext: context, viewport }).promise;

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });

      // Run OCR on the image
      const pageText = await extractTextFromImage(new File([blob], 'page.png'));
      fullText += pageText + '\n\n';
    }

    return fullText.trim();
  } catch (error) {
    console.error('PDF OCR extraction error:', error);
    throw new Error('Failed to extract text from scanned PDF');
  }
};

/**
 * Extract text from an image using Tesseract.js OCR
 */
export const extractTextFromImage = async (file: File): Promise<string> => {
  try {
    const worker = await Tesseract.createWorker('eng');

    const result = await worker.recognize(file);
    const text = result.data.text;

    await worker.terminate();

    return text.trim();
  } catch (error) {
    console.error('OCR extraction error:', error);
    throw new Error('Failed to extract text from image');
  }
};

/**
 * Extract text from a DOCX file using mammoth
 */
export const extractTextFromDOCX = async (file: File): Promise<string> => {
  try {
    // Dynamically import mammoth
    const mammoth = await import('mammoth');

    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });

    return result.value.trim();
  } catch (error) {
    console.error('DOCX extraction error:', error);
    throw new Error('Failed to extract text from DOCX file');
  }
};

/**
 * Extract text from a plain text file
 */
export const extractTextFromTXT = async (file: File): Promise<string> => {
  try {
    const text = await file.text();
    return text.trim();
  } catch (error) {
    console.error('TXT extraction error:', error);
    throw new Error('Failed to read text file');
  }
};

/**
 * Main extraction function that routes to appropriate extractor
 */
export const extractTextFromFile = async (file: File): Promise<string> => {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  try {
    // PDF files
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return await extractTextFromPDF(file);
    }

    // DOCX files
    if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.endsWith('.docx')
    ) {
      return await extractTextFromDOCX(file);
    }

    // Plain text files
    if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      return await extractTextFromTXT(file);
    }

    // Image files (OCR)
    if (fileType.startsWith('image/') ||
      /\.(jpg|jpeg|png|gif|bmp|tiff|webp)$/i.test(fileName)) {
      return await extractTextFromImage(file);
    }

    throw new Error(`Unsupported file type: ${fileType || 'unknown'}`);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to extract text from file');
  }
};

/**
 * Validate if a file type is supported
 */
export const isSupportedFileType = (file: File): boolean => {
  const supportedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/tiff',
    'image/webp'
  ];

  const supportedExtensions = [
    '.pdf', '.docx', '.txt',
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'
  ];

  const fileName = file.name.toLowerCase();

  return supportedTypes.includes(file.type.toLowerCase()) ||
    supportedExtensions.some(ext => fileName.endsWith(ext));
};

/**
 * Get a user-friendly file type name
 */
export const getFileTypeName = (file: File): string => {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  if (type === 'application/pdf' || name.endsWith('.pdf')) return 'PDF Document';
  if (type.includes('wordprocessingml') || name.endsWith('.docx')) return 'Word Document';
  if (type === 'text/plain' || name.endsWith('.txt')) return 'Text File';
  if (type.startsWith('image/')) return 'Image File';

  return 'Document';
};