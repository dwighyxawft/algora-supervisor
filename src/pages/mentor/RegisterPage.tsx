import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMentorAuth } from '@/contexts/MentorAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Gender } from '@/lib/api/models';

export default function MentorRegisterPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', gender: 'male', dateOfBirth: '', country: '', stateOrProvince: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useMentorAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast({ title: 'Passwords do not match', variant: 'destructive' }); return; }
    setLoading(true);
    try {
      await register({ ...form, dateOfBirth: new Date(form.dateOfBirth) });
      toast({ title: 'Registration successful', description: 'Please check your email and then login.' });
      navigate('/mentor/login');
    } catch (err: any) {
      toast({ title: 'Registration failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg glass-card">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Mentor Registration</CardTitle>
          <CardDescription>Create your mentor account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>First Name</Label><Input value={form.firstName} onChange={e => set('firstName', e.target.value)} required /></div>
              <div className="space-y-2"><Label>Last Name</Label><Input value={form.lastName} onChange={e => set('lastName', e.target.value)} required /></div>
            </div>
            <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={e => set('email', e.target.value)} required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={form.gender} onValueChange={v => set('gender', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Date of Birth</Label><Input type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Country</Label><Input value={form.country} onChange={e => set('country', e.target.value)} required /></div>
              <div className="space-y-2"><Label>State / Province</Label><Input value={form.stateOrProvince} onChange={e => set('stateOrProvince', e.target.value)} required /></div>
            </div>
            <div className="space-y-2"><Label>Password</Label><Input type="password" value={form.password} onChange={e => set('password', e.target.value)} required /></div>
            <div className="space-y-2"><Label>Confirm Password</Label><Input type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} required /></div>
            <Button type="submit" className="w-full gradient-primary" disabled={loading}>{loading ? 'Registering...' : 'Register'}</Button>
            <p className="text-center text-sm text-muted-foreground">Already have an account? <Link to="/mentor/login" className="text-primary hover:underline">Login</Link></p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
