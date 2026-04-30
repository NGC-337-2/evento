import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getEvents, setFilters } from '../features/events/eventsSlice';
import EventCard from '../components/EventCard';
import { Search, Filter } from 'lucide-react';

const EVENT_CATEGORIES = [
  'music', 'sports', 'technology', 'arts', 'business', 'food', 
  'health', 'education', 'comedy', 'film', 'fashion', 'charity', 
  'networking', 'other'
];

const ExplorePage = () => {
  const dispatch = useDispatch();
  const { events, isLoading, pagination, filters } = useSelector((state) => state.events);

  useEffect(() => {
    dispatch(getEvents({ 
        page: pagination.page, 
        limit: pagination.limit, 
        keyword: filters.keyword,
        category: filters.category,
        sortBy: filters.sortBy
    }));
  }, [dispatch, pagination.page, filters]);

  const handleSearchChange = (e) => {
    dispatch(setFilters({ keyword: e.target.value }));
  };

  const handleCategorySelect = (category) => {
    dispatch(setFilters({ category: filters.category === category ? '' : category }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-8 p-6 bg-white dark:bg-secondary-800 rounded-2xl border border-secondary-200 dark:border-secondary-700 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400" />
          <input 
            type="text" 
            placeholder="Search events by name or location..." 
            className="input-field pl-10 h-12 text-base rounded-xl bg-secondary-50 dark:bg-secondary-900 border-none focus:ring-2 focus:ring-primary-500"
            value={filters.keyword}
            onChange={handleSearchChange}
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
            <button className="btn btn-outline h-12 px-6 flex-1 md:flex-none gap-2 rounded-xl border-secondary-200 dark:border-secondary-700 dark:text-secondary-300">
                <Filter className="h-4 w-4" /> Filters
            </button>
            <select 
                className="input-field h-12 flex-1 md:flex-none rounded-xl border-secondary-200 dark:border-secondary-700 dark:bg-secondary-900 dark:text-secondary-300"
                value={filters.sortBy}
                onChange={(e) => dispatch(setFilters({ sortBy: e.target.value }))}
            >
                <option value="dateAsc">Upcoming</option>
                <option value="newest">Newly Added</option>
            </select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Categories Sidebar */}
        <aside className="lg:w-64 shrink-0 hidden lg:block">
            <h3 className="text-sm font-bold text-secondary-900 dark:text-white uppercase tracking-widest mb-4">Categories</h3>
            <ul className="space-y-1">
                <li 
                    className={`px-3 py-2 rounded-md text-sm cursor-pointer transition-colors ${!filters.category ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 font-semibold' : 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800'}`}
                    onClick={() => dispatch(setFilters({ category: '' }))}
                >
                    All Categories
                </li>
                {EVENT_CATEGORIES.map(cat => (
                    <li 
                        key={cat}
                        className={`px-3 py-2 rounded-md text-sm cursor-pointer capitalize transition-colors ${filters.category === cat ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 font-semibold' : 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800'}`}
                        onClick={() => handleCategorySelect(cat)}
                    >
                        {cat}
                    </li>
                ))}
            </ul>
        </aside>

        {/* Grid */}
        <div className="flex-1">
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1,2,3,4,5,6].map(i => (
                        <div key={i} className="card h-[340px] animate-pulse bg-secondary-100 dark:bg-secondary-800 border-none"></div>
                    ))}
                </div>
            ) : events.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-secondary-800 rounded-2xl border border-secondary-200 dark:border-secondary-700">
                    <h3 className="text-xl font-bold text-secondary-900 dark:text-white mb-2">No events found</h3>
                    <p className="text-secondary-500 dark:text-secondary-400">Try adjusting your search criteria</p>
                    <button onClick={() => dispatch(setFilters({ keyword: '', category: '' }))} className="btn btn-primary mt-6">Clear All Filters</button>
                </div>
            ) : (
                <>
                    <h2 className="text-xl font-bold text-secondary-900 dark:text-white mb-6 uppercase tracking-tight">Events Near You</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {events.map((event) => (
                            <EventCard key={event._id} event={event} />
                        ))}
                    </div>
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;
