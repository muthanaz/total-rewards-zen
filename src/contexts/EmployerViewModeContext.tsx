import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ViewMode = 'executive' | 'operational';

interface EmployerViewModeContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isExecutive: boolean;
  isOperational: boolean;
}

const EmployerViewModeContext = createContext<EmployerViewModeContextType | undefined>(undefined);

export function EmployerViewModeProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>('operational'); // Default to operational

  return (
    <EmployerViewModeContext.Provider 
      value={{ 
        viewMode, 
        setViewMode,
        isExecutive: viewMode === 'executive',
        isOperational: viewMode === 'operational',
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
