import React from 'react';

interface FormFieldProps {
  label: string;
  id?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'url' | 'tel' | 'select' | 'textarea';
  value?: string | number;
  defaultValue?: string | number;
  placeholder?: string;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  options?: { value: string; label: string }[] | string[];
  className?: string;
  rows?: number;
  helperText?: string;
  error?: string;
}

export function FormField({
  label,
  id,
  type = 'text',
  value,
  defaultValue,
  placeholder,
  onChange,
  options,
  className = '',
  rows = 3,
  helperText,
  error,
}: FormFieldProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
  const borderClasses = error
    ? 'border-brand-red focus:border-brand-red ring-1 ring-brand-red/30'
    : 'border-field-border focus:border-brand-navy';

  return (
    <label className={`flex flex-col gap-1.5 text-[14px] font-semibold text-ink ${className}`}>
      <span className="flex justify-between items-center">
        <span>{label}</span>
      </span>
      {type === 'textarea' ? (
        <textarea
          id={inputId}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          onChange={onChange}
          rows={rows}
          className={`min-h-[96px] border rounded-[10px] p-2.5 px-3 font-sans font-normal text-[15px] text-ink bg-white outline-none resize-y transition-colors ${borderClasses}`}
        />
      ) : type === 'select' ? (
        <select
          id={inputId}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          className={`h-[46px] border rounded-[10px] px-3 font-sans font-normal text-[15px] text-ink bg-white outline-none transition-colors ${borderClasses}`}
        >
          {options?.map((opt) => {
            const val = typeof opt === 'string' ? opt : opt.value;
            const lbl = typeof opt === 'string' ? opt : opt.label;
            return (
              <option key={val} value={val}>
                {lbl}
              </option>
            );
          })}
        </select>
      ) : (
        <input
          id={inputId}
          type={type}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          onChange={onChange}
          className={`h-[46px] border rounded-[10px] px-3 font-sans font-normal text-[15px] text-ink bg-white outline-none transition-colors ${borderClasses}`}
        />
      )}
      {error && (
        <span className="text-[12px] text-brand-red font-medium">{error}</span>
      )}
      {helperText && !error && (
        <span className="text-[12px] text-muted font-normal">{helperText}</span>
      )}
    </label>
  );
}

