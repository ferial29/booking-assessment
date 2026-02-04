import { useEffect } from "react";

type ToastProps = {
  open: boolean;
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  onClose: () => void;
};

export default function Toast({
  open,
  message,
  type = "info",
  duration = 2500,
  onClose,
}: ToastProps) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => onClose(), duration);
    return () => clearTimeout(t);
  }, [open, duration, onClose]);

  if (!open) return null;

  const base =
    "fixed left-1/2 -translate-x-1/2 bottom-6 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm w-[92%] max-w-md";
  const styles =
    type === "success"
      ? "bg-green-50 border-green-200 text-green-800"
      : type === "error"
      ? "bg-red-50 border-red-200 text-red-800"
      : "bg-blue-50 border-blue-200 text-blue-800";

  return (
    <div className={`${base} ${styles}`} role="status" aria-live="polite">
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium">{message}</span>
        <button
          onClick={onClose}
          className="px-3 py-1 rounded-lg border bg-white/60 hover:bg-white"
          type="button"
        >
          OK
        </button>
      </div>
    </div>
  );
}
