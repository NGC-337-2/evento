import { Link } from 'react-router-dom';
import { MapPin, Calendar as CalendarIcon, Bookmark } from 'lucide-react';
import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSaveEvent } from '../features/users/userSlice';
import { toast } from 'react-toastify';

const EventCard = ({ event }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Find minimum price from tiers
  let minPrice = 0;

  if (event.ticketTiers && event.ticketTiers.length > 0) {
    const prices = event.ticketTiers.map((t) => t.price);
    minPrice = Math.min(...prices);
  }

  const startDate = new Date(event.date);

  const isSaved = user?.savedEvents?.includes(event._id);

  const handleToggleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.info('Please login to save events');
      return;
    }
    dispatch(toggleSaveEvent(event._id));
  };

  return (
    <Link
      to={`/event/${event._id}`}
      className="group relative flex flex-col bg-white dark:bg-secondary-800 rounded-2xl ring-1 ring-secondary-200 dark:ring-secondary-700 sm:p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden sm:overflow-visible"
    >
      <div className="relative aspect-[3/2] sm:aspect-[2/1] lg:aspect-[3/2] overflow-hidden sm:rounded-xl">
        <img
          src={
            event.image === 'no-photo.jpg'
              ? 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
              : event.image
          }
          alt={event.title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary-900/40 to-secondary-900/0" />

        {/* Date Badge */}
        <div className="absolute top-3 left-3 bg-white/95 dark:bg-secondary-900/95 backdrop-blur-sm px-2.5 py-1.5 rounded-lg shadow-sm border border-secondary-200/50 dark:border-secondary-700/50">
          <div className="flex flex-col items-center justify-center text-primary-600 dark:text-primary-400">
            <span className="text-xs font-bold uppercase tracking-widest">
              {format(startDate, 'MMM')}
            </span>
            <span className="text-lg font-black leading-none mt-0.5">
              {format(startDate, 'dd')}
            </span>
          </div>
        </div>

        {/* Category Chip */}
        {event.category && (
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center rounded-full bg-white/90 dark:bg-secondary-900/90 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-secondary-900 dark:text-secondary-100 shadow-sm border border-secondary-200/50 dark:border-secondary-700/50 capitalize">
              {event.category}
            </span>
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleToggleSave}
          aria-label={isSaved ? 'Remove from saved events' : 'Save event'}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all border border-transparent ${
            isSaved
              ? 'bg-primary-600/90 text-white shadow-md border-primary-500/50 hover:bg-primary-600'
              : 'bg-secondary-900/20 text-white hover:bg-secondary-900/40 hover:border-white/20'
          }`}
        >
          <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-0 sm:pt-4">
        <h3 className="text-lg font-bold text-secondary-900 dark:text-white line-clamp-2 uppercase tracking-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          <span aria-hidden="true" className="absolute inset-0" />
          {event.title}
        </h3>

        <div className="mt-3 flex flex-col gap-2 text-sm text-secondary-600 dark:text-secondary-400">
          <div className="flex items-center gap-2">
            <CalendarIcon
              className="h-4 w-4 shrink-0 text-secondary-400 dark:text-secondary-500"
              aria-hidden="true"
            />
            <span className="truncate">
              {format(startDate, 'EEEE, h:mm a')}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin
              className="h-4 w-4 shrink-0 mt-0.5 text-secondary-400 dark:text-secondary-500"
              aria-hidden="true"
            />
            <span className="line-clamp-1">
              {event.location?.city || event.location?.address}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-secondary-100 dark:border-secondary-700 flex items-center justify-between mt-auto relative z-10">
          <div className="flex flex-col">
            <span className="text-[10px] text-secondary-500 dark:text-secondary-400 uppercase tracking-widest font-semibold mb-0.5">
              Tickets from
            </span>
            <span className="text-base font-bold text-secondary-900 dark:text-white">
              {minPrice > 0 ? `$${minPrice.toFixed(2)}` : 'Free'}
            </span>
          </div>
          <span className="inline-flex items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 text-xs font-semibold text-primary-700 dark:text-primary-400 ring-1 ring-inset ring-primary-600/20 dark:ring-primary-500/30 group-hover:bg-primary-600 group-hover:text-white group-hover:ring-primary-600 transition-all">
            Get Tickets
          </span>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
