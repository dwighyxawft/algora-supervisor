import { useState } from 'react';
import { FileNode } from '@/lib/browserFs';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Plus, Trash2, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FileExplorerProps {
  files: FileNode[];
  onFileSelect: (path: string) => void;
  onFileCreate: (parentPath: string, name: string, isFolder: boolean) => void;
  onFileDelete: (path: string) => void;
  onFileRename: (oldPath: string, newName: string) => void;
  selectedFile: string | null;
}

export function FileExplorer({
  files,
  onFileSelect,
  onFileCreate,
  onFileDelete,
  onFileRename,
  selectedFile,
}: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/workspace']));
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [creatingIn, setCreatingIn] = useState<{ path: string; isFolder: boolean } | null>(null);

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const handleRename = (oldPath: string) => {
    if (newName.trim()) {
      onFileRename(oldPath, newName.trim());
      setEditingNode(null);
      setNewName('');
    }
  };

  const handleCreate = () => {
    if (creatingIn && newName.trim()) {
      onFileCreate(creatingIn.path, newName.trim(), creatingIn.isFolder);
      setCreatingIn(null);
      setNewName('');
    }
  };

  const renderNode = (node: FileNode, depth: number = 0) => {
    const isExpanded = expandedFolders.has(node.path);
    const isSelected = selectedFile === node.path;
    const isEditing = editingNode === node.path;

    return (
      <div key={node.path}>
        <div
          className={`group flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-sidebar-accent ${
            isSelected ? 'bg-sidebar-accent' : ''
          }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {node.type === 'folder' ? (
            <>
              <button onClick={() => toggleFolder(node.path)} className="p-0 h-4 w-4">
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
              {isExpanded ? <FolderOpen className="h-4 w-4 text-accent" /> : <Folder className="h-4 w-4 text-accent" />}
            </>
          ) : (
            <>
              <div className="w-4" />
              <File className="h-4 w-4 text-muted-foreground" />
            </>
          )}
          
          {isEditing ? (
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename(node.path);
                if (e.key === 'Escape') setEditingNode(null);
              }}
              onBlur={() => handleRename(node.path)}
              className="h-6 text-sm"
              autoFocus
            />
          ) : (
            <span
              className="flex-1 text-sm truncate"
              onClick={() => {
                if (node.type === 'file') onFileSelect(node.path);
              }}
            >
              {node.name}
            </span>
          )}

          <div className="flex gap-1 opacity-0 hover:opacity-100 group-hover:opacity-100">
            {node.type === 'folder' && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCreatingIn({ path: node.path, isFolder: false });
                    setNewName('');
                  }}
                  title="New File"
                >
                  <Plus className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCreatingIn({ path: node.path, isFolder: true });
                    setNewName('');
                  }}
                  title="New Folder"
                >
                  <Folder className="h-3 w-3" />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                setEditingNode(node.path);
                setNewName(node.name);
              }}
            >
              <Edit3 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                onFileDelete(node.path);
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {node.type === 'folder' && isExpanded && node.children && (
          <>
            {creatingIn?.path === node.path && (
              <div
                className="flex items-center gap-1 px-2 py-1"
                style={{ paddingLeft: `${(depth + 1) * 12 + 8}px` }}
              >
                <div className="w-4" />
                {creatingIn.isFolder ? <Folder className="h-4 w-4 text-accent" /> : <File className="h-4 w-4" />}
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreate();
                    if (e.key === 'Escape') setCreatingIn(null);
                  }}
                  onBlur={handleCreate}
                  placeholder={creatingIn.isFolder ? 'New folder' : 'New file'}
                  className="h-6 text-sm"
                  autoFocus
                />
              </div>
            )}
            {node.children.map((child) => renderNode(child, depth + 1))}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="h-full bg-explorer-background border-r border-border overflow-auto">
      <div className="p-2 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-semibold">Explorer</h2>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => {
              setCreatingIn({ path: '/workspace', isFolder: false });
              setNewName('');
              setExpandedFolders(new Set(expandedFolders).add('/workspace'));
            }}
            title="New File"
          >
            <File className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => {
              setCreatingIn({ path: '/workspace', isFolder: true });
              setNewName('');
              setExpandedFolders(new Set(expandedFolders).add('/workspace'));
            }}
            title="New Folder"
          >
            <Folder className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div className="py-1">
        {creatingIn?.path === '/workspace' && (
          <div
            className="flex items-center gap-1 px-2 py-1"
            style={{ paddingLeft: '8px' }}
          >
            <div className="w-4" />
            {creatingIn.isFolder ? <Folder className="h-4 w-4 text-accent" /> : <File className="h-4 w-4" />}
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
                if (e.key === 'Escape') setCreatingIn(null);
              }}
              onBlur={handleCreate}
              placeholder={creatingIn.isFolder ? 'New folder' : 'New file'}
              className="h-6 text-sm"
              autoFocus
            />
          </div>
        )}
        {files.map((node) => renderNode(node, 0))}
      </div>
    </div>
  );
}
