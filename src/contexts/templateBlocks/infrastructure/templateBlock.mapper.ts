import type { TemplateBlock } from '@/src/contexts/templateBlocks/domain/templateBlock.model';
import {
  dateToTimestamp,
  stripUndefinedFields,
  timestampToDate,
} from '@/src/contexts/shared/infrastructure/firestore.mapper';
import type { Timestamp } from 'firebase/firestore';

export type FirestoreTemplateBlockDocument = {
  name: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  status: TemplateBlock['status'];
  favorite?: boolean;
  exerciseIds: string[];
  notes?: string;
};

export function templateBlockToFirestore(
  block: TemplateBlock
): FirestoreTemplateBlockDocument {
  return stripUndefinedFields({
    name: block.name,
    createdAt: dateToTimestamp(block.createdAt),
    updatedAt: dateToTimestamp(block.updatedAt),
    status: block.status,
    favorite: block.favorite,
    exerciseIds: block.exerciseIds,
    notes: block.notes,
  });
}

export function templateBlockFromFirestore(
  id: string,
  data: FirestoreTemplateBlockDocument
): TemplateBlock {
  return {
    id,
    name: data.name,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
    status: data.status,
    favorite: data.favorite,
    exerciseIds: data.exerciseIds,
    notes: data.notes,
  };
}
