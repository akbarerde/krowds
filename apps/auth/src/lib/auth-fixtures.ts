export type AuthView =
  | "sign-in"
  | "register"
  | "recovery"
  | "recovery-sent"
  | "otp"
  | "mfa"
  | "step-up"
  | "oidc"
  | "account-linking"
  | "session"
  | "session-expired"
  | "signed-out";

export type AuthNoticeTone = "info" | "success" | "error";

export type AuthNotice = {
  tone: AuthNoticeTone;
  title: string;
  message: string;
};

type AuthViewOption = {
  id: AuthView;
  label: string;
  hint: string;
};

export const authFixtures = {
  mode: "Local UI fixture" as const,
  backendAuthority: "the Go + Gin backend",
  securityCopy:
    "The backend decides identity, session validity, challenges, MFA, account state, and authorization. This preview makes no provider, token, or role decisions.",
  otp: {
    destinationHint: "m••••@example.com",
    resendCooldownSeconds: 60,
    challengeLifetime: "15 minutes",
    failedAttemptLimit: "5 attempts",
  },
  session: {
    accessWindow: "15 minutes",
    refreshWindow: "30 days",
    recoveryWindow: "24 hours",
  },
  account: {
    displayName: "Demo member",
    destinationHint: "m••••@example.com",
  },
  errors: {
    signIn:
      "We couldn't sign you in with those details. Check your email and password and try again.",
    register:
      "We couldn't create an account with those details. Check the fields and try again.",
    recovery:
      "We couldn't start recovery right now. Check the address and try again.",
    otp:
      "That code couldn't be verified. Check it and try again, or request a new code.",
    mfa:
      "We couldn't verify that factor. Try again or use an approved recovery method.",
    stepUp:
      "We couldn't complete the step-up check. Try again or return to the account.",
  },
  notices: {
    signIn: {
      tone: "info" as const,
      title: "Previewing the next secure step",
      message:
        "The backend will decide whether a challenge or another factor is required.",
    },
    register: {
      tone: "info" as const,
      title: "Verification request previewed",
      message:
        "If the backend accepts this registration, it will send the approved verification message.",
    },
    recovery: {
      tone: "info" as const,
      title: "Recovery request previewed",
      message:
        "If the address is eligible, the backend will send a short-lived recovery link.",
    },
    otp: {
      tone: "success" as const,
      title: "Code check previewed",
      message:
        "The backend remains responsible for accepting or rejecting the challenge.",
    },
    mfa: {
      tone: "success" as const,
      title: "Second factor previewed",
      message:
        "The backend will determine whether this factor satisfies the current requirement.",
    },
    resend: {
      tone: "info" as const,
      title: "Resend request previewed",
      message:
        "The backend will apply destination, account, and network rate limits.",
    },
    signedOut: {
      tone: "success" as const,
      title: "You are signed out",
      message:
        "The backend revokes the session and rotates credentials immediately when sign-out is requested.",
    },
    accountLink: {
      tone: "info" as const,
      title: "No account was changed",
      message:
        "A provider identity can only continue after the backend verifies the account and you confirm the action.",
    },
  },
} as const;

export const authViewOptions: AuthViewOption[] = [
  {
    id: "sign-in",
    label: "Sign in",
    hint: "Email and password",
  },
  {
    id: "register",
    label: "Create account",
    hint: "Registration and verification",
  },
  {
    id: "recovery",
    label: "Recovery",
    hint: "Request a reset link",
  },
  {
    id: "otp",
    label: "OTP challenge",
    hint: "Verify and resend",
  },
  {
    id: "mfa",
    label: "MFA challenge",
    hint: "Second factor",
  },
  {
    id: "step-up",
    label: "Step-up",
    hint: "Fresh second factor",
  },
  {
    id: "oidc",
    label: "Google OIDC",
    hint: "Backend-managed handoff",
  },
  {
    id: "account-linking",
    label: "Account conflict",
    hint: "No silent linking",
  },
  {
    id: "session",
    label: "Session preview",
    hint: "Sign-out and step-up",
  },
  {
    id: "session-expired",
    label: "Session expired",
    hint: "Safe recovery path",
  },
  {
    id: "signed-out",
    label: "Signed out",
    hint: "Immediate revocation copy",
  },
];
