import type { ChangeEvent, HTMLInputTypeAttribute } from "react";

type FormFieldProps = {
  id: string;
  label: string;
  type?: HTMLInputTypeAttribute;
  inputMode?: "text" | "tel" | "email";
  autoComplete?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
};

export const FormField = ({
  id,
  label,
  type = "text",
  inputMode,
  autoComplete,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
}: FormFieldProps) => (
  <div>
    <div
      className={`rounded-2xl bg-white px-4 py-3 ${
        error ? "ring-2 ring-red-400" : ""
      }`}
    >
      <label
        htmlFor={id}
        className="block text-[9px] font-semibold tracking-wider text-custom-blue uppercase"
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onChange(event.target.value)
        }
        onBlur={onBlur}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="mt-1 w-full text-sm text-slate-900 outline-none placeholder:text-sm placeholder:text-gray-400"
      />
    </div>
    {error && (
      <p id={`${id}-error`} className="mt-1 px-1 text-xs text-red-600">
        {error}
      </p>
    )}
  </div>
);
