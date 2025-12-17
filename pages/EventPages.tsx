
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { storageService } from '../services/storage';
import { Event, UserRole, User } from '../types';
import { Badge, Button, Card, Input } from '../components/UI';
import { MapPin, Calendar, ArrowLeft, Share2, Phone, User as UserIcon, Upload, Trophy, Info, X, ImageIcon, AlertTriangle } from 'lucide-react';

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setEvents(storageService.getEvents());
  }, []);

  const filteredEvents = events.filter(e => 
    (e.title.toLowerCase().includes(search.toLowerCase()) || e.category.toLowerCase().includes(search.toLowerCase())) &&
    (filter ? e.category === filter : true)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sticky top-16 z-30 bg-slate-50 pt-2 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Events</h1>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {['All', 'Athletics', 'Football', 'Rugby', 'Volleyball'].map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setFilter(cat === 'All' ? '' : cat)}
                        className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                            (cat === 'All' && !filter) || filter === cat 
                            ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/30' 
                            : 'bg-white text-gray-600 border border-gray-200'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
          </div>
          
          <div className="relative">
             <input 
                type="text" 
                placeholder="Search events..." 
                className="w-full pl-4 pr-10 py-3 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-cyan-500 bg-white"
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
          </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pb-20">
        {filteredEvents.map(event => (
          <div key={event.id} onClick={() => navigate(`/events/${event.id}`)} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden active:scale-[0.98] transition-all duration-200 cursor-pointer group relative">
            <div className="h-56 overflow-hidden relative">
                <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute top-3 right-3">
                    <Badge status={event.status} />
                </div>
                <div className="absolute bottom-3 left-3 text-white">
                    <span className="text-xs font-bold uppercase tracking-wide bg-orange-500 px-2 py-0.5 rounded-md mb-1 inline-block">{event.category}</span>
                    <h3 className="text-xl font-bold leading-tight">{event.title}</h3>
                </div>
            </div>
            <div className="p-4 flex justify-between items-center">
                <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-1 text-cyan-500" /> {event.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1 text-cyan-500" /> {event.date}
                    </div>
                </div>
                <div className="bg-gray-50 p-2 rounded-full text-cyan-600">
                    <Trophy size={20} />
                </div>
            </div>
          </div>
        ))}
        {filteredEvents.length === 0 && <p className="text-gray-500 text-center col-span-3 py-10">No events found.</p>}
      </div>
    </div>
  );
};

