import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Download, Trash2, FileText, Shield, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function DataPrivacySettings() {
  const { user } = useAuth();
  const [requestingExport, setRequestingExport] = useState(false);
  const [requestingDeletion, setRequestingDeletion] = useState(false);
  const [requestingAccessLog, setRequestingAccessLog] = useState(false);

  const createDataRequest = async (type: 'export' | 'delete' | 'access_log') => {
    if (!user) return;

    const setLoading = {
      export: setRequestingExport,
      delete: setRequestingDeletion,
      access_log: setRequestingAccessLog,
    }[type];

    setLoading(true);
    try {
      const { error } = await supabase
        .from('data_access_requests')
        .insert({
          user_id: user.id,
          request_type: type,
          status: 'pending',
        });

      if (error) throw error;

      const messages = {
        export: 'Data export request submitted. You will be notified when ready.',
        delete: 'Account deletion request submitted. Our team will review your request.',
        access_log: 'Access log request submitted. You will receive your logs shortly.',
      };

      toast.success(messages[type]);
    } catch (error) {
      console.error('Failed to create data request:', error);
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Your Data
          </CardTitle>
          <CardDescription>
            Request a copy of all your personal data stored in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            We will compile all your personal information, benefit usage, documents, and activity 
            history into a downloadable format. This process may take up to 48 hours.
          </p>
          <Button 
            onClick={() => createDataRequest('export')} 
            disabled={requestingExport}
            variant="outline"
          >
            {requestingExport ? 'Submitting...' : 'Request Data Export'}
          </Button>
        </CardContent>
      </Card>

      {/* Access Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Access Logs
          </CardTitle>
          <CardDescription>
            Request a log of who has accessed your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Receive a detailed log of when and how your personal data has been accessed, 
            including by HR administrators and the system.
          </p>
          <Button 
            onClick={() => createDataRequest('access_log')} 
            disabled={requestingAccessLog}
            variant="outline"
          >
            {requestingAccessLog ? 'Submitting...' : 'Request Access Logs'}
          </Button>
        </CardContent>
      </Card>

      {/* Data Privacy Notice */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Your Privacy Rights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span><strong>Right to Access:</strong> You can request a copy of your personal data at any time.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span><strong>Right to Rectification:</strong> You can update your personal information through your profile settings.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span><strong>Right to Erasure:</strong> You can request deletion of your account and personal data.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span><strong>Right to Portability:</strong> You can export your data in a machine-readable format.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span><strong>Data Minimization:</strong> We only collect data necessary for providing our services.</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Account Deletion */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="w-5 h-5" />
            Delete Account
          </CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              This action is irreversible. All your data, including benefit history, 
              documents, and preferences will be permanently deleted.
            </AlertDescription>
          </Alert>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={requestingDeletion}>
                {requestingDeletion ? 'Submitting...' : 'Request Account Deletion'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will submit a request to permanently delete your account. 
                  Our team will review this request and contact you to confirm. 
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => createDataRequest('delete')}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Yes, delete my account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
