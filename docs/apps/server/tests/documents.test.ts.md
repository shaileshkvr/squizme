# Documentation: @/apps/server/tests/documents.test.ts

### Purpose
Unit test suite verifying document extraction safety checks, 20MB file size ceiling, unsupported mime type rejection, and minimum text extraction limits.

### What happens without it
Oversized files or unsupported formats could trigger server out-of-memory errors or unhandled parser crashes in production.

### Test Scenarios
- `rejects unsupported file formats`: Confirms non-PDF/DOCX files throw "Unsupported file format".
- `rejects files larger than 20MB`: Confirms buffers > 20MB are rejected immediately.
- `rejects corrupted or unparseable PDF document`: Confirms damaged binary streams yield a clean error.
- `rejects document with insufficient text length`: Confirms empty/near-empty files (< 50 chars) are disallowed.

### Dependency graph
- Depends on:
  - `vitest`
  - `@/apps/server/src/modules/documents/service.ts`
- Depended on by:
  - CI test runner and `pnpm test`
