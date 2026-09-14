import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckIcon } from "../components/icons";
import { FormField } from "../components/FormField";
import { StepsWrapper } from "../components/StepsWrapper";
import { useValuation } from "../context/ValuationContext";
import { useRequireStep } from "../hooks/useRequireStep";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_MIN_LENGTH = 2;
const PHONE_MIN_DIGITS = 7;
const PHONE_MAX_DIGITS = 15;

type Field = "name" | "phone" | "email";

export const ContactPage = () => {
  const navigate = useNavigate();
  const { addressId } = useParams<{ addressId: string }>();
  const { property, photos, contact, setContact } = useValuation();
  useRequireStep("contact");
  const { name, phone, email, agreed } = contact;

  const [touched, setTouched] = useState<Record<Field, boolean>>({
    name: false,
    phone: false,
    email: false,
  });

  const updateContact = (patch: Partial<typeof contact>) =>
    setContact({ ...contact, ...patch });

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
    ? `${property.addressLine1}, ${property.city}`
    : `Property #${addressId}`;

  const handleSubmit = () => {
    if (!canSubmit) return;
    navigate(`/addresses/${addressId}/analyzing`);
  };

  return (
    <StepsWrapper
      stepHeaderCurrent={4}
      stepHeaderTotal={4}
      stepHeaderLabel="Step 4 of 4 · Contact"
    >
      <div className="mt-5">
        <h1 className="font-serif text-hero leading-[1.15]">
          Where should the offer go?
        </h1>

        <p className="mt-3 text-body-sm text-slate-600">
          {photos.length} photo{photos.length === 1 ? "" : "s"} of{" "}
          {locationLabel} are in. Your offer is ready on the next page. This is
          just so we can reach you about it.
        </p>

        <div className="mt-6 space-y-3">
          <FormField
            id="fullName"
            label="Full name"
            autoComplete="name"
            placeholder="Dana Marsh"
            value={name}
            onChange={(value) => updateContact({ name: value })}
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
            onChange={(value) => updateContact({ phone: value })}
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
            onChange={(value) => updateContact({ email: value })}
            onBlur={markTouched("email")}
            error={touched.email ? emailError : undefined}
          />
        </div>

        <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl bg-yellow-50 p-4">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(event) =>
              updateContact({ agreed: event.target.checked })
            }
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

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="mt-6 w-full rounded-full bg-custom-yellow py-3 text-sm font-bold text-slate-900 transition-colors hover:bg-yellow-500 disabled:cursor-not-allowed disabled:bg-[#E8F4FD] disabled:opacity-50"
        >
          See my offer
        </button>
        {!canSubmit && (
          <p className="mt-2 text-center text-xs text-slate-500">
            Name, phone, email, and the terms box.
          </p>
        )}
      </div>
    </StepsWrapper>
  );
};
