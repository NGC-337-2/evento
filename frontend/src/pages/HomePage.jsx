import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="container mx-auto px-4 py-12 flex-grow flex items-center justify-center">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-secondary-900 dark:text-white mb-6">
          Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-700">Amazing</span> Events
        </h1>
        <p className="text-lg text-secondary-600 dark:text-secondary-300 mb-8 max-w-xl mx-auto">
          Find and book tickets to the best events happening around you. Create memories that last a lifetime.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/explore" className="btn btn-primary h-12 px-8 text-base">Browse Events</Link>
          <Link to="/manage/events/create" className="btn btn-outline h-12 px-8 text-base dark:text-secondary-200 dark:border-secondary-700 flex items-center justify-center">Create Event</Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
