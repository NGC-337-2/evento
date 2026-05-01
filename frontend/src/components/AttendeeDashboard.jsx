import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getMyBookings, cancelBooking, resetBookingState } from '../features/bookings/bookingSlice';
import { getSavedEvents, resetUserState } from '../features/users/userSlice';
import { format } from 'date-fns';
import { Ticket, Calendar, MapPin, XCircle, Download, Bookmark } from 'lucide-react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { Tab, TabGroup, TabList, TabPanel, TabPanels, Dialog, DialogPanel, Transition } from '@headlessui/react';
import { useState, Fragment } from 'react';
import EventCard from './EventCard';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const AttendeeDashboard = () => {
    const dispatch = useDispatch();
    const [selectedTickets, setSelectedTickets] = useState(null);
    const [isTicketsModalOpen, setIsTicketsModalOpen] = useState(false);
    
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
                <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                    <div className="py-6 px-4 md:px-6 xl:px-7.5 border-b border-stroke dark:border-strokedark">
                        <h4 className="text-xl font-bold text-black dark:text-white">My Bookings</h4>
                    </div>
                    <ul role="list" className="divide-y divide-secondary-200 dark:divide-secondary-800">
                    {bookings.map(booking => (
                        <li key={booking._id} className="p-4 sm:p-6 transition-colors">
                            <div className="relative flex flex-col lg:flex-row border border-secondary-200 dark:border-secondary-700 rounded-3xl overflow-hidden bg-white dark:bg-secondary-900 shadow-sm group">
                                {/* Left: Event Info */}
                                <div className="flex-1 p-6 md:p-8 flex flex-col md:flex-row gap-6">
                                    <div className="w-full md:w-40 h-40 rounded-2xl overflow-hidden shrink-0 border border-secondary-100 dark:border-secondary-800 shadow-inner">
                                        <img 
                                            src={booking.event.image === 'no-photo.jpg' ? 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg' : booking.event.image} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                            alt={booking.event.title} 
                                        />
                                    </div>
                                    
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                                                    booking.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 
                                                    booking.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-400/10 dark:text-red-400' : 
                                                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-400/10 dark:text-yellow-500'
                                                }`}>
                                                    {booking.status}
                                                </span>
                                                <span className="text-xs text-secondary-500 dark:text-secondary-400 font-medium">Order #{booking._id.slice(-6).toUpperCase()}</span>
                                            </div>
                                            <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-4">{booking.event.title}</h3>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 text-sm text-secondary-600 dark:text-secondary-300">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-primary-600 dark:text-primary-400">
                                                        <Calendar className="w-4 h-4" />
                                                    </div>
                                                    <span className="font-medium">
                                                        {booking.event?.date ? format(new Date(booking.event.date), 'EEE, MMM d, yyyy • h:mm a') : 'No Date'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-primary-600 dark:text-primary-400">
                                                        <MapPin className="w-4 h-4" />
                                                    </div>
                                                    <span className="truncate font-medium">
                                                        {booking.event?.location?.city || 'Location TBD'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-primary-600 dark:text-primary-400">
                                                        <Ticket className="w-4 h-4" />
                                                    </div>
                                                    <span className="font-medium">{booking.quantity} x {booking.tickets?.[0]?.tierName || 'General Admission'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex flex-wrap items-center gap-4">
                                            <button 
                                                onClick={() => {
                                                    setSelectedTickets(booking);
                                                    setIsTicketsModalOpen(true);
                                                }}
                                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors shadow-md"
                                            >
                                                <Ticket className="w-4 h-4" />
                                                View {booking.quantity > 1 ? 'All' : ''} Tickets
                                            </button>
                                            <button 
                                                onClick={() => window.print()}
                                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-secondary-700 dark:text-secondary-200 bg-secondary-50 dark:bg-secondary-800 rounded-xl hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors border border-secondary-200 dark:border-secondary-700"
                                            >
                                                <Download className="w-4 h-4" />
                                                Print
                                            </button>
                                            {booking.status !== 'cancelled' && (
                                                <button 
                                                    onClick={() => handleCancel(booking._id)}
                                                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right: QR Stub */}
                                <div className="relative lg:w-64 bg-secondary-50 dark:bg-secondary-800/50 p-8 flex flex-col items-center justify-center border-t lg:border-t-0 lg:border-l-2 border-dashed border-secondary-200 dark:border-secondary-700">
                                    {/* Stub notches */}
                                    <div className="hidden lg:block absolute -left-3 top-0 bottom-0 py-4 flex flex-col justify-between">
                                        <div className="w-6 h-6 rounded-full bg-white dark:bg-secondary-900 -mt-3 shadow-inner" />
                                        <div className="w-6 h-6 rounded-full bg-white dark:bg-secondary-900 -mb-3 shadow-inner" />
                                    </div>

                                    {(['confirmed', 'booked', 'paid'].includes(booking.status)) ? (
                                        <div className="flex flex-col items-center">
                                            <div className="bg-white p-3 rounded-2xl shadow-xl ring-1 ring-secondary-900/5 group-hover:scale-105 transition-transform duration-300">
                                                <img 
                                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`ID: ${booking.ticketCodes?.[0] || booking._id}\nEvent: ${booking.event.title}\nDate: ${format(new Date(booking.event.date), 'yyyy-MM-dd')}\nTicket: ${booking.tickets?.[0]?.tierName || 'GA'}`)}&bgcolor=ffffff&color=000000`} 
                                                    alt="Ticket QR Code" 
                                                    className="w-32 h-32 md:w-40 md:h-40"
                                                    onError={(e) => {
                                                        e.target.src = 'https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg';
                                                    }}
                                                />
                                            </div>
                                            <div className="mt-4 text-center">
                                                <p className="text-[10px] font-mono font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-[0.2em] mb-1">Security Code</p>
                                                <p className="text-sm font-mono font-black text-secondary-900 dark:text-white">
                                                    {booking.ticketCodes?.[0]?.slice(0, 8).toUpperCase() || booking._id.slice(-8).toUpperCase()}
                                                </p>
                                            </div>
                                            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-[10px] font-bold uppercase tracking-wider">
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary-600 animate-pulse" />
                                                Ready to scan
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center opacity-50">
                                            <div className="p-4 rounded-full bg-secondary-100 dark:bg-secondary-800 inline-block mb-2">
                                                <XCircle className="w-8 h-8 text-secondary-400" />
                                            </div>
                                            <p className="text-xs font-bold text-secondary-500 uppercase tracking-widest">Invalid</p>
                                        </div>
                                    )}
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

            {/* View All Tickets Modal */}
            <Transition show={isTicketsModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={setIsTicketsModalOpen}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-secondary-900/80 backdrop-blur-sm transition-opacity" />
                    </Transition.Child>

                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <DialogPanel className="relative transform overflow-hidden rounded-3xl bg-white dark:bg-secondary-900 px-4 pb-4 pt-5 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-8">
                                    <div className="absolute right-0 top-0 pr-4 pt-4">
                                        <button
                                            type="button"
                                            className="rounded-full bg-secondary-100 dark:bg-secondary-800 p-2 text-secondary-400 hover:text-secondary-500 focus:outline-none"
                                            onClick={() => setIsTicketsModalOpen(false)}
                                        >
                                            <span className="sr-only">Close</span>
                                            <XCircle className="h-6 w-6" aria-hidden="true" />
                                        </button>
                                    </div>
                                    
                                    <div className="mb-8">
                                        <h3 className="text-2xl font-bold text-secondary-900 dark:text-white">Your Tickets</h3>
                                        <p className="text-secondary-500 dark:text-secondary-400 mt-1">{selectedTickets?.event.title}</p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                        {selectedTickets && (selectedTickets.ticketCodes?.length > 0 ? selectedTickets.ticketCodes : [selectedTickets._id]).map((code, idx) => (
                                            <div key={idx} className="flex flex-col items-center p-6 border-2 border-dashed border-secondary-200 dark:border-secondary-700 rounded-2xl bg-secondary-50 dark:bg-secondary-800/50">
                                                <div className="bg-white p-2 rounded-xl shadow-md mb-4">
                                                    <img 
                                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`Ticket: ${idx + 1}\nID: ${code || 'N/A'}\nEvent: ${selectedTickets.event.title}\nTier: ${selectedTickets.tickets?.[idx]?.tierName || 'GA'}`)}&bgcolor=ffffff&color=000000`} 
                                                        alt={`Ticket ${idx + 1}`}
                                                        className="w-32 h-32"
                                                        onError={(e) => {
                                                            e.target.src = 'https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg';
                                                        }}
                                                    />
                                                </div>
                                                <p className="text-[10px] font-mono font-bold text-secondary-500 uppercase tracking-widest mb-1">Ticket {idx + 1}</p>
                                                <p className="text-sm font-mono font-black text-secondary-900 dark:text-white uppercase tracking-wider">
                                                    {code ? code.slice(0, 12) : 'N/A'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-secondary-100 dark:border-secondary-800 flex justify-between items-center">
                                        <div className="text-xs text-secondary-500 dark:text-secondary-400">
                                            <p className="font-bold uppercase tracking-wider">Instructions</p>
                                            <p>Present this QR code at the entrance.</p>
                                        </div>
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-xl bg-secondary-100 dark:bg-secondary-800 px-6 py-3 text-sm font-bold text-secondary-900 dark:text-white hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors"
                                            onClick={() => setIsTicketsModalOpen(false)}
                                        >
                                            Done
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

export default AttendeeDashboard;
