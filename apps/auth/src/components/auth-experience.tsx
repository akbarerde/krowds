"use client";

import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleAlert,
  Eye,
  EyeOff,
  Fingerprint,
  Globe2,
  Info,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  Mail,
  RotateCcw,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Badge } from "@krowds/ui/components/badge";
import { KrowdsBrand } from "@krowds/ui/components/brand";
import { Button } from "@krowds/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@krowds/ui/components/card";
import { cn } from "@krowds/ui/lib/utils";
import {
  authFixtures,
  authViewOptions,
  type AuthNotice,
  type AuthView,
} from "@/lib/auth-fixtures";

const inputClass =
  "flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20";

const labelClass = "text-sm font-medium leading-none";

const viewMeta: Record<
  AuthView,
  { title: string; description: string; badge: string }
> = {
  "sign-in": {
    title: "Sign in to KROWDS",
    description: "Use your approved account method to continue.",
    badge: "Sign in",
  },
  register: {
    title: "Create your account",
    description: "Start with a verified email and a secure password.",
    badge: "Register",
  },
  recovery: {
    title: "Recover access",
    description: "Request a short-lived recovery link without exposing account details.",
    badge: "Recovery",
  },
  "recovery-sent": {
    title: "Check your recovery inbox",
    description: "The next step depends on the backend challenge and your approved channel.",
    badge: "Requested",
  },
  otp: {
    title: "Verify your email",
    description: "Enter the code from the approved message to continue the preview.",
    badge: "OTP",
  },
  mfa: {
    title: "Verify it is you",
    description: "A second factor may be required by the backend for this account or action.",
    badge: "MFA",
  },
  "step-up": {
    title: "Confirm this sensitive action",
    description: "The backend may ask for a fresh second factor before it proceeds.",
    badge: "Step-up",
  },
  oidc: {
    title: "Continue to Google",
    description: "The backend owns the OIDC handoff and validates the provider response.",
    badge: "OIDC",
  },
  "account-linking": {
    title: "Confirm your sign-in method",
    description: "A provider match needs an explicit choice. No account is linked silently.",
    badge: "Review",
  },
  session: {
    title: "Session preview",
    description: "A safe outcome view for session actions and privileged follow-up.",
    badge: "Session",
  },
  "session-expired": {
    title: "Your session has expired",
    description: "Continue with a new sign-in. The backend decides when a session is active.",
    badge: "Expired",
  },
  "signed-out": {
    title: "You are signed out",
    description: "The current session is no longer available in this browser.",
    badge: "Complete",
  },
};

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  code?: string;
  terms?: string;
};

type NoticeProps = {
  notice: AuthNotice;
};

function Notice({ notice }: NoticeProps) {
  const Icon = notice.tone === "error" ? CircleAlert : notice.tone === "success" ? Check : Info;

  return (
    <div
      role={notice.tone === "error" ? "alert" : "status"}
      aria-live="polite"
      className={cn(
        "flex gap-3 rounded-lg border px-3 py-3 text-sm",
        notice.tone === "error"
          ? "border-destructive/30 bg-destructive/10"
          : notice.tone === "success"
            ? "border-border bg-secondary"
            : "border-border bg-muted/70",
      )}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <div className="flex min-w-0 flex-col gap-1">
        <p className="font-medium">{notice.title}</p>
        <p className="leading-6 text-muted-foreground">{notice.message}</p>
      </div>
    </div>
  );
}

function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} role="alert" className="text-sm leading-5 text-destructive">
      {children}
    </p>
  );
}

type FormShellProps = {
  children: ReactNode;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
  describedBy?: string;
};

function FormShell({
  children,
  onSubmit,
  isSubmitting,
  describedBy,
}: FormShellProps) {
  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={onSubmit}
      noValidate
      aria-busy={isSubmitting}
      aria-labelledby="auth-card-title"
      aria-describedby={describedBy}
    >
      {children}
    </form>
  );
}

type SignInFormProps = {
  email: string;
  password: string;
  passwordVisible: boolean;
  fieldErrors: FieldErrors;
  isSubmitting: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onPasswordVisibilityChange: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onGoogle: () => void;
  onRecovery: () => void;
  onRegister: () => void;
};

