import type { TemplateBlock } from '@/src/contexts/templateBlocks/domain/templateBlock.model';
import type { TemplateBlockRepository } from '@/src/contexts/templateBlocks/domain/templateBlock.repository';
import {
  templateBlockFromFirestore,
  templateBlockToFirestore,
} from '@/src/contexts/templateBlocks/infrastructure/templateBlock.mapper';
import { RepositoryError, requireUserId } from '@/src/contexts/shared/domain/repository.errors';
import { userCollectionPath } from '@/src/lib/firebase/paths';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  type Firestore,
} from 'firebase/firestore';

export class FirestoreTemplateBlockRepository implements TemplateBlockRepository {
  private readonly collectionPath: string;

  constructor(
    userId: string,
    private readonly db: Firestore
  ) {
    requireUserId(userId);
    this.collectionPath = userCollectionPath(userId, 'templateBlocks');
  }

  async create(block: TemplateBlock): Promise<void> {
    const docRef = doc(collection(this.db, this.collectionPath), block.id);
    await setDoc(docRef, templateBlockToFirestore(block));
  }

  async update(block: TemplateBlock): Promise<void> {
    const docRef = doc(collection(this.db, this.collectionPath), block.id);
    await setDoc(docRef, templateBlockToFirestore(block), { merge: true });
  }

  async findById(id: string): Promise<TemplateBlock | null> {
    const docRef = doc(collection(this.db, this.collectionPath), id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return null;
    }

    return templateBlockFromFirestore(
      snapshot.id,
      snapshot.data() as ReturnType<typeof templateBlockToFirestore>
    );
  }

  async listActive(): Promise<TemplateBlock[]> {
    const snapshot = await getDocs(
      query(collection(this.db, this.collectionPath), where('status', '==', 'active'))
    );

    return snapshot.docs.map((document) =>
      templateBlockFromFirestore(
        document.id,
        document.data() as ReturnType<typeof templateBlockToFirestore>
      )
    );
  }

  async listAll(): Promise<TemplateBlock[]> {
    const snapshot = await getDocs(collection(this.db, this.collectionPath));

    return snapshot.docs.map((document) =>
      templateBlockFromFirestore(
        document.id,
        document.data() as ReturnType<typeof templateBlockToFirestore>
      )
    );
  }

  async archive(id: string): Promise<void> {
    await this.updateStatus(id, 'archived');
  }

  async restore(id: string): Promise<void> {
    await this.updateStatus(id, 'active');
  }

  async setFavorite(id: string, favorite: boolean): Promise<void> {
    const docRef = doc(collection(this.db, this.collectionPath), id);
    await updateDoc(docRef, { favorite });
  }

  async hardDelete(id: string): Promise<void> {
    const docRef = doc(collection(this.db, this.collectionPath), id);
    await deleteDoc(docRef);
  }

  private async updateStatus(id: string, status: TemplateBlock['status']): Promise<void> {
    const existing = await this.findById(id);

    if (!existing) {
      throw new RepositoryError('Template block not found.', 'not_found');
    }

    await this.update({
      ...existing,
      status,
      updatedAt: new Date(),
    });
  }
}

export function createFirestoreTemplateBlockRepository(
  userId: string,
  db: Firestore
): TemplateBlockRepository {
  return new FirestoreTemplateBlockRepository(userId, db);
}
