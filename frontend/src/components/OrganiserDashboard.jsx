import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Plus, Users, DollarSign, Calendar, Edit3, Trash2, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const OrganiserDashboard = () => {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const res = await axiosClient.get('/stats/organiser');
            setStats(res.data.data);
        } catch (err) {
            toast.error("Failed to load statistics");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;
        try {
            await axiosClient.delete(`/events/${id}`);
            toast.success("Event deleted");
            fetchStats();
        } catch (err) {
            toast.error(err.response?.data?.message || "Delete failed");
        }
    };

    if (isLoading) return <div className="space-y-8 animate-pulse text-center py-12 text-secondary-500">Loading your stats...</div>;

    return (
        <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card p-6 bg-primary-600 text-white border-none shadow-lg shadow-primary-500/20">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-white/20 rounded-lg"><DollarSign className="w-6 h-6" /></div>
                        <span className="text-sm font-medium opacity-80 uppercase tracking-wider">Total Revenue</span>
                    </div>
                    <div className="text-3xl font-black">${stats.summary.totalRevenue.toLocaleString()}</div>
                </div>
                <div className="card p-6 bg-white dark:bg-secondary-800 dark:border-secondary-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400"><Users className="w-6 h-6" /></div>
                        <span className="text-sm font-medium text-secondary-500 uppercase tracking-wider">Tickets Sold</span>
                    </div>
                    <div className="text-3xl font-black text-secondary-900 dark:text-white">{stats.summary.totalTickets}</div>
                </div>
                <div className="card p-6 bg-white dark:bg-secondary-800 dark:border-secondary-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-secondary-100 dark:bg-secondary-900 rounded-lg text-secondary-600 dark:text-secondary-400"><Calendar className="w-6 h-6" /></div>
                        <span className="text-sm font-medium text-secondary-500 uppercase tracking-wider">Total Events</span>
                    </div>
                    <div className="text-3xl font-black text-secondary-900 dark:text-white">{stats.events.length}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Chart */}
                <div className="card p-6 bg-white dark:bg-secondary-800 dark:border-secondary-700 h-[400px]">
                    <h3 className="text-lg font-bold text-secondary-900 dark:text-white mb-6 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary-500" /> Revenue Growth (Last 30 Days)
                    </h3>
                    <div className="w-full h-full pb-8">
                        {stats.chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stats.chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-secondary-400 italic">No revenue data for the selected period</div>
                        )}
                    </div>
                </div>

                {/* Performance Table */}
                <div className="card p-6 bg-white dark:bg-secondary-800 dark:border-secondary-700 overflow-hidden">
                    <h3 className="text-lg font-bold text-secondary-900 dark:text-white mb-6 uppercase tracking-tight">Event Performance</h3>
                    <div className="space-y-4">
                        {stats.events.map(event => (
                            <div key={event._id} className="group p-4 border border-secondary-100 dark:border-secondary-700 rounded-xl hover:bg-secondary-50 dark:hover:bg-secondary-900/50 transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-bold text-secondary-900 dark:text-white truncate max-w-[200px] uppercase tracking-tighter">{event.title}</h4>
                                    <div className="flex items-center gap-2">
                                        <Link to={`/manage/events/edit/${event._id}`} className="p-1.5 text-secondary-400 hover:text-primary-600 transition-colors"><Edit3 className="w-4 h-4" /></Link>
                                        <button onClick={() => handleDelete(event._id)} className="p-1.5 text-secondary-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                <div className="w-full bg-secondary-100 dark:bg-secondary-900 rounded-full h-2 mb-2">
                                    <div 
                                        className="bg-primary-500 h-2 rounded-full transition-all duration-500" 
                                        style={{ width: `${Math.min(100, (event.totalSold / event.totalCapacity) * 100)}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-xs font-medium text-secondary-500">
                                    <span>{event.totalSold} / {event.totalCapacity} Sold</span>
                                    <span>{Math.round((event.totalSold / event.totalCapacity) * 100)}% Capacity</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Link to="/manage/events/create" className="btn btn-primary w-full mt-6 gap-2">
                        <Plus className="w-4 h-4" /> Create New Event
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrganiserDashboard;
