"use client";

import { useState } from "react";

interface SMSVerificationProps {
  onVerificationSuccess?: (phoneNumber: string) => void;
  onVerificationError?: (error: string) => void;
}

export default function SMSVerification({
  onVerificationSuccess,
  onVerificationError,
}: SMSVerificationProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState("");

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "");
    // Format as (XXX) XXX-XXXX
    if (digits.length <= 3) return digits;
    if (digits.length <= 6)
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    if (formatted.replace(/\D/g, "").length <= 10) {
      setPhoneNumber(formatted);
      setError("");
    }
  };

  const handleSendCode = async () => {
    const digits = phoneNumber.replace(/\D/g, "");
    if (digits.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // TODO: Replace with your actual SMS API call
      // await sendVerificationCode(phoneNumber);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setCodeSent(true);
      setCountdown(60);
      
      // Start countdown timer
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError("Failed to send verification code. Please try again.");
      onVerificationError?.("Failed to send code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      setError("Please enter the 6-digit verification code");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // TODO: Replace with your actual verification API call
      // const isValid = await verifyCode(phoneNumber, verificationCode);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Simulate successful verification
      const isValid = verificationCode === "123456"; // For demo purposes
      
      if (isValid) {
        onVerificationSuccess?.(phoneNumber);
      } else {
        setError("Invalid verification code. Please try again.");
        onVerificationError?.("Invalid code");
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
      onVerificationError?.("Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = () => {
    if (countdown > 0) return;
    setCodeSent(false);
    setVerificationCode("");
    handleSendCode();
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-zinc-900/95 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-2xl border border-zinc-800">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Verify Your Phone
        </h2>
        <p className="text-white/70 mb-8">
          We'll send you a verification code via SMS
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {!codeSent ? (
          <div className="space-y-6">
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-white/80 mb-2"
              >
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="(555) 123-4567"
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={isLoading}
              />
            </div>

            <button
              onClick={handleSendCode}
              disabled={isLoading || phoneNumber.replace(/\D/g, "").length !== 10}
              className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Sending...
                </span>
              ) : (
                "Send Verification Code"
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label
                htmlFor="code"
                className="block text-sm font-medium text-white/80 mb-2"
              >
                Verification Code
              </label>
              <input
                id="code"
                type="text"
                value={verificationCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setVerificationCode(value);
                  setError("");
                }}
                placeholder="123456"
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-2xl tracking-widest font-mono"
                disabled={isLoading}
                maxLength={6}
              />
              <p className="text-xs text-white/50 mt-2 text-center">
                Enter the 6-digit code sent to {phoneNumber}
              </p>
            </div>

            <button
              onClick={handleVerifyCode}
              disabled={isLoading || verificationCode.length !== 6}
              className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Verifying...
                </span>
              ) : (
                "Verify Code"
              )}
            </button>

            <div className="text-center">
              <button
                onClick={handleResendCode}
                disabled={countdown > 0 || isLoading}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {countdown > 0
                  ? `Resend code in ${countdown}s`
                  : "Resend verification code"}
              </button>
            </div>

            <button
              onClick={() => {
                setCodeSent(false);
                setVerificationCode("");
                setError("");
              }}
              className="w-full text-sm text-white/60 hover:text-white/80 transition-colors"
            >
              Change phone number
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
