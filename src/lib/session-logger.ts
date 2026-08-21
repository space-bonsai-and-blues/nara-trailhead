import { startSession, logEvent, finalizeSession, forgetMe } from "./sessions.functions";

const CLIENT_ID_KEY = "trailhead_client_id";
const SESSION_KEY = "trailhead_session";

export type SessionCredentials = {
  sessionId: string;
  accessToken: string;
};

function generateId(): string {
  return crypto.randomUUID();
}

export function getClientId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(CLIENT_ID_KEY);
  if (!id) {
    id = generateId();
    window.localStorage.setItem(CLIENT_ID_KEY, id);
  }
  return id;
}

function setClientId(id: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CLIENT_ID_KEY, id);
}

export function getSessionCredentials(): SessionCredentials | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as SessionCredentials;
    if (parsed.sessionId && parsed.accessToken) return parsed;
    return null;
  } catch {
    return null;
  }
}

function setSessionCredentials(creds: SessionCredentials | null): void {
  if (typeof window === "undefined") return;
  if (creds) {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(creds));
  } else {
    window.sessionStorage.removeItem(SESSION_KEY);
  }
}

let startPromise: Promise<SessionCredentials> | null = null;

export async function ensureSession(): Promise<SessionCredentials | null> {
  if (typeof window === "undefined") return null;

  const existing = getSessionCredentials();
  if (existing) return existing;

  if (startPromise) return startPromise;

  startPromise = startSession({
    data: {
      clientId: getClientId(),
      userAgent: navigator.userAgent,
      appVersion: "trailhead-web",
    },
  })
    .then((creds) => {
      setSessionCredentials(creds);
      return creds;
    })
    .catch((error) => {
      console.error("Failed to start session:", error);
      return null;
    })
    .finally(() => {
      startPromise = null;
    });

  return startPromise;
}

async function sendEvent(
  type: string,
  screen: string,
  payload?: Record<string, unknown>,
  patch?: Record<string, unknown>,
): Promise<void> {
  const clientId = getClientId();
  const creds = await ensureSession();
  if (!creds) return;

  try {
    await logEvent({
      data: {
        sessionId: creds.sessionId,
        accessToken: creds.accessToken,
        clientId,
        event: { type, screen, payload },
        patch,
      },
    });
  } catch (error) {
    console.error("Session log error:", error);
  }
}

export function logButton(screen: string, button: string, payload?: Record<string, unknown>): void {
  void sendEvent("button_click", screen, { button, ...payload });
}

export function logText(screen: string, field: string, value: string): void {
  void sendEvent("text_input", screen, { field, value });
}

export function logState(screen: string, state: Record<string, unknown>): void {
  void sendEvent("state_change", screen, state);
}

export function logAI(screen: string, result: Record<string, unknown>): void {
  void sendEvent("ai_result", screen, result);
}

export function logPatch(screen: string, patch: Record<string, unknown>): void {
  void sendEvent("patch", screen, undefined, patch);
}

export async function completeSession(
  patch?: Record<string, unknown>,
  reflection?: string,
): Promise<void> {
  const clientId = getClientId();
  const creds = getSessionCredentials();
  if (!creds) return;

  try {
    await finalizeSession({
      data: {
        sessionId: creds.sessionId,
        accessToken: creds.accessToken,
        clientId,
        completed: true,
        reflection,
        patch,
      },
    });
  } catch (error) {
    console.error("Failed to finalize session:", error);
  }
}

export async function handleForgetMe(): Promise<void> {
  const clientId = getClientId();

  try {
    await forgetMe({ data: { clientId } });
  } catch (error) {
    console.error("Forget me error:", error);
  }

  setSessionCredentials(null);
  setClientId(generateId());
}
