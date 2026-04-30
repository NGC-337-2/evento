import { Link } from 'react-router-dom';
import { MapPin, Calendar as CalendarIcon, Ticket } from 'lucide-react';
import { format } from 'date-fns';

const EventCard = ({ event }) => {
  // Find minimum price from tiers
  let minPrice = 0;
  let hasFree = false;
  
  if (event.ticketTiers && event.ticketTiers.length > 0) {
      const prices = event.ticketTiers.map(t => t.price);
      minPrice = Math.min(...prices);
      hasFree = prices.includes(0);
  }

  const startDate = new Date(event.date.start);
  
  return (
    <Link to={`/event/${event._id}`} className="card overflow-hidden hover:shadow-md transition-shadow group dark:bg-secondary-800 dark:border-secondary-700 block">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={event.image === 'no-photo.jpg' ? 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg' : event.image} 
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 bg-white/90 dark:bg-secondary-900/90 backdrop-blur-sm px-3 py-1.5 rounded-md shadow-sm">
            <div className="text-primary-600 dark:text-primary-400 font-bold text-center leading-tight">
                <span className="block text-xl uppercase tracking-tighter">{format(startDate, 'MMM')}</span>
                <span className="block font-black text-2xl">{format(startDate, 'dd')}</span>
            </div>
        </div>
      </div>
      <div className="p-5 flex flex-col h-[calc(100%-12rem)]">
        <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-bold text-lg text-secondary-900 dark:text-white line-clamp-2 uppercase tracking-tight">{event.title}</h3>
        </div>
        
        <div className="space-y-2 mb-4 text-sm text-secondary-600 dark:text-secondary-400 flex-grow">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 shrink-0" />
            <span className="truncate">{format(startDate, 'EEEE, h:mm a')}</span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{event.location?.city || event.location?.address}</span>
          </div>
        </div>
        
        <div className="pt-4 border-t border-secondary-100 dark:border-secondary-700 flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-xs text-secondary-500 uppercase tracking-wider font-medium mb-0.5">Tickets from</span>
            <span className="font-bold text-secondary-900 dark:text-white">
                {minPrice > 0 ? `$${minPrice.toFixed(2)}` : 'Free'}
            </span>
          </div>
          <div className="btn btn-primary h-8 px-4 py-0 text-xs gap-1.5 font-semibold uppercase tracking-wider">
             <Ticket className="h-3.5 w-3.5" />
             Get Tickets
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
