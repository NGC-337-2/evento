import { Link } from 'react-router-dom';
import { Calendar, Github, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-secondary-200 dark:bg-secondary-900 dark:border-secondary-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold text-xl tracking-tight mb-4">
              <Calendar className="h-6 w-6" />
              <span>EventO</span>
            </Link>
            <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-6">
              Discover and book tickets for the best events happening around you. Create your own events and sell tickets effortlessly.
            </p>
            <div className="flex items-center gap-4 text-secondary-400">
              <a href="#" className="hover:text-primary-500 transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="hover:text-primary-500 transition-colors"><Github className="h-5 w-5" /></a>
              <a href="#" className="hover:text-primary-500 transition-colors"><Linkedin className="h-5 w-5" /></a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-secondary-900 dark:text-white mb-4">Explore</h3>
            <ul className="space-y-3 text-sm text-secondary-500 dark:text-secondary-400">
              <li><Link to="/" className="hover:text-primary-500 transition-colors">Music Events</Link></li>
              <li><Link to="/" className="hover:text-primary-500 transition-colors">Tech Conferences</Link></li>
              <li><Link to="/" className="hover:text-primary-500 transition-colors">Arts & Culture</Link></li>
              <li><Link to="/" className="hover:text-primary-500 transition-colors">Online Events</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-secondary-900 dark:text-white mb-4">Host</h3>
            <ul className="space-y-3 text-sm text-secondary-500 dark:text-secondary-400">
              <li><Link to="/" className="hover:text-primary-500 transition-colors">Create an Event</Link></li>
              <li><Link to="/" className="hover:text-primary-500 transition-colors">Pricing</Link></li>
              <li><Link to="/" className="hover:text-primary-500 transition-colors">Organizer Guide</Link></li>
              <li><Link to="/" className="hover:text-primary-500 transition-colors">Help Center</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-secondary-900 dark:text-white mb-4">Legal</h3>
            <ul className="space-y-3 text-sm text-secondary-500 dark:text-secondary-400">
              <li><Link to="/" className="hover:text-primary-500 transition-colors">Terms of Service</Link></li>
              <li><Link to="/" className="hover:text-primary-500 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/" className="hover:text-primary-500 transition-colors">Cookie Policy</Link></li>
              <li><Link to="/" className="hover:text-primary-500 transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-secondary-200 dark:border-secondary-800 text-center text-sm text-secondary-500 dark:text-secondary-400">
          <p>&copy; {new Date().getFullYear()} EventO Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
