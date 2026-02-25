import { useState } from 'react';
import { useNotifications, useMarkNotificationRead, useDeleteNotification, useCreateNotification } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Bell, BellOff, Plus, Check, Trash2, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Notify } from '@/lib/api/models';

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const deleteNotif = useDeleteNotification();
  const createNotif = useCreateNotification();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', targetType: 'mentor', targetId: '' });

  const unreadCount = notifications?.filter(n => !n.isRead).length ?? 0;

  const handleSend = () => {
    createNotif.mutate(form, {
      onSuccess: () => { setShowCreate(false); setForm({ title: '', message: '', targetType: 'mentor', targetId: '' }); },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        <Button className="gap-2 gradient-primary" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> Send Notification
        </Button>
      </div>

      <div className="space-y-3">
        {notifications && notifications.length > 0 ? notifications.map((n, i) => (
          <motion.div key={n.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Card className={`glass-card transition-colors ${!n.isRead ? 'border-primary/30' : ''}`}>
              <CardContent className="p-4 flex items-start gap-4">
                <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${n.isRead ? 'bg-muted-foreground/30' : 'bg-primary'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium ${!n.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>{n.title}</p>
                    {!n.isRead && <Badge variant="secondary" className="text-[10px] h-4">New</Badge>}
                  </div>
                  {n.message && <p className="text-xs text-muted-foreground mt-1">{n.message}</p>}
                  <p className="text-[10px] text-muted-foreground/60 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex gap-1">
                  {!n.isRead && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => markRead.mutate(n.id)} title="Mark as read">
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/60 hover:text-destructive" onClick={() => deleteNotif.mutate(n.id)} title="Delete">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )) : (
          <Card className="glass-card">
            <CardContent className="p-12 text-center text-muted-foreground">
              <BellOff className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-sm">No notifications yet.</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
            <DialogDescription>Send a targeted notification to a user.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Notification title..." />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Message body..." rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Target Type</Label>
                <Select value={form.targetType} onValueChange={v => setForm(f => ({ ...f, targetType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mentor">Mentor</SelectItem>
                    <SelectItem value="intern">Intern</SelectItem>
                    <SelectItem value="supervisor">Supervisor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target ID</Label>
                <Input value={form.targetId} onChange={e => setForm(f => ({ ...f, targetId: e.target.value }))} placeholder="User ID..." />
              </div>
            </div>
            <Button
              className="w-full gradient-primary gap-2"
              disabled={createNotif.isPending || !form.title.trim() || !form.targetId.trim()}
              onClick={handleSend}
            >
              <Send className="h-4 w-4" /> {createNotif.isPending ? 'Sending...' : 'Send Notification'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
