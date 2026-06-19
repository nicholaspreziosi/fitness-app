import { TemplateBlockService } from '@/src/contexts/templateBlocks/application/templateBlock.service';
import type { TemplateBlockUsageChecker } from '@/src/contexts/templateBlocks/application/templateBlock.service';
import { createTemplateBlockUsageChecker } from '@/src/contexts/templateBlocks/application/createTemplateBlockUsageChecker';
import { createFirestoreExerciseRepository } from '@/src/contexts/exercises/infrastructure/firestoreExercise.repository';
import { createFirestoreTemplateBlockRepository } from '@/src/contexts/templateBlocks/infrastructure/firestoreTemplateBlock.repository';
import { getFirestoreDb } from '@/src/lib/firebase/app';

export function createTemplateBlockService(userId: string): TemplateBlockService {
  const db = getFirestoreDb();

  if (!db) {
    throw new Error('Firestore is not configured.');
  }

  let usageChecker: TemplateBlockUsageChecker | undefined;

  const getUsageChecker = (): TemplateBlockUsageChecker => {
    if (!usageChecker) {
      usageChecker = createTemplateBlockUsageChecker(userId, db);
    }

    return usageChecker;
  };

  return new TemplateBlockService(
    createFirestoreTemplateBlockRepository(userId, db),
    createFirestoreExerciseRepository(userId, db),
    (templateBlockId) => getUsageChecker()(templateBlockId)
  );
}
