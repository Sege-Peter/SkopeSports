
import { User, Event, Registration, UserRole, RegistrationStatus, MatchResult, Announcement, Partner } from '../types';

const STORAGE_KEYS = {
  USERS: 'skopesports_users',
  EVENTS: 'skopesports_events',
  REGISTRATIONS: 'skopesports_registrations',
  SESSION: 'skopesports_session',
  MATCHES: 'skopesports_matches',
  ANNOUNCEMENTS: 'skopesports_announcements',
  PARTNERS: 'skopesports_partners'
};

// --- Seed Data ---
const SEED_EVENTS: Event[] = [
  {
    id: 'evt_1',
    title: 'Nairobi City Marathon',
    description: 'The annual city marathon attracting runners from all over the globe. 42km of pure endurance across the capital.',
    location: 'Nairobi Expressway, Kenya',
    date: new Date().toISOString().split('T')[0],
    registrationDeadline: '2025-01-15',
    category: 'Athletics',
    imageUrl: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&q=80&w=1200',
    organizerId: 'admin_1',
    status: 'Open'
  },
  {
    id: 'evt_2',
    title: 'Beach Volleyball Open',
    description: 'Premier 2v2 beach volleyball tournament at the coast. Sun, sand, and spikes!',
    location: 'Nyali Beach, Mombasa',
    date: '2025-02-10',
    registrationDeadline: '2025-02-01',
    category: 'Volleyball',
    imageUrl: 'https://images.unsplash.com/photo-1593766788306-28561086694e?auto=format&fit=crop&q=80&w=1200',
    organizerId: 'admin_1',
    status: 'Open'
  },
  {
    id: 'evt_3',
    title: 'Kasarani Football Cup',
    description: 'The biggest grassroots football tournament in the city. 32 teams, 1 trophy.',
    location: 'Kasarani Stadium Annex',
    date: '2025-03-22',
    registrationDeadline: '2025-03-10',
    category: 'Football',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1200',
    organizerId: 'admin_1',
    status: 'Open'
  }
];

const SEED_MATCHES: MatchResult[] = [
  {
    id: 'm_1',
    eventId: 'evt_3',
    category: 'Football',
    homeTeam: 'Umoja FC',
    homeScore: 2,
    homeLogo: 'https://ui-avatars.com/api/?name=UFC&background=0D8ABC&color=fff',
    awayTeam: 'Roysambu Stars',
    awayScore: 1,
    awayLogo: 'https://ui-avatars.com/api/?name=RS&background=random',
    date: new Date().toISOString(),
    status: 'Approved'
  },
  {
    id: 'm_2',
    eventId: 'evt_3',
    category: 'Football',
    homeTeam: 'Kibera Black Stars',
    homeScore: 0,
    homeLogo: 'https://ui-avatars.com/api/?name=KBS&background=000&color=fff',
    awayTeam: 'Lavington United',
    awayScore: 0,
    awayLogo: 'https://ui-avatars.com/api/?name=LU&background=random',
    date: new Date().toISOString(),
    status: 'Approved'
  }
];

const SEED_ADMIN: User = {
  id: 'admin_1',
  fullName: 'SkopeSports Admin',
  email: 'admin@skopesports.com',
  password: 'password123',
  role: UserRole.ADMIN,
  createdAt: new Date().toISOString(),
  profileImage: 'https://ui-avatars.com/api/?name=Admin&background=0f172a&color=06b6d4'
};

// --- Storage Logic with Error Handling ---

const getItems = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error(`Error reading ${key} from storage`, e);
    return [];
  }
};

const setItems = <T>(key: string, items: T[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      alert("Storage limit reached! Please try smaller images or clear some data.");
    }
    console.error(`Error saving ${key} to storage`, e);
  }
};

// --- Service Implementation ---

export const initStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
    setItems(STORAGE_KEYS.EVENTS, SEED_EVENTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    setItems(STORAGE_KEYS.USERS, [SEED_ADMIN]);
  }
  if (!localStorage.getItem(STORAGE_KEYS.MATCHES)) {
    setItems(STORAGE_KEYS.MATCHES, SEED_MATCHES);
  }
};

