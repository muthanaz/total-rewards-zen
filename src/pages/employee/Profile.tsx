import { useState, useMemo } from 'react';
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

// Comprehensive list of countries with their cities and areas
const COUNTRIES_DATA: Record<string, Record<string, string[]>> = {
  "United Arab Emirates": {
    "Dubai": ["Downtown Dubai", "Dubai Marina", "Jumeirah", "JBR", "DIFC", "Business Bay", "Palm Jumeirah", "Deira", "Al Barsha", "Arabian Ranches", "Jumeirah Village Circle", "Dubai Hills Estate", "Al Quoz", "Motor City", "Silicon Oasis", "Sports City", "Mirdif", "Al Nahda", "International City", "Discovery Gardens"],
    "Abu Dhabi": ["Corniche", "Al Reem Island", "Yas Island", "Saadiyat Island", "Al Khalidiyah", "Tourist Club Area", "Al Mushrif", "Khalifa City", "Al Raha Beach", "Al Maryah Island", "Mohammed Bin Zayed City", "Al Reef", "Al Shamkha"],
    "Sharjah": ["Al Nahda", "Al Majaz", "Al Khan", "Al Qasimia", "Muwaileh", "University City", "Al Taawun", "Industrial Area"],
    "Ajman": ["Al Nuaimiya", "Al Rashidiya", "Ajman Downtown", "Al Jurf", "Emirates City"],
    "Ras Al Khaimah": ["Al Hamra Village", "Al Marjan Island", "RAK City", "Khuzam", "Al Nakheel"],
    "Fujairah": ["Fujairah City", "Dibba", "Al Faseel", "Sakamkam"],
    "Umm Al Quwain": ["UAQ City", "Al Salamah", "Al Raas"]
  },
  "Saudi Arabia": {
    "Riyadh": ["Al Olaya", "Al Malaz", "Al Muruj", "Al Sahafah", "Al Nakheel", "Al Wizarat", "Al Sulimaniyah", "KAFD", "DQ"],
    "Jeddah": ["Al Balad", "Al Hamra", "Al Rawdah", "Al Zahra", "Obhur", "Al Shati", "Al Safa"],
    "Dammam": ["Al Faisaliyah", "Al Shati", "Al Mazruiyah", "Al Anoud"],
    "Mecca": ["Ajyad", "Al Aziziyah", "Al Shoqiyah", "Al Hindawiyah"],
    "Medina": ["Al Haram", "Quba", "Al Awali", "Al Uyun"]
  },
  "United Kingdom": {
    "London": ["Westminster", "Kensington", "Chelsea", "Mayfair", "Canary Wharf", "Shoreditch", "Camden", "Islington", "Notting Hill", "Hampstead", "Greenwich", "Richmond", "Wimbledon"],
    "Manchester": ["City Centre", "Didsbury", "Chorlton", "Salford", "Ancoats", "Northern Quarter"],
    "Birmingham": ["City Centre", "Edgbaston", "Moseley", "Harborne", "Sutton Coldfield"],
    "Edinburgh": ["Old Town", "New Town", "Leith", "Morningside", "Stockbridge"],
    "Glasgow": ["City Centre", "West End", "Merchant City", "Southside"]
  },
  "United States": {
    "New York": ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island", "Harlem", "SoHo", "Tribeca", "Upper East Side", "Upper West Side"],
    "Los Angeles": ["Hollywood", "Beverly Hills", "Santa Monica", "Venice", "Downtown LA", "Malibu", "Pasadena"],
    "San Francisco": ["Financial District", "SoMa", "Marina", "Nob Hill", "Mission District", "Castro"],
    "Miami": ["South Beach", "Brickell", "Coral Gables", "Wynwood", "Coconut Grove"],
    "Chicago": ["The Loop", "Lincoln Park", "Wicker Park", "River North", "Gold Coast"]
  },
  "India": {
    "Mumbai": ["Bandra", "Juhu", "Andheri", "Powai", "Lower Parel", "Worli", "Colaba", "Dadar", "Kurla"],
    "Delhi": ["Connaught Place", "South Delhi", "Dwarka", "Rohini", "Vasant Kunj", "Greater Kailash"],
    "Bangalore": ["Koramangala", "Indiranagar", "Whitefield", "Electronic City", "Jayanagar", "HSR Layout"],
    "Chennai": ["T. Nagar", "Anna Nagar", "Adyar", "Velachery", "OMR"],
    "Hyderabad": ["Banjara Hills", "Jubilee Hills", "HITEC City", "Gachibowli", "Madhapur"]
  },
  "Pakistan": {
    "Karachi": ["Clifton", "DHA", "Gulshan-e-Iqbal", "PECHS", "Saddar", "North Nazimabad"],
    "Lahore": ["Gulberg", "DHA", "Model Town", "Johar Town", "Bahria Town"],
    "Islamabad": ["F-6", "F-7", "F-8", "E-7", "I-8", "Bahria Town"],
    "Rawalpindi": ["Saddar", "Bahria Town", "DHA", "Satellite Town"]
  },
  "Egypt": {
    "Cairo": ["Zamalek", "Maadi", "New Cairo", "Heliopolis", "6th of October City", "Nasr City", "Garden City"],
    "Alexandria": ["Smouha", "Gleem", "San Stefano", "Montaza"],
    "Giza": ["Mohandessin", "Dokki", "Sheikh Zayed City", "6th of October"]
  },
  "Jordan": {
    "Amman": ["Abdoun", "Sweifieh", "Dabouq", "Shmeisani", "Jabal Amman", "Jabal Al Hussein"],
    "Aqaba": ["Downtown", "Tala Bay", "Ayla"]
  },
  "Lebanon": {
    "Beirut": ["Achrafieh", "Hamra", "Verdun", "Mar Mikhael", "Downtown", "Gemmayzeh"],
    "Tripoli": ["Al Mina", "El Tal", "Azmi"],
    "Sidon": ["Old City", "Saida"]
  },
  "Qatar": {
    "Doha": ["West Bay", "The Pearl", "Lusail", "Al Sadd", "Katara", "Msheireb", "Al Wakra"],
    "Al Khor": ["Al Khor City", "Al Thakira"],
    "Al Rayyan": ["Education City", "Aspire Zone"]
  },
  "Kuwait": {
    "Kuwait City": ["Sharq", "Salmiya", "Hawalli", "Jabriya", "Mishref", "Salwa"],
    "Al Ahmadi": ["Fahaheel", "Mahboula", "Abu Halifa"]
  },
  "Bahrain": {
    "Manama": ["Juffair", "Seef", "Adliya", "Amwaj Islands", "Diplomatic Area"],
    "Muharraq": ["Hidd", "Busaiteen"]
  },
  "Oman": {
    "Muscat": ["Al Mouj", "Qurum", "Shatti Al Qurum", "Al Khuwair", "Bausher", "Ruwi"],
    "Salalah": ["Al Haffa", "Awqad", "Dahariz"]
  },
  "Germany": {
    "Berlin": ["Mitte", "Kreuzberg", "Prenzlauer Berg", "Charlottenburg", "Friedrichshain"],
    "Munich": ["Altstadt", "Maxvorstadt", "Schwabing", "Haidhausen"],
    "Frankfurt": ["Innenstadt", "Sachsenhausen", "Westend", "Nordend"]
  },
  "France": {
    "Paris": ["Le Marais", "Saint-Germain", "Montmartre", "Champs-Élysées", "La Défense", "Bastille"],
    "Lyon": ["Presqu'île", "Vieux Lyon", "Part-Dieu"],
    "Nice": ["Old Town", "Promenade des Anglais", "Port"]
  },
  "Canada": {
    "Toronto": ["Downtown", "Yorkville", "Liberty Village", "The Beaches", "North York"],
    "Vancouver": ["Downtown", "Yaletown", "Kitsilano", "Gastown", "West Vancouver"],
    "Montreal": ["Plateau", "Old Montreal", "Downtown", "Mile End"]
  },
  "Australia": {
    "Sydney": ["CBD", "Bondi", "Surry Hills", "Manly", "Newtown", "Darling Harbour"],
    "Melbourne": ["CBD", "St Kilda", "Fitzroy", "South Yarra", "Carlton"],
    "Brisbane": ["CBD", "South Bank", "Fortitude Valley", "New Farm"]
  },
  "Singapore": {
    "Singapore": ["Orchard", "Marina Bay", "Sentosa", "Bugis", "Tanjong Pagar", "Holland Village", "Tiong Bahru"]
  },
  "Hong Kong": {
    "Hong Kong": ["Central", "Wan Chai", "Causeway Bay", "Tsim Sha Tsui", "Mong Kok", "Kennedy Town"]
  },
  "Japan": {
    "Tokyo": ["Shibuya", "Shinjuku", "Roppongi", "Ginza", "Harajuku", "Minato", "Meguro"],
    "Osaka": ["Umeda", "Namba", "Shinsaibashi", "Tennoji"],
    "Kyoto": ["Gion", "Kawaramachi", "Arashiyama"]
  },
  "South Korea": {
    "Seoul": ["Gangnam", "Hongdae", "Itaewon", "Myeongdong", "Jamsil", "Yeouido"],
    "Busan": ["Haeundae", "Seomyeon", "Gwangalli"]
  },
  "China": {
    "Beijing": ["Chaoyang", "Dongcheng", "Haidian", "Xicheng"],
    "Shanghai": ["Pudong", "Jing'an", "Xuhui", "Huangpu"],
    "Shenzhen": ["Futian", "Nanshan", "Luohu"]
  },
  "Thailand": {
    "Bangkok": ["Sukhumvit", "Silom", "Sathorn", "Thonglor", "Ekkamai", "Ari"],
    "Phuket": ["Patong", "Kata", "Karon", "Rawai"],
    "Chiang Mai": ["Old City", "Nimman", "Santitham"]
  },
  "Malaysia": {
    "Kuala Lumpur": ["KLCC", "Bukit Bintang", "Mont Kiara", "Bangsar", "Damansara"],
    "Penang": ["George Town", "Gurney", "Tanjung Bungah"],
    "Johor Bahru": ["Iskandar Puteri", "Bukit Indah", "Taman Molek"]
  },
  "Indonesia": {
    "Jakarta": ["Menteng", "Kemang", "Sudirman", "Kuningan", "Senayan"],
    "Bali": ["Seminyak", "Canggu", "Ubud", "Sanur", "Nusa Dua"]
  },
  "Philippines": {
    "Manila": ["Makati", "BGC", "Ortigas", "Quezon City", "Pasig"],
    "Cebu": ["Cebu City", "Mandaue", "Lapu-Lapu"]
  },
  "South Africa": {
    "Johannesburg": ["Sandton", "Rosebank", "Melville", "Parkhurst"],
    "Cape Town": ["City Bowl", "Sea Point", "Camps Bay", "Constantia", "Woodstock"],
    "Durban": ["Umhlanga", "Morningside", "Berea"]
  },
  "Nigeria": {
    "Lagos": ["Victoria Island", "Ikoyi", "Lekki", "Ikeja", "Yaba"],
    "Abuja": ["Maitama", "Wuse", "Asokoro", "Garki"]
  },
  "Kenya": {
    "Nairobi": ["Westlands", "Karen", "Kilimani", "Lavington", "Runda"],
    "Mombasa": ["Nyali", "Bamburi", "Mtwapa"]
  },
  "Morocco": {
    "Casablanca": ["Maarif", "Anfa", "Gauthier", "Bourgogne"],
    "Marrakech": ["Gueliz", "Hivernage", "Medina"],
    "Tangier": ["City Centre", "Malabata", "Iberia"]
  },
  "Brazil": {
    "São Paulo": ["Jardins", "Pinheiros", "Vila Madalena", "Itaim Bibi"],
    "Rio de Janeiro": ["Copacabana", "Ipanema", "Leblon", "Barra da Tijuca"]
  },
  "Mexico": {
    "Mexico City": ["Polanco", "Condesa", "Roma", "Santa Fe", "Coyoacán"],
    "Cancún": ["Hotel Zone", "Downtown", "Puerto Cancún"]
  },
  "Argentina": {
    "Buenos Aires": ["Palermo", "Recoleta", "San Telmo", "Puerto Madero", "Belgrano"]
  },
  "Spain": {
    "Madrid": ["Salamanca", "Chamberí", "Malasaña", "La Latina", "Retiro"],
    "Barcelona": ["Eixample", "Gràcia", "Born", "Barceloneta", "Sarrià"]
  },
  "Italy": {
    "Rome": ["Trastevere", "Centro Storico", "Prati", "Testaccio", "Monti"],
    "Milan": ["Centro", "Brera", "Navigli", "Porta Nuova"]
  },
  "Netherlands": {
    "Amsterdam": ["Centrum", "Jordaan", "De Pijp", "Oud-Zuid", "Oost"],
    "Rotterdam": ["Centrum", "Kralingen", "Delfshaven"]
  },
  "Switzerland": {
    "Zurich": ["Altstadt", "Enge", "Seefeld", "Wiedikon"],
    "Geneva": ["Old Town", "Eaux-Vives", "Champel"]
  },
  "Ireland": {
    "Dublin": ["City Centre", "Ballsbridge", "Ranelagh", "Rathmines", "Dun Laoghaire"],
    "Cork": ["City Centre", "Douglas", "Blackrock"]
  },
  "New Zealand": {
    "Auckland": ["CBD", "Ponsonby", "Parnell", "Newmarket", "Remuera"],
    "Wellington": ["CBD", "Te Aro", "Thorndon", "Kelburn"]
  },
  "Russia": {
    "Moscow": ["Arbat", "Tverskoy", "Khamovniki", "Presnensky"],
    "Saint Petersburg": ["Nevsky", "Vasilievsky Island", "Petrogradsky"]
  },
  "Turkey": {
    "Istanbul": ["Beyoğlu", "Beşiktaş", "Kadıköy", "Şişli", "Sarıyer"],
    "Ankara": ["Çankaya", "Kızılay", "Oran"]
  },
  "Greece": {
    "Athens": ["Kolonaki", "Plaka", "Kifisia", "Glyfada", "Psiri"],
    "Thessaloniki": ["Ano Poli", "Ladadika", "Kalamaria"]
  },
  "Poland": {
    "Warsaw": ["Śródmieście", "Mokotów", "Żoliborz", "Wilanów"],
    "Krakow": ["Old Town", "Kazimierz", "Podgórze"]
  },
  "Sweden": {
    "Stockholm": ["Östermalm", "Södermalm", "Norrmalm", "Kungsholmen"],
    "Gothenburg": ["Centrum", "Majorna", "Haga"]
  },
  "Norway": {
    "Oslo": ["Frogner", "Grünerløkka", "Majorstuen", "Sentrum"],
    "Bergen": ["Sentrum", "Nordnes", "Sandviken"]
  },
  "Denmark": {
    "Copenhagen": ["Indre By", "Vesterbro", "Nørrebro", "Østerbro", "Frederiksberg"],
    "Aarhus": ["Centrum", "Trøjborg", "Frederiksbjerg"]
  },
  "Finland": {
    "Helsinki": ["Kamppi", "Punavuori", "Kallio", "Töölö"],
    "Espoo": ["Tapiola", "Leppävaara"]
  },
  "Austria": {
    "Vienna": ["Innere Stadt", "Leopoldstadt", "Mariahilf", "Neubau"],
    "Salzburg": ["Altstadt", "Nonntal", "Maxglan"]
  },
  "Belgium": {
    "Brussels": ["Ixelles", "Saint-Gilles", "Uccle", "Etterbeek"],
    "Antwerp": ["Centrum", "Zuid", "Zurenborg"]
  },
  "Portugal": {
    "Lisbon": ["Baixa", "Alfama", "Bairro Alto", "Principe Real", "Chiado"],
    "Porto": ["Ribeira", "Foz", "Cedofeita"]
  },
  "Czech Republic": {
    "Prague": ["Old Town", "Malá Strana", "Vinohrady", "Žižkov"],
    "Brno": ["Centre", "Královo Pole"]
  },
  "Hungary": {
    "Budapest": ["District V", "District VI", "District VII", "Buda Castle"],
    "Debrecen": ["Centre", "Nagyerdő"]
  },
  "Romania": {
    "Bucharest": ["Sector 1", "Sector 2", "Sector 3"],
    "Cluj-Napoca": ["Centre", "Mărăști"]
  },
  "Ukraine": {
    "Kyiv": ["Pechersk", "Podil", "Shevchenkivskyi"],
    "Lviv": ["Old Town", "Frankivskyi"]
  },
  "Vietnam": {
    "Ho Chi Minh City": ["District 1", "District 2", "District 7", "Binh Thanh"],
    "Hanoi": ["Hoan Kiem", "Ba Dinh", "Tay Ho"]
  },
  "Bangladesh": {
    "Dhaka": ["Gulshan", "Banani", "Dhanmondi", "Uttara"],
    "Chittagong": ["Agrabad", "Nasirabad"]
  },
  "Sri Lanka": {
    "Colombo": ["Colombo 3", "Colombo 7", "Rajagiriya", "Nugegoda"],
    "Kandy": ["City Centre", "Peradeniya"]
  },
  "Nepal": {
    "Kathmandu": ["Thamel", "Lazimpat", "Durbar Marg"],
    "Pokhara": ["Lakeside", "Pokhara City"]
  },
  "Tanzania": {
    "Dar es Salaam": ["Masaki", "Oyster Bay", "Mikocheni"],
    "Arusha": ["City Centre", "Njiro"]
  },
  "Ghana": {
    "Accra": ["Airport Residential", "East Legon", "Osu", "Cantonments"],
    "Kumasi": ["Adum", "Nhyiaeso"]
  },
  "Ethiopia": {
    "Addis Ababa": ["Bole", "Kazanchis", "Piazza", "CMC"],
    "Dire Dawa": ["City Centre"]
  },
  "Tunisia": {
    "Tunis": ["Lac", "La Marsa", "Sidi Bou Said", "Centre Ville"],
    "Sousse": ["Medina", "Port El Kantaoui"]
  },
  "Algeria": {
    "Algiers": ["Hydra", "El Biar", "Dely Ibrahim"],
    "Oran": ["Centre", "Bir El Djir"]
  },
  "Iraq": {
    "Baghdad": ["Mansour", "Karrada", "Jadriya"],
    "Erbil": ["Ankawa", "Ainkawa", "Dream City"]
  },
  "Yemen": {
    "Sana'a": ["Old City", "Hadda"],
    "Aden": ["Crater", "Maalla"]
  },
  "Syria": {
    "Damascus": ["Malki", "Abu Rummaneh", "Mezzeh"],
    "Aleppo": ["Aziziyeh", "Hamdaniyeh"]
  },
  "Afghanistan": {
    "Kabul": ["Wazir Akbar Khan", "Shahr-e-Naw", "Karte-e-Mamorin"],
    "Herat": ["City Centre"]
  },
  "Uzbekistan": {
    "Tashkent": ["Mirzo Ulugbek", "Yakkasaray", "Sergeli"],
    "Samarkand": ["Old City", "Registan"]
  },
  "Kazakhstan": {
    "Almaty": ["Medeu", "Bostandyk", "Almaly"],
    "Nur-Sultan": ["Yesil", "Saryarka"]
  },
  "Azerbaijan": {
    "Baku": ["Nasimi", "Sabail", "Yasamal"],
    "Ganja": ["City Centre"]
  },
  "Georgia": {
    "Tbilisi": ["Old Town", "Vake", "Saburtalo", "Vera"],
    "Batumi": ["Boulevard", "Old Town"]
  },
  "Armenia": {
    "Yerevan": ["Centre", "Arabkir", "Avan"],
    "Gyumri": ["City Centre"]
  }
};

