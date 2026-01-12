import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User, Briefcase, Users, Heart, Save, Plus, Trash2, Baby, PawPrint, Gift, Calendar, GraduationCap, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile, useChildren, useBenefitEntitlements } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Child {
  id?: string;
  name: string;
  date_of_birth: string;
  school_name: string;
  grade: string;
}

interface Pet {
  type: string;
  name: string;
  breed?: string;
}

export default function ProfilePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: dbProfile, refetch: refetchProfile } = useProfile();
  const { data: dbChildren, refetch: refetchChildren } = useChildren();
  const { data: entitlements } = useBenefitEntitlements();

  const [profile, setProfile] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    nationality: '', emiratesId: '', bloodType: '', language: 'en',
    position: '', department: '', grade: '', manager: '', employmentDate: '', salary: '',
    maritalStatus: 'single', spouseName: '', spouseEmployer: '', emergencyName: '', emergencyPhone: '',
    homeLocation: '', workLocation: '',
    dateOfBirth: '', passportNumber: '',
  });

  const [children, setChildren] = useState<Child[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [cars, setCars] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const allInterests = ['Travel', 'Fitness', 'Reading', 'Technology', 'Food & Dining', 'Music', 'Sports', 'Art & Culture', 'Gaming', 'Photography', 'Outdoor Activities', 'Wellness'];
  const petTypes = ['Dog', 'Cat', 'Bird', 'Fish', 'Rabbit', 'Hamster', 'Other'];

  // Load profile data from database
  useEffect(() => {
    if (dbProfile) {
      setProfile({
        firstName: dbProfile.first_name || '',
        lastName: dbProfile.last_name || '',
        email: dbProfile.email || '',
        phone: dbProfile.phone || '',
        nationality: dbProfile.nationality || '',
        emiratesId: dbProfile.emirates_id || '',
        bloodType: dbProfile.blood_type || '',
        language: dbProfile.preferred_language || 'en',
        position: dbProfile.position || '',
        department: dbProfile.department || '',
        grade: dbProfile.grade || '',
        manager: dbProfile.manager_name || '',
        employmentDate: dbProfile.employment_date || '',
        salary: dbProfile.monthly_salary?.toString() || '',
        maritalStatus: dbProfile.marital_status || 'single',
        spouseName: dbProfile.spouse_name || '',
        spouseEmployer: dbProfile.spouse_employer || '',
        emergencyName: dbProfile.emergency_contact_name || '',
        emergencyPhone: dbProfile.emergency_contact_phone || '',
        homeLocation: dbProfile.home_location || '',
        workLocation: dbProfile.work_location || '',
        dateOfBirth: dbProfile.date_of_birth || '',
        passportNumber: dbProfile.passport_number || '',
      });
      setInterests(dbProfile.interests || []);
      setCars(dbProfile.cars || []);
      // Parse pets from array format
      if (dbProfile.pets && Array.isArray(dbProfile.pets)) {
        const parsedPets = dbProfile.pets.map((p: string) => {
          try {
            return JSON.parse(p);
          } catch {
            return { type: 'Other', name: p };
          }
        });
        setPets(parsedPets);
      }
    }
  }, [dbProfile]);

  // Load children from database
  useEffect(() => {
    if (dbChildren) {
      setChildren(dbChildren.map(c => ({
        id: c.id,
        name: c.name,
        date_of_birth: c.date_of_birth,
        school_name: c.school_name || '',
        grade: c.grade || '',
      })));
    }
  }, [dbChildren]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: profile.firstName,
          last_name: profile.lastName,
          phone: profile.phone,
          nationality: profile.nationality,
          emirates_id: profile.emiratesId,
          blood_type: profile.bloodType,
          preferred_language: profile.language,
          marital_status: profile.maritalStatus,
          spouse_name: profile.spouseName,
          spouse_employer: profile.spouseEmployer,
          emergency_contact_name: profile.emergencyName,
          emergency_contact_phone: profile.emergencyPhone,
          home_location: profile.homeLocation,
          work_location: profile.workLocation,
          date_of_birth: profile.dateOfBirth || null,
          passport_number: profile.passportNumber,
          interests: interests,
          cars: cars,
          pets: pets.map(p => JSON.stringify(p)),
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Handle children - delete removed, update existing, insert new
      const existingIds = children.filter(c => c.id).map(c => c.id);
      
      // Delete children that are no longer in the list
      if (dbChildren) {
        const toDelete = dbChildren.filter(c => !existingIds.includes(c.id));
        for (const child of toDelete) {
          await supabase.from('children').delete().eq('id', child.id);
        }
      }

      // Upsert children
      for (const child of children) {
        if (child.id) {
          await supabase.from('children').update({
            name: child.name,
            date_of_birth: child.date_of_birth,
            school_name: child.school_name || null,
            grade: child.grade || null,
          }).eq('id', child.id);
        } else {
          await supabase.from('children').insert({
            user_id: user.id,
            name: child.name,
            date_of_birth: child.date_of_birth,
            school_name: child.school_name || null,
            grade: child.grade || null,
          });
        }
      }

      await refetchProfile();
      await refetchChildren();
      
      toast({ title: "Profile Updated", description: "Your profile has been saved successfully." });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({ title: "Error", description: "Failed to save profile. Please try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const addChild = () => {
    setChildren([...children, { name: '', date_of_birth: '', school_name: '', grade: '' }]);
  };

  const removeChild = (index: number) => {
    setChildren(children.filter((_, i) => i !== index));
  };

  const updateChild = (index: number, field: keyof Child, value: string) => {
    const updated = [...children];
    updated[index] = { ...updated[index], [field]: value };
    setChildren(updated);
  };

  const addPet = () => {
    setPets([...pets, { type: 'Dog', name: '' }]);
  };

  const removePet = (index: number) => {
    setPets(pets.filter((_, i) => i !== index));
  };

  const updatePet = (index: number, field: keyof Pet, value: string) => {
    const updated = [...pets];
    updated[index] = { ...updated[index], [field]: value };
    setPets(updated);
  };

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const addCar = () => {
    setCars([...cars, '']);
  };

  const removeCar = (index: number) => {
    setCars(cars.filter((_, i) => i !== index));
  };

  const updateCar = (index: number, value: string) => {
    const updated = [...cars];
    updated[index] = value;
    setCars(updated);
  };

  // Find bonus entitlement
  const bonusEntitlement = entitlements?.find(e => 
    e.benefits?.name?.toLowerCase().includes('bonus') || 
    e.benefits?.benefit_type === 'cash_allowances'
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-3">
            <User className="w-7 h-7 text-accent" />Smart Profile
          </h1>
          <p className="text-muted-foreground mt-1">Manage your personal information and preferences</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />{saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="personal"><User className="w-4 h-4 mr-2" />Personal</TabsTrigger>
          <TabsTrigger value="work"><Briefcase className="w-4 h-4 mr-2" />Work</TabsTrigger>
          <TabsTrigger value="family"><Users className="w-4 h-4 mr-2" />Family</TabsTrigger>
          <TabsTrigger value="lifestyle"><Heart className="w-4 h-4 mr-2" />Lifestyle</TabsTrigger>
          <TabsTrigger value="bonus"><Gift className="w-4 h-4 mr-2" />Bonus</TabsTrigger>
        </TabsList>
        
        {/* Personal Tab */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Personal Information</CardTitle>
              <CardDescription>Your basic personal details and identification</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>First Name</Label><Input value={profile.firstName} onChange={(e) => setProfile({...profile, firstName: e.target.value})} /></div>
              <div className="space-y-2"><Label>Last Name</Label><Input value={profile.lastName} onChange={(e) => setProfile({...profile, lastName: e.target.value})} /></div>
              <div className="space-y-2"><Label>Email</Label><Input value={profile.email} disabled /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} placeholder="+971 50 XXX XXXX" /></div>
              <div className="space-y-2"><Label>Date of Birth</Label><Input type="date" value={profile.dateOfBirth} onChange={(e) => setProfile({...profile, dateOfBirth: e.target.value})} /></div>
              <div className="space-y-2"><Label>Nationality</Label><Input value={profile.nationality} onChange={(e) => setProfile({...profile, nationality: e.target.value})} /></div>
              <div className="space-y-2"><Label>Emirates ID</Label><Input value={profile.emiratesId} onChange={(e) => setProfile({...profile, emiratesId: e.target.value})} placeholder="784-XXXX-XXXXXXX-X" /></div>
              <div className="space-y-2"><Label>Passport Number</Label><Input value={profile.passportNumber} onChange={(e) => setProfile({...profile, passportNumber: e.target.value})} /></div>
              <div className="space-y-2"><Label>Blood Type</Label><Select value={profile.bloodType} onValueChange={(v) => setProfile({...profile, bloodType: v})}><SelectTrigger><SelectValue placeholder="Select blood type" /></SelectTrigger><SelectContent>{['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Preferred Language</Label><Select value={profile.language} onValueChange={(v) => setProfile({...profile, language: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="en">English</SelectItem><SelectItem value="ar">Arabic</SelectItem></SelectContent></Select></div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Work Tab */}
        <TabsContent value="work">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Work Information</CardTitle>
              <CardDescription>Your employment details (some fields are managed by HR)</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Position</Label><Input value={profile.position} disabled className="bg-muted" /></div>
              <div className="space-y-2"><Label>Department</Label><Input value={profile.department} disabled className="bg-muted" /></div>
              <div className="space-y-2"><Label>Grade</Label><Input value={profile.grade} disabled className="bg-muted" /></div>
              <div className="space-y-2"><Label>Manager</Label><Input value={profile.manager} disabled className="bg-muted" /></div>
              <div className="space-y-2"><Label>Employment Date</Label><Input value={profile.employmentDate} disabled className="bg-muted" /></div>
              <div className="space-y-2"><Label>Monthly Salary (AED)</Label><Input value={profile.salary} disabled className="bg-muted" /></div>
              <div className="space-y-2"><Label>Work Location</Label><Input value={profile.workLocation} onChange={(e) => setProfile({...profile, workLocation: e.target.value})} placeholder="e.g., DIFC" /></div>
              <div className="space-y-2"><Label>Home Location</Label><Input value={profile.homeLocation} onChange={(e) => setProfile({...profile, homeLocation: e.target.value})} placeholder="e.g., Dubai Marina" /></div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Family Tab */}
        <TabsContent value="family" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Family Information</CardTitle>
              <CardDescription>Spouse and emergency contact details</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Marital Status</Label><Select value={profile.maritalStatus} onValueChange={(v) => setProfile({...profile, maritalStatus: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="single">Single</SelectItem><SelectItem value="married">Married</SelectItem><SelectItem value="divorced">Divorced</SelectItem><SelectItem value="widowed">Widowed</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>Spouse Name</Label><Input value={profile.spouseName} onChange={(e) => setProfile({...profile, spouseName: e.target.value})} disabled={profile.maritalStatus === 'single'} /></div>
              <div className="space-y-2"><Label>Spouse Employer</Label><Input value={profile.spouseEmployer} onChange={(e) => setProfile({...profile, spouseEmployer: e.target.value})} disabled={profile.maritalStatus === 'single'} placeholder="Company name" /></div>
              <div className="space-y-2" />
              <div className="space-y-2"><Label>Emergency Contact Name</Label><Input value={profile.emergencyName} onChange={(e) => setProfile({...profile, emergencyName: e.target.value})} /></div>
              <div className="space-y-2"><Label>Emergency Contact Phone</Label><Input value={profile.emergencyPhone} onChange={(e) => setProfile({...profile, emergencyPhone: e.target.value})} placeholder="+971 50 XXX XXXX" /></div>
            </CardContent>
          </Card>

          {/* Children Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Baby className="w-4 h-4" />Children
                </CardTitle>
                <CardDescription>Add your children's details for education benefits</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={addChild}>
                <Plus className="w-4 h-4 mr-1" />Add Child
              </Button>
            </CardHeader>
            <CardContent>
              {children.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No children added yet. Click "Add Child" to add your children's information.</p>
              ) : (
                <div className="space-y-4">
                  {children.map((child, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-4 bg-muted/30">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Child {index + 1}</span>
                        <Button variant="ghost" size="sm" onClick={() => removeChild(index)} className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Full Name</Label>
                          <Input value={child.name} onChange={(e) => updateChild(index, 'name', e.target.value)} placeholder="Child's full name" />
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-1"><Calendar className="w-3 h-3" />Date of Birth</Label>
                          <Input type="date" value={child.date_of_birth} onChange={(e) => updateChild(index, 'date_of_birth', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-1"><Building2 className="w-3 h-3" />School Name</Label>
                          <Input value={child.school_name} onChange={(e) => updateChild(index, 'school_name', e.target.value)} placeholder="e.g., GEMS Wellington" />
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-1"><GraduationCap className="w-3 h-3" />Grade/Year</Label>
                          <Select value={child.grade} onValueChange={(v) => updateChild(index, 'grade', v)}>
                            <SelectTrigger><SelectValue placeholder="Select grade" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pre-kg">Pre-KG</SelectItem>
                              <SelectItem value="kg1">KG1</SelectItem>
                              <SelectItem value="kg2">KG2</SelectItem>
                              {[1,2,3,4,5,6,7,8,9,10,11,12].map(g => (
                                <SelectItem key={g} value={`grade-${g}`}>Grade {g}</SelectItem>
                              ))}
                              <SelectItem value="university">University</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lifestyle Tab */}
        <TabsContent value="lifestyle" className="space-y-4">
          {/* Interests */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Interests & Hobbies</CardTitle>
              <CardDescription>Your interests help us personalize marketplace recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {allInterests.map(interest => (
                  <Button 
                    key={interest} 
                    variant={interests.includes(interest) ? "default" : "outline"} 
                    size="sm"
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pets */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <PawPrint className="w-4 h-4" />Pets
                </CardTitle>
                <CardDescription>Add your pets for pet-friendly benefit recommendations</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={addPet}>
                <Plus className="w-4 h-4 mr-1" />Add Pet
              </Button>
            </CardHeader>
            <CardContent>
              {pets.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No pets added. Click "Add Pet" to add your furry friends!</p>
              ) : (
                <div className="space-y-3">
                  {pets.map((pet, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                      <Select value={pet.type} onValueChange={(v) => updatePet(index, 'type', v)}>
                        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {petTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Input 
                        value={pet.name} 
                        onChange={(e) => updatePet(index, 'name', e.target.value)} 
                        placeholder="Pet's name" 
                        className="flex-1"
                      />
                      <Input 
                        value={pet.breed || ''} 
                        onChange={(e) => updatePet(index, 'breed', e.target.value)} 
                        placeholder="Breed (optional)" 
                        className="flex-1"
                      />
                      <Button variant="ghost" size="sm" onClick={() => removePet(index)} className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cars */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">Vehicles</CardTitle>
                <CardDescription>Your vehicles for parking and transport benefits</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={addCar}>
                <Plus className="w-4 h-4 mr-1" />Add Vehicle
              </Button>
            </CardHeader>
            <CardContent>
              {cars.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No vehicles added.</p>
              ) : (
                <div className="space-y-2">
                  {cars.map((car, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Input 
                        value={car} 
                        onChange={(e) => updateCar(index, e.target.value)} 
                        placeholder="e.g., Toyota Camry 2023" 
                        className="flex-1"
                      />
                      <Button variant="ghost" size="sm" onClick={() => removeCar(index)} className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bonus Tab */}
        <TabsContent value="bonus">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Gift className="w-5 h-5 text-accent" />Annual Bonus
                </CardTitle>
                <CardDescription>Your bonus entitlement and payout details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {bonusEntitlement ? (
                  <>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                        <p className="text-sm text-muted-foreground">Target Bonus</p>
                        <p className="text-2xl font-bold text-accent">
                          AED {bonusEntitlement.annual_allowance?.toLocaleString() || '0'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Based on your grade & performance</p>
                      </div>
                      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <p className="text-sm text-muted-foreground">Paid to Date</p>
                        <p className="text-2xl font-bold text-green-600">
                          AED {bonusEntitlement.utilized_amount?.toLocaleString() || '0'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">This fiscal year</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted">
                        <p className="text-sm text-muted-foreground">Remaining</p>
                        <p className="text-2xl font-bold">
                          AED {((bonusEntitlement.annual_allowance || 0) - (bonusEntitlement.utilized_amount || 0)).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Expected payout</p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">Bonus Details</h4>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Bonus Type</span>
                          <span className="font-medium">{bonusEntitlement.benefits?.name || 'Annual Performance Bonus'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Payout Frequency</span>
                          <span className="font-medium">Annual (March)</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Eligibility</span>
                          <Badge variant="secondary">Eligible</Badge>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Performance Rating Required</span>
                          <span className="font-medium">Meets Expectations or above</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">How Bonus is Calculated</h4>
                      <div className="p-4 rounded-lg bg-muted/50 text-sm space-y-2">
                        <p><strong>Formula:</strong> Base Salary × Target % × Performance Multiplier × Company Multiplier</p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          <li>Target percentage is based on your grade level (G7 = 15%)</li>
                          <li>Performance multiplier ranges from 0% to 150% based on your annual review</li>
                          <li>Company multiplier reflects overall business performance (0-120%)</li>
                          <li>Pro-rated for employees who joined mid-year</li>
                        </ul>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Gift className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                    <h3 className="font-medium text-lg">No Bonus Entitlement</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      You don't currently have a bonus entitlement assigned. Contact HR for more information.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bonus History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Bonus History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">2024 Annual Bonus</p>
                      <p className="text-sm text-muted-foreground">Paid March 2024</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">AED 52,500</p>
                      <Badge variant="outline" className="text-xs">115% achieved</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">2023 Annual Bonus</p>
                      <p className="text-sm text-muted-foreground">Paid March 2023</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">AED 48,000</p>
                      <Badge variant="outline" className="text-xs">105% achieved</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
