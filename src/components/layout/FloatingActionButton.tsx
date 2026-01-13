import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Plus,
  FileText,
  MessageCircle,
  X,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

interface FABAction {
  label: string;
  labelAr: string;
  icon: React.ElementType;
  action: () => void;
  color: string;
}

export function FloatingActionButton() {
  const navigate = useNavigate();
  const { language, direction } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const isRTL = direction === 'rtl';

  const actions: FABAction[] = [
    {
      label: 'Submit Claim',
      labelAr: 'تقديم مطالبة',
      icon: FileText,
      action: () => {
        navigate('/employee/documents');
        setIsOpen(false);
      },
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      label: 'Ask HR',
      labelAr: 'سؤال الموارد البشرية',
      icon: MessageCircle,
      action: () => {
        navigate('/employee/documents');
        setIsOpen(false);
      },
      color: 'from-blue-500 to-blue-600',
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* FAB Container */}
      <div className={cn(
        "fixed z-50 lg:hidden",
        isRTL ? "left-4 bottom-24" : "right-4 bottom-24"
      )}>
        {/* Action Buttons */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-16 right-0 space-y-3"
            >
              {actions.map((action, index) => (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={action.action}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 shadow-xl",
                    "hover:scale-105 transition-transform",
                    isRTL && "flex-row-reverse"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-xl bg-gradient-to-br text-white",
                    action.color
                  )}>
                    <action.icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium whitespace-nowrap">
                    {language === 'ar' ? action.labelAr : action.label}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main FAB */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "fab",
            isOpen && "bg-gradient-to-r from-slate-700 to-slate-800"
          )}
          whileTap={{ scale: 0.95 }}
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Plus className="w-6 h-6" />
          )}
        </motion.button>
      </div>
    </>
  );
}
