import { twClass } from "../../lib/tw";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowLeft,
  Camera,
  Eye,
  EyeOff,
  LockKeyhole,
  Upload,
  UserPlus,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useTranslation } from "../../../node_modules/react-i18next";
import { toast } from "sonner";
import { authApi, catalogApi } from "../../lib/api";
import RoleSelector, {
  type SignupRole,
} from "../../components/forms/RoleSelector";
import ThemeToggle from "../../components/ui/ThemeToggle";
import { useAuthStore } from "./auth.store";
import WorkerSelfieCamera from "./WorkerSelfieCamera";

type Mode = "login" | "signup" | "forgot";
type LoginMethod = "password" | "otp";

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm font-medium text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100";
const labelClass = "grid gap-1.5 text-sm font-bold text-slate-700";

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token, setAuth } = useAuthStore();
  const [mode, setMode] = useState<Mode>("login");
  const [method, setMethod] = useState<LoginMethod>("password");
  const [otpStep, setOtpStep] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [selfieCameraOpen, setSelfieCameraOpen] = useState(false);
  const [signupRole, setSignupRole] = useState<SignupRole>("customer");
  const [profession, setProfession] = useState("");
  const [skills, setSkills] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [district, setDistrict] = useState("");
  const [taluka, setTaluka] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [languages, setLanguages] = useState("");
  const [bio, setBio] = useState("");
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [experienceDocument, setExperienceDocument] = useState<File | null>(
    null,
  );
  const [districts, setDistricts] = useState<string[]>([]);
  const [talukas, setTalukas] = useState<string[]>([]);
  const [professionOptions, setProfessionOptions] = useState<string[]>([]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    void catalogApi
      .locations()
      .then((r) => setDistricts(r.districts))
      .catch(() => setDistricts([]));
    void catalogApi
      .categories()
      .then((r) =>
        setProfessionOptions((r.categories || []).map((c) => c.name)),
      )
      .catch(() => setProfessionOptions([]));
  }, []);
  useEffect(() => {
    if (!district) {
      setTalukas([]);
      return;
    }
    void catalogApi
      .locations(district)
      .then((r) => setTalukas(r.talukas))
      .catch(() => setTalukas([]));
  }, [district]);

  const redirectAfterAuth = (role?: string) =>
    navigate(
      role === "admin"
        ? "/admin/dashboard"
        : role === "worker"
          ? "/worker"
          : "/",
      { replace: true },
    );
  useEffect(() => {
    if (token) redirectAfterAuth(useAuthStore.getState().user?.role);
  }, [token]);
  const resetMessages = () => {
    setError("");
    setNotice("");
    setDevOtp("");
  };
  const switchMode = (next: Mode) => {
    setMode(next);
    setOtpStep(false);
    setOtpVerified(false);
    setCode("");
    setNewPassword("");
    setConfirmNewPassword("");
    resetMessages();
  };

  const validateSignup = () => {
    if (
      !name ||
      !mobile ||
      !email ||
      !age ||
      !gender ||
      !signupPassword ||
      !confirmPassword
    )
      throw new Error(t("auth.required"));
    if (signupRole === "worker" && !image)
      throw new Error(
        "Worker selfie is required. Please take a selfie using the camera.",
      );
    if (Number(age) < 18 || Number(age) > 120 || !Number.isInteger(Number(age)))
      throw new Error(t("auth.ageInvalid"));
    if (signupPassword !== confirmPassword)
      throw new Error(t("auth.passwordMismatch"));
    if (signupRole === "worker") {
      if (
        !profession.trim() ||
        !skills.trim() ||
        !experienceYears ||
        !district.trim() ||
        !taluka.trim() ||
        !city.trim() ||
        !area.trim()
      )
        throw new Error(
          "Worker profession, skills, experience and complete location are required.",
        );
      if (
        profession.split(",").filter(Boolean).length < 1 ||
        languages.split(",").filter(Boolean).length < 1
      )
        throw new Error("Select at least one profession and one language.");
      if (!idDocument)
        throw new Error("Aadhaar / ID document is required for Worker signup.");
    }
  };

  async function compressSelfie(file: File) {
    if (file.size <= 700 * 1024 && file.type === "image/webp") return file;
    const img = new Image();
    const url = URL.createObjectURL(file);
    try {
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Unable to read selfie"));
        img.src = url;
      });
      const max = 1200;
      const scale = Math.min(
        1,
        max / Math.max(img.naturalWidth, img.naturalHeight),
      );
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Unable to process selfie");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/webp", 0.84),
      );
      if (!blob) throw new Error("Unable to compress selfie");
      return new File([blob], `workforce-selfie-${Date.now()}.webp`, {
        type: "image/webp",
        lastModified: Date.now(),
      });
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    resetMessages();
    setBusy(true);
    try {
      if (mode === "signup") {
        validateSignup();
        if (!otpStep) {
          const fd = new FormData();
          Object.entries({
            name,
            mobile,
            email,
            age,
            gender,
            password: signupPassword,
            role: signupRole,
            profession,
            skillNames: skills,
            experienceYears,
            district,
            taluka,
            city,
            area,
            languages,
            bio,
          }).forEach(([key, value]) => fd.append(key, value));
          if (image)
            fd.append(
              "image",
              signupRole === "worker" ? await compressSelfie(image) : image,
            );
          if (idDocument) fd.append("idDocument", idDocument);
          if (experienceDocument)
            fd.append("experienceDocument", experienceDocument);
          const result = await authApi.requestSignupOtp(fd);
          setOtpStep(true);
          setNotice(result.message);
          setDevOtp(result.devOtp || "");
          toast.success("OTP sent");
        } else {
          const result = await authApi.verifySignupOtp(mobile, code);
          setAuth(result.token, result.user);
          toast.success(
            result.user.role === "worker"
              ? "Worker account created. Verification is pending."
              : "Account created successfully.",
          );
          redirectAfterAuth(result.user.role);
        }
      } else if (mode === "forgot") {
        if (!identifier) throw new Error(t("auth.required"));
        if (!otpStep) {
          const result = await authApi.requestPasswordReset(identifier);
          setOtpStep(true);
          setOtpVerified(false);
          setNotice(result.message || t("auth.resetSent"));
          setDevOtp(result.devOtp || "");
          toast.success("Reset OTP sent");
        } else if (!otpVerified) {
          if (!code) throw new Error(t("auth.required"));
          await authApi.verifyPasswordResetOtp(identifier, code);
          setOtpVerified(true);
          setNotice("OTP verified. Set your new password below.");
          setDevOtp("");
          toast.success("OTP verified");
        } else {
          if (!newPassword || !confirmNewPassword)
            throw new Error(t("auth.required"));
          if (newPassword !== confirmNewPassword)
            throw new Error(t("auth.passwordMismatch"));
          await authApi.resetPassword(identifier, code, newPassword);
          toast.success("Password reset successfully");
          switchMode("login");
        }
      } else if (method === "password") {
        if (!identifier || !password) throw new Error(t("auth.required"));
        const result = await authApi.login(identifier, password);
        setAuth(result.token, result.user);
        toast.success(
          result.user.role === "worker" &&
            result.user.verificationStatus !== "verified"
            ? "Worker verification is pending."
            : "Login successful",
        );
        redirectAfterAuth(result.user.role);
      } else if (!otpStep) {
        if (!identifier) throw new Error(t("auth.required"));
        const result = await authApi.requestLoginOtp(identifier);
        setOtpStep(true);
        setNotice(result.message);
        setDevOtp(result.devOtp || "");
        toast.success("OTP sent");
      } else {
        const result = await authApi.verifyLoginOtp(identifier, code);
        setAuth(result.token, result.user);
        toast.success("Login successful");
        redirectAfterAuth(result.user.role);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main
      className={twClass(
        "min-h-screen bg-[linear-gradient(135deg,#f5fbf8_0%,#eef7ff_55%,#ffffff_100%)] px-4 py-6 sm:px-6 sm:py-10",
      )}
    >
      <div
        className={twClass(
          "mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center justify-center",
        )}
      >
        <section
          className={twClass(
            "w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50",
          )}
        >
          <div
            className={twClass(
              "flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-7",
            )}
          >
            <div className={twClass("flex items-center gap-3")}>
              <img
                src="/workforce-logo.png"
                alt="WORKFORCE"
                className={twClass("h-11 w-auto rounded-xl")}
              />
              <div>
                <p
                  className={twClass(
                    "text-lg font-black tracking-tight text-slate-900",
                  )}
                >
                  WORK<span className={twClass("text-emerald-600")}>FORCE</span>
                </p>
                <p className={twClass("text-[11px] text-slate-500")}>
                  Find. Book. Work. Grow.
                </p>
              </div>
            </div>
            <ThemeToggle compact />
          </div>
          <div className={twClass("p-5 sm:p-8")}>
            {mode === "forgot" ? (
              <ForgotForm
                {...{
                  identifier,
                  setIdentifier,
                  otpStep,
                  otpVerified,
                  code,
                  setCode,
                  newPassword,
                  setNewPassword,
                  confirmNewPassword,
                  setConfirmNewPassword,
                  showNewPassword,
                  setShowNewPassword,
                  busy,
                  error,
                  notice,
                  devOtp,
                  submit,
                  switchMode,
                }}
              />
            ) : mode === "signup" ? (
              <SignupForm
                {...{
                  name,
                  setName,
                  mobile,
                  setMobile,
                  age,
                  setAge,
                  email,
                  setEmail,
                  gender,
                  setGender,
                  signupPassword,
                  setSignupPassword,
                  confirmPassword,
                  setConfirmPassword,
                  showPassword,
                  setShowPassword,
                  signupRole,
                  setSignupRole,
                  image,
                  setImage,
                  selfieCameraOpen,
                  setSelfieCameraOpen,
                  profession,
                  setProfession,
                  professionOptions,
                  setProfessionOptions,
                  experienceYears,
                  setExperienceYears,
                  skills,
                  setSkills,
                  district,
                  setDistrict,
                  districts,
                  taluka,
                  setTaluka,
                  talukas,
                  city,
                  setCity,
                  area,
                  setArea,
                  languages,
                  setLanguages,
                  bio,
                  setBio,
                  idDocument,
                  setIdDocument,
                  experienceDocument,
                  setExperienceDocument,
                  otpStep,
                  code,
                  setCode,
                  busy,
                  error,
                  notice,
                  devOtp,
                  submit,
                  switchMode,
                }}
              />
            ) : (
              <LoginForm
                {...{
                  identifier,
                  setIdentifier,
                  password,
                  setPassword,
                  method,
                  setMethod,
                  otpStep,
                  setOtpStep,
                  code,
                  setCode,
                  showPassword,
                  setShowPassword,
                  busy,
                  error,
                  notice,
                  devOtp,
                  submit,
                  switchMode,
                  resetMessages,
                }}
              />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

type FormProps = Record<string, any>;
function Feedback({ error, notice, devOtp }: FormProps) {
  return (
    <>
      {error && (
        <div
          className={twClass(
            "rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700",
          )}
        >
          {error}
        </div>
      )}
      {notice && (
        <div
          className={twClass(
            "rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800",
          )}
        >
          {notice}
          {devOtp && (
            <span className={twClass("ml-2 font-black")}>OTP: {devOtp}</span>
          )}
        </div>
      )}
    </>
  );
}
function PasswordInput({
  value,
  onChange,
  visible,
  setVisible,
  autoComplete,
}: FormProps) {
  return (
    <div className={twClass("relative")}>
      <LockKeyhole
        className={twClass("absolute left-3 top-3.5 text-slate-400")}
        size={17}
      />
      <input
        className={twClass(`${inputClass} pl-10 pr-10`)}
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        onClick={() => setVisible((v: boolean) => !v)}
        className={twClass("absolute right-3 top-3 text-slate-500")}
      >
        {visible ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  );
}
function LoginForm(p: FormProps) {
  return (
    <div className={twClass("space-y-5")}>
      <div>
        <h1 className={twClass("text-2xl font-black text-slate-900")}>
          Welcome back
        </h1>
        <p className={twClass("mt-1 text-sm text-slate-500")}>
          Login to continue to your WORKFORCE account.
        </p>
      </div>
      <form onSubmit={p.submit} className={twClass("grid gap-4")}>
        <label className={labelClass}>
          Mobile / Email
          <input
            className={inputClass}
            value={p.identifier}
            onChange={(e) => p.setIdentifier(e.target.value)}
            placeholder="98765 43210 or email"
            autoComplete="username"
          />
        </label>
        {p.method === "password" ? (
          <label className={labelClass}>
            Password
            <PasswordInput
              value={p.password}
              onChange={(e: any) => p.setPassword(e.target.value)}
              visible={p.showPassword}
              setVisible={p.setShowPassword}
              autoComplete="current-password"
            />
          </label>
        ) : (
          p.otpStep && (
            <label className={labelClass}>
              OTP
              <input
                className={inputClass}
                value={p.code}
                onChange={(e) => p.setCode(e.target.value)}
                inputMode="numeric"
                maxLength={6}
                placeholder="6 digit OTP"
              />
            </label>
          )
        )}
        <Feedback error={p.error} notice={p.notice} devOtp={p.devOtp} />
        <button
          disabled={p.busy}
          className={twClass(
            "rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-60",
          )}
        >
          {p.busy
            ? "Please wait…"
            : p.method === "otp"
              ? p.otpStep
                ? "Verify OTP"
                : "Send OTP"
              : "Login"}
        </button>
      </form>
      <div
        className={twClass(
          "flex flex-wrap items-center justify-between gap-3 text-sm",
        )}
      >
        <button
          type="button"
          className={twClass("font-bold text-emerald-700")}
          onClick={() => {
            p.setMethod(p.method === "otp" ? "password" : "otp");
            p.setOtpStep(false);
            p.resetMessages?.();
          }}
        >
          {p.method === "otp" ? "Use password" : "Login with OTP"}
        </button>
        <button
          type="button"
          className={twClass("font-bold text-slate-600")}
          onClick={() => p.switchMode("forgot")}
        >
          Forgot password?
        </button>
      </div>
      <div
        className={twClass(
          "rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-600",
        )}
      >
        Don't have an account?{" "}
        <button
          type="button"
          className={twClass("font-black text-emerald-700")}
          onClick={() => p.switchMode("signup")}
        >
          Create account
        </button>
      </div>
    </div>
  );
}
function ForgotForm(p: FormProps) {
  const { t } = useTranslation();
  return (
    <div className={twClass("space-y-5")}>
      <button
        type="button"
        onClick={() => p.switchMode("login")}
        className={twClass(
          "inline-flex items-center gap-2 text-sm font-bold text-slate-600",
        )}
      >
        <ArrowLeft size={16} /> Back to login
      </button>
      <div>
        <h1 className={twClass("text-2xl font-black text-slate-900")}>
          Reset password
        </h1>
        <p className={twClass("mt-1 text-sm text-slate-500")}>
          Verify the OTP first, then set your new password.
        </p>
      </div>
      <form onSubmit={p.submit} className={twClass("grid gap-4")}>
        <label className={labelClass}>
          Mobile / Email
          <input
            className={inputClass}
            value={p.identifier}
            onChange={(e) => p.setIdentifier(e.target.value)}
          />
        </label>
        {p.otpStep && !p.otpVerified && (
          <label className={labelClass}>
            OTP
            <input
              className={inputClass}
              value={p.code}
              onChange={(e) => p.setCode(e.target.value)}
              inputMode="numeric"
              maxLength={6}
            />
          </label>
        )}
        {p.otpVerified && (
          <>
            <label className={labelClass}>
              {t("auth.newPassword")}
              <PasswordInput
                value={p.newPassword}
                onChange={(e: any) => p.setNewPassword(e.target.value)}
                visible={p.showNewPassword}
                setVisible={p.setShowNewPassword}
                autoComplete="new-password"
              />
            </label>
            <label className={labelClass}>
              {t("auth.confirmPassword")}
              <input
                className={inputClass}
                type="password"
                value={p.confirmNewPassword}
                onChange={(e) => p.setConfirmNewPassword(e.target.value)}
              />
            </label>
          </>
        )}
        <Feedback error={p.error} notice={p.notice} devOtp={p.devOtp} />
        <button
          disabled={p.busy}
          className={twClass(
            "rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white",
          )}
        >
          {p.busy
            ? "Please wait…"
            : !p.otpStep
              ? "Send reset OTP"
              : !p.otpVerified
                ? "Verify OTP"
                : "Reset password"}
        </button>
      </form>
    </div>
  );
}
function SignupForm(p: FormProps) {
  return (
    <div className={twClass("space-y-5")}>
      <div>
        <div
          className={twClass(
            "flex items-center gap-2 text-lg font-black text-slate-900",
          )}
        >
          <UserPlus size={19} className={twClass("text-emerald-600")} /> Create
          account
        </div>
        <p className={twClass("mt-1 text-sm text-slate-500")}>
          Choose whether you want to hire workers or work through WORKFORCE.
        </p>
      </div>
      <form onSubmit={p.submit} className={twClass("grid gap-5")}>
        <label className={labelClass}>
          Full name
          <input
            className={inputClass}
            value={p.name}
            onChange={(e) => p.setName(e.target.value)}
            placeholder="Your full name"
          />
        </label>
        <div className={twClass("grid gap-4 sm:grid-cols-2")}>
          <label className={labelClass}>
            Mobile
            <input
              className={inputClass}
              value={p.mobile}
              onChange={(e) => p.setMobile(e.target.value)}
              inputMode="numeric"
              placeholder="10 digit mobile"
            />
          </label>
          <label className={labelClass}>
            Age
            <input
              className={inputClass}
              type="number"
              min={18}
              max={120}
              value={p.age}
              onChange={(e) => p.setAge(e.target.value)}
            />
          </label>
        </div>
        <div className={twClass("grid gap-4 sm:grid-cols-2")}>
          <label className={labelClass}>
            Email
            <input
              className={inputClass}
              type="email"
              value={p.email}
              onChange={(e) => p.setEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </label>
          <label className={labelClass}>
            Gender
            <select
              className={inputClass}
              value={p.gender}
              onChange={(e) => p.setGender(e.target.value)}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </label>
        </div>
        <label className={labelClass}>
          Password
          <PasswordInput
            value={p.signupPassword}
            onChange={(e: any) => p.setSignupPassword(e.target.value)}
            visible={p.showPassword}
            setVisible={p.setShowPassword}
            autoComplete="new-password"
          />
        </label>
        <label className={labelClass}>
          Confirm password
          <input
            className={inputClass}
            type={p.showPassword ? "text" : "password"}
            value={p.confirmPassword}
            onChange={(e) => p.setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
        </label>
        <RoleSelector value={p.signupRole} onChange={p.setSignupRole} />
        {p.signupRole === "worker" ? (
          <WorkerFields {...p} />
        ) : (
          <FileField
            label="Profile photo (optional)"
            file={p.image}
            onChange={p.setImage}
          />
        )}{" "}
        {p.otpStep && (
          <label className={labelClass}>
            OTP
            <input
              className={inputClass}
              value={p.code}
              onChange={(e) => p.setCode(e.target.value)}
              inputMode="numeric"
              maxLength={6}
              placeholder="6 digit OTP"
            />
          </label>
        )}
        <Feedback error={p.error} notice={p.notice} devOtp={p.devOtp} />
        <button
          disabled={p.busy}
          className={twClass(
            "rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-60",
          )}
        >
          {p.busy
            ? "Please wait…"
            : p.otpStep
              ? "Verify OTP"
              : "Create account"}
        </button>
      </form>
      <p className={twClass("text-center text-sm text-slate-500")}>
        Already have an account?{" "}
        <button
          type="button"
          className={twClass("font-black text-emerald-700")}
          onClick={() => p.switchMode("login")}
        >
          Login
        </button>
      </p>
      <WorkerSelfieCamera
        open={p.selfieCameraOpen}
        onClose={() => p.setSelfieCameraOpen(false)}
        onCapture={(file) => {
          p.setImage(file);
          p.setSelfieCameraOpen(false);
        }}
      />
    </div>
  );
}
function WorkerFields(p: FormProps) {
  const [professionOpen, setProfessionOpen] = useState(false);
  const selectedProfessions = String(p.profession || "")
    .split(",")
    .map((x: string) => x.trim())
    .filter(Boolean);
  const selectedLanguages = String(p.languages || "")
    .split(",")
    .map((x: string) => x.trim())
    .filter(Boolean);
  const toggleValue = (
    current: string[],
    value: string,
    setter: (value: string) => void,
  ) => {
    const next = current.includes(value)
      ? current.filter((x) => x !== value)
      : [...current, value];
    setter(next.join(", "));
  };
  const languageOptions = ["English", "Marathi", "Hindi"];
  return (
    <div
      className={twClass(
        "space-y-4 rounded-2xl border border-amber-200 bg-amber-50/60 p-4 sm:p-5",
      )}
    >
      <div>
        <h3 className={twClass("text-base font-black text-slate-900")}>
          Worker verification details
        </h3>
        <p className={twClass("mt-1 text-xs leading-5 text-slate-600")}>
          Selfie + Aadhaar are mandatory. Experience certificate is optional.
        </p>
      </div>
      <div className={twClass("grid gap-2")}>
        <span className={labelClass}>Selfie / Profile photo *</span>
        <button
          type="button"
          onClick={() => p.setSelfieCameraOpen(true)}
          className={twClass(
            "flex items-center gap-3 rounded-xl border border-dashed border-emerald-300 bg-emerald-50 px-3 py-3 text-left text-sm text-emerald-800",
          )}
        >
          <Camera size={18} />
          <span className={twClass("min-w-0 flex-1 truncate")}>
            {p.image?.name || "Open camera and take selfie"}
          </span>
          <span className={twClass("text-xs font-black")}>Camera only</span>
        </button>
        <p className={twClass("text-xs text-slate-500")}>
          Gallery upload is disabled. The captured selfie becomes your permanent
          profile photo.
        </p>
      </div>
      <div className={twClass("grid gap-4 sm:grid-cols-2")}>
        <div className={labelClass + " relative"}>
          <span>Profession *</span>
          <button
            type="button"
            onClick={() => setProfessionOpen((v) => !v)}
            aria-expanded={professionOpen}
            className={twClass(
              "flex min-h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 text-left text-sm font-semibold text-slate-700 shadow-sm",
            )}
          >
            <span className={twClass("truncate")}>
              {selectedProfessions.length
                ? selectedProfessions.join(", ")
                : "Select profession"}
            </span>
            <span
              className={twClass(
                `ml-2 transition-transform ${professionOpen ? "rotate-180" : ""}`,
              )}
            >
              ⌄
            </span>
          </button>
          {professionOpen && (
            <div
              className={twClass(
                "absolute left-0 right-0 top-[4.25rem] z-30 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl",
              )}
            >
              {(p.professionOptions || []).map((option: string) => (
                <button
                  key={option}
                  type="button"
                  onClick={() =>
                    toggleValue(selectedProfessions, option, p.setProfession)
                  }
                  className={twClass(
                    `flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs font-bold transition ${selectedProfessions.includes(option) ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"}`,
                  )}
                >
                  {option}
                  {selectedProfessions.includes(option) && <span>✓</span>}
                </button>
              ))}
              {!(p.professionOptions || []).length && (
                <span
                  className={twClass("block px-3 py-2 text-xs text-slate-400")}
                >
                  No professions available
                </span>
              )}
            </div>
          )}
        </div>
        <label className={labelClass}>
          Experience (years) *
          <input
            className={inputClass}
            type="number"
            min={0}
            max={70}
            value={p.experienceYears}
            onChange={(e) => p.setExperienceYears(e.target.value)}
          />
        </label>
      </div>
      <label className={labelClass}>
        Skills *
        <input
          className={inputClass}
          value={p.skills}
          onChange={(e) => p.setSkills(e.target.value)}
          placeholder="Wiring, repair, installation"
        />
      </label>
      <div className={twClass("grid gap-4 sm:grid-cols-2")}>
        <label className={labelClass}>
          District *
          <input
            className={inputClass}
            list="worker-districts"
            value={p.district}
            onChange={(e) => p.setDistrict(e.target.value)}
            placeholder="Search district"
          />
          <datalist id="worker-districts">
            {p.districts.map((x: string) => (
              <option key={x} value={x} />
            ))}
          </datalist>
        </label>
        <label className={labelClass}>
          Taluka / Area *
          <input
            className={inputClass}
            list="worker-talukas"
            value={p.taluka}
            onChange={(e) => p.setTaluka(e.target.value)}
            placeholder="Search taluka"
          />
          <datalist id="worker-talukas">
            {p.talukas.map((x: string) => (
              <option key={x} value={x} />
            ))}
          </datalist>
        </label>
        <label className={labelClass}>
          City / Area *
          <input
            className={inputClass}
            value={p.city}
            onChange={(e) => p.setCity(e.target.value)}
            placeholder="City"
          />
        </label>
        <label className={labelClass}>
          Local area *
          <input
            className={inputClass}
            value={p.area}
            onChange={(e) => p.setArea(e.target.value)}
            placeholder="Area / locality"
          />
        </label>
      </div>
      <div className={labelClass}>
        <span>Languages *</span>
        <div
          className={twClass(
            "flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-3",
          )}
        >
          {languageOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() =>
                toggleValue(selectedLanguages, option, p.setLanguages)
              }
              className={twClass(
                `rounded-full border px-3 py-1.5 text-xs font-bold transition ${selectedLanguages.includes(option) ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-600"}`,
              )}
            >
              {option}
            </button>
          ))}
        </div>
        <span className={twClass("text-[10px] font-medium text-slate-500")}>
          Select one or more languages.
        </span>
      </div>
      <label className={labelClass}>
        Professional bio
        <textarea
          className={twClass(`${inputClass} min-h-24 resize-y`)}
          value={p.bio}
          onChange={(e) => p.setBio(e.target.value)}
        />
      </label>
      <div className={twClass("grid gap-3 sm:grid-cols-2")}>
        <FileField
          label="Aadhaar / ID document *"
          file={p.idDocument}
          onChange={p.setIdDocument}
          required
        />
        <FileField
          label="Experience certificate (optional)"
          file={p.experienceDocument}
          onChange={p.setExperienceDocument}
        />
      </div>
    </div>
  );
}
function FileField({
  label,
  file,
  onChange,
  required = false,
}: {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
  required?: boolean;
}) {
  return (
    <label className={labelClass}>
      <span>
        {label}
        {required && " *"}
      </span>
      <span
        className={twClass(
          "flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm text-slate-600 hover:border-emerald-400",
        )}
      >
        <Upload size={17} />
        <span className={twClass("min-w-0 flex-1 truncate")}>
          {file?.name || "Choose file"}
        </span>
        <input
          className={twClass("hidden")}
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => onChange(e.target.files?.[0] || null)}
        />
      </span>
    </label>
  );
}
