import { useState } from 'react';
import { useTrackerStore } from '../store/useTrackerStore';
import { Download, Upload, Trash2, Moon, Sun, Save } from 'lucide-react';

export function Settings() {
  const { problems, dailyTarget, theme, groqApiKey, setDailyTarget, setTheme, setGroqApiKey, importProblems, resetProgress } = useTrackerStore();
  
  const [localTarget, setLocalTarget] = useState(dailyTarget.toString());
  const [localApiKey, setLocalApiKey] = useState(groqApiKey || '');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSaveTarget = () => {
    const val = parseInt(localTarget);
    if (!isNaN(val) && val > 0) {
      setDailyTarget(val);
      alert('Daily target saved!');
    } else {
      setLocalTarget(dailyTarget.toString());
      alert('Please enter a valid positive number.');
    }
  };

  const handleSaveApiKey = () => {
    setGroqApiKey(localApiKey.trim());
    alert('Groq API Key saved successfully!');
  };

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(problems, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "dsa-tracker-progress.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const exportCSV = () => {
    const headers = ['id', 'title', 'category', 'leetcodeNumber', 'leetcodeTitle', 'leetcodeUrl', 'completed', 'completedDate', 'needsRevision', 'notes'];
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(',') + '\n' 
      + problems.map(p => {
        return [
          p.id,
          `"${p.title.replace(/"/g, '""')}"`,
          `"${p.category}"`,
          p.leetcodeNumber || '',
          p.leetcodeTitle ? `"${p.leetcodeTitle}"` : '',
          p.leetcodeUrl || '',
          p.completed,
          p.completedDate || '',
          p.needsRevision,
          `"${p.notes.replace(/"/g, '""')}"`
        ].join(',');
      }).join('\n');
      
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", encodeURI(csvContent));
    downloadAnchorNode.setAttribute("download", "dsa-tracker-progress.csv");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (Array.isArray(json)) {
          importProblems(json);
          alert('Progress imported successfully!');
        } else {
          alert('Invalid JSON format. Expected an array of problems.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // reset input
  };

  const handleReset = () => {
    if (showResetConfirm) {
      resetProgress();
      setShowResetConfirm(false);
      alert('Progress has been reset.');
    } else {
      setShowResetConfirm(true);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your application preferences and data.
        </p>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold">Preferences</h2>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
            <div>
              <p className="font-medium">Theme</p>
              <p className="text-sm text-muted-foreground">Switch between Light and Dark mode.</p>
            </div>
            <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
              <button
                onClick={() => setTheme('light')}
                className={`p-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${theme === 'light' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Sun className="h-4 w-4" /> Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${theme === 'dark' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Moon className="h-4 w-4" /> Dark
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-t border-border">
            <div>
              <p className="font-medium">Daily Target</p>
              <p className="text-sm text-muted-foreground">Number of problems to solve each day.</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={localTarget}
                onChange={(e) => setLocalTarget(e.target.value)}
                className="w-20 rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
              />
              <button 
                onClick={handleSaveTarget}
                className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:opacity-90"
              >
                <Save className="h-4 w-4" /> Save
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold">AI Integration</h2>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-border">
            <div>
              <p className="font-medium">Groq API Key</p>
              <p className="text-sm text-muted-foreground">
                Enter your free API key from <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">console.groq.com</a> to enable AI Intuitions.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="password"
                placeholder="gsk_..."
                value={localApiKey}
                onChange={(e) => setLocalApiKey(e.target.value)}
                className="w-full sm:w-64 rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
              />
              <button 
                onClick={handleSaveApiKey}
                className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:opacity-90 shrink-0"
              >
                <Save className="h-4 w-4" /> Save
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold">Data Management</h2>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
            <div>
              <p className="font-medium">Export Progress</p>
              <p className="text-sm text-muted-foreground">Download your data as JSON or CSV.</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={exportJSON}
                className="flex items-center gap-1.5 bg-muted text-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:bg-muted/80"
              >
                <Download className="h-4 w-4" /> JSON
              </button>
              <button 
                onClick={exportCSV}
                className="flex items-center gap-1.5 bg-muted text-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:bg-muted/80"
              >
                <Download className="h-4 w-4" /> CSV
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-t border-border">
            <div>
              <p className="font-medium">Import Progress</p>
              <p className="text-sm text-muted-foreground">Upload a previously exported JSON file.</p>
            </div>
            <div>
              <label className="flex items-center gap-1.5 bg-muted text-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:bg-muted/80 cursor-pointer">
                <Upload className="h-4 w-4" /> Upload JSON
                <input 
                  type="file" 
                  accept=".json" 
                  className="hidden" 
                  onChange={handleImportJSON} 
                />
              </label>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-destructive">Danger Zone</h2>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
            <div>
              <p className="font-medium text-destructive">Reset Progress</p>
              <p className="text-sm text-destructive/80">This will remove your completion history and notes permanently.</p>
            </div>
            <div>
              {showResetConfirm ? (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowResetConfirm(false)}
                    className="bg-muted text-foreground px-3 py-1.5 rounded-md text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleReset}
                    className="flex items-center gap-1.5 bg-destructive text-destructive-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:bg-destructive/90"
                  >
                    Yes, I'm sure
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleReset}
                  className="flex items-center gap-1.5 bg-destructive text-destructive-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:bg-destructive/90"
                >
                  <Trash2 className="h-4 w-4" /> Reset Progress
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
