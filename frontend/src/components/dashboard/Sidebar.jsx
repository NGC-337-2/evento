import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard,
  Calendar,
  User,
  ListTodo,
  Table,
  BookOpen,
  MessageSquare,
  Inbox,
  FileText,
  PieChart,
  Boxes,
  ChevronDown,
} from 'lucide-react';
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react';

const navigation = [
  {
    name: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    current: true,
  },
  { name: 'Explore Events', icon: Calendar, href: '/explore' },
  { name: 'My Profile', icon: User, href: '/profile' },
  {
    name: 'Create Event',
    icon: ListTodo,
    href: '/manage/events/create',
    roles: ['organizer', 'admin'],
  },
];

const supportLinks = [
  { name: 'Messages', icon: MessageSquare, href: '#', badge: '5', pro: true },
  { name: 'Inbox', icon: Inbox, href: '#', pro: true },
];

const otherLinks = [
  { name: 'Charts', icon: PieChart, href: '#' },
  { name: 'Settings', icon: Boxes, href: '/profile' },
];

export default function Sidebar() {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  const filteredNavigation = navigation.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <div className="flex h-full w-64 flex-col bg-[#1C2434] text-white">
      <div className="flex h-20 items-center px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
            <LayoutDashboard className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">TailAdmin</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-8 overflow-y-auto px-4 py-4 scrollbar-hide">
        <div>
          <h3 className="mb-4 px-4 text-sm font-semibold uppercase tracking-wider text-[#8A99AF]">
            MENU
          </h3>
          <div className="space-y-1">
            {filteredNavigation.map((item) =>
              !item.children ? (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center gap-3 rounded-sm px-4 py-2 text-sm font-medium transition-colors hover:bg-[#333A48] ${
                    location.pathname === item.href ? 'bg-[#333A48]' : ''
                  }`}
                >
                  <item.icon className="h-5 w-5 text-[#8A99AF] group-hover:text-white" />
                  {item.name}
                </Link>
              ) : (
                <Disclosure key={item.name} as="div" defaultOpen={item.current}>
                  {({ open }) => (
                    <>
                      <DisclosureButton className="group flex w-full items-center justify-between rounded-sm px-4 py-2 text-sm font-medium transition-colors hover:bg-[#333A48]">
                        <div className="flex items-center gap-3">
                          <item.icon className="h-5 w-5 text-[#8A99AF] group-hover:text-white" />
                          {item.name}
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
                        />
                      </DisclosureButton>
                      <DisclosurePanel className="mt-1 space-y-1 px-12">
                        {item.children.map((child) => (
                          <Link
                            key={child.name}
                            to={child.href}
                            className="block py-1 text-sm text-[#8A99AF] hover:text-white"
                          >
                            {child.name}
                          </Link>
                        ))}
                      </DisclosurePanel>
                    </>
                  )}
                </Disclosure>
              )
            )}
          </div>
        </div>

        <div>
          <h3 className="mb-4 px-4 text-sm font-semibold uppercase tracking-wider text-[#8A99AF]">
            SUPPORT
          </h3>
          <div className="space-y-1">
            {supportLinks.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="group flex items-center justify-between rounded-sm px-4 py-2 text-sm font-medium transition-colors hover:bg-[#333A48]"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 text-[#8A99AF] group-hover:text-white" />
                  {item.name}
                </div>
                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-[10px] text-white">
                      {item.badge}
                    </span>
                  )}
                  {item.pro && (
                    <span className="rounded bg-primary-600 px-1.5 py-0.5 text-[10px] uppercase text-white">
                      Pro
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 px-4 text-sm font-semibold uppercase tracking-wider text-[#8A99AF]">
            OTHERS
          </h3>
          <div className="space-y-1">
            {otherLinks.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="group flex items-center gap-3 rounded-sm px-4 py-2 text-sm font-medium transition-colors hover:bg-[#333A48]"
              >
                <item.icon className="h-5 w-5 text-[#8A99AF] group-hover:text-white" />
                {item.name}
                <ChevronDown className="ml-auto h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
