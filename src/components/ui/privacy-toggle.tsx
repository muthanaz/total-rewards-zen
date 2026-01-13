import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PrivacyToggleProps {
  value: string;
  isHidden?: boolean;
  onToggle?: (hidden: boolean) => void;
  maskCharacter?: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

export function PrivacyToggle({
  value,
  isHidden: controlledHidden,
  onToggle,
  maskCharacter = '•',
  className,
  size = 'default',
}: PrivacyToggleProps) {
  const [internalHidden, setInternalHidden] = useState(false);
  
  // Use controlled state if provided, otherwise use internal state
  const isHidden = controlledHidden !== undefined ? controlledHidden : internalHidden;
  
  const handleToggle = () => {
    const newValue = !isHidden;
    if (onToggle) {
      onToggle(newValue);
    } else {
      setInternalHidden(newValue);
    }
  };

  // Create masked version of the value
  const maskedValue = value.replace(/[0-9]/g, maskCharacter);

  const sizeClasses = {
    sm: 'h-5 w-5',
    default: 'h-6 w-6',
    lg: 'h-7 w-7',
  };

  const iconSizeClasses = {
    sm: 'h-3 w-3',
    default: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className={cn(
        "transition-all duration-200",
        isHidden && "blur-[3px] select-none"
      )}>
        {isHidden ? maskedValue : value}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          sizeClasses[size],
          "text-muted-foreground hover:text-foreground shrink-0"
        )}
        onClick={(e) => {
          e.stopPropagation();
          handleToggle();
        }}
        aria-label={isHidden ? 'Show value' : 'Hide value'}
      >
        {isHidden ? (
          <Eye className={iconSizeClasses[size]} />
        ) : (
          <EyeOff className={iconSizeClasses[size]} />
        )}
      </Button>
    </span>
  );
}

// Hook to manage privacy state across the app
import { createContext, useContext, ReactNode } from 'react';

interface PrivacyContextType {
  salaryHidden: boolean;
  setSalaryHidden: (hidden: boolean) => void;
  toggleSalaryVisibility: () => void;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const [salaryHidden, setSalaryHidden] = useState(false);
  
  const toggleSalaryVisibility = () => setSalaryHidden(prev => !prev);

  return (
    <PrivacyContext.Provider value={{ salaryHidden, setSalaryHidden, toggleSalaryVisibility }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  const context = useContext(PrivacyContext);
  if (context === undefined) {
    throw new Error('usePrivacy must be used within a PrivacyProvider');
  }
  return context;
}
