/**
 * Approver Groups Settings Page
 * Manage groups of approvers for workflow assignments
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Users, 
  Plus, 
  Trash2, 
  UserPlus,
  Edit,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useApproverGroups, ApproverGroup } from '@/hooks/useApproverGroups';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ApproverGroupsPage() {
  const { direction } = useLanguage();
  const isRTL = direction === 'rtl';
  const { groups, isLoading, createGroup, deleteGroup, addMember, removeMember, isCreating } = useApproverGroups();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<ApproverGroup | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');

  // Fetch org members for adding to groups
  const { data: orgMembers } = useQuery({
    queryKey: ['org_members'],
    queryFn: async () => {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();
      
      if (!userProfile?.organization_id) return [];
      
      const { data } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, email')
        .eq('organization_id', userProfile.organization_id);
      
      return data || [];
    },
  });

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    
    await createGroup.mutateAsync({
      name: newGroupName,
      description: newGroupDescription || undefined,
    });
    
    setNewGroupName('');
    setNewGroupDescription('');
    setCreateDialogOpen(false);
  };

  const handleAddMember = async () => {
    if (!selectedGroup || !selectedUserId) return;
    
    await addMember.mutateAsync({
      groupId: selectedGroup.id,
      userId: selectedUserId,
    });
    
    setSelectedUserId('');
    setAddMemberDialogOpen(false);
  };

  const handleOpenAddMember = (group: ApproverGroup) => {
    setSelectedGroup(group);
    setAddMemberDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {isRTL ? 'مجموعات الموافقين' : 'Approver Groups'}
            </h1>
            <p className="text-muted-foreground">
              {isRTL 
                ? 'إدارة مجموعات الموافقين لسير عمل الموافقات'
                : 'Manage groups of approvers for workflow assignments'
              }
            </p>
          </div>
        </div>
        
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          {isRTL ? 'إنشاء مجموعة' : 'Create Group'}
        </Button>
      </div>

      {/* Groups Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="py-8">
                <div className="h-4 bg-muted rounded w-1/3 mb-2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {isRTL ? 'لا توجد مجموعات' : 'No Approver Groups'}
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              {isRTL 
                ? 'أنشئ مجموعة أولى لتعيين الموافقين'
                : 'Create your first group to assign approvers'
              }
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {isRTL ? 'إنشاء مجموعة' : 'Create Group'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((group) => (
            <Card key={group.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    {group.description && (
                      <CardDescription className="mt-1">{group.description}</CardDescription>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenAddMember(group)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Member
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => deleteGroup.mutate(group.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Group
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Members</span>
                    <Badge variant="secondary">{group.members?.length || 0}</Badge>
                  </div>
                  
                  {group.members && group.members.length > 0 ? (
                    <div className="space-y-2">
                      {group.members.map((member) => (
                        <div 
                          key={member.id} 
                          className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-medium text-primary">
                                {member.profile?.first_name?.[0] || 'U'}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {member.profile?.first_name} {member.profile?.last_name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {member.profile?.email}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => removeMember.mutate(member.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No members yet
                    </p>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => handleOpenAddMember(group)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Group Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isRTL ? 'إنشاء مجموعة موافقين' : 'Create Approver Group'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{isRTL ? 'اسم المجموعة' : 'Group Name'} *</Label>
              <Input
                id="name"
                placeholder={isRTL ? 'مثل: قيادة المالية' : 'e.g., Finance Leads'}
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">{isRTL ? 'الوصف' : 'Description'}</Label>
              <Textarea
                id="description"
                placeholder={isRTL ? 'وصف اختياري...' : 'Optional description...'}
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button 
              onClick={handleCreateGroup} 
              disabled={!newGroupName.trim() || isCreating}
            >
              {isRTL ? 'إنشاء' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={addMemberDialogOpen} onOpenChange={setAddMemberDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isRTL ? 'إضافة عضو إلى' : 'Add Member to'} {selectedGroup?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{isRTL ? 'اختر عضو' : 'Select Member'}</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder={isRTL ? 'اختر عضو...' : 'Select a member...'} />
                </SelectTrigger>
                <SelectContent>
                  {orgMembers?.filter(m => 
                    !selectedGroup?.members?.some(gm => gm.user_id === m.user_id)
                  ).map((member) => (
                    <SelectItem key={member.user_id} value={member.user_id}>
                      {member.first_name} {member.last_name} ({member.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMemberDialogOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button 
              onClick={handleAddMember} 
              disabled={!selectedUserId}
            >
              {isRTL ? 'إضافة' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
