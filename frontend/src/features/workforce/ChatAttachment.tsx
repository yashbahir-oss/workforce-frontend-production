import { twClass } from "../../lib/tw";
import { useEffect, useState } from "react";
import { fileUrl } from "../../lib/api";
import { useAuthStore } from "../auth/auth.store";

type Props = { url: string; name?: string; contentType?: string };

/** Loads protected chat files with the current access token instead of exposing the token in the URL. */
export default function ChatAttachment({ url, name, contentType }: Props) {
  const { token } = useAuthStore();
  const [src, setSrc] = useState("");

  useEffect(() => {
    let objectUrl = "";
    let cancelled = false;
    if (!token || !url) return () => undefined;
    fetch(fileUrl(url), { headers: { Authorization: `Bearer ${token}` }, credentials: "include" })
      .then((response) => { if (!response.ok) throw new Error("Unable to load attachment"); return response.blob(); })
      .then((blob) => { if (!cancelled) { objectUrl = URL.createObjectURL(blob); setSrc(objectUrl); } })
      .catch(() => setSrc(""));
    return () => { cancelled = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [token, url]);

  if (!src) return <span className={twClass('text-[9px] text-slate-400')}>Loading attachment…</span>;
  if ((contentType || "").startsWith("image/")) return <a href={src} target="_blank" rel="noreferrer" className={twClass('block overflow-hidden rounded-lg')}><img src={src} alt={name || "Attachment"} className={twClass('max-h-56 max-w-full object-contain')}/></a>;
  return <a href={src} download={name || "attachment"} className={twClass('font-bold text-emerald-700')}>{name}</a>;
}
