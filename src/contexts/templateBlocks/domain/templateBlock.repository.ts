import type { TemplateBlock } from '@/src/contexts/templateBlocks/domain/templateBlock.model';

export interface TemplateBlockRepository {
  create(block: TemplateBlock): Promise<void>;
  update(block: TemplateBlock): Promise<void>;
  findById(id: string): Promise<TemplateBlock | null>;
  listActive(): Promise<TemplateBlock[]>;
  listAll(): Promise<TemplateBlock[]>;
  archive(id: string): Promise<void>;
  restore(id: string): Promise<void>;
  setFavorite(id: string, favorite: boolean): Promise<void>;
  hardDelete(id: string): Promise<void>;
}
