import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ListTodo, CalendarDays, BarChart2, Settings, BookOpen, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTrackerStore } from '../store/useTrackerStore';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Problems', href: '/problems', icon: ListTodo },
  { name: 'Today', href: '/today', icon: CalendarDays },
  { name: 'Revision', href: '/revision', icon: RefreshCw },
  { name: 'Calendar', href: '/calendar', icon: BookOpen },
  { name: 'Statistics', href: '/statistics', icon: BarChart2 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const theme = useTrackerStore(state => state.theme);

  return (
    <div className="flex h-screen w-64 flex-col border-r border-border bg-card">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-border">
        <h1 className="text-lg font-bold tracking-tight text-foreground">
          My DSA Tracker
        </h1>
      </div>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
