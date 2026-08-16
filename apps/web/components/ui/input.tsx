'use client';

import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  error?: string | null;
  helperText?: ReactNode;
  isRequired?: boolean;
  leftIcon?: ReactNode;
  rightElement?: ReactNode;
  containerClassName?: string;
  badge?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      isRequired,
      required,
      leftIcon,
      rightElement,
      badge,
      className = '',
      containerClassName = '',
      id,
      ...props
    },
    ref
  ) => {
    const showRequired = isRequired ?? required;
    const inputId = id || (typeof label === 'string' ? label.toLowerCase().replace(/[^a-z0-9]+/g, '-') : undefined);

    return (
      <div className={`flex flex-col gap-1.5 text-sm font-medium text-slate-700 ${containerClassName}`}>
        {label && (
          <label htmlFor={inputId} className="flex items-center justify-between text-xs font-bold text-slate-700 select-none">
            <span className="flex items-center gap-1">
              <span>{label}</span>
              {showRequired && (
                <span
                  className="text-rose-500 font-extrabold text-sm leading-none"
                  title="مطلوب / Required"
                  aria-hidden="true"
                >
                  *
                </span>
              )}
            </span>
            {badge && <span>{badge}</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute start-3.5 flex items-center pointer-events-none text-slate-400 z-10">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            required={required}
            suppressHydrationWarning
            aria-invalid={!!error}
            className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition-all duration-200 outline-none shadow-sm ${
              leftIcon ? 'ps-10' : ''
            } ${
              rightElement ? 'pe-11' : ''
            } ${
              error
                ? 'border-rose-400 bg-rose-50/30 text-rose-900 placeholder:text-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200'
            } disabled:bg-slate-100 disabled:text-slate-400 ${className}`}
            {...props}
          />
          {rightElement && (
            <div className="absolute end-3 flex items-center z-10">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1.5 mt-0.5 animate-fade-in" role="alert">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
            {error}
          </p>
        )}
        {!error && helperText && (
          <div className="text-[11px] text-slate-500 mt-0.5">{helperText}</div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
