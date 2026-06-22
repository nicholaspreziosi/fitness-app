export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

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
  // Each var must be read statically so Metro inlines EXPO_PUBLIC_* at build time.
  const apiKey = sanitizeEnvValue(process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '');
  const authDomain = sanitizeEnvValue(process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '');
  const projectId = sanitizeEnvValue(process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '');
  const storageBucket = sanitizeEnvValue(process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '');
  const messagingSenderId = sanitizeEnvValue(
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? ''
  );
  const appId = sanitizeEnvValue(process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '');

  if (!apiKey || !authDomain || !projectId || !storageBucket || !messagingSenderId || !appId) {
    return null;
  }

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
