import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { ArrowLeft, Info, KeyRound } from "lucide-react";

interface ForgotPasswordFormProps {
  onSwitchMode: (mode: "login") => void;
  onCancel?: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSwitchMode,
  onCancel,
}) => {
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-border">
      <CardHeader className="space-y-1">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="w-fit -ml-2 mb-1 text-xs gap-1 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Button>
        )}
        <CardTitle className="text-xl font-semibold tracking-tight">Reset password</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Enter your username or email address and the 6-digit verification code
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        <div className="space-y-1.5">
          <Label htmlFor="forgot-identifier" className="text-xs font-medium">
            Username or Email
          </Label>
          <Input
            id="forgot-identifier"
            type="text"
            placeholder="e.g. johndoe or john@example.com"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="text-sm"
          />
        </div>

        {/* 3+3 Squares for OTP */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">Verification Code (OTP)</Label>
            <span className="text-[10px] text-muted-foreground">3 + 3 Digits</span>
          </div>

          <div className="flex justify-center py-2">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => setOtp(value)}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>

        {/* Informational notice */}
        <div className="rounded-md border border-border bg-muted/40 p-3 flex items-start gap-2.5 text-xs text-muted-foreground">
          <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-medium text-foreground">Email OTP Service Coming Soon</p>
            <p className="text-[11px] leading-relaxed">
              You can test entering digits in the 3+3 squares above. The submission action is intentionally disabled until the email delivery service is attached.
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pt-2">
        {/* Submit button intentionally disabled as specified */}
        <Button
          type="button"
          disabled={true}
          className="w-full gap-2 cursor-not-allowed"
        >
          <KeyRound className="h-4 w-4" /> Verify Code & Reset (Service Coming Soon)
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Remember your password?{" "}
          <button
            type="button"
            onClick={() => onSwitchMode("login")}
            className="font-medium text-foreground underline-offset-4 hover:underline cursor-pointer"
          >
            Back to login
          </button>
        </p>
      </CardFooter>
    </Card>
  );
};
