const DOMAIN = process.env.EXPO_PUBLIC_DOMAIN;
const API_PORT = process.env.EXPO_PUBLIC_API_PORT;

export const API_BASE = DOMAIN
  ? `https://${DOMAIN}/api`
  : `http://localhost:${API_PORT || 8080}/api`;

export interface SurveyQuestion {
  id: string;
  label: string;
  text: string;
  type: "scale";
  min: number;
  max: number;
}

export async function fetchQuestions(): Promise<SurveyQuestion[]> {
  const res = await fetch(`${API_BASE}/survey/questions`);
  if (!res.ok) throw new Error(`Failed to load questions: ${res.status}`);
  const data = (await res.json()) as { questions: SurveyQuestion[] };
  return data.questions;
}

export interface SubmitPayload {
  name: string;
  email: string;
  company: string;
  date: string;
  gender: string;
  ageGroup: string;
  yearsInOrganization: string;
  yearsInPosition: string;
  numberOfReports: string;
  answers: Record<string, number>;
  totalQuestions?: number;
  icNumber?: string;
  groupCode?: string | null;
  groupId?: string | null;
  phase?: "pre" | "post" | null;
  submissionType?: "individual" | "group";
}

export interface SubmitResult {
  message: string;
}

export async function submitSurvey(
  payload: SubmitPayload,
): Promise<SubmitResult> {
  const res = await fetch(`${API_BASE}/survey/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || "Submission failed");
  }
  return data as SubmitResult;
}

// ── Admin API ─────────────────────────────────────────────────────────────────

export async function adminFetch<T>(
  path: string,
  token: string | null,
  options?: { method?: string; body?: unknown },
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: options?.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body:
      options?.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
  const raw = await res.text();
  const data = raw ? (JSON.parse(raw) as unknown) : {};
  if (!res.ok) {
    const error =
      (data as { error?: string }).error ||
      raw ||
      `Request failed: ${res.status}`;
    throw new Error(
      error,
    );
  }
  return data as T;
}

export async function adminLogin(
  username: string,
  password: string,
): Promise<{ token: string; username: string }> {
  return adminFetch("/admin/login", null, {
    method: "POST",
    body: { username, password },
  });
}

export async function adminSetup(
  username: string,
  password: string,
): Promise<void> {
  await adminFetch("/admin/setup", null, {
    method: "POST",
    body: { username, password },
  });
}
