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
                    label="Total views" 
                    value={`$${stats.summary.totalRevenue.toLocaleString()}`} 
                    subValue="0.43% ↑"
                    trend="up"
                    color="text-primary-600" 
                />
                <StatCard 
                    icon={<Users />} 
                    label="Total Profit" 
                    value={`$${(stats.summary.totalRevenue * 0.8).toLocaleString()}`} 
                    subValue="4.35% ↑"
                    trend="up"
                    color="text-[#10B981]" 
                />
                <StatCard 
                    icon={<TrendingUp />} 
                    label="Total Product" 
                    value={stats.summary.totalEvents.toString()} 
                    subValue="2.59% ↑"
                    trend="up"
                    color="text-[#3C50E0]" 
                />
            </dl>

            <div className="mt-7.5 grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
                {/* Revenue Chart */}
                <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8">
                    <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
                        <div className="flex w-full flex-wrap gap-3 sm:gap-5">
                            <div className="flex min-w-47.5">
                                <span className="mt-1 mr-2 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-primary-600">
                                    <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-primary-600"></span>
                                </span>
                                <div className="w-full">
                                    <p className="font-semibold text-primary-600">Total Revenue</p>
                                    <p className="text-sm font-medium">12.04.2022 - 12.05.2022</p>
                                </div>
                            </div>
                            <div className="flex min-w-47.5">
                                <span className="mt-1 mr-2 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-secondary-400">
                                    <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-secondary-400"></span>
                                </span>
                                <div className="w-full">
                                    <p className="font-semibold text-secondary-400">Total Sales</p>
                                    <p className="text-sm font-medium">12.04.2022 - 12.05.2022</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex w-full max-w-45 justify-end">
                            <div className="inline-flex items-center rounded-md bg-whiter p-1.5 dark:bg-meta-4">
                                <button className="rounded bg-white py-1 px-3 text-xs font-medium text-black shadow-card hover:bg-white hover:shadow-card dark:bg-boxdark dark:text-white dark:hover:bg-boxdark">
                                    Day
                                </button>
                                <button className="rounded py-1 px-3 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark">
                                    Week
                                </button>
                                <button className="rounded py-1 px-3 text-xs font-medium text-black hover:bg-white hover:shadow-card dark:text-white dark:hover:bg-boxdark">
                                    Month
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="w-full h-[350px]">
                        {stats.chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stats.chartData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.2} />
                                    <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => val.split('-')[2]} stroke="#94a3b8" />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} stroke="#94a3b8" />
                                    <RechartsTooltip 
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Line type="monotone" dataKey="revenue" stroke="#3C50E0" strokeWidth={2} dot={{ r: 4, fill: '#3C50E0' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                                    <Line type="monotone" dataKey="tickets" stroke="#80CAEE" strokeWidth={2} dot={{ r: 4, fill: '#80CAEE' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-secondary-400 italic text-sm">No revenue data available</div>
                        )}
                    </div>
                </div>

                {/* Profit Chart */}
                <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-4">
                    <div className="mb-4 justify-between gap-4 sm:flex">
                        <div>
                            <h4 className="text-xl font-bold text-black dark:text-white">Profit this week</h4>
                        </div>
                        <div>
                            <select className="relative z-20 inline-flex appearance-none bg-transparent py-1 pl-3 pr-8 text-sm font-medium outline-none">
                                <option value="">This Week</option>
                                <option value="">Last Week</option>
                            </select>
                        </div>
                    </div>

                    <div className="w-full h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.chartData.slice(-7)} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.2} />
                                <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => val.split('-')[2]} stroke="#94a3b8" />
                                <YAxis hide />
                                <RechartsTooltip cursor={{fill: 'transparent'}} />
                                <Bar dataKey="revenue" fill="#3C50E0" radius={[4, 4, 0, 0]} barSize={12} />
                                <Bar dataKey="tickets" fill="#80CAEE" radius={[4, 4, 0, 0]} barSize={12} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Event Performance Table */}
            <div className="mt-4 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="py-6 px-4 md:px-6 xl:px-7.5 border-b border-stroke dark:border-strokedark">
                    <h4 className="text-xl font-bold text-black dark:text-white">Event Performance</h4>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-stroke dark:divide-strokedark">
                        <thead>
                            <tr className="bg-gray-2 dark:bg-meta-4">
                                <th scope="col" className="py-4 pl-6 pr-3 text-left text-sm font-semibold uppercase text-secondary-600 dark:text-secondary-400">
                                    Event Details
                                </th>
                                <th scope="col" className="px-3 py-4 text-center text-sm font-semibold uppercase text-secondary-600 dark:text-secondary-400">
                                    Status
                                </th>
                                <th scope="col" className="px-3 py-4 text-center text-sm font-semibold uppercase text-secondary-600 dark:text-secondary-400">
                                    Sales
                                </th>
                                <th scope="col" className="px-3 py-4 text-right text-sm font-semibold uppercase text-secondary-600 dark:text-secondary-400">
                                    Revenue
                                </th>
                                <th scope="col" className="relative py-4 pl-3 pr-6">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stroke dark:divide-strokedark bg-white dark:bg-boxdark">
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

const StatCard = ({ icon, label, value, subValue, trend, color, bg }) => {
    return (
        <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                <div className={`${color}`}>
                    {icon}
                </div>
            </div>

            <div className="mt-4 flex items-end justify-between">
                <div>
                    <h4 className="text-title-md font-bold text-black dark:text-white">
                        {value}
                    </h4>
                    <span className="text-sm font-medium">{label}</span>
                </div>

                <span className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-meta-3' : trend === 'down' ? 'text-meta-1' : 'text-secondary-500'}`}>
                    {subValue}
                    {trend === 'up' && <svg className="fill-meta-3" width="10" height="11" viewBox="0 0 10 11" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.35714 0.847337L0.589741 4.86454C0.441277 5.02258 0.441277 5.27883 0.589741 5.43687L0.917457 5.78586C1.06592 5.9439 1.30613 5.9439 1.4546 5.78586L4.28571 2.77127L4.28571 9.94156C4.28571 10.1639 4.46218 10.3439 4.67857 10.3439L5.32143 10.3439C5.53782 10.3439 5.71429 10.1639 5.71429 9.94156L5.71429 2.77127L8.5454 5.78586C8.69387 5.9439 8.93408 5.9439 9.08254 5.78586L9.41026 5.43687C9.55872 5.27883 9.55872 5.02258 9.41026 4.86454L5.64286 0.847337C5.49439 0.6893 5.25418 0.6893 5.10571 0.847337L4.67857 1.30232L4.35714 0.847337Z" fill="" /></svg>}
                </span>
            </div>
        </div>
    );
};

export default OrganiserDashboard;
