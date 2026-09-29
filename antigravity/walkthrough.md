# Walkthrough: Verification of UI/UX, Responsive, and Dark Mode Overhaul

This document details verification steps for the changes:

## Test Scenarios

### 1. Dark Mode & Theme Palette
- Toggle between light and dark mode in the profile popup or navbar.
- Ensure all pages (`/`, `/quizzes/new`, `/quizzes/:id/play`, `/attempts/:id`, `/about`, `/privacy`, `/auth`) have high contrast and no illegible text.
- Verify teal/emerald accents are consistent and no lingering indigo/violet elements remain.

### 2. Typography Scaling
- Confirm no text uses `text-xs` for primary body copy or labels.
- Verify readability of question explanations, scope policies, and inputs.

### 3. Navbar & Profile Popup
- Verify "About" and "Privacy Policy" are on the right side.
- Verify "Create Quiz" is hidden on `/` at the top of the page, and only appears when scrolled down or navigating to `/about`, `/privacy`, etc.
- Click the user avatar icon: ensure the profile popup opens with name, email, API key settings, password change, and reddish sign out.
- Click outside the popup or press Escape: ensure popup closes.
- Confirm "Sign Up" button is never shown when logged in.

### 4. Quiz Builder Form
- Verify minimum question count is 5 and slider is centered with clear value indicator.
- Verify "Recommended Scope Policy" is rendered directly below the "Generate Quiz with Gemini" button.
- Verify responsive stacking of form fields on mobile screens.

### 5. Automated Tests & Builds
- Run `pnpm test` (all tests passing).
- Run `pnpm build` (shared, server, and client building cleanly with 0 TypeScript/Vite errors).
- Verify 100% 1:1 documentation coverage in `docs/`.
