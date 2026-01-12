import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SessionManager } from '@/components/security/SessionManager';
import { DataPrivacySettings } from '@/components/security/DataPrivacySettings';
import { MFAEnrollment } from '@/components/auth/MFAEnrollment';
import { Shield, Monitor, Lock, UserCheck } from 'lucide-react';

export default function SecuritySettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          Security & Privacy
        </h1>
        <p className="text-muted-foreground">
          Manage your security settings, active sessions, and privacy preferences
        </p>
      </div>

      <Tabs defaultValue="sessions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            <span className="hidden sm:inline">Sessions</span>
          </TabsTrigger>
          <TabsTrigger value="mfa" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span className="hidden sm:inline">Two-Factor Auth</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Privacy</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-6">
          <SessionManager />
        </TabsContent>

        <TabsContent value="mfa" className="space-y-6">
          <MFAEnrollment />
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <DataPrivacySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
