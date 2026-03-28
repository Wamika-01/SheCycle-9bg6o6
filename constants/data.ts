export const WASTE_RATES: Record<string, number> = {
  Plastic: 30,
  Metal: 80,
  Glass: 10,
  Paper: 8,
  'E-waste': 120,
};

export const WASTE_COLORS: Record<string, string> = {
  Plastic: '#E8175D',
  Metal: '#F5A623',
  Glass: '#4A90D9',
  Paper: '#666680',
  'E-waste': '#7B5EA7',
};

export const RECYCLING_CENTERS = [
  {
    id: '1',
    name: 'Green Jalandhar Recyclers',
    address: 'GT Road',
    fullAddress: 'Near Bus Stand, GT Road, Jalandhar',
    distance: '2.3 km',
    badge: 'Full Service Recycler',
    status: 'Open',
    phone: '+91 98765 43210',
    hours: '8:00 AM - 7:00 PM',
    rating: 4.8,
    accepts: ['Plastic', 'Metal', 'Glass', 'Paper'],
  },
  {
    id: '2',
    name: 'EcoPunjab Hub',
    address: 'Model Town',
    fullAddress: 'Opp. Civil Hospital, Model Town, Jalandhar',
    distance: '3.7 km',
    badge: 'Certified Eco Center',
    status: 'Open',
    phone: '+91 98123 45678',
    hours: '7:00 AM - 8:00 PM',
    rating: 4.6,
    accepts: ['Plastic', 'Metal', 'E-waste'],
  },
  {
    id: '3',
    name: 'CleanCity Scrap Center',
    address: 'Nakodar Chowk',
    fullAddress: 'Near Railway Crossing, Nakodar Chowk, Jalandhar',
    distance: '4.1 km',
    badge: 'Scrap Specialist',
    status: 'Open',
    phone: '+91 97654 32109',
    hours: '9:00 AM - 6:00 PM',
    rating: 4.3,
    accepts: ['Metal', 'Glass', 'Paper'],
  },
  {
    id: '4',
    name: 'Hari Om Kabadi',
    address: 'Lajpat Nagar',
    fullAddress: 'Shop 14, Lajpat Nagar Market, Jalandhar',
    distance: '5.5 km',
    badge: 'Traditional Recycler',
    status: 'Closed',
    phone: '+91 99887 76655',
    hours: '8:00 AM - 5:00 PM',
    rating: 4.1,
    accepts: ['Plastic', 'Paper', 'Glass'],
  },
  {
    id: '5',
    name: 'Punjab Green Solutions',
    address: 'Phagwara Road',
    fullAddress: 'Industrial Area, Phagwara Road, Jalandhar',
    distance: '6.2 km',
    badge: 'Industrial Recycler',
    status: 'Open',
    phone: '+91 92345 67890',
    hours: '8:00 AM - 9:00 PM',
    rating: 4.7,
    accepts: ['Metal', 'E-waste', 'Plastic'],
  },
  {
    id: '6',
    name: 'EcoStar Recycling',
    address: 'Kapurthala Road',
    fullAddress: 'Green Zone, Kapurthala Road, Jalandhar',
    distance: '7.8 km',
    badge: 'Premium Recycler',
    status: 'Open',
    phone: '+91 93456 78901',
    hours: '7:00 AM - 7:00 PM',
    rating: 4.9,
    accepts: ['Plastic', 'Metal', 'Glass', 'Paper', 'E-waste'],
  },
];

export const SAFE_ZONES = [
  {
    id: '1',
    name: 'Model Town Park',
    distance: '0.8 km',
    timings: '6:00 AM - 10:00 PM',
    badges: ['Verified', 'CCTV', 'Well Lit'],
    description: 'Fully secured community park with police patrol',
  },
  {
    id: '2',
    name: 'Guru Nanak Mission Hospital Area',
    distance: '1.2 km',
    timings: '24 Hours',
    badges: ['Verified', 'CCTV', 'Well Lit', 'Guards'],
    description: 'Hospital zone with round-the-clock security',
  },
  {
    id: '3',
    name: 'Bus Stand Market Zone',
    distance: '2.4 km',
    timings: '6:00 AM - 11:00 PM',
    badges: ['CCTV', 'Well Lit'],
    description: 'Busy commercial area with good visibility',
  },
  {
    id: '4',
    name: 'Lyallpur Khalsa College Area',
    distance: '3.1 km',
    timings: '7:00 AM - 8:00 PM',
    badges: ['Verified', 'Well Lit'],
    description: 'Campus area with regular security presence',
  },
  {
    id: '5',
    name: 'City Centre Mall Area',
    distance: '3.8 km',
    timings: '9:00 AM - 10:00 PM',
    badges: ['Verified', 'CCTV', 'Well Lit', 'Guards'],
    description: 'Commercial zone with 24hr CCTV monitoring',
  },
];

