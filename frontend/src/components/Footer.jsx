import { Link } from 'react-router-dom';
import { Calendar, Github, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer
      className="bg-white border-t border-secondary-200 dark:bg-secondary-900 dark:border-secondary-800"
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <Link
              to="/"
              className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold text-2xl tracking-tight"
            >
              <Calendar className="h-8 w-8" />
              <span>EventO</span>
            </Link>
            <p className="text-sm leading-6 text-secondary-600 dark:text-secondary-400 max-w-xs">
              Discover and book tickets for the best events happening around
              you. Create your own events and sell tickets effortlessly.
            </p>
            <div className="flex space-x-6">
              <a
                href="#"
                className="text-secondary-400 hover:text-primary-500 transition-colors"
              >
                <span className="sr-only">Twitter</span>
                <Twitter className="h-6 w-6" aria-hidden="true" />
              </a>
              <a
                href="#"
                className="text-secondary-400 hover:text-primary-500 transition-colors"
              >
                <span className="sr-only">GitHub</span>
                <Github className="h-6 w-6" aria-hidden="true" />
              </a>
              <a
                href="#"
                className="text-secondary-400 hover:text-primary-500 transition-colors"
              >
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-6 w-6" aria-hidden="true" />
              </a>
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-secondary-900 dark:text-white">
                  Explore
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li>
                    <Link
                      to="/explore"
                      className="text-sm leading-6 text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      Music Events
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/explore"
                      className="text-sm leading-6 text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      Tech Conferences
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/explore"
                      className="text-sm leading-6 text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      Arts & Culture
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/explore"
                      className="text-sm leading-6 text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      Online Events
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-secondary-900 dark:text-white">
                  Host
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li>
                    <Link
                      to="/manage/events/create"
                      className="text-sm leading-6 text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      Create an Event
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/"
                      className="text-sm leading-6 text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/"
                      className="text-sm leading-6 text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      Organizer Guide
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/"
                      className="text-sm leading-6 text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      Help Center
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-secondary-900 dark:text-white">
                  Legal
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  <li>
                    <Link
                      to="/"
                      className="text-sm leading-6 text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/"
                      className="text-sm leading-6 text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/"
                      className="text-sm leading-6 text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      Cookie Policy
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-secondary-900 dark:text-white">
                  Subscribe to our newsletter
                </h3>
                <p className="mt-2 text-sm leading-6 text-secondary-600 dark:text-secondary-400">
                  The latest events, articles, and resources, sent to your inbox
                  weekly.
                </p>
                <form className="mt-6 sm:flex sm:max-w-md">
                  <label htmlFor="email-address" className="sr-only">
                    Email address
                  </label>
                  <input
                    type="email"
                    name="email-address"
                    id="email-address"
                    autoComplete="email"
                    required
                    className="w-full min-w-0 appearance-none rounded-md border-0 bg-white dark:bg-secondary-900/50 px-3 py-1.5 text-base text-secondary-900 dark:text-white shadow-sm ring-1 ring-inset ring-secondary-300 dark:ring-secondary-700 placeholder:text-secondary-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:w-64 sm:text-sm sm:leading-6 xl:w-full"
                    placeholder="Enter your email"
                  />
                  <div className="mt-4 sm:ml-4 sm:mt-0 sm:flex-shrink-0">
                    <button
                      type="submit"
                      className="flex w-full items-center justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                    >
                      Subscribe
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-secondary-900/10 dark:border-white/10 pt-8 sm:mt-20 lg:mt-24">
          <p className="text-xs leading-5 text-secondary-500 dark:text-secondary-400">
            &copy; {new Date().getFullYear()} EventO, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
