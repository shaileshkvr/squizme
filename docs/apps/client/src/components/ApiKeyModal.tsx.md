# Documentation: @/apps/client/src/components/ApiKeyModal.tsx

### Purpose
Presents the Bring-Your-Own Gemini API Key interface with an interactive 3-step walkthrough, local device AES-GCM encryption, direct link to Google AI Studio, video tutorial link, and model privacy disclosures.

### What happens without it
Users who run out of their 2 free quizzes have no guidance on how to obtain or save a free Gemini API key on their local device.

### Key features
- Direct link to `https://aistudio.google.com/app/apikey`.
- 30-second walkthrough steps explaining how to get a free key without a credit card.
- Client-side AES-GCM local device encryption via `@/apps/client/src/utils/crypto.ts`.
- Clear privacy notice emphasizing that keys are not stored on servers, queries are not collected by Squizme, and Google's model operates under independent terms.
- Local key removal action.
- Fallback YouTube search link for visual step-by-step guidance.

### Dependency graph
- Depends on:
  - `react`
  - `lucide-react`
  - `@/apps/client/src/context/AuthContext.tsx`
  - `@/apps/client/src/utils/crypto.ts`
- Depended on by:
  - `@/apps/client/src/App.tsx`
