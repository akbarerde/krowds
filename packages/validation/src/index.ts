export interface ValidationIssue {
  path: string;
  message: string;
}

export type ValidationResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      issues: ValidationIssue[];
    };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): ValidationResult<string> {
  const email = value.trim();

  if (!EMAIL_PATTERN.test(email)) {
    return {
      success: false,
      issues: [{ path: "email", message: "Invalid email format." }],
    };
  }

  return { success: true, data: email };
}

export function validateHttpUrl(value: string): ValidationResult<URL> {
  try {
    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("URL must use HTTP or HTTPS.");
    }

    return { success: true, data: url };
  } catch {
    return {
      success: false,
      issues: [{ path: "url", message: "Invalid HTTP/HTTPS URL." }],
    };
  }
}

export function validateRequiredFields<T extends Record<string, unknown>>(
  input: T,
  fields: ReadonlyArray<keyof T & string>,
): ValidationResult<T> {
  const issues = fields.flatMap((field) => {
    const value = input[field];

    if (value === undefined || value === null || value === "") {
      return [{ path: field, message: `${field} is required.` }];
    }

    return [];
  });

  if (issues.length > 0) {
    return { success: false, issues };
  }

  return { success: true, data: input };
}
