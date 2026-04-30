import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { 
  Users, Layout, CreditCard, ShieldCheck, Search, Check, X, 
  Trash2, Edit, ExternalLink, Calendar, MoreVertical 
} from 'lucide-react';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

// Redux Actions
import { getAdminStats, resetStatsState } from '../features/stats/statsSlice';
import { getAllUsers, deleteUser, resetUserState } from '../features/users/userSlice';
import { getEvents, deleteEvent, updateEvent, resetEventsState } from '../features/events/eventsSlice';
import { getAllBookings, cancelBooking, resetBookingState } from '../features/bookings/bookingSlice';

const AdminDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    
    // Select state from Redux
    const { adminStats, isLoading: statsLoading } = useSelector((state) => state.stats);
    const { users, isLoading: usersLoading } = useSelector((state) => state.users);
    const { events, isLoading: eventsLoading } = useSelector((state) => state.events);
    const { bookings, isLoading: bookingsLoading } = useSelector((state) => state.bookings);

    const isLoading = statsLoading || usersLoading || eventsLoading || bookingsLoading;

    useEffect(() => {
        if (activeTab === 'overview') {
            dispatch(getAdminStats());
            dispatch(getEvents({ status: 'draft', limit: 10 }));
        }
        if (activeTab === 'users') dispatch(getAllUsers());
        if (activeTab === 'events') dispatch(getEvents({ limit: 100 }));
        if (activeTab === 'bookings') dispatch(getAllBookings());
    }, [activeTab, dispatch]);



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
                        <Search className="w-5 h-5 text-primary-500" /> Moderation Queue
                    </h3>
                    
                    {events.filter(e => e.status === 'draft').length === 0 ? (
                        <div className="card p-8 text-center text-secondary-500 dark:bg-secondary-800 dark:border-secondary-700 italic border-dashed">No events pending review.</div>
                    ) : (
                        <div className="space-y-4">
                            {events.filter(e => e.status === 'draft').slice(0, 5).map(event => (

                                <div key={event._id} className="card p-4 bg-white dark:bg-secondary-800 dark:border-secondary-700 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <img src={event.image === 'no-photo.jpg' ? 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg' : event.image} className="w-12 h-12 rounded-lg object-cover" />
                                        <div>
                                            <h4 className="font-bold text-secondary-900 dark:text-white text-sm uppercase">{event.title}</h4>
                                            <p className="text-xs text-secondary-500">{event.organizer?.name || 'Unknown'}</p>

                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => approveEvent(event._id)} className="btn btn-primary h-8 px-3 text-xs">Approve</button>
                                        <button className="btn btn-ghost h-8 px-3 text-xs text-red-500">Reject</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-secondary-900 dark:text-white uppercase tracking-tight">System Health</h3>
                    <div className="card p-6 dark:bg-secondary-800 dark:border-secondary-700 space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-secondary-500">API Status</span>
                            <span className="text-green-500 font-bold">Operational</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-secondary-500">DB Status</span>
                            <span className="text-green-500 font-bold">Connected</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderUsers = () => (
        <div className="card overflow-hidden dark:bg-secondary-800 dark:border-secondary-700 animate-in slide-in-from-bottom-4 duration-500">
            <table className="w-full text-left border-collapse">
                <thead className="bg-secondary-50 dark:bg-secondary-900/50 border-b dark:border-secondary-700">
                    <tr>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary-500">User</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary-500">Role</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary-500">Joined</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary-500 text-right">Actions</th>
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
    );

    const renderEvents = () => (
        <div className="card overflow-hidden dark:bg-secondary-800 dark:border-secondary-700 animate-in slide-in-from-bottom-4 duration-500">
            <table className="w-full text-left border-collapse">
                <thead className="bg-secondary-50 dark:bg-secondary-900/50 border-b dark:border-secondary-700">
                    <tr>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary-500">Event</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary-500">Status</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary-500">Capacity</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary-500 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y dark:divide-secondary-700">
                    {events.map(e => (
                        <tr key={e._id} className="hover:bg-secondary-50/50 dark:hover:bg-secondary-700/30 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <img src={e.image} className="w-10 h-10 rounded object-cover" />
                                    <div>
                                        <div className="font-bold text-secondary-900 dark:text-white text-sm uppercase tracking-tight truncate max-w-[200px]">{e.title}</div>
                                        <div className="text-xs text-secondary-500">{format(new Date(e.date), 'MMM d, p')}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${e.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {e.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-secondary-500">{e.bookingsCount} / {e.capacity}</td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => navigate(`/edit-event/${e._id}`)} className="p-1.5 text-secondary-400 hover:text-primary-500 transition-colors"><Edit className="w-4 h-4" /></button>
                                    <button onClick={() => handleDeleteEvent(e._id)} className="p-1.5 text-secondary-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </td>


                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderBookings = () => (
        <div className="card overflow-hidden dark:bg-secondary-800 dark:border-secondary-700 animate-in slide-in-from-bottom-4 duration-500">
            <table className="w-full text-left border-collapse">
                <thead className="bg-secondary-50 dark:bg-secondary-900/50 border-b dark:border-secondary-700">
                    <tr>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary-500">Attendee</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary-500">Event</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary-500">Amount</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary-500 text-right">Actions</th>
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
                            <td className="px-6 py-4 text-sm font-bold text-secondary-900 dark:text-white">${b.totalPrice}</td>
                            <td className="px-6 py-4 text-right">
                                <button onClick={() => handleCancelBooking(b._id)} className="text-xs font-bold text-red-500 hover:underline uppercase tracking-widest">Cancel</button>
                            </td>

                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="space-y-8 pb-20">
            {/* Tab Navigation */}
            <div className="flex border-b dark:border-secondary-700">
                <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<ShieldCheck className="w-4 h-4" />} label="Overview" />
                <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users className="w-4 h-4" />} label="Users" />
                <TabButton active={activeTab === 'events'} onClick={() => setActiveTab('events')} icon={<Layout className="w-4 h-4" />} label="Events" />
                <TabButton active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} icon={<CreditCard className="w-4 h-4" />} label="Bookings" />
            </div>

            {isLoading && activeTab !== 'overview' ? (
                <div className="flex flex-col items-center justify-center py-20 text-secondary-500 space-y-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
                    <p className="text-xs font-bold uppercase tracking-widest">Fetching system data...</p>
                </div>
            ) : (
                <>
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'users' && renderUsers()}
                    {activeTab === 'events' && renderEvents()}
                    {activeTab === 'bookings' && renderBookings()}
                </>
            )}
        </div>
    );
};

const TabButton = ({ active, onClick, icon, label }) => (
    <button 
        onClick={onClick}
        className={`flex items-center gap-2 px-6 py-4 text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${
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
        <div className="card p-5 bg-white dark:bg-secondary-800 dark:border-secondary-700">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${colors[color]}`}>{icon}</div>
                <div>
                    <p className="text-xs font-bold text-secondary-500 uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-2xl font-black text-secondary-900 dark:text-white uppercase tracking-tighter">{value}</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

