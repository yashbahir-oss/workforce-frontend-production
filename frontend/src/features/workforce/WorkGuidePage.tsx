import { twClass } from "../../lib/tw";
import {
  Bot,
  CalendarCheck2,
  MessageCircle,
  Search,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useTranslation } from "../../../node_modules/react-i18next";
import { useAuthStore } from "../auth/auth.store";
import { aiApi, type PublicWorker } from "../../lib/api";
import WorkGuideResults from "./WorkGuideResults";

type GuideMessage = { from: "ai" | "user"; text: string };

export default function WorkGuidePage() {
  const { t } = useTranslation();
  const { token } = useAuthStore();
  const [params] = useSearchParams();
  const worker = params.get("worker");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<GuideMessage[]>([
    { from: "ai", text: t("customer.workguide.welcome") },
  ]);
  const [workers, setWorkers] = useState<PublicWorker[]>([]);

  const send = async () => {
    const q = input.trim();
    if (!q || busy) return;
    setMessages((current) => [...current, { from: "user", text: q }]);
    setInput("");
    setBusy(true);
    try {
      if (!token) throw new Error("Login required");
      const result = await aiApi.ask(token, q, { role: "customer" });
      setMessages((current) => [
        ...current,
        { from: "ai", text: result.answer },
      ]);
      setWorkers(result.workers || []);
    } catch {
      setMessages((current) => [
        ...current,
        { from: "ai", text: t("customer.workguide.fallback") },
      ]);
      setWorkers([]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={twClass("mx-auto w-full max-w-6xl px-3 py-4 sm:px-5 sm:py-6")}
    >
      <div className={twClass("mb-3")}>
        <h1
          className={twClass(
            "text-xl font-extrabold text-slate-900 sm:text-2xl",
          )}
        >
          {t("customer.workguide.title")}
        </h1>
        <p className={twClass("mt-0.5 text-xs text-slate-500")}>
          {t("customer.workguide.subtitle")}
        </p>
      </div>
      {worker && (
        <div
          className={twClass(
            "mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-[10px] text-emerald-800",
          )}
        >
          <span>{t("customer.findWorkers.viewProfile")}:</span>
          <b>{worker.replaceAll("-", " ")}</b>
          <Link
            className={twClass("font-bold underline")}
            to={`/find-workers/${worker}`}
          >
            {t("customer.findWorkers.viewProfile")}
          </Link>
        </div>
      )}
      <div className={twClass("grid gap-3 lg:grid-cols-[minmax(0,1fr)_280px]")}>
        <section
          className={twClass(
            "flex h-[520px] min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm",
          )}
        >
          <div
            className={twClass(
              "flex shrink-0 items-center gap-2 border-b border-slate-200 px-3 py-2.5",
            )}
          >
            <div
              className={twClass(
                "grid h-8 w-8 place-items-center rounded-full bg-emerald-100 text-emerald-700",
              )}
            >
              <Bot size={18} />
            </div>
            <div>
              <b className={twClass("block text-xs text-slate-800")}>
                {t("customer.workguide.assistant")}
              </b>
              <div className={twClass("text-[9px] text-emerald-600")}>
                ● {t("customer.workguide.online")}
              </div>
            </div>
          </div>
          <div
            className={twClass(
              "min-h-0 flex-1 overflow-y-auto bg-slate-50 px-3 py-2.5 sm:px-4",
            )}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={twClass(
                  `mb-1.5 flex ${m.from === "user" ? "justify-end" : "justify-start"}`,
                )}
              >
                <div
                  className={twClass(
                    `max-w-[82%] rounded-2xl px-2.5 py-1.5 text-[11px] leading-4 sm:max-w-[72%] ${m.from === "user" ? "bg-emerald-600 text-white" : "border border-slate-200 bg-white text-slate-700"}`,
                  )}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {busy && (
              <div className={twClass("flex justify-start")}>
                <div
                  className={twClass(
                    "rounded-2xl border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] text-slate-500",
                  )}
                >
                  {t("common.loading")}
                </div>
              </div>
            )}
          </div>
          <div
            className={twClass(
              "flex shrink-0 items-center gap-1.5 border-t border-slate-200 bg-white p-2",
            )}
          >
            <input
              className={twClass(
                "min-w-0 flex-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] outline-none focus:border-emerald-500",
              )}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void send()}
              placeholder={t("customer.workguide.placeholder")}
            />
            <button
              className={twClass(
                "grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:opacity-40",
              )}
              onClick={() => void send()}
              disabled={busy || !input.trim()}
              aria-label={t("customer.workguide.send", "Send")}
            >
              <Send size={16} />
            </button>
          </div>
        </section>
        <aside
          className={twClass(
            "self-start rounded-2xl border border-slate-200 bg-white p-3 shadow-sm",
          )}
        >
          <div className={twClass("flex items-center gap-2")}>
            <div
              className={twClass(
                "grid h-8 w-8 place-items-center rounded-full bg-emerald-100 text-emerald-700",
              )}
            >
              <Sparkles size={17} />
            </div>
            <h3 className={twClass("text-xs font-extrabold text-slate-800")}>
              {t("customer.workguide.what")}
            </h3>
          </div>
          <div className={twClass("mt-2 grid gap-1.5")}>
            {[
              { Icon: Search, key: "find" },
              { Icon: Users, key: "team" },
              { Icon: CalendarCheck2, key: "booking" },
              { Icon: MessageCircle, key: "messages" },
            ].map(({ Icon, key }) => (
              <button
                key={key}
                onClick={() => setInput(t(`customer.workguide.${key}`))}
                className={twClass(
                  "flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-2 text-left text-[10px] font-semibold text-slate-700 hover:bg-emerald-50",
                )}
              >
                <Icon size={12} />
                {t(`customer.workguide.${key}`)}
              </button>
            ))}
          </div>
          <Link
            className={twClass(
              "mt-2 flex min-h-9 items-center justify-center rounded-lg bg-emerald-600 px-3 text-[10px] font-bold text-white hover:bg-emerald-700",
            )}
            to="/find-workers"
          >
            {t("customer.workguide.findButton")}
          </Link>
        </aside>
      </div>
      <WorkGuideResults mode="customer" workers={workers} />
    </div>
  );
}
