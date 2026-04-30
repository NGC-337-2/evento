import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getEventById } from '../features/events/eventsSlice';
import axiosClient from '../api/axiosClient';
import { MapPin, Calendar, Users, Ticket as TicketIcon, Clock, Share2, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

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

  if (isLoading || !event) {
    return <div className="container mx-auto px-4 py-12 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  if (isError) {
    return <div className="container mx-auto px-4 py-12 text-center text-red-500">Error loading event details</div>;
  }

  const startDate = new Date(event.date.start);
  const endDate = new Date(event.date.end);

  const handleQuantityChange = (tierId, amount) => {
      setQuantities(prev => ({
          ...prev,
          [tierId]: Math.max(0, (prev[tierId] || 0) + amount)
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
          toast.error("Please select at least one ticket.");
          return;
      }

      setIsBooking(true);
      try {
          const res = await axiosClient.post('/bookings', { eventId: id, tickets: ticketsToBook });
          if (res.data.url) {
              window.location.href = res.data.url; // Redirect to Stripe
          } else {
              toast.success("Free booking successful!");
              navigate('/dashboard');
          }
      } catch (err) {
          toast.error(err.response?.data?.message || "Booking failed");
      } finally {
          setIsBooking(false);
      }
  };

  return (
    <div className="bg-secondary-50 dark:bg-secondary-900 pb-20">
        {/* Hero Section */}
        <div className="w-full h-[50vh] min-h-[400px] relative bg-secondary-900">
            <img 
              src={event.image === 'no-photo.jpg' ? 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg' : event.image} 
              alt={event.title}
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-secondary-900 via-transparent to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 -mt-32 relative z-10 hidden sm:block">
             <div className="inline-flex gap-2">
                 <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-3 rounded-full transition-colors"><Share2 className="w-5 h-5" /></button>
                 <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-3 rounded-full transition-colors"><Heart className="w-5 h-5" /></button>
             </div>
        </div>

        <div className="container mx-auto px-4 mt-6">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Main Content */}
                <div className="flex-1 space-y-8">
                    <div className="bg-white dark:bg-secondary-800 rounded-2xl p-6 md:p-8 shadow-sm border border-secondary-200 dark:border-secondary-700">
                         <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-semibold rounded-full uppercase tracking-wider">{event.category}</span>
                         </div>
                         <h1 className="text-3xl md:text-5xl font-extrabold text-secondary-900 dark:text-white mb-6 leading-tight uppercase tracking-tight">{event.title}</h1>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-secondary-600 dark:text-secondary-400 font-medium">
                            <div className="flex gap-4 items-start">
                                <div className="bg-secondary-100 dark:bg-secondary-900 p-3 rounded-xl"><Calendar className="w-6 h-6 text-primary-500" /></div>
                                <div>
                                    <p className="text-secondary-900 dark:text-white font-bold text-base mb-1">{format(startDate, 'EEEE, MMMM d, yyyy')}</p>
                                    <p>{format(startDate, 'h:mm a')} - {format(endDate, 'h:mm a')}</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="bg-secondary-100 dark:bg-secondary-900 p-3 rounded-xl"><MapPin className="w-6 h-6 text-primary-500" /></div>
                                <div>
                                    <p className="text-secondary-900 dark:text-white font-bold text-base mb-1">{event.location?.address}</p>
                                    <p>{event.location?.city}</p>
                                </div>
                            </div>
                         </div>
                    </div>

                    <div className="bg-white dark:bg-secondary-800 rounded-2xl p-6 md:p-8 shadow-sm border border-secondary-200 dark:border-secondary-700">
                        <h2 className="text-2xl font-bold text-secondary-900 dark:text-white mb-4">About this event</h2>
                        <div className="prose dark:prose-invert max-w-none text-secondary-600 dark:text-secondary-400">
                            {event.description}
                        </div>
                    </div>
                </div>

                {/* Sidebar Checkout */}
                <div className="lg:w-[400px] shrink-0">
                    <div className="sticky top-24 bg-white dark:bg-secondary-800 rounded-2xl shadow-lg border border-secondary-200 dark:border-secondary-700 overflow-hidden">
                        <div className="p-6 bg-secondary-900 text-white">
                            <h3 className="text-xl font-bold mb-1">Select Tickets</h3>
                            <p className="text-secondary-400 text-sm">Secure your spot instantly.</p>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            {event.ticketTiers?.map(tier => (
                                <div key={tier._id} className="flex items-center justify-between p-4 border border-secondary-200 dark:border-secondary-700 rounded-xl">
                                    <div>
                                        <h4 className="font-bold text-secondary-900 dark:text-white text-lg">{tier.name}</h4>
                                        <p className="text-primary-600 dark:text-primary-400 font-semibold">{tier.price > 0 ? `$${tier.price}` : 'Free'}</p>
                                        <p className="text-xs text-secondary-500 mt-1">{tier.capacity - tier.sold} remaining</p>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={() => handleQuantityChange(tier._id, -1)}
                                            className="w-8 h-8 rounded-full border border-secondary-300 dark:border-secondary-600 flex items-center justify-center text-secondary-600 hover:bg-secondary-100 dark:text-secondary-300 dark:hover:bg-secondary-700 disabled:opacity-50"
                                            disabled={!quantities[tier._id]}
                                        >-</button>
                                        <span className="w-4 text-center font-bold text-secondary-900 dark:text-white">{quantities[tier._id] || 0}</span>
                                        <button 
                                            onClick={() => handleQuantityChange(tier._id, 1)}
                                            className="w-8 h-8 rounded-full border border-secondary-300 dark:border-secondary-600 flex items-center justify-center text-secondary-600 hover:bg-secondary-100 dark:text-secondary-300 dark:hover:bg-secondary-700 disabled:opacity-50"
                                            disabled={(quantities[tier._id] || 0) >= (tier.capacity - tier.sold)}
                                        >+</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="p-6 border-t border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-900/50">
                            <button 
                                onClick={handleCheckout} 
                                disabled={isBooking || Object.values(quantities).reduce((a,b)=>a+b,0) === 0}
                                className="btn btn-primary w-full h-14 text-base tracking-wider uppercase"
                            >
                                {isBooking ? 'Processing...' : 'Checkout'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default EventDetailPage;
