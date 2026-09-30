import { twClass } from "../../lib/tw";
import { BriefcaseBusiness, HardHat } from "lucide-react";
import { useTranslation } from "../../../node_modules/react-i18next";

export type SignupRole = "customer" | "worker";

type Props = { value: SignupRole; onChange: (role: SignupRole) => void };

export default function RoleSelector({ value, onChange }: Props) {
  const { t } = useTranslation();
  const options = [
    {
      value: "customer" as const,
      label: t("auth.joinAsCustomer", "Join as a Customer"),
      icon: BriefcaseBusiness,
    },
    {
      value: "worker" as const,
      label: t("auth.joinAsWorker", "Join as a Worker"),
      icon: HardHat,
    },
  ];

  return (
    <fieldset className={twClass("space-y-2")}>
      <legend className={twClass("text-sm font-semibold text-slate-700")}>
        Join WORKFORCE as
      </legend>
      <div className={twClass("grid gap-3 sm:grid-cols-2")}>
        {options.map(({ value: optionValue, label, icon: Icon }) => (
          <label
            key={optionValue}
            className={twClass(
              `flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                value === optionValue
                  ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                  : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300"
              }`,
            )}
          >
            <input
              className={twClass("sr-only")}
              type="radio"
              name="signupRole"
              value={optionValue}
              checked={value === optionValue}
              onChange={() => onChange(optionValue)}
            />
            <span
              className={twClass(
                `grid h-10 w-10 shrink-0 place-items-center rounded-lg ${value === optionValue ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"}`,
              )}
            >
              <Icon size={18} />
            </span>
            <span className={twClass("text-sm font-bold")}>{label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
