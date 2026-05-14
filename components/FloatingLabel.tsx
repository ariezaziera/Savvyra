"use client";

import { useState, useId, forwardRef, InputHTMLAttributes } from "react";

/* ─── Types ──────────────────────────────────────────────────────── */
interface FloatingLabelProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  /** Slot for a right-side element, e.g. a show/hide password toggle */
  rightSlot?: React.ReactNode;
}

/* ─── Component ──────────────────────────────────────────────────── */
const FloatingLabel = forwardRef<HTMLInputElement, FloatingLabelProps>(
  ({ label, error, icon, rightSlot, className, id: externalId, ...props }, ref) => {
    const generatedId = useId();
    const id = externalId ?? generatedId;

    const [focused, setFocused] = useState(false);

    // Label floats when focused OR when there's already a value
    const hasValue = Boolean(props.value ?? props.defaultValue ?? "");
    const floated = focused || hasValue;

    return (
      <div className="fl-root">
        <style>{`
          /* ── Root wrapper ── */
          .fl-root {
            position: relative;
            width: 100%;
          }

          /* ── Input field ── */
          .fl-input {
            width: 100%;
            height: 56px;
            border-radius: 14px;
            border: 1.5px solid rgba(255,255,255,0.12);
            background: rgba(255,255,255,0.06);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            color: #fff;
            font-size: 15px;
            font-weight: 400;
            outline: none;
            box-sizing: border-box;
            transition:
              border-color 0.25s ease,
              background   0.25s ease,
              box-shadow   0.25s ease;

            /* horizontal padding accounts for optional icon / rightSlot */
            padding-top:    18px;  /* room for floated label */
            padding-bottom: 4px;
            padding-left:   var(--fl-pl, 16px);
            padding-right:  var(--fl-pr, 16px);
          }

          .fl-input::placeholder {
            color: transparent; /* hide native placeholder — label does the job */
          }

          /* autofill de-style (Chrome injects a yellow bg) */
          .fl-input:-webkit-autofill,
          .fl-input:-webkit-autofill:focus {
            -webkit-box-shadow: 0 0 0 100px rgba(69,50,132,0.95) inset !important;
            -webkit-text-fill-color: #fff !important;
            caret-color: #fff;
            border-color: rgba(255,255,255,0.25) !important;
          }

          .fl-input:hover {
            border-color: rgba(255,255,255,0.22);
            background: rgba(255,255,255,0.08);
          }

          /* focused state */
          .fl-input:focus {
            border-color: rgba(232,162,160,0.70);
            background: rgba(255,255,255,0.09);
            box-shadow: 0 0 0 3px rgba(232,162,160,0.12);
          }

          /* error state */
          .fl-input.fl-error {
            border-color: rgba(255,100,100,0.60);
            background: rgba(255,80,80,0.06);
          }
          .fl-input.fl-error:focus {
            box-shadow: 0 0 0 3px rgba(255,100,100,0.12);
          }

          /* ── Floating label ── */
          .fl-label {
            position: absolute;
            left: var(--fl-label-left, 16px);
            top: 50%;
            transform: translateY(-50%);
            font-size: 15px;
            color: rgba(255,255,255,0.45);
            pointer-events: none;
            transform-origin: left center;
            transition:
              top        0.22s cubic-bezier(0.4,0,0.2,1),
              font-size  0.22s cubic-bezier(0.4,0,0.2,1),
              color      0.22s ease,
              transform  0.22s cubic-bezier(0.4,0,0.2,1);
            white-space: nowrap;
            line-height: 1;
          }

          /* floated (focused or has value) */
          .fl-label.fl-label--up {
            top: 14px;
            transform: translateY(0) scale(0.78);
            font-size: 15px; /* scale handles the visual size */
            color: rgba(232,162,160,0.85);
          }

          .fl-label.fl-label--error {
            color: rgba(255,100,100,0.80);
          }

          /* ── Left icon slot ── */
          .fl-icon {
            position: absolute;
            left: 14px;
            top: 50%;
            transform: translateY(-50%);
            color: rgba(255,255,255,0.35);
            display: flex;
            align-items: center;
            pointer-events: none;
            transition: color 0.22s ease;
          }
          .fl-root:focus-within .fl-icon {
            color: rgba(232,162,160,0.75);
          }

          /* ── Right slot (e.g. show/hide password) ── */
          .fl-right {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            display: flex;
            align-items: center;
            color: rgba(255,255,255,0.40);
            cursor: pointer;
            transition: color 0.2s ease;
            background: none;
            border: none;
            padding: 4px;
            border-radius: 6px;
          }
          .fl-right:hover { color: rgba(255,255,255,0.75); }

          /* ── Error message ── */
          .fl-error-msg {
            margin-top: 5px;
            padding-left: 4px;
            font-size: 12px;
            color: rgba(255,100,100,0.85);
            display: flex;
            align-items: center;
            gap: 4px;
            animation: fl-shake 0.35s cubic-bezier(0.36,0.07,0.19,0.97) both;
          }

          @keyframes fl-shake {
            10%, 90% { transform: translateX(-1px); }
            20%, 80% { transform: translateX(2px);  }
            30%, 50%, 70% { transform: translateX(-2px); }
            40%, 60% { transform: translateX(2px);  }
          }
        `}</style>

        {/* Left icon */}
        {icon && (
          <span className="fl-icon" aria-hidden="true">
            {icon}
          </span>
        )}

        {/* The actual input */}
        <input
          {...props}
          id={id}
          ref={ref}
          className={[
            "fl-input",
            error ? "fl-error" : "",
            className ?? "",
          ].join(" ").trim()}
          style={{
            // Adjust horizontal padding dynamically based on slots
            "--fl-pl": icon ? "42px" : "16px",
            "--fl-pr": rightSlot ? "44px" : "16px",
            ...props.style,
          } as React.CSSProperties}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          placeholder={label} /* fallback for a11y / autofill hinting */
        />

        {/* Floating label */}
        <label
          htmlFor={id}
          className={[
            "fl-label",
            floated ? "fl-label--up" : "",
            error ? "fl-label--error" : "",
          ].join(" ").trim()}
          style={{
            "--fl-label-left": icon ? "42px" : "16px",
          } as React.CSSProperties}
        >
          {label}
        </label>

        {/* Right slot */}
        {rightSlot && (
          <span className="fl-right">
            {rightSlot}
          </span>
        )}

        {/* Error message */}
        {error && (
          <p className="fl-error-msg" role="alert">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <circle cx="6" cy="6" r="5.5" stroke="currentColor" strokeWidth="1"/>
              <path d="M6 3.5v3M6 8h.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

FloatingLabel.displayName = "FloatingLabel";
export default FloatingLabel;