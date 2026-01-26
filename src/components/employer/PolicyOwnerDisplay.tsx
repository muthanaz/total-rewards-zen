/**
 * Policy Owner Display
 * 
 * Shows policy owner with avatar and name.
 * Used in policy list table.
 */

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { User } from 'lucide-react';
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

  if (!ownerUserId || !owner) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <User className="w-4 h-4" />
        {!compact && <span className="text-sm">Unassigned</span>}
      </div>
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