function SignInForm({
  email,
  password,
  passwordVisible,
  fieldErrors,
  isSubmitting,
  onEmailChange,
  onPasswordChange,
  onPasswordVisibilityChange,
  onSubmit,
  onGoogle,
  onRecovery,
  onRegister,
}: SignInFormProps) {
  return (
    <FormShell onSubmit={onSubmit} isSubmitting={isSubmitting}>
      <div className="flex flex-col gap-2">
        <label className={labelClass} htmlFor="sign-in-email">
          Email address
        </label>
        <input
          id="sign-in-email"
          name="email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          className={inputClass}
          placeholder="you@example.com"
          required
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? "sign-in-email-error" : undefined}
        />
        {fieldErrors.email ? (
          <FieldError id="sign-in-email-error">{fieldErrors.email}</FieldError>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <label className={labelClass} htmlFor="sign-in-password">
            Password
          </label>
          <button
            type="button"
            onClick={onRecovery}
            className="rounded-sm text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Forgot password?
          </button>
        </div>
        <div className="relative">
          <input
            id="sign-in-password"
            name="password"
            type={passwordVisible ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            className={cn(inputClass, "pr-11")}
            placeholder="Enter your password"
            required
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={
              fieldErrors.password ? "sign-in-password-error" : undefined
            }
          />
          <button
            type="button"
            onClick={onPasswordVisibilityChange}
            aria-label={passwordVisible ? "Hide password" : "Show password"}
            aria-pressed={passwordVisible}
            className="absolute right-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {passwordVisible ? (
              <EyeOff aria-hidden="true" className="size-4" />
            ) : (
              <Eye aria-hidden="true" className="size-4" />
            )}
          </button>
        </div>
        {fieldErrors.password ? (
          <FieldError id="sign-in-password-error">
            {fieldErrors.password}
          </FieldError>
        ) : null}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <LoaderCircle data-icon="inline-start" aria-hidden="true" className="animate-spin" />
            Checking details
          </>
        ) : (
          <>
            Continue with email
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </>
        )}
      </Button>

      <div className="flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        onClick={onGoogle}
        disabled={isSubmitting}
      >
        <Globe2 data-icon="inline-start" aria-hidden="true" />
        Continue with Google
      </Button>

      <p className="text-xs leading-5 text-muted-foreground">
        Google sign-in starts at the backend-managed OIDC entry point. Provider
        tokens never pass through this page.
      </p>

      <p className="text-center text-sm text-muted-foreground">
        New to KROWDS?{" "}
        <button
          type="button"
          onClick={onRegister}
          className="rounded-sm font-medium text-foreground underline underline-offset-4 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Create an account
        </button>
      </p>
    </FormShell>
  );
}

type RegisterFormProps = {
  name: string;
  email: string;
  password: string;
  passwordVisible: boolean;
  termsAccepted: boolean;
  fieldErrors: FieldErrors;
  isSubmitting: boolean;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onPasswordVisibilityChange: () => void;
  onTermsChange: (value: boolean) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onGoogle: () => void;
  onSignIn: () => void;
};

