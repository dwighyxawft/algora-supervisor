import { useNotifications, useMarkNotificationRead } from '@/hooks/use-api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ListTodo, Bell, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { EmptyState } from '@/components/supervisor/EmptyState';
import { motion } from 'framer-motion';
import type { Notify } from '@/lib/api/models';

export default function TasksPage() {
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Tasks & Notices</h1>
        <EmptyState icon={ListTodo} title="All caught up!" description="No tasks or notices at the moment." />
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
        {notifications.map((notif, idx) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className={`glass-card transition-colors hover:border-primary/20 ${!notif.isRead ? 'border-l-2 border-l-primary' : ''}`}>
              <CardContent className="p-4 flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Bell className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className={`text-sm ${!notif.isRead ? 'font-semibold' : 'font-medium'}`}>{notif.title}</p>
                      {notif.message && <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>}
                      <p className="text-xs text-muted-foreground mt-0.5">{new Date(notif.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0 items-center">
                      <Badge className={notif.isRead ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary border-primary/20'}>
                        {notif.isRead ? 'Read' : 'Unread'}
                      </Badge>
                      {!notif.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markRead.mutate(notif.id)}
                          className="text-xs"
                        >
                          Mark read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
