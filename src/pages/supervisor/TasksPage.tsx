import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ListTodo, Bell, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { EmptyState } from '@/components/supervisor/EmptyState';
import { motion } from 'framer-motion';

const MOCK_TASKS = [
  { id: '1', title: 'Review mentor screening for Alex Brown', type: 'task', priority: 'high', from: 'Root Admin', date: '2024-02-15', read: false },
  { id: '2', title: 'Monthly performance report due', type: 'notice', priority: 'medium', from: 'System', date: '2024-02-14', read: false },
  { id: '3', title: 'Warning: Mentor John Doe has 3 unresolved complaints', type: 'warning', priority: 'high', from: 'System', date: '2024-02-13', read: true },
  { id: '4', title: 'New mentor assigned to your team', type: 'alert', priority: 'low', from: 'Root Admin', date: '2024-02-12', read: true },
  { id: '5', title: 'Platform maintenance scheduled for Feb 20', type: 'notice', priority: 'low', from: 'System', date: '2024-02-10', read: true },
];

const typeIcons: Record<string, any> = {
  task: ListTodo,
  notice: Info,
  warning: AlertTriangle,
  alert: Bell,
};

const typeColors: Record<string, string> = {
  task: 'bg-primary/10 text-primary border-primary/20',
  notice: 'bg-accent/10 text-accent border-accent/20',
  warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  alert: 'bg-destructive/10 text-destructive border-destructive/20',
};

const priorityColors: Record<string, string> = {
  high: 'bg-destructive/10 text-destructive border-destructive/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  low: 'bg-muted text-muted-foreground',
};

export default function TasksPage() {
  if (MOCK_TASKS.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Tasks & Notices</h1>
        <EmptyState
          icon={ListTodo}
          title="All caught up!"
          description="No tasks or notices at the moment."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tasks & Notices</h1>
        <p className="text-sm text-muted-foreground mt-1">Tasks from Root, system notices, and alerts.</p>
      </div>

      <div className="space-y-3">
        {MOCK_TASKS.map((task, idx) => {
          const Icon = typeIcons[task.type] || Bell;
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className={`glass-card transition-colors hover:border-primary/20 ${!task.read ? 'border-l-2 border-l-primary' : ''}`}>
                <CardContent className="p-4 flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${task.type === 'warning' ? 'bg-yellow-500/10' : 'bg-primary/10'}`}>
                    <Icon className={`h-4 w-4 ${task.type === 'warning' ? 'text-yellow-400' : 'text-primary'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className={`text-sm ${!task.read ? 'font-semibold' : 'font-medium'}`}>{task.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">From {task.from} · {task.date}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Badge className={typeColors[task.type]}>{task.type}</Badge>
                        <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
