import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, ArrowLeft, Mail, CheckCircle, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { forgotPassword } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch {
      toast({ title: 'Error', description: 'Failed to send reset link', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4 animate-glow">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Algora</h1>
        </div>

        <Card className="glass-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">{sent ? 'Check your email' : 'Reset password'}</CardTitle>
            <CardDescription>
              {sent
                ? 'We sent a password reset link to your email.'
                : 'Enter your email and we\'ll send you a reset link.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="flex flex-col items-center gap-4 py-4">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <p className="text-sm text-muted-foreground text-center">
                  If an account exists for <strong>{email}</strong>, you'll receive a reset link shortly.
                </p>
                <Link to="/supervisor/login">
                  <Button variant="outline" className="gap-2">
                    <ArrowLeft className="h-4 w-4" /> Back to login
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="supervisor@algora.io"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full gradient-primary" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Send reset link
                </Button>
                <Link to="/supervisor/login" className="block text-center">
                  <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                    <ArrowLeft className="h-4 w-4" /> Back to login
                  </Button>
                </Link>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
