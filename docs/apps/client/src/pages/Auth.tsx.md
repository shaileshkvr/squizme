# Documentation: @/apps/client/src/pages/Auth.tsx

### Purpose
Provides authentication pages for user sign-in, new account registration, and a forgot password recovery flow with an animated 6-digit chained OTP input and visual field validation feedback.

### What happens without it
Users cannot authenticate, register new accounts, initiate password recovery, or switch directly into registration/login from external CTAs.

### Key Features
- **URL Mode Syncing**: Reads `?mode=register`, `?mode=login`, and `?mode=forgot` query parameters. Directs users immediately to the requested view upon navigating from landing/navbar CTAs.
- **Dynamic Field Feedback (Green/Red)**: Input borders turn green (`border-brand-success`) with a check badge when criteria are satisfied, and red (`border-brand-error`) with an alert icon when invalid once touched.
- **Responsive Split Name Registration**: Provides responsive 2-column input grid for required `First Name` and optional `Last Name` with granular validation feedback.
- **Contextual `text-sm` Warnings**: Explains why input is invalid directly below each field (e.g. invalid email format, required first name, specific password complexity requirement, or invalid credentials on failed login).
- **Clean Password Ergonomics**: Avoids upfront "min 8 chars" clutter on the label; validates dynamically enforcing at least 8 characters, at least one letter, at least one number, and at least one special character (no uppercase/lowercase mandate).
- **Forgot Password Flow**: Allows users to enter their registered email address to request a 6-digit recovery code.
- **Animated 6-Digit Chained OTP Input**: Displays 6 segmented, softly rounded character blocks with active cursor pulses and hyphen separation. Disabled in development preview with an explicit banner explaining the pending email service transport integration.
- **Signed-in Protection**: Automatically redirects authenticated users to `/`.
- **Coffee & Walnut Palette**: Styled using the semantic brand tokens with rounded aesthetic and tactile button transitions.

### Dependency graph
- Depends on:
  - `react`
  - `react-router-dom`
  - `lucide-react`
  - `@/packages/shared/src/schemas/user.ts`
  - `@/apps/client/src/context/AuthContext.tsx`
- Depended on by:
  - `@/apps/client/src/App.tsx`
