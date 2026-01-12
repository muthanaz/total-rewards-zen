import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Shield, ShieldCheck, Loader2, Copy, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface MFAEnrollmentProps {
  onEnrollmentChange?: (enrolled: boolean) => void;
}

export function MFAEnrollment({ onEnrollmentChange }: MFAEnrollmentProps) {
  const { user } = useAuth();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [showUnenrollDialog, setShowUnenrollDialog] = useState(false);
  
  // Enrollment state
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [factorId, setFactorId] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    checkMFAStatus();
  }, [user]);

  const checkMFAStatus = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data: factors, error } = await supabase.auth.mfa.listFactors();
      
      if (error) {
        console.error('Error checking MFA status:', error);
        setIsLoading(false);
        return;
      }

      const hasVerifiedTotp = factors.totp.some(f => f.status === 'verified');
      setIsEnrolled(hasVerifiedTotp);
      onEnrollmentChange?.(hasVerifiedTotp);
    } catch (err) {
      console.error('MFA check error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const startEnrollment = async () => {
    setIsEnrolling(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Authenticator App'
      });

      if (error) {
        toast.error(error.message || 'Failed to start MFA enrollment');
        return;
      }

      if (data) {
        setQrCode(data.totp.qr_code);
        setSecret(data.totp.secret);
        setFactorId(data.id);
        setShowEnrollDialog(true);
      }
    } catch (err) {
      toast.error('Failed to start enrollment');
    } finally {
      setIsEnrolling(false);
    }
  };

  const verifyEnrollment = async () => {
    if (verificationCode.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    setIsEnrolling(true);
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId
      });

      if (challengeError) {
        toast.error(challengeError.message || 'Failed to create challenge');
        return;
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: verificationCode
      });

      if (verifyError) {
        toast.error(verifyError.message || 'Invalid verification code');
        return;
      }

      // Save MFA status to database
      await supabase.from('mfa_settings').upsert({
        user_id: user!.id,
        mfa_enabled: true,
        enrolled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      setIsEnrolled(true);
      onEnrollmentChange?.(true);
      setShowEnrollDialog(false);
      resetEnrollmentState();
      toast.success('Two-factor authentication enabled successfully!');
    } catch (err) {
      toast.error('Verification failed');
    } finally {
      setIsEnrolling(false);
    }
  };

  const unenroll = async () => {
    setIsEnrolling(true);
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const verifiedFactor = factors?.totp.find(f => f.status === 'verified');
      
      if (verifiedFactor) {
        const { error } = await supabase.auth.mfa.unenroll({ factorId: verifiedFactor.id });
        
        if (error) {
          toast.error(error.message || 'Failed to disable 2FA');
          return;
        }

        // Update database
        await supabase.from('mfa_settings').upsert({
          user_id: user!.id,
          mfa_enabled: false,
          updated_at: new Date().toISOString()
        });

        setIsEnrolled(false);
        onEnrollmentChange?.(false);
        setShowUnenrollDialog(false);
        toast.success('Two-factor authentication disabled');
      }
    } catch (err) {
      toast.error('Failed to disable 2FA');
    } finally {
      setIsEnrolling(false);
    }
  };

  const resetEnrollmentState = () => {
    setQrCode('');
    setSecret('');
    setFactorId('');
    setVerificationCode('');
    setCopied(false);
  };

  const copySecret = async () => {
    await navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isEnrolled ? (
            <ShieldCheck className="h-5 w-5 text-green-500" />
          ) : (
            <Shield className="h-5 w-5 text-muted-foreground" />
          )}
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          {isEnrolled 
            ? 'Your account is protected with two-factor authentication'
            : 'Add an extra layer of security to your account'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isEnrolled ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <ShieldCheck className="h-4 w-4" />
              <span>2FA is enabled</span>
            </div>
            <Dialog open={showUnenrollDialog} onOpenChange={setShowUnenrollDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="text-destructive hover:text-destructive">
                  Disable 2FA
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Disable Two-Factor Authentication?</DialogTitle>
                  <DialogDescription>
                    This will remove the extra security layer from your account. 
                    Are you sure you want to continue?
                  </DialogDescription>
                </DialogHeader>
                <div className="flex gap-3 justify-end mt-4">
                  <Button variant="outline" onClick={() => setShowUnenrollDialog(false)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={unenroll}
                    disabled={isEnrolling}
                  >
                    {isEnrolling && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Disable 2FA
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Protect your account with a time-based one-time password (TOTP) 
              using an authenticator app like Google Authenticator or Authy.
            </p>
            <Dialog open={showEnrollDialog} onOpenChange={(open) => {
              setShowEnrollDialog(open);
              if (!open) resetEnrollmentState();
            }}>
              <Button onClick={startEnrollment} disabled={isEnrolling}>
                {isEnrolling && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Enable 2FA
              </Button>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
                  <DialogDescription>
                    Scan the QR code with your authenticator app, then enter the 6-digit code.
                  </DialogDescription>
                </DialogHeader>
                
                {qrCode && (
                  <div className="space-y-4">
                    {/* QR Code */}
                    <div className="flex justify-center">
                      <div className="bg-white p-4 rounded-lg">
                        <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                      </div>
                    </div>

                    {/* Manual entry secret */}
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">
                        Can't scan? Enter this code manually:
                      </Label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 p-2 bg-muted rounded text-xs font-mono break-all">
                          {secret}
                        </code>
                        <Button variant="outline" size="sm" onClick={copySecret}>
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    {/* Verification code input */}
                    <div className="space-y-2">
                      <Label htmlFor="verification-code">Verification Code</Label>
                      <Input
                        id="verification-code"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        placeholder="Enter 6-digit code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={verifyEnrollment}
                      disabled={isEnrolling || verificationCode.length !== 6}
                    >
                      {isEnrolling && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Verify and Enable
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
