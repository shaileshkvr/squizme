import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export async function extractDocumentText(buffer: Buffer, mimeType: string, filename: string): Promise<string> {
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error('File exceeds 20MB limit. Please upload a smaller document.');
  }

  const isPdf = mimeType === 'application/pdf' || filename.toLowerCase().endsWith('.pdf');
  const isDocx = mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                filename.toLowerCase().endsWith('.docx');

  if (!isPdf && !isDocx) {
    throw new Error('Unsupported file format. Only PDF and DOCX files are supported.');
  }

  let rawText = '';
  if (isPdf) {
    try {
      const data = await (pdfParse as any)(buffer);
      rawText = data.text;
    } catch (err: any) {
      if (err.message && err.message.includes('corrupted')) {
        throw err;
      }
      throw new Error('Failed to parse PDF document. Ensure the file is not corrupted or password protected.');
    }
  } else if (isDocx) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      rawText = result.value;
    } catch {
      throw new Error('Failed to parse DOCX document. Ensure the file is a valid Word document.');
    }
  }

  const cleanedText = rawText.replace(/\s+/g, ' ').trim();
  if (cleanedText.length < 50) {
    throw new Error('The document does not contain enough extractable text to generate a quiz.');
  }

  return cleanedText;
}
