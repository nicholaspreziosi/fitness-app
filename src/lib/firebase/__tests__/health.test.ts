import { checkFirebaseConnection } from '@/src/lib/firebase/health';

const mockGetDocs = jest.fn();
const mockCollection = jest.fn();
const mockQuery = jest.fn();
const mockLimit = jest.fn();

jest.mock('firebase/firestore', () => ({
  collection: (...args: unknown[]) => mockCollection(...args),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
  limit: (...args: unknown[]) => mockLimit(...args),
  query: (...args: unknown[]) => mockQuery(...args),
}));

jest.mock('@/src/lib/firebase/config', () => ({
  getFirebaseConfig: jest.fn(),
}));

jest.mock('@/src/lib/firebase/app', () => ({
  getFirebaseApp: jest.fn(),
  getFirestoreDb: jest.fn(),
}));

import { getFirebaseApp, getFirestoreDb } from '@/src/lib/firebase/app';
import { getFirebaseConfig } from '@/src/lib/firebase/config';

describe('checkFirebaseConnection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLimit.mockReturnValue('limit-1');
    mockQuery.mockImplementation((...args) => args);
    mockGetDocs.mockResolvedValue({ empty: true });
    (getFirebaseConfig as jest.Mock).mockReturnValue({ projectId: 'demo-project' });
    (getFirebaseApp as jest.Mock).mockReturnValue({});
    (getFirestoreDb as jest.Mock).mockReturnValue({});
  });

  it('returns missing_config when Firebase env is not set', async () => {
    (getFirebaseConfig as jest.Mock).mockReturnValue(null);

    await expect(checkFirebaseConnection('user-1')).resolves.toEqual({
      status: 'missing_config',
    });
  });

  it('queries the authenticated user exercises collection', async () => {
    const db = { id: 'db' };

    (getFirestoreDb as jest.Mock).mockReturnValue(db);

    await expect(checkFirebaseConnection('user-1')).resolves.toEqual({
      status: 'connected',
      projectId: 'demo-project',
    });

    expect(mockCollection).toHaveBeenCalledWith(db, 'users', 'user-1', 'exercises');
    expect(mockLimit).toHaveBeenCalledWith(1);
    expect(mockGetDocs).toHaveBeenCalled();
  });

  it('skips Firestore reads when no user id is provided', async () => {
    await expect(checkFirebaseConnection()).resolves.toEqual({
      status: 'connected',
      projectId: 'demo-project',
    });

    expect(mockGetDocs).not.toHaveBeenCalled();
  });

  it('maps Firestore errors to a friendly message', async () => {
    mockGetDocs.mockRejectedValue({ code: 'permission-denied', message: 'Missing or insufficient permissions' });

    await expect(checkFirebaseConnection('user-1')).resolves.toEqual({
      status: 'error',
      message:
        'Firestore denied access. Create your Firestore database and deploy rules that allow authenticated access under users/{userId}/.',
    });
  });
});
