import { twClass } from "../../lib/tw";
import { useState } from "react";
import type { FormEvent } from "react";
import { CircleHelp, Mail, MapPin, Phone, Ticket, X } from "lucide-react";
// import { useLocation } from "react-router";
import { useTranslation } from "../../../node_modules/react-i18next";
import { toast } from "sonner";
import { complaintsApi, type SupportTicket } from "../../lib/api";
import { workforceConfig } from "./workforceConfig";

export default function SupportPage() {
  // const { pathname } = useLocation();
  const { t } = useTranslation();
  // const worker = pathname.startsWith("/worker");
  const [ticketOpen, setTicketOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [busy, setBusy] = useState(false);
  const [ticket, setTicket] = useState<SupportTicket | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      toast.error(t("customer.supportTicket.required"));
      return;
    }
    setBusy(true);
    try {
      const r = await complaintsApi.create({
        subject: subject.trim(),
        description: description.trim(),
        category,
      });
      setTicket(r.complaint);
      setSubject("");
      setDescription("");
      setCategory("General");
      setTicketOpen(false);
      toast.success(t("customer.supportTicket.created"));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("customer.supportTicket.failed"),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={twClass("wf-page")}>
      <div className={twClass("wf-wide")}>
        <section className={twClass("wf-page-hero")}>
          <div>
            <span className={twClass("wf-kicker")}>
              <CircleHelp /> {t("customer.supportTicket.badge")}
            </span>
            <h1>{t("customer.supportTicket.title")}</h1>
            <p>{t("customer.supportTicket.subtitle")}</p>
          </div>
        </section>

        <div className={twClass("grid gap-3 md:grid-cols-3")}>
          <a
            className={twClass("wf-panel p-4 no-underline")}
            href={
              workforceConfig.support.phone
                ? `tel:${workforceConfig.support.phone}`
                : "#"
            }
          >
            <Phone className={twClass("text-emerald-600")} size={20} />
            <h2 className={twClass("mt-2 text-sm font-black text-slate-900")}>
              {t("customer.supportTicket.call")}
            </h2>
            <p className={twClass("mt-1 text-xs text-slate-500")}>
              {workforceConfig.support.phone ||
                t("customer.supportTicket.notConfigured")}
            </p>
          </a>
          <a
            className={twClass("wf-panel p-4 no-underline")}
            href={
              workforceConfig.support.email
                ? `mailto:${workforceConfig.support.email}`
                : "#"
            }
          >
            <Mail className={twClass("text-emerald-600")} size={20} />
            <h2 className={twClass("mt-2 text-sm font-black text-slate-900")}>
              {t("customer.supportTicket.email")}
            </h2>
            <p className={twClass("mt-1 text-xs text-slate-500 break-all")}>
              {workforceConfig.support.email ||
                t("customer.supportTicket.notConfigured")}
            </p>
          </a>
          <button
            type="button"
            className={twClass("wf-panel p-4 text-left")}
            onClick={() => setTicketOpen(true)}
          >
            <Ticket className={twClass("text-emerald-600")} size={20} />
            <h2 className={twClass("mt-2 text-sm font-black text-slate-900")}>
              {t("customer.supportTicket.raise")}
            </h2>
            <p className={twClass("mt-1 text-xs text-slate-500")}>
              {t("customer.supportTicket.raiseHint")}
            </p>
          </button>
        </div>

        {ticket && (
          <div
            className={twClass(
              "mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4",
            )}
          >
            <div className={twClass("flex items-start gap-3")}>
              <Ticket
                className={twClass("mt-0.5 text-emerald-600")}
                size={18}
              />
              <div className={twClass("min-w-0")}>
                <h2 className={twClass("text-sm font-black text-slate-900")}>
                  {t("customer.supportTicket.createdTitle")}
                </h2>
                <p className={twClass("mt-1 text-xs text-slate-600")}>
                  {t("customer.supportTicket.ticketId")}:{" "}
                  <b className={twClass("text-emerald-700")}>
                    {ticket.complaintId}
                  </b>
                </p>
                <p className={twClass("mt-1 text-xs text-slate-500")}>
                  {t("customer.supportTicket.adminNote")}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className={twClass("wf-panel mt-3 p-4")}>
          <div className={twClass("flex items-start gap-3")}>
            <MapPin className={twClass("mt-0.5 text-emerald-600")} size={18} />
            <div>
              <h2 className={twClass("text-sm font-black text-slate-900")}>
                {t("customer.supportTicket.indiaTitle")}
              </h2>
              <p className={twClass("mt-1 text-xs text-slate-500")}>
                {t("customer.supportTicket.generalHint")}
              </p>
            </div>
          </div>
        </div>

        {ticketOpen && (
          <div
            className={twClass(
              "fixed inset-0 z-[120] grid place-items-center bg-slate-950/45 p-4",
            )}
          >
            <div
              className={twClass(
                "w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl sm:p-6",
              )}
            >
              <div
                className={twClass("flex items-start justify-between gap-3")}
              >
                <div>
                  <h2 className={twClass("text-lg font-black text-slate-900")}>
                    {t("customer.supportTicket.formTitle")}
                  </h2>
                  <p className={twClass("mt-1 text-xs text-slate-500")}>
                    {t("customer.supportTicket.formSubtitle")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTicketOpen(false)}
                  className={twClass(
                    "rounded-lg p-2 text-slate-500 hover:bg-slate-100",
                  )}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={submit} className={twClass("mt-5 grid gap-4")}>
                <label
                  className={twClass(
                    "grid gap-1.5 text-xs font-bold text-slate-700",
                  )}
                >
                  {t("customer.supportTicket.subject")}
                  <input
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className={twClass(
                      "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100",
                    )}
                    placeholder={t("customer.supportTicket.subjectPlaceholder")}
                  />
                </label>
                <label
                  className={twClass(
                    "grid gap-1.5 text-xs font-bold text-slate-700",
                  )}
                >
                  {t("customer.supportTicket.category")}
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={twClass(
                      "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-500",
                    )}
                  >
                    <option value="General">
                      {t("customer.supportTicket.general")}
                    </option>
                    <option value="Booking">
                      {t("customer.supportTicket.booking")}
                    </option>
                    <option value="Application">
                      {t("customer.supportTicket.application")}
                    </option>
                    <option value="Verification">
                      {t("customer.supportTicket.verification")}
                    </option>
                    <option value="Account">
                      {t("customer.supportTicket.account")}
                    </option>
                  </select>
                </label>
                <label
                  className={twClass(
                    "grid gap-1.5 text-xs font-bold text-slate-700",
                  )}
                >
                  {t("customer.supportTicket.description")}
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={twClass(
                      "min-h-32 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100",
                    )}
                    placeholder={t(
                      "customer.supportTicket.descriptionPlaceholder",
                    )}
                  />
                </label>
                <div className={twClass("flex gap-2 pt-1")}>
                  <button
                    type="button"
                    onClick={() => setTicketOpen(false)}
                    className={twClass(
                      "flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700",
                    )}
                  >
                    {t("common.back")}
                  </button>
                  <button
                    disabled={busy}
                    className={twClass(
                      "flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white disabled:opacity-60",
                    )}
                  >
                    {busy
                      ? t("customer.supportTicket.sending")
                      : t("customer.supportTicket.submit")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