function RegisterForm({
  name,
  email,
  password,
  passwordVisible,
  termsAccepted,
  fieldErrors,
  isSubmitting,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onPasswordVisibilityChange,
  onTermsChange,
  onSubmit,
  onGoogle,
  onSignIn,
}: RegisterFormProps) {
  return (
    <FormShell onSubmit={onSubmit} isSubmitting={isSubmitting}>
      <div className="flex flex-col gap-2">
        <label className={labelClass} htmlFor="register-name">
          Full name
        </label>
        <input
          id="register-name"
          name="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          className={inputClass}
          placeholder="Your name"
          required
          aria-invalid={Boolean(fieldErrors.name)}
          aria-describedby={fieldErrors.name ? "register-name-error" : undefined}
        />
        {fieldErrors.name ? (
          <FieldError id="register-name-error">{fieldErrors.name}</FieldError>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label className={labelClass} htmlFor="register-email">
          Email address
        </label>
        <input
          id="register-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          className={inputClass}
          placeholder="you@example.com"
          required
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? "register-email-error" : undefined}
        />
        {fieldErrors.email ? (
          <FieldError id="register-email-error">{fieldErrors.email}</FieldError>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label className={labelClass} htmlFor="register-password">
          Password
        </label>
        <div className="relative">
          <input
            id="register-password"
            name="password"
            type={passwordVisible ? "text" : "password"}
            autoComplete="new-password"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            className={cn(inputClass, "pr-11")}
            placeholder="At least 8 characters"
            required
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={
              fieldErrors.password ? "register-password-error" : "password-help"
            }
          />
          <button
            type="button"
            onClick={onPasswordVisibilityChange}
            aria-label={passwordVisible ? "Hide password" : "Show password"}
            aria-pressed={passwordVisible}
            className="absolute right-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {passwordVisible ? (
              <EyeOff aria-hidden="true" className="size-4" />
            ) : (
              <Eye aria-hidden="true" className="size-4" />
            )}
          </button>
        </div>
        {fieldErrors.password ? (
          <FieldError id="register-password-error">
            {fieldErrors.password}
          </FieldError>
        ) : (
          <p id="password-help" className="text-xs leading-5 text-muted-foreground">
            Use a unique password. The backend owns password verification and
            recovery.
          </p>
        )}
      </div>

      <div className="flex items-start gap-3">
        <input
          id="register-terms"
          name="terms"
          type="checkbox"
          checked={termsAccepted}
          onChange={(event) => onTermsChange(event.target.checked)}
          className="mt-0.5 size-4 shrink-0 accent-primary"
          required
          aria-invalid={Boolean(fieldErrors.terms)}
          aria-describedby={fieldErrors.terms ? "register-terms-error" : undefined}
        />
        <label htmlFor="register-terms" className="text-sm leading-6 text-muted-foreground">
          I understand the account and privacy terms in this preview.
        </label>
      </div>
      {fieldErrors.terms ? (
        <FieldError id="register-terms-error">{fieldErrors.terms}</FieldError>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <LoaderCircle data-icon="inline-start" aria-hidden="true" className="animate-spin" />
            Preparing registration
          </>
        ) : (
          <>
            Create account
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </>
        )}
      </Button>

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        onClick={onGoogle}
        disabled={isSubmitting}
      >
        <Globe2 data-icon="inline-start" aria-hidden="true" />
        Continue with Google
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSignIn}
          className="rounded-sm font-medium text-foreground underline underline-offset-4 hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Sign in
        </button>
      </p>
    </FormShell>
  );
}

type RecoveryFormProps = {
  email: string;
  fieldErrors: FieldErrors;
  isSubmitting: boolean;
  onEmailChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSignIn: () => void;
};

function RecoveryForm({
  email,
  fieldErrors,
  isSubmitting,
  onEmailChange,
  onSubmit,
  onSignIn,
}: RecoveryFormProps) {
  return (
    <FormShell onSubmit={onSubmit} isSubmitting={isSubmitting}>
      <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-3 text-sm leading-6 text-muted-foreground">
        <LockKeyhole aria-hidden="true" className="mt-1 size-4 shrink-0 text-foreground" />
        <p>
          Recovery requests use the same response whether an address is eligible.
          The backend never reveals account existence.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className={labelClass} htmlFor="recovery-email">
          Email address
        </label>
        <input
          id="recovery-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          className={inputClass}
          placeholder="you@example.com"
          required
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? "recovery-email-error" : undefined}
        />
        {fieldErrors.email ? (
          <FieldError id="recovery-email-error">{fieldErrors.email}</FieldError>
        ) : null}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <LoaderCircle data-icon="inline-start" aria-hidden="true" className="animate-spin" />
            Preparing recovery
          </>
        ) : (
          <>
            Send recovery link
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </>
        )}
      </Button>

      <button
        type="button"
        onClick={onSignIn}
        className="mx-auto w-fit rounded-sm text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        Return to sign in
      </button>
    </FormShell>
  );
}

type OtpFormProps = {
  code: string;
  fieldErrors: FieldErrors;
  isSubmitting: boolean;
  resendSeconds: number;
  onCodeChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onResend: () => void;
  onSignIn: () => void;
};

