import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Briefcase, Users, Heart, Save, Plus, Trash2, Baby, PawPrint } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Child {
  id: string;
  name: string;
  dateOfBirth: string;
  grade: string;
  schoolName: string;
}

interface Pet {
  id: string;
  name: string;
  type: string;
  breed: string;
}

export default function ProfilePage() {
  const { toast } = useToast();
  const [profile, setProfile] = useState({
    firstName: 'John', lastName: 'Smith', email: 'john.smith@company.com', phone: '+971 50 123 4567',
    nationality: 'United Kingdom', emiratesId: '784-1990-1234567-1', bloodType: 'O+', language: 'en',
    position: 'Senior Product Manager', department: 'Product', grade: 'G7', manager: 'Sarah Johnson', employmentDate: '2023-01-15', salary: '35000',
    maritalStatus: 'married', spouseName: 'Jane Smith', emergencyName: 'Jane Smith', emergencyPhone: '+971 50 987 6543',
    homeLocation: 'Dubai Marina', workLocation: 'DIFC',
  });

  const [children, setChildren] = useState<Child[]>([
    { id: '1', name: 'Emma Smith', dateOfBirth: '2015-03-15', grade: 'Grade 4', schoolName: 'GEMS Wellington Academy' },
    { id: '2', name: 'Oliver Smith', dateOfBirth: '2018-07-22', grade: 'Grade 1', schoolName: 'GEMS Wellington Academy' },
  ]);

  const [pets, setPets] = useState<Pet[]>([
    { id: '1', name: 'Max', type: 'Dog', breed: 'Golden Retriever' },
  ]);

  const addChild = () => {
    const newChild: Child = { id: Date.now().toString(), name: '', dateOfBirth: '', grade: '', schoolName: '' };
    setChildren([...children, newChild]);
  };

  const updateChild = (id: string, field: keyof Child, value: string) => {
    setChildren(children.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const removeChild = (id: string) => {
    setChildren(children.filter(c => c.id !== id));
  };

  const addPet = () => {
    const newPet: Pet = { id: Date.now().toString(), name: '', type: 'Dog', breed: '' };
    setPets([...pets, newPet]);
  };

  const updatePet = (id: string, field: keyof Pet, value: string) => {
    setPets(pets.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const removePet = (id: string) => {
    setPets(pets.filter(p => p.id !== id));
  };

  const handleSave = () => {
    toast({ title: "Profile Updated", description: "Your profile has been saved successfully." });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-3"><User className="w-7 h-7 text-accent" />Smart Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your personal information</p>
        </div>
        <Button onClick={handleSave}><Save className="w-4 h-4 mr-2" />Save Changes</Button>
      </div>

      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList><TabsTrigger value="personal"><User className="w-4 h-4 mr-2" />Personal</TabsTrigger><TabsTrigger value="work"><Briefcase className="w-4 h-4 mr-2" />Work</TabsTrigger><TabsTrigger value="family"><Users className="w-4 h-4 mr-2" />Family</TabsTrigger><TabsTrigger value="lifestyle"><Heart className="w-4 h-4 mr-2" />Lifestyle</TabsTrigger></TabsList>
        
        <TabsContent value="personal"><Card><CardHeader><CardTitle className="text-base">Personal Information</CardTitle></CardHeader><CardContent className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>First Name</Label><Input value={profile.firstName} onChange={(e) => setProfile({...profile, firstName: e.target.value})} /></div>
          <div className="space-y-2"><Label>Last Name</Label><Input value={profile.lastName} onChange={(e) => setProfile({...profile, lastName: e.target.value})} /></div>
          <div className="space-y-2"><Label>Email</Label><Input value={profile.email} disabled /></div>
          <div className="space-y-2"><Label>Phone</Label><Input value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} /></div>
          <div className="space-y-2"><Label>Nationality</Label><Input value={profile.nationality} onChange={(e) => setProfile({...profile, nationality: e.target.value})} /></div>
          <div className="space-y-2"><Label>Emirates ID</Label><Input value={profile.emiratesId} onChange={(e) => setProfile({...profile, emiratesId: e.target.value})} /></div>
          <div className="space-y-2"><Label>Blood Type</Label><Select value={profile.bloodType} onValueChange={(v) => setProfile({...profile, bloodType: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Preferred Language</Label><Select value={profile.language} onValueChange={(v) => setProfile({...profile, language: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="en">English</SelectItem><SelectItem value="ar">Arabic</SelectItem></SelectContent></Select></div>
        </CardContent></Card></TabsContent>

        <TabsContent value="work"><Card><CardHeader><CardTitle className="text-base">Work Information</CardTitle></CardHeader><CardContent className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Position</Label><Input value={profile.position} disabled /></div>
          <div className="space-y-2"><Label>Department</Label><Input value={profile.department} disabled /></div>
          <div className="space-y-2"><Label>Grade</Label><Input value={profile.grade} disabled /></div>
          <div className="space-y-2"><Label>Manager</Label><Input value={profile.manager} disabled /></div>
          <div className="space-y-2"><Label>Employment Date</Label><Input value={profile.employmentDate} disabled /></div>
          <div className="space-y-2"><Label>Monthly Salary (AED)</Label><Input value={profile.salary} disabled /></div>
          <div className="space-y-2"><Label>Work Location</Label><Input value={profile.workLocation} onChange={(e) => setProfile({...profile, workLocation: e.target.value})} /></div>
          <div className="space-y-2"><Label>Home Location</Label><Input value={profile.homeLocation} onChange={(e) => setProfile({...profile, homeLocation: e.target.value})} /></div>
        </CardContent></Card></TabsContent>

        <TabsContent value="family" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Family Information</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Marital Status</Label><Select value={profile.maritalStatus} onValueChange={(v) => setProfile({...profile, maritalStatus: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="single">Single</SelectItem><SelectItem value="married">Married</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>Spouse Name</Label><Input value={profile.spouseName} onChange={(e) => setProfile({...profile, spouseName: e.target.value})} /></div>
              <div className="space-y-2"><Label>Emergency Contact Name</Label><Input value={profile.emergencyName} onChange={(e) => setProfile({...profile, emergencyName: e.target.value})} /></div>
              <div className="space-y-2"><Label>Emergency Contact Phone</Label><Input value={profile.emergencyPhone} onChange={(e) => setProfile({...profile, emergencyPhone: e.target.value})} /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2"><Baby className="w-4 h-4 text-accent" />Children</CardTitle>
              <Button size="sm" variant="outline" onClick={addChild}><Plus className="w-4 h-4 mr-1" />Add Child</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {children.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No children added yet. Click "Add Child" to add dependents.</p>
              ) : (
                children.map((child, index) => (
                  <div key={child.id} className="p-4 border rounded-lg space-y-3 relative bg-muted/30">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Child {index + 1}</span>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => removeChild(child.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="space-y-1.5"><Label className="text-xs">Full Name</Label><Input value={child.name} onChange={(e) => updateChild(child.id, 'name', e.target.value)} placeholder="Child's full name" /></div>
                      <div className="space-y-1.5"><Label className="text-xs">Date of Birth</Label><Input type="date" value={child.dateOfBirth} onChange={(e) => updateChild(child.id, 'dateOfBirth', e.target.value)} /></div>
                      <div className="space-y-1.5"><Label className="text-xs">Grade / Year</Label><Input value={child.grade} onChange={(e) => updateChild(child.id, 'grade', e.target.value)} placeholder="e.g., Grade 4" /></div>
                      <div className="space-y-1.5"><Label className="text-xs">School Name</Label><Input value={child.schoolName} onChange={(e) => updateChild(child.id, 'schoolName', e.target.value)} placeholder="School name" /></div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lifestyle" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2"><PawPrint className="w-4 h-4 text-accent" />Pets</CardTitle>
              <Button size="sm" variant="outline" onClick={addPet}><Plus className="w-4 h-4 mr-1" />Add Pet</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {pets.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No pets added yet. Click "Add Pet" to add your furry friends.</p>
              ) : (
                pets.map((pet, index) => (
                  <div key={pet.id} className="p-4 border rounded-lg space-y-3 relative bg-muted/30">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Pet {index + 1}</span>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => removePet(pet.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                    <div className="grid md:grid-cols-3 gap-3">
                      <div className="space-y-1.5"><Label className="text-xs">Pet Name</Label><Input value={pet.name} onChange={(e) => updatePet(pet.id, 'name', e.target.value)} placeholder="Pet's name" /></div>
                      <div className="space-y-1.5"><Label className="text-xs">Type</Label>
                        <Select value={pet.type} onValueChange={(v) => updatePet(pet.id, 'type', v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Dog">Dog</SelectItem>
                            <SelectItem value="Cat">Cat</SelectItem>
                            <SelectItem value="Bird">Bird</SelectItem>
                            <SelectItem value="Fish">Fish</SelectItem>
                            <SelectItem value="Rabbit">Rabbit</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5"><Label className="text-xs">Breed</Label><Input value={pet.breed} onChange={(e) => updatePet(pet.id, 'breed', e.target.value)} placeholder="Breed (optional)" /></div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Interests & Hobbies</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Your interests help us personalize marketplace recommendations.</p>
              <div className="flex flex-wrap gap-2">{['Travel', 'Fitness', 'Reading', 'Technology', 'Food', 'Music', 'Sports', 'Art', 'Photography', 'Gaming', 'Cooking', 'Gardening'].map(i => <Button key={i} variant="outline" size="sm">{i}</Button>)}</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
