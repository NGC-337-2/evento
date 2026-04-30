import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { Users, Layout, CreditCard, ShieldCheck, Search, Check, X } from 'lucide-react';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [pendingEvents, setPendingEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [statsRes, eventsRes] = await Promise.all([
                axiosClient.get('/stats/admin'),
                axiosClient.get('/events?status=draft&limit=5') // Assuming draft needs approval in this flow
            ]);
            setStats(statsRes.data.data);
            setPendingEvents(eventsRes.data.data);
        } catch (err) {
            toast.error("Failed to load admin data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const approveEvent = async (id) => {
        try {
            await axiosClient.put(`/events/${id}`, { status: 'published' });
            toast.success("Event approved and published");
            fetchData();
        } catch (err) {
            toast.error("Approval failed");
        }
    };

    if (isLoading) return <div className="text-center py-12 text-secondary-500">Loading platform overview...</div>;

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card p-5 bg-white dark:bg-secondary-800 dark:border-secondary-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl"><Users className="w-6 h-6" /></div>
                        <div>
                            <p className="text-sm font-medium text-secondary-500 uppercase tracking-widest">Users</p>
                            <p className="text-2xl font-black text-secondary-900 dark:text-white uppercase tracking-tighter">{stats.totalUsers}</p>
                        </div>
                    </div>
                </div>
                <div className="card p-5 bg-white dark:bg-secondary-800 dark:border-secondary-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-xl"><Layout className="w-6 h-6" /></div>
                        <div>
                            <p className="text-sm font-medium text-secondary-500 uppercase tracking-widest">Events</p>
                            <p className="text-2xl font-black text-secondary-900 dark:text-white uppercase tracking-tighter">{stats.totalEvents}</p>
                        </div>
                    </div>
                </div>
                <div className="card p-5 bg-white dark:bg-secondary-800 dark:border-secondary-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl"><ShieldCheck className="w-6 h-6" /></div>
                        <div>
                            <p className="text-sm font-medium text-secondary-500 uppercase tracking-widest">Bookings</p>
                            <p className="text-2xl font-black text-secondary-900 dark:text-white uppercase tracking-tighter">{stats.totalBookings}</p>
                        </div>
                    </div>
                </div>
                <div className="card p-5 bg-white dark:bg-secondary-800 dark:border-secondary-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl"><CreditCard className="w-6 h-6" /></div>
                        <div>
                            <p className="text-sm font-medium text-secondary-500 uppercase tracking-widest">Volume</p>
                            <p className="text-2xl font-black text-secondary-900 dark:text-white uppercase tracking-tighter">${stats.totalRevenue.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Moderation Queue */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-bold text-secondary-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                        <Search className="w-5 h-5 text-primary-500" /> Moderation Queue
                    </h3>
                    
                    {pendingEvents.length === 0 ? (
                        <div className="card p-8 text-center text-secondary-500 dark:bg-secondary-800 dark:border-secondary-700 italic border-dashed">No events pending review.</div>
                    ) : (
                        <div className="space-y-4">
                            {pendingEvents.map(event => (
                                <div key={event._id} className="card p-5 bg-white dark:bg-secondary-800 dark:border-secondary-700 flex flex-wrap items-center justify-between gap-6">
                                    <div className="flex items-center gap-4 min-w-[200px]">
                                        <div className="w-12 h-12 rounded-lg bg-secondary-100 dark:bg-secondary-900 shrink-0 overflow-hidden">
                                            <img src={event.image === 'no-photo.jpg' ? 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg' : event.image} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-secondary-900 dark:text-white uppercase tracking-tighter">{event.title}</h4>
                                            <p className="text-xs text-secondary-500">Organiser: {event.organiser?.name || 'Unknown'}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => approveEvent(event._id)}
                                            className="btn btn-primary h-8 px-4 text-xs gap-1.5 shadow-none"
                                        >
                                            <Check className="w-3.5 h-3.5" /> Approve
                                        </button>
                                        <button className="btn btn-ghost h-8 px-4 text-xs gap-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                                            <X className="w-3.5 h-3.5" /> Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-secondary-900 dark:text-white uppercase tracking-tight">Admin Tools</h3>
                    <div className="grid grid-cols-1 gap-2">
                        <button className="btn btn-outline justify-start gap-3 h-12 text-sm px-4 dark:text-secondary-300 dark:border-secondary-700"><Users className="w-4 h-4" /> Manage Users</button>
                        <button className="btn btn-outline justify-start gap-3 h-12 text-sm px-4 dark:text-secondary-300 dark:border-secondary-700"><ShieldCheck className="w-4 h-4" /> System Settings</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