function OtpForm({
  code,
  fieldErrors,
  isSubmitting,
  resendSeconds,
  onCodeChange,
  onSubmit,
  onResend,
  onSignIn,
}: OtpFormProps) {
  const resendDisabled = resendSeconds > 0;

  return (
    <FormShell onSubmit={onSubmit} isSubmitting={isSubmitting}>
      <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground">
          <Mail aria-hidden="true" className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium">Message preview</p>
          <p className="truncate text-sm text-muted-foreground">
            Sent to {authFixtures.otp.destinationHint}
          </p>
        </div>
      </div>

      <p className="text-sm leading-6 text-muted-foreground">
        Enter the code exactly as shown in the approved message. Codes expire
        after {authFixtures.otp.challengeLifetime}; the backend controls
        verification and rate limits.
      </p>

      <div className="flex flex-col gap-2">
        <label className={labelClass} htmlFor="otp-code">
          Verification code
        </label>
        <input
          id="otp-code"
          name="code"
          type="text"
          autoComplete="one-time-code"
          value={code}
          onChange={(event) => onCodeChange(event.target.value)}
          className={inputClass}
          placeholder="Enter the code from your message"
          required
          aria-invalid={Boolean(fieldErrors.code)}
          aria-describedby={fieldErrors.code ? "otp-code-error" : "otp-code-help"}
        />
        {fieldErrors.code ? (
          <FieldError id="otp-code-error">{fieldErrors.code}</FieldError>
        ) : (
          <p id="otp-code-help" className="text-xs leading-5 text-muted-foreground">
            No code is stored or displayed by this fixture.
          </p>
        )}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <LoaderCircle data-icon="inline-start" aria-hidden="true" className="animate-spin" />
            Checking challenge
          </>
        ) : (
          <>
            Verify code
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </>
        )}
      </Button>

      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-muted-foreground">Didn&apos;t receive a message?</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onResend}
          disabled={resendDisabled || isSubmitting}
          aria-label={
            resendDisabled
              ? `Resend available in ${resendSeconds} seconds`
              : "Resend verification message"
          }
        >
          {resendDisabled ? `Resend in ${resendSeconds}s` : "Resend code"}
        </Button>
      </div>

      <button
        type="button"
        onClick={onSignIn}
        className="mx-auto w-fit rounded-sm text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        Use a different account
      </button>
    </FormShell>
  );
}

type ChallengeFormProps = {
  mode: "mfa" | "step-up";
  code: string;
  fieldErrors: FieldErrors;
  isSubmitting: boolean;
  onCodeChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onRecovery: () => void;
  onSession: () => void;
};

function ChallengeForm({
  mode,
  code,
  fieldErrors,
  isSubmitting,
  onCodeChange,
  onSubmit,
  onRecovery,
  onSession,
}: ChallengeFormProps) {
  const isStepUp = mode === "step-up";
  const inputId = `${mode}-code`;

  return (
    <FormShell onSubmit={onSubmit} isSubmitting={isSubmitting}>
      <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 p-3 text-sm leading-6 text-muted-foreground">
        <Fingerprint aria-hidden="true" className="mt-1 size-4 shrink-0 text-foreground" />
        <p>
          {isStepUp
            ? "This preview shows a fresh-factor request. It does not decide whether your account needs one."
            : "Use an approved factor. Email OTP alone is not a privileged-access decision."}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className={labelClass} htmlFor={inputId}>
          {isStepUp ? "Fresh verification code" : "Second-factor code"}
        </label>
        <input
          id={inputId}
          name="code"
          type="text"
          autoComplete="one-time-code"
          value={code}
          onChange={(event) => onCodeChange(event.target.value)}
          className={inputClass}
          placeholder="Enter the code from your approved factor"
          required
          aria-invalid={Boolean(fieldErrors.code)}
          aria-describedby={fieldErrors.code ? `${inputId}-error` : undefined}
        />
        {fieldErrors.code ? (
          <FieldError id={`${inputId}-error`}>{fieldErrors.code}</FieldError>
        ) : null}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <LoaderCircle data-icon="inline-start" aria-hidden="true" className="animate-spin" />
            Checking factor
          </>
        ) : (
          <>
            {isStepUp ? "Confirm step-up" : "Verify factor"}
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </>
        )}
      </Button>

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
        <button
          type="button"
          onClick={onRecovery}
          className="rounded-sm text-muted-foreground underline underline-offset-4 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Use recovery
        </button>
        <button
          type="button"
          onClick={onSession}
          className="rounded-sm text-muted-foreground underline underline-offset-4 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Return to session preview
        </button>
      </div>
    </FormShell>
  );
}

