// hooks/useWebAuthn.ts
"use client";

import { useState } from "react";

export type WebAuthnStatus = "idle" | "loading" | "success" | "error" | "unsupported";

export function useWebAuthn() {
  const [status, setStatus] = useState<WebAuthnStatus>("idle");
  const [error, setError]   = useState<string>("");

  const isSupported = typeof window !== "undefined" && !!window.PublicKeyCredential;

  // ── REGISTER biometric for current logged-in user ──
  const register = async (deviceName?: string): Promise<boolean> => {
    if (!isSupported) {
      setStatus("unsupported");
      setError("Your device or browser doesn't support biometric authentication.");
      return false;
    }

    setStatus("loading");
    setError("");

    try {
      // 1. Get registration options from server
      const optRes = await fetch("/api/auth/webauthn/register");
      if (!optRes.ok) throw new Error("Failed to get registration options");
      const options = await optRes.json();

      // 2. Decode challenge + userId for WebAuthn API
      const publicKeyOptions: PublicKeyCredentialCreationOptions = {
        ...options,
        challenge: base64urlToBuffer(options.challenge),
        user: {
          ...options.user,
          id: base64urlToBuffer(options.user.id),
        },
      };

      // 3. Trigger browser biometric prompt
      const credential = await navigator.credentials.create({
        publicKey: publicKeyOptions,
      }) as PublicKeyCredential;

      if (!credential) throw new Error("No credential returned");

      const response = credential.response as AuthenticatorAttestationResponse;

      // 4. Send to server to save
      const saveRes = await fetch("/api/auth/webauthn/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credentialId:      bufferToBase64url(credential.rawId),
          publicKey:         bufferToBase64url(response.getPublicKey()!),
          deviceName:        deviceName ?? getDeviceName(),
          challenge:         options.challenge,
          attestationObject: bufferToBase64url(response.attestationObject),
          clientDataJSON:    bufferToBase64url(response.clientDataJSON),
        }),
      });

      if (!saveRes.ok) {
        const err = await saveRes.json();
        throw new Error(err.error ?? "Failed to save credential");
      }

      setStatus("success");
      return true;
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        setError("Biometric verification was cancelled or timed out.");
      } else if (err.name === "InvalidStateError") {
        setError("This device is already registered.");
      } else {
        setError(err.message ?? "Biometric registration failed.");
      }
      setStatus("error");
      return false;
    }
  };

  // ── AUTHENTICATE with biometric on login page ──
  const authenticate = async (email?: string): Promise<boolean> => {
    if (!isSupported) {
      setStatus("unsupported");
      setError("Your device or browser doesn't support biometric authentication.");
      return false;
    }

    setStatus("loading");
    setError("");

    try {
      // 1. Get auth options
      const optRes = await fetch(`/api/auth/webauthn/authenticate${email ? `?email=${encodeURIComponent(email)}` : ""}`);
      if (!optRes.ok) throw new Error("Failed to get authentication options");
      const options = await optRes.json();

      // 2. Build PublicKeyCredentialRequestOptions
      const requestOptions: PublicKeyCredentialRequestOptions = {
        challenge:        base64urlToBuffer(options.challenge),
        rpId:             options.rpId,
        userVerification: options.userVerification as UserVerificationRequirement,
        timeout:          options.timeout,
        allowCredentials: options.allowCredentials?.map((c: any) => ({
          type: "public-key" as const,
          id:   base64urlToBuffer(c.id),
        })) ?? [],
      };

      // 3. Trigger biometric prompt
      const assertion = await navigator.credentials.get({
        publicKey: requestOptions,
      }) as PublicKeyCredential;

      if (!assertion) throw new Error("Authentication cancelled");

      const assertionResponse = assertion.response as AuthenticatorAssertionResponse;

      // 4. Send to server to verify + get session
      const verifyRes = await fetch("/api/auth/webauthn/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credentialId:      bufferToBase64url(assertion.rawId),
          challenge:         options.challenge,
          userHandle:        assertionResponse.userHandle
            ? bufferToBase64url(assertionResponse.userHandle)
            : null,
          authenticatorData: bufferToBase64url(assertionResponse.authenticatorData),
          clientDataJSON:    bufferToBase64url(assertionResponse.clientDataJSON),
          signature:         bufferToBase64url(assertionResponse.signature),
        }),
      });

      if (!verifyRes.ok) {
        const err = await verifyRes.json();
        throw new Error(err.error ?? "Authentication failed");
      }

      setStatus("success");
      return true;
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        setError("Biometric verification was cancelled.");
      } else {
        setError(err.message ?? "Biometric authentication failed.");
      }
      setStatus("error");
      return false;
    }
  };

  // ── REMOVE a registered credential ──
  const remove = async (credentialId: string): Promise<boolean> => {
    setStatus("loading");
    try {
      const res = await fetch("/api/auth/webauthn/register", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credentialId }),
      });
      if (!res.ok) throw new Error("Failed to remove credential");
      setStatus("idle");
      return true;
    } catch (err: any) {
      setError(err.message);
      setStatus("error");
      return false;
    }
  };

  const reset = () => { setStatus("idle"); setError(""); };

  return { register, authenticate, remove, status, error, isSupported, reset };
}

// ── Helpers ──
function base64urlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const binary  = atob(base64);
  const buffer  = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) buffer[i] = binary.charCodeAt(i);
  return buffer.buffer;
}

function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes  = new Uint8Array(buffer);
  let binary   = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function getDeviceName(): string {
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua))  return "iPhone";
  if (/iPad/.test(ua))    return "iPad";
  if (/Mac/.test(ua))     return "Mac";
  if (/Android/.test(ua)) return "Android Device";
  if (/Windows/.test(ua)) return "Windows PC";
  return "My Device";
}