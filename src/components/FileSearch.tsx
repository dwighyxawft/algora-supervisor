import { useState, useEffect } from 'react';
import { Search, X, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getFs, FileNode, readDirRecursive } from '@/lib/browserFs';
import { cn } from '@/lib/utils';

interface FileSearchProps {
  onClose: () => void;
  onFileSelect: (path: string) => void;
}

interface SearchResult {
  path: string;
  line: number;
  content: string;
  match: string;
}

export function FileSearch({ onClose, onFileSelect }: FileSearchProps) {
  const [query, setQuery] = useState('');
  const [useRegex, setUseRegex] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, useRegex, caseSensitive]);

  const performSearch = () => {
    setIsSearching(true);
    const fs = getFs();
    if (!fs) {
      setIsSearching(false);
      return;
    }

    try {
      const files = readDirRecursive(fs, '/workspace');
      const searchResults: SearchResult[] = [];

      const searchInFiles = (nodes: FileNode[]) => {
        for (const node of nodes) {
          if (node.type === 'folder' && node.children) {
            searchInFiles(node.children);
          } else if (node.type === 'file') {
            try {
              const content = fs.readFileSync(node.path, 'utf8');
              const lines = content.split('\n');
              
              lines.forEach((line, index) => {
                let match = false;
                let matchText = '';

                if (useRegex) {
                  try {
                    const flags = caseSensitive ? 'g' : 'gi';
                    const regex = new RegExp(query, flags);
                    const matches = line.match(regex);
                    if (matches) {
                      match = true;
                      matchText = matches[0];
                    }
                  } catch (e) {
                    // Invalid regex
                    return;
                  }
                } else {
                  const searchLine = caseSensitive ? line : line.toLowerCase();
                  const searchQuery = caseSensitive ? query : query.toLowerCase();
                  if (searchLine.includes(searchQuery)) {
                    match = true;
                    matchText = query;
                  }
                }

                if (match) {
                  searchResults.push({
                    path: node.path,
                    line: index + 1,
                    content: line.trim(),
                    match: matchText,
                  });
                }
              });
            } catch (e) {
              // Skip files that can't be read as text
            }
          }
        }
      };

      searchInFiles(files);
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    onFileSelect(result.path);
    // Note: Line number navigation would require additional editor API integration
  };

  const getFileName = (path: string) => {
    return path.split('/').pop() || path;
  };

  const highlightMatch = (content: string, match: string) => {
    if (!match) return content;
    
    try {
      const parts = content.split(new RegExp(`(${match})`, caseSensitive ? 'g' : 'gi'));
      return parts.map((part, i) => 
        part.toLowerCase() === match.toLowerCase() ? (
          <mark key={i} className="bg-primary/30 text-foreground">{part}</mark>
        ) : part
      );
    } catch {
      return content;
    }
  };

  return (
    <div className="flex flex-col h-full bg-background border-r border-border">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Search Files</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-7 w-7 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-3 space-y-3 border-b border-border">
        <Input
          placeholder="Search in files..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-8"
          autoFocus
        />
        
        <div className="flex items-center gap-4 text-xs">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={useRegex}
              onCheckedChange={(checked) => setUseRegex(checked === true)}
            />
            <span>Regex</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={caseSensitive}
              onCheckedChange={(checked) => setCaseSensitive(checked === true)}
            />
            <span>Case Sensitive</span>
          </label>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {isSearching ? (
            <div className="text-xs text-muted-foreground p-2">Searching...</div>
          ) : results.length === 0 ? (
            <div className="text-xs text-muted-foreground p-2">
              {query ? 'No results found' : 'Enter a search query'}
            </div>
          ) : (
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground px-2 py-1">
                {results.length} result{results.length !== 1 ? 's' : ''}
              </div>
              {results.map((result, i) => (
                <button
                  key={`${result.path}-${result.line}-${i}`}
                  onClick={() => handleResultClick(result)}
                  className={cn(
                    'w-full text-left p-2 rounded hover:bg-accent/10 transition-colors',
                    'flex flex-col gap-1 group'
                  )}
                >
                  <div className="flex items-center gap-2 text-xs">
                    <FileText className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-foreground font-medium truncate">
                      {getFileName(result.path)}
                    </span>
                    <span className="text-muted-foreground">:{result.line}</span>
                  </div>
                  <div className="text-xs text-muted-foreground pl-5 font-mono truncate">
                    {highlightMatch(result.content, result.match)}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
