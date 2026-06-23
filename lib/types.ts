export type UserStatus = 'free' | 'premium';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: UserStatus;
  avatar?: string;
  username?: string;
  rating?: number;
  reviewCount?: number;
  totalSaves?: number;
  coins?: number;
  level?: number;
  passport?: {
    series: string;
    number: string;
    expiry: string;
    citizenship: string;
  };
  stats: {
    routesCreated: number;
    countriesVisited: number;
  };
}

export interface RouteAuthor {
  id: string;
  name: string;
  initial: string;
  rating: number;
}

export interface Review {
  id: string;
  authorId: string;
  authorName: string;
  authorInitial: string;
  rating: number;
  text: string;
  date: string;
}

export type RouteStatus = 'upcoming' | 'completed' | 'draft';

export interface DayActivity {
  time: string;
  title: string;
  description: string;
  type: 'food' | 'attraction' | 'transport' | 'hotel' | 'flight';
  price?: string;
}

export interface RouteDay {
  date: string;
  dayNumber: number;
  activities: DayActivity[];
}

export interface GeneratedRoute {
  id: string;
  destination: string;
  country: string;
  coverImage: string;
  dateFrom: string;
  dateTo: string;
  status: RouteStatus;
  budget: string;
  totalCost?: string;
  isOwnCreation?: boolean;
  isPublished?: boolean;
  publishedSaves?: number;
  publishedReviewCount?: number;
  transfer: {
    toAirport: string;
    cost: string;
  };
  flight: {
    from: string;
    to: string;
    airline: string;
    departure: string;
    arrival: string;
    price: string;
    aviasalesUrl: string;
  };
  hotel: {
    name: string;
    stars: number;
    address: string;
    price: string;
    bookingUrl: string;
  };
  days: RouteDay[];
  weather?: string;
  createdAt: string;
}

export interface SavedRoute extends GeneratedRoute {
  originalAuthor: RouteAuthor;
  savedAt: string;
  isModified: boolean;
}

export interface Booking {
  id: string;
  type: 'flight' | 'hotel';
  name: string;
  dateFrom: string;
  dateTo?: string;
  confirmationNumber: string;
  externalUrl: string;
  status: 'upcoming' | 'completed';
}

export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  routes: GeneratedRoute[];
  savedRoutes: SavedRoute[];
  bookings: Booking[];
  aiRequestsLeft: number;
  guideRequestsLeft: number;
}
