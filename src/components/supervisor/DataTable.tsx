import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  searchPlaceholder?: string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  filters?: React.ReactNode;
}

export function DataTable<T extends { id?: string }>({
  columns, data, loading, searchPlaceholder = 'Search...', onRowClick,
  emptyMessage = 'No data found', emptyIcon, filters,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const filtered = data.filter(item =>
    search === '' || JSON.stringify(item).toLowerCase().includes(search.toLowerCase())
  );

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const av = (a as any)[sortKey];
        const bv = (b as any)[sortKey];
        const cmp = String(av).localeCompare(String(bv));
        return sortDir === 'asc' ? cmp : -cmp;
      })
    : filtered;

  const paginated = sorted.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(sorted.length / perPage);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            className="pl-9 h-9 bg-muted/50 border-transparent"
          />
        </div>
        {filters}
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              {columns.map(col => (
                <TableHead
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={col.sortable ? 'cursor-pointer select-none hover:text-foreground' : ''}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key && (
                      <span className="text-primary">{sortDir === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-40 text-center">
                  <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    {emptyIcon}
                    <p className="text-sm">{emptyMessage}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((item, idx) => (
                <motion.tr
                  key={item.id || idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => onRowClick?.(item)}
                  className={`border-border/30 transition-colors ${onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}`}
                >
                  {columns.map(col => (
                    <TableCell key={col.key}>
                      {col.render ? col.render(item) : String((item as any)[col.key] ?? '')}
                    </TableCell>
                  ))}
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {page * perPage + 1}–{Math.min((page + 1) * perPage, sorted.length)} of {sorted.length}
          </p>
          <div className="flex items-center gap-2">
            <Select value={String(perPage)} onValueChange={v => { setPerPage(Number(v)); setPage(0); }}>
              <SelectTrigger className="w-20 h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[10, 20, 50].map(n => <SelectItem key={n} value={String(n)}>{n}/page</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground">{page + 1}/{totalPages}</span>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
