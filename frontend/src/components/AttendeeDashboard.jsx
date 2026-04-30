import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getMyBookings, cancelBooking, resetBookingState } from '../features/bookings/bookingSlice';
import { format } from 'date-fns';
import { Ticket, Calendar, MapPin, XCircle, Download } from 'lucide-react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import Spinner from './Spinner';

const AttendeeDashboard = () => {
    const dispatch = useDispatch();
    const { bookings, isLoading, isError, message } = useSelector((state) => state.bookings);

    useEffect(() => {
        dispatch(getMyBookings());
        
        return () => {
            dispatch(resetBookingState());
        };
    }, [dispatch]);

    useEffect(() => {
        if (isError) {
            toast.error(message || "Failed to fetch bookings");
        }
    }, [isError, message]);

    const handleCancel = (id) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;
        dispatch(cancelBooking(id));
    };


    if (isLoading) return <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-secondary-100 dark:bg-secondary-800 rounded-xl"></div>)}</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
                <Ticket className="w-5 h-5 text-primary-500" /> My Tickets
            </h2>

            {bookings.length === 0 ? (
                <div className="card p-12 text-center dark:bg-secondary-800 dark:border-secondary-700">
                    <p className="text-secondary-500 dark:text-secondary-400 mb-4">You haven't booked any events yet.</p>
                    <Link to="/explore" className="btn btn-primary px-6">Explore Events</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {bookings.map(booking => (
                        <div key={booking._id} className="card p-4 md:p-6 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow dark:bg-secondary-800 dark:border-secondary-700">
                            <div className="w-full md:w-40 h-24 rounded-lg overflow-hidden shrink-0">
                                <img src={booking.event.image === 'no-photo.jpg' ? 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg' : booking.event.image} className="w-full h-full object-cover" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4 mb-2">
                                    <h3 className="font-bold text-lg text-secondary-900 dark:text-white truncate uppercase tracking-tight">{booking.event.title}</h3>
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                                        booking.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                                        booking.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 
                                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                    }`}>
                                        {booking.status}
                                    </span>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-secondary-500 dark:text-secondary-400">
                                    <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {booking.event?.date ? format(new Date(booking.event.date), 'PPP p') : 'No Date'}</div>
                                    <div className="flex items-center gap-1.5 truncate"><MapPin className="w-4 h-4" /> {booking.event?.location?.city || 'Location TBD'}</div>
                                    <div className="flex items-center gap-1.5"><Ticket className="w-4 h-4" /> {booking.quantity} Ticket(s)</div>
                                    <div className="font-bold text-secondary-900 dark:text-secondary-100">Total: ${booking.totalPrice?.toFixed(2) || '0.00'}</div>
                                </div>

                            </div>

                            <div className="flex flex-row md:flex-col gap-2 shrink-0 md:justify-center">
                                {booking.status === 'confirmed' && (
                                    <>
                                        <button className="btn btn-outline flex-1 md:flex-none h-9 text-xs gap-1.5 dark:text-secondary-200">
                                            <Download className="w-3.5 h-3.5" /> PDF
                                        </button>
                                        <button 
                                            onClick={() => handleCancel(booking._id)}
                                            className="btn btn-ghost flex-1 md:flex-none h-9 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 gap-1.5"
                                        >
                                            <XCircle className="w-3.5 h-3.5" /> Cancel
                                        </button>
                                    </>
                                )}
                                <Link to={`/event/${booking.event._id}`} className="btn btn-ghost flex-1 md:flex-none h-9 text-xs border border-secondary-200 dark:border-secondary-700 dark:text-secondary-300">View Event</Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AttendeeDashboard;
