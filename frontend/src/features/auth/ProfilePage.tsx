import { twClass } from "../../lib/tw";
import { useState } from "react";
import { Camera, LogOut, Save, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useTranslation } from "../../../node_modules/react-i18next";
import { authApi, fileUrl, uploadProfileImage } from "../../lib/api";
import { useAuthStore } from "./auth.store";
import { toast } from "sonner";

const input =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100";
const label = "grid gap-1.5 text-sm font-bold text-slate-700";

function PasswordModal({
  open,
  onClose,
  currentPassword,
  newPassword,
  confirmPassword,
  showCurrent,
  showNew,
  showConfirm,
  setCurrentPassword,
  setNewPassword,
  setConfirmPassword,
  setShowCurrent,
  setShowNew,
  setShowConfirm,
  saving,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  showCurrent: boolean;
  showNew: boolean;
  showConfirm: boolean;
  setCurrentPassword: (v: string) => void;
  setNewPassword: (v: string) => void;
  setConfirmPassword: (v: string) => void;
  setShowCurrent: (v: boolean) => void;
  setShowNew: (v: boolean) => void;
  setShowConfirm: (v: boolean) => void;
  saving: boolean;
  onSubmit: () => Promise<void>;
}) {
  if (!open) return null;
  return (
    <div
      className={twClass(
        "fixed inset-0 z-[100] grid place-items-center bg-slate-950/45 p-4",
      )}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={twClass(
          "w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-7",
        )}
      >
        <div className={twClass("flex items-start justify-between gap-4")}>
          <div>
            <h3 className={twClass("text-xl font-black text-slate-900")}>
              Change Password
            </h3>
            <p className={twClass("mt-1 text-xs text-slate-500")}>
              Enter your current password and choose a new password.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={twClass(
              "rounded-lg border border-slate-200 px-3 py-2 text-xs font-black text-slate-600",
            )}
          >
            Close
          </button>
        </div>
        <div className={twClass("mt-6 grid gap-4")}>
          <label className={label}>
            Current Password
            <div className={twClass("relative")}>
              <input
                autoFocus
                className={input + " pr-10"}
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className={twClass("absolute right-3 top-3 text-slate-400")}
              >
                {showCurrent ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </label>
          <label className={label}>
            New Password
            <div className={twClass("relative")}>
              <input
                className={input + " pr-10"}
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className={twClass("absolute right-3 top-3 text-slate-400")}
              >
                {showNew ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </label>
          <label className={label}>
            Confirm New Password
            <div className={twClass("relative")}>
              <input
                className={input + " pr-10"}
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className={twClass("absolute right-3 top-3 text-slate-400")}
              >
                {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </label>
          <div className={twClass("flex gap-2 pt-2")}>
            <button
              type="button"
              onClick={onClose}
              className={twClass(
                "flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700",
              )}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void onSubmit()}
              disabled={saving}
              className={twClass(
                "flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white disabled:opacity-60",
              )}
            >
              {saving ? "Changing..." : "Save Password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { token, user, setAuth, logout } = useAuthStore();
  const [name, setName] = useState(user?.name || "");
  const [mobile, setMobile] = useState(user?.mobile || "");
  const [email, setEmail] = useState(user?.email || "");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [saving, setSaving] = useState(false);
  const [otpBusy, setOtpBusy] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  if (!token || !user) {
    nav("/login", { replace: true });
    return null;
  }
  const worker = user.role === "worker";
  const changed =
    mobile.trim() !== (user.mobile || "") ||
    email.trim().toLowerCase() !== (user.email || "").toLowerCase();
  const upload = async (file: File) => {
    try {
      const r = await uploadProfileImage(token, file);
      setAuth(token, r.user);
      toast.success("Profile photo updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to update photo");
    }
  };
  const save = async () => {
    if (changed && !otp) {
      toast.error("OTP is required when changing mobile or email");
      return;
    }
    setSaving(true);
    try {
      const r = await authApi.update(token, {
        name,
        mobile,
        email,
        ...(changed ? { otp } : {}),
      });
      setAuth(token, r.user);
      setOtp("");
      setDevOtp("");
      toast.success("Profile saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to save profile");
    } finally {
      setSaving(false);
    }
  };
  const sendOtp = async () => {
    setOtpBusy(true);
    try {
      const r = await authApi.requestContactOtp();
      setDevOtp(r.devOtp || "");
      toast.success("OTP generated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to generate OTP");
    } finally {
      setOtpBusy(false);
    }
  };
  const changePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    setPasswordSaving(true);
    try {
      const r = await authApi.changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordOpen(false);
      toast.success(r.message || "Password changed successfully");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to change password");
    } finally {
      setPasswordSaving(false);
    }
  };
  return (
    <main
      className={twClass("min-h-screen bg-[#f4faff] px-3 py-5 sm:px-6 sm:py-8")}
    >
      <div
        className={twClass(
          "mx-auto w-full max-w-6xl overflow-hidden rounded-[24px] border border-[#dce9f3] bg-white shadow-[0_12px_35px_rgba(8,57,104,.08)]",
        )}
      >
        <section
          className={twClass(
            "relative overflow-hidden border-b border-[#dce9f3] bg-gradient-to-r from-[#eafaf4] via-[#f5fbff] to-[#e9f5ff] px-5 py-7 sm:px-8",
          )}
        >
          <div
            className={twClass(
              "absolute -right-12 -top-16 h-44 w-44 rounded-full bg-emerald-100/60 blur-2xl",
            )}
          />
          <div
            className={twClass(
              "relative flex flex-col gap-5 sm:flex-row sm:items-center",
            )}
          >
            <div
              className={twClass(
                "relative h-28 w-28 shrink-0 overflow-hidden rounded-[22px] border-4 border-white bg-slate-100 shadow-lg",
              )}
            >
              <img
                src={fileUrl(user.profileImage) || "/workforce-logo.png"}
                className={twClass("h-full w-full object-cover")}
                alt="Profile"
              />
              {!worker && (
                <label
                  className={twClass(
                    "absolute bottom-1.5 right-1.5 grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-emerald-600 text-white shadow-lg",
                  )}
                >
                  <Camera size={16} />
                  <input
                    hidden
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void upload(f);
                    }}
                  />
                </label>
              )}
            </div>
            <div className={twClass("min-w-0")}>
              <span
                className={twClass(
                  "inline-flex rounded-full bg-white/90 px-3 py-1 text-[9px] font-black uppercase tracking-[.15em] text-emerald-700 shadow-sm",
                )}
              >
                WORKFORCE PROFILE
              </span>
              <h1
                className={twClass(
                  "mt-2 text-2xl font-black tracking-tight text-[#103b66] sm:text-3xl",
                )}
              >
                {t("profile.title")}
              </h1>
              <p className={twClass("mt-1 text-sm text-[#58738a]")}>
                {t("profile.welcome")},{" "}
                <b className={twClass("text-[#163e61]")}>{user.name}</b>
              </p>
              <div
                className={twClass("mt-3 flex flex-wrap items-center gap-2")}
              >
                <span
                  className={twClass(
                    "rounded-full bg-[#0a8f5c] px-3 py-1 text-[9px] font-black capitalize text-white",
                  )}
                >
                  {user.role}
                </span>
                {user.verificationStatus && (
                  <span
                    className={twClass(
                      "rounded-full bg-white px-3 py-1 text-[9px] font-black capitalize text-slate-700 shadow-sm",
                    )}
                  >
                    {user.verificationStatus}
                  </span>
                )}
              </div>
              {worker && (
                <p
                  className={twClass(
                    "mt-2 text-[10px] font-semibold text-slate-500",
                  )}
                >
                  Your signup selfie is your verified profile photo and cannot
                  be changed.
                </p>
              )}
            </div>
          </div>
        </section>
        <div
          className={twClass(
            "grid gap-6 p-5 sm:p-8 lg:grid-cols-[1.25fr_.75fr]",
          )}
        >
          <section className={twClass("space-y-5")}>
            <div>
              <h2 className={twClass("text-base font-black text-[#123d64]")}>
                Personal information
              </h2>
              <p className={twClass("mt-1 text-[10px] text-slate-500")}>
                Keep your account details up to date.
              </p>
            </div>
            <div className={twClass("grid gap-4 sm:grid-cols-2")}>
              <label className={label}>
                Full name
                <input
                  className={input}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label className={label}>
                Mobile number
                <input
                  className={input}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                />
              </label>
              <label className={label + " sm:col-span-2"}>
                Email address
                <input
                  className={input}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
            </div>
            {changed && (
              <div
                className={twClass(
                  "rounded-2xl border border-amber-200 bg-amber-50 p-4",
                )}
              >
                <div
                  className={twClass(
                    "flex flex-col gap-3 sm:flex-row sm:items-end",
                  )}
                >
                  <label className={label + " flex-1"}>
                    Verification OTP
                    <input
                      className={input}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      inputMode="numeric"
                      maxLength={6}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => void sendOtp()}
                    disabled={otpBusy}
                    className={twClass(
                      "rounded-xl bg-slate-900 px-4 py-3 text-sm font-black text-white disabled:opacity-60",
                    )}
                  >
                    {otpBusy ? "Please wait" : "Send OTP"}
                  </button>
                </div>
                {devOtp && (
                  <p
                    className={twClass("mt-2 text-xs font-bold text-amber-800")}
                  >
                    Development OTP: {devOtp}
                  </p>
                )}
              </div>
            )}
            <button
              onClick={() => void save()}
              disabled={saving}
              className={twClass(
                "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-black text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60",
              )}
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save changes"}
            </button>
            <button
              type="button"
              onClick={() => setPasswordOpen(true)}
              className={twClass(
                "mt-2 w-full text-center text-xs font-black text-emerald-700 underline underline-offset-4 hover:text-emerald-800",
              )}
            >
              Change Password
            </button>
          </section>
          <aside className={twClass("space-y-4")}>
            <section
              className={twClass(
                "rounded-2xl border border-[#dce9f3] bg-white p-5",
              )}
            >
              <h2 className={twClass("text-sm font-black text-[#123d64]")}>
                Quick access
              </h2>
              <div className={twClass("mt-3 grid gap-2")}>
                <Link
                  className={twClass(
                    "rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50",
                  )}
                  to="/workguide"
                >
                  WorkGuide
                </Link>
                <Link
                  className={twClass(
                    "rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50",
                  )}
                  to="/messages"
                >
                  Messages
                </Link>
              </div>
            </section>
          </aside>
        </div>
        <PasswordModal
          open={passwordOpen}
          onClose={() => setPasswordOpen(false)}
          currentPassword={currentPassword}
          newPassword={newPassword}
          confirmPassword={confirmPassword}
          showCurrent={showCurrent}
          showNew={showNew}
          showConfirm={showConfirm}
          setCurrentPassword={setCurrentPassword}
          setNewPassword={setNewPassword}
          setConfirmPassword={setConfirmPassword}
          setShowCurrent={setShowCurrent}
          setShowNew={setShowNew}
          setShowConfirm={setShowConfirm}
          saving={passwordSaving}
          onSubmit={changePassword}
        />
        <div
          className={twClass(
            "flex flex-wrap gap-2 border-t border-slate-100 px-5 py-4 sm:px-8",
          )}
        >
          <button
            className={twClass(
              "ml-auto inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-black text-red-700",
            )}
            onClick={async () => {
              try {
                await authApi.logout();
              } catch {}
              logout();
              nav("/login", { replace: true });
            }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
    </main>
  );
}
