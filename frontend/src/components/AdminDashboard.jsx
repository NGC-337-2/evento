import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line 
} from 'recharts';
import { 
  Users, Layout, CreditCard, ShieldCheck, Search, Check, X, 
  Trash2, Edit, ExternalLink, Calendar, MoreVertical, Activity, 
  FileText, TrendingUp, Filter, Download
} from 'lucide-react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import axiosClient from '../api/axiosClient';

// Redux Actions
import { getAdminStats, resetStatsState } from '../features/stats/statsSlice';
import { getAllUsers, deleteUser, resetUserState } from '../features/users/userSlice';
import { getEvents, deleteEvent, updateEvent, resetEventsState } from '../features/events/eventsSlice';
import { getAllBookings, cancelBooking, resetBookingState } from '../features/bookings/bookingSlice';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

const AdminDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    
    // Local state for admin-only data
    const [metrics, setMetrics] = useState(null);
    const [auditLogs, setAuditLogs] = useState([]);
    const [isLocalLoading, setIsLocalLoading] = useState(false);

    // Select state from Redux
    const { adminStats, isLoading: statsLoading } = useSelector((state) => state.stats);
    const { users, isLoading: usersLoading } = useSelector((state) => state.users);
    const { events, isLoading: eventsLoading } = useSelector((state) => state.events);
    const { bookings, isLoading: bookingsLoading } = useSelector((state) => state.bookings);

    const isLoading = statsLoading || usersLoading || eventsLoading || bookingsLoading || isLocalLoading;

    useEffect(() => {
        if (activeTab === 'overview') {
            dispatch(getAdminStats());
            dispatch(getEvents({ status: 'draft', limit: 10 }));
        }
        if (activeTab === 'users') dispatch(getAllUsers());
        if (activeTab === 'events') dispatch(getEvents({ limit: 100 }));
        if (activeTab === 'bookings') dispatch(getAllBookings());
        if (activeTab === 'metrics') fetchMetrics();
        if (activeTab === 'audit') fetchAuditLogs();
    }, [activeTab, dispatch]);

    const fetchMetrics = async () => {
        setIsLocalLoading(true);
        try {
            const res = await axiosClient.get('/admin/metrics');
            setMetrics(res.data.data);
        } catch (err) {
            toast.error("Failed to load platform metrics");
        } finally {
            setIsLocalLoading(false);
        }
    };

    const fetchAuditLogs = async () => {
        setIsLocalLoading(true);
        try {
            const res = await axiosClient.get('/admin/audit-logs');
            setAuditLogs(res.data.data);
        } catch (err) {
            toast.error("Failed to load audit logs");
        } finally {
            setIsLocalLoading(false);
        }
    };

    // Moderation helpers
    const approveEvent = (id) => {
        dispatch(updateEvent({ id, eventData: { status: 'published' } }))
            .then(() => toast.success("Event approved"));
    };

    const handleDeleteUser = (id) => {
        if (!window.confirm("Are you sure? This will permanently delete the user.")) return;
        dispatch(deleteUser(id)).then(() => toast.success("User deleted"));
    };

    const handleDeleteEvent = (id) => {
        if (!window.confirm("Delete this event?")) return;
        dispatch(deleteEvent(id)).then(() => toast.success("Event deleted"));
    };

    const handleCancelBooking = (id) => {
        if (!window.confirm("Cancel this booking?")) return;
        dispatch(cancelBooking(id)).then(() => toast.success("Booking cancelled"));
    };


    const renderOverview = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={<Users />} label="Total Users" value={adminStats?.totalUsers} color="blue" />
                <StatCard icon={<Layout />} label="Total Events" value={adminStats?.totalEvents} color="purple" />
                <StatCard icon={<ShieldCheck />} label="Bookings" value={adminStats?.totalBookings} color="green" />
                <StatCard icon={<CreditCard />} label="Volume" value={`$${adminStats?.totalRevenue?.toLocaleString()}`} color="amber" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-bold text-secondary-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
                        <Activity className="w-5 h-5 text-primary-500" /> Moderation Queue
                    </h3>
                    
                    {events.filter(e => e.status === 'draft').length === 0 ? (
                        <div className="card p-8 text-center text-secondary-500 dark:bg-secondary-800 dark:border-secondary-700 italic border-dashed">No events pending review.</div>
                    ) : (
                        <div className="space-y-4">
                            {events.filter(e => e.status === 'draft').slice(0, 5).map(event => (
                                <div key={event._id} className="card p-4 bg-white dark:bg-secondary-800 dark:border-secondary-700 flex items-center justify-between gap-4 group hover:shadow-md transition-all">
                                    <div className="flex items-center gap-4">
                                        <img src={event.image === 'no-photo.jpg' ? 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg' : event.image} className="w-12 h-12 rounded-lg object-cover" />
                                        <div>
                                            <h4 className="font-bold text-secondary-900 dark:text-white text-sm uppercase tracking-tight line-clamp-1">{event.title}</h4>
                                            <p className="text-[10px] text-secondary-500 font-bold uppercase tracking-widest">{event.organizer?.name || 'Unknown'}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => approveEvent(event._id)} className="inline-flex items-center justify-center rounded-md bg-primary-600 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600">Approve</button>
                                        <button className="inline-flex items-center justify-center rounded-md bg-white dark:bg-secondary-800 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400 shadow-sm ring-1 ring-inset ring-secondary-300 dark:ring-secondary-700 hover:bg-red-50 dark:hover:bg-secondary-700">Reject</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-secondary-900 dark:text-white uppercase tracking-tight">System Status</h3>
                    <div className="card p-6 dark:bg-secondary-800 dark:border-secondary-700 space-y-4">
                        <StatusRow label="API Gateway" status="Healthy" />
                        <StatusRow label="Database" status="Connected" />
                        <StatusRow label="Storage" status="Operational" />
                        <StatusRow label="Mail Server" status="Active" />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderUsers = () => (
        <div className="card overflow-hidden dark:bg-secondary-800 dark:border-secondary-700 animate-in slide-in-from-bottom-4 duration-500">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-secondary-50 dark:bg-secondary-900/50 border-b dark:border-secondary-700">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary-500">User</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary-500">Role</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary-500">Joined</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-secondary-700">
                        {users.map(u => (
                            <tr key={u._id} className="hover:bg-secondary-50/50 dark:hover:bg-secondary-700/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-bold text-xs">
                                            {u.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-secondary-900 dark:text-white text-sm">{u.name}</div>
                                            <div className="text-xs text-secondary-500">{u.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${u.role === 'admin' ? 'bg-red-100 text-red-700' : u.role === 'organizer' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-secondary-500">{format(new Date(u.createdAt), 'MMM d, yyyy')}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => navigate(`/profile`)} className="p-1.5 text-secondary-400 hover:text-primary-500 transition-colors"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => handleDeleteUser(u._id)} className="p-1.5 text-secondary-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderEvents = () => (
        <div className="card overflow-hidden dark:bg-secondary-800 dark:border-secondary-700 animate-in slide-in-from-bottom-4 duration-500">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-secondary-50 dark:bg-secondary-900/50 border-b dark:border-secondary-700">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary-500">Event</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary-500 text-center">Status</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary-500 text-center">Sales</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-secondary-700">
                        {events.map(e => (
                            <tr key={e._id} className="hover:bg-secondary-50/50 dark:hover:bg-secondary-700/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <img src={e.image === 'no-photo.jpg' ? 'https://via.placeholder.com/150' : e.image} className="w-10 h-10 rounded object-cover" />
                                        <div>
                                            <div className="font-bold text-secondary-900 dark:text-white text-sm uppercase tracking-tight truncate max-w-[200px]">{e.title}</div>
                                            <div className="text-[10px] text-secondary-500 font-bold uppercase tracking-widest">{format(new Date(e.date), 'MMM d, p')}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${e.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {e.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center text-sm text-secondary-500 font-bold">{e.bookingsCount} / {e.capacity}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => navigate(`/manage/events/edit/${e._id}`)} className="p-1.5 text-secondary-400 hover:text-primary-500 transition-colors"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => handleDeleteEvent(e._id)} className="p-1.5 text-secondary-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderMetrics = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            {metrics ? (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="card p-6 bg-white dark:bg-secondary-800 dark:border-secondary-700 h-[400px]">
                            <h3 className="text-sm font-bold text-secondary-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-primary-500" /> Revenue Trend (6M)
                            </h3>
                            <div className="w-full h-full pb-10">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={metrics.revenueTrend}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                                        <XAxis dataKey="label" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '10px' }} />
                                        <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="card p-6 bg-white dark:bg-secondary-800 dark:border-secondary-700 h-[400px]">
                            <h3 className="text-sm font-bold text-secondary-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                                <Users className="w-4 h-4 text-primary-500" /> User Distribution
                            </h3>
                            <div className="w-full h-full pb-10">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={metrics.userGrowth}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="count"
                                            nameKey="_id"
                                        >
                                            {metrics.userGrowth.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6 bg-white dark:bg-secondary-800 dark:border-secondary-700">
                        <h3 className="text-sm font-bold text-secondary-900 dark:text-white mb-6 uppercase tracking-widest">Category Performance</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-secondary-50 dark:bg-secondary-900/50">
                                    <tr>
                                        <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary-500">Category</th>
                                        <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary-500 text-center">Events</th>
                                        <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-secondary-500 text-center">Total Bookings</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-secondary-700">
                                    {metrics.categoryPopularity.map(cat => (
                                        <tr key={cat._id} className="hover:bg-secondary-50/50 dark:hover:bg-secondary-900/30">
                                            <td className="px-6 py-4 font-bold text-secondary-900 dark:text-white text-sm uppercase tracking-tight">{cat._id}</td>
                                            <td className="px-6 py-4 text-center text-sm font-medium">{cat.count}</td>
                                            <td className="px-6 py-4 text-center text-sm font-bold text-primary-600">{cat.totalBookings}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="py-20 text-center text-secondary-500 italic uppercase tracking-widest text-xs font-bold">Failed to load metrics.</div>
            )}
        </div>
    );

    const renderAudit = () => (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-secondary-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary-500" /> Audit Logs
                </h3>
                <button className="inline-flex items-center justify-center rounded-md bg-white dark:bg-secondary-800 px-4 py-2 gap-2 text-[10px] font-bold uppercase tracking-widest text-secondary-700 dark:text-secondary-300 shadow-sm ring-1 ring-inset ring-secondary-300 dark:ring-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-700">
                    <Download className="w-3.5 h-3.5" /> Export Logs
                </button>
            </div>
            
            <div className="card overflow-hidden dark:bg-secondary-800 dark:border-secondary-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-secondary-50 dark:bg-secondary-900/50">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary-500">Admin</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary-500">Action</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary-500">Target</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary-500">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-secondary-700">
                            {auditLogs.map(log => (
                                <tr key={log._id} className="hover:bg-secondary-50/50 dark:hover:bg-secondary-900/30 transition-colors text-sm">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-secondary-900 dark:text-white">{log.admin?.name || 'System'}</div>
                                        <div className="text-[10px] text-secondary-500 uppercase font-medium">{log.admin?.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-widest ${
                                            log.action.includes('DELETE') ? 'bg-red-100 text-red-700' : 
                                            log.action.includes('APPROVE') ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {log.action.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-secondary-500">
                                        {log.targetType} <span className="text-[10px] opacity-50">({log.targetId})</span>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-bold text-secondary-400">
                                        {format(new Date(log.createdAt), 'MMM d, HH:mm:ss')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderBookings = () => (
        <div className="card overflow-hidden dark:bg-secondary-800 dark:border-secondary-700 animate-in slide-in-from-bottom-4 duration-500">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-secondary-50 dark:bg-secondary-900/50 border-b dark:border-secondary-700">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary-500">Attendee</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary-500">Event</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary-500 text-center">Amount</th>
                            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-secondary-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-secondary-700">
                        {bookings.map(b => (
                            <tr key={b._id} className="hover:bg-secondary-50/50 dark:hover:bg-secondary-700/30 transition-colors">
                                <td className="px-6 py-4 text-sm">
                                    <div className="font-bold text-secondary-900 dark:text-white">{b.user?.name}</div>
                                    <div className="text-xs text-secondary-500">{b.user?.email}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-secondary-500 truncate max-w-[150px] font-medium">{b.event?.title}</td>
                                <td className="px-6 py-4 text-sm font-bold text-secondary-900 dark:text-white text-center">${b.totalPrice}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleCancelBooking(b._id)} className="text-[10px] font-bold text-red-500 hover:underline uppercase tracking-widest">Cancel</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 pb-20">
            {/* Tab Navigation */}
            <div className="flex border-b dark:border-secondary-700 overflow-x-auto scrollbar-hide">
                <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<ShieldCheck className="w-4 h-4" />} label="Overview" />
                <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users className="w-4 h-4" />} label="Users" />
                <TabButton active={activeTab === 'events'} onClick={() => setActiveTab('events')} icon={<Layout className="w-4 h-4" />} label="Events" />
                <TabButton active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} icon={<CreditCard className="w-4 h-4" />} label="Bookings" />
                <TabButton active={activeTab === 'metrics'} onClick={() => setActiveTab('metrics')} icon={<Activity className="w-4 h-4" />} label="Metrics" />
                <TabButton active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} icon={<FileText className="w-4 h-4" />} label="Audit" />
            </div>

            {isLoading && (activeTab !== 'overview' && activeTab !== 'metrics' && activeTab !== 'audit') ? (
                <div className="flex flex-col items-center justify-center py-20 text-secondary-500 space-y-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
                    <p className="text-[10px] font-bold uppercase tracking-widest">Fetching system data...</p>
                </div>
            ) : (
                <>
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'users' && renderUsers()}
                    {activeTab === 'events' && renderEvents()}
                    {activeTab === 'bookings' && renderBookings()}
                    {activeTab === 'metrics' && renderMetrics()}
                    {activeTab === 'audit' && renderAudit()}
                </>
            )}
        </div>
    );
};

const TabButton = ({ active, onClick, icon, label }) => (
    <button 
        onClick={onClick}
        className={`flex items-center gap-2 px-6 py-4 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${
            active 
            ? 'text-primary-600 border-primary-600 bg-primary-50/10' 
            : 'text-secondary-500 border-transparent hover:text-secondary-900 dark:hover:text-white'
        }`}
    >
        {icon} {label}
    </button>
);

const StatCard = ({ icon, label, value, color }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20',
        purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20',
        green: 'bg-green-50 text-green-600 dark:bg-green-900/20',
        amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20',
    };
    return (
        <div className="card p-5 bg-white dark:bg-secondary-800 dark:border-secondary-700 border-none shadow-sm group hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl transition-all group-hover:scale-110 ${colors[color]}`}>{icon}</div>
                <div>
                    <p className="text-[10px] font-bold text-secondary-500 uppercase tracking-widest mb-0.5">{label}</p>
                    <p className="text-2xl font-black text-secondary-900 dark:text-white uppercase tracking-tighter">{value || 0}</p>
                </div>
            </div>
        </div>
    );
};

const StatusRow = ({ label, status }) => (
    <div className="flex justify-between items-center py-1.5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-secondary-500">{label}</span>
        <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">{status}</span>
        </div>
    </div>
);

export default AdminDashboard;

