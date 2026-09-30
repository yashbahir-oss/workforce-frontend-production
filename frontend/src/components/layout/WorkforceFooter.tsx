import { twClass } from "../../lib/tw";
import { Mail, MapPin, Phone, LifeBuoy } from "lucide-react";
import { Link } from "react-router";
import { useTranslation } from "../../../node_modules/react-i18next";
import { workforceConfig } from "../../features/workforce/workforceConfig";

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={twClass("h-4 w-4")}>
      <path
        fill="currentColor"
        d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.6 1.6-1.6h1.7V3.8c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1V10H8v3h2.4v8h3.1Z"
      />
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={twClass("h-4 w-4")}>
      <rect
        x="3.2"
        y="3.2"
        width="17.6"
        height="17.6"
        rx="5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle
        cx="12"
        cy="12"
        r="4.1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="17.4" cy="6.7" r="1.1" fill="currentColor" />
    </svg>
  );
}
function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={twClass("h-4 w-4")}>
      <path
        fill="currentColor"
        d="M21.2 7.1a2.9 2.9 0 0 0-2-2C17.5 4.6 12 4.6 12 4.6s-5.5 0-7.2.5a2.9 2.9 0 0 0-2 2A30 30 0 0 0 2.3 12a30 30 0 0 0 .5 4.9 2.9 2.9 0 0 0 2 2c1.7.5 7.2.5 7.2.5s5.5 0 7.2-.5a2.9 2.9 0 0 0 .5-4.9 30 30 0 0 0-.5-4.9ZM10.2 15.4V8.6l5.8 3.4-5.8 3.4Z"
      />
    </svg>
  );
}
function XIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={twClass("h-4 w-4")}>
      <path
        fill="currentColor"
        d="M5 4h3.4l3.8 5 4.3-5H19l-5.3 6.2L19.3 20h-3.4l-4.1-5.4L7.1 20H4.6l5.6-6.6L5 4Zm3.2 1.8 7.9 12.4h1.7L9.9 5.8H8.2Z"
      />
    </svg>
  );
}

