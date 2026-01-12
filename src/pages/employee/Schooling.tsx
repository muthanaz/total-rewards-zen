import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { GraduationCap, Search, Star, ExternalLink, MapPin, Users, BookOpen, Filter, Calculator } from 'lucide-react';
import { useSchools, useChildren } from '@/hooks/useSupabaseData';

const ALLOWANCE_PER_CHILD = 30000; // Demo allowance per child

export default function SchoolingPage() {
  const { data: schools = [] } = useSchools();
  const { data: children = [] } = useChildren();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [curriculum, setCurriculum] = useState<string>('all');
  const [gradeRange, setGradeRange] = useState<string>('all');
  const [maxFee, setMaxFee] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('net_cost');

  const numberOfChildren = children.length || 2; // Default to 2 for demo
  const totalAllowance = ALLOWANCE_PER_CHILD * numberOfChildren;
  const utilized = 42000; // Demo
  const remaining = totalAllowance - utilized;
  const utilizationPercent = Math.round((utilized / totalAllowance) * 100);

  const curriculums = useMemo(() => {
    const unique = [...new Set(schools.map(s => s.curriculum))];
    return unique.sort();
  }, [schools]);

  const filteredSchools = useMemo(() => {
    let filtered = [...schools];

    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.curriculum.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (curriculum !== 'all') {
      filtered = filtered.filter(s => s.curriculum === curriculum);
    }

    if (gradeRange !== 'all') {
      filtered = filtered.filter(s => s.grade_range.includes(gradeRange));
    }

    if (maxFee !== 'all') {
      filtered = filtered.filter(s => s.annual_fee <= parseInt(maxFee));
    }

    // Sort
    switch (sortBy) {
      case 'net_cost':
        filtered.sort((a, b) => {
          const aNet = Math.max(0, a.annual_fee - ALLOWANCE_PER_CHILD);
          const bNet = Math.max(0, b.annual_fee - ALLOWANCE_PER_CHILD);
          return aNet - bNet;
        });
        break;
      case 'fee':
        filtered.sort((a, b) => a.annual_fee - b.annual_fee);
        break;
      case 'fee_desc':
        filtered.sort((a, b) => b.annual_fee - a.annual_fee);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }

    return filtered;
  }, [schools, searchTerm, curriculum, gradeRange, maxFee, sortBy]);

  const formatCurrency = (value: number) => `AED ${value.toLocaleString()}`;

  const getNetCost = (fee: number) => {
    const netCost = Math.max(0, fee - ALLOWANCE_PER_CHILD);
    return netCost;
  };

  const getAffordabilityLabel = (fee: number) => {
    const netCost = getNetCost(fee);
    if (netCost === 0) {
      return <Badge className="bg-success/10 text-success border-0">Fully Covered</Badge>;
    }
    return <Badge className="bg-warning/10 text-warning border-0">You Pay: {formatCurrency(netCost)}</Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
          <GraduationCap className="w-7 h-7 text-accent" />
          Education Allowance
        </h1>
        <p className="text-muted-foreground mt-1">
          Find schools for your children and see your net cost after allowance
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-5 gap-4">
        <Card className="metric-card">
          <div className="flex items-start justify-between">
            <Users className="w-5 h-5 text-accent" />
            <InfoTooltip formula="Registered children in profile" dataSource="HR System" />
          </div>
          <p className="stat-value mt-3">{numberOfChildren}</p>
          <p className="stat-label">Children</p>
        </Card>

        <Card className="metric-card">
          <div className="flex items-start justify-between">
            <Calculator className="w-5 h-5 text-accent" />
            <InfoTooltip formula="AED 30,000 × number of children" dataSource="HR Policy" />
          </div>
          <p className="stat-value mt-3">{formatCurrency(totalAllowance)}</p>
          <p className="stat-label">Total Allowance</p>
        </Card>

        <Card className="metric-card">
          <div className="flex items-start justify-between">
            <GraduationCap className="w-5 h-5 text-accent" />
            <InfoTooltip formula="School fees paid via allowance" dataSource="Benefits System" />
          </div>
          <p className="stat-value mt-3">{formatCurrency(utilized)}</p>
          <p className="stat-label">Utilized</p>
        </Card>

        <Card className="metric-card">
          <div className="flex items-start justify-between">
            <GraduationCap className="w-5 h-5 text-accent" />
            <InfoTooltip formula="Total Allowance - Utilized" dataSource="System" />
          </div>
          <p className="stat-value mt-3">{formatCurrency(remaining)}</p>
          <p className="stat-label">Remaining</p>
        </Card>

        <Card className="metric-card">
          <div className="flex items-start justify-between">
            <GraduationCap className="w-5 h-5 text-accent" />
            <InfoTooltip formula="(Utilized / Allowance) × 100" dataSource="System" />
          </div>
          <p className="stat-value mt-3">{utilizationPercent}%</p>
          <p className="stat-label">Utilization</p>
          <Progress value={utilizationPercent} className="h-2 mt-2" />
        </Card>
      </div>

      {/* Policy Highlights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-display">Policy Highlights</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              AED 30,000 per child per academic year
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              Covers children aged 4–18 years
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              Tuition fees only (excludes transport, uniform)
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              Direct payment to school or reimbursement
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              Fee receipts required for processing
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              Top-up from salary for excess fees
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Sibling Optimizer (Demo) */}
      <Card className="bg-accent/5 border-accent/20">
        <CardHeader>
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Calculator className="w-5 h-5 text-accent" />
            Sibling Optimizer (Demo)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This tool helps you allocate your education allowance optimally across multiple children.
            Currently showing default allocation: equal split of {formatCurrency(ALLOWANCE_PER_CHILD)} per child.
          </p>
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: numberOfChildren }, (_, i) => (
              <div key={i} className="flex items-center gap-2 bg-card rounded-lg px-4 py-2 border">
                <GraduationCap className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">Child {i + 1}:</span>
                <span className="text-sm">{formatCurrency(ALLOWANCE_PER_CHILD)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search schools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={curriculum} onValueChange={setCurriculum}>
              <SelectTrigger className="w-full md:w-44">
                <SelectValue placeholder="Curriculum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Curriculums</SelectItem>
                {curriculums.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={gradeRange} onValueChange={setGradeRange}>
              <SelectTrigger className="w-full md:w-44">
                <SelectValue placeholder="Grade Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                <SelectItem value="KG">Kindergarten</SelectItem>
                <SelectItem value="Primary">Primary</SelectItem>
                <SelectItem value="Secondary">Secondary</SelectItem>
              </SelectContent>
            </Select>

            <Select value={maxFee} onValueChange={setMaxFee}>
              <SelectTrigger className="w-full md:w-44">
                <SelectValue placeholder="Max Fee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Fee</SelectItem>
                <SelectItem value="30000">Within Allowance</SelectItem>
                <SelectItem value="50000">Up to 50K</SelectItem>
                <SelectItem value="80000">Up to 80K</SelectItem>
                <SelectItem value="100000">Up to 100K</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-44">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="net_cost">Lowest Net Cost</SelectItem>
                <SelectItem value="fee">Fee: Low to High</SelectItem>
                <SelectItem value="fee_desc">Fee: High to Low</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Schools Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSchools.map((school) => (
          <Card key={school.id} className="benefit-card">
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-sm line-clamp-2">{school.name}</h3>
                {school.rating && (
                  <span className="flex items-center gap-1 text-sm text-warning shrink-0">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {school.rating}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{school.curriculum}</Badge>
                <Badge variant="outline">{school.grade_range}</Badge>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" />
                {school.location}
              </div>

              <div className="space-y-2 pt-2 border-t border-border/50">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Annual Fee</span>
                  <span className="font-medium">{formatCurrency(school.annual_fee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Allowance Applied</span>
                  <span className="text-success">−{formatCurrency(Math.min(school.annual_fee, ALLOWANCE_PER_CHILD))}</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span>You Pay</span>
                  <span>{formatCurrency(getNetCost(school.annual_fee))}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                {getAffordabilityLabel(school.annual_fee)}
              </div>

              {school.facilities && school.facilities.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {school.facilities.slice(0, 3).map((facility, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {facility}
                    </Badge>
                  ))}
                  {school.facilities.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{school.facilities.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              <div className="pt-2">
                <Button size="sm" variant="outline" className="w-full" asChild>
                  <a href={school.website_url || '#'} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3.5 h-3.5 mr-1" />
                    Visit Website
                  </a>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredSchools.length === 0 && (
        <Card className="p-12 text-center">
          <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground/50" />
          <p className="mt-4 text-muted-foreground">No schools match your filters</p>
        </Card>
      )}

      {/* View Full Policy */}
      <div className="text-center">
        <Button variant="outline">View Full Education Policy</Button>
      </div>
    </div>
  );
}
