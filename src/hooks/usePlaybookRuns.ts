/**
 * Hook for managing recovery playbook runs with Supabase persistence
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { RECOVERY_PLAYBOOKS, RecoveryPlaybook, PlaybookId, CONFIDENCE_FACTORS, ConfidenceLevel } from './useZombieSpendData';

export type PlaybookRunStatus = 'draft' | 'active' | 'completed' | 'paused';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

export interface PlaybookRunTask {
  id: string;
  runId: string;
  taskName: string;
  taskOrder: number;
  status: TaskStatus;
  dueDate: string | null;
  completedAt: string | null;
}

export interface PlaybookRunOutput {
  id: string;
  runId: string;
  outputType: string;
  title: string;
  linkOrText: string | null;
  isCompleted: boolean;
}

export interface PlaybookRun {
  id: string;
  organizationId: string;
  playbookType: PlaybookId;
  category: string;
  segment: string | null;
  owner: string;
  dueDate: string;
  status: PlaybookRunStatus;
  expectedImpactAed: number;
  notes: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  tasks?: PlaybookRunTask[];
  outputs?: PlaybookRunOutput[];
}

export interface LaunchPlaybookParams {
  playbookId: PlaybookId;
  categoryId: string;
  categoryName: string;
  targetSegment?: string;
  owner: string;
  dueDate: string;
  expectedImpactAED: number;
  notes?: string;
}

export function usePlaybookRuns() {
  const { user } = useAuth();
  const [runs, setRuns] = useState<PlaybookRun[]>([]);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch organization ID from profile
  useEffect(() => {
    async function fetchOrgId() {
      if (!user?.id) {
        setOrganizationId(null);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('user_id', user.id)
          .single();
        
        if (!error && data) {
          setOrganizationId(data.organization_id);
        }
      } catch (err) {
        console.error('Error fetching org ID:', err);
      }
    }
    
    fetchOrgId();
  }, [user?.id]);

  // Fetch runs from Supabase
  const fetchRuns = useCallback(async () => {
    if (!organizationId) {
      setRuns([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('recovery_playbook_runs')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedRuns: PlaybookRun[] = (data || []).map((row: any) => ({
        id: row.id,
        organizationId: row.organization_id,
        playbookType: row.playbook_type as PlaybookId,
        category: row.category,
        segment: row.segment,
        owner: row.owner,
        dueDate: row.due_date,
        status: row.status as PlaybookRunStatus,
        expectedImpactAed: Number(row.expected_impact_aed || 0),
        notes: row.notes,
        createdBy: row.created_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      setRuns(mappedRuns);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching playbook runs:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchRuns();
  }, [fetchRuns]);

  // Launch a new playbook run
  const launchPlaybook = useCallback(async (params: LaunchPlaybookParams): Promise<PlaybookRun | null> => {
    if (!organizationId) {
      toast.error('Organization not found');
      return null;
    }

    const playbook = RECOVERY_PLAYBOOKS.find(p => p.id === params.playbookId);
    if (!playbook) {
      toast.error('Playbook not found');
      return null;
    }

    try {
      // Insert the run
      const { data: runData, error: runError } = await supabase
        .from('recovery_playbook_runs')
        .insert({
          organization_id: organizationId,
          playbook_type: params.playbookId,
          category: params.categoryName,
          segment: params.targetSegment || null,
          owner: params.owner,
          due_date: params.dueDate,
          status: 'draft',
          expected_impact_aed: params.expectedImpactAED,
          notes: params.notes || null,
          created_by: user?.id || null,
        })
        .select()
        .single();

      if (runError) throw runError;

      // Insert tasks from playbook steps
      const tasks = playbook.steps.map((step, idx) => ({
        run_id: runData.id,
        task_name: step,
        task_order: idx,
        status: 'pending',
      }));

      const { error: tasksError } = await supabase
        .from('recovery_run_tasks')
        .insert(tasks);

      if (tasksError) console.error('Error creating tasks:', tasksError);

      // Insert outputs from playbook
      const outputs = playbook.outputs.map((output) => ({
        run_id: runData.id,
        output_type: 'deliverable',
        title: output,
        is_completed: false,
      }));

      const { error: outputsError } = await supabase
        .from('recovery_run_outputs')
        .insert(outputs);

      if (outputsError) console.error('Error creating outputs:', outputsError);

      // Refresh runs
      await fetchRuns();

      const newRun: PlaybookRun = {
        id: runData.id,
        organizationId: runData.organization_id,
        playbookType: runData.playbook_type as PlaybookId,
        category: runData.category,
        segment: runData.segment,
        owner: runData.owner,
        dueDate: runData.due_date,
        status: runData.status as PlaybookRunStatus,
        expectedImpactAed: Number(runData.expected_impact_aed || 0),
        notes: runData.notes,
        createdBy: runData.created_by,
        createdAt: runData.created_at,
        updatedAt: runData.updated_at,
      };

      return newRun;
    } catch (err: any) {
      console.error('Error launching playbook:', err);
      toast.error('Failed to launch playbook');
      return null;
    }
  }, [organizationId, user?.id, fetchRuns]);

  // Update run status
  const updateRunStatus = useCallback(async (runId: string, status: PlaybookRunStatus) => {
    try {
      const { error } = await supabase
        .from('recovery_playbook_runs')
        .update({ status })
        .eq('id', runId);

      if (error) throw error;

      setRuns(prev => prev.map(run => 
        run.id === runId ? { ...run, status } : run
      ));

      toast.success(`Playbook ${status === 'active' ? 'started' : status === 'completed' ? 'completed' : 'updated'}`);
    } catch (err: any) {
      console.error('Error updating run status:', err);
      toast.error('Failed to update status');
    }
  }, []);

  // Fetch tasks for a run
  const fetchRunTasks = useCallback(async (runId: string): Promise<PlaybookRunTask[]> => {
    try {
      const { data, error } = await supabase
        .from('recovery_run_tasks')
        .select('*')
        .eq('run_id', runId)
        .order('task_order', { ascending: true });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        runId: row.run_id,
        taskName: row.task_name,
        taskOrder: row.task_order,
        status: row.status as TaskStatus,
        dueDate: row.due_date,
        completedAt: row.completed_at,
      }));
    } catch (err: any) {
      console.error('Error fetching run tasks:', err);
      return [];
    }
  }, []);

  // Fetch outputs for a run
  const fetchRunOutputs = useCallback(async (runId: string): Promise<PlaybookRunOutput[]> => {
    try {
      const { data, error } = await supabase
        .from('recovery_run_outputs')
        .select('*')
        .eq('run_id', runId);

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        runId: row.run_id,
        outputType: row.output_type,
        title: row.title,
        linkOrText: row.link_or_text,
        isCompleted: row.is_completed,
      }));
    } catch (err: any) {
      console.error('Error fetching run outputs:', err);
      return [];
    }
  }, []);

  // Calculate progress percentage
  const getRunProgress = useCallback((tasks: PlaybookRunTask[]): number => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.status === 'completed').length;
    return Math.round((completed / tasks.length) * 100);
  }, []);

  return {
    runs,
    isLoading,
    error,
    launchPlaybook,
    updateRunStatus,
    fetchRunTasks,
    fetchRunOutputs,
    getRunProgress,
    refetch: fetchRuns,
  };
}
