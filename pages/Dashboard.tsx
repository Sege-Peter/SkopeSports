
import React, { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { storageService } from '../services/storage';
import { Registration, UserRole, RegistrationStatus, Announcement, Partner, Event } from '../types';
import { Badge, Button, Card, Input } from '../components/UI';
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { PlusCircle, Check, X, Calendar, Megaphone, ImageIcon, Briefcase, Shuffle, Trophy, Trash2, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [activeTab, setActiveTab] = useState<'overview'|'partners'|'fixtures'|'events'>('overview');
  const [stats, setStats] = useState<any>(null);

  // Announcement State
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMsg, setAnnouncementMsg] = useState('');
  const [announcementImg, setAnnouncementImg] = useState<string>('');

  // Partner State
  const [partners, setPartners] = useState<Partner[]>([]);
  const [newPartnerName, setNewPartnerName] = useState('');
  const [newPartnerLogo, setNewPartnerLogo] = useState('');

  // Fixture State
  const [selectedEventId, setSelectedEventId] = useState('');

  // Refresh data helper
  const refreshData = () => {
    setEvents(storageService.getEvents());
    setStats(storageService.getSystemStats());
    if (user?.role === UserRole.ADMIN) {
        setRegistrations(storageService.getAllRegistrations());
        setPartners(storageService.getPartners());
    } else if (user) {
        setRegistrations(storageService.getRegistrationsByUser(user.id));
    }
  };

  useEffect(() => {
    refreshData();
  }, [user]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setFn: (s: string) => void) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setFn(ev.target.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handlePostAnnouncement = (e: React.FormEvent) => {
      e.preventDefault();
      storageService.createAnnouncement({
          title: announcementTitle,
          message: announcementMsg,
          imageUrl: announcementImg || undefined,
          isActive: true
      });
      alert("Announcement Posted!");
      setAnnouncementTitle('');
      setAnnouncementMsg('');
      setAnnouncementImg('');
  };

  const handleAddPartner = (e: React.FormEvent) => {
      e.preventDefault();
      storageService.addPartner({
          name: newPartnerName,
          logoUrl: newPartnerLogo || 'https://via.placeholder.com/150'
      });
      setNewPartnerName('');
      setNewPartnerLogo('');
      refreshData();
  };

  const handleGenerateFixtures = () => {
      if(!selectedEventId) return;
      const success = storageService.generateFixtures(selectedEventId);
      if(success) alert("Fixtures Generated! Check Results page.");
      else alert("Could not generate fixtures. Ensure at least 2 teams are Approved.");
  };
  
  const handleSetWinner = (winnerName: string) => {
      if(!selectedEventId || !winnerName) return;
      storageService.setEventWinner(selectedEventId, winnerName);
      alert(`Winner set to ${winnerName}`);
      refreshData();
  }

  const handleDeleteEvent = (id: string) => {
    if (confirm("Are you sure? This will delete all registrations and matches for this event.")) {
      storageService.deleteEvent(id);
      refreshData();
    }
  };

  if (!user) return <div className="p-8 text-center font-bold">Access Denied</div>;

  // --- ADMIN VIEW ---
  if (user.role === UserRole.ADMIN) {
    const eventCounts: Record<string, number> = {};
    registrations.forEach(r => {
        eventCounts[r.eventTitle] = (eventCounts[r.eventTitle] || 0) + 1;
    });
    const chartData = Object.keys(eventCounts).map(key => ({ name: key, count: eventCounts[key] }));

    const handleStatusUpdate = (id: string, status: RegistrationStatus) => {
        storageService.updateRegistrationStatus(id, status);
        refreshData();
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin Console</h1>
                <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 scrollbar-hide">
                    <Button onClick={() => setActiveTab('overview')} variant={activeTab === 'overview' ? 'primary' : 'outline'} className="whitespace-nowrap">Overview</Button>
                    <Button onClick={() => setActiveTab('events')} variant={activeTab === 'events' ? 'primary' : 'outline'} className="whitespace-nowrap">Manage Events</Button>
                    <Button onClick={() => setActiveTab('fixtures')} variant={activeTab === 'fixtures' ? 'primary' : 'outline'} className="whitespace-nowrap">Results & Winners</Button>
                    <Button onClick={() => setActiveTab('partners')} variant={activeTab === 'partners' ? 'primary' : 'outline'} className="whitespace-nowrap">Partners</Button>
                </div>
            </div>

            {activeTab === 'overview' && stats && (
                <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card className="border-b-4 border-cyan-500">
                        <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Total Regs</h3>
                        <p className="text-2xl font-black text-gray-900 mt-1">{stats.totalRegistrations}</p>
                    </Card>
                    <Card className="border-b-4 border-orange-500">
                        <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Pending</h3>
                        <p className="text-2xl font-black text-gray-900 mt-1">{stats.pendingRegistrations}</p>
                    </Card>
                    <Card className="border-b-4 border-indigo-500">
                        <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Live Events</h3>
                        <p className="text-2xl font-black text-gray-900 mt-1">{stats.activeEvents}</p>
                    </Card>
                    <Card className="border-b-4 border-emerald-500">
                        <h3 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Users</h3>
                        <p className="text-2xl font-black text-gray-900 mt-1">{stats.totalUsers}</p>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-black mb-4 flex items-center text-slate-900">
                            <Megaphone className="mr-2 h-5 w-5 text-cyan-500" /> Post Announcement
                        </h3>
                        <form onSubmit={handlePostAnnouncement} className="space-y-3">
                            <Input label="Title" value={announcementTitle} onChange={e => setAnnouncementTitle(e.target.value)} required placeholder="e.g. Venue Change" />
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Message</label>
                                <textarea 
                                    className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-cyan-500 text-sm"
                                    rows={3}
                                    value={announcementMsg}
                                    onChange={e => setAnnouncementMsg(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" variant="secondary" className="w-full rounded-2xl py-4 font-black">PUBLISH NOW</Button>
                        </form>
                    </div>

                    <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-96">
                        <h3 className="text-lg font-black mb-4 text-slate-900">Participation Trends</h3>
                        <ResponsiveContainer width="100%" height="80%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" hide />
                                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#06b6d4' : '#f97316'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
                    <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="text-lg font-black text-gray-900">Pending Approvals</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Athlete</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Event</th>
                                    <th className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-50">
                                {registrations.filter(r => r.status === RegistrationStatus.PENDING).map((reg) => (
                                    <tr key={reg.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center font-bold text-xs uppercase">
                                                    {reg.userName.charAt(0)}
                                                </div>
                                                <div className="text-sm font-bold text-gray-900">{reg.userName}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">{reg.eventTitle}</td>
                                        <td className="px-6 py-4 whitespace-nowrap"><Badge status={reg.status} /></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                            <button onClick={() => handleStatusUpdate(reg.id, RegistrationStatus.APPROVED)} className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition shadow-sm">
                                                <Check size={18} />
                                            </button>
                                            <button onClick={() => handleStatusUpdate(reg.id, RegistrationStatus.REJECTED)} className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition shadow-sm">
                                                <X size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {registrations.filter(r => r.status === RegistrationStatus.PENDING).length === 0 && (
                            <div className="py-12 text-center text-gray-400 font-bold text-sm italic">No pending registrations found.</div>
                        )}
                    </div>
                </div>
                </>
            )}

            {activeTab === 'events' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black text-gray-900">Manage Tournament Content</h3>
                        <Button onClick={() => navigate('/admin/create-event')} className="rounded-2xl">
                            <PlusCircle className="mr-2" size={20} /> New Event
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {events.map(ev => (
                            <div key={ev.id} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
                                <img src={ev.imageUrl} className="w-20 h-20 rounded-2xl object-cover" />
                                <div className="flex-1">
                                    <h4 className="font-black text-gray-900 uppercase tracking-tight text-sm">{ev.title}</h4>
                                    <p className="text-xs text-gray-500 mb-2">{ev.category} • {ev.date}</p>
                                    <div className="flex gap-2">
                                        <button onClick={() => navigate(`/events/${ev.id}`)} className="text-[10px] font-black bg-slate-100 px-3 py-1 rounded-lg text-slate-600">VIEW</button>
                                        <button onClick={() => handleDeleteEvent(ev.id)} className="text-[10px] font-black bg-red-50 px-3 py-1 rounded-lg text-red-600 flex items-center gap-1">
                                            <Trash2 size={12} /> DELETE
                                        </button>
                                    </div>
                                </div>
                                <div className="p-2 bg-slate-50 rounded-xl">
                                     <Settings size={18} className="text-slate-400" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'partners' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <Card className="rounded-[2.5rem]">
                         <h3 className="text-lg font-black mb-6 flex items-center"><Briefcase className="mr-2 text-cyan-500" /> Sponsor Management</h3>
                         <form onSubmit={handleAddPartner} className="space-y-4">
                             <Input label="Company Name" value={newPartnerName} onChange={e => setNewPartnerName(e.target.value)} required />
                             <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Logo</label>
                                <div className="flex items-center space-x-2">
                                    <label className="cursor-pointer bg-gray-50 px-4 py-3 rounded-2xl text-sm border-2 border-dashed border-gray-200 flex-1 text-center font-bold text-gray-500 hover:bg-gray-100 transition">
                                        Click to Upload
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, setNewPartnerLogo)} />
                                    </label>
                                    {newPartnerLogo && <img src={newPartnerLogo} className="h-12 w-12 object-contain rounded-xl border p-1" />}
                                </div>
                            </div>
                            <Button type="submit" className="w-full py-4 rounded-2xl font-black mt-2">REGISTER PARTNER</Button>
                         </form>
                     </Card>
                     <div className="grid grid-cols-2 gap-4">
                         {partners.map(p => (
                             <div key={p.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center group relative overflow-hidden">
                                 <div className="h-20 w-20 flex items-center justify-center mb-4">
                                     <img src={p.logoUrl} className="max-h-full max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500" />
                                 </div>
                                 <p className="font-black text-gray-900 uppercase tracking-widest text-[10px]">{p.name}</p>
                                 <button onClick={() => {storageService.deletePartner(p.id); refreshData();}} className="absolute top-4 right-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                     <X size={20} />
                                 </button>
                             </div>
                         ))}
                         {partners.length === 0 && <div className="col-span-2 text-center py-20 opacity-20"><Briefcase size={60} className="mx-auto" /></div>}
                     </div>
                </div>
            )}

            {activeTab === 'fixtures' && (
                <Card className="rounded-[2.5rem]">
                    <h3 className="text-xl font-black mb-8">Tournament Lifecycle Control</h3>
                    <div className="space-y-6">
                        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Select Event to Manage</label>
                            <select className="w-full bg-white border-none rounded-2xl px-6 py-4 text-sm font-bold shadow-sm focus:ring-2 focus:ring-cyan-500" value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)}>
                                <option value="">Choose an active event...</option>
                                {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                            </select>
                        </div>

                        {selectedEventId && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
                                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                                    <h4 className="font-black text-slate-900 mb-2 flex items-center uppercase tracking-tight"><Shuffle className="mr-2 h-5 w-5 text-indigo-500" /> Pairings</h4>
                                    <p className="text-xs text-gray-500 mb-6">Automatically generate random fixtures for all approved team/athletes in this tournament.</p>
                                    <Button onClick={handleGenerateFixtures} variant="secondary" className="w-full rounded-2xl py-4 font-black">START AUTO-PAIRING</Button>
                                </div>

                                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                                    <h4 className="font-black text-slate-900 mb-2 flex items-center uppercase tracking-tight"><Trophy className="mr-2 h-5 w-5 text-yellow-500" /> Hall of Fame</h4>
                                    <p className="text-xs text-gray-500 mb-6">Officially crown the winner of this event to close the registration and finalize the result.</p>
                                    <div className="space-y-3">
                                        <select id="winnerSelect" className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold">
                                            <option value="">Select Champion...</option>
                                            {registrations
                                                .filter(r => r.eventId === selectedEventId && r.status === RegistrationStatus.APPROVED)
                                                .map(r => <option key={r.id} value={r.teamName || r.userName}>{r.teamName || r.userName}</option>)
                                            }
                                        </select>
                                        <Button onClick={() => {
                                            const val = (document.getElementById('winnerSelect') as HTMLSelectElement).value;
                                            handleSetWinner(val);
                                        }} className="w-full rounded-2xl py-4 font-black">CROWN CHAMPION</Button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {!selectedEventId && (
                            <div className="text-center py-20 opacity-10">
                                <Trophy size={100} className="mx-auto" />
                            </div>
                        )}
                    </div>
                </Card>
            )}
            
            {/* System Reset Utility */}
            <div className="mt-12 pt-8 border-t border-gray-200">
                <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Technical Maintenance</p>
                <div className="flex justify-center">
                    <button 
                        onClick={() => { if(confirm("This will delete ALL data and reload. Continue?")) storageService.resetToDefaults(); }} 
                        className="text-xs font-black text-red-300 hover:text-red-500 transition-colors uppercase tracking-widest"
                    >
                        Reset System to Factory Defaults
                    </button>
                </div>
            </div>
        </div>
    );
  }

  // --- ATHLETE VIEW ---
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
        <div className="mb-10 text-center md:text-left">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Athlete Dashboard</h1>
            <p className="text-gray-500 font-medium">Manage your entries and performance stats.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-gray-900">My Registrations</h3>
                    <span className="bg-cyan-100 text-cyan-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{registrations.length} Events</span>
                </div>
                
                <div className="space-y-4">
                    {registrations.length === 0 ? (
                        <div className="bg-white rounded-[2.5rem] border border-dashed border-gray-200 p-20 text-center">
                             <Calendar className="mx-auto text-gray-200 mb-4" size={60} />
                             <p className="text-gray-400 font-bold mb-6">You haven't entered any tournaments yet.</p>
                             <Button variant="secondary" onClick={() => navigate('/events')} className="rounded-2xl px-10 py-4 font-black">BROWSE EVENTS</Button>
                        </div>
                    ) : (
                        registrations.map(reg => (
                            <div key={reg.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer group" onClick={() => navigate(`/events/${reg.eventId}`)}>
                                <div className="flex items-center gap-4">
                                    <div className="bg-slate-900 text-cyan-400 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                                        <Calendar size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-gray-900 uppercase tracking-tight">{reg.eventTitle}</h4>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{reg.eventDate}</p>
                                        {reg.teamName && (
                                            <div className="mt-2 flex items-center gap-1.5">
                                                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-black text-slate-500">TEAM: {reg.teamName}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <Badge status={reg.status} />
                                    <span className="text-[9px] font-black text-gray-300 uppercase">ID: {reg.id.split('_')[1]}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="space-y-8">
                <Card className="rounded-[2.5rem] bg-slate-900 text-white border-none shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <h3 className="text-lg font-black mb-6 relative z-10">Athlete Profile</h3>
                    <div className="flex items-center gap-4 mb-6 relative z-10">
                        <img src={user.profileImage} className="w-16 h-16 rounded-full border-2 border-cyan-500" />
                        <div>
                            <p className="font-black uppercase tracking-tight">{user.fullName}</p>
                            <p className="text-[10px] font-black text-cyan-500/60 uppercase tracking-widest">{user.role}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 relative z-10">
                        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                            <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Rank</p>
                            <p className="font-mono font-black text-xl text-cyan-400">#42</p>
                        </div>
                        <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                            <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-1">Points</p>
                            <p className="font-mono font-black text-xl text-orange-400">120</p>
                        </div>
                    </div>
                    <Button onClick={() => navigate('/settings')} variant="outline" className="w-full mt-6 bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-2xl py-3 font-black">EDIT PROFILE</Button>
                </Card>

                <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
                     <div className="absolute bottom-0 right-0 opacity-10 group-hover:scale-110 transition-transform">
                         <Trophy size={140} />
                     </div>
                     <h3 className="text-xl font-black leading-tight mb-4 relative z-10">Unlock Your <br/>Full Potential</h3>
                     <p className="text-sm text-indigo-100/80 mb-6 relative z-10">Upgrade to Pro to get advanced analytics and priority entry.</p>
                     <button className="bg-white text-indigo-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all relative z-10">GO PRO</button>
                </div>
            </div>
        </div>
    </div>
  );
};
