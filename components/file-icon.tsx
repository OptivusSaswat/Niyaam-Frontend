import { File, Folder, FileText, Image as ImageIcon, FileCode2, FileSpreadsheet, FileArchive } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileIconProps {
  type: 'file' | 'folder';
  extension?: string;
  className?: string;
}

export function FileIcon({ type, extension, className }: FileIconProps) {
  if (type === 'folder') {
    return <Folder className={cn("text-emerald-500 fill-emerald-500/20", className)} />;
  }

  switch (extension?.toLowerCase()) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'svg':
      return <ImageIcon className={cn("text-purple-500 dark:text-purple-400", className)} />;
    case 'pdf':
      return <FileText className={cn("text-red-500 dark:text-red-400", className)} />;
    case 'xlsx':
    case 'csv':
      return <FileSpreadsheet className={cn("text-emerald-600 dark:text-emerald-400", className)} />;
    case 'tsx':
    case 'ts':
    case 'js':
    case 'jsx':
    case 'json':
    case 'html':
    case 'css':
      return <FileCode2 className={cn("text-amber-500 dark:text-amber-400", className)} />;
    case 'zip':
    case 'tar':
    case 'gz':
      return <FileArchive className={cn("text-orange-500 dark:text-orange-400", className)} />;
    default:
      return <File className={cn("text-emerald-800/40 dark:text-emerald-100/40", className)} />;
  }
}
