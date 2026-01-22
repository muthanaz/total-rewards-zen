/**
 * Executive Mode Context
 * 
 * Provides toggle between "Board-ready" (minimal: KPIs + actions) 
 * and "CFO-style" (adds deeper breakdowns and trends) modes.
 */

import { createContext, useContext, useState, ReactNode } from 'react';

export type ExecModeType = 'board' | 'cfo';

interface ExecModeContextType {
  mode: ExecModeType;
  setMode: (mode: ExecModeType) => void;
  isBoard: boolean;
  isCFO: boolean;
}

const ExecModeContext = createContext<ExecModeContextType | undefined>(undefined);

interface ExecModeProviderProps {
  children: ReactNode;
  defaultMode?: ExecModeType;
}

export function ExecModeProvider({ children, defaultMode = 'board' }: ExecModeProviderProps) {
  const [mode, setMode] = useState<ExecModeType>(defaultMode);

  return (
    <ExecModeContext.Provider
      value={{
        mode,
        setMode,
        isBoard: mode === 'board',
        isCFO: mode === 'cfo',
      }}
    >
      {children}
    </ExecModeContext.Provider>
  );
}

export function useExecMode() {
  const context = useContext(ExecModeContext);
  if (!context) {
    // Return default values if not within provider
    return {
      mode: 'board' as ExecModeType,
      setMode: () => {},
      isBoard: true,
      isCFO: false,
    };
  }
  return context;
}
