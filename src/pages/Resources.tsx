import { useState, useMemo } from 'react';
import { resourcesList } from '../data/resources';
import type { ResourceCategory, ResourceItem } from '../data/resources';
import { 
  FolderDown, 
  Search, 
  FileText, 
  Download, 
  ExternalLink, 
  Sparkles, 
  Flame, 
  Layers, 
  CheckCircle2,
  BookOpen,
  Code2,
  Brain,
  MessageSquareText,
  FileSpreadsheet
} from 'lucide-react';
import { cn } from '../lib/utils';

const categories: Array<{ name: string; icon: any }> = [
  { name: 'All', icon: Layers },
  { name: 'Quantitative Aptitude', icon: Brain },
  { name: 'Technical & Coding', icon: Code2 },
  { name: 'Previous Year Papers', icon: BookOpen },
  { name: 'Verbal Ability', icon: MessageSquareText },
  { name: 'Model & Practice Papers', icon: FileSpreadsheet },
];

export function Resources() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [formatFilter, setFormatFilter] = useState<'all' | 'pdf' | 'docx'>('all');

  const filteredResources = useMemo(() => {
    return resourcesList.filter(item => {
      // Search
      const matchesSearch = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Category
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }

      // Format
      if (formatFilter !== 'all' && item.type !== formatFilter) {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedCategory, formatFilter]);

  const pdfCount = resourcesList.filter(r => r.type === 'pdf').length;
  const docxCount = resourcesList.filter(r => r.type === 'docx').length;

  const getResourceUrl = (fileName: string) => {
    // In Vite public folder, resources are served at base + resources/fileName
    const base = import.meta.env.BASE_URL || '/';
    return `${base}resources/${encodeURIComponent(fileName)}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Hero Vault Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900/60 via-indigo-900/50 to-slate-900/80 border border-purple-500/20 p-6 sm:p-8 backdrop-blur-xl shadow-xl shadow-purple-950/20">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>TCS NQT 2026 Material Vault</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              TCS NQT Preparation Resources
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
              Complete archive of <strong>69 authentic placement papers</strong>, previous year questions (PYQs), quantitative aptitude notes, verbal ability tests, and coding problem papers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="rounded-xl bg-white/10 border border-white/10 px-3.5 py-2 text-center backdrop-blur-md">
              <span className="block text-xl font-extrabold text-white font-mono">{resourcesList.length}</span>
              <span className="text-[10px] text-slate-300 font-medium">Total Files</span>
            </div>
            <div className="rounded-xl bg-white/10 border border-white/10 px-3.5 py-2 text-center backdrop-blur-md">
              <span className="block text-xl font-extrabold text-rose-400 font-mono">{pdfCount}</span>
              <span className="text-[10px] text-slate-300 font-medium">PDF Documents</span>
            </div>
            <div className="rounded-xl bg-white/10 border border-white/10 px-3.5 py-2 text-center backdrop-blur-md">
              <span className="block text-xl font-extrabold text-blue-400 font-mono">{docxCount}</span>
              <span className="text-[10px] text-slate-300 font-medium">Word Files</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            className="block w-full rounded-xl border border-border/80 bg-card py-2.5 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-xs"
            placeholder="Search resources, topics, test papers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Format Selector Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-card border border-border/80 rounded-xl shrink-0">
          {(['all', 'pdf', 'docx'] as const).map((fmt) => (
            <button
              key={fmt}
              onClick={() => setFormatFilter(fmt)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all",
                formatFilter === fmt
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {fmt === 'all' ? 'All Formats' : fmt.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {categories.map((cat) => {
          const count = cat.name === 'All' 
            ? resourcesList.length 
            : resourcesList.filter(r => r.category === cat.name).length;
          const isSelected = selectedCategory === cat.name;
          const Icon = cat.icon;
          return (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 shrink-0 shadow-xs",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-card border border-border hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{cat.name}</span>
              <span className={cn(
                "px-1.5 py-0.2 rounded-full text-[10px]",
                isSelected ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.length === 0 ? (
          <div className="col-span-full py-16 text-center text-muted-foreground border border-border rounded-2xl border-dashed bg-card/40">
            <FolderDown className="h-10 w-10 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-base font-semibold">No resource files matched your filter.</p>
            <p className="text-xs text-muted-foreground mt-1">Try clearing your search query or choosing another category.</p>
          </div>
        ) : (
          filteredResources.map((item) => {
            const url = getResourceUrl(item.fileName);
            return (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 shadow-xs hover:shadow-md hover:border-primary/40 transition-all"
              >
                <div>
                  {/* Card Header Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider",
                      item.type === 'pdf' 
                        ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" 
                        : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                    )}>
                      {item.type.toUpperCase()}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {item.isPopular && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          <Flame className="h-3 w-3 fill-amber-500" />
                          High Yield
                        </span>
                      )}
                      <span className="text-[11px] font-mono text-muted-foreground font-semibold">
                        {item.sizeFormatted}
                      </span>
                    </div>
                  </div>

                  {/* Title & Category */}
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-transform group-hover:scale-105",
                      item.type === 'pdf' ? "bg-rose-500/10 text-rose-500" : "bg-blue-500/10 text-blue-500"
                    )}>
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2" title={item.fileName}>
                        {item.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.category}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between gap-2">
                  {item.type === 'pdf' ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Preview
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground/60 font-medium">Word Doc</span>
                  )}

                  <a
                    href={url}
                    download={item.fileName}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground px-3 py-1.5 text-xs font-bold transition-all"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