const COUNTRIES = Object.keys(COUNTRIES_DATA).sort();

const INTERESTS_OPTIONS = [
  // Sports & Fitness
  'Running', 'Swimming', 'Yoga', 'Pilates', 'CrossFit', 'Cycling', 'Hiking', 'Tennis', 'Golf', 'Football', 'Basketball', 'Martial Arts', 'Boxing', 'Weightlifting', 'Rock Climbing', 'Surfing', 'Skiing', 'Snowboarding', 'Diving', 'Sailing',
  // Creative & Arts
  'Photography', 'Painting', 'Drawing', 'Sculpting', 'Writing', 'Poetry', 'Music', 'Singing', 'Dancing', 'Theater', 'Film Making', 'Graphic Design', 'Interior Design', 'Fashion', 'Crafts', 'Pottery', 'Calligraphy', 'Origami',
  // Technology & Gaming
  'Gaming', 'Video Games', 'Board Games', 'Chess', 'Coding', 'Tech Gadgets', 'AI & Machine Learning', 'Robotics', 'VR/AR', '3D Printing', 'Drones',
  // Food & Drink
  'Cooking', 'Baking', 'Wine Tasting', 'Coffee', 'Mixology', 'Food Photography', 'Restaurant Exploration', 'BBQ/Grilling', 'Healthy Eating', 'Vegan Cuisine',
  // Travel & Culture
  'Travel', 'Backpacking', 'Road Trips', 'Cultural Exploration', 'Language Learning', 'History', 'Museums', 'Architecture', 'Volunteering', 'Cultural Exchange',
  // Nature & Outdoors
  'Gardening', 'Bird Watching', 'Camping', 'Fishing', 'Stargazing', 'Nature Photography', 'Environmental Conservation', 'Beekeeping', 'Foraging',
  // Lifestyle & Wellness
  'Meditation', 'Mindfulness', 'Spa & Wellness', 'Aromatherapy', 'Journaling', 'Self-Improvement', 'Public Speaking', 'Networking', 'Investing', 'Personal Finance',
  // Entertainment
  'Movies', 'TV Series', 'Podcasts', 'Reading', 'Book Clubs', 'Comedy', 'Stand-up', 'Magic', 'Concerts', 'Festivals',
  // Collecting & Hobbies
  'Antiques', 'Vinyl Records', 'Art Collection', 'Watches', 'Cars', 'Motorcycles', 'Stamps', 'Coins', 'Sneakers', 'Model Building',
  // Pets & Animals
  'Dog Training', 'Cat Care', 'Horseback Riding', 'Pet Photography', 'Animal Rescue', 'Aquariums',
  // Social & Community
  'Volunteering', 'Mentoring', 'Community Service', 'Charity Work', 'Social Causes', 'Environmental Activism'
];

