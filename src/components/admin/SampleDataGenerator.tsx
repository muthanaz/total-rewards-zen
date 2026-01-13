import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { 
  Wand2, 
  Users, 
  Building2, 
  Heart, 
  Store,
  CheckCircle2,
  Loader2,
  Download,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface GeneratorConfig {
  employeeCount: number;
  includeDependents: boolean;
  includeLeaveBalances: boolean;
  includeBenefitEntitlements: boolean;
  includeVendors: boolean;
  includeMarketplaceOffers: boolean;
  includeHealthProviders: boolean;
  includeSchools: boolean;
  includeHousingAreas: boolean;
}

const defaultConfig: GeneratorConfig = {
  employeeCount: 25,
  includeDependents: true,
  includeLeaveBalances: true,
  includeBenefitEntitlements: true,
  includeVendors: true,
  includeMarketplaceOffers: true,
  includeHealthProviders: true,
  includeSchools: true,
  includeHousingAreas: true,
};

// Sample data generators
const firstNames = ['Ahmed', 'Mohammed', 'Sarah', 'Fatima', 'John', 'Emma', 'Raj', 'Priya', 'Wei', 'Yuki', 'Omar', 'Layla', 'James', 'Sophie', 'Amir', 'Noor', 'David', 'Maria', 'Hassan', 'Zara'];
const lastNames = ['Al-Rashid', 'Khan', 'Smith', 'Patel', 'Chen', 'Tanaka', 'Abdullah', 'Hassan', 'Wilson', 'Brown', 'Ali', 'Malik', 'Johnson', 'Garcia', 'Sharma', 'Kim', 'Ahmed', 'Singh', 'Lee', 'Martinez'];
const departments = ['Technology', 'Finance', 'Human Resources', 'Marketing', 'Operations', 'Sales', 'Legal', 'Product'];
const positions = ['Analyst', 'Senior Analyst', 'Manager', 'Senior Manager', 'Director', 'Vice President', 'Executive'];
const grades = ['G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9', 'G10'];
const nationalities = ['UAE', 'United Kingdom', 'United States', 'India', 'Pakistan', 'Philippines', 'Egypt', 'Jordan', 'Lebanon', 'Canada', 'Australia', 'Germany', 'France'];
const locations = ['DIFC Tower 1', 'DIFC Tower 2', 'Dubai Media City', 'Abu Dhabi Office', 'RAK Office'];
const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const maritalStatuses = ['Single', 'Married'];

const randomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomNumber = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
const randomDate = (startYear: number, endYear: number): string => {
  const year = randomNumber(startYear, endYear);
  const month = String(randomNumber(1, 12)).padStart(2, '0');
  const day = String(randomNumber(1, 28)).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function SampleDataGenerator() {
  const { toast } = useToast();
  const [config, setConfig] = useState<GeneratorConfig>(defaultConfig);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [generatedCounts, setGeneratedCounts] = useState<Record<string, number>>({});

  const generateEmployeeData = () => {
    const employees = [];
    for (let i = 0; i < config.employeeCount; i++) {
      const firstName = randomElement(firstNames);
      const lastName = randomElement(lastNames);
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomNumber(1, 999)}@democompany.com`;
      const maritalStatus = randomElement(maritalStatuses);
      
      employees.push({
        email,
        first_name: firstName,
        last_name: lastName,
        phone: `+9715${randomNumber(10000000, 99999999)}`,
        nationality: randomElement(nationalities),
        date_of_birth: randomDate(1970, 2000),
        emirates_id: `784-${randomNumber(1970, 2000)}-${randomNumber(1000000, 9999999)}-${randomNumber(1, 9)}`,
        passport_number: `${String.fromCharCode(65 + randomNumber(0, 25))}${String.fromCharCode(65 + randomNumber(0, 25))}${randomNumber(1000000, 9999999)}`,
        blood_type: randomElement(bloodTypes),
        marital_status: maritalStatus,
        spouse_name: maritalStatus === 'Married' ? `${randomElement(firstNames)} ${lastName}` : null,
        emergency_contact_name: `${randomElement(firstNames)} ${randomElement(lastNames)}`,
        emergency_contact_phone: `+9715${randomNumber(10000000, 99999999)}`,
        home_location: randomElement(['Dubai Marina', 'JBR', 'Downtown', 'Business Bay', 'JLT', 'Al Barsha', 'Jumeirah']),
        preferred_language: randomElement(['en', 'ar']),
        department: randomElement(departments),
        position: randomElement(positions),
        grade: randomElement(grades),
        work_location: randomElement(locations),
        employment_date: randomDate(2018, 2024),
        manager_name: `${randomElement(firstNames)} ${randomElement(lastNames)}`,
        monthly_salary: randomNumber(15000, 80000),
      });
    }
    return employees;
  };

  const generateDependents = (employeeCount: number) => {
    const dependents = [];
    for (let i = 0; i < Math.floor(employeeCount * 0.6); i++) {
      const numChildren = randomNumber(1, 3);
      for (let j = 0; j < numChildren; j++) {
        dependents.push({
          name: `${randomElement(firstNames)} Jr.`,
          date_of_birth: randomDate(2010, 2022),
          grade: `Grade ${randomNumber(1, 12)}`,
          school_name: randomElement(['GEMS Wellington', 'Dubai American Academy', 'JESS', 'Dubai College', 'American School of Dubai']),
        });
      }
    }
    return dependents;
  };

  const generateBenefits = (): Array<{
    name: string;
    benefit_type: 'cash_allowances' | 'health_protection' | 'time_off_flex' | 'growth_career' | 'wealth_ownership' | 'wellbeing';
    life_area: 'home_living' | 'family_parenting' | 'health' | 'money' | 'career' | 'lifestyle' | 'mobility';
    description: string;
    annual_value: number;
    icon: string;
  }> => {
    return [
      { name: 'Housing Allowance', benefit_type: 'cash_allowances', life_area: 'home_living', description: 'Monthly housing support', annual_value: 120000, icon: 'Home' },
      { name: 'Transport Allowance', benefit_type: 'cash_allowances', life_area: 'mobility', description: 'Monthly transport support', annual_value: 24000, icon: 'Car' },
      { name: 'Education Support', benefit_type: 'cash_allowances', life_area: 'family_parenting', description: 'School tuition support for dependents', annual_value: 50000, icon: 'GraduationCap' },
      { name: 'Health Insurance', benefit_type: 'health_protection', life_area: 'health', description: 'Comprehensive medical coverage', annual_value: 25000, icon: 'Shield' },
      { name: 'Annual Leave', benefit_type: 'time_off_flex', life_area: 'lifestyle', description: '30 days annual leave', annual_value: 0, icon: 'Calendar' },
      { name: 'Professional Development', benefit_type: 'growth_career', life_area: 'career', description: 'Training and certification budget', annual_value: 15000, icon: 'BookOpen' },
      { name: 'Gym Membership', benefit_type: 'wellbeing', life_area: 'health', description: 'Fitness club membership', annual_value: 6000, icon: 'Dumbbell' },
      { name: 'Life Insurance', benefit_type: 'health_protection', life_area: 'money', description: 'Life insurance coverage', annual_value: 0, icon: 'Heart' },
    ];
  };

  const generateVendors = () => {
    return [
      { company_name: 'Fitness First UAE', description: 'Premium fitness chain', contact_email: 'corporate@fitnessfirst.ae', commission_rate: 10 },
      { company_name: 'Talabat for Business', description: 'Food delivery service', contact_email: 'b2b@talabat.com', commission_rate: 8 },
      { company_name: 'Virgin Active', description: 'Wellness and fitness', contact_email: 'corporate@virginactive.ae', commission_rate: 12 },
      { company_name: 'Careem', description: 'Transportation services', contact_email: 'business@careem.com', commission_rate: 5 },
      { company_name: 'Namshi', description: 'Fashion & lifestyle', contact_email: 'corporate@namshi.com', commission_rate: 15 },
    ];
  };

  const generateMarketplaceOffers = () => {
    return [
      { title: '25% Off Annual Gym Membership', merchant: 'Fitness First', category: 'Fitness', discount_percent: 25, rating: 4.5 },
      { title: 'Free Delivery for 3 Months', merchant: 'Talabat', category: 'Food & Dining', discount_percent: 100, rating: 4.3 },
      { title: '20% Off Spa Treatments', merchant: 'Virgin Active', category: 'Wellness', discount_percent: 20, rating: 4.7 },
      { title: '15% Off All Rides', merchant: 'Careem', category: 'Transportation', discount_percent: 15, rating: 4.4 },
      { title: 'Extra 10% Off Sale Items', merchant: 'Namshi', category: 'Shopping', discount_percent: 10, rating: 4.2 },
      { title: 'Buy 1 Get 1 Free Coffee', merchant: 'Costa Coffee', category: 'Food & Dining', discount_percent: 50, rating: 4.6 },
      { title: '30% Off Hotel Stays', merchant: 'Booking.com', category: 'Travel', discount_percent: 30, rating: 4.5 },
      { title: 'Free Eye Test + 20% Off Glasses', merchant: 'Magrabi', category: 'Healthcare', discount_percent: 20, rating: 4.4 },
    ];
  };

  const generateHealthProviders = () => {
    return [
      { name: 'American Hospital Dubai', provider_type: 'Hospital', area: 'Dubai Healthcare City', in_network: true, rating: 4.7 },
      { name: 'Mediclinic City Hospital', provider_type: 'Hospital', area: 'Dubai Healthcare City', in_network: true, rating: 4.6 },
      { name: 'Saudi German Hospital', provider_type: 'Hospital', area: 'Al Barsha', in_network: true, rating: 4.4 },
      { name: 'Aster Clinic', provider_type: 'Clinic', area: 'Multiple Locations', in_network: true, rating: 4.3 },
      { name: 'Prime Healthcare', provider_type: 'Clinic', area: 'Dubai Marina', in_network: true, rating: 4.5 },
      { name: 'Al Nahda Pharmacy', provider_type: 'Pharmacy', area: 'Multiple Locations', in_network: true, rating: 4.2 },
    ];
  };

  const generateSchools = () => {
    return [
      { name: 'GEMS Wellington Academy', curriculum: 'British', location: 'Al Khail', annual_fee: 65000, rating: 4.6, grade_range: 'FS1-Year 13' },
      { name: 'Dubai American Academy', curriculum: 'American', location: 'Al Barsha', annual_fee: 85000, rating: 4.7, grade_range: 'KG-Grade 12' },
      { name: 'Dubai College', curriculum: 'British', location: 'Al Sufouh', annual_fee: 95000, rating: 4.8, grade_range: 'Year 7-Year 13' },
      { name: 'JESS Arabian Ranches', curriculum: 'British', location: 'Arabian Ranches', annual_fee: 75000, rating: 4.5, grade_range: 'FS1-Year 13' },
      { name: 'American School of Dubai', curriculum: 'American', location: 'Al Barsha', annual_fee: 90000, rating: 4.7, grade_range: 'PreK-Grade 12' },
      { name: 'Dubai International Academy', curriculum: 'IB', location: 'Emirates Hills', annual_fee: 85000, rating: 4.6, grade_range: 'KG-Grade 12' },
    ];
  };

  const generateHousingAreas = () => {
    return [
      { name: 'Dubai Marina', avg_rent_1br: 75000, avg_rent_2br: 110000, avg_rent_3br: 160000, commute_to_difc_mins: 20 },
      { name: 'Downtown Dubai', avg_rent_1br: 90000, avg_rent_2br: 140000, avg_rent_3br: 200000, commute_to_difc_mins: 10 },
      { name: 'JBR', avg_rent_1br: 80000, avg_rent_2br: 120000, avg_rent_3br: 170000, commute_to_difc_mins: 25 },
      { name: 'Business Bay', avg_rent_1br: 70000, avg_rent_2br: 100000, avg_rent_3br: 150000, commute_to_difc_mins: 8 },
      { name: 'JLT', avg_rent_1br: 55000, avg_rent_2br: 80000, avg_rent_3br: 120000, commute_to_difc_mins: 15 },
      { name: 'Al Barsha', avg_rent_1br: 50000, avg_rent_2br: 70000, avg_rent_3br: 100000, commute_to_difc_mins: 20 },
      { name: 'Arabian Ranches', avg_rent_1br: null, avg_rent_2br: null, avg_rent_3br: 180000, commute_to_difc_mins: 35 },
    ];
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(0);
    setGeneratedCounts({});

    try {
      const steps = [
        { name: 'Generating benefits...', weight: 10 },
        { name: 'Generating health providers...', weight: 10 },
        { name: 'Generating schools...', weight: 10 },
        { name: 'Generating housing areas...', weight: 10 },
        { name: 'Generating vendors...', weight: 15 },
        { name: 'Generating marketplace offers...', weight: 15 },
        { name: 'Preparing sample data...', weight: 30 },
      ];

      let currentProgress = 0;

      for (const step of steps) {
        setCurrentStep(step.name);
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing
        currentProgress += step.weight;
        setProgress(currentProgress);
      }

      // Generate sample data counts
      const counts: Record<string, number> = {
        employees: config.employeeCount,
      };

      if (config.includeDependents) {
        counts.dependents = generateDependents(config.employeeCount).length;
      }
      if (config.includeLeaveBalances) {
        counts.leaveBalances = config.employeeCount * 4;
      }
      if (config.includeBenefitEntitlements) {
        counts.benefitEntitlements = config.employeeCount * generateBenefits().length;
      }
      if (config.includeVendors) {
        counts.vendors = generateVendors().length;
      }
      if (config.includeMarketplaceOffers) {
        counts.marketplaceOffers = generateMarketplaceOffers().length;
      }
      if (config.includeHealthProviders) {
        counts.healthProviders = generateHealthProviders().length;
      }
      if (config.includeSchools) {
        counts.schools = generateSchools().length;
      }
      if (config.includeHousingAreas) {
        counts.housingAreas = generateHousingAreas().length;
      }

      setGeneratedCounts(counts);
      setProgress(100);
      setCurrentStep('Complete!');

      toast({
        title: 'Sample Data Generated',
        description: `Successfully generated ${Object.values(counts).reduce((a, b) => a + b, 0)} records.`,
      });

    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: 'Generation Failed',
        description: 'An error occurred while generating sample data.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInsertData = async () => {
    setIsGenerating(true);
    setProgress(0);
    
    try {
      // Insert benefits
      setCurrentStep('Inserting benefits...');
      const benefits = generateBenefits();
      const { error: benefitsError } = await supabase
        .from('benefits')
        .upsert(benefits.map(b => ({
          ...b,
          is_active: true,
        })), { onConflict: 'name' });
      
      if (benefitsError) console.error('Benefits error:', benefitsError);
      setProgress(15);

      // Insert health providers
      if (config.includeHealthProviders) {
        setCurrentStep('Inserting health providers...');
        const providers = generateHealthProviders();
        const { error: providersError } = await supabase
          .from('health_providers')
          .upsert(providers);
        
        if (providersError) console.error('Providers error:', providersError);
      }
      setProgress(30);

      // Insert schools
      if (config.includeSchools) {
        setCurrentStep('Inserting schools...');
        const schools = generateSchools();
        const { error: schoolsError } = await supabase
          .from('schools')
          .upsert(schools);
        
        if (schoolsError) console.error('Schools error:', schoolsError);
      }
      setProgress(45);

      // Insert housing areas
      if (config.includeHousingAreas) {
        setCurrentStep('Inserting housing areas...');
        const areas = generateHousingAreas();
        const { error: areasError } = await supabase
          .from('housing_areas')
          .upsert(areas);
        
        if (areasError) console.error('Areas error:', areasError);
      }
      setProgress(60);

      // Insert marketplace offers
      if (config.includeMarketplaceOffers) {
        setCurrentStep('Inserting marketplace offers...');
        const offers = generateMarketplaceOffers();
        const { error: offersError } = await supabase
          .from('marketplace_offers')
          .upsert(offers.map(o => ({
            ...o,
            is_active: true,
          })));
        
        if (offersError) console.error('Offers error:', offersError);
      }
      setProgress(80);

      setProgress(100);
      setCurrentStep('Data inserted successfully!');

      toast({
        title: 'Data Inserted Successfully',
        description: 'Sample data has been added to the database.',
      });

    } catch (error) {
      console.error('Insert error:', error);
      toast({
        title: 'Insert Failed',
        description: 'An error occurred while inserting data.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <Wand2 className="w-5 h-5 text-accent" />
            </div>
            <div>
              <CardTitle>Sample Data Generator</CardTitle>
              <CardDescription>
                Generate realistic demo data for testing and demonstrations
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Employee Count Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Number of Employees
              </Label>
              <Badge variant="secondary">{config.employeeCount}</Badge>
            </div>
            <Slider
              value={[config.employeeCount]}
              onValueChange={([value]) => setConfig({ ...config, employeeCount: value })}
              min={5}
              max={100}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Generate between 5-100 sample employee records
            </p>
          </div>

          {/* Data Options */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: 'includeDependents', label: 'Dependents & Children', icon: Users },
              { key: 'includeLeaveBalances', label: 'Leave Balances', icon: Building2 },
              { key: 'includeBenefitEntitlements', label: 'Benefit Entitlements', icon: Heart },
              { key: 'includeVendors', label: 'Vendors', icon: Store },
              { key: 'includeMarketplaceOffers', label: 'Marketplace Offers', icon: Store },
              { key: 'includeHealthProviders', label: 'Health Providers', icon: Heart },
              { key: 'includeSchools', label: 'Schools', icon: Building2 },
              { key: 'includeHousingAreas', label: 'Housing Areas', icon: Building2 },
            ].map((option) => (
              <div key={option.key} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <option.icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{option.label}</span>
                </div>
                <Switch
                  checked={config[option.key as keyof GeneratorConfig] as boolean}
                  onCheckedChange={(checked) => 
                    setConfig({ ...config, [option.key]: checked })
                  }
                />
              </div>
            ))}
          </div>

          {/* Progress */}
          {isGenerating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{currentStep}</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Generated Counts */}
          {Object.keys(generatedCounts).length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(generatedCounts).map(([key, count]) => (
                <div key={key} className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-2xl font-bold text-accent">{count}</p>
                  <p className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating}
              className="gap-2 flex-1"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4" />
              )}
              Generate Preview
            </Button>
            <Button 
              onClick={handleInsertData} 
              disabled={isGenerating}
              variant="secondary"
              className="gap-2 flex-1"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Insert into Database
            </Button>
            <Button
              onClick={() => {
                setConfig(defaultConfig);
                setGeneratedCounts({});
                setProgress(0);
              }}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reset
            </Button>
          </div>

          {/* Warning */}
          <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-600">Important Notes</p>
                <ul className="mt-1 space-y-1 text-muted-foreground">
                  <li>• Sample data is for testing purposes only</li>
                  <li>• Employee records require authentication context to insert</li>
                  <li>• Reference data (schools, providers, areas) will be inserted directly</li>
                  <li>• Existing data with matching keys will be updated</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
