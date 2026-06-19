type AuthStateCallback = (user: FirebaseAuthUser | null) => void;

export type FirebaseAuthUser = {
  uid: string;
  email: string | null;
};

let authStateCallback: AuthStateCallback | null = null;
let currentUser: FirebaseAuthUser | null = null;

export const mockAuth = {};

export const onAuthStateChanged = jest.fn(
  (_auth: unknown, callback: AuthStateCallback) => {
    authStateCallback = callback;
    callback(currentUser);
    return jest.fn(() => {
      authStateCallback = null;
    });
  }
);

export const signInWithEmailAndPassword = jest.fn();
export const createUserWithEmailAndPassword = jest.fn();
export const signOut = jest.fn();

export function resetFirebaseAuthMock(): void {
  currentUser = null;
  authStateCallback = null;
  jest.clearAllMocks();
}

export function setMockAuthUser(user: FirebaseAuthUser | null): void {
  currentUser = user;
  authStateCallback?.(user);
}

export function emitAuthStateChange(user: FirebaseAuthUser | null): void {
  currentUser = user;
  authStateCallback?.(user);
}

export function createMockFirebaseUser(
  overrides: Partial<FirebaseAuthUser> = {}
): FirebaseAuthUser {
  return {
    uid: 'user-123',
    email: 'you@example.com',
    ...overrides,
  };
}

export function createMockUserCredential(user: FirebaseAuthUser) {
  return { user };
}