export default function ProfilePage() {
  const { toast } = useToast();
  const [profile, setProfile] = useState({
    firstName: 'John', lastName: 'Smith', email: 'john.smith@company.com', phone: '+971 50 123 4567',
    dateOfBirth: '1990-05-15',
    nationality: 'United Kingdom', emiratesId: '784-1990-1234567-1', bloodType: 'O+', language: 'en',
    country: 'United Arab Emirates', city: 'Dubai', area: 'Dubai Marina',
    position: 'Senior Product Manager', department: 'Product', grade: 'G7', manager: 'Sarah Johnson', employmentDate: '2023-01-15', salary: '35000',
    workLocation: 'DIFC',
    maritalStatus: 'married', spouseName: 'Jane Smith', spouseDateOfBirth: '1992-08-22', emergencyName: 'Jane Smith', emergencyPhone: '+971 50 987 6543',
  });

  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Travel', 'Fitness', 'Technology', 'Photography']);

  const [children, setChildren] = useState<Child[]>([
    { id: '1', name: 'Emma Smith', dateOfBirth: '2015-03-15', grade: 'Grade 4', schoolName: 'GEMS Wellington Academy' },
    { id: '2', name: 'Oliver Smith', dateOfBirth: '2018-07-22', grade: 'Grade 1', schoolName: 'GEMS Wellington Academy' },
  ]);

  const [pets, setPets] = useState<Pet[]>([
    { id: '1', name: 'Max', type: 'Dog', breed: 'Golden Retriever' },
  ]);

  // Get cities based on selected country
  const cities = useMemo(() => {
    if (!profile.country || !COUNTRIES_DATA[profile.country]) return [];
    return Object.keys(COUNTRIES_DATA[profile.country]).sort();
  }, [profile.country]);

  // Get areas based on selected city
  const areas = useMemo(() => {
    if (!profile.country || !profile.city || !COUNTRIES_DATA[profile.country]?.[profile.city]) return [];
    return COUNTRIES_DATA[profile.country][profile.city].sort();
  }, [profile.country, profile.city]);

  const handleCountryChange = (country: string) => {
    setProfile({ ...profile, country, city: '', area: '' });
  };

  const handleCityChange = (city: string) => {
    setProfile({ ...profile, city, area: '' });
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

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
          <div className="space-y-2"><Label>Date of Birth</Label><Input type="date" value={profile.dateOfBirth} onChange={(e) => setProfile({...profile, dateOfBirth: e.target.value})} /></div>
          <div className="space-y-2"><Label>Email</Label><Input value={profile.email} disabled /></div>
          <div className="space-y-2"><Label>Phone</Label><Input value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} /></div>
          <div className="space-y-2"><Label>Nationality</Label><Input value={profile.nationality} onChange={(e) => setProfile({...profile, nationality: e.target.value})} /></div>
          <div className="space-y-2"><Label>Emirates ID</Label><Input value={profile.emiratesId} onChange={(e) => setProfile({...profile, emiratesId: e.target.value})} /></div>
          <div className="space-y-2"><Label>Blood Type</Label><Select value={profile.bloodType} onValueChange={(v) => setProfile({...profile, bloodType: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Preferred Language</Label><Select value={profile.language} onValueChange={(v) => setProfile({...profile, language: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="en">English</SelectItem><SelectItem value="ar">Arabic</SelectItem></SelectContent></Select></div>
          
          {/* Location fields */}
          <div className="space-y-2">
            <Label>Country of Residence</Label>
            <Select value={profile.country} onValueChange={handleCountryChange}>
              <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {COUNTRIES.map(country => <SelectItem key={country} value={country}>{country}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>City</Label>
            <Select value={profile.city} onValueChange={handleCityChange} disabled={!profile.country}>
              <SelectTrigger><SelectValue placeholder={profile.country ? "Select city" : "Select country first"} /></SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {cities.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Area / Neighborhood</Label>
            <Select value={profile.area} onValueChange={(v) => setProfile({...profile, area: v})} disabled={!profile.city}>
              <SelectTrigger><SelectValue placeholder={profile.city ? "Select area" : "Select city first"} /></SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {areas.map(area => <SelectItem key={area} value={area}>{area}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent></Card></TabsContent>

        <TabsContent value="work"><Card><CardHeader><CardTitle className="text-base">Work Information</CardTitle></CardHeader><CardContent className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Position</Label><Input value={profile.position} disabled /></div>
          <div className="space-y-2"><Label>Department</Label><Input value={profile.department} disabled /></div>
          <div className="space-y-2"><Label>Grade</Label><Input value={profile.grade} disabled /></div>
          <div className="space-y-2"><Label>Manager</Label><Input value={profile.manager} disabled /></div>
          <div className="space-y-2"><Label>Employment Date</Label><Input value={profile.employmentDate} disabled /></div>
          <div className="space-y-2"><Label>Monthly Salary (AED)</Label><Input value={profile.salary} disabled /></div>
          <div className="space-y-2 md:col-span-2"><Label>Work Location</Label><Input value={profile.workLocation} onChange={(e) => setProfile({...profile, workLocation: e.target.value})} /></div>
        </CardContent></Card></TabsContent>

        <TabsContent value="family" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Family Information</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Marital Status</Label><Select value={profile.maritalStatus} onValueChange={(v) => setProfile({...profile, maritalStatus: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="single">Single</SelectItem><SelectItem value="married">Married</SelectItem><SelectItem value="divorced">Divorced</SelectItem><SelectItem value="widowed">Widowed</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>Spouse Name</Label><Input value={profile.spouseName} onChange={(e) => setProfile({...profile, spouseName: e.target.value})} placeholder="Enter spouse name" disabled={profile.maritalStatus !== 'married'} /></div>
              <div className="space-y-2"><Label>Spouse Date of Birth</Label><Input type="date" value={profile.spouseDateOfBirth} onChange={(e) => setProfile({...profile, spouseDateOfBirth: e.target.value})} disabled={profile.maritalStatus !== 'married'} /></div>
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
                            <SelectItem value="Hamster">Hamster</SelectItem>
                            <SelectItem value="Guinea Pig">Guinea Pig</SelectItem>
                            <SelectItem value="Turtle">Turtle</SelectItem>
                            <SelectItem value="Reptile">Reptile</SelectItem>
                            <SelectItem value="Horse">Horse</SelectItem>
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
              <p className="text-sm text-muted-foreground mb-4">Select your interests to help us personalize marketplace recommendations. Click to toggle.</p>
              <div className="flex flex-wrap gap-2">
                {INTERESTS_OPTIONS.map(interest => (
                  <Button 
                    key={interest} 
                    variant={selectedInterests.includes(interest) ? "default" : "outline"} 
                    size="sm"
                    onClick={() => toggleInterest(interest)}
                    className={selectedInterests.includes(interest) ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}
                  >
                    {interest}
                  </Button>
                ))}
              </div>
              {selectedInterests.length > 0 && (
                <p className="text-xs text-muted-foreground mt-4">
                  Selected: {selectedInterests.length} interest{selectedInterests.length !== 1 ? 's' : ''}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
