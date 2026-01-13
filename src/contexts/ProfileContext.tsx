import { createContext, useContext, useState, ReactNode, useMemo } from 'react';

export interface Child {
  id: string;
  name: string;
  dateOfBirth: string;
  grade: string;
  schoolName: string;
}

export interface Pet {
  id: string;
  name: string;
  type: string;
  breed: string;
}

export interface ProfileData {
  // Basic Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationality: string;
  emiratesId: string;
  language: string;
  gender: 'male' | 'female' | 'other';
  // Residence
  country: string;
  city: string;
  area: string;
  // Work
  position: string;
  department: string;
  grade: string;
  manager: string;
  employmentDate: string;
  salary: string;
  workLocation: string;
  // Family
  maritalStatus: string;
  spouseName: string;
  spouseDateOfBirth: string;
  emergencyName: string;
  emergencyPhone: string;
}

interface ProfileContextType {
  profile: ProfileData;
  setProfile: (profile: ProfileData) => void;
  updateProfile: (updates: Partial<ProfileData>) => void;
  children: Child[];
  setChildren: (children: Child[]) => void;
  addChild: () => void;
  updateChild: (id: string, field: keyof Child, value: string) => void;
  removeChild: (id: string) => void;
  pets: Pet[];
  setPets: (pets: Pet[]) => void;
  addPet: () => void;
  updatePet: (id: string, field: keyof Pet, value: string) => void;
  removePet: (id: string) => void;
  selectedInterests: string[];
  setSelectedInterests: (interests: string[]) => void;
  toggleInterest: (interest: string) => void;
  // Computed values
  monthlySalary: number;
  annualSalary: number;
  fullName: string;
  childrenCount: number;
  homeLocation: string;
}

const defaultProfile: ProfileData = {
  firstName: 'John',
  lastName: 'Smith',
  email: 'john.smith@company.com',
  phone: '+971 50 123 4567',
  dateOfBirth: '1990-05-15',
  nationality: 'United Kingdom',
  emiratesId: '784-1990-1234567-1',
  language: 'en',
  gender: 'male',
  country: 'United Arab Emirates',
  city: 'Dubai',
  area: 'Dubai Marina',
  position: 'Senior Product Manager',
  department: 'Product',
  grade: 'G7',
  manager: 'Sarah Johnson',
  employmentDate: '2023-01-15',
  salary: '35000',
  workLocation: 'DIFC',
  maritalStatus: 'married',
  spouseName: 'Jane Smith',
  spouseDateOfBirth: '1992-08-22',
  emergencyName: 'Jane Smith',
  emergencyPhone: '+971 50 987 6543',
};

const defaultChildren: Child[] = [
  { id: '1', name: 'Emma Smith', dateOfBirth: '2015-03-15', grade: 'Grade 4', schoolName: 'GEMS Wellington Academy' },
  { id: '2', name: 'Oliver Smith', dateOfBirth: '2018-07-22', grade: 'Grade 1', schoolName: 'GEMS Wellington Academy' },
];

const defaultPets: Pet[] = [
  { id: '1', name: 'Max', type: 'Dog', breed: 'Golden Retriever' },
];

const defaultInterests = ['Travel', 'Fitness', 'Technology', 'Photography'];

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children: childrenProp }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [children, setChildren] = useState<Child[]>(defaultChildren);
  const [pets, setPets] = useState<Pet[]>(defaultPets);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(defaultInterests);

  const updateProfile = (updates: Partial<ProfileData>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const addChild = () => {
    const newChild: Child = { id: Date.now().toString(), name: '', dateOfBirth: '', grade: '', schoolName: '' };
    setChildren(prev => [...prev, newChild]);
  };

  const updateChild = (id: string, field: keyof Child, value: string) => {
    setChildren(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const removeChild = (id: string) => {
    setChildren(prev => prev.filter(c => c.id !== id));
  };

  const addPet = () => {
    const newPet: Pet = { id: Date.now().toString(), name: '', type: 'Dog', breed: '' };
    setPets(prev => [...prev, newPet]);
  };

  const updatePet = (id: string, field: keyof Pet, value: string) => {
    setPets(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const removePet = (id: string) => {
    setPets(prev => prev.filter(p => p.id !== id));
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  // Computed values
  const monthlySalary = useMemo(() => parseInt(profile.salary) || 0, [profile.salary]);
  const annualSalary = useMemo(() => monthlySalary * 12, [monthlySalary]);
  const fullName = useMemo(() => `${profile.firstName} ${profile.lastName}`.trim(), [profile.firstName, profile.lastName]);
  const childrenCount = useMemo(() => children.filter(c => c.name.trim() !== '').length, [children]);
  const homeLocation = useMemo(() => {
    const parts = [profile.area, profile.city, profile.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Not set';
  }, [profile.area, profile.city, profile.country]);

  const value: ProfileContextType = {
    profile,
    setProfile,
    updateProfile,
    children,
    setChildren,
    addChild,
    updateChild,
    removeChild,
    pets,
    setPets,
    addPet,
    updatePet,
    removePet,
    selectedInterests,
    setSelectedInterests,
    toggleInterest,
    monthlySalary,
    annualSalary,
    fullName,
    childrenCount,
    homeLocation,
  };

  return (
    <ProfileContext.Provider value={value}>
      {childrenProp}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
