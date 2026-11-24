"use client";

import { useEffect, useState, type FormEvent } from "react";
import styles from "./join.module.css";

const examplePhone = "+1 202 555 0147";

export default function JoinDemo() {
  const [step, setStep] = useState<"phone" | "code" | "verified" | "joined">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [entry, setEntry] = useState("");
  const [error, setError] = useState("");
  const number = phone.replace(/[\s().-]/g, "");
  const membershipKey = "fernloop.demo.whitelist." + number;

  const [resendAt, setResendAt] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (step !== "code") return;
    const timer = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((resendAt - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) window.clearInterval(timer);
    }, 250);
    return () => window.clearInterval(timer);
  }, [resendAt, step]);

  function requestCode() {
    if (step === "code" && Date.now() < resendAt) return;
    setResendAt(Date.now() + 30_000);
    setSecondsLeft(30);
    const random = crypto.getRandomValues(new Uint32Array(1))[0];
    // A replacement always differs from the last issued code.
    const next = (Number(code) + 1 + random % 999999) % 1000000;
    const issuedCode = String(next).padStart(6, "0");
    setCode(issuedCode);
    // Local delivery for the SMS-free walkthrough. Only log the generated value.
    console.info("Fernloop local verification code:", issuedCode);
    setEntry("");
    setError("");
    setStep("code");
  }

  function submitPhone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^\+[1-9]\d{6,14}$/.test(number)) {
      setError("Enter a phone number with its country code, starting with +.");
      return;
    }
    requestCode();
  }

  function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (entry !== code) {
      setError("That code doesn’t match. Enter the latest six-digit code.");
      return;
    }
    setCode("");
    setEntry("");
    setError("");
    try {
      if (sessionStorage.getItem(membershipKey) === "joined") {
        setStep("joined");
        return;
      }
    } catch {
      // The demo still works in memory when browser storage is unavailable.
    }
    setStep("verified");
  }

  function joinWhitelist() {
    try {
      sessionStorage.setItem(membershipKey, "joined");
    } catch {
      // Keep the confirmation available for this visit.
    }
    setStep("joined");
  }

  function changeNumber() {
    setCode("");
    setEntry("");
    setError("");
    setStep("phone");
  }

  if (step === "joined") {
    return (
      <>
        <h1 tabIndex={-1} autoFocus>You’re on the whitelist.</h1>
        <p>The number ending in <strong>{number.slice(-4)}</strong> has been added to Fernloop’s whitelist.</p>
        <a className="button solid" href="/">Back to the club</a>
      </>
    );
  }

  if (step === "verified") {
    return (
      <>
        <h1 tabIndex={-1} autoFocus>Phone verified.</h1>
        <p>Join Fernloop’s whitelist with the number ending in <strong>{number.slice(-4)}</strong>.</p>
        <button type="button" className="button solid" onClick={joinWhitelist}>Join the whitelist</button>
        <button type="button" className={styles.resend} onClick={changeNumber}>Use another number</button>
      </>
    );
  }

  if (step === "code") {
    return (
      <>
        <h1>Confirm your code.</h1>
        <form onSubmit={verify}>
          <label htmlFor="verification-code">Verification code</label>
          <input id="verification-code" type="password" inputMode="numeric" autoComplete="off"
            required maxLength={6} pattern="[0-9]{6}" value={entry} placeholder="6 digits"
            aria-invalid={Boolean(error)} aria-describedby={error ? "code-error" : undefined}
            onChange={(event) => { setEntry(event.target.value.replace(/\D/g, "")); setError(""); }} />
          {error && <p id="code-error" role="alert">{error}</p>}
          <button type="submit" className="button solid" disabled={entry.length !== 6}>Verify phone number</button>
        </form>
        <div className={styles.options}>
          <button type="button" className={styles.resend} disabled={secondsLeft > 0} onClick={requestCode}>
            {secondsLeft > 0 ? `Resend in ${secondsLeft}s` : "Resend code"}
          </button>
          <button type="button" className={styles.resend} onClick={changeNumber}>Change number</button>
        </div>
      </>
    );
  }

  return (
    <>
      <h1>Verify your phone.</h1>
      <p>Enter your phone number to get started on the Fernloop whitelist.</p>
      <form onSubmit={submitPhone}>
        <label htmlFor="phone">Phone number with country code</label>
        <input id="phone" type="tel" autoComplete="off" required placeholder={examplePhone}
          value={phone} aria-invalid={Boolean(error)} aria-describedby={error ? "phone-error" : undefined}
          onChange={(event) => { setPhone(event.target.value); setError(""); }} />
        {error && <p id="phone-error" role="alert">{error}</p>}
        <button type="submit" className="button solid">Continue</button>
      </form>
    </>
  );
}