type StateSwitcherProps = {
  currentView: AuthView;
  onSelect: (view: AuthView) => void;
};

function StateSwitcher({ currentView, onSelect }: StateSwitcherProps) {
  return (
    <details className="group mb-5 rounded-xl border border-border bg-card/70">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl px-4 py-3 text-sm font-medium marker:content-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
        <span className="flex items-center gap-2">
          <RotateCcw aria-hidden="true" className="size-4 text-muted-foreground" />
          Preview another auth state
        </span>
        <span className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
          Local fixture
          <ChevronDown
            aria-hidden="true"
            className="size-4 transition-transform group-open:rotate-180"
          />
        </span>
      </summary>
      <div className="grid gap-2 border-t border-border p-3 sm:grid-cols-2">
        {authViewOptions.map((option) => {
          const isCurrent = option.id === currentView;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={isCurrent}
              onClick={() => onSelect(option.id)}
              className={cn(
                "flex min-h-14 flex-col items-start gap-1 rounded-lg border px-3 py-2 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                isCurrent
                  ? "border-primary bg-secondary"
                  : "border-transparent bg-background hover:border-border hover:bg-muted",
              )}
            >
              <span className="text-sm font-medium">{option.label}</span>
              <span className="text-xs leading-4 text-muted-foreground">
                {option.hint}
              </span>
            </button>
          );
        })}
      </div>
    </details>
  );
}

function Aside() {
  return (
    <aside className="relative hidden overflow-hidden border-r border-border bg-foreground text-background lg:flex lg:flex-col">
      <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full border border-background/10" />
      <div className="pointer-events-none absolute -bottom-40 -left-28 size-96 rounded-full border border-background/10" />
      <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
        <KrowdsBrand className="text-background hover:bg-background/10 hover:text-background" />

        <div className="max-w-lg">
          <p className="text-4xl font-semibold tracking-tight text-background/90">
            Clear steps for every way in.
          </p>
          <p className="mt-5 max-w-md text-base leading-7 text-background/65">
            KROWDS keeps the browser focused on the next safe action while the
            backend owns identity, session, challenge, and account decisions.
          </p>

          <dl className="mt-12 grid max-w-md grid-cols-2 gap-x-8 gap-y-7 border-t border-background/15 pt-6">
            <div>
              <dt className="text-xs uppercase tracking-[0.16em] text-background/50">
                Access window
              </dt>
              <dd className="mt-2 text-sm font-medium text-background/90">
                {authFixtures.session.accessWindow}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.16em] text-background/50">
                Recovery
              </dt>
              <dd className="mt-2 text-sm font-medium text-background/90">
                {authFixtures.session.recoveryWindow}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.16em] text-background/50">
                Challenge
              </dt>
              <dd className="mt-2 text-sm font-medium text-background/90">
                {authFixtures.otp.challengeLifetime}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.16em] text-background/50">
                Browser boundary
              </dt>
              <dd className="mt-2 text-sm font-medium text-background/90">
                UI state only
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex max-w-md items-start gap-3 border-t border-background/15 pt-5 text-sm leading-6 text-background/65">
          <ShieldCheck aria-hidden="true" className="mt-1 size-4 shrink-0 text-background" />
          <p>
            No provider secrets, readable OTPs, token decisions, or role
            decisions are stored in this frontend preview.
          </p>
        </div>
      </div>
    </aside>
  );
}

