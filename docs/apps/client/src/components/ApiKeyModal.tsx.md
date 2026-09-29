# Documentation: @/apps/client/src/components/ApiKeyModal.tsx

### Purpose
Presents the Bring-Your-Own Gemini API Key interface with an interactive 3-step walkthrough, direct link to Google AI Studio, and video tutorial search link.

### What happens without it
Users who run out of their 2 free quizzes have no guidance on how to obtain or save a free Gemini API key.

### Key features
- Direct link to `https://aistudio.google.com/app/apikey`.
- 30-second walkthrough steps explaining how to get a free key without a credit card.
- Secure key saving via `PUT /api/users/api-key`.
- Key removal action via `DELETE /api/users/api-key`.
- Fallback YouTube search link for visual step-by-step guidance.

### Dependency graph
- Depends on:
  - `react`
  - `lucide-react`
  - `@/apps/client/src/context/AuthContext.tsx`
- Depended on by:
  - `@/apps/client/src/App.tsx`
