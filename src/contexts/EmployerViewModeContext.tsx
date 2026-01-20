import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type ViewMode = 'executive' | 'operational';

interface EmployerViewModeContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isExecutive: boolean;
  isOperational: boolean;
  loading: boolean;
}

const EmployerViewModeContext = createContext<EmployerViewModeContextType | undefined>(undefined);

export function EmployerViewModeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [viewMode, setViewModeState] = useState<ViewMode>('operational');
  const [loading, setLoading] = useState(true);

  // Load persisted view mode from database
  useEffect(() => {
    const loadViewMode = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('employer_view_mode')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!error && data?.employer_view_mode) {
          setViewModeState(data.employer_view_mode as ViewMode);
        }
      } catch (error) {
        console.error('Error loading view mode:', error);
      } finally {
        setLoading(false);
      }
    };

    loadViewMode();
  }, [user]);

  // Persist view mode changes to database
  const setViewMode = useCallback(async (mode: ViewMode) => {
    setViewModeState(mode);

    if (!user) return;

    try {
      await supabase
        .from('profiles')
        .update({ employer_view_mode: mode })
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error saving view mode:', error);
    }
  }, [user]);

  return (
    <EmployerViewModeContext.Provider 
      value={{ 
        viewMode, 
        setViewMode,
        isExecutive: viewMode === 'executive',
        isOperational: viewMode === 'operational',
        loading,
      }}
    >
      {children}
    </EmployerViewModeContext.Provider>
  );
}

export function useEmployerViewMode() {
  const context = useContext(EmployerViewModeContext);
  if (context === undefined) {
    throw new Error('useEmployerViewMode must be used within an EmployerViewModeProvider');
  }
  return context;
}