export const EventDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | undefined>(undefined);
  const [organizer, setOrganizer] = useState<User | undefined>(undefined);
  
  // Registration Form State
  const [regType, setRegType] = useState<'individual' | 'team'>('individual');
  const [teamName, setTeamName] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [teamGender, setTeamGender] = useState<'Men'|'Women'|'Mixed'>('Mixed');
  const [teamLogo, setTeamLogo] = useState<string>('');
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  useEffect(() => {
    if (id) {
        const ev = storageService.getEventById(id);
        setEvent(ev);
        if (ev) {
            const org = storageService.getUserById(ev.organizerId);
            setOrganizer(org);
        }
    }
  }, [id]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setTeamLogo(ev.target.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        navigate('/login');
        return;
    }
    if (!event) return;

    try {
        storageService.registerForEvent(user.id, event.id, { 
            teamName: regType === 'team' ? teamName : undefined, 
            phone,
            teamGender: regType === 'team' ? teamGender : undefined,
            teamLogo: regType === 'team' ? (teamLogo || undefined) : undefined 
        });
        setMessage({ type: 'success', text: 'Registration successful!' });
    } catch (err: any) {
        setMessage({ type: 'error', text: err.message });
    }
  };

  if (!event) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="pb-24 bg-white min-h-screen">
        <div className="relative h-80 w-full">
             <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>
             
             <div className="absolute top-4 left-4">
                 <button onClick={() => navigate(-1)} className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/30 transition">
                     <ArrowLeft size={24} />
                 </button>
             </div>
             <div className="absolute top-4 right-4 flex space-x-2">
                 <button className="bg-white/20 backdrop-blur-md p-2 rounded-full text-white hover:bg-white/30 transition">
                     <Share2 size={24} />
                 </button>
             </div>

             <div className="absolute bottom-0 left-0 w-full p-6 text-white">
                <div className="flex items-center space-x-2 mb-2">
                     <span className="bg-orange-500 text-xs font-bold px-2 py-0.5 rounded uppercase">{event.category}</span>
                     <Badge status={event.status} />
                </div>
                <h1 className="text-3xl font-black leading-tight mb-2">{event.title}</h1>
                <div className="flex items-center text-sm text-gray-300">
                    <MapPin className="h-4 w-4 mr-1" /> {event.location}
                </div>
             </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center space-x-3">
                    <div className="bg-cyan-100 p-2 rounded-full text-cyan-600">
                        <Calendar size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase">Date</p>
                        <p className="text-sm font-bold text-gray-900">{event.date}</p>
                    </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center space-x-3">
                    <div className="bg-orange-100 p-2 rounded-full text-orange-600">
                        <Info size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase">Registration</p>
                        <p className="text-sm font-bold text-gray-900">{event.registrationDeadline ? 'Ends ' + event.registrationDeadline : 'Open'}</p>
                    </div>
                </div>
            </div>

            <div className="prose max-w-none text-gray-600">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Details</h3>
                <p>{event.description}</p>
                {event.winnerTeam && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4 flex items-center shadow-sm">
                        <Trophy className="text-yellow-500 w-6 h-6 mr-3" />
                        <div>
                            <p className="text-xs text-yellow-700 font-bold uppercase">Tournament Winner</p>
                            <p className="font-black text-gray-900 text-lg">{event.winnerTeam}</p>
                        </div>
                    </div>
                )}
            </div>

             <div className="border-t border-gray-100 pt-6">
                 <h3 className="text-lg font-bold text-gray-900 mb-4">Organizer</h3>
                 <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-xl">
                     <div className="h-12 w-12 bg-white shadow-sm rounded-full flex items-center justify-center text-cyan-600 border border-gray-100">
                         <UserIcon size={24}/>
                     </div>
                     <div>
                         <p className="font-bold text-gray-900">{organizer?.fullName || 'Skope Sports'}</p>
                         <p className="text-sm text-gray-500">{organizer?.email}</p>
                     </div>
                     <a href={`tel:${organizer?.phone}`} className="ml-auto bg-white border border-gray-200 p-2 rounded-full text-cyan-600 shadow-sm hover:bg-gray-100 transition">
                         <Phone size={20} />
                     </a>
                 </div>
             </div>

            <div className="rounded-xl overflow-hidden shadow-md border border-gray-200 h-48 mt-6">
                <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight={0}
                    marginWidth={0}
                    title="Event Location"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(event.location)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                ></iframe>
            </div>

            <div className="h-12"></div>
        </div>

        {event.status === 'Open' && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-safe z-40 md:static md:border-none md:bg-transparent md:p-0">
                 <div className="max-w-4xl mx-auto">
                    {user?.role === UserRole.ADMIN ? (
                        <div className="bg-slate-900 p-3 rounded-xl text-center text-sm font-bold text-cyan-500">ADMIN MODE</div>
                    ) : (
                        <>
                            {!user ? (
                                <Button onClick={() => navigate('/login')} className="w-full py-4 text-lg shadow-lg shadow-cyan-500/30 rounded-2xl" variant="primary">Log in to Register</Button>
                            ) : (
                                <form onSubmit={handleRegister} className="flex flex-col gap-3">
                                    {message ? (
                                        <div className={`p-4 rounded-xl text-sm font-bold text-center ${message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                                            {message.text}
                                        </div>
                                    ) : (
                                        <div className="bg-white md:bg-gray-50 md:p-6 md:rounded-2xl md:border md:border-gray-100 space-y-4">
                                            <div className="flex bg-gray-100 p-1 rounded-xl">
                                                <button 
                                                    type="button"
                                                    onClick={() => setRegType('individual')}
                                                    className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${regType === 'individual' ? 'bg-white shadow-sm text-cyan-600' : 'text-gray-500'}`}
                                                >
                                                    INDIVIDUAL
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={() => setRegType('team')}
                                                    className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${regType === 'team' ? 'bg-white shadow-sm text-cyan-600' : 'text-gray-500'}`}
                                                >
                                                    TEAM
                                                </button>
                                            </div>

                                            {regType === 'team' ? (
                                                <div className="space-y-3">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        <input 
                                                            className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none shadow-sm" 
                                                            placeholder="Team Name"
                                                            value={teamName} 
                                                            required
                                                            onChange={e => setTeamName(e.target.value)} 
                                                        />
                                                        <select
                                                            className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none shadow-sm"
                                                            value={teamGender}
                                                            onChange={(e) => setTeamGender(e.target.value as any)}
                                                        >
                                                            <option value="Men">Men's Team</option>
                                                            <option value="Women">Women's Team</option>
                                                            <option value="Mixed">Mixed Team</option>
                                                        </select>
                                                    </div>
                                                    <label className="cursor-pointer bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm flex items-center justify-center text-gray-500 hover:bg-gray-50 transition shadow-sm border-dashed">
                                                        <Upload className="w-4 h-4 mr-2" />
                                                        {teamLogo ? 'Logo Attached' : 'Upload Team Logo (Optional)'}
                                                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                                    </label>
                                                </div>
                                            ) : (
                                                <div className="text-center py-2">
                                                    <p className="text-xs text-gray-500">Registering as <span className="font-bold text-gray-900">{user.fullName}</span></p>
                                                </div>
                                            )}

                                            <Button type="submit" variant="secondary" className="w-full py-4 text-lg shadow-lg shadow-orange-500/30 rounded-2xl">
                                                Confirm {regType === 'team' ? 'Team' : 'Individual'} Registration
                                            </Button>
                                        </div>
                                    )}
                                </form>
                            )}
                        </>
                    )}
                 </div>
            </div>
        )}
    </div>
  );
};

export const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '', description: '', location: '', date: '', registrationDeadline: '', category: '', status: 'Open' as 'Open'|'Closed'
  });
  const [imageFile, setImageFile] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setImageFile(ev.target.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.role !== UserRole.ADMIN) return;
    
    storageService.createEvent({
        ...formData,
        imageUrl: imageFile || undefined
    }, user.id);
    navigate('/dashboard');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-24">
        <Card>
            <h2 className="text-2xl font-black mb-6 text-gray-900">Create New Event</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Event Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Poster / Image</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50 transition-colors cursor-pointer relative">
                         {imageFile ? (
                             <div className="relative w-full h-48">
                                <img src={imageFile} alt="Preview" className="w-full h-full object-contain" />
                                <button type="button" onClick={() => setImageFile(null)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 m-2 hover:bg-red-600 transition shadow-sm">
                                    <X size={16} />
                                </button>
                             </div>
                         ) : (
                             <div className="space-y-1 text-center">
                                 <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                                 <div className="flex text-sm text-gray-600 justify-center">
                                     <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-cyan-600 hover:text-cyan-500 focus-within:outline-none">
                                         <span>Upload a file</span>
                                         <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} />
                                     </label>
                                     <p className="pl-1">or drag and drop</p>
                                 </div>
                                 <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                             </div>
                         )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required placeholder="e.g. Football" />
                    <Input label="Location" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Date" type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
                    <Input label="Deadline" type="date" value={formData.registrationDeadline} onChange={e => setFormData({...formData, registrationDeadline: e.target.value})} />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea 
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                        rows={4}
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        required
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="button" variant="outline" className="mr-3" onClick={() => navigate('/dashboard')}>Cancel</Button>
                    <Button type="submit">Create Event</Button>
                </div>
            </form>
        </Card>
    </div>
  );
};
