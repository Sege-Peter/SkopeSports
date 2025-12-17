
export enum UserRole {
  GUEST = 'guest',
  ATHLETE = 'athlete',
  ADMIN = 'admin'
}

export enum RegistrationStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected'
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  password?: string; // In a real app, never store plain text
  role: UserRole;
  teamName?: string;
  profileImage?: string;
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  registrationDeadline?: string;
  category: string;
  imageUrl: string;
  organizerId: string;
  status: 'Open' | 'Closed';
  winnerTeam?: string; // Name of the winning team
}

export interface Registration {
  id: string;
  eventId: string;
  userId: string;
  userEmail: string;
  userName: string;
  teamName?: string;
  teamGender?: 'Men' | 'Women' | 'Mixed';
  teamLogo?: string;
  status: RegistrationStatus;
  registeredAt: string;
  eventTitle: string; // Denormalized for easier display
  eventDate: string; // Denormalized
}

export interface MatchResult {
  id: string;
  eventId: string; // Linked to an Event
  category: string;
  homeTeam: string;
  homeScore: number;
  homeLogo?: string;
  awayTeam: string;
  awayScore: number;
  awayLogo?: string;
  matchImage?: string; // Optional image of the specific match action
  date: string;
  status: 'Approved' | 'Pending'; // Pending matches are Fixtures
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  imageUrl?: string;
  createdAt: string;
  isActive: boolean;
}

export interface Partner {
  id: string;
  name: string;
  logoUrl: string;
  website?: string;
}
