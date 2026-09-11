import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckIcon } from "../components/icons";
import { FormField } from "../components/FormField";
import { StepHeader } from "../components/StepHeader";
import { useValuation } from "../context/ValuationContext";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_MIN_LENGTH = 2;
const PHONE_MIN_DIGITS = 7;
const PHONE_MAX_DIGITS = 15;

type Field = "name" | "phone" | "email";

export const ContactPage = () => {
  const navigate = useNavigate();
  const { addressId } = useParams<{ addressId: string }>();
  const { property, photoCount } = useValuation();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [touched, setTouched] = useState<Record<Field, boolean>>({
    name: false,
    phone: false,
    email: false,
  });

  const nameError =
    name.trim().length === 0
      ? "Enter your full name"
      : name.trim().length < NAME_MIN_LENGTH
        ? "That doesn't look like a full name"
        : undefined;

  const phoneDigitCount = phone.replace(/\D/g, "").length;
  const phoneError =
    phone.trim().length === 0
      ? "Enter your mobile number"
      : phoneDigitCount < PHONE_MIN_DIGITS || phoneDigitCount > PHONE_MAX_DIGITS
        ? "Enter a valid phone number"
        : undefined;

  const emailError =
    email.trim().length === 0
      ? "Enter your email"
      : !EMAIL_PATTERN.test(email.trim())
        ? "Enter a valid email address"
        : undefined;

  const isFormValid = !nameError && !phoneError && !emailError;
  const canSubmit = isFormValid && agreed;

  const markTouched = (field: Field) => () =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const locationLabel = property
    ? `${property.title}, ${property.subtitle.split(",")[0]}`
    : `Property #${addressId}`;

  const handleSubmit = () => {
    if (!canSubmit) return;
    navigate(`/addresses/${addressId}/analyzing`);
  };

  return (
    <div className="flex min-h-dvh flex-col p-5">
      <StepHeader
        current={3}
        total={4}
        label="Step 3 of 4 · Who to send it to"
      />

      <main className="mt-8">
        <h1 className="font-serif text-3xl leading-[1.15]">
          Where should the offer go?
        </h1>

        <p className="mt-3 text-xs text-slate-600">
          {photoCount} photo{photoCount === 1 ? "" : "s"} of {locationLabel} are
          in. Your offer is ready on the next page. This is just so we can reach
          you about it.
        </p>

        <div className="mt-6 space-y-3 rounded-2xl bg-blue-100 p-4">
          <FormField
            id="fullName"
            label="Full name"
            autoComplete="name"
            placeholder="Dana Marsh"
            value={name}
            onChange={setName}
            onBlur={markTouched("name")}
            error={touched.name ? nameError : undefined}
          />
          <FormField
            id="mobileNumber"
            label="Mobile number"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+1 817 555 0142"
            value={phone}
            onChange={setPhone}
            onBlur={markTouched("phone")}
            error={touched.phone ? phoneError : undefined}
          />
          <FormField
            id="email"
            label="Email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="dana@example.com"
            value={email}
            onChange={setEmail}
            onBlur={markTouched("email")}
            error={touched.email ? emailError : undefined}
          />
        </div>

        <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl bg-yellow-50 p-4">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
            className="peer sr-only"
          />
          <span
            aria-hidden="true"
            className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-slate-300 bg-white text-transparent transition-colors peer-checked:border-blue-600 peer-checked:bg-blue-600 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-blue-400 peer-focus-visible:ring-offset-2"
          >
            <CheckIcon className="h-3.5 w-3.5" />
          </span>
          <span className="text-sm text-slate-700">
            Yes, I understand and agree to the{" "}
            <span className="text-custom-blue underline">
              instacashly Terms of Use
            </span>{" "}
            and{" "}
            <span className="text-custom-blue underline">Privacy Policy</span>.
          </span>
        </label>
      </main>

      <footer className="sticky bottom-0 -mx-5 mt-auto -mb-5 border-gray-200 px-5 py-4">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full rounded-full bg-yellow-400 py-3 text-sm font-bold text-slate-900 transition-colors hover:bg-yellow-500 disabled:cursor-not-allowed disabled:bg-[#E8F4FD] disabled:opacity-50"
        >
          See my offer
        </button>
        {!canSubmit && (
          <p className="mt-2 text-center text-xs text-slate-500">
            Name, phone, email, and the terms box below.
          </p>
        )}
      </footer>
    </div>
  );
};
