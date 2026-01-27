/**
 * Policy Owner Display
 * 
 * Shows policy owner with avatar and name.
 * If no owner is assigned, shows an "Unassigned" warning badge.
 * Used in policy list table.
 */

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { User, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PolicyOwnerDisplayProps {
  ownerUserId: string | null;
  compact?: boolean;
}

export function PolicyOwnerDisplay({ ownerUserId, compact = false }: PolicyOwnerDisplayProps) {
  const { data: owner } = useQuery({
    queryKey: ['policy_owner', ownerUserId],
    queryFn: async () => {
      if (!ownerUserId) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, email, avatar_url')
        .eq('user_id', ownerUserId)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!ownerUserId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // No owner assigned - show warning badge
  if (!ownerUserId || !owner) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className="gap-1 bg-warning/10 text-warning border-warning/30 cursor-help"
          >
            <AlertCircle className="w-3 h-3" />
            {!compact && <span className="text-xs">Unassigned</span>}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">No policy owner assigned. Assign an owner for accountability.</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  const displayName = owner.first_name && owner.last_name
    ? `${owner.first_name} ${owner.last_name}`
    : owner.email || 'Unknown';
  
  const initials = owner.first_name && owner.last_name
    ? `${owner.first_name[0]}${owner.last_name[0]}`
    : owner.email?.[0]?.toUpperCase() || '?';

  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Avatar className="w-6 h-6">
            <AvatarImage src={owner.avatar_url || undefined} alt={displayName} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{displayName}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Avatar className="w-6 h-6">
        <AvatarImage src={owner.avatar_url || undefined} alt={displayName} />
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
      <span className="text-sm truncate max-w-[120px]">{displayName}</span>
    </div>
  );
}
