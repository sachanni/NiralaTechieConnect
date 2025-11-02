export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  services: ServiceItem[];
}

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: 'food',
    name: 'Food Network',
    icon: '🍰',
    description: 'All food-related services',
    services: [
      { id: 'tiffin', name: 'Tiffin Services', description: 'Home-cooked meal delivery' },
      { id: 'baking', name: 'Home Bakers', description: 'Cakes, cookies, and baked goods' },
      { id: 'meal_prep', name: 'Meal Prep Services', description: 'Healthy meal preparation' },
      { id: 'special_diet', name: 'Special Diet Meals', description: 'Keto, vegan, and diet-specific meals' },
      { id: 'catering', name: 'Catering for Events', description: 'Small event catering services' },
    ],
  },
  {
    id: 'mobility',
    name: 'Smart Mobility',
    icon: '🚗',
    description: 'Transportation and ride sharing',
    services: [
      { id: 'office_carpool', name: 'Office Carpool', description: 'Daily commute ride sharing' },
      { id: 'school_run', name: 'School Run Sharing', description: 'School pickup and drop-off' },
      { id: 'airport_ride', name: 'Airport Ride Sharing', description: 'Airport transfer sharing' },
      { id: 'weekend_trips', name: 'Weekend Trip Buddies', description: 'Weekend travel companions' },
      { id: 'bike_pooling', name: 'Bike Pooling', description: 'Two-wheeler ride sharing' },
      { id: 'blabla_traveling', name: 'BlaBlaCar Traveling', description: 'Long-distance ride sharing' },
    ],
  },
  {
    id: 'marketplace',
    name: 'Group Buying & Gifts',
    icon: '🎁',
    description: 'Organized group purchases and gift exchanges',
    services: [
      { id: 'bulk_buying', name: 'Bulk Buying Groups', description: 'Collective purchasing for savings' },
      { id: 'gifts_toys', name: 'Gifts & Toys', description: 'Gift items and children toys' },
    ],
  },
  {
    id: 'kids',
    name: 'Kids & Parenting',
    icon: '👶',
    description: 'Parenting support and kids activities',
    services: [
      { id: 'babysitting', name: 'Babysitting Network', description: 'Trusted babysitting services' },
      { id: 'playdate', name: 'Playdate Coordination', description: 'Organize playdates for kids' },
      { id: 'homework_help', name: 'Homework Help Exchange', description: 'Help with homework and studies' },
      { id: 'toy_library', name: 'Toy Library', description: 'Share and exchange toys' },
      { id: 'kids_activities', name: 'Kids Activity Groups', description: 'Group activities for children' },
    ],
  },
  {
    id: 'learning',
    name: 'Learning & Classes',
    icon: '📚',
    description: 'Educational classes and skill development',
    services: [
      { id: 'cooking', name: 'Cooking Classes', description: 'Learn to cook delicious meals' },
      { id: 'dance', name: 'Dance Classes', description: 'Dance styles from classical to contemporary' },
      { id: 'music', name: 'Music Classes', description: 'Vocal and instrumental training' },
      { id: 'education', name: 'Education/Tuition', description: 'Academic tutoring and coaching' },
    ],
  },
  {
    id: 'health',
    name: 'Health & Wellness',
    icon: '🏥',
    description: 'Healthcare and wellness services',
    services: [
      { id: 'home_doctor', name: 'Home Doctor Consultations', description: 'General physician home visits' },
      { id: 'specialist', name: 'Specialist Consultations', description: 'Specialists (pediatrician, dermatologist, etc.)' },
      { id: 'physiotherapy', name: 'Physiotherapy Services', description: 'Physical therapy at home' },
      { id: 'health_checkup', name: 'Health Check-up Coordination', description: 'Organize group health check-ups' },
      { id: 'yoga', name: 'Yoga & Fitness', description: 'Fitness and wellness through yoga' },
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    icon: '💼',
    description: 'Career and mentoring services',
    services: [
      { id: 'tech_mentoring', name: 'Tech Mentoring', description: 'One-on-one skill development' },
      { id: 'career', name: 'Career Counseling', description: 'Professional career guidance' },
      { id: 'interview', name: 'Interview Preparation', description: 'Mock interviews and tips' },
    ],
  },
  {
    id: 'beauty',
    name: 'Beauty & Personal Care',
    icon: '💅',
    description: 'Beauty and grooming services',
    services: [
      { id: 'beauty_parlour', name: 'Beauty Parlour / Salon Services', description: 'Professional beauty services at home' },
      { id: 'mehendi', name: 'Mehendi / Makeup Artists', description: 'Mehendi and makeup services' },
      { id: 'hairstyling', name: 'Hairstyling', description: 'Professional hairstyling at home' },
      { id: 'tailoring', name: 'Tailoring & Stitching', description: 'Minor alterations and stitching' },
    ],
  },
  {
    id: 'events-organizing',
    name: 'Event Organizing',
    icon: '🎉',
    description: 'Professional event planning and coordination',
    services: [
      { id: 'birthday_party', name: 'Birthday Party Planning', description: 'Complete birthday celebration planning' },
      { id: 'decoration', name: 'Decoration Services', description: 'Professional decoration for all occasions' },
      { id: 'full_event', name: 'Full Event Management', description: 'End-to-end event planning and execution' },
    ],
  },
];

export const TOWER_OPTIONS = [
  'Tower A',
  'Tower B',
  'Tower C',
  'Tower D',
  'Tower E',
];

export const ROLE_TYPES = {
  PROVIDER: 'provider' as const,
  SEEKER: 'seeker' as const,
};

export type RoleType = typeof ROLE_TYPES[keyof typeof ROLE_TYPES];

// Updated to support multiple roles per category (dual-role model)
export interface CategoryRoleMap {
  [categoryId: string]: RoleType[];
}

// Community utility features (not service categories)
export interface CommunityFeature {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export const COMMUNITY_FEATURES: CommunityFeature[] = [
  {
    id: 'lost_found',
    name: 'Lost & Found',
    icon: '🔍',
    description: 'Report lost items or found belongings',
  },
  {
    id: 'announcements',
    name: 'Community Announcements',
    icon: '📢',
    description: 'Society-wide announcements (admin-approved)',
  },
  {
    id: 'community_events',
    name: 'Community Events',
    icon: '🎊',
    description: 'Society festivals and community gatherings',
  },
  {
    id: 'job_board',
    name: 'Job Board',
    icon: '💼',
    description: 'Job opportunities with advanced filtering',
  },
  {
    id: 'marketplace',
    name: 'Marketplace',
    icon: '🛒',
    description: 'Buy, sell, and exchange items with neighbors',
  },
  {
    id: 'tool_rental',
    name: 'Tool & Equipment Rental',
    icon: '🔧',
    description: 'Rent or lend tools and equipment',
  },
  {
    id: 'advertise',
    name: 'Advertise Your Services',
    icon: '📣',
    description: 'Promote your business with paid advertisements',
  },
];

export function getAllServices(): ServiceItem[] {
  return SERVICE_CATEGORIES.flatMap(category => category.services);
}

export function getServiceById(serviceId: string): ServiceItem | undefined {
  for (const category of SERVICE_CATEGORIES) {
    const service = category.services.find(s => s.id === serviceId);
    if (service) return service;
  }
  return undefined;
}

export function getCategoryByServiceId(serviceId: string): ServiceCategory | undefined {
  return SERVICE_CATEGORIES.find(category => 
    category.services.some(s => s.id === serviceId)
  );
}
