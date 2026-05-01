import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getEventById } from '../features/events/eventsSlice';
import { toggleSaveEvent } from '../features/users/userSlice';
import axiosClient from '../api/axiosClient';
import {
  MapPin,
  Calendar,
  Users,
  Ticket as TicketIcon,
  Clock,
  Share2,
  Heart,
  ShieldCheck,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { event, isLoading, isError } = useSelector((state) => state.events);
  const { user } = useSelector((state) => state.auth);

  const [quantities, setQuantities] = useState({});
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    dispatch(getEventById(id));
  }, [id, dispatch]);

  const isSaved = user?.savedEvents?.includes(id);

  const handleToggleSave = () => {
    if (!user) {
      toast.info('Please login to save events');
      return;
    }
    dispatch(toggleSaveEvent(id));
    toast.success(isSaved ? 'Removed from saved events' : 'Event saved!');
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Event link copied to clipboard!');
  };

  if (isLoading || !event) {
    return <Spinner fullScreen />;
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">
            Error loading event details
          </h2>
          <button
            onClick={() => navigate('/explore')}
            className="mt-4 text-primary-600 hover:underline"
          >
            Return to Explore
          </button>
        </div>
      </div>
    );
  }

  const startDate = new Date(event.date);

  const handleQuantityChange = (tierId, amount) => {
    setQuantities((prev) => ({
      ...prev,
      [tierId]: Math.max(0, (prev[tierId] || 0) + amount),
    }));
  };

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/event/${id}` } });
      return;
    }

    const ticketsToBook = Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([tierId, qty]) => ({ tierId, quantity: qty }));

    if (ticketsToBook.length === 0) {
      toast.error('Please select at least one ticket.');
      return;
    }

    setIsBooking(true);
    try {
      const res = await axiosClient.post('/bookings', {
        eventId: id,
        tickets: ticketsToBook,
      });
      if (res.data.url) {
        window.location.href = res.data.url; // Redirect to Stripe
      } else {
        toast.success('Free booking successful!');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setIsBooking(false);
    }
  };

  const calculateSubtotal = () => {
    let total = 0;
    event.ticketTiers?.forEach((tier) => {
      total += (quantities[tier._id] || 0) * tier.price;
    });
    return total;
  };

  const subtotal = calculateSubtotal();

  return (
    <div className="bg-white dark:bg-secondary-900 min-h-screen pb-24">
      {/* Hero section */}
      <div className="relative h-[60vh] min-h-[500px] w-full">
        <img
          src={
            event.image === 'no-photo.jpg'
              ? 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
              : event.image
          }
          alt={event.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0 bg-secondary-900/40 mix-blend-multiply"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary-900 via-secondary-900/40" />

        {/* Navigation / Actions on Hero */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10 max-w-7xl mx-auto">
          <nav aria-label="Breadcrumb" className="hidden sm:block">
            <ol
              role="list"
              className="flex items-center space-x-2 text-sm font-medium text-white/80"
            >
              <li>
                <button
                  onClick={() => navigate('/')}
                  className="hover:text-white transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                  className="h-5 w-5 flex-shrink-0 text-white/50"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
              </li>
              <li>
                <button
                  onClick={() => navigate('/explore')}
                  className="hover:text-white transition-colors"
                >
                  Events
                </button>
              </li>
            </ol>
          </nav>

          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={handleShare}
              className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white transition-colors backdrop-blur-sm"
            >
              <span className="sr-only">Share</span>
              <Share2 className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleToggleSave}
              className={`rounded-full p-2 transition-colors backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                isSaved
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <span className="sr-only">Save event</span>
              <Heart
                className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-48 relative z-10">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-8 xl:gap-x-12">
          {/* Main content */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-xl ring-1 ring-secondary-900/5 dark:ring-white/10 p-8">
              <div className="mb-4 flex items-center">
                <span className="inline-flex items-center rounded-full bg-primary-50 dark:bg-primary-900/30 px-3 py-1 text-sm font-semibold text-primary-600 dark:text-primary-400 capitalize ring-1 ring-inset ring-primary-600/20 dark:ring-primary-500/30">
                  {event.category || 'General'}
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-secondary-900 dark:text-white sm:text-5xl mb-8">
                {event.title}
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8 border-b border-secondary-200 dark:border-secondary-700">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
                    <Calendar className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary-900 dark:text-white">
                      Date and Time
                    </h3>
                    <p className="mt-1 text-secondary-600 dark:text-secondary-400">
                      {format(startDate, 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p className="text-secondary-600 dark:text-secondary-400">
                      {format(startDate, 'h:mm a')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
                    <MapPin className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary-900 dark:text-white">
                      Location
                    </h3>
                    <p className="mt-1 text-secondary-600 dark:text-secondary-400">
                      {event.location?.address}
                    </p>
                    <p className="text-secondary-600 dark:text-secondary-400">
                      {event.location?.city}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <h2 className="text-2xl font-bold tracking-tight text-secondary-900 dark:text-white mb-4">
                  About this event
                </h2>
                <div className="prose prose-base dark:prose-invert max-w-none text-secondary-600 dark:text-secondary-400">
                  <p>{event.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar / Checkout */}
          <div className="mt-10 lg:col-span-5 xl:col-span-4 lg:mt-0">
            <div className="sticky top-24 rounded-2xl bg-white dark:bg-secondary-800 shadow-xl ring-1 ring-secondary-900/5 dark:ring-white/10 overflow-hidden">
              <div className="bg-secondary-50 dark:bg-secondary-900/50 px-6 py-6 border-b border-secondary-200 dark:border-secondary-700">
                <h2 className="text-lg font-bold text-secondary-900 dark:text-white">
                  Select Tickets
                </h2>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">
                  Secure your spot instantly.
                </p>
              </div>

              <div className="px-6 py-6">
                <ul
                  role="list"
                  className="-my-6 divide-y divide-secondary-200 dark:divide-secondary-700"
                >
                  {event.ticketTiers?.map((tier) => {
                    const remaining = tier.capacity - tier.sold;
                    const isSoldOut = remaining <= 0;

                    return (
                      <li key={tier._id} className="flex py-6">
                        <div className="flex flex-1 flex-col justify-center">
                          <div className="flex justify-between text-base font-medium text-secondary-900 dark:text-white">
                            <h3
                              className={
                                isSoldOut
                                  ? 'line-through text-secondary-500'
                                  : ''
                              }
                            >
                              {tier.name}
                            </h3>
                            <p className="ml-4">
                              {tier.price > 0
                                ? `$${tier.price.toFixed(2)}`
                                : 'Free'}
                            </p>
                          </div>
                          <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
                            {isSoldOut
                              ? 'Sold out'
                              : `${remaining} tickets remaining`}
                          </p>
                        </div>
                        <div className="ml-4 flex flex-1 flex-col justify-center items-end">
                          <div className="flex items-center rounded-md border border-secondary-300 dark:border-secondary-600 p-1 shadow-sm">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(tier._id, -1)}
                              disabled={!quantities[tier._id] || isSoldOut}
                              className="p-1.5 text-secondary-600 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-white disabled:opacity-50 transition-colors"
                            >
                              <span className="sr-only">Decrease</span>
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M19.5 12h-15"
                                />
                              </svg>
                            </button>
                            <span className="w-8 text-center text-sm font-semibold text-secondary-900 dark:text-white">
                              {quantities[tier._id] || 0}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(tier._id, 1)}
                              disabled={
                                (quantities[tier._id] || 0) >= remaining ||
                                isSoldOut
                              }
                              className="p-1.5 text-secondary-600 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-white disabled:opacity-50 transition-colors"
                            >
                              <span className="sr-only">Increase</span>
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 4.5v15m7.5-7.5h-15"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {subtotal > 0 && (
                <div className="border-t border-secondary-200 dark:border-secondary-700 px-6 py-4 bg-secondary-50 dark:bg-secondary-900/20">
                  <div className="flex justify-between text-base font-medium text-secondary-900 dark:text-white">
                    <p>Subtotal</p>
                    <p>${subtotal.toFixed(2)}</p>
                  </div>
                </div>
              )}

              <div className="border-t border-secondary-200 dark:border-secondary-700 px-6 py-6">
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={
                    isBooking ||
                    Object.values(quantities).reduce((a, b) => a + b, 0) === 0
                  }
                  className="flex w-full items-center justify-center rounded-md border border-transparent bg-primary-600 px-6 py-4 text-base font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isBooking ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShieldCheck
                        className="mr-2 h-5 w-5"
                        aria-hidden="true"
                      />
                      Secure Checkout
                    </>
                  )}
                </button>
                <div className="mt-4 flex justify-center text-center text-sm text-secondary-500">
                  <p>
                    or{' '}
                    <button
                      type="button"
                      className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
                      onClick={() => navigate('/explore')}
                    >
                      Continue browsing
                      <span aria-hidden="true"> &rarr;</span>
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
