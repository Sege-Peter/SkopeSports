
import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { storageService } from '../services/storage';
import { MatchResult, UserRole, Event } from '../types';
import { ArrowLeft, Calendar, MapPin, Share2, Printer, Trophy } from 'lucide-react';

export const ResultsPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [viewMode, setViewMode] = useState<'results' | 'fixtures'>('results');
  
  // Form State
  const [homeName, setHomeName] = useState('');
  const [awayName, setAwayName] = useState('');
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [homeLogo, setHomeLogo] = useState<string>('');
  const [awayLogo, setAwayLogo] = useState<string>('');
  const [matchImage, setMatchImage] = useState<string>('');

  useEffect(() => {
    setEvents(storageService.getEvents());
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      const allMatches = storageService.getMatchesByEvent(selectedEvent.id);
      if (viewMode === 'results') {
          setMatches(allMatches.filter(m => m.status === 'Approved'));
      } else {
          setMatches(allMatches.filter(m => m.status === 'Pending'));
      }
    }
  }, [selectedEvent, viewMode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFn: (s: string) => void) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setFn(ev.target.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleAddMatch = () => {
    if (!homeName || !awayName || !selectedEvent) {
      alert("Please enter team names");
      return;
    }

    const defaultLogo = 'https://cdn-icons-png.flaticon.com/512/16/16425.png';

    storageService.addMatch({
      eventId: selectedEvent.id,
      category: selectedEvent.category,
      homeTeam: homeName,
      homeScore: Number(homeScore),
      homeLogo: homeLogo || defaultLogo,
      awayTeam: awayName,
      awayScore: Number(awayScore),
      awayLogo: awayLogo || defaultLogo,
      matchImage: matchImage || undefined,
      date: new Date().toISOString(),
      status: 'Approved'
    });

    // Reset Form
    setHomeName('');
    setAwayName('');
    setHomeScore(0);
    setAwayScore(0);
    setHomeLogo('');
    setAwayLogo('');
    setMatchImage('');
    
    // Refresh List
    // Re-trigger useEffect
    const allMatches = storageService.getMatchesByEvent(selectedEvent.id);
    if (viewMode === 'results') {
        setMatches(allMatches.filter(m => m.status === 'Approved'));
    } else {
        setMatches(allMatches.filter(m => m.status === 'Pending'));
    }
  };

  const handlePrint = () => {
      window.print();
  };

  const handleShare = async (match: MatchResult) => {
      const shareData = {
          title: `Match Result: ${match.homeTeam} vs ${match.awayTeam}`,
          text: `${match.homeTeam} ${match.homeScore} - ${match.awayScore} ${match.awayTeam} in ${match.category}. Check it out on Skope Sports!`,
          url: window.location.href
      };

      if (navigator.share) {
          try {
              await navigator.share(shareData);
          } catch (err) {
              console.error(err);
          }
      } else {
          alert("Sharing not supported on this browser. Copied to clipboard!");
          navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      }
  };

  // --- VIEW 1: EVENT SELECTION GRID ---
  if (!selectedEvent) {
    return (
      <div className="min-h-screen bg-[#0b0e14] text-white p-5 font-sans">
        <header className="flex flex-col items-center mb-10 mt-5">
            <h1 className="text-3xl font-extrabold uppercase tracking-wide text-center">
                Select an <span className="text-[#fca311]">Event</span>
            </h1>
            <p className="text-[#94a3b8] mt-2">View match results by tournament</p>
        </header>

        <div className="max-w-7xl mx-auto grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {events.map(event => (
                <div 
                    key={event.id} 
                    onClick={() => setSelectedEvent(event)}
                    className="bg-[#1c2533] border border-[#334155] rounded-xl overflow-hidden cursor-pointer hover:border-[#fca311] transition-all duration-300 transform hover:-translate-y-1 group"
                >
                    <div className="h-48 overflow-hidden relative">
                        <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                        <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-10 transition-all"></div>
                        <div className="absolute top-2 right-2 bg-[#fca311] text-black text-xs font-bold px-2 py-1 rounded">
                            {event.category}
                        </div>
                    </div>
                    <div className="p-5">
                        <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                        <div className="flex items-center text-[#94a3b8] text-sm mb-1">
                            <Calendar className="h-4 w-4 mr-2" />
                            {event.date}
                        </div>
                        <div className="flex items-center text-[#94a3b8] text-sm">
                            <MapPin className="h-4 w-4 mr-2" />
                            {event.location}
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    );
  }

  // --- VIEW 2: MATCH RESULTS FOR SELECTED EVENT ---
  return (
    <div className="min-h-screen bg-[#0b0e14] text-white p-5 font-sans print:bg-white print:text-black">
      {/* Header */}
      <header className="max-w-5xl mx-auto mb-8 print:hidden">
        <button 
            onClick={() => setSelectedEvent(null)}
            className="flex items-center text-[#94a3b8] hover:text-[#fca311] mb-4 transition-colors"
        >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Events
        </button>
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#2a3b55] pb-4">
            <div>
                <h1 className="text-3xl font-extrabold uppercase tracking-wide">
                    {selectedEvent.title}
                </h1>
                <p className="text-[#fca311] font-medium tracking-wider text-sm mt-1 uppercase">
                    {selectedEvent.category} Results
                </p>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
                 {/* View Toggle */}
                 <div className="bg-[#1c2533] p-1 rounded-lg flex">
                     <button 
                        className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${viewMode === 'results' ? 'bg-[#fca311] text-black' : 'text-gray-400 hover:text-white'}`}
                        onClick={() => setViewMode('results')}
                     >
                         Results
                     </button>
                     <button 
                        className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${viewMode === 'fixtures' ? 'bg-[#fca311] text-black' : 'text-gray-400 hover:text-white'}`}
                        onClick={() => setViewMode('fixtures')}
                     >
                         Fixtures
                     </button>
                 </div>

                 <button onClick={handlePrint} className="bg-[#1c2533] p-2 rounded-lg text-[#94a3b8] hover:text-white hover:bg-[#334155] transition">
                     <Printer size={20} />
                 </button>
            </div>
        </div>
      </header>
      
      {/* Winner Banner */}
      {selectedEvent.winnerTeam && viewMode === 'results' && (
          <div className="max-w-5xl mx-auto mb-8 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-600/50 rounded-xl p-6 flex flex-col items-center justify-center text-center">
              <Trophy className="text-yellow-500 w-12 h-12 mb-2 animate-bounce" />
              <h2 className="text-yellow-500 font-bold uppercase tracking-widest text-sm mb-1">Tournament Winner</h2>
              <p className="text-3xl font-black text-white">{selectedEvent.winnerTeam}</p>
          </div>
      )}

      <div className="max-w-5xl mx-auto">
        {/* ADMIN PANEL (Only visible to admins) */}
        {user?.role === UserRole.ADMIN && viewMode === 'results' && (
            <div className="bg-[#1c2533] p-6 rounded-lg mb-8 border border-[#334155] print:hidden">
            <h2 className="mb-6 text-sm text-[#94a3b8] uppercase font-bold tracking-wider border-b border-[#334155] pb-2">Add Result for {selectedEvent.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                
                {/* Home Team */}
                <div className="space-y-2">
                    <label className="text-xs text-[#94a3b8] font-medium">Home Team</label>
                    <input 
                        type="text" 
                        className="w-full p-2 bg-[#0f172a] border border-[#334155] text-white rounded text-sm focus:border-[#fca311] focus:outline-none"
                        placeholder="Name"
                        value={homeName}
                        onChange={e => setHomeName(e.target.value)}
                    />
                    <input 
                        type="file" 
                        accept="image/*"
                        className="text-[#94a3b8] text-xs w-full"
                        onChange={e => handleFileChange(e, setHomeLogo)}
                    />
                </div>

                {/* Score */}
                <div className="flex items-center space-x-2">
                     <div className="flex-1">
                        <label className="text-xs text-[#94a3b8] font-medium block mb-2 text-center">Home</label>
                        <input 
                            type="number" 
                            className="w-full p-2 bg-[#0f172a] border border-[#334155] text-white rounded text-sm text-center font-bold text-lg"
                            value={homeScore}
                            onChange={e => setHomeScore(Number(e.target.value))}
                        />
                     </div>
                     <span className="text-[#94a3b8] font-bold pt-6">:</span>
                     <div className="flex-1">
                        <label className="text-xs text-[#94a3b8] font-medium block mb-2 text-center">Away</label>
                        <input 
                            type="number" 
                            className="w-full p-2 bg-[#0f172a] border border-[#334155] text-white rounded text-sm text-center font-bold text-lg"
                            value={awayScore}
                            onChange={e => setAwayScore(Number(e.target.value))}
                        />
                     </div>
                </div>

                {/* Away Team */}
                <div className="space-y-2">
                    <label className="text-xs text-[#94a3b8] font-medium">Away Team</label>
                    <input 
                        type="text" 
                        className="w-full p-2 bg-[#0f172a] border border-[#334155] text-white rounded text-sm focus:border-[#fca311] focus:outline-none"
                        placeholder="Name"
                        value={awayName}
                        onChange={e => setAwayName(e.target.value)}
                    />
                    <input 
                        type="file" 
                        accept="image/*"
                        className="text-[#94a3b8] text-xs w-full"
                        onChange={e => handleFileChange(e, setAwayLogo)}
                    />
                </div>
                
                {/* Submit & Extra Image */}
                <div className="space-y-3">
                     <div>
                        <label className="text-xs text-[#94a3b8] font-medium block mb-1">Match Image (Optional)</label>
                        <input 
                            type="file" 
                            accept="image/*"
                            className="text-[#94a3b8] text-xs w-full"
                            onChange={e => handleFileChange(e, setMatchImage)}
                        />
                     </div>
                    <button 
                        onClick={handleAddMatch}
                        className="w-full bg-[#fca311] text-black font-bold border-none py-2 px-4 rounded hover:bg-[#e5920d] transition duration-200 text-sm"
                    >
                        Save Result
                    </button>
                </div>
            </div>
            </div>
        )}

        {/* RESULTS LIST */}
        <div className="flex flex-col gap-4 print:block print:space-y-4">
            {matches.map(match => (
            <div key={match.id} className="bg-[#111625] border border-[#1e293b] rounded-lg overflow-hidden shadow-lg print:border-black print:bg-white print:text-black print:mb-4">
                
                {/* Optional Match Image Banner */}
                {match.matchImage && viewMode === 'results' && (
                    <div className="h-40 w-full relative print:hidden">
                        <img src={match.matchImage} alt="Match Action" className="w-full h-full object-cover opacity-60" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#111625] to-transparent"></div>
                    </div>
                )}

                <div className="p-5 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    
                    {/* Left: Category/Tag */}
                    <div className="hidden md:flex items-center gap-4 w-1/5">
                        <span className="bg-[#1e293b] text-[#94a3b8] px-2 py-1 text-[10px] rounded uppercase font-bold border border-[#334155] print:border-gray-300 print:text-black print:bg-gray-100">
                            {viewMode === 'fixtures' ? 'Upcoming' : 'Finished'}
                        </span>
                    </div>

                    {/* Center: Teams & Score */}
                    <div className="flex items-center justify-center flex-grow gap-4 w-full md:w-auto">
                        {/* Home */}
                        <div className="flex items-center gap-3 w-1/2 md:w-[200px] justify-end text-right">
                            <span className="font-bold text-sm md:text-[15px] hidden sm:block">{match.homeTeam}</span>
                            <span className="font-bold text-sm md:text-[15px] sm:hidden">{match.homeTeam.substring(0,3).toUpperCase()}</span>
                            <img src={match.homeLogo} alt="Home" className="w-10 h-10 object-contain rounded-full bg-white p-1" />
                        </div>

                        {/* Score Box */}
                        <div className="bg-[#0b0e14] px-4 py-2 rounded-lg text-2xl font-black text-[#fca311] tracking-widest border border-[#1e293b] min-w-[90px] text-center shadow-inner print:bg-white print:text-black print:border-black">
                             {viewMode === 'fixtures' ? 'VS' : `${match.homeScore} : ${match.awayScore}`}
                        </div>

                        {/* Away */}
                        <div className="flex items-center gap-3 w-1/2 md:w-[200px] justify-start text-left">
                            <img src={match.awayLogo} alt="Away" className="w-10 h-10 object-contain rounded-full bg-white p-1" />
                            <span className="font-bold text-sm md:text-[15px] hidden sm:block">{match.awayTeam}</span>
                            <span className="font-bold text-sm md:text-[15px] sm:hidden">{match.awayTeam.substring(0,3).toUpperCase()}</span>
                        </div>
                    </div>

                    {/* Right: Meta & Share */}
                    <div className="flex flex-row md:flex-col items-center justify-between w-full md:w-[15%] text-[11px] text-[#94a3b8] mt-2 md:mt-0 border-t border-[#1e293b] md:border-t-0 pt-3 md:pt-0 print:text-black">
                        <div className="md:text-right">
                            <div>{new Date(match.date).toLocaleDateString()}</div>
                            <div className="opacity-70">{new Date(match.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        </div>
                        <button onClick={() => handleShare(match)} className="md:mt-2 text-[#fca311] hover:text-white print:hidden">
                            <Share2 size={16} />
                        </button>
                    </div>
                </div>
            </div>
            ))}

            {matches.length === 0 && (
            <div className="text-center bg-[#1c2533] rounded-lg p-10 border border-[#334155] print:hidden">
                <div className="text-4xl mb-3">🏟️</div>
                <h3 className="text-white font-bold text-lg">No {viewMode === 'fixtures' ? 'Fixtures' : 'Results'} Yet</h3>
                <p className="text-[#94a3b8] text-sm">Items will appear here once available.</p>
            </div>
            )}
        </div>
      </div>
    </div>
  );
};
