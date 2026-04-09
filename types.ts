export type ItemType = 'file' | 'folder';

export interface FileItem {
  id: string;
  name: string;
  type: ItemType;
  parentId: string | null;
  size?: number; // in bytes
  updatedAt: string;
  extension?: string;
}

export type SortOption = 'name' | 'date' | 'size';
export type ViewMode = 'grid' | 'list';
export type SortDirection = 'asc' | 'desc';
