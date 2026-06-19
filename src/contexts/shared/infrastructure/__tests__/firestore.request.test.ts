import { mapFirestoreError, runFirestoreRequest } from '@/src/contexts/shared/infrastructure/firestore.request';
import { RepositoryError } from '@/src/contexts/shared/domain/repository.errors';

describe('runFirestoreRequest', () => {
  it('times out long-running Firestore operations', async () => {
    await expect(
      runFirestoreRequest(
        'loading exercises',
        () => new Promise(() => undefined),
        20
      )
    ).rejects.toMatchObject({
      message: expect.stringContaining('Timed out while loading exercises'),
      code: 'network',
    });
  });

  it('maps underlying Firestore errors', async () => {
    await expect(
      runFirestoreRequest('loading exercises', async () => {
        throw { code: 'permission-denied', message: 'Cloud Firestore API has not been used in project x' };
      })
    ).rejects.toMatchObject({
      code: 'missing_config',
    });
  });
});

describe('mapFirestoreError', () => {
  it('maps disabled Firestore API errors', () => {
    const error = mapFirestoreError(
      { code: 'permission-denied', message: 'Cloud Firestore API has not been used in project x' },
      'fallback'
    );

    expect(error.code).toBe('missing_config');
    expect(error.message).toContain('Firestore is not enabled');
  });

  it('preserves repository errors', () => {
    const original = new RepositoryError('Already mapped.', 'network');
    expect(mapFirestoreError(original, 'fallback')).toBe(original);
  });
});
