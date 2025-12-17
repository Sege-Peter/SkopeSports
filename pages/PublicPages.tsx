
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { Button, Input } from '../components/UI';
import { Calendar, Trophy, Users, Activity, Search, MapPin, Star, Share2 } from 'lucide-react';
import { storageService } from '../services/storage';
import { Event, Partner, MatchResult } from '../types';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [todaysEvents, setTodaysEvents] = useState<Event[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [recentMatches, setRecentMatches] = useState<MatchResult[]>([]);

  useEffect(() => {
      const allEvents = storageService.getEvents();
      const allMatches = storageService.getMatches();
      const today = new Date().toISOString().split('T')[0];
      
      setTodaysEvents(allEvents.filter(e => e.date === today));
      setFeaturedEvents(allEvents.filter(e => e.status === 'Open').slice(0, 5));
      setRecentMatches(allMatches.filter(m => m.status === 'Approved').slice(0, 4));
      setPartners(storageService.getPartners());
  }, []);

  // Mock Athletes
  const topAthletes = [
      { name: 'Sarah J.', team: 'Thunders FC', score: 98, img: 'https://ui-avatars.com/api/?name=Sarah+J&background=random' },
      { name: 'Mike O.', team: 'Rugby Kings', score: 95, img: 'https://ui-avatars.com/api/?name=Mike+O&background=random' },
      { name: 'David K.', team: 'Elite Runners', score: 92, img: 'https://ui-avatars.com/api/?name=David+K&background=random' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-100">
      
      {/* Mobile-style Header / Search */}
      <div className="bg-slate-900 pt-8 pb-14 px-4 rounded-b-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="max-w-7xl mx-auto relative z-10">
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Welcome to <span className="text-cyan-500">SkopeSports</span></h1>
            <p className="text-slate-400 font-medium mb-8">Kenya's premier athlete & event hub.</p>
            
            <div className="relative group">
                <input 
                    type="text" 
                    placeholder="Search events, score grids..." 
                    className="w-full bg-slate-800 border-none rounded-2xl py-4 px-12 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 shadow-inner transition-all group-focus-within:bg-slate-700"
                    onClick={() => navigate('/events')}
                />
                <Search className="absolute left-4 top-4 text-slate-500 h-5 w-5 group-focus-within:text-cyan-500" />
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 -mt-8 space-y-10 pb-12">
          
          {/* Quick Actions Grid */}
          <div className="grid grid-cols-3 gap-4">
              <button onClick={() => navigate('/events')} className="bg-white p-5 rounded-3xl shadow-xl flex flex-col items-center justify-center space-y-2 active:scale-95 transition-all border border-gray-50">
                  <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
                      <Calendar size={28} />
                  </div>
                  <span className="text-[10px] font-black text-gray-800 uppercase tracking-wider">Events</span>
              </button>
              <button onClick={() => navigate('/results')} className="bg-white p-5 rounded-3xl shadow-xl flex flex-col items-center justify-center space-y-2 active:scale-95 transition-all border border-gray-50">
                  <div className="bg-orange-50 p-3 rounded-2xl text-orange-600">
                      <Trophy size={28} />
                  </div>
                  <span className="text-[10px] font-black text-gray-800 uppercase tracking-wider">Scores</span>
              </button>
              <button onClick={() => navigate('/register')} className="bg-white p-5 rounded-3xl shadow-xl flex flex-col items-center justify-center space-y-2 active:scale-95 transition-all border border-gray-50">
                  <div className="bg-cyan-50 p-3 rounded-2xl text-cyan-600">
                      <Users size={28} />
                  </div>
                  <span className="text-[10px] font-black text-gray-800 uppercase tracking-wider">Join In</span>
              </button>
          </div>

          {/* Today's Events */}
          {todaysEvents.length > 0 && (
             <div className="bg-gradient-to-br from-cyan-600 to-indigo-700 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Activity size={100} />
                </div>
                <div className="flex justify-between items-center mb-4 relative z-10">
                    <h2 className="font-black text-xl flex items-center tracking-tight"><Activity className="mr-2 w-5 h-5" /> Happening Today</h2>
                    <span className="text-[10px] font-black bg-white/20 px-3 py-1 rounded-full uppercase tracking-widest">{todaysEvents.length} Active</span>
                </div>
                {todaysEvents.map(ev => (
                    <div key={ev.id} className="bg-white/10 p-4 rounded-2xl mb-3 backdrop-blur-md cursor-pointer hover:bg-white/20 transition-all border border-white/10" onClick={() => navigate(`/events/${ev.id}`)}>
                        <h3 className="font-black text-lg">{ev.title}</h3>
                        <p className="text-xs text-cyan-100 font-bold opacity-80">{ev.location} • {ev.category}</p>
                    </div>
                ))}
             </div>
          )}

          {/* Score Grid Highlights */}
          <div className="space-y-4">
             <div className="flex justify-between items-center px-1">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Score Grid <span className="text-cyan-600">Highlights</span></h2>
                <Link to="/results" className="text-cyan-600 text-xs font-black uppercase tracking-widest bg-cyan-50 px-3 py-1.5 rounded-full">View All</Link>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {recentMatches.map(match => (
                    <div key={match.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex flex-col items-center flex-1 text-center group">
                                <div className="w-12 h-12 rounded-full mb-2 bg-gray-50 border border-gray-100 p-2 flex items-center justify-center overflow-hidden">
                                     <img src={match.homeLogo} className="max-w-full max-h-full object-contain" alt="" />
                                </div>
                                <span className="text-[10px] font-black text-gray-800 uppercase truncate w-full tracking-tighter">{match.homeTeam}</span>
                            </div>
                            <div className="bg-slate-900 text-cyan-400 px-5 py-2 rounded-2xl font-black text-2xl min-w-[90px] text-center shadow-lg">
                                {match.homeScore} : {match.awayScore}
                            </div>
                            <div className="flex flex-col items-center flex-1 text-center group">
                                <div className="w-12 h-12 rounded-full mb-2 bg-gray-50 border border-gray-100 p-2 flex items-center justify-center overflow-hidden">
                                     <img src={match.awayLogo} className="max-w-full max-h-full object-contain" alt="" />
                                </div>
                                <span className="text-[10px] font-black text-gray-800 uppercase truncate w-full tracking-tighter">{match.awayTeam}</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center mt-5 pt-3 border-t border-gray-50 text-[10px] text-gray-400 font-black">
                            <span className="uppercase tracking-widest">{match.category}</span>
                            <span className="flex items-center gap-1.5 cursor-pointer hover:text-cyan-600 transition group" onClick={(e) => {
                                e.stopPropagation();
                                if(navigator.share) navigator.share({ title: 'Result', text: `${match.homeTeam} vs ${match.awayTeam}`, url: window.location.href });
                            }}>
                                <Share2 size={12} /> SHARE
                            </span>
                        </div>
                    </div>
                 ))}
                 {recentMatches.length === 0 && (
                     <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200 col-span-2">
                        <Trophy className="mx-auto text-gray-200 mb-2" size={40} />
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">No match results available</p>
                     </div>
                 )}
             </div>
          </div>

          {/* Upcoming Events Carousel */}
          <div>
              <div className="flex justify-between items-center mb-6 px-1">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Active Events</h2>
                  <Link to="/events" className="text-gray-500 text-xs font-bold uppercase tracking-widest">Browse More</Link>
              </div>
              
              <div className="flex overflow-x-auto space-x-6 pb-6 -mx-4 px-4 scrollbar-hide snap-x">
                  {featuredEvents.map(ev => (
                      <div key={ev.id} onClick={() => navigate(`/events/${ev.id}`)} className="snap-center shrink-0 w-80 bg-white rounded-[2rem] shadow-xl overflow-hidden active:scale-95 transition-all cursor-pointer border border-gray-100">
                          <div className="h-44 relative">
                              <img className="w-full h-full object-cover" src={ev.imageUrl} alt={ev.title} />
                              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full border border-white/20 uppercase tracking-widest">
                                  {ev.category}
                              </div>
                          </div>
                          <div className="p-6">
                              <h3 className="font-black text-gray-900 text-lg leading-tight mb-4 truncate">{ev.title}</h3>
                              <div className="grid grid-cols-2 gap-2 border-t border-gray-50 pt-4">
                                  <div className="flex items-center text-gray-500 text-[10px] font-bold">
                                      <Calendar size={14} className="mr-2 text-cyan-600" />
                                      {ev.date}
                                  </div>
                                  <div className="flex items-center text-gray-500 text-[10px] font-bold">
                                      <MapPin size={14} className="mr-2 text-cyan-600" />
                                      {ev.location.split(',')[0]}
                                  </div>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>

          {/* Top Athletes Table */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
              <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center">
                    <Star className="w-6 h-6 text-yellow-500 mr-3" fill="currentColor" /> Leaderboard
                  </h2>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Ranking</span>
              </div>
              <div className="space-y-6">
                  {topAthletes.map((athlete, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 transition-colors">
                          <div className="flex items-center space-x-4">
                              <span className="text-sm font-black text-gray-300 w-6">#{idx + 1}</span>
                              <div className="relative">
                                  <img src={athlete.img} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" alt={athlete.name} />
                                  {idx === 0 && <div className="absolute -top-1 -right-1 bg-yellow-500 text-white p-1 rounded-full"><Star size={8} fill="white" /></div>}
                              </div>
                              <div>
                                  <p className="text-sm font-black text-gray-900 uppercase tracking-tight">{athlete.name}</p>
                                  <p className="text-[10px] font-bold text-gray-500">{athlete.team}</p>
                              </div>
                          </div>
                          <div className="text-right">
                              <span className="font-mono font-black text-cyan-600 text-lg">{athlete.score}</span>
                              <p className="text-[8px] font-black text-gray-400 uppercase">Points</p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>

          {/* Partners Section */}
          {partners.length > 0 && (
             <div className="pt-8 border-t border-gray-200">
                <h3 className="text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8">Trusted by Partners</h3>
                <div className="flex flex-wrap justify-center gap-10 opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
                    {partners.map(p => (
                        <div key={p.id} className="h-12 w-28 flex items-center justify-center">
                             <img src={p.logoUrl} alt={p.name} className="max-h-full max-w-full object-contain filter drop-shadow-sm" title={p.name} />
                        </div>
                    ))}
                </div>
             </div>
          )}
      </div>
    </div>
  );
};

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-8">
             <div className="bg-cyan-500 text-white p-4 rounded-3xl shadow-2xl shadow-cyan-500/40">
                 <Trophy size={48} />
             </div>
        </div>
        <h2 className="text-center text-4xl font-black text-slate-900 tracking-tight">SkopeSports</h2>
        <p className="text-center text-slate-500 mt-2 font-medium uppercase text-xs tracking-widest">Athlete Login</p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-8 shadow-2xl rounded-[2.5rem] border border-slate-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <div className="text-red-600 text-xs font-bold bg-red-50 p-4 rounded-2xl border border-red-100 text-center uppercase tracking-wider">{error}</div>}
            <Input label="Email address" type="email" id="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input label="Password" type="password" id="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button type="submit" className="w-full py-4 text-lg font-black shadow-xl shadow-cyan-500/30 rounded-2xl transition-all active:scale-95">CONTINUE</Button>
          </form>
          <div className="mt-8 text-center">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                New to SkopeSports? <Link to="/register" className="text-cyan-600 hover:text-cyan-500 font-black">Register Now</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      register(formData);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
         <h2 className="text-center text-4xl font-black text-slate-900 tracking-tight">Join SkopeSports</h2>
         <p className="text-center text-slate-500 mt-2 font-medium uppercase text-xs tracking-widest">Create Athlete Profile</p>
      </div>
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-8 shadow-2xl rounded-[2.5rem] border border-slate-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
             {error && <div className="text-red-600 text-xs font-bold bg-red-50 p-4 rounded-2xl border border-red-100 text-center uppercase tracking-wider">{error}</div>}
            <Input label="Full Name" type="text" id="name" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
            <Input label="Email address" type="email" id="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            <Input label="Phone Number" type="tel" id="phone" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            <Input label="Password" type="password" id="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            <Button type="submit" variant="secondary" className="w-full py-4 text-lg font-black shadow-xl shadow-orange-500/30 rounded-2xl transition-all active:scale-95">JOIN PLATFORM</Button>
          </form>
          <div className="mt-8 text-center">
             <Link to="/login" className="text-xs font-bold text-slate-500 hover:text-slate-900 uppercase tracking-widest">Already a member? Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
