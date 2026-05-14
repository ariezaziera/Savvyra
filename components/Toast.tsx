// Toast.tsx

type ToastProps = {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
};

export default function Toast({ message, type = "success", onClose }: ToastProps) {
  const isSuccess = type === "success";

  return (
    <div
      className="fixed left-1/2 top-5 z-50 w-[90%] max-w-md -translate-x-1/2"
      style={{
        background: "#1E1248",
        border: `1px solid ${isSuccess ? "rgba(142,227,181,0.25)" : "rgba(232,160,160,0.25)"}`,
        borderRadius: "1.25rem",
        boxShadow: "0 16px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)",
        overflow: "hidden",
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute inset-x-0 top-0 h-0.5"
        style={{
          background: isSuccess
            ? "linear-gradient(90deg, #8EE3B5, #C4B5FD)"
            : "linear-gradient(90deg, #E8A0A0, #C0494A)",
        }}
      />

      {/* Glow */}
      <div
        className="pointer-events-none absolute -left-6 -top-6 h-20 w-20 rounded-full"
        style={{
          background: isSuccess ? "#8EE3B5" : "#E8A0A0",
          filter: "blur(30px)",
          opacity: 0.2,
        }}
      />

      <div className="relative z-10 flex items-start justify-between gap-4 px-5 py-4">
        <div className="flex items-start gap-3">
          {/* Icon dot */}
          <div
            className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
            style={{
              background: isSuccess ? "#8EE3B5" : "#E8A0A0",
              boxShadow: `0 0 8px ${isSuccess ? "#8EE3B5" : "#E8A0A0"}`,
            }}
          />

          <div>
            <p
              className="text-sm font-bold"
              style={{ color: isSuccess ? "#8EE3B5" : "#E8A0A0" }}
            >
              {isSuccess ? "Success" : "Error"}
            </p>

            <p className="mt-0.5 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
              {message}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-full p-1 text-xs transition-all duration-200 hover:scale-110"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}