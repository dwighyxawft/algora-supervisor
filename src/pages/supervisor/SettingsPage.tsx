import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUpdateSupervisorProfile, useUpdateSupervisorPassword } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { User, Lock, Bell, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const updateProfileMutation = useUpdateSupervisorProfile();
  const updatePasswordMutation = useUpdateSupervisorPassword();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(
      { firstName, lastName, bio, phoneNumber: phone },
      { onSuccess: () => updateProfile({ firstName, lastName, bio, phoneNumber: phone } as any) }
    );
  };

  const handleChangePassword = () => {
    updatePasswordMutation.mutate(
      { oldPassword, password: newPassword, confirmPassword },
      { onSuccess: () => { setOldPassword(''); setNewPassword(''); setConfirmPassword(''); } }
    );
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your profile and preferences.</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="profile" className="gap-1.5"><User className="h-3.5 w-3.5" /> Profile</TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5"><Lock className="h-3.5 w-3.5" /> Security</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5"><Bell className="h-3.5 w-3.5" /> Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4 space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Profile Information</CardTitle>
                <CardDescription>Update your personal information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user?.image} />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg">{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{firstName} {lastName}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                    <Badge variant="outline" className="mt-1">{user?.rank || 'BRONZE'}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>First Name</Label><Input value={firstName} onChange={e => setFirstName(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Last Name</Label><Input value={lastName} onChange={e => setLastName(e.target.value)} /></div>
                </div>
                <div className="space-y-2"><Label>Phone</Label><Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 234 567 890" /></div>
                <div className="space-y-2"><Label>Bio</Label><Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about yourself..." rows={3} /></div>
                <Button onClick={handleSaveProfile} className="gradient-primary" disabled={updateProfileMutation.isPending}>
                  {updateProfileMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Save Changes
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="security" className="mt-4 space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Change Password</CardTitle>
              <CardDescription>Update your account password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Current Password</Label><Input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder="••••••••" /></div>
              <div className="space-y-2"><Label>New Password</Label><Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" /></div>
              <div className="space-y-2"><Label>Confirm New Password</Label><Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" /></div>
              <Button className="gradient-primary" onClick={handleChangePassword} disabled={updatePasswordMutation.isPending || !oldPassword || !newPassword || newPassword !== confirmPassword}>
                {updatePasswordMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Update Password
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader><CardTitle className="text-lg">Security</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Session Auto-expiry</p>
                  <p className="text-xs text-muted-foreground">Automatically log out after inactivity</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Notification Preferences</CardTitle>
              <CardDescription>Choose what notifications you receive.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'New complaints', desc: 'Get notified when a new complaint is filed' },
                { label: 'Screening submissions', desc: 'When a mentor completes a screening phase' },
                { label: 'Meeting reminders', desc: '15 minutes before scheduled meetings' },
                { label: 'Task assignments', desc: 'When Root assigns you a new task' },
                { label: 'System alerts', desc: 'Platform maintenance and updates' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
