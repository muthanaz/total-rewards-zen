import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface DemoModeContextType {
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  setDemoMode: (enabled: boolean) => void;
  showDemoTips: boolean;
  toggleDemoTips: () => void;
  demoScenario: DemoScenario;
  setDemoScenario: (scenario: DemoScenario) => void;
}

export type DemoScenario = 'default' | 'high_utilization' | 'low_engagement' | 'policy_review';

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

// Check if we're in a demo-enabled environment
const isDemoEnvironment = () => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  const devHostnames = ['localhost', '127.0.0.1', 'lovableproject.com', 'lovable.app'];
  return devHostnames.some(dev => hostname.includes(dev));
};

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('bnft_demo_mode');
    return stored === 'true' && isDemoEnvironment();
  });
  
  const [showDemoTips, setShowDemoTips] = useState(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem('bnft_demo_tips');
    return stored !== 'false';
  });
  
  const [demoScenario, setDemoScenario] = useState<DemoScenario>('default');

  useEffect(() => {
    localStorage.setItem('bnft_demo_mode', String(isDemoMode));
  }, [isDemoMode]);

  useEffect(() => {
    localStorage.setItem('bnft_demo_tips', String(showDemoTips));
  }, [showDemoTips]);

  const toggleDemoMode = () => {
    if (isDemoEnvironment()) {
      setIsDemoMode(prev => !prev);
    }
  };

  const setDemoMode = (enabled: boolean) => {
    if (isDemoEnvironment()) {
      setIsDemoMode(enabled);
    }
  };

  const toggleDemoTips = () => setShowDemoTips(prev => !prev);

  return (
    <DemoModeContext.Provider value={{
      isDemoMode,
      toggleDemoMode,
      setDemoMode,
      showDemoTips,
      toggleDemoTips,
      demoScenario,
      setDemoScenario,
    }}>
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  const context = useContext(DemoModeContext);
  if (context === undefined) {
    throw new Error('useDemoMode must be used within a DemoModeProvider');
  }
  return context;
}

// Hook for checking if demo mode is active (safe to use anywhere)
export function useIsDemo() {
  const context = useContext(DemoModeContext);
  return context?.isDemoMode ?? false;
}
