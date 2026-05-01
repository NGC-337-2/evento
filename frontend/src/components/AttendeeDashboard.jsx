import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getMyBookings, cancelBooking, resetBookingState } from '../features/bookings/bookingSlice';
import { getSavedEvents, resetUserState } from '../features/users/userSlice';
import { format } from 'date-fns';
import { Ticket, Calendar, MapPin, XCircle, Download, Bookmark } from 'lucide-react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import EventCard from './EventCard';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const AttendeeDashboard = () => {
    const dispatch = useDispatch();
    
    const { bookings, isLoading: bookingsLoading, isError: bookingsError, message: bookingsMessage } = useSelector((state) => state.bookings);
    const { savedEvents, isLoading: usersLoading, isError: usersError, message: usersMessage } = useSelector((state) => state.users);

    const isLoading = bookingsLoading || usersLoading;

    useEffect(() => {
        dispatch(getMyBookings());
        dispatch(getSavedEvents());
    }, [dispatch]);

    useEffect(() => {
        if (bookingsError) toast.error(bookingsMessage);
        if (usersError) toast.error(usersMessage);
        
        return () => {
            dispatch(resetBookingState());
            dispatch(resetUserState());
        };
    }, [bookingsError, usersError, bookingsMessage, usersMessage, dispatch]);

    const handleCancel = (id) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;
        dispatch(cancelBooking(id));
    };

    const renderBookings = () => (
        <div className="mt-6 space-y-6">
            {bookings.length === 0 ? (
                <div className="text-center rounded-2xl border-2 border-dashed border-secondary-300 dark:border-secondary-700 p-12">
                  <Ticket className="mx-auto h-12 w-12 text-secondary-400" aria-hidden="true" />
                  <h3 className="mt-2 text-sm font-semibold text-secondary-900 dark:text-white">No bookings found</h3>
                  <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
                    You haven't booked any events yet. Get out there and explore!
                  </p>
                  <div className="mt-6">
                    <Link
                      to="/explore"
                      className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                    >
                      Explore Events
                    </Link>
                  </div>
                </div>
            ) : (
                <div className="overflow-hidden bg-white dark:bg-secondary-800 shadow sm:rounded-md ring-1 ring-secondary-200 dark:ring-secondary-700">
                    <ul role="list" className="divide-y divide-secondary-200 dark:divide-secondary-700">
                    {bookings.map(booking => (
                        <li key={booking._id} className="p-4 sm:p-6 flex flex-col md:flex-row gap-6 hover:bg-secondary-50 dark:hover:bg-secondary-700/50 transition-colors">
                            <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden shrink-0 border border-secondary-200 dark:border-secondary-700 shadow-sm relative">
                                <img src={booking.event.image === 'no-photo.jpg' ? 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg' : booking.event.image} className="w-full h-full object-cover" alt={booking.event.title} />
                                <div className="absolute inset-0 bg-gradient-to-t from-secondary-900/60 to-transparent" />
                                <div className="absolute bottom-2 left-2 right-2">
                                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                                        booking.status === 'confirmed' ? 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20' : 
                                        booking.status === 'cancelled' ? 'bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-400/10 dark:text-red-400 dark:ring-red-400/20' : 
                                        'bg-yellow-50 text-yellow-800 ring-yellow-600/20 dark:bg-yellow-400/10 dark:text-yellow-500 dark:ring-yellow-400/20'
                                    }`}>
                                        {booking.status}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-secondary-900 dark:text-white line-clamp-1">{booking.event.title}</h3>
                                    
                                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-secondary-600 dark:text-secondary-400">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-secondary-400 dark:text-secondary-500" /> 
                                            {booking.event?.date ? format(new Date(booking.event.date), 'MMM d, yyyy • h:mm a') : 'No Date'}
                                        </div>
                                        <div className="flex items-center gap-2 truncate">
                                            <MapPin className="w-4 h-4 text-secondary-400 dark:text-secondary-500" /> 
                                            {booking.event?.location?.city || 'Location TBD'}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Ticket className="w-4 h-4 text-secondary-400 dark:text-secondary-500" /> 
                                            {booking.quantity} Ticket(s)
                                        </div>
                                        <div className="font-semibold text-secondary-900 dark:text-secondary-200">
                                            Total: ${booking.totalPrice?.toFixed(2) || '0.00'}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-3">
                                    {booking.status === 'confirmed' && (
                                        <>
                                            <button className="inline-flex items-center gap-x-1.5 rounded-md bg-white dark:bg-secondary-800 px-3 py-2 text-sm font-semibold text-secondary-900 dark:text-white shadow-sm ring-1 ring-inset ring-secondary-300 dark:ring-secondary-600 hover:bg-secondary-50 dark:hover:bg-secondary-700">
                                                <Download className="-ml-0.5 h-4 w-4" aria-hidden="true" />
                                                PDF Ticket
                                            </button>
                                            <button 
                                                onClick={() => handleCancel(booking._id)}
                                                className="inline-flex items-center gap-x-1.5 rounded-md bg-white dark:bg-secondary-800 px-3 py-2 text-sm font-semibold text-red-600 dark:text-red-400 shadow-sm ring-1 ring-inset ring-secondary-300 dark:ring-secondary-600 hover:bg-red-50 dark:hover:bg-secondary-700"
                                            >
                                                <XCircle className="-ml-0.5 h-4 w-4" aria-hidden="true" />
                                                Cancel
                                            </button>
                                        </>
                                    )}
                                    <Link 
                                        to={`/event/${booking.event._id}`} 
                                        className="inline-flex items-center gap-x-1.5 rounded-md bg-white dark:bg-secondary-800 px-3 py-2 text-sm font-semibold text-secondary-900 dark:text-white shadow-sm ring-1 ring-inset ring-secondary-300 dark:ring-secondary-600 hover:bg-secondary-50 dark:hover:bg-secondary-700"
                                    >
                                        View Event
                                    </Link>
                                </div>
                            </div>
                        </li>
                    ))}
                    </ul>
                </div>
            )}
        </div>
    );

    const renderSavedEvents = () => (
        <div className="mt-6 space-y-6">
            {savedEvents.length === 0 ? (
                <div className="text-center rounded-2xl border-2 border-dashed border-secondary-300 dark:border-secondary-700 p-12">
                  <Bookmark className="mx-auto h-12 w-12 text-secondary-400" aria-hidden="true" />
                  <h3 className="mt-2 text-sm font-semibold text-secondary-900 dark:text-white">No saved events</h3>
                  <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
                    You haven't saved any events yet. Find some you like and save them for later!
                  </p>
                  <div className="mt-6">
                    <Link
                      to="/explore"
                      className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                    >
                      Find Events
                    </Link>
                  </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedEvents.map(event => (
                        <EventCard key={event._id} event={event} />
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-8">
            <TabGroup>
              <div className="border-b border-secondary-200 dark:border-secondary-700">
                <TabList className="-mb-px flex space-x-8" aria-label="Tabs">
                  <Tab
                    className={({ selected }) =>
                      classNames(
                        selected
                          ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
                          : 'border-transparent text-secondary-500 hover:border-secondary-300 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-300',
                        'group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium focus:outline-none transition-colors'
                      )
                    }
                  >
                    {({ selected }) => (
                      <>
                        <Ticket
                          className={classNames(
                            selected ? 'text-primary-600 dark:text-primary-400' : 'text-secondary-400 group-hover:text-secondary-500 dark:text-secondary-500 dark:group-hover:text-secondary-400',
                            '-ml-0.5 mr-2 h-5 w-5'
                          )}
                          aria-hidden="true"
                        />
                        <span>My Bookings</span>
                      </>
                    )}
                  </Tab>
                  <Tab
                    className={({ selected }) =>
                      classNames(
                        selected
                          ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
                          : 'border-transparent text-secondary-500 hover:border-secondary-300 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-300',
                        'group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium focus:outline-none transition-colors'
                      )
                    }
                  >
                    {({ selected }) => (
                      <>
                        <Bookmark
                          className={classNames(
                            selected ? 'text-primary-600 dark:text-primary-400' : 'text-secondary-400 group-hover:text-secondary-500 dark:text-secondary-500 dark:group-hover:text-secondary-400',
                            '-ml-0.5 mr-2 h-5 w-5'
                          )}
                          aria-hidden="true"
                        />
                        <span>Saved Events</span>
                      </>
                    )}
                  </Tab>
                </TabList>
              </div>
              <TabPanels>
                <TabPanel>
                   {isLoading ? (
                      <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                      </div>
                   ) : renderBookings()}
                </TabPanel>
                <TabPanel>
                    {isLoading ? (
                      <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                      </div>
                   ) : renderSavedEvents()}
                </TabPanel>
              </TabPanels>
            </TabGroup>
        </div>
    );
};

export default AttendeeDashboard;
