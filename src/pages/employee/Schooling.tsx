import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { SummaryStatsCard } from '@/components/ui/summary-stats-card';
import { PolicyHighlightsCard } from '@/components/employee/PolicyHighlightsCard';
import { NoSearchResults } from '@/components/ui/empty-state';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  GraduationCap, Search, Star, ExternalLink, MapPin, Users, BookOpen, 
  Calculator, Wallet, TrendingUp, User, ChevronRight, Check, Info,
  School, Baby, Building2
} from 'lucide-react';
import { useSchools, useChildren } from '@/hooks/useSupabaseData';

const ALLOWANCE_PER_CHILD = 30000;

// Demo children data with more details
const demoChildren = [
  { id: '1', name: 'Sarah', age: 6, grade: 'Grade 1', gradeLevel: 'Primary', selectedSchool: null, schoolFee: 0 },
  { id: '2', name: 'Ahmed', age: 14, grade: 'Grade 9', gradeLevel: 'Secondary', selectedSchool: null, schoolFee: 0 },
];

interface ChildAllocation {
  id: string;
  name: string;
  age: number;
  grade: string;
  gradeLevel: string;
  selectedSchool: string | null;
  schoolFee: number;
}

export default function SchoolingPage() {
  const { data: schools = [] } = useSchools();
  const { data: dbChildren = [] } = useChildren();
  
  const [childrenAllocations, setChildrenAllocations] = useState<ChildAllocation[]>(demoChildren);
  const [activeChildId, setActiveChildId] = useState<string>(demoChildren[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [curriculum, setCurriculum] = useState<string>('all');
  const [city, setCity] = useState<string>('Dubai'); // Default from profile
  const [maxFee, setMaxFee] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('net_cost');

  const cities = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'];

  const numberOfChildren = childrenAllocations.length;
  const totalAllowance = ALLOWANCE_PER_CHILD * numberOfChildren;
  
  // Calculate totals based on selected schools
  const totalSchoolFees = childrenAllocations.reduce((sum, c) => sum + c.schoolFee, 0);
  const totalCoveredByAllowance = childrenAllocations.reduce((sum, c) => sum + Math.min(c.schoolFee, ALLOWANCE_PER_CHILD), 0);
  const totalOutOfPocket = childrenAllocations.reduce((sum, c) => sum + Math.max(0, c.schoolFee - ALLOWANCE_PER_CHILD), 0);
  const unusedAllowance = childrenAllocations.reduce((sum, c) => sum + Math.max(0, ALLOWANCE_PER_CHILD - c.schoolFee), 0);
  const utilizationPercent = totalAllowance > 0 ? Math.round((totalCoveredByAllowance / totalAllowance) * 100) : 0;
  const allChildrenHaveSchools = childrenAllocations.every(c => c.selectedSchool !== null);

  const activeChild = childrenAllocations.find(c => c.id === activeChildId);

  const curriculums = useMemo(() => {
    const unique = [...new Set(schools.map(s => s.curriculum))];
    return unique.sort();
  }, [schools]);

  // Filter schools based on active child's grade level
  const filteredSchools = useMemo(() => {
    let filtered = [...schools];

    // Filter by grade level matching child
    if (activeChild?.gradeLevel) {
      filtered = filtered.filter(s => 
        s.grade_range.toLowerCase().includes(activeChild.gradeLevel.toLowerCase()) ||
        s.grade_range.includes('KG-12') ||
        s.grade_range.includes('All')
      );
    }

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

    // Filter by city/location
    if (city) {
      filtered = filtered.filter(s => 
        s.location.toLowerCase().includes(city.toLowerCase())
      );
    }

    if (maxFee !== 'all') {
      filtered = filtered.filter(s => s.annual_fee <= parseInt(maxFee));
    }

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
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }

    return filtered;
  }, [schools, searchTerm, curriculum, city, maxFee, sortBy, activeChild]);

  const formatCurrency = (value: number) => `AED ${value.toLocaleString()}`;

  const handleSelectSchool = (schoolId: string, schoolName: string, fee: number) => {
    setChildrenAllocations(prev => prev.map(c => {
      if (c.id !== activeChildId) return c;
      // Toggle: if same school is clicked, deselect it
      if (c.selectedSchool === schoolName) {
        return { ...c, selectedSchool: null, schoolFee: 0 };
      }
      return { ...c, selectedSchool: schoolName, schoolFee: fee };
    }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCurriculum('all');
    setMaxFee('all');
    setSortBy('net_cost');
  };

  const getGradeIcon = (gradeLevel: string) => {
    switch (gradeLevel) {
      case 'Primary': return School;
      case 'Secondary': return Building2;
      default: return Baby;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
          <GraduationCap className="w-7 h-7 text-accent" />
          Schooling Allowance
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure education for each child individually — each child gets their own AED 30,000 allowance
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <SummaryStatsCard
          variant="info"
          label="Children"
          value={numberOfChildren.toString()}
          icon={Users}
          formula="Registered children in profile"
          dataSource="HR System"
          index={0}
        />
        <SummaryStatsCard
          variant="primary"
          label="Total Allowance"
          value={formatCurrency(totalAllowance)}
          icon={Wallet}
          formula={`AED 30,000 × ${numberOfChildren} children`}
          dataSource="HR Policy"
          index={1}
        />
        <SummaryStatsCard
          variant="utilized"
          label="School Fees"
          value={formatCurrency(totalSchoolFees)}
          icon={GraduationCap}
          formula="Sum of all selected school fees"
          dataSource="Your Selections"
          index={2}
        />
        <SummaryStatsCard
          variant="remaining"
          label="You Pay (Out of Pocket)"
          value={formatCurrency(totalOutOfPocket)}
          icon={Calculator}
          formula="Fees exceeding AED 30,000 per child"
          dataSource="System"
          index={3}
        />
        <SummaryStatsCard
          variant="utilization"
          label="Allowance Used"
          value={`${utilizationPercent}%`}
          icon={TrendingUp}
          formula="Amount covered by allowance"
          dataSource="System"
          progress={utilizationPercent}
          index={4}
        />
      </div>

      {/* Policy Highlights */}
      <PolicyHighlightsCard
        title="Policy Highlights"
        policies={[
          'AED 30,000 allowance per child per year',
          'Allowances do not combine between children',
          'Each child can attend different schools',
          'Excess fees deducted from monthly salary',
          'Direct payment to approved schools',
          'Covers tuition, registration, and books',
        ]}
        category="Education"
        actionLabel="Submit Claim"
        policyLabel="View Full Policy"
        showClaimButton={true}
      />

      {/* How It Works Card */}
      <Card className="border-accent/30 bg-gradient-to-r from-accent/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Info className="w-5 h-5 text-accent" />
            How Your Schooling Allowance Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card border">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm shrink-0">1</div>
              <div>
                <p className="font-medium text-sm">Per-Child Allowance</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Each child receives <span className="font-semibold text-accent">AED 30,000</span> per year — allowances are separate and do not combine
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card border">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm shrink-0">2</div>
              <div>
                <p className="font-medium text-sm">Different Schools OK</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Each child can attend a different school — you choose what's best for their age and needs
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card border">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm shrink-0">3</div>
              <div>
                <p className="font-medium text-sm">Top-Up If Needed</p>
                <p className="text-xs text-muted-foreground mt-1">
                  If school fees exceed AED 30,000, the extra is deducted from your salary automatically
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Children Allocation Cards */}
      <div>
        <h2 className="text-lg font-display font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-accent" />
          Your Children's Education
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {childrenAllocations.map((child, index) => {
            const GradeIcon = getGradeIcon(child.gradeLevel);
            const netCost = Math.max(0, child.schoolFee - ALLOWANCE_PER_CHILD);
            const covered = Math.min(child.schoolFee, ALLOWANCE_PER_CHILD);
            const isActive = child.id === activeChildId;
            
            return (
              <Card 
                key={child.id} 
                className={`cursor-pointer transition-all duration-300 ${
                  isActive 
                    ? 'ring-2 ring-accent border-accent shadow-lg' 
                    : 'hover:border-accent/40 hover:shadow-md'
                }`}
                onClick={() => setActiveChildId(child.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isActive ? 'bg-accent text-accent-foreground' : 'bg-accent/10 text-accent'
                      }`}>
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{child.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <GradeIcon className="w-3.5 h-3.5" />
                          <span>{child.grade} • {child.age} years old</span>
                        </div>
                      </div>
                    </div>
                    {isActive && (
                      <Badge className="bg-accent text-accent-foreground">Editing</Badge>
                    )}
                  </div>

                  <div className="mt-4 p-3 rounded-lg bg-muted/30 border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Allowance for {child.name}</span>
                      <span className="text-sm font-bold text-accent">{formatCurrency(ALLOWANCE_PER_CHILD)}</span>
                    </div>
                    
                    {child.selectedSchool ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-success" />
                          <span className="text-sm font-medium">{child.selectedSchool}</span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">School Fee</span>
                            <span>{formatCurrency(child.schoolFee)}</span>
                          </div>
                          <div className="flex justify-between text-success">
                            <span>Covered by Allowance</span>
                            <span>−{formatCurrency(covered)}</span>
                          </div>
                          <div className="flex justify-between font-medium pt-1 border-t">
                            <span>You Pay</span>
                            <span className={netCost > 0 ? 'text-warning' : 'text-success'}>
                              {netCost > 0 ? formatCurrency(netCost) : 'Nothing!'}
                            </span>
                          </div>
                        </div>
                        <Progress 
                          value={Math.min(100, (child.schoolFee / ALLOWANCE_PER_CHILD) * 100)} 
                          className="h-2 mt-2"
                        />
                        <p className="text-[11px] text-muted-foreground text-center">
                          {child.schoolFee <= ALLOWANCE_PER_CHILD 
                            ? `${formatCurrency(ALLOWANCE_PER_CHILD - child.schoolFee)} remaining from allowance`
                            : `${formatCurrency(netCost)} above allowance (salary deduction)`
                          }
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-3">
                        <p className="text-sm text-muted-foreground">No school selected yet</p>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-2"
                          onClick={(e) => { e.stopPropagation(); setActiveChildId(child.id); }}
                        >
                          Browse Schools for {child.name}
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* School Selection for Active Child */}
      {activeChild && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <School className="w-5 h-5 text-accent" />
              Find a School for {activeChild.name}
              <Badge variant="secondary" className="ml-2">{activeChild.gradeLevel}</Badge>
              <Badge variant="outline" className="ml-1 text-muted-foreground">
                <MapPin className="w-3 h-3 mr-1" />
                {city}
              </Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Showing schools in {city} suitable for {activeChild.grade}. Click a school to select it, click again to deselect.
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search schools..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger className="w-full md:w-36">
                  <MapPin className="w-4 h-4 mr-1 text-muted-foreground" />
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={curriculum} onValueChange={setCurriculum}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Curriculum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Curriculums</SelectItem>
                  {curriculums.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={maxFee} onValueChange={setMaxFee}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Max Fee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Fee</SelectItem>
                  <SelectItem value="30000">Fully Covered</SelectItem>
                  <SelectItem value="50000">Up to 50K</SelectItem>
                  <SelectItem value="80000">Up to 80K</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="net_cost">Lowest Out-of-Pocket</SelectItem>
                  <SelectItem value="fee">Fee: Low to High</SelectItem>
                  <SelectItem value="rating">Top Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Schools Grid */}
            {filteredSchools.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSchools.map((school) => {
                  const netCost = Math.max(0, school.annual_fee - ALLOWANCE_PER_CHILD);
                  const isSelected = activeChild.selectedSchool === school.name;
                  const isFullyCovered = school.annual_fee <= ALLOWANCE_PER_CHILD;
                  
                  return (
                    <Card 
                      key={school.id} 
                      className={`transition-all duration-200 cursor-pointer ${
                        isSelected 
                          ? 'ring-2 ring-success border-success' 
                          : 'hover:border-accent/40 hover:shadow-md'
                      }`}
                      onClick={() => handleSelectSchool(school.id, school.name, school.annual_fee)}
                    >
                      <div className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-medium text-sm line-clamp-2">{school.name}</h3>
                          <div className="flex items-center gap-2 shrink-0">
                            {isSelected && <Check className="w-5 h-5 text-success" />}
                            {school.rating && (
                              <span className="flex items-center gap-1 text-sm text-warning">
                                <Star className="w-3.5 h-3.5 fill-current" />
                                {school.rating}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">{school.curriculum}</Badge>
                          <Badge variant="outline">{school.grade_range}</Badge>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5" />
                          {school.location}
                        </div>

                        <div className="space-y-2 pt-3 border-t border-border/50">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Annual Fee</span>
                            <span className="font-medium">{formatCurrency(school.annual_fee)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Your Allowance</span>
                            <span className="text-success">−{formatCurrency(Math.min(school.annual_fee, ALLOWANCE_PER_CHILD))}</span>
                          </div>
                          <div className="flex justify-between text-sm font-semibold pt-2 border-t">
                            <span>You Pay for {activeChild.name}</span>
                            <span className={isFullyCovered ? 'text-success' : 'text-warning'}>
                              {isFullyCovered ? 'AED 0' : formatCurrency(netCost)}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2">
                          {isFullyCovered ? (
                            <Badge className="w-full justify-center bg-success/10 text-success border-0 py-1.5">
                              ✓ Fully Covered by Allowance
                            </Badge>
                          ) : (
                            <Badge className="w-full justify-center bg-warning/10 text-warning border-0 py-1.5">
                              {formatCurrency(netCost)} from salary
                            </Badge>
                          )}
                        </div>

                        <Button 
                          size="sm" 
                          variant={isSelected ? "outline" : "default"} 
                          className={`w-full ${isSelected ? 'border-destructive text-destructive hover:bg-destructive/10' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectSchool(school.id, school.name, school.annual_fee);
                          }}
                        >
                          {isSelected ? (
                            <>Remove Selection</>
                          ) : (
                            <>Select for {activeChild.name}</>
                          )}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <NoSearchResults 
                query={searchTerm}
                onClear={clearFilters}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Allowance Overview Summary - Shows when at least one child has a school */}
      {childrenAllocations.some(c => c.selectedSchool) && (
        <Card className={`border-2 ${allChildrenHaveSchools ? 'border-success/50 bg-success/5' : 'border-accent/30 bg-accent/5'}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Calculator className="w-5 h-5 text-accent" />
              Your Schooling Allowance Overview
              {allChildrenHaveSchools && (
                <Badge className="bg-success text-success-foreground ml-2">
                  <Check className="w-3 h-3 mr-1" />
                  Complete
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left: Per-child breakdown */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground">Per-Child Breakdown</h4>
                {childrenAllocations.map(child => {
                  const covered = Math.min(child.schoolFee, ALLOWANCE_PER_CHILD);
                  const topUp = Math.max(0, child.schoolFee - ALLOWANCE_PER_CHILD);
                  const unused = Math.max(0, ALLOWANCE_PER_CHILD - child.schoolFee);
                  
                  return (
                    <div key={child.id} className="p-3 rounded-lg bg-card border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{child.name}</span>
                        {child.selectedSchool ? (
                          <Badge variant="secondary" className="text-xs">{child.selectedSchool}</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-muted-foreground">No school selected</Badge>
                        )}
                      </div>
                      {child.selectedSchool && (
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center p-2 rounded bg-muted/50">
                            <p className="text-muted-foreground">Allowance</p>
                            <p className="font-semibold">{formatCurrency(ALLOWANCE_PER_CHILD)}</p>
                          </div>
                          <div className="text-center p-2 rounded bg-success/10">
                            <p className="text-success">Covered</p>
                            <p className="font-semibold text-success">{formatCurrency(covered)}</p>
                          </div>
                          <div className={`text-center p-2 rounded ${topUp > 0 ? 'bg-warning/10' : 'bg-muted/50'}`}>
                            <p className={topUp > 0 ? 'text-warning' : 'text-muted-foreground'}>
                              {topUp > 0 ? 'Top-Up' : 'Unused'}
                            </p>
                            <p className={`font-semibold ${topUp > 0 ? 'text-warning' : ''}`}>
                              {topUp > 0 ? formatCurrency(topUp) : formatCurrency(unused)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Right: Total summary */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground">Total Summary</h4>
                <div className="p-4 rounded-lg bg-card border space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Your Total Allowance</span>
                    <span className="font-semibold">{formatCurrency(totalAllowance)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total School Fees</span>
                    <span className="font-semibold">{formatCurrency(totalSchoolFees)}</span>
                  </div>
                  <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-success">Covered by Allowance</span>
                      <span className="font-semibold text-success">{formatCurrency(totalCoveredByAllowance)}</span>
                    </div>
                    {totalOutOfPocket > 0 ? (
                      <div className="flex justify-between text-sm">
                        <span className="text-warning">Your Salary Top-Up</span>
                        <span className="font-semibold text-warning">{formatCurrency(totalOutOfPocket)}</span>
                      </div>
                    ) : unusedAllowance > 0 ? (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Unused Allowance</span>
                        <span className="font-semibold">{formatCurrency(unusedAllowance)}</span>
                      </div>
                    ) : null}
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Monthly from Salary</span>
                      <span className={`text-lg font-bold ${totalOutOfPocket > 0 ? 'text-warning' : 'text-success'}`}>
                        {totalOutOfPocket > 0 ? formatCurrency(Math.round(totalOutOfPocket / 12)) : 'AED 0'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {totalOutOfPocket > 0 
                        ? `${formatCurrency(totalOutOfPocket)} annual top-up ÷ 12 months`
                        : 'All fees covered by your allowance!'}
                    </p>
                  </div>
                </div>
                <Progress value={utilizationPercent} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">
                  {utilizationPercent}% of your education allowance utilized
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
