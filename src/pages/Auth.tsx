import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { User, Building2, Loader2, Shield, Store } from 'lucide-react';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

type UserRole = 'employee' | 'employer' | 'admin' | 'vendor';

const roleConfig: Record<UserRole, { label: string; icon: React.ElementType; color: string }> = {
  employee: { label: 'Employee', icon: User, color: 'text-blue-500' },
  employer: { label: 'Employer', icon: Building2, color: 'text-green-500' },
  admin: { label: 'Admin', icon: Shield, color: 'text-red-500' },
  vendor: { label: 'Vendor', icon: Store, color: 'text-purple-500' },
};

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp, demoLogin } = useAuth();
  
  const [selectedRole, setSelectedRole] = useState<UserRole>('employee');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const getRedirectPath = (role: UserRole) => {
    const paths: Record<UserRole, string> = {
      employee: '/employee',
      employer: '/employer',
      admin: '/admin',
      vendor: '/vendor',
    };
    return paths[role];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      if (isLogin) {
        const result = loginSchema.safeParse({ email, password });
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach(err => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setLoading(false);
          return;
        }

        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message || 'Failed to sign in');
        } else {
          toast.success('Welcome back!');
          navigate(getRedirectPath(selectedRole));
        }
      } else {
        const result = signUpSchema.safeParse({ email, password, firstName, lastName });
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach(err => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setLoading(false);
          return;
        }

        const { error } = await signUp(email, password, firstName, lastName, selectedRole);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('This email is already registered. Please sign in instead.');
          } else {
            toast.error(error.message || 'Failed to sign up');
          }
        } else {
          toast.success('Account created! Signing you in...');
          navigate(getRedirectPath(selectedRole));
        }
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    try {
      const { error } = await demoLogin(selectedRole);
      if (error) {
        toast.error(error.message || 'Failed to login with demo account');
      } else {
        toast.success(`Welcome to bnft. as a demo ${selectedRole}!`);
        navigate(getRedirectPath(selectedRole));
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setDemoLoading(false);
    }
  };

  // Check URL for role-specific access
  const urlParams = new URLSearchParams(window.location.search);
  const accessParam = urlParams.get('access');
  
  // Determine which roles to show based on access parameter
  const getAvailableRoles = (): UserRole[] => {
    if (accessParam === 'admin') return ['admin'];
    if (accessParam === 'vendor') return ['vendor'];
    if (accessParam === 'full') return ['employee', 'employer', 'admin', 'vendor'];
    return ['employee', 'employer'];
  };
  
  const availableRoles = getAvailableRoles();
  const showAllRoles = accessParam === 'admin' || accessParam === 'vendor' || accessParam === 'full';
  
  // Auto-select the role if only one is available
  const effectiveRole = availableRoles.length === 1 ? availableRoles[0] : selectedRole;
  if (effectiveRole !== selectedRole && availableRoles.length === 1) {
    setSelectedRole(effectiveRole);
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        {/* Logo */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center shadow-glow">
              <span className="text-primary font-bold text-xl">b</span>
            </div>
            <span className="font-display text-3xl font-bold text-primary-foreground">bnft.</span>
          </div>
          <p className="text-primary-foreground/70 text-sm">Your Total Rewards Platform</p>
        </div>

        {/* Role Selection */}
        <Tabs value={selectedRole} onValueChange={(v) => setSelectedRole(v as UserRole)}>
          <TabsList className={`grid w-full h-12 bg-primary-foreground/10 backdrop-blur ${availableRoles.length === 4 ? 'grid-cols-4' : 'grid-cols-2'}`}>
            {availableRoles.map((role) => {
              const config = roleConfig[role];
              const Icon = config.icon;
              return (
                <TabsTrigger 
                  key={role}
                  value={role} 
                  className="data-[state=active]:bg-card data-[state=active]:text-foreground text-primary-foreground/80"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {config.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value={selectedRole} className="mt-4">
            <Card className="border-0 shadow-xl">
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="text-xl font-display">
                  {isLogin ? 'Welcome back' : 'Create account'}
                </CardTitle>
                <CardDescription>
                  {isLogin 
                    ? `Sign in to your ${selectedRole} account` 
                    : `Register as ${selectedRole === 'employee' ? 'an employee' : selectedRole === 'admin' ? 'an admin' : `a ${selectedRole}`}`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="John"
                          className={errors.firstName ? 'border-destructive' : ''}
                        />
                        {errors.firstName && (
                          <p className="text-xs text-destructive">{errors.firstName}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Doe"
                          className={errors.lastName ? 'border-destructive' : ''}
                        />
                        {errors.lastName && (
                          <p className="text-xs text-destructive">{errors.lastName}</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className={errors.email ? 'border-destructive' : ''}
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive">{errors.email}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={errors.password ? 'border-destructive' : ''}
                    />
                    {errors.password && (
                      <p className="text-xs text-destructive">{errors.password}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {isLogin ? 'Sign In' : 'Create Account'}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                {/* Demo Login Button */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleDemoLogin}
                  disabled={demoLoading}
                >
                  {demoLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Shield className="w-4 h-4 mr-2" />
                  )}
                  {selectedRole === 'admin' || selectedRole === 'vendor' 
                    ? `Demo ${roleConfig[selectedRole].label} Access`
                    : 'Continue with UAE Pass (Demo)'
                  }
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  {isLogin ? "Don't have an account? " : 'Already have an account? '}
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-accent hover:underline font-medium"
                  >
                    {isLogin ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Role-specific access hints */}
        {!showAllRoles && (
          <div className="flex flex-col items-center gap-1">
            <p className="text-center text-xs text-primary-foreground/50">
              Platform admin?{' '}
              <a href="/auth?access=admin" className="underline hover:text-primary-foreground/80 transition-colors">
                Access here
              </a>
            </p>
            <p className="text-center text-xs text-primary-foreground/50">
              Vendor partner?{' '}
              <a href="/auth?access=vendor" className="underline hover:text-primary-foreground/80 transition-colors">
                Access here
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}