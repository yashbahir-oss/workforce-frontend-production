import { twClass } from "../../lib/tw";
import {
  Paperclip,
  Phone,
  Send,
  Video,
  Search,
  CheckCheck,
  Image as ImageIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useTranslation } from "../../../node_modules/react-i18next";
import { fileUrl, messagesApi, type ChatMessage } from "../../lib/api";
import ChatAttachment from "./ChatAttachment";
import { toast } from "sonner";
import { useAuthStore } from "../auth/auth.store";
import { connectSocket } from "../../lib/socket";

type ChatUser = {
  id: string;
  name: string;
  profileImage?: string;
  role?: string;
  lastMessage?: string;
};

/** Shared customer/worker chat screen. WorkerMessagesPage reuses this component. */
export default function MessagesPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [params] = useSearchParams();
  const requested = params.get("worker");
  const [people, setPeople] = useState<ChatUser[]>([]);
  const [selected, setSelected] = useState(requested || "");
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [query, setQuery] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File>();
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    messagesApi
      .conversations()
      .then((r) => {
        const list = (r.conversations || [])
          .map((c: any) => {
            const p = (c.participants || []).find(
              (x: any) => String(x._id) !== String(user?.id),
            );
            return p
              ? {
                  id: String(p._id),
                  name: p.name,
                  profileImage: p.profileImage,
                  role: p.role,
                  lastMessage: c.lastMessage || "",
                }
              : null;
          })
          .filter(Boolean) as ChatUser[];
        setPeople(list);
        if (requested) {
          const match = list.find((p) => p.id === requested);
          if (match) setSelectedUser(match);
        }
        if (!selected && list[0]) setSelected(list[0].id);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [user?.id, requested]);
  useEffect(() => {
    if (!selected) {
      setMessages([]);
      return;
    }
    setChatLoading(true);
    messagesApi
      .conversation(selected)
      .then((r) => {
        setMessages(r.messages || []);
        const p = r.conversation?.participant;
        if (p)
          setSelectedUser({
            id: String(p._id),
            name: p.name,
            profileImage: p.profileImage,
            role: p.role,
          });
      })
      .catch((e) => {
        setMessages([]);
        toast.error(e.message);
      })
      .finally(() => setChatLoading(false));
    messagesApi.markRead(selected).catch(() => undefined);
  }, [selected]);
  useEffect(() => {
    const socket = connectSocket();
    const onMessage = (payload: any) => {
      const m = payload?.message;
      if (!m) return;
      const sender = String(m.sender || "");
      const recipient = String(m.recipient || "");
      if (sender === String(user?.id) || recipient === String(user?.id)) {
        const otherId = sender === String(user?.id) ? recipient : sender;
        if (otherId === String(selected)) {
          setMessages((current) =>
            current.some((x) => String(x._id) === String(m._id))
              ? current
              : [...current, m],
          );
          void messagesApi.markRead(otherId).catch(() => undefined);
        } else {
          void messagesApi
            .conversations()
            .then((r) => {
              const list = (r.conversations || [])
                .map((c: any) => {
                  const p = (c.participants || []).find(
                    (x: any) => String(x._id) !== String(user?.id),
                  );
                  return p
                    ? {
                        id: String(p._id),
                        name: p.name,
                        profileImage: p.profileImage,
                        role: p.role,
                        lastMessage: c.lastMessage || "",
                      }
                    : null;
                })
                .filter(Boolean) as ChatUser[];
              setPeople(list);
            })
            .catch(() => undefined);
        }
      }
    };
    socket.on("message:new", onMessage);
    return () => {
      socket.off("message:new", onMessage);
    };
  }, [selected, user?.id]);
  const visible = useMemo(
    () =>
      people.filter((p) =>
        `${p.name} ${p.role || ""}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
      ),
    [people, query],
  );
  const chatUser = selectedUser || people.find((p) => p.id === selected);
  const send = async () => {
    const value = text.trim();
    if ((!value && !file) || !selected) return;
    try {
      const r = await messagesApi.send(selected, value, file);
      setMessages((c) => [...c, r.message]);
      setText("");
      setFile(undefined);
      const input = document.getElementById(
        "chat-file",
      ) as HTMLInputElement | null;
      if (input) input.value = "";
      if (chatUser && !people.some((p) => p.id === chatUser.id))
        setPeople((p) => [chatUser, ...p]);
    } catch (e: any) {
      toast.error(
        e.message || t("customer.messages.sendError", "Unable to send message"),
      );
    }
  };
  const attachmentUrl = (m: ChatMessage) =>
    m.attachment?.url ? fileUrl(m.attachment.url) : "";
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
          {t("customer.messages.title")}
        </h1>
        <p className={twClass("mt-0.5 text-xs text-slate-500")}>
          {t("customer.messages.subtitle")}
        </p>
      </div>
      <section
        className={twClass(
          "grid min-h-[520px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:grid-cols-[240px_minmax(0,1fr)]",
        )}
      >
        <aside className={twClass("hidden border-r border-slate-200 md:block")}>
          <div
            className={twClass(
              "flex items-center gap-2 border-b border-slate-200 p-2.5",
            )}
          >
            <Search size={14} className={twClass("text-slate-400")} />
            <input
              className={twClass(
                "min-w-0 flex-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs outline-none focus:border-emerald-500",
              )}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("customer.messages.search")}
            />
          </div>
          <div className={twClass("max-h-[520px] overflow-y-auto")}>
            {visible.map((p) => (
              <button
                type="button"
                className={twClass(
                  `flex w-full items-center gap-2 border-b border-slate-100 p-2.5 text-left transition ${p.id === selected ? "bg-emerald-50" : "hover:bg-slate-50"}`,
                )}
                key={p.id}
                onClick={() => {
                  setSelected(p.id);
                  setSelectedUser(p);
                }}
              >
                <img
                  className={twClass("h-9 w-9 rounded-full object-cover")}
                  src={fileUrl(p.profileImage) || "/workforce-logo.png"}
                  alt=""
                />
                <span className={twClass("min-w-0")}>
                  <b
                    className={twClass("block truncate text-xs text-slate-800")}
                  >
                    {p.name}
                  </b>
                  <small
                    className={twClass(
                      "block truncate text-[9px] text-slate-500",
                    )}
                  >
                    {p.lastMessage || t("customer.messages.startChat")}
                  </small>
                </span>
              </button>
            ))}
            {!loading && !visible.length && (
              <p
                className={twClass(
                  "p-4 text-center text-[10px] text-slate-500",
                )}
              >
                {t("customer.messages.noConversation", "No conversations")}
              </p>
            )}
          </div>
        </aside>
        <div className={twClass("flex min-h-[520px] min-w-0 flex-col")}>
          <div
            className={twClass(
              "flex gap-1.5 overflow-x-auto border-b border-slate-200 bg-white p-2 md:hidden",
            )}
          >
            {visible.map((p) => (
              <button
                type="button"
                key={p.id}
                onClick={() => {
                  setSelected(p.id);
                  setSelectedUser(p);
                }}
                className={twClass(
                  `flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-semibold ${p.id === selected ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`,
                )}
              >
                <img
                  className={twClass("h-5 w-5 rounded-full object-cover")}
                  src={fileUrl(p.profileImage) || "/workforce-logo.png"}
                  alt=""
                />
                {p.name}
              </button>
            ))}
          </div>
          <header
            className={twClass(
              "flex shrink-0 items-center justify-between gap-2 border-b border-slate-200 px-3 py-2 sm:px-4",
            )}
          >
            <div className={twClass("flex min-w-0 items-center gap-2")}>
              <img
                className={twClass("h-8 w-8 rounded-full object-cover")}
                src={fileUrl(chatUser?.profileImage) || "/workforce-logo.png"}
                alt=""
              />
              <div className={twClass("min-w-0")}>
                <b className={twClass("block truncate text-xs text-slate-800")}>
                  {chatUser?.name ||
                    t("customer.messages.noConversation", "No conversation")}
                </b>
                <div className={twClass("text-[9px] text-slate-500")}>
                  {chatUser?.role || ""}
                </div>
              </div>
            </div>
            <div className={twClass("hidden items-center gap-1 sm:flex")}>
              <button
                type="button"
                className={twClass(
                  "grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50",
                )}
                onClick={() =>
                  toast.info(t("customer.messages.contactAfterBooking"))
                }
              >
                <Phone size={13} />
              </button>
              <button
                type="button"
                className={twClass(
                  "grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50",
                )}
                onClick={() => toast.info(t("customer.messages.videoSoon"))}
              >
                <Video size={13} />
              </button>
              {chatUser && (
                <Link
                  className={twClass(
                    "rounded-lg border border-slate-200 px-2.5 py-1.5 text-[9px] font-bold text-slate-600 hover:bg-slate-50",
                  )}
                  to={`/find-workers/${chatUser.id}`}
                >
                  {t("customer.messages.profile")}
                </Link>
              )}
            </div>
          </header>
          {error && (
            <div
              className={twClass(
                "m-2 rounded-lg bg-red-50 p-2 text-[10px] text-red-700",
              )}
            >
              {error}
            </div>
          )}
          <div
            className={twClass(
              "min-h-0 flex-1 overflow-y-auto bg-slate-50 px-3 py-2.5 sm:px-4",
            )}
          >
            {chatLoading && (
              <div
                className={twClass(
                  "py-4 text-center text-[10px] text-slate-500",
                )}
              >
                {t("common.loading")}
              </div>
            )}
            {!chatLoading && !messages.length && (
              <div
                className={twClass(
                  "flex min-h-[180px] items-center justify-center text-center text-[10px] text-slate-500",
                )}
              >
                {selected
                  ? t("customer.messages.startChat")
                  : t(
                      "customer.messages.noConversation",
                      "Select a conversation to start chatting",
                    )}
              </div>
            )}
            {messages.map((m) => (
              <div
                key={m._id}
                className={twClass(
                  `mb-2 flex ${String(m.sender) === String(user?.id) ? "justify-end" : "justify-start"}`,
                )}
              >
                <div
                  className={twClass(
                    `max-w-[82%] rounded-2xl px-2.5 py-1.5 text-[11px] leading-4 sm:max-w-[68%] ${String(m.sender) === String(user?.id) ? "bg-emerald-100 text-emerald-900" : "border border-slate-200 bg-white text-slate-700"}`,
                  )}
                >
                  {m.text && <div>{m.text}</div>}
                  {m.attachment && attachmentUrl(m) && (
                    <div className={twClass("mt-1.5")}>
                      <ChatAttachment
                        url={m.attachment.url!}
                        name={m.attachment.name || "Attachment"}
                        contentType={m.attachment.contentType || ""}
                      />
                    </div>
                  )}
                  {m.attachment && (
                    <div
                      className={twClass(
                        "mt-1 flex items-center gap-1 text-[9px] opacity-60",
                      )}
                    >
                      <ImageIcon size={9} />
                      {m.attachment.name}
                    </div>
                  )}
                  <small
                    className={twClass("mt-0.5 flex justify-end opacity-60")}
                  >
                    <CheckCheck size={10} />
                  </small>
                </div>
              </div>
            ))}
          </div>
          <div
            className={twClass(
              "flex shrink-0 items-center gap-1.5 border-t border-slate-200 bg-white p-2",
            )}
          >
            <label
              className={twClass(
                "grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-lg border border-slate-200 text-emerald-700 hover:bg-emerald-50",
              )}
              title="Attach image or PDF"
            >
              <Paperclip size={15} />
              <input
                id="chat-file"
                type="file"
                hidden
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0])}
              />
            </label>
            <input
              className={twClass(
                "min-w-0 flex-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] outline-none focus:border-emerald-500",
              )}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void send()}
              placeholder={file?.name || t("customer.messages.placeholder")}
            />
            <button
              type="button"
              onClick={() => void send()}
              disabled={!text.trim() && !file}
              className={twClass(
                "grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40",
              )}
              aria-label={t("customer.messages.send")}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
