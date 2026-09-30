import { twClass } from "../../lib/tw";
import { Camera, Check, RefreshCw, ShieldCheck, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
};

/** Camera-only selfie capture. There is intentionally no file/gallery fallback. */
export default function WorkerSelfieCamera({ open, onClose, onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("");

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const startCamera = async () => {
    setError("");
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Camera access is not supported by this browser.");
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "user" }, width: { ideal: 1280 }, height: { ideal: 1280 } }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to access the camera. Please allow camera permission.");
    }
  };

  useEffect(() => {
    if (!open) {
      stopCamera();
      setPreview("");
      setError("");
      return;
    }
    void startCamera();
    return stopCamera;
  }, [open]);

  const capture = async () => {
    const video = videoRef.current;
    if (!video || video.videoWidth <= 0 || video.videoHeight <= 0) {
      setError("Camera is not ready yet. Please wait a moment.");
      return;
    }
    const max = 1280;
    const scale = Math.min(1, max / Math.max(video.videoWidth, video.videoHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) return setError("Unable to capture selfie.");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.86));
    if (!blob) return setError("Unable to prepare selfie image.");
    const file = new File([blob], `workforce-selfie-${Date.now()}.webp`, { type: "image/webp", lastModified: Date.now() });
    setPreview(URL.createObjectURL(blob));
    stopCamera();
    onCapture(file);
  };

  if (!open) return null;

  return (
    <div className={twClass('fixed inset-0 z-[100] grid place-items-center bg-slate-950/75 p-3 sm:p-6')}>
      <section className={twClass('w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl')}>
        <div className={twClass('flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6')}>
          <div><h2 className={twClass('text-lg font-black text-slate-900')}>Take worker selfie</h2><p className={twClass('text-xs text-slate-500')}>Camera only · Gallery upload is disabled</p></div>
          <button type="button" onClick={onClose} className={twClass('grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600')}><X size={18} /></button>
        </div>
        <div className={twClass('p-4 sm:p-6')}>
          <div className={twClass('relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-950')}>
            {preview ? <img src={preview} alt="Captured worker selfie" className={twClass('h-full w-full object-cover')} /> : <video ref={videoRef} muted playsInline autoPlay className={twClass('h-full w-full object-cover [transform:scaleX(-1)]')} />}
            <div className={twClass('pointer-events-none absolute inset-0 grid place-items-center')}><div className={twClass('h-64 w-52 rounded-[45%] border-2 border-emerald-400/90 shadow-[0_0_0_999px_rgba(2,6,23,0.25)] sm:h-72 sm:w-60')} /></div>
          </div>
          {error && <div className={twClass('mt-3 rounded-xl border border-red-100 bg-red-50 p-3 text-xs font-semibold text-red-700')}>{error}</div>}
          <div className={twClass('mt-4 flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800')}><ShieldCheck size={16} className={twClass('mt-0.5 shrink-0')} /><span>Use a clear, recent photo. Keep your face fully visible and look directly at the camera.</span></div>
          <div className={twClass('mt-4 grid gap-2 sm:grid-cols-2')}>
            {preview ? <><button type="button" onClick={() => { setPreview(""); void startCamera(); }} className={twClass('inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700')}><RefreshCw size={17} /> Retake selfie</button><button type="button" onClick={onClose} className={twClass('inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white')}><Check size={17} /> Use this selfie</button></> : <button type="button" onClick={() => void capture()} className={twClass('sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white')}><Camera size={18} /> Capture Selfie</button>}
          </div>
        </div>
      </section>
    </div>
  );
}
