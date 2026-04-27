type ToastProps = {
  message: string;
  type?: "success" | "error";
  onClose: () => void;
};

export default function Toast({ message, type = "success", onClose }: ToastProps) {
  return (
    <div className="fixed left-1/2 top-5 z-50 w-[90%] max-w-md -translate-x-1/2 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className={`text-sm font-medium ${
              type === "success" ? "text-blue-600" : "text-rose-500"
            }`}
          >
            {type === "success" ? "Success" : "Error"}
          </p>
          <p className="mt-1 text-sm text-gray-600">{message}</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-sm text-gray-400 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
    </div>
  );
}