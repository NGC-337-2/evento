import { Link } from 'react-router-dom';
import { Calendar, Users, MapPin, Search, PlusCircle, Ticket } from 'lucide-react';

const stats = [
  { id: 1, name: 'Active events globally', value: '10K+' },
  { id: 2, name: 'Happy attendees', value: '500K+' },
  { id: 3, name: 'Cities covered', value: '200+' },
];

const features = [
  {
    name: 'Discover Events',
    description: 'Find local and online events tailored to your interests. Search by category, date, or location.',
    icon: Search,
  },
  {
    name: 'Create & Manage',
    description: 'Host your own events with powerful tools. Manage ticket tiers, track attendance, and analyze data.',
    icon: PlusCircle,
  },
  {
    name: 'Get Tickets Instantly',
    description: 'Secure your spot in seconds. Receive digital tickets directly to your device for easy access.',
    icon: Ticket,
  },
];

const HomePage = () => {
  return (
    <div className="bg-white dark:bg-secondary-900">
      {/* Hero section */}
      <div className="relative isolate pt-14">
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
        <div className="py-24 sm:py-32 lg:pb-40">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-secondary-900 dark:text-white sm:text-6xl">
                Discover <span className="text-primary-600 dark:text-primary-400">Amazing</span> Events
              </h1>
              <p className="mt-6 text-lg leading-8 text-secondary-600 dark:text-secondary-300">
                Find and book tickets to the best events happening around you. Create memories that last a lifetime, or host your own event and share your passion with the world.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  to="/explore"
                  className="rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                >
                  Browse Events
                </Link>
                <Link to="/manage/events/create" className="text-sm font-semibold leading-6 text-secondary-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Create Event <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
            <div className="mt-16 flow-root sm:mt-24">
              <div className="-m-2 rounded-xl bg-secondary-900/5 dark:bg-white/5 p-2 ring-1 ring-inset ring-secondary-900/10 dark:ring-white/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                <img
                  src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                  alt="People at a concert"
                  width={2432}
                  height={1442}
                  className="rounded-md shadow-2xl ring-1 ring-secondary-900/10 dark:ring-white/10"
                />
              </div>
            </div>
          </div>
        </div>
        <div
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
      </div>

      {/* Feature section */}
      <div className="mx-auto mt-8 max-w-7xl px-6 sm:mt-16 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary-600 dark:text-primary-400">Everything you need</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-secondary-900 dark:text-white sm:text-4xl">
            The complete platform for events
          </p>
          <p className="mt-6 text-lg leading-8 text-secondary-600 dark:text-secondary-400">
            Whether you are looking for something to do this weekend or planning a massive conference, EventO provides the tools to make it happen.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3 lg:gap-y-16">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-secondary-900 dark:text-white">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600">
                    <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base leading-7 text-secondary-600 dark:text-secondary-400">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Stats section */}
      <div className="mx-auto mt-32 max-w-7xl px-6 sm:mt-40 lg:px-8 mb-32">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-secondary-900 dark:text-white sm:text-4xl">
              Trusted by creators worldwide
            </h2>
            <p className="mt-4 text-lg leading-8 text-secondary-600 dark:text-secondary-400">
              Join thousands of organizers and attendees who use EventO daily.
            </p>
          </div>
          <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.id} className="flex flex-col bg-secondary-100 dark:bg-secondary-800 p-8">
                <dt className="text-sm font-semibold leading-6 text-secondary-600 dark:text-secondary-400">{stat.name}</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-secondary-900 dark:text-white">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      
      {/* CTA section */}
      <div className="bg-primary-50 dark:bg-secondary-800 border-y border-primary-100 dark:border-secondary-700">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-secondary-900 dark:text-white sm:text-4xl">
              Ready to host your event?
              <br />
              Start building today.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-secondary-600 dark:text-secondary-400">
              Set up your first event in minutes. Our intuitive tools make it easy to manage everything from ticket sales to analytics.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/manage/events/create"
                className="rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
              >
                Create Event
              </Link>
              <Link to="/explore" className="text-sm font-semibold leading-6 text-secondary-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400">
                Explore Events <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
