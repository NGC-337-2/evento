import { useEffect, useState, Fragment } from 'react';
import axiosClient from '../api/axiosClient';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
    ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
    Plus, Users, DollarSign, Calendar, Edit3, Trash2, 
    BarChart3, Download, PieChart as PieChartIcon, TrendingUp,
    MoreHorizontal
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Menu, MenuButton, MenuItem, MenuItems, Transition, Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { X, CheckCircle2, UserCheck } from 'lucide-react';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

const OrganiserDashboard = () => {
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [attendees, setAttendees] = useState([]);
    const [isAttendeeModalOpen, setIsAttendeeModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isAttendeesLoading, setIsAttendeesLoading] = useState(false);

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const res = await axiosClient.get('/stats/organizer');
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

    const handleCancelEvent = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this event? This will notify all attendees.")) return;
        try {
            await axiosClient.patch(`/events/${id}/cancel`);
            toast.success("Event cancelled");
            fetchStats();
        } catch (err) {
            toast.error(err.response?.data?.message || "Cancellation failed");
        }
    };

    const fetchAttendees = async (event) => {
        setSelectedEvent(event);
        setIsAttendeeModalOpen(true);
        setIsAttendeesLoading(true);
        try {
            const res = await axiosClient.get(`/bookings/event/${event._id}`);
            setAttendees(res.data.data);
        } catch (err) {
            toast.error("Failed to load attendees");
        } finally {
            setIsAttendeesLoading(false);
        }
    };

    const handleCheckIn = async (bookingId) => {
        try {
            await axiosClient.patch(`/bookings/${bookingId}/check-in`);
            toast.success("Attendee checked in");
            // Update local state
            setAttendees(prev => prev.map(b => 
                b._id === bookingId ? { ...b, checkedIn: true, checkedInAt: new Date() } : b
            ));
        } catch (err) {
            toast.error(err.response?.data?.message || "Check-in failed");
        }
    };

    const handleExportBookings = async (eventId, eventTitle) => {
        try {
            const response = await axiosClient.get(`/export/bookings/${eventId}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `bookings-${eventTitle.replace(/ /g, '_')}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            toast.error("Export failed");
        }
    };

    const handleExportEvents = async () => {
        try {
            const response = await axiosClient.get('/export/events', {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'my-events.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            toast.error("Export failed");
        }
    };

    if (isLoading) return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );

    if (!stats) return (
      <div className="flex flex-col justify-center items-center h-96 text-center">
        <p className="text-secondary-500 dark:text-secondary-400 mb-4">Failed to load dashboard data.</p>
        <button 
          onClick={fetchStats}
          className="rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
        >
          Retry
        </button>
      </div>
    );

    return (
        <div className="space-y-8 pb-12">
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold leading-7 text-secondary-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
                        Organizer Overview
                    </h2>
                    <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
                        Manage your events and track performance metrics.
                    </p>
                </div>
                <div className="mt-4 flex sm:ml-4 sm:mt-0 gap-3">
                    <button 
                        onClick={handleExportEvents} 
                        className="inline-flex items-center gap-x-1.5 rounded-md bg-white dark:bg-secondary-800 px-3 py-2 text-sm font-semibold text-secondary-900 dark:text-white shadow-sm ring-1 ring-inset ring-secondary-300 dark:ring-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-700"
                    >
                        <Download className="-ml-0.5 h-4 w-4" aria-hidden="true" />
                        Export CSV
                    </button>
                    <Link 
                        to="/manage/events/create" 
                        className="inline-flex items-center gap-x-1.5 rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                    >
                        <Plus className="-ml-0.5 h-4 w-4" aria-hidden="true" />
                        New Event
                    </Link>
                </div>
            </div>

            {/* Summary Cards */}
            <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard 
                    icon={<DollarSign />} 
                    label="Total Revenue" 
                    value={`$${stats.summary.totalRevenue.toLocaleString()}`} 
                    subValue="+12% from last month"
                    trend="up"
                    color="text-green-600 dark:text-green-400" 
                    bg="bg-green-100 dark:bg-green-900/20"
                />
                <StatCard 
                    icon={<Users />} 
                    label="Tickets Sold" 
                    value={stats.summary.totalTickets.toString()} 
                    subValue={`${stats.summary.totalEvents} active events`}
                    trend="neutral"
                    color="text-blue-600 dark:text-blue-400" 
                    bg="bg-blue-100 dark:bg-blue-900/20"
                />
                <StatCard 
                    icon={<TrendingUp />} 
                    label="Avg. Capacity" 
                    value={`${Math.round(stats.events.reduce((sum, e) => sum + (e.totalSold/e.totalCapacity*100), 0) / stats.events.length || 0)}%`} 
                    subValue="Across all events"
                    trend="up"
                    color="text-purple-600 dark:text-purple-400" 
                    bg="bg-purple-100 dark:bg-purple-900/20"
                />
            </dl>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Chart */}
                <div className="rounded-2xl bg-white dark:bg-secondary-800 p-6 shadow-sm ring-1 ring-secondary-900/5 dark:ring-white/10 h-[400px]">
                    <h3 className="text-base font-semibold leading-6 text-secondary-900 dark:text-white flex items-center gap-2 mb-6">
                        <BarChart3 className="w-5 h-5 text-secondary-400" /> Revenue Growth (30D)
                    </h3>
                    <div className="w-full h-[300px]">
                        {stats.chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stats.chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.2} />
                                    <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => val.split('-')[2]} stroke="#94a3b8" />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} stroke="#94a3b8" />
                                    <RechartsTooltip 
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} dot={{ r: 3, fill: '#4f46e5' }} activeDot={{ r: 5, strokeWidth: 0 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-secondary-400 italic text-sm">No revenue data for the selected period</div>
                        )}
                    </div>
                </div>

                {/* Category Distribution */}
                <div className="rounded-2xl bg-white dark:bg-secondary-800 p-6 shadow-sm ring-1 ring-secondary-900/5 dark:ring-white/10 h-[400px]">
                    <h3 className="text-base font-semibold leading-6 text-secondary-900 dark:text-white flex items-center gap-2 mb-6">
                        <PieChartIcon className="w-5 h-5 text-secondary-400" /> Category Distribution
                    </h3>
                    <div className="w-full h-[300px]">
                        {stats.categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {stats.categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-secondary-400 italic text-sm">No category data available</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Event Performance Table */}
            <div className="rounded-2xl bg-white dark:bg-secondary-800 shadow-sm ring-1 ring-secondary-900/5 dark:ring-white/10">
                <div className="border-b border-secondary-200 dark:border-secondary-700 px-6 py-5">
                    <h3 className="text-base font-semibold leading-6 text-secondary-900 dark:text-white">Event Performance</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-secondary-300 dark:divide-secondary-700">
                        <thead>
                            <tr>
                                <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-secondary-900 dark:text-white">
                                    Event Details
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-secondary-900 dark:text-white">
                                    Status
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-secondary-900 dark:text-white">
                                    Sales
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-secondary-900 dark:text-white">
                                    Revenue
                                </th>
                                <th scope="col" className="relative py-3.5 pl-3 pr-6">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-secondary-200 dark:divide-secondary-700 bg-white dark:bg-secondary-800">
                            {stats.events.map(event => (
                                <tr key={event._id} className="hover:bg-secondary-50 dark:hover:bg-secondary-700/50 transition-colors">
                                    <td className="whitespace-nowrap py-5 pl-6 pr-3 text-sm">
                                        <div className="flex items-center">
                                            <div className="ml-4">
                                                <div className="font-medium text-secondary-900 dark:text-white">{event.title}</div>
                                                <div className="text-secondary-500 dark:text-secondary-400 capitalize">{event.category} • {new Date(event.date).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-5 text-center text-sm">
                                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                                            event.status === 'published' ? 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20' : 'bg-yellow-50 text-yellow-800 ring-yellow-600/20 dark:bg-yellow-400/10 dark:text-yellow-500 dark:ring-yellow-400/20'
                                        }`}>
                                            {event.status}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-5 text-sm text-secondary-500">
                                        <div className="flex flex-col items-center">
                                            <div className="w-32 bg-secondary-200 dark:bg-secondary-700 rounded-full h-2 mb-1 overflow-hidden">
                                                <div 
                                                    className="bg-primary-600 h-2 rounded-full transition-all duration-500" 
                                                    style={{ width: `${Math.min(100, (event.totalSold / event.totalCapacity) * 100)}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs text-secondary-500 dark:text-secondary-400">{event.totalSold} / {event.totalCapacity}</span>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-5 text-right text-sm font-medium text-secondary-900 dark:text-white">
                                        ${event.revenue.toLocaleString()}
                                    </td>
                                    <td className="relative whitespace-nowrap py-5 pl-3 pr-6 text-right text-sm font-medium">
                                        <Menu as="div" className="relative inline-block text-left">
                                            <div>
                                                <MenuButton className="flex items-center rounded-full bg-transparent p-2 text-secondary-400 hover:text-secondary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-secondary-100">
                                                    <span className="sr-only">Open options</span>
                                                    <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
                                                </MenuButton>
                                            </div>

                                            <Transition
                                                as={Fragment}
                                                enter="transition ease-out duration-100"
                                                enterFrom="transform opacity-0 scale-95"
                                                enterTo="transform opacity-100 scale-100"
                                                leave="transition ease-in duration-75"
                                                leaveFrom="transform opacity-100 scale-100"
                                                leaveTo="transform opacity-0 scale-95"
                                            >
                                                <MenuItems className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-secondary-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                    <div className="py-1">
                                                        <MenuItem>
                                                            {({ focus }) => (
                                                                <button
                                                                    onClick={() => handleExportBookings(event._id, event.title)}
                                                                    className={`
                                                                        ${focus ? 'bg-secondary-100 text-secondary-900 dark:bg-secondary-700 dark:text-white' : 'text-secondary-700 dark:text-secondary-300'}
                                                                        group flex w-full items-center px-4 py-2 text-sm
                                                                    `}
                                                                >
                                                                    <Download className="mr-3 h-5 w-5 text-secondary-400 group-hover:text-secondary-500" aria-hidden="true" />
                                                                    Export Bookings
                                                                </button>
                                                            )}
                                                        </MenuItem>
                                                        <MenuItem>
                                                            {({ focus }) => (
                                                                <button
                                                                    onClick={() => fetchAttendees(event)}
                                                                    className={`
                                                                        ${focus ? 'bg-secondary-100 text-secondary-900 dark:bg-secondary-700 dark:text-white' : 'text-secondary-700 dark:text-secondary-300'}
                                                                        group flex w-full items-center px-4 py-2 text-sm
                                                                    `}
                                                                >
                                                                    <Users className="mr-3 h-5 w-5 text-secondary-400 group-hover:text-secondary-500" aria-hidden="true" />
                                                                    Manage Attendees
                                                                </button>
                                                            )}
                                                        </MenuItem>
                                                        <MenuItem>
                                                            {({ focus }) => (
                                                                <Link
                                                                    to={`/manage/events/edit/${event._id}`}
                                                                    className={`
                                                                        ${focus ? 'bg-secondary-100 text-secondary-900 dark:bg-secondary-700 dark:text-white' : 'text-secondary-700 dark:text-secondary-300'}
                                                                        group flex w-full items-center px-4 py-2 text-sm
                                                                    `}
                                                                >
                                                                    <Edit3 className="mr-3 h-5 w-5 text-secondary-400 group-hover:text-secondary-500" aria-hidden="true" />
                                                                    Edit Event
                                                                </Link>
                                                            )}
                                                        </MenuItem>
                                                        <MenuItem>
                                                            {({ focus }) => (
                                                                <button
                                                                    onClick={() => handleCancelEvent(event._id)}
                                                                    disabled={event.status === 'cancelled'}
                                                                    className={`
                                                                        ${focus ? 'bg-secondary-100 text-secondary-900 dark:bg-secondary-700 dark:text-white' : 'text-secondary-700 dark:text-secondary-300'}
                                                                        group flex w-full items-center px-4 py-2 text-sm disabled:opacity-50
                                                                    `}
                                                                >
                                                                    <Calendar className="mr-3 h-5 w-5 text-secondary-400 group-hover:text-secondary-500" aria-hidden="true" />
                                                                    Cancel Event
                                                                </button>
                                                            )}
                                                        </MenuItem>
                                                        <MenuItem>
                                                            {({ focus }) => (
                                                                <button
                                                                    onClick={() => handleDelete(event._id)}
                                                                    className={`
                                                                        ${focus ? 'bg-secondary-100 text-red-900 dark:bg-secondary-700 dark:text-red-400' : 'text-red-700 dark:text-red-500'}
                                                                        group flex w-full items-center px-4 py-2 text-sm
                                                                    `}
                                                                >
                                                                    <Trash2 className="mr-3 h-5 w-5 text-red-400 group-hover:text-red-500" aria-hidden="true" />
                                                                    Delete Event
                                                                </button>
                                                            )}
                                                        </MenuItem>
                                                    </div>
                                                </MenuItems>
                                            </Transition>
                                        </Menu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Attendee Management Modal */}
            <Transition show={isAttendeeModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={setIsAttendeeModalOpen}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-secondary-500/75 dark:bg-secondary-900/80 transition-opacity" />
                    </Transition.Child>

                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <DialogPanel className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-secondary-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:p-6">
                                    <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                                        <button
                                            type="button"
                                            className="rounded-md bg-white dark:bg-secondary-800 text-secondary-400 hover:text-secondary-500 focus:outline-none"
                                            onClick={() => setIsAttendeeModalOpen(false)}
                                        >
                                            <span className="sr-only">Close</span>
                                            <X className="h-6 w-6" aria-hidden="true" />
                                        </button>
                                    </div>
                                    <div>
                                        <div className="mt-3 text-center sm:mt-0 sm:text-left">
                                            <DialogTitle as="h3" className="text-xl font-semibold leading-6 text-secondary-900 dark:text-white">
                                                Attendee List: {selectedEvent?.title}
                                            </DialogTitle>
                                            <div className="mt-4">
                                                {isAttendeesLoading ? (
                                                    <div className="flex justify-center py-12">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                                    </div>
                                                ) : attendees.length === 0 ? (
                                                    <div className="text-center py-12 text-secondary-500">No bookings found for this event.</div>
                                                ) : (
                                                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                                                        <table className="min-w-full divide-y divide-secondary-300 dark:divide-secondary-700">
                                                            <thead className="bg-secondary-50 dark:bg-secondary-900/50">
                                                                <tr>
                                                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-secondary-900 dark:text-white">Attendee</th>
                                                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-secondary-900 dark:text-white">Tickets</th>
                                                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-secondary-900 dark:text-white">Status</th>
                                                                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                                                        <span className="sr-only">Check-in</span>
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-secondary-200 dark:divide-secondary-700 bg-white dark:bg-secondary-800">
                                                                {attendees.map((booking) => (
                                                                    <tr key={booking._id}>
                                                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                                                                            <div className="font-medium text-secondary-900 dark:text-white">{booking.user?.name}</div>
                                                                            <div className="text-secondary-500 dark:text-secondary-400">{booking.user?.email}</div>
                                                                        </td>
                                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary-500 dark:text-secondary-400">
                                                                            {booking.quantity} ({booking.tickets.map(t => t.tierName).join(', ')})
                                                                        </td>
                                                                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                                            {booking.checkedIn ? (
                                                                                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-500/10 dark:text-green-400">
                                                                                    <CheckCircle2 className="h-3 w-3" /> Checked-in
                                                                                </span>
                                                                            ) : (
                                                                                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400">
                                                                                    Confirmed
                                                                                </span>
                                                                            )}
                                                                        </td>
                                                                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                                            {!booking.checkedIn && (
                                                                                <button
                                                                                    onClick={() => handleCheckIn(booking._id)}
                                                                                    className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 flex items-center gap-1 ml-auto"
                                                                                >
                                                                                    <UserCheck className="h-4 w-4" /> Check-in
                                                                                </button>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-5 sm:mt-6">
                                        <button
                                            type="button"
                                            className="inline-flex w-full justify-center rounded-md bg-secondary-100 dark:bg-secondary-700 px-3 py-2 text-sm font-semibold text-secondary-900 dark:text-white shadow-sm hover:bg-secondary-200 dark:hover:bg-secondary-600"
                                            onClick={() => setIsAttendeeModalOpen(false)}
                                        >
                                            Close
                                        </button>
                                    </div>
                                </DialogPanel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

const StatCard = ({ icon, label, value, subValue, color, bg }) => {
    return (
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-secondary-800 px-4 pb-12 pt-5 shadow-sm ring-1 ring-secondary-900/5 dark:ring-white/10 sm:px-6 sm:pt-6">
            <dt>
                <div className={`absolute rounded-md p-3 ${bg}`}>
                    <div className={`h-6 w-6 ${color}`}>
                        {icon}
                    </div>
                </div>
                <p className="ml-16 truncate text-sm font-medium text-secondary-500 dark:text-secondary-400">{label}</p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                <p className="text-2xl font-semibold text-secondary-900 dark:text-white">{value}</p>
                <div className="absolute inset-x-0 bottom-0 bg-secondary-50 dark:bg-secondary-900/50 px-4 py-4 sm:px-6">
                    <div className="text-sm">
                        <span className="font-medium text-secondary-500 dark:text-secondary-400">
                            {subValue}
                        </span>
                    </div>
                </div>
            </dd>
        </div>
    );
};

export default OrganiserDashboard;
