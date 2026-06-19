export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const FIREBASE_ENV_KEYS = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
] as const;

function sanitizeEnvValue(value: string): string {
  let sanitized = value.trim();

  if (
    (sanitized.startsWith('"') && sanitized.endsWith('"')) ||
    (sanitized.startsWith("'") && sanitized.endsWith("'"))
  ) {
    sanitized = sanitized.slice(1, -1).trim();
  }

  return sanitized.replace(/,$/, '');
}

export function getFirebaseConfig(): FirebaseConfig | null {
  const values = FIREBASE_ENV_KEYS.map((key) => sanitizeEnvValue(process.env[key] ?? ''));

  if (values.some((value) => value.length === 0)) {
    return null;
  }

  const [apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId] = values;

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  };
}

export function hasFirebaseConfig(): boolean {
  return getFirebaseConfig() !== null;
}
