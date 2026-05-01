import { useEffect, useState, Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getEvents, setFilters } from '../features/events/eventsSlice';
import EventCard from '../components/EventCard';
import { Skeleton } from '../components/Spinner';
import { Search, Filter, ChevronDown, X } from 'lucide-react';
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
  Dialog,
} from '@headlessui/react';

const EVENT_CATEGORIES = [
  'music',
  'sports',
  'technology',
  'arts',
  'business',
  'food',
  'health',
  'education',
  'comedy',
  'film',
  'fashion',
  'charity',
  'networking',
  'other',
];

const ExplorePage = () => {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const dispatch = useDispatch();
  const { events, isLoading, pagination, filters } = useSelector(
    (state) => state.events
  );

  useEffect(() => {
    dispatch(
      getEvents({
        page: pagination.page,
        limit: pagination.limit,
        keyword: filters.keyword,
        category: filters.category,
        sortBy: filters.sortBy,
      })
    );
  }, [dispatch, pagination.page, filters]);

  const handleSearchChange = (e) => {
    dispatch(setFilters({ keyword: e.target.value }));
  };

  const handleCategorySelect = (category) => {
    dispatch(
      setFilters({ category: filters.category === category ? '' : category })
    );
  };

  const sortByOptions = [
    { name: 'Upcoming', value: 'dateAsc' },
    { name: 'Newly Added', value: 'newest' },
  ];

  const currentSortName =
    sortByOptions.find((opt) => opt.value === filters.sortBy)?.name ||
    'Upcoming';

  return (
    <div className="bg-white dark:bg-secondary-900 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-baseline justify-between border-b border-secondary-200 dark:border-secondary-800 pb-6 pt-6">
          <h1 className="text-4xl font-bold tracking-tight text-secondary-900 dark:text-white">
            Discover Events
          </h1>

          <div className="flex items-center">
            <Menu as="div" className="relative inline-block text-left">
              <div>
                <MenuButton className="group inline-flex justify-center text-sm font-medium text-secondary-700 dark:text-secondary-300 hover:text-secondary-900 dark:hover:text-white">
                  Sort by: {currentSortName}
                  <ChevronDown
                    className="-mr-1 ml-1 h-5 w-5 shrink-0 text-secondary-400 group-hover:text-secondary-500 dark:group-hover:text-secondary-300"
                    aria-hidden="true"
                  />
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
                <MenuItems className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white dark:bg-secondary-800 shadow-2xl ring-1 ring-black ring-opacity-5 dark:ring-white/10 focus:outline-none">
                  <div className="py-1">
                    {sortByOptions.map((option) => (
                      <MenuItem key={option.name}>
                        {({ focus }) => (
                          <button
                            onClick={() =>
                              dispatch(setFilters({ sortBy: option.value }))
                            }
                            className={`
                              ${focus ? 'bg-secondary-100 dark:bg-secondary-700' : ''}
                              ${option.value === filters.sortBy ? 'font-medium text-secondary-900 dark:text-white' : 'text-secondary-500 dark:text-secondary-400'}
                              block w-full text-left px-4 py-2 text-sm
                            `}
                          >
                            {option.name}
                          </button>
                        )}
                      </MenuItem>
                    ))}
                  </div>
                </MenuItems>
              </Transition>
            </Menu>

            <button
              type="button"
              className="-m-2 ml-4 p-2 text-secondary-400 hover:text-secondary-500 sm:ml-6 lg:hidden"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <span className="sr-only">Filters</span>
              <Filter className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Mobile Filters Dialog */}
        <Transition show={mobileFiltersOpen} as={Fragment}>
          <Dialog
            className="relative z-50 lg:hidden"
            onClose={setMobileFiltersOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
            </Transition.Child>

            <div className="fixed inset-0 z-40 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white dark:bg-secondary-900 py-4 pb-12 shadow-xl">
                  <div className="flex items-center justify-between px-4">
                    <h2 className="text-lg font-medium text-secondary-900 dark:text-white">
                      Filters
                    </h2>
                    <button
                      type="button"
                      className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md bg-white dark:bg-secondary-800 p-2 text-secondary-400"
                      onClick={() => setMobileFiltersOpen(false)}
                    >
                      <span className="sr-only">Close menu</span>
                      <X className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>

                  {/* Filters */}
                  <div className="mt-4 px-4 space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-secondary-900 dark:text-white mb-4">
                        Search
                      </h3>
                      <div className="relative">
                        <Search
                          className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-secondary-400 pl-3"
                          aria-hidden="true"
                        />
                        <input
                          type="text"
                          className="block w-full rounded-md border-0 py-2 pl-10 text-secondary-900 dark:text-white dark:bg-secondary-800 shadow-sm ring-1 ring-inset ring-secondary-300 dark:ring-secondary-700 placeholder:text-secondary-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm"
                          placeholder="Search events..."
                          value={filters.keyword}
                          onChange={handleSearchChange}
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-secondary-900 dark:text-white mb-4">
                        Category
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <input
                            id="mobile-category-all"
                            name="mobile-category"
                            type="radio"
                            checked={!filters.category}
                            onChange={() => {
                              dispatch(setFilters({ category: '' }));
                              setMobileFiltersOpen(false);
                            }}
                            className="h-4 w-4 border-secondary-300 text-primary-600 focus:ring-primary-600"
                          />
                          <label
                            htmlFor="mobile-category-all"
                            className="ml-3 text-sm text-secondary-600 dark:text-secondary-400"
                          >
                            All Categories
                          </label>
                        </div>
                        {EVENT_CATEGORIES.map((category) => (
                          <div key={category} className="flex items-center">
                            <input
                              id={`mobile-category-${category}`}
                              name="mobile-category"
                              type="radio"
                              checked={filters.category === category}
                              onChange={() => {
                                handleCategorySelect(category);
                                setMobileFiltersOpen(false);
                              }}
                              className="h-4 w-4 border-secondary-300 text-primary-600 focus:ring-primary-600"
                            />
                            <label
                              htmlFor={`mobile-category-${category}`}
                              className="ml-3 text-sm text-secondary-600 dark:text-secondary-400 capitalize"
                            >
                              {category}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>

        <section aria-labelledby="products-heading" className="pb-24 pt-6">
          <h2 id="products-heading" className="sr-only">
            Events
          </h2>

          <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
            {/* Filters */}
            <div className="hidden lg:block">
              <div className="space-y-6">
                <div>
                  <div className="relative">
                    <Search
                      className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-secondary-400 pl-3"
                      aria-hidden="true"
                    />
                    <input
                      type="text"
                      name="search"
                      id="search"
                      className="block w-full rounded-md border-0 py-2 pl-10 text-secondary-900 dark:text-white dark:bg-secondary-800 shadow-sm ring-1 ring-inset ring-secondary-300 dark:ring-secondary-700 placeholder:text-secondary-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                      placeholder="Search events..."
                      value={filters.keyword}
                      onChange={handleSearchChange}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-secondary-900 dark:text-white mb-4">
                    Category
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        id="category-all"
                        name="category"
                        type="radio"
                        checked={!filters.category}
                        onChange={() => dispatch(setFilters({ category: '' }))}
                        className="h-4 w-4 border-secondary-300 dark:border-secondary-600 dark:bg-secondary-800 text-primary-600 focus:ring-primary-600"
                      />
                      <label
                        htmlFor="category-all"
                        className="ml-3 text-sm text-secondary-600 dark:text-secondary-400"
                      >
                        All Categories
                      </label>
                    </div>
                    {EVENT_CATEGORIES.map((category) => (
                      <div key={category} className="flex items-center">
                        <input
                          id={`category-${category}`}
                          name="category"
                          type="radio"
                          checked={filters.category === category}
                          onChange={() => handleCategorySelect(category)}
                          className="h-4 w-4 border-secondary-300 dark:border-secondary-600 dark:bg-secondary-800 text-primary-600 focus:ring-primary-600"
                        />
                        <label
                          htmlFor={`category-${category}`}
                          className="ml-3 text-sm text-secondary-600 dark:text-secondary-400 capitalize"
                        >
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Product grid */}
            <div className="lg:col-span-3">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex flex-col gap-4">
                      <Skeleton className="h-48 w-full" />
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-10 w-full mt-4" />
                    </div>
                  ))}
                </div>
              ) : events.length === 0 ? (
                <div className="text-center rounded-2xl border-2 border-dashed border-secondary-300 dark:border-secondary-700 p-12">
                  <svg
                    className="mx-auto h-12 w-12 text-secondary-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      vectorEffect="non-scaling-stroke"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-semibold text-secondary-900 dark:text-white">
                    No events found
                  </h3>
                  <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
                    Try adjusting your search or filters to find what you're
                    looking for.
                  </p>
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() =>
                        dispatch(setFilters({ keyword: '', category: '' }))
                      }
                      className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                    >
                      Clear all filters
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <EventCard key={event._id} event={event} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ExplorePage;
