"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Home, Edit2, Trash2, Plus, X, Search, Folder as FolderIcon, Sun, Moon, LayoutGrid, List, ArrowDown, ArrowUp, Calendar, HardDrive, Download } from 'lucide-react';
import { FileItem, SortOption, ViewMode, SortDirection } from '@/types';
import { initialData } from '@/data';
import { FileIcon } from './file-icon';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

// --- Utility Functions ---
function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

// --- Main Component ---
export function FileManager() {
  // Theme
  const { theme, setTheme } = useTheme();
  
  // State
  const [items, setItems] = useState<FileItem[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string>('root');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  // View & Sort State
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortOption, setSortOption] = useState<SortOption>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Modals State
  const [itemToRename, setItemToRename] = useState<FileItem | null>(null);
  const [newName, setNewName] = useState('');
  const [itemToDelete, setItemToDelete] = useState<FileItem | null>(null);
  const [previewItem, setPreviewItem] = useState<FileItem | null>(null);

  // Initialize from localStorage or mock data
  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem('fileManagerData');
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch (e) {
        setItems(initialData);
      }
    } else {
      setItems(initialData);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('fileManagerData', JSON.stringify(items));
    }
  }, [items, isMounted]);

  // Derived State
  const currentFolder = useMemo(() => items.find(i => i.id === currentFolderId), [items, currentFolderId]);
  
  const breadcrumbs = useMemo(() => {
    const crumbs: FileItem[] = [];
    let current = currentFolder;
    while (current) {
      crumbs.unshift(current);
      current = items.find(i => i.id === current.parentId);
    }
    return crumbs;
  }, [items, currentFolder]);

  const displayedItems = useMemo(() => {
    let filtered = items.filter(i => i.parentId === currentFolderId);
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = items.filter(i => i.name.toLowerCase().includes(query) && i.id !== 'root');
    }

    return filtered.sort((a, b) => {
      // Folders always first
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }

      let comparison = 0;
      if (sortOption === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortOption === 'date') {
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      } else if (sortOption === 'size') {
        comparison = (a.size || 0) - (b.size || 0);
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [items, currentFolderId, searchQuery, sortOption, sortDirection]);

  const allFolders = useMemo(() => items.filter(i => i.type === 'folder'), [items]);

  // Handlers
  const handleNavigate = (folderId: string) => {
    setCurrentFolderId(folderId);
    setSearchQuery('');
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemToRename || !newName.trim()) return;

    setItems(prev => prev.map(item => {
      if (item.id === itemToRename.id) {
        let finalName = newName.trim();
        // Keep extension if it's a file and the user didn't type it
        if (item.type === 'file' && item.extension && !finalName.includes('.')) {
          finalName = `${finalName}.${item.extension}`;
        }
        return { ...item, name: finalName, updatedAt: new Date().toISOString() };
      }
      return item;
    }));
    setItemToRename(null);
    setNewName('');
  };

  const handleDeleteConfirm = () => {
    if (!itemToDelete) return;

    const getChildrenIds = (parentId: string): string[] => {
      const children = items.filter(i => i.parentId === parentId);
      let ids = children.map(c => c.id);
      children.forEach(c => {
        if (c.type === 'folder') {
          ids = [...ids, ...getChildrenIds(c.id)];
        }
      });
      return ids;
    };

    const idsToDelete = [itemToDelete.id, ...getChildrenIds(itemToDelete.id)];

    setItems(prev => prev.filter(item => !idsToDelete.includes(item.id)));
    setItemToDelete(null);
  };

  const handleCreateFolder = () => {
    const newFolder: FileItem = {
      id: Date.now().toString(),
      name: 'New Folder',
      type: 'folder',
      parentId: currentFolderId,
      updatedAt: new Date().toISOString(),
    };
    setItems(prev => [...prev, newFolder]);
    setItemToRename(newFolder);
    setNewName('New Folder');
  };

  const handleCreateFile = () => {
    const extensions = ['pdf', 'jpg', 'png', 'docx', 'xlsx', 'txt', 'tsx', 'css'];
    const ext = extensions[Math.floor(Math.random() * extensions.length)];
    const newFile: FileItem = {
      id: Date.now().toString(),
      name: `New_File.${ext}`,
      type: 'file',
      parentId: currentFolderId,
      size: Math.floor(Math.random() * 5000000) + 10000,
      updatedAt: new Date().toISOString(),
      extension: ext,
    };
    setItems(prev => [...prev, newFile]);
    setItemToRename(newFile);
    setNewName(newFile.name);
  };

  const cycleSort = () => {
    if (sortOption === 'name') setSortOption('date');
    else if (sortOption === 'date') setSortOption('size');
    else setSortOption('name');
  };

  const toggleDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  if (!isMounted) return null;

  return (
    <div className="flex h-[800px] max-h-[80vh] w-full bg-white/50 dark:bg-[#05130C]/70 backdrop-blur-3xl border border-emerald-500/20 dark:border-emerald-400/20 rounded-[2rem] overflow-hidden shadow-[0_8px_32px_rgba(16,185,129,0.15)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
      
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-emerald-500/20 bg-white/30 dark:bg-black/30 flex flex-col">
        <div className="p-6 border-b border-emerald-500/20">
          <div className="flex items-center gap-3 text-emerald-950 dark:text-emerald-50">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center shadow-inner border border-emerald-500/30">
              <FolderIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="font-bold tracking-tight text-lg">GreenDrive</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <div className="text-xs font-bold text-emerald-800/50 dark:text-emerald-400/50 uppercase tracking-wider mb-3 px-3">
            Quick Access
          </div>
          {allFolders.filter(f => f.parentId === 'root' || f.id === 'root').map(folder => (
            <button
              key={folder.id}
              onClick={() => handleNavigate(folder.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                currentFolderId === folder.id 
                  ? "bg-emerald-500/20 text-emerald-900 dark:text-emerald-50 shadow-sm border border-emerald-500/20" 
                  : "text-emerald-700/70 dark:text-emerald-100/60 hover:bg-emerald-500/10 hover:text-emerald-900 dark:hover:text-emerald-50"
              )}
            >
              <FileIcon type="folder" className="w-4 h-4" />
              <span className="truncate">{folder.name}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-transparent">
        
        {/* Top Bar */}
        <header className="h-20 px-6 flex items-center justify-between border-b border-emerald-500/20 bg-white/40 dark:bg-black/20 backdrop-blur-xl sticky top-0 z-10">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar bg-white/40 dark:bg-[#0A1A12]/60 p-1.5 rounded-2xl border border-emerald-500/20 shadow-inner">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.id}>
                {index > 0 && <ChevronRight className="w-4 h-4 text-emerald-800/40 dark:text-emerald-100/40 flex-shrink-0" />}
                <button
                  onClick={() => handleNavigate(crumb.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-200 truncate max-w-[150px]",
                    index === breadcrumbs.length - 1 
                      ? "bg-emerald-500/20 text-emerald-950 dark:text-emerald-50 font-bold shadow-sm border border-emerald-500/20" 
                      : "text-emerald-800/70 dark:text-emerald-100/70 hover:bg-emerald-500/10 hover:text-emerald-900 dark:hover:text-emerald-100"
                  )}
                >
                  {crumb.id === 'root' ? <Home className="w-4 h-4" /> : crumb.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            
            {/* Search */}
            <div className="relative group hidden lg:block">
              <Search className="w-4 h-4 text-emerald-800/40 dark:text-emerald-100/40 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400 transition-colors" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 xl:w-64 bg-white/50 dark:bg-black/40 border border-emerald-500/20 rounded-xl py-2 pl-10 pr-4 text-sm text-emerald-950 dark:text-emerald-50 placeholder:text-emerald-800/40 dark:placeholder:text-emerald-100/40 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner"
              />
            </div>

            {/* Sort Controls */}
            <div className="flex items-center bg-white/50 dark:bg-black/40 border border-emerald-500/20 rounded-xl p-1 shadow-sm">
              <button 
                onClick={cycleSort} 
                className="px-3 py-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-800 dark:text-emerald-100 transition-all flex items-center gap-1.5 w-20 justify-center" 
                title={`Sort by ${sortOption}`}
              >
                {sortOption === 'name' && <><span className="font-bold text-xs">A-Z</span></>}
                {sortOption === 'date' && <><Calendar className="w-3.5 h-3.5" /><span className="text-xs font-semibold">Date</span></>}
                {sortOption === 'size' && <><HardDrive className="w-3.5 h-3.5" /><span className="text-xs font-semibold">Size</span></>}
              </button>
              <div className="w-px h-4 bg-emerald-500/20 mx-1" />
              <button 
                onClick={toggleDirection} 
                className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-800 dark:text-emerald-100 transition-all" 
                title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
              >
                {sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              </button>
            </div>

            {/* View Mode */}
            <div className="flex items-center bg-white/50 dark:bg-black/40 border border-emerald-500/20 rounded-xl p-1 shadow-sm">
              <button onClick={() => setViewMode('grid')} className={cn("p-1.5 rounded-lg transition-all", viewMode === 'grid' ? "bg-emerald-500/20 text-emerald-900 dark:text-emerald-50" : "text-emerald-800/50 dark:text-emerald-100/50 hover:text-emerald-900 dark:hover:text-emerald-100")}>
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('list')} className={cn("p-1.5 rounded-lg transition-all", viewMode === 'list' ? "bg-emerald-500/20 text-emerald-900 dark:text-emerald-50" : "text-emerald-800/50 dark:text-emerald-100/50 hover:text-emerald-900 dark:hover:text-emerald-100")}>
                <List className="w-4 h-4" />
              </button>
            </div>
            
            {/* Theme Switcher */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 rounded-xl bg-white/50 dark:bg-black/40 border border-emerald-500/20 text-emerald-800 dark:text-emerald-100 hover:bg-emerald-500/10 transition-all shadow-sm"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Create Actions */}
            <div className="flex items-center gap-1 bg-white/50 dark:bg-black/40 border border-emerald-500/20 p-1 rounded-xl shadow-sm">
              <button 
                onClick={handleCreateFile}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-transparent hover:bg-emerald-500/10 text-emerald-800 dark:text-emerald-100 text-sm font-semibold rounded-lg transition-all"
                title="New File"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden xl:inline">File</span>
              </button>
              <div className="w-px h-4 bg-emerald-500/20" />
              <button 
                onClick={handleCreateFolder}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                title="New Folder"
              >
                <FolderIcon className="w-4 h-4" />
                <span className="hidden xl:inline">Folder</span>
              </button>
            </div>
          </div>
        </header>

        {/* Grid/List Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {displayedItems.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
              className="h-full flex flex-col items-center justify-center text-center space-y-4"
            >
              <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center shadow-inner border border-emerald-500/20">
                <FolderIcon className="w-12 h-12 text-emerald-600/50 dark:text-emerald-400/50" />
              </div>
              <div>
                <h3 className="text-emerald-950 dark:text-emerald-50 font-bold text-xl">This folder is empty</h3>
                <p className="text-emerald-800/60 dark:text-emerald-100/60 text-sm mt-2 max-w-xs mx-auto">Drag and drop files here or create a new folder to get started.</p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              layout 
              className={cn(
                "w-full",
                viewMode === 'grid' 
                  ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 auto-rows-max"
                  : "flex flex-col gap-2"
              )}
            >
              <AnimatePresence mode="popLayout">
                {displayedItems.map((item) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                    transition={{ duration: 0.25, type: "spring", bounce: 0.3 }}
                    key={item.id}
                    className={cn(
                      "group relative bg-white/50 dark:bg-[#0A1A12]/60 backdrop-blur-xl border border-emerald-500/20 hover:border-emerald-400/40 rounded-2xl transition-all duration-300 hover:shadow-[0_8px_30px_rgba(16,185,129,0.2)] dark:hover:shadow-[0_8px_30px_rgba(16,185,129,0.15)] cursor-pointer overflow-hidden",
                      viewMode === 'grid' ? "p-4 flex flex-col hover:-translate-y-1" : "p-3 flex items-center gap-4 hover:translate-x-1"
                    )}
                    onClick={() => item.type === 'folder' ? handleNavigate(item.id) : setPreviewItem(item)}
                  >
                    {/* Action Menu (Hover) */}
                    <div className={cn(
                      "absolute opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white/90 dark:bg-[#141414]/90 backdrop-blur-md rounded-lg p-1 border border-emerald-500/20 shadow-xl z-10",
                      viewMode === 'grid' ? "top-3 right-3" : "right-4 top-1/2 -translate-y-1/2"
                    )}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setItemToRename(item); setNewName(item.name); }}
                        className="p-1.5 text-emerald-800/60 dark:text-emerald-100/60 hover:text-emerald-900 dark:hover:text-emerald-50 hover:bg-emerald-500/10 rounded-md transition-colors"
                        title="Rename"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setItemToDelete(item); }}
                        className="p-1.5 text-red-500/70 hover:text-red-600 dark:text-red-400/70 dark:hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {viewMode === 'grid' ? (
                      <>
                        <div className="flex-1 flex flex-col items-center justify-center py-6 gap-4">
                          <FileIcon type={item.type} extension={item.extension} className="w-14 h-14 transition-transform group-hover:scale-110 duration-300 drop-shadow-md" />
                        </div>
                        <div className="mt-auto pt-4 border-t border-emerald-500/10">
                          <h4 className="text-sm font-semibold text-emerald-950 dark:text-emerald-50 truncate text-center" title={item.name}>
                            {item.name}
                          </h4>
                          <div className="flex items-center justify-between mt-1.5 text-[11px] font-medium text-emerald-800/50 dark:text-emerald-100/50">
                            <span>{formatDate(item.updatedAt)}</span>
                            {item.size && <span>{formatBytes(item.size)}</span>}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <FileIcon type={item.type} extension={item.extension} className="w-10 h-10 flex-shrink-0 transition-transform group-hover:scale-110 duration-300" />
                        <div className="flex-1 min-w-0 flex items-center justify-between pr-20">
                          <h4 className="text-sm font-semibold text-emerald-950 dark:text-emerald-50 truncate w-1/3" title={item.name}>
                            {item.name}
                          </h4>
                          <span className="text-xs font-medium text-emerald-800/50 dark:text-emerald-100/50 w-1/4 text-left">
                            {formatDate(item.updatedAt)}
                          </span>
                          <span className="text-xs font-medium text-emerald-800/50 dark:text-emerald-100/50 w-1/4 text-right">
                            {item.size ? formatBytes(item.size) : '--'}
                          </span>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </main>

      {/* Rename Modal */}
      <AnimatePresence>
        {itemToRename && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 dark:bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white/90 dark:bg-[#0A1A12]/90 backdrop-blur-2xl border border-emerald-500/20 rounded-3xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-emerald-950 dark:text-emerald-50">Rename {itemToRename.type}</h3>
                <button onClick={() => setItemToRename(null)} className="text-emerald-800/40 dark:text-emerald-100/40 hover:text-emerald-900 dark:hover:text-emerald-50 transition-colors bg-emerald-500/5 p-2 rounded-full">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleRenameSubmit}>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  autoFocus
                  className="w-full bg-white/50 dark:bg-black/50 border border-emerald-500/20 rounded-xl px-4 py-3 text-emerald-950 dark:text-emerald-50 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all mb-6 shadow-inner"
                />
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setItemToRename(null)}
                    className="px-5 py-2.5 text-sm font-semibold text-emerald-800/70 dark:text-emerald-100/70 hover:text-emerald-950 dark:hover:text-emerald-50 hover:bg-emerald-500/10 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newName.trim() || newName === itemToRename.name}
                    className="px-5 py-2.5 text-sm font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {itemToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 dark:bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white/90 dark:bg-[#0A1A12]/90 backdrop-blur-2xl border border-emerald-500/20 rounded-3xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center flex-shrink-0 border border-red-500/20">
                  <Trash2 className="w-7 h-7 text-red-500 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-emerald-950 dark:text-emerald-50">Delete {itemToDelete.type}?</h3>
                  <p className="text-sm text-emerald-800/60 dark:text-emerald-100/60 mt-1 leading-relaxed">
                    Are you sure you want to delete "{itemToDelete.name}"? This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setItemToDelete(null)}
                  className="px-5 py-2.5 text-sm font-semibold text-emerald-800/70 dark:text-emerald-100/70 hover:text-emerald-950 dark:hover:text-emerald-50 hover:bg-emerald-500/10 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-5 py-2.5 text-sm font-semibold bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                >
                  Delete Permanently
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 dark:bg-black/60 backdrop-blur-md" onClick={() => setPreviewItem(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/90 dark:bg-[#0A1A12]/90 backdrop-blur-2xl border border-emerald-500/20 rounded-3xl p-6 w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <FileIcon type={previewItem.type} extension={previewItem.extension} className="w-8 h-8" />
                  <div>
                    <h3 className="text-lg font-bold text-emerald-950 dark:text-emerald-50">{previewItem.name}</h3>
                    <p className="text-xs text-emerald-800/60 dark:text-emerald-100/60">{formatBytes(previewItem.size || 0)} • {formatDate(previewItem.updatedAt)}</p>
                  </div>
                </div>
                <button onClick={() => setPreviewItem(null)} className="text-emerald-800/40 dark:text-emerald-100/40 hover:text-emerald-900 dark:hover:text-emerald-50 transition-colors bg-emerald-500/5 p-2 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 bg-emerald-500/5 dark:bg-black/40 border border-emerald-500/10 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
                <FileIcon type={previewItem.type} extension={previewItem.extension} className="w-32 h-32 mb-6 opacity-90 drop-shadow-2xl" />
                <h4 className="text-xl font-bold text-emerald-950 dark:text-emerald-50 mb-2">{previewItem.name}</h4>
                <p className="text-emerald-800/60 dark:text-emerald-100/60 text-sm font-medium mb-8">Preview not available for this file type.</p>
                <button className="relative group px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-white/20 to-emerald-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <span className="relative flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Download File
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
