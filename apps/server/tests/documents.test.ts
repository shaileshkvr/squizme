import { describe, it, expect } from 'vitest';
import { extractDocumentText } from '../src/modules/documents/service.js';

describe('Document Extraction Module', () => {
  it('rejects unsupported file formats', async () => {
    const fakeBuffer = Buffer.from('test content');
    await expect(extractDocumentText(fakeBuffer, 'image/png', 'photo.png'))
      .rejects.toThrow('Unsupported file format');
  });

  it('rejects files larger than 20MB', async () => {
    const oversizedBuffer = Buffer.alloc(21 * 1024 * 1024);
    await expect(extractDocumentText(oversizedBuffer, 'application/pdf', 'huge.pdf'))
      .rejects.toThrow('File exceeds 20MB limit');
  });

  it('rejects corrupted or unparseable PDF document', async () => {
    const invalidPdfBuffer = Buffer.from('not a real pdf binary stream');
    await expect(extractDocumentText(invalidPdfBuffer, 'application/pdf', 'broken.pdf'))
      .rejects.toThrow('Failed to parse PDF document');
  });

  it('rejects document with insufficient text length (less than 50 characters)', async () => {
    const tinyDocxBuffer = Buffer.from('PK\x03\x04empty');
    await expect(extractDocumentText(tinyDocxBuffer, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'tiny.docx'))
      .rejects.toThrow();
  });
});
