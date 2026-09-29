# Documentation: @/apps/server/src/modules/documents/service.ts

### Purpose
Extracts and sanitizes text content from uploaded PDF and DOCX documents with size and safety guards.

### What happens without it
The server cannot ingest lecture notes, textbooks, or documents to construct quizzes.

### Functions
- `extractDocumentText(buffer: Buffer, mimeType: string, filename: string): Promise<string>`:
  - Enforces a 20MB maximum file size limit.
  - Validates MIME type and file extension (PDF or DOCX).
  - Parses PDF documents using `pdf-parse` or DOCX documents using `mammoth`.
  - Normalizes multiple spaces/newlines and validates a minimum text length of 50 characters.

### Dependency graph
- Depends on:
  - `pdf-parse`
  - `mammoth`
- Depended on by:
  - `@/apps/server/src/modules/generator/routes.ts`
