import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { 
  Plane, 
  CalendarDays,
  MapPin,
  DollarSign,
  Clock,
  FileText,
  Plus,
  History,
  CheckCircle2,
  XCircle,
  Loader2,
  Info,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';

interface PerDiemRate {
  id: string;
  destination_type: string;
  region: string;
  country: string | null;
  city: string | null;
  grade: string;
  daily_accommodation: number;
  daily_meals: number;
  daily_incidentals: number;
  daily_transport: number;
  daily_total: number;
  currency: string;
}

interface PerDiemClaim {
  id: string;
  trip_purpose: string;
  destination_type: string;
  destination_country: string;
  destination_city: string | null;
  departure_date: string;
  return_date: string;
  number_of_days: number;
  accommodation_amount: number;
  meals_amount: number;
  incidentals_amount: number;
  transport_amount: number;
  total_amount: number;
  currency: string;
  status: string;
  submitted_at: string;
  reviewer_notes: string | null;
}

const regions = [
  { value: 'UAE', label: 'UAE (Domestic)' },
  { value: 'GCC', label: 'GCC Countries' },
  { value: 'Europe', label: 'Europe' },
  { value: 'North America', label: 'North America' },
  { value: 'Asia Pacific', label: 'Asia Pacific' },
  { value: 'Middle East', label: 'Middle East (Non-GCC)' },
  { value: 'Africa', label: 'Africa' },
  { value: 'South America', label: 'South America' },
];

export default function PerDiemWidget() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    tripPurpose: '',
    destinationType: 'domestic' as 'domestic' | 'international',
    region: 'UAE',
    country: '',
    city: '',
    departureDate: undefined as Date | undefined,
    returnDate: undefined as Date | undefined,
  });

  // Fetch user's grade from profile
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('grade')
        .eq('user_id', user?.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch per diem rates for user's grade
  const { data: rates } = useQuery({
    queryKey: ['per_diem_rates', profile?.grade],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('per_diem_rates')
        .select('*')
        .eq('grade', profile?.grade || 'G5')
        .eq('is_active', true);
      if (error) throw error;
      return data as PerDiemRate[];
    },
    enabled: !!profile?.grade,
  });

  // Fetch user's per diem claims
  const { data: claims, isLoading: claimsLoading } = useQuery({
    queryKey: ['per_diem_claims', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('per_diem_claims')
        .select('*')
        .eq('user_id', user?.id)
        .order('submitted_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data as PerDiemClaim[];
    },
    enabled: !!user?.id,
  });

  // Calculate per diem amounts based on selection
  const getApplicableRate = () => {
    if (!rates || !formData.region) return null;
    return rates.find(r => r.region === formData.region);
  };

  const calculatePerDiem = () => {
    const rate = getApplicableRate();
    if (!rate || !formData.departureDate || !formData.returnDate) return null;

    const days = differenceInDays(formData.returnDate, formData.departureDate) + 1;
    return {
      days,
      accommodation: rate.daily_accommodation * days,
      meals: rate.daily_meals * days,
      incidentals: rate.daily_incidentals * days,
      transport: rate.daily_transport * days,
      total: rate.daily_total * days,
      dailyRate: rate.daily_total,
      currency: rate.currency,
    };
  };

  // Submit per diem claim
  const submitClaim = useMutation({
    mutationFn: async () => {
      const rate = getApplicableRate();
      const calculation = calculatePerDiem();
      if (!rate || !calculation) throw new Error('Unable to calculate per diem');

      const { error } = await supabase
        .from('per_diem_claims')
        .insert({
          user_id: user?.id,
          trip_purpose: formData.tripPurpose,
          destination_type: formData.destinationType,
          destination_country: formData.country || formData.region,
          destination_city: formData.city || null,
          departure_date: format(formData.departureDate!, 'yyyy-MM-dd'),
          return_date: format(formData.returnDate!, 'yyyy-MM-dd'),
          rate_id: rate.id,
          accommodation_amount: calculation.accommodation,
          meals_amount: calculation.meals,
          incidentals_amount: calculation.incidentals,
          transport_amount: calculation.transport,
          currency: calculation.currency,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['per_diem_claims'] });
      setIsDialogOpen(false);
      setFormData({
        tripPurpose: '',
        destinationType: 'domestic',
        region: 'UAE',
        country: '',
        city: '',
        departureDate: undefined,
        returnDate: undefined,
      });
      toast({
        title: 'Per Diem Claim Submitted',
        description: 'Your per diem claim has been submitted for approval.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Submission Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const calculation = calculatePerDiem();
  const applicableRate = getApplicableRate();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">Rejected</Badge>;
      case 'paid':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">Paid</Badge>;
      default:
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Pending</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <Plane className="w-5 h-5 text-accent" />
            </div>
            <div>
              <CardTitle className="text-lg">Per Diem Claims</CardTitle>
              <CardDescription>Travel daily allowances</CardDescription>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                New Claim
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Plane className="w-5 h-5" />
                  Submit Per Diem Claim
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                {/* Trip Purpose */}
                <div className="space-y-2">
                  <Label>Trip Purpose</Label>
                  <Input
                    placeholder="e.g., Client meeting in London"
                    value={formData.tripPurpose}
                    onChange={(e) => setFormData({ ...formData, tripPurpose: e.target.value })}
                  />
                </div>

                {/* Destination Type */}
                <div className="space-y-2">
                  <Label>Travel Type</Label>
                  <Select
                    value={formData.destinationType}
                    onValueChange={(v: 'domestic' | 'international') => 
                      setFormData({ 
                        ...formData, 
                        destinationType: v,
                        region: v === 'domestic' ? 'UAE' : formData.region,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="domestic">Domestic (UAE)</SelectItem>
                      <SelectItem value="international">International</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Region */}
                {formData.destinationType === 'international' && (
                  <div className="space-y-2">
                    <Label>Region</Label>
                    <Select
                      value={formData.region}
                      onValueChange={(v) => setFormData({ ...formData, region: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.filter(r => r.value !== 'UAE').map(r => (
                          <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Country & City */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input
                      placeholder="e.g., United Kingdom"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>City (Optional)</Label>
                    <Input
                      placeholder="e.g., London"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Departure Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start font-normal">
                          <CalendarDays className="w-4 h-4 mr-2" />
                          {formData.departureDate ? format(formData.departureDate, 'PP') : 'Select date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.departureDate}
                          onSelect={(d) => setFormData({ ...formData, departureDate: d })}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Return Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start font-normal">
                          <CalendarDays className="w-4 h-4 mr-2" />
                          {formData.returnDate ? format(formData.returnDate, 'PP') : 'Select date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.returnDate}
                          onSelect={(d) => setFormData({ ...formData, returnDate: d })}
                          disabled={(date) => formData.departureDate ? date < formData.departureDate : false}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Per Diem Calculation */}
                {calculation && applicableRate && (
                  <div className="p-4 rounded-lg bg-accent/5 border border-accent/20 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <DollarSign className="w-4 h-4 text-accent" />
                      Estimated Per Diem ({calculation.days} days)
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Accommodation:</span>
                        <span>{calculation.accommodation.toLocaleString()} {calculation.currency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Meals:</span>
                        <span>{calculation.meals.toLocaleString()} {calculation.currency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Incidentals:</span>
                        <span>{calculation.incidentals.toLocaleString()} {calculation.currency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Transport:</span>
                        <span>{calculation.transport.toLocaleString()} {calculation.currency}</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t flex justify-between font-semibold">
                      <span>Total:</span>
                      <span className="text-accent">{calculation.total.toLocaleString()} {calculation.currency}</span>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Daily rate: {calculation.dailyRate.toLocaleString()} {calculation.currency}/day for your grade ({profile?.grade})
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button 
                  onClick={() => submitClaim.mutate()}
                  disabled={!calculation || !formData.tripPurpose || submitClaim.isPending}
                >
                  {submitClaim.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Submit Claim
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Recent Claims */}
        {claimsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : claims && claims.length > 0 ? (
          <div className="space-y-2">
            {claims.slice(0, 3).map((claim) => (
              <div key={claim.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    claim.destination_type === 'international' ? "bg-blue-500/10" : "bg-emerald-500/10"
                  )}>
                    <Plane className={cn(
                      "w-4 h-4",
                      claim.destination_type === 'international' ? "text-blue-500" : "text-emerald-500"
                    )} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{claim.trip_purpose}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {claim.destination_city ? `${claim.destination_city}, ` : ''}{claim.destination_country}
                      <span>•</span>
                      <Clock className="w-3 h-3" />
                      {claim.number_of_days} days
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(claim.status)}
                  <p className="text-sm font-semibold mt-1">
                    {claim.total_amount?.toLocaleString()} {claim.currency}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <Plane className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No per diem claims yet</p>
            <p className="text-xs">Submit your first travel claim</p>
          </div>
        )}

        {/* Quick Stats */}
        {claims && claims.length > 0 && (
          <div className="grid grid-cols-3 gap-2 pt-2 border-t">
            <div className="text-center">
              <p className="text-lg font-bold text-accent">
                {claims.filter(c => c.status === 'pending').length}
              </p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-emerald-500">
                {claims.filter(c => c.status === 'approved' || c.status === 'paid').length}
              </p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">
                {claims.reduce((acc, c) => acc + (c.total_amount || 0), 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Total AED</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
