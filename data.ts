import { FileItem } from './types';

const now = new Date().toISOString();

export const initialData: FileItem[] = [
  { id: 'root', name: 'Home', type: 'folder', parentId: null, updatedAt: now },
  { id: '1', name: 'Documents', type: 'folder', parentId: 'root', updatedAt: now },
  { id: '2', name: 'Images', type: 'folder', parentId: 'root', updatedAt: now },
  { id: '3', name: 'Projects', type: 'folder', parentId: 'root', updatedAt: now },
  { id: '4', name: 'Work', type: 'folder', parentId: '1', updatedAt: now },
  { id: '5', name: 'Personal', type: 'folder', parentId: '1', updatedAt: now },
  { id: '6', name: 'resume_2024.pdf', type: 'file', parentId: '1', size: 1024 * 1024 * 2.5, updatedAt: now, extension: 'pdf' },
  { id: '7', name: 'vacation.jpg', type: 'file', parentId: '2', size: 1024 * 1024 * 4.2, updatedAt: now, extension: 'jpg' },
  { id: '8', name: 'avatar.png', type: 'file', parentId: '2', size: 1024 * 500, updatedAt: now, extension: 'png' },
  { id: '9', name: 'Q1_Report.xlsx', type: 'file', parentId: '4', size: 1024 * 1024 * 1.2, updatedAt: now, extension: 'xlsx' },
  { id: '10', name: 'presentation.pptx', type: 'file', parentId: '4', size: 1024 * 1024 * 5.5, updatedAt: now, extension: 'pptx' },
  { id: '11', name: 'index.tsx', type: 'file', parentId: '3', size: 1024 * 4, updatedAt: now, extension: 'tsx' },
  { id: '12', name: 'styles.css', type: 'file', parentId: '3', size: 1024 * 8, updatedAt: now, extension: 'css' },
  { id: '13', name: 'package.json', type: 'file', parentId: '3', size: 1024 * 2, updatedAt: now, extension: 'json' },
];