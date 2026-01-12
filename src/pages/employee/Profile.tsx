import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Briefcase, Users, Heart, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { toast } = useToast();
  const [profile, setProfile] = useState({
    firstName: 'John', lastName: 'Smith', email: 'john.smith@company.com', phone: '+971 50 123 4567',
    nationality: 'United Kingdom', emiratesId: '784-1990-1234567-1', bloodType: 'O+', language: 'en',
    position: 'Senior Product Manager', department: 'Product', grade: 'G7', manager: 'Sarah Johnson', employmentDate: '2023-01-15', salary: '35000',
    maritalStatus: 'married', spouseName: 'Jane Smith', emergencyName: 'Jane Smith', emergencyPhone: '+971 50 987 6543',
    homeLocation: 'Dubai Marina', workLocation: 'DIFC',
  });

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

        <TabsContent value="family"><Card><CardHeader><CardTitle className="text-base">Family Information</CardTitle></CardHeader><CardContent className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Marital Status</Label><Select value={profile.maritalStatus} onValueChange={(v) => setProfile({...profile, maritalStatus: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="single">Single</SelectItem><SelectItem value="married">Married</SelectItem></SelectContent></Select></div>
          <div className="space-y-2"><Label>Spouse Name</Label><Input value={profile.spouseName} onChange={(e) => setProfile({...profile, spouseName: e.target.value})} /></div>
          <div className="space-y-2"><Label>Emergency Contact Name</Label><Input value={profile.emergencyName} onChange={(e) => setProfile({...profile, emergencyName: e.target.value})} /></div>
          <div className="space-y-2"><Label>Emergency Contact Phone</Label><Input value={profile.emergencyPhone} onChange={(e) => setProfile({...profile, emergencyPhone: e.target.value})} /></div>
        </CardContent></Card></TabsContent>

        <TabsContent value="lifestyle"><Card><CardHeader><CardTitle className="text-base">Lifestyle & Interests</CardTitle></CardHeader><CardContent>
          <p className="text-sm text-muted-foreground mb-4">Your interests help us personalize marketplace recommendations.</p>
          <div className="flex flex-wrap gap-2">{['Travel', 'Fitness', 'Reading', 'Technology', 'Food', 'Music', 'Sports', 'Art'].map(i => <Button key={i} variant="outline" size="sm">{i}</Button>)}</div>
        </CardContent></Card></TabsContent>
      </Tabs>
    </div>
  );
}