export function AuthExperience() {
  const [view, setView] = useState<AuthView>("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendSeconds, setResendSeconds] = useState<number>(
    authFixtures.otp.resendCooldownSeconds,
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState<AuthNotice | null>(null);
  const cardHeadingRef = useRef<HTMLHeadingElement>(null);
  const hasMounted = useRef(false);
  const previewTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    cardHeadingRef.current?.focus();
  }, [view]);

  useEffect(() => {
    if ((view !== "otp" && view !== "recovery-sent") || resendSeconds <= 0) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setResendSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [resendSeconds, view]);

  useEffect(() => {
    return () => {
      if (previewTimerRef.current !== null) {
        window.clearTimeout(previewTimerRef.current);
      }
    };
  }, []);

  const transitionTo = (nextView: AuthView, nextNotice: AuthNotice | null = null) => {
    if (previewTimerRef.current !== null) {
      window.clearTimeout(previewTimerRef.current);
      previewTimerRef.current = null;
    }
    setView(nextView);
    setNotice(nextNotice);
    setFieldErrors({});
    setCode("");
    if (nextView !== "register") {
      setTermsAccepted(false);
    }
    setIsSubmitting(false);
    if (nextView === "otp" || nextView === "recovery-sent") {
      setResendSeconds(authFixtures.otp.resendCooldownSeconds);
    }
  };

  const runPreview = (nextView: AuthView, nextNotice: AuthNotice) => {
    if (previewTimerRef.current !== null) {
      window.clearTimeout(previewTimerRef.current);
    }
    setIsSubmitting(true);
    setNotice(null);
    previewTimerRef.current = window.setTimeout(() => {
      previewTimerRef.current = null;
      transitionTo(nextView, nextNotice);
    }, 260);
  };

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  };

  const handleSignInSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: FieldErrors = {};
    if (!validateEmail(email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!password) {
      nextErrors.password = "Enter your password to continue.";
    }
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }
    runPreview("otp", authFixtures.notices.signIn);
  };

  const handleRegisterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: FieldErrors = {};
    if (name.trim().length < 2) {
      nextErrors.name = "Enter your full name.";
    }
    if (!validateEmail(email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (password.length < 8) {
      nextErrors.password = "Use at least 8 characters for your password.";
    }
    if (!termsAccepted) {
      nextErrors.terms = "Accept the account and privacy terms to continue.";
    }
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }
    runPreview("otp", authFixtures.notices.register);
  };

  const handleRecoverySubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: FieldErrors = {};
    if (!validateEmail(email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }
    runPreview("recovery-sent", authFixtures.notices.recovery);
  };

  const handleOtpSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!code.trim()) {
      setFieldErrors({ code: "Enter the code from the approved message." });
      return;
    }
    setFieldErrors({});
    runPreview("otp", authFixtures.notices.otp);
  };

  const handleChallengeSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!code.trim()) {
      setFieldErrors({ code: "Enter the code from your approved factor." });
      return;
    }
    setFieldErrors({});
    const mode = view === "step-up" ? "step-up" : "mfa";
    runPreview(mode, authFixtures.notices.mfa);
  };

  const handleGoogleEntry = () => {
    runPreview("oidc", {
      tone: "info",
      title: "Google handoff previewed",
      message:
        "The backend starts OIDC, validates state and nonce, and returns a safe session outcome.",
    });
  };

  const handleResend = () => {
    if (resendSeconds > 0) {
      return;
    }
    setResendSeconds(authFixtures.otp.resendCooldownSeconds);
    setNotice(authFixtures.notices.resend);
  };

  const handlePreviewError = () => {
    transitionTo("sign-in", {
      tone: "error",
      title: "We couldn't sign you in",
      message: authFixtures.errors.signIn,
    });
  };

  const handleRecovery = () => transitionTo("recovery");
  const handleSignIn = () => transitionTo("sign-in");
  const handleSession = () => transitionTo("session");

  const renderCurrentView = () => {
    switch (view) {
      case "sign-in":
        return (
          <SignInForm
            email={email}
            password={password}
            passwordVisible={passwordVisible}
            fieldErrors={fieldErrors}
            isSubmitting={isSubmitting}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onPasswordVisibilityChange={() => setPasswordVisible((current) => !current)}
            onSubmit={handleSignInSubmit}
            onGoogle={handleGoogleEntry}
            onRecovery={handleRecovery}
            onRegister={() => transitionTo("register")}
          />
        );
      case "register":
        return (
          <RegisterForm
            name={name}
            email={email}
            password={password}
            passwordVisible={passwordVisible}
            termsAccepted={termsAccepted}
            fieldErrors={fieldErrors}
            isSubmitting={isSubmitting}
            onNameChange={setName}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onPasswordVisibilityChange={() => setPasswordVisible((current) => !current)}
            onTermsChange={setTermsAccepted}
            onSubmit={handleRegisterSubmit}
            onGoogle={handleGoogleEntry}
            onSignIn={handleSignIn}
          />
        );
      case "recovery":
        return (
          <RecoveryForm
            email={email}
            fieldErrors={fieldErrors}
            isSubmitting={isSubmitting}
            onEmailChange={setEmail}
            onSubmit={handleRecoverySubmit}
            onSignIn={handleSignIn}
          />
        );
      case "recovery-sent":
        return (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col items-center gap-4 py-3 text-center">
              <div className="grid size-14 place-items-center rounded-full bg-secondary text-secondary-foreground">
                <Mail aria-hidden="true" className="size-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold">If eligible, check your inbox</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Recovery links expire after {authFixtures.session.recoveryWindow}.
                  The response does not reveal whether an account exists.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleResend}
              disabled={resendSeconds > 0}
            >
              {resendSeconds > 0 ? `Request another in ${resendSeconds}s` : "Request another link"}
            </Button>
            <button
              type="button"
              onClick={handleSignIn}
              className="mx-auto w-fit rounded-sm text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Return to sign in
            </button>
          </div>
        );
      case "otp":
        return (
          <OtpForm
            code={code}
            fieldErrors={fieldErrors}
            isSubmitting={isSubmitting}
            resendSeconds={resendSeconds}
            onCodeChange={setCode}
            onSubmit={handleOtpSubmit}
            onResend={handleResend}
            onSignIn={handleSignIn}
          />
        );
      case "mfa":
      case "step-up":
        return (
          <ChallengeForm
            mode={view}
            code={code}
            fieldErrors={fieldErrors}
            isSubmitting={isSubmitting}
            onCodeChange={setCode}
            onSubmit={handleChallengeSubmit}
            onRecovery={handleRecovery}
            onSession={handleSession}
          />
        );
      case "oidc":
        return (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col items-center gap-4 py-3 text-center">
              <div className="grid size-14 place-items-center rounded-full bg-secondary text-secondary-foreground">
                <Globe2 aria-hidden="true" className="size-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold">Provider handoff stays server-side</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  KROWDS will start the configured Google OIDC flow from the backend.
                  The browser does not receive a provider token.
                </p>
              </div>
            </div>
            <Button
              type="button"
              className="w-full"
              onClick={() => transitionTo("account-linking", authFixtures.notices.accountLink)}
            >
              Preview account conflict
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={handleSignIn}>
              Use email sign-in instead
            </Button>
          </div>
        );
      case "account-linking":
        return (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col items-center gap-4 py-3 text-center">
              <div className="grid size-14 place-items-center rounded-full bg-secondary text-secondary-foreground">
                <KeyRound aria-hidden="true" className="size-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold">Choose a safe next step</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  KROWDS will not merge accounts or link a provider identity from
                  an email match alone. Continue only with an explicit choice.
                </p>
              </div>
            </div>
            <Button type="button" className="w-full" onClick={handleSignIn}>
              Continue with email sign-in
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={() => transitionTo("oidc")}>
              Choose a different Google account
            </Button>
          </div>
        );
      case "session":
        return (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground">
                <UserRound aria-hidden="true" className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{authFixtures.account.displayName}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {authFixtures.account.destinationHint}
                </p>
              </div>
              <Badge variant="outline" className="ml-auto shrink-0">
                Preview
              </Badge>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-2">
                <ShieldCheck aria-hidden="true" className="size-4 text-foreground" />
                <p className="text-sm font-medium">Session outcome from backend</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                This fixture only shows the result shape. Access lasts for the
                configured window and the backend remains the authority.
              </p>
              <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Access</dt>
                  <dd className="mt-1 font-medium">{authFixtures.session.accessWindow}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Refresh</dt>
                  <dd className="mt-1 font-medium">{authFixtures.session.refreshWindow}</dd>
                </div>
              </dl>
            </div>
            <Button
              type="button"
              className="w-full"
              onClick={() => transitionTo("step-up")}
            >
              Preview step-up challenge
              <Fingerprint data-icon="inline-start" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => transitionTo("signed-out", authFixtures.notices.signedOut)}
            >
              <LogOut data-icon="inline-start" aria-hidden="true" />
              Sign out
            </Button>
          </div>
        );
      case "session-expired":
        return (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col items-center gap-4 py-3 text-center">
              <div className="grid size-14 place-items-center rounded-full bg-secondary text-secondary-foreground">
                <LockKeyhole aria-hidden="true" className="size-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold">A fresh sign-in is required</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  The backend owns session expiry and revocation. Nothing is
                  granted by this local preview.
                </p>
              </div>
            </div>
            <Button type="button" className="w-full" onClick={handleSignIn}>
              Sign in again
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={handleRecovery}>
              Use account recovery
            </Button>
          </div>
        );
      case "signed-out":
        return (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col items-center gap-4 py-3 text-center">
              <div className="grid size-14 place-items-center rounded-full bg-secondary text-secondary-foreground">
                <Check aria-hidden="true" className="size-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold">Your session is closed</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  The backend revokes the current session and rotating refresh
                  credential when sign-out is requested.
                </p>
              </div>
            </div>
            <Button type="button" className="w-full" onClick={handleSignIn}>
              Return to sign in
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Button>
          </div>
        );
    }
  };

  const meta = viewMeta[view];

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto grid min-h-dvh w-full max-w-[1440px] lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
        <Aside />

        <div className="flex min-h-dvh min-w-0 flex-col px-5 py-6 sm:px-8 lg:px-12 xl:px-20">
          <header className="flex items-center justify-between gap-4">
            <div className="lg:hidden">
              <KrowdsBrand />
            </div>
            <div className="hidden lg:block" aria-hidden="true" />
            <div className="flex items-center gap-3">
              <Badge variant="outline">{authFixtures.mode}</Badge>
              <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
                localhost:3001
              </span>
            </div>
          </header>

          <div className="flex flex-1 items-center justify-center py-10 lg:py-16">
            <div className="w-full max-w-[36rem]">
              <div className="mb-8 max-w-xl">
                <h1
                  id="auth-page-title"
                  className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl"
                >
                  Access your KROWDS account.
                </h1>
                <p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground">
                  One clear surface for sign-in, recovery, and the security
                  steps that keep your account in your hands.
                </p>
              </div>

              <StateSwitcher currentView={view} onSelect={transitionTo} />

              <Card className="ring-1 ring-foreground/10">
                <CardHeader className="border-b border-border">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2
                        ref={cardHeadingRef}
                        id="auth-card-title"
                        tabIndex={-1}
                        className="font-heading text-xl font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                      >
                        {meta.title}
                      </h2>
                      <CardDescription className="mt-2 max-w-md leading-6">
                        {meta.description}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {meta.badge}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-5">
                  {notice ? <Notice notice={notice} /> : null}
                  {renderCurrentView()}
                </CardContent>
                <CardFooter className="items-start gap-3 bg-muted/40">
                  <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-foreground" />
                  <p className="text-xs leading-5 text-muted-foreground">
                    {authFixtures.securityCopy}
                  </p>
                </CardFooter>
              </Card>

              <p className="mt-5 text-center text-xs leading-5 text-muted-foreground">
                Local fixture only. No network calls, secrets, readable OTPs, or
                authorization decisions are made here.
              </p>
              <button
                type="button"
                onClick={handlePreviewError}
                className="mx-auto mt-3 rounded-sm text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Preview generic account error
              </button>
            </div>
          </div>

          <footer className="flex flex-col gap-2 border-t border-border pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>KROWDS frontend monorepo</span>
            <span>Backend authority: services/cmd/server</span>
          </footer>
        </div>
      </div>
    </main>
  );
}
