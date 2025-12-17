
import React, { useState } from 'react';
import { useAuth } from '../App';
import { storageService } from '../services/storage';
import { Button, Card, Input } from '../components/UI';
import { UserRole, User } from '../types';
import { User as UserIcon, Shield, Users as UsersIcon, Camera, CheckCircle } from 'lucide-react';

export const SettingsPage: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile'|'security'|'users'>('profile');
    const [feedback, setFeedback] = useState<string | null>(null);
    
    // Profile State
    const [fullName, setFullName] = useState(user?.fullName || '');
    const [profileImg, setProfileImg] = useState(user?.profileImage || '');

    // Password State
    const [newPassword, setNewPassword] = useState('');

    // Admin User Search State
    const [searchEmail, setSearchEmail] = useState('');
    const [foundUser, setFoundUser] = useState<User | null>(null);
    const [adminEditPassword, setAdminEditPassword] = useState('');

    const showFeedback = (msg: string) => {
        setFeedback(msg);
        setTimeout(() => setFeedback(null), 3000);
    };

    const handleProfileUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if(user) {
            storageService.updateUser(user.id, { fullName, profileImage: profileImg });
            showFeedback("Profile updated successfully");
        }
    };

    const handlePasswordUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if(user && newPassword) {
            storageService.updateUser(user.id, { password: newPassword });
            showFeedback("Password changed successfully");
            setNewPassword('');
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            if (ev.target?.result) {
                setProfileImg(ev.target.result as string);
            }
          };
          reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleAdminSearch = () => {
        const u = storageService.findUserByEmail(searchEmail);
        if(u) setFoundUser(u);
        else alert("User not found");
    };

    const handleAdminUserUpdate = () => {
        if(foundUser && adminEditPassword) {
            storageService.updateUser(foundUser.id, { password: adminEditPassword });
            showFeedback(`Password updated for ${foundUser.fullName}`);
            setAdminEditPassword('');
        }
    };

    if(!user) return <div>Access Denied</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Account Settings</h1>
                <p className="text-gray-500">Manage your profile and security preferences.</p>
            </div>
            
            <div className="flex gap-4 mb-8 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto scrollbar-hide">
                <button 
                    onClick={() => setActiveTab('profile')} 
                    className={`flex items-center gap-2 px-6 py-2.5 font-bold text-sm rounded-xl transition-all ${activeTab === 'profile' ? 'bg-slate-900 text-cyan-400 shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    <UserIcon size={18} /> Profile
                </button>
                <button 
                    onClick={() => setActiveTab('security')} 
                    className={`flex items-center gap-2 px-6 py-2.5 font-bold text-sm rounded-xl transition-all ${activeTab === 'security' ? 'bg-slate-900 text-cyan-400 shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    <Shield size={18} /> Security
                </button>
                {user.role === UserRole.ADMIN && (
                    <button 
                        onClick={() => setActiveTab('users')} 
                        className={`flex items-center gap-2 px-6 py-2.5 font-bold text-sm rounded-xl transition-all ${activeTab === 'users' ? 'bg-slate-900 text-cyan-400 shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        <UsersIcon size={18} /> Admin
                    </button>
                )}
            </div>

            {feedback && (
                <div className="mb-6 flex items-center gap-2 bg-cyan-50 border border-cyan-100 text-cyan-700 px-4 py-3 rounded-xl font-bold animate-pulse">
                    <CheckCircle size={18} /> {feedback}
                </div>
            )}

            {activeTab === 'profile' && (
                <Card className="max-w-xl">
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                        <div className="flex flex-col items-center gap-4 py-4">
                            <div className="relative group">
                                <img src={profileImg || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`} className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg transition group-hover:opacity-90" />
                                <label className="absolute bottom-0 right-0 cursor-pointer bg-slate-900 text-cyan-400 p-2.5 rounded-full shadow-xl hover:scale-110 transition border-2 border-white">
                                    <Camera size={20} />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                </label>
                            </div>
                            <div className="text-center">
                                <h3 className="font-black text-xl text-gray-900">{fullName}</h3>
                                <p className="text-sm text-gray-400 font-medium">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Input label="Display Name" value={fullName} onChange={e => setFullName(e.target.value)} required />
                            <Input label="Email Address (Public)" value={user.email} disabled className="bg-gray-100 font-mono text-xs cursor-not-allowed" />
                            <Input label="Phone Number" value={user.phone} onChange={e => storageService.updateUser(user.id, { phone: e.target.value })} />
                        </div>

                        <Button type="submit" className="w-full py-4 rounded-2xl shadow-lg shadow-cyan-500/20">Update Profile Details</Button>
                    </form>
                </Card>
            )}

            {activeTab === 'security' && (
                <Card className="max-w-xl">
                    <form onSubmit={handlePasswordUpdate} className="space-y-6">
                        <div className="bg-slate-50 p-4 rounded-xl flex items-start gap-3 mb-2 border border-slate-100">
                            <Shield className="text-cyan-600 mt-1 shrink-0" size={20} />
                            <div>
                                <h4 className="font-bold text-slate-900">Privacy Control</h4>
                                <p className="text-xs text-slate-500">Regularly updating your password keeps your athlete profile and results secure.</p>
                            </div>
                        </div>
                        <Input label="New Account Password" type="password" placeholder="Min. 8 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                        <Button type="submit" variant="secondary" className="w-full py-4 rounded-2xl shadow-lg shadow-orange-500/20">Change Security Key</Button>
                    </form>
                </Card>
            )}

            {activeTab === 'users' && user.role === UserRole.ADMIN && (
                <Card>
                    <div className="mb-6">
                        <h3 className="text-xl font-black text-gray-900 mb-2">Member Search</h3>
                        <p className="text-sm text-gray-500">Locate any user by their registered email address to manage their access.</p>
                    </div>
                    
                    <div className="flex gap-2 mb-8">
                        <input className="bg-gray-50 border border-gray-200 p-3 rounded-xl flex-1 focus:ring-2 focus:ring-cyan-500 outline-none" placeholder="Search by email..." value={searchEmail} onChange={e => setSearchEmail(e.target.value)} />
                        <Button onClick={handleAdminSearch} className="px-8 rounded-xl">Search</Button>
                    </div>

                    {foundUser ? (
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-inner">
                            <div className="flex items-center gap-4 mb-6">
                                <img src={foundUser.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(foundUser.fullName)}&background=random`} className="w-16 h-16 rounded-full border-2 border-white shadow-sm" />
                                <div>
                                    <p className="font-black text-lg text-gray-900">{foundUser.fullName}</p>
                                    <span className="text-xs bg-slate-200 px-2 py-0.5 rounded font-bold uppercase tracking-wider">{foundUser.role}</span>
                                </div>
                            </div>
                            
                            <div className="max-w-md space-y-4">
                                <label className="text-sm font-bold text-gray-700 block">Override Security Password</label>
                                <div className="flex gap-2">
                                    <input className="bg-white border border-gray-200 p-3 rounded-xl w-full focus:ring-2 focus:ring-orange-500 outline-none" type="text" placeholder="New Password" value={adminEditPassword} onChange={e => setAdminEditPassword(e.target.value)} />
                                    <Button onClick={handleAdminUserUpdate} variant="danger" className="rounded-xl shrink-0">Reset</Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-10 opacity-30">
                            <UsersIcon size={48} className="mx-auto mb-2" />
                            <p className="font-bold">No user selected</p>
                        </div>
                    )}
                </Card>
            )}
        </div>
    );
};
