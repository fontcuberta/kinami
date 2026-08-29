import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";

type FieldChrome = {
  label: string;
  id: string;
  hint?: string;
  error?: string;
};

function describedBy(id: string, hint?: string, error?: string) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return [hintId, errorId].filter(Boolean).join(" ") || undefined;
}

const fieldLabel =
  "text-sm font-semibold text-text";
const fieldControl =
  "min-h-11 w-full rounded-lg border border-border-strong bg-surface px-3.5 py-2.5 text-base text-text placeholder:text-text-disabled focus:outline-none disabled:cursor-not-allowed disabled:opacity-60";

function FieldMeta({ id, hint, error }: { id: string; hint?: string; error?: string }) {
  return (
    <>
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-text-secondary">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm font-medium text-danger-700">
          {error}
        </p>
      )}
    </>
  );
}

function RequiredMark({ required }: { required?: boolean }) {
  if (!required) return null;
  return (
    <>
      <span aria-hidden="true" className="text-danger-700">
        {" "}
        *
      </span>
      <span className="sr-only"> (obligatorio)</span>
    </>
  );
}

type InputProps = FieldChrome & InputHTMLAttributes<HTMLInputElement>;

export function Input({ label, id, hint, error, required, className, ...rest }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={fieldLabel}>
        {label}
        <RequiredMark required={required} />
      </label>
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-text-secondary">
          {hint}
        </p>
      )}
      <input
        id={id}
        required={required}
        aria-describedby={describedBy(id, hint, error)}
        aria-invalid={error ? true : undefined}
        className={`${fieldControl} ${className ?? ""}`}
        {...rest}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm font-medium text-danger-700">
          {error}
        </p>
      )}
    </div>
  );
}

type TextAreaProps = FieldChrome & TextareaHTMLAttributes<HTMLTextAreaElement>;

export function TextArea({ label, id, hint, error, required, className, ...rest }: TextAreaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={fieldLabel}>
        {label}
        <RequiredMark required={required} />
      </label>
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-text-secondary">
          {hint}
        </p>
      )}
      <textarea
        id={id}
        required={required}
        aria-describedby={describedBy(id, hint, error)}
        aria-invalid={error ? true : undefined}
        className={`${fieldControl} resize-y ${className ?? ""}`}
        {...rest}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm font-medium text-danger-700">
          {error}
        </p>
      )}
    </div>
  );
}

type SelectProps = FieldChrome & SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ label, id, hint, error, required, className, children, ...rest }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={fieldLabel}>
        {label}
        <RequiredMark required={required} />
      </label>
      <FieldMeta id={id} hint={hint} />
      <select
        id={id}
        required={required}
        aria-describedby={describedBy(id, hint, error)}
        aria-invalid={error ? true : undefined}
        className={`${fieldControl} ${className ?? ""}`}
        {...rest}
      >
        {children}
      </select>
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm font-medium text-danger-700">
          {error}
        </p>
      )}
    </div>
  );
}
