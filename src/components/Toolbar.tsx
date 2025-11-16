import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Upload, Link2, FileCode, Loader2, Play, Search, FolderOpen, Trash2 } from 'lucide-react';
import { importZipFromUrl, exportWorkspaceAsZip, uploadFilesToWorkspace } from '@/lib/zipHelpers';
import { importFolder, clearWorkspace } from '@/lib/workspaceHelpers';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ToolbarProps {
  onRefresh: () => void;
  onRun?: () => void;
  onToggleTerminal?: () => void;
  onToggleSearch?: () => void;
}

// Boilerplates will be loaded from backend
const BOILERPLATES: { name: string; url: string }[] = [];

export function Toolbar({ onRefresh, onRun, onToggleTerminal, onToggleSearch }: ToolbarProps) {
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [zipUrl, setZipUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImportZip = async () => {
    if (!zipUrl.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a ZIP URL',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { imported, skipped } = await importZipFromUrl(zipUrl);
      onRefresh();
      setShowImportDialog(false);
      setZipUrl('');
      toast({
        title: 'Import successful',
        description: `Imported ${imported} files${skipped > 0 ? ` • Skipped ${skipped} files` : ''}`,
      });
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'Failed to import ZIP',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportZip = async () => {
    setIsLoading(true);
    try {
      const blob = await exportWorkspaceAsZip();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workspace-${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast({
        title: 'Export successful',
        description: 'Workspace downloaded as ZIP',
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export failed',
        description: 'Failed to export workspace',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);
    try {
      const result = await uploadFilesToWorkspace(files);
      onRefresh();
      
      if (result.imported && result.imported > 0) {
        toast({
          title: 'Project imported',
          description: `Imported ${result.imported} files${result.skipped ? ` • Skipped ${result.skipped}` : ''}`,
        });
      } else {
        toast({
          title: 'Upload successful',
          description: `Uploaded ${result.uploaded} file${result.uploaded !== 1 ? 's' : ''}`,
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload files',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleBoilerplateSelect = async (url: string) => {
    if (!url) return;
    setIsLoading(true);
    try {
      await importZipFromUrl(url);
      onRefresh();
      toast({
        title: 'Boilerplate loaded',
        description: 'Project template has been loaded successfully',
      });
    } catch (error) {
      console.error('Boilerplate load error:', error);
      toast({
        title: 'Failed to load boilerplate',
        description: 'Could not load the project template',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);
    try {
      const result = await importFolder(files);
      onRefresh();
      toast({
        title: 'Folder imported',
        description: `Imported ${result.imported} file${result.imported !== 1 ? 's' : ''}`,
      });
    } catch (error) {
      console.error('Folder import error:', error);
      toast({
        title: 'Import failed',
        description: 'Failed to import folder',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      if (folderInputRef.current) {
        folderInputRef.current.value = '';
      }
    }
  };

  const handleClearWorkspace = async () => {
    setIsLoading(true);
    try {
      const deleted = await clearWorkspace();
      onRefresh();
      setShowClearDialog(false);
      toast({
        title: 'Workspace cleared',
        description: `Deleted ${deleted} file${deleted !== 1 ? 's' : ''}`,
      });
    } catch (error) {
      console.error('Clear error:', error);
      toast({
        title: 'Clear failed',
        description: 'Failed to clear workspace',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="h-12 bg-toolbar-background border-b border-border flex items-center gap-2 px-4">
        {BOILERPLATES.length > 0 && (
          <Select onValueChange={handleBoilerplateSelect} disabled={isLoading}>
            <SelectTrigger className="w-48 h-8">
              <SelectValue placeholder="Load boilerplate..." />
            </SelectTrigger>
            <SelectContent>
              {BOILERPLATES.map((bp) => (
                <SelectItem key={bp.url} value={bp.url}>
                  <div className="flex items-center gap-2">
                    <FileCode className="h-4 w-4" />
                    {bp.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="flex-1" />

        {onToggleSearch && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSearch}
            title="Search in files"
          >
            <Search className="h-4 w-4" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          title="Upload files or ZIP project"
        >
          <Upload className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => folderInputRef.current?.click()}
          disabled={isLoading}
          title="Import folder from local machine"
        >
          <FolderOpen className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowImportDialog(true)}
          disabled={isLoading}
          title="Import project from ZIP URL"
        >
          <Link2 className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleExportZip}
          disabled={isLoading}
          title="Export workspace"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowClearDialog(true)}
          disabled={isLoading}
          title="Clear workspace"
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".zip,*"
          onChange={handleFileUpload}
          className="hidden"
        />
        
        <input
          ref={folderInputRef}
          type="file"
          {...({ webkitdirectory: '', directory: '' } as any)}
          multiple
          onChange={handleFolderUpload}
          className="hidden"
        />
      </div>

      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Project from ZIP URL</DialogTitle>
            <DialogDescription>
              Paste a direct URL to a ZIP file to import the project.
              <br />
              <span className="text-xs text-muted-foreground">
                Note: node_modules, .git, dist folders will be skipped.
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com/project.zip"
              value={zipUrl}
              onChange={(e) => setZipUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleImportZip()}
            />
            <Button onClick={handleImportZip} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Import'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Workspace</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete all files and folders in your workspace. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearWorkspace} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Clear Workspace'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