export const INITIAL_TRANSACTIONS = [
  { id: 't1', item: 'PET Bottles', weight: 3.5, type: 'Plastic', earnings: 122.5, date: '27/3/2026', points: 18 },
  { id: 't2', item: 'Steel Scrap', weight: 5.2, type: 'Metal', earnings: 442.0, date: '26/3/2026', points: 26 },
  { id: 't3', item: 'Aluminum Cans', weight: 2.1, type: 'Metal', earnings: 172.2, date: '25/3/2026', points: 11 },
  { id: 't4', item: 'Glass Bottles', weight: 8.0, type: 'Glass', earnings: 64.0, date: '24/3/2026', points: 40 },
  { id: 't5', item: 'Cardboard', weight: 12.5, type: 'Paper', earnings: 100.0, date: '23/3/2026', points: 63 },
  { id: 't6', item: 'Mixed Plastic', weight: 4.2, type: 'Plastic', earnings: 126.0, date: '22/3/2026', points: 21 },
  { id: 't7', item: 'Copper Wire', weight: 1.8, type: 'Metal', earnings: 144.0, date: '21/3/2026', points: 9 },
  { id: 't8', item: 'Old Newspaper', weight: 6.0, type: 'Paper', earnings: 48.0, date: '20/3/2026', points: 30 },
  { id: 't9', item: 'Circuit Boards', weight: 0.5, type: 'E-waste', earnings: 60.0, date: '19/3/2026', points: 3 },
  { id: 't10', item: 'Iron Rods', weight: 9.0, type: 'Metal', earnings: 720.0, date: '18/3/2026', points: 45 },
];

export const WEEKLY_EARNINGS = [
  { day: '23 Mar', value: 100 },
  { day: '24 Mar', value: 64 },
  { day: '25 Mar', value: 172 },
  { day: '26 Mar', value: 442 },
  { day: '27 Mar', value: 122 },
];

export const WASTE_DISTRIBUTION = [
  { name: 'Metal', value: 23, color: '#F5A623' },
  { name: 'Plastic', value: 11, color: '#E8175D' },
  { name: 'Paper', value: 40, color: '#666680' },
  { name: 'Glass', value: 26, color: '#4A90D9' },
];

export const EMERGENCY_HELPLINES = [
  { name: 'Women Helpline', type: 'emergency', number: '1091', color: '#F5A623' },
  { name: 'Police Emergency', type: 'emergency', number: '112', color: '#F5A623' },
  { name: 'Police Control Room', type: 'police', number: '100', color: '#F5A623' },
  { name: 'Ambulance', type: 'medical', number: '108', color: '#E8175D' },
  { name: 'Fire Brigade', type: 'fire', number: '101', color: '#F76C2F' },
];

export const SCAN_RESULTS = [
  { type: 'Plastic', subtype: 'PET Bottle', confidence: 94, rate: 30, icon: '🧴' },
  { type: 'Metal', subtype: 'Steel Scrap', confidence: 88, rate: 80, icon: '⚙️' },
  { type: 'Glass', subtype: 'Glass Bottle', confidence: 91, rate: 10, icon: '🫙' },
  { type: 'Paper', subtype: 'Cardboard', confidence: 87, rate: 8, icon: '📦' },
  { type: 'Metal', subtype: 'Aluminum Can', confidence: 96, rate: 80, icon: '🥫' },
  { type: 'E-waste', subtype: 'Circuit Board', confidence: 82, rate: 120, icon: '💻' },
  { type: 'Plastic', subtype: 'HDPE Container', confidence: 89, rate: 30, icon: '🪣' },
];

export const TOP_COLLECTORS = [
  { rank: 1, name: 'Sunita Devi', points: 4820, kg: 182, earnings: 12450, badge: 'Top Performer' },
  { rank: 2, name: 'Rekha Sharma', points: 3940, kg: 156, earnings: 10230, badge: 'Top Performer' },
  { rank: 3, name: 'Meena Kumari', points: 3210, kg: 134, earnings: 8760, badge: 'Active Collector' },
  { rank: 4, name: 'Preeti Kaur', points: 2890, kg: 118, earnings: 7840, badge: 'Active Collector' },
  { rank: 5, name: 'Asha Rani', points: 2340, kg: 96, earnings: 6320, badge: 'Active Collector' },
];

export const BADGES = [
  { name: 'Beginner', minPoints: 0, maxPoints: 499, icon: '🌱', color: '#4A7C59' },
  { name: 'Active Collector', minPoints: 500, maxPoints: 1999, icon: '⭐', color: '#F5A623' },
  { name: 'Top Performer', minPoints: 2000, maxPoints: 4999, icon: '🏆', color: '#E8175D' },
  { name: 'Eco Champion', minPoints: 5000, maxPoints: 99999, icon: '👑', color: '#7B5EA7' },
];

export const REWARDS_CATALOG = [
  { id: 'r1', name: 'Mobile Recharge ₹50', points: 500, category: 'Utility', icon: '📱' },
  { id: 'r2', name: 'Bus Pass (1 Month)', points: 800, category: 'Transport', icon: '🚌' },
  { id: 'r3', name: 'Grocery Voucher ₹100', points: 1000, category: 'Shopping', icon: '🛒' },
  { id: 'r4', name: 'Mobile Recharge ₹100', points: 1000, category: 'Utility', icon: '📱' },
  { id: 'r5', name: 'Cash Transfer ₹200', points: 2000, category: 'Cash', icon: '💸' },
  { id: 'r6', name: 'School Fee Assistance', points: 3000, category: 'Education', icon: '🎓' },
];
