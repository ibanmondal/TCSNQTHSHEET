import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ListTodo, 
  CalendarDays, 
  BarChart2, 
  Settings, 
  BookOpen, 
  RefreshCw, 
  Code2, 
  Flame, 
  Moon, 
  Sun,
  Sparkles,
  FolderDown
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTrackerStore } from '../store/useTrackerStore';
import { calculateStats } from '../lib/stats';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Problems', href: '/problems', icon: ListTodo, badge: '100' },
  { name: 'Resources Vault', href: '/resources', icon: FolderDown, badge: '69' },
  { name: 'Today\'s Goal', href: '/today', icon: CalendarDays },
  { name: 'Revision', href: '/revision', icon: RefreshCw },
  { name: 'Study Log', href: '/calendar', icon: BookOpen },
  { name: 'Analytics', href: '/statistics', icon: BarChart2 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  onCloseMobile?: () => void;
}

export function Sidebar({ onCloseMobile }: SidebarProps) {
  const location = useLocation();
  const { problems, dailyTarget, theme, setTheme } = useTrackerStore();
  const stats = calculateStats(problems, dailyTarget);

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-card/80 backdrop-blur-xl transition-all select-none">
      {/* Brand Header */}
      <div className="flex h-18 shrink-0 items-center justify-between px-5 border-b border-border/80">
        <Link to="/" onClick={onCloseMobile} className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <div className="h-full w-full bg-card rounded-[10px] flex items-center justify-center">
              <Code2 className="h-5 w-5 text-indigo-500 group-hover:rotate-6 transition-transform" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              TCS NQT 100
            </span>
            <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500" />
              DSA Tracker
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-3 py-5 custom-scrollbar">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/60">
          Menu
        </div>
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onCloseMobile}
              className={cn(
                "group relative flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all",
                isActive
                  ? "bg-primary/10 text-primary font-bold shadow-sm shadow-primary/5"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-primary" />
              )}
              <div className="flex items-center gap-3">
                <item.icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <span>{item.name}</span>
              </div>

              {item.badge && (
                <span className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full font-bold",
                  isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Progress & Quick Controls */}
      <div className="p-3.5 border-t border-border/80 space-y-3 bg-muted/20">
        {/* Solved Progress Meter */}
        <div className="rounded-xl bg-card border border-border/60 p-3 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground">Overall Goal</span>
            <span className="text-foreground font-mono">{stats.completed}/100</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500 rounded-full"
              style={{ width: `${stats.completionPercentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
            <span className="flex items-center gap-1 font-medium text-orange-500">
              <Flame className="h-3.5 w-3.5 fill-orange-500" />
              {stats.currentStreak} day streak
            </span>
            <span className="font-semibold text-emerald-500">{stats.completionPercentage}%</span>
          </div>
        </div>

        {/* Theme Quick Toggle */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-medium text-muted-foreground">Appearance</span>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium hover:bg-muted transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-3.5 w-3.5 text-amber-400" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5 text-indigo-500" />
                <span>Dark</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
