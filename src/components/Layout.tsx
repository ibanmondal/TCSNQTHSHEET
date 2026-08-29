import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useTrackerStore } from '../store/useTrackerStore';
import { Menu, X, Code2 } from 'lucide-react';

export function Layout() {
  const theme = useTrackerStore(state => state.theme);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden relative selection:bg-primary/20 selection:text-primary">
      {/* Subtle Ambient Background Gradient Lighting */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-40 dark:opacity-25">
        <div className="absolute -top-[20%] -left-[10%] h-[500px] w-[500px] rounded-full bg-indigo-500/20 blur-[120px]" />
        <div className="absolute top-[30%] -right-[15%] h-[600px] w-[600px] rounded-full bg-purple-500/15 blur-[140px]" />
        <div className="absolute -bottom-[20%] left-[20%] h-[500px] w-[500px] rounded-full bg-emerald-500/15 blur-[120px]" />
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex h-full shrink-0 z-20 relative">
        <Sidebar />
      </aside>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity" 
            onClick={() => setMobileOpen(false)} 
          />
          <div className="relative flex w-64 max-w-xs flex-1 flex-col bg-card shadow-2xl z-10">
            <Sidebar onCloseMobile={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden z-10">
        {/* Mobile Header Bar */}
        <header className="flex h-14 items-center justify-between border-b border-border bg-card/80 backdrop-blur-md px-4 md:hidden shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-1.5 rounded-lg border border-border bg-muted/50 text-foreground hover:bg-muted"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-indigo-500" />
              <span className="font-bold text-sm tracking-tight">TCS NQT 100</span>
            </div>
          </div>
        </header>

        {/* Scrollable View */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