export default function WorkforceFooter({
  mode = "customer",
}: {
  mode?: "customer" | "worker";
}) {
  const { t } = useTranslation();
  const isWorker = mode === "worker";
  const supportHref = isWorker ? "/worker/support" : "/support";
  const supportLinks = isWorker
    ? [
        [supportHref, t("customer.footer.support")],
        ["/worker/profile", t("customer.profile", "Profile")],
      ]
    : [
        [supportHref, t("customer.footer.support")],
        ["/profile", t("customer.profile", "Profile")],
      ];
  const primaryTitle = isWorker
    ? t("customer.footer.forWorkers")
    : t("customer.footer.forCustomers");
  const primaryLinks = isWorker
    ? [
        ["/worker/find-jobs", t("worker.nav.findWork", "Find Work")],
        ["/worker/bookings", t("worker.nav.bookings", "Bookings")],
      ]
    : [
        ["/find-workers", t("customer.nav.findWorkers")],
        ["/post-requirement", t("customer.nav.postRequirement")],
      ];
  const social = [
    {
      href: workforceConfig.social.facebook,
      label: "Facebook",
      icon: <FacebookIcon />,
    },
    {
      href: workforceConfig.social.instagram,
      label: "Instagram",
      icon: <InstagramIcon />,
    },
    {
      href: workforceConfig.social.youtube,
      label: "YouTube",
      icon: <YoutubeIcon />,
    },
    { href: workforceConfig.social.x, label: "X", icon: <XIcon /> },
  ];
  return (
    <footer
      className={twClass(
        "mt-6 border-t-2 border-emerald-500 bg-slate-950 text-white md:mt-8",
      )}
    >
      <div
        className={twClass(
          "mx-auto w-full max-w-6xl px-3 py-3 sm:px-5 sm:py-4",
        )}
      >
        <div
          className={twClass(
            "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
          )}
        >
          <div className={twClass("flex min-w-0 items-center gap-2")}>
            <Link
              to={isWorker ? "/worker" : "/"}
              aria-label="WORKFORCE Home"
              className={twClass(
                "grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-white p-1 sm:h-11 sm:w-11",
              )}
            >
              <img
                src="/workforce-mark.png"
                alt="WORKFORCE"
                className={twClass("h-full w-full object-contain")}
              />
            </Link>
            <div className={twClass("min-w-0")}>
              <strong
                className={twClass(
                  "block text-[9px] font-extrabold leading-3.5 sm:text-[10px]",
                )}
              >
                {t("customer.footer.tagline")}
              </strong>
              <p
                className={twClass(
                  "mt-0.5 text-[7px] leading-3 text-slate-300 sm:text-[8px]",
                )}
              >
                {t("customer.footer.description")}
              </p>
            </div>
          </div>
          <div className={twClass("grid grid-cols-3 gap-2 sm:gap-4")}>
            <div className={twClass("min-w-0")}>
              <h3
                className={twClass(
                  "text-[8px] font-extrabold text-white sm:text-[9px]",
                )}
              >
                {primaryTitle}
              </h3>
              {primaryLinks.map(([href, label]) => (
                <Link
                  key={href}
                  to={href}
                  className={twClass(
                    "mt-1 block text-[7px] leading-3 text-slate-300 hover:text-white sm:text-[8px]",
                  )}
                >
                  {label}
                </Link>
              ))}
            </div>
            <div className={twClass("min-w-0")}>
              <h3
                className={twClass(
                  "text-[8px] font-extrabold text-white sm:text-[9px]",
                )}
              >
                {t("customer.footer.company")}
              </h3>
              {supportLinks.slice(1).map(([href, label]) => (
                <Link
                  key={href}
                  to={href}
                  className={twClass(
                    "mt-1 block text-[7px] leading-3 text-slate-300 hover:text-white sm:text-[8px]",
                  )}
                >
                  {label}
                </Link>
              ))}
            </div>
            <div className={twClass("min-w-0")}>
              <h3
                className={twClass(
                  "text-[8px] font-extrabold text-white sm:text-[9px]",
                )}
              >
                {t("customer.footer.support")}
              </h3>
              <Link
                to={supportHref}
                className={twClass(
                  "mt-1 flex items-center gap-1 text-[7px] leading-3 text-slate-300 hover:text-white sm:text-[8px]",
                )}
              >
                <LifeBuoy size={10} />
                {t("customer.footer.raiseTicket")}
              </Link>
              <a
                href={`tel:${workforceConfig.support.phone}`}
                className={twClass(
                  "mt-1 flex items-center gap-1 text-[7px] leading-3 text-slate-300 hover:text-white sm:text-[8px]",
                )}
              >
                <Phone size={9} />
                {workforceConfig.support.phone}
              </a>
            </div>
          </div>
        </div>
        <div
          className={twClass(
            "mt-2 flex items-center justify-between gap-2 border-t border-white/10 pt-2",
          )}
        >
          <div className={twClass("flex gap-1")}>
            {social.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className={twClass(
                  "grid h-6 w-6 place-items-center rounded-md border border-white/15 bg-white/5 text-white hover:bg-white/10",
                )}
              >
                {s.icon}
              </a>
            ))}
          </div>
          <div
            className={twClass(
              "flex items-center gap-2 text-[6.5px] text-slate-400 sm:text-[7px]",
            )}
          >
            <Mail size={9} />
            {workforceConfig.support.email || ""}
            <span>•</span>
            <MapPin size={9} />
            {t("customer.footer.country")}
          </div>
        </div>
        <div
          className={twClass(
            "mt-1 flex items-center justify-between border-t border-white/10 pt-1 text-[6.5px] leading-3 text-slate-400 sm:text-[7px]",
          )}
        >
          <span>
            © {new Date().getFullYear()} WORKFORCE ·{" "}
            {t("customer.footer.rights")}
          </span>
          <b className={twClass("text-slate-200")}>
            {t("customer.footer.slogan")}
          </b>
        </div>
      </div>
    </footer>
  );
}
