import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Send,
  Clock,
  FileEdit,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  Eye,
  Copy,
  Trash2,
  Play,
  Pause,
  BarChart3,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Campaign, PURPOSE_CONFIG } from './types';
import { format } from 'date-fns';

interface CampaignTableProps {
  campaigns: Campaign[];
  onView: (campaign: Campaign) => void;
  onEdit: (campaign: Campaign) => void;
  onDuplicate: (campaign: Campaign) => void;
  onDelete: (campaign: Campaign) => void;
  onSend: (campaign: Campaign) => void;
  onCancel: (campaign: Campaign) => void;
}

const statusConfig = {
  draft: { label: 'Draft', icon: FileEdit, color: 'bg-muted text-muted-foreground' },
  scheduled: { label: 'Scheduled', icon: Clock, color: 'bg-primary/10 text-primary border-primary/30' },
  sending: { label: 'Sending', icon: Send, color: 'bg-warning/10 text-warning border-warning/30' },
  sent: { label: 'Sent', icon: CheckCircle2, color: 'bg-success/10 text-success border-success/30' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'bg-destructive/10 text-destructive border-destructive/30' },
};

export function CampaignTable({
  campaigns,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
  onSend,
  onCancel,
}: CampaignTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Campaign</TableHead>
            <TableHead>Purpose</TableHead>
            <TableHead>Audience</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Recipients</TableHead>
            <TableHead className="text-right">Open Rate</TableHead>
            <TableHead className="text-right">Action Rate</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => {
            const status = statusConfig[campaign.status];
            const StatusIcon = status.icon;
            const purpose = PURPOSE_CONFIG[campaign.purpose];

            return (
              <TableRow key={campaign.id} className="hover:bg-muted/30">
                <TableCell>
                  <button
                    onClick={() => onView(campaign)}
                    className="text-left hover:text-primary"
                  >
                    <p className="font-medium text-sm">{campaign.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {campaign.sentAt 
                        ? `Sent ${format(new Date(campaign.sentAt), 'dd MMM yyyy')}`
                        : campaign.scheduledAt
                        ? `Scheduled ${format(new Date(campaign.scheduledAt), 'dd MMM yyyy')}`
                        : `Created ${format(new Date(campaign.createdAt), 'dd MMM yyyy')}`
                      }
                    </p>
                  </button>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn('text-[10px]', purpose.color)}>
                    {purpose.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm">
                      {campaign.audienceType === 'all' 
                        ? 'All Employees' 
                        : campaign.audienceType === 'segment'
                        ? campaign.segment?.name || 'Segment'
                        : 'Custom Filter'
                      }
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn('gap-1 text-xs', status.color)}>
                    <StatusIcon className="w-3 h-3" />
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums font-medium">
                  {campaign.metrics?.totalRecipients ?? campaign.estimatedRecipients}
                </TableCell>
                <TableCell className="text-right">
                  {campaign.metrics ? (
                    <span className={cn(
                      'tabular-nums font-medium',
                      campaign.metrics.openRate >= 50 ? 'text-success' :
                      campaign.metrics.openRate >= 30 ? 'text-warning' : ''
                    )}>
                      {campaign.metrics.openRate.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {campaign.metrics ? (
                    <span className="tabular-nums font-semibold text-primary">
                      {campaign.metrics.actionRate.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(campaign)}>
                        {campaign.metrics ? (
                          <>
                            <BarChart3 className="w-4 h-4 mr-2" />
                            View Metrics
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </>
                        )}
                      </DropdownMenuItem>
                      {campaign.status === 'draft' && (
                        <>
                          <DropdownMenuItem onClick={() => onEdit(campaign)}>
                            <FileEdit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onSend(campaign)}>
                            <Send className="w-4 h-4 mr-2" />
                            Send Now
                          </DropdownMenuItem>
                        </>
                      )}
                      {campaign.status === 'scheduled' && (
                        <DropdownMenuItem onClick={() => onCancel(campaign)}>
                          <Pause className="w-4 h-4 mr-2" />
                          Cancel
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onDuplicate(campaign)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      {campaign.status === 'draft' && (
                        <DropdownMenuItem 
                          onClick={() => onDelete(campaign)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