export const storageService = {
  // --- Auth & User Management ---
  login: (email: string, password: string): User | null => {
    const users = getItems<User>(STORAGE_KEYS.USERS);
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
      return user;
    }
    return null;
  },

  register: (user: Omit<User, 'id' | 'createdAt' | 'role'>): User => {
    const users = getItems<User>(STORAGE_KEYS.USERS);
    if (users.find(u => u.email === user.email)) {
      throw new Error('An account with this email already exists.');
    }
    const newUser: User = {
      ...user,
      id: `usr_${Date.now()}`,
      role: UserRole.ATHLETE,
      createdAt: new Date().toISOString(),
      profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`
    };
    users.push(newUser);
    setItems(STORAGE_KEYS.USERS, users);
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(newUser));
    return newUser;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },

  getSession: (): User | null => {
    const session = localStorage.getItem(STORAGE_KEYS.SESSION);
    return session ? JSON.parse(session) : null;
  },

  updateUser: (userId: string, updates: Partial<User>): User => {
    const users = getItems<User>(STORAGE_KEYS.USERS);
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) throw new Error("User not found");
    
    const updatedUser = { ...users[index], ...updates };
    users[index] = updatedUser;
    setItems(STORAGE_KEYS.USERS, users);
    
    const session = storageService.getSession();
    if (session && session.id === userId) {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(updatedUser));
    }
    return updatedUser;
  },
  
  findUserByEmail: (email: string): User | undefined => {
    return getItems<User>(STORAGE_KEYS.USERS).find(u => u.email === email);
  },

  getUserById: (id: string): User | undefined => {
    return getItems<User>(STORAGE_KEYS.USERS).find(u => u.id === id);
  },

  // --- Event Management ---
  getEvents: (): Event[] => {
    return getItems<Event>(STORAGE_KEYS.EVENTS);
  },

  getEventById: (id: string): Event | undefined => {
    return getItems<Event>(STORAGE_KEYS.EVENTS).find(e => e.id === id);
  },

  createEvent: (eventData: Omit<Event, 'id' | 'organizerId' | 'imageUrl'> & { imageUrl?: string }, organizerId: string): Event => {
    const events = getItems<Event>(STORAGE_KEYS.EVENTS);
    const newEvent: Event = {
      ...eventData,
      id: `evt_${Date.now()}`,
      organizerId,
      imageUrl: eventData.imageUrl || `https://picsum.photos/800/400?random=${Date.now()}`, 
    };
    events.unshift(newEvent);
    setItems(STORAGE_KEYS.EVENTS, events);
    return newEvent;
  },

  updateEvent: (eventId: string, updates: Partial<Event>): Event => {
    const events = getItems<Event>(STORAGE_KEYS.EVENTS);
    const index = events.findIndex(e => e.id === eventId);
    if (index === -1) throw new Error("Event not found");
    const updated = { ...events[index], ...updates };
    events[index] = updated;
    setItems(STORAGE_KEYS.EVENTS, events);
    return updated;
  },

  deleteEvent: (id: string) => {
    let events = getItems<Event>(STORAGE_KEYS.EVENTS);
    events = events.filter(e => e.id !== id);
    setItems(STORAGE_KEYS.EVENTS, events);
    
    // Cleanup linked registrations and matches
    let regs = getItems<Registration>(STORAGE_KEYS.REGISTRATIONS);
    setItems(STORAGE_KEYS.REGISTRATIONS, regs.filter(r => r.eventId !== id));
    
    let matches = getItems<MatchResult>(STORAGE_KEYS.MATCHES);
    setItems(STORAGE_KEYS.MATCHES, matches.filter(m => m.eventId !== id));
  },

  setEventWinner: (eventId: string, winnerTeam: string) => {
    storageService.updateEvent(eventId, { winnerTeam, status: 'Closed' });
  },

  // --- Registration Management ---
  registerForEvent: (userId: string, eventId: string, details: { teamName?: string, phone: string, teamGender?: 'Men'|'Women'|'Mixed', teamLogo?: string }): Registration => {
    const regs = getItems<Registration>(STORAGE_KEYS.REGISTRATIONS);
    const event = storageService.getEventById(eventId);
    const user = storageService.getUserById(userId);

    if (!event || !user) throw new Error('Invalid event or user');
    if (regs.find(r => r.userId === userId && r.eventId === eventId)) {
      throw new Error('You are already registered for this event.');
    }

    const newReg: Registration = {
      id: `reg_${Date.now()}`,
      eventId,
      userId,
      userEmail: user.email,
      userName: user.fullName,
      teamName: details.teamName,
      teamGender: details.teamGender,
      teamLogo: details.teamLogo,
      status: RegistrationStatus.PENDING,
      registeredAt: new Date().toISOString(),
      eventTitle: event.title,
      eventDate: event.date
    };

    regs.push(newReg);
    setItems(STORAGE_KEYS.REGISTRATIONS, regs);
    return newReg;
  },

  getRegistrationsByUser: (userId: string): Registration[] => {
    return getItems<Registration>(STORAGE_KEYS.REGISTRATIONS).filter(r => r.userId === userId);
  },

  getAllRegistrations: (): Registration[] => {
    return getItems<Registration>(STORAGE_KEYS.REGISTRATIONS);
  },

  getRegistrationsByEvent: (eventId: string): Registration[] => {
    return getItems<Registration>(STORAGE_KEYS.REGISTRATIONS).filter(r => r.eventId === eventId);
  },

  updateRegistrationStatus: (regId: string, status: RegistrationStatus) => {
    const regs = getItems<Registration>(STORAGE_KEYS.REGISTRATIONS);
    const index = regs.findIndex(r => r.id === regId);
    if (index !== -1) {
      regs[index].status = status;
      setItems(STORAGE_KEYS.REGISTRATIONS, regs);
    }
  },

  // --- Match Results & Fixtures ---
  getMatches: (): MatchResult[] => {
    return getItems<MatchResult>(STORAGE_KEYS.MATCHES);
  },

  getMatchesByEvent: (eventId: string): MatchResult[] => {
    return getItems<MatchResult>(STORAGE_KEYS.MATCHES).filter(m => m.eventId === eventId);
  },

  addMatch: (match: Omit<MatchResult, 'id'>): MatchResult => {
    const matches = getItems<MatchResult>(STORAGE_KEYS.MATCHES);
    const newMatch = { ...match, id: `m_${Date.now()}` };
    matches.unshift(newMatch);
    setItems(STORAGE_KEYS.MATCHES, matches);
    return newMatch;
  },

  deleteMatch: (id: string) => {
    let matches = getItems<MatchResult>(STORAGE_KEYS.MATCHES);
    matches = matches.filter(m => m.id !== id);
    setItems(STORAGE_KEYS.MATCHES, matches);
  },

  generateFixtures: (eventId: string): boolean => {
    const eventRegs = storageService.getRegistrationsByEvent(eventId)
      .filter(r => r.status === RegistrationStatus.APPROVED);
    
    if (eventRegs.length < 2) return false;

    const shuffled = [...eventRegs].sort(() => 0.5 - Math.random());
    const event = storageService.getEventById(eventId);
    if (!event) return false;

    for (let i = 0; i < shuffled.length; i += 2) {
      if (i + 1 < shuffled.length) {
        const home = shuffled[i];
        const away = shuffled[i+1];
        
        storageService.addMatch({
          eventId: event.id,
          category: event.category,
          homeTeam: home.teamName || home.userName,
          homeScore: 0,
          homeLogo: home.teamLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(home.teamName || home.userName)}`,
          awayTeam: away.teamName || away.userName,
          awayScore: 0,
          awayLogo: away.teamLogo || `https://ui-avatars.com/api/?name=${encodeURIComponent(away.teamName || away.userName)}`,
          date: event.date,
          status: 'Pending'
        });
      }
    }
    return true;
  },

  // --- Announcements & Partners ---
  getAnnouncements: (): Announcement[] => {
    return getItems<Announcement>(STORAGE_KEYS.ANNOUNCEMENTS);
  },

  createAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt'>): Announcement => {
    const items = getItems<Announcement>(STORAGE_KEYS.ANNOUNCEMENTS);
    const newItem = { ...announcement, id: `ann_${Date.now()}`, createdAt: new Date().toISOString() };
    items.unshift(newItem);
    setItems(STORAGE_KEYS.ANNOUNCEMENTS, items);
    return newItem;
  },

  getPartners: (): Partner[] => {
    return getItems<Partner>(STORAGE_KEYS.PARTNERS);
  },

  addPartner: (partner: Omit<Partner, 'id'>): Partner => {
    const items = getItems<Partner>(STORAGE_KEYS.PARTNERS);
    const newItem = { ...partner, id: `ptr_${Date.now()}` };
    items.push(newItem);
    setItems(STORAGE_KEYS.PARTNERS, items);
    return newItem;
  },

  deletePartner: (id: string) => {
    let items = getItems<Partner>(STORAGE_KEYS.PARTNERS);
    setItems(STORAGE_KEYS.PARTNERS, items.filter(p => p.id !== id));
  },

  // --- Utility ---
  getSystemStats: () => {
    const events = storageService.getEvents();
    const regs = storageService.getAllRegistrations();
    const users = getItems<User>(STORAGE_KEYS.USERS);
    
    return {
      totalEvents: events.length,
      activeEvents: events.filter(e => e.status === 'Open').length,
      totalRegistrations: regs.length,
      pendingRegistrations: regs.filter(r => r.status === RegistrationStatus.PENDING).length,
      totalUsers: users.length
    };
  },

  resetToDefaults: () => {
    localStorage.clear();
    initStorage();
    window.location.reload();
  }
};
