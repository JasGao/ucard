"use client";

import { useEffect } from "react";
import SMSVerification from "./sms-verification";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationSuccess?: (phoneNumber: string) => void;
}

export default function VerificationModal({
  isOpen,
  onClose,
  onVerificationSuccess,
}: VerificationModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" />

      {/* Modal Content */}
      <div
        className="relative z-10 w-full max-w-lg animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-800 overflow-hidden">
          {/* Header */}
          <div className="relative p-6 md:p-8 border-b border-zinc-800">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white/60 hover:text-white transition-colors rounded-lg hover:bg-zinc-800"
              aria-label="Close"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="pr-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Join Our Whitelist 🎯
              </h2>
              <p className="text-white/80 leading-relaxed">
                You will need to verify your code to join our whitelist to unlock
                more features in the future. Come join first and be among the
                first to experience the future of UCard!
              </p>
            </div>
          </div>

          {/* SMS Verification Component */}
          <div className="p-6 md:p-8">
            <SMSVerification
              onVerificationSuccess={(phoneNumber) => {
                onVerificationSuccess?.(phoneNumber);
                // Optionally close modal after successful verification
                // onClose();
              }}
              onVerificationError={(error) => {
                console.error("Verification error:", error);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
