import { useState, useEffect } from 'react';
import { useTrackerStore } from '../store/useTrackerStore';
import { Download, Upload, Trash2, Moon, Sun, Save, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, Key } from 'lucide-react';

export function Settings() {
  const { 
    problems, 
    dailyTarget, 
    targetTimelineDays,
    theme, 
    groqApiKey, 
    setDailyTarget, 
    setTargetTimeline,
    setTheme, 
    setGroqApiKey, 
    importProblems, 
    resetProgress 
  } = useTrackerStore();
  
  const [localTarget, setLocalTarget] = useState(dailyTarget.toString());
  const [localTimeline, setLocalTimeline] = useState(targetTimelineDays.toString());
  const [localApiKey, setLocalApiKey] = useState(groqApiKey || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'valid' | 'invalid'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    if (groqApiKey) {
      setLocalApiKey(groqApiKey);
    }
  }, [groqApiKey]);

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
    const trimmed = localApiKey.trim();
    setGroqApiKey(trimmed);
    setTestStatus('idle');
    setTestMessage('');
    alert(trimmed ? 'Groq API Key saved forever in browser storage!' : 'API Key cleared.');
  };

  const handleTestApiKey = async () => {
    const keyToTest = localApiKey.trim() || groqApiKey || import.meta.env.VITE_GROQ_API_KEY;
    if (!keyToTest) {
      setTestStatus('invalid');
      setTestMessage('Please enter an API key first.');
      return;
    }

    setTestStatus('testing');
    try {
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        headers: {
          'Authorization': `Bearer ${keyToTest}`
        }
      });

      if (res.ok) {
        setTestStatus('valid');
        setTestMessage('API Key is valid and working with Groq!');
      } else {
        setTestStatus('invalid');
        setTestMessage(`Invalid API Key (HTTP ${res.status}). Check console for details.`);
      }
    } catch (err: any) {
      setTestStatus('invalid');
      setTestMessage(`Connection error: ${err.message || String(err)}`);
    }
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
                className="w-20 rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none font-mono"
              />
              <button 
                onClick={handleSaveTarget}
                className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:opacity-90"
              >
                <Save className="h-4 w-4" /> Save
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-t border-border">
            <div>
              <p className="font-medium">Completion Timeline Goal</p>
              <p className="text-sm text-muted-foreground">Total target days to finish all 100 DSA problems.</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="365"
                value={localTimeline}
                onChange={(e) => setLocalTimeline(e.target.value)}
                className="w-20 rounded-md border border-border bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-none font-mono"
              />
              <button 
                onClick={() => {
                  const val = parseInt(localTimeline, 10);
                  if (!isNaN(val) && val >= 1 && val <= 365) {
                    setTargetTimeline(val);
                    alert(`Timeline goal updated to ${val} days!`);
                  } else {
                    alert('Please enter a valid number of days (1 - 365).');
                  }
                }}
                className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium hover:opacity-90"
              >
                <Save className="h-4 w-4" /> Save
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              AI Integration (Groq)
            </h2>
            {groqApiKey ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Saved & Active Forever
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <AlertCircle className="h-3.5 w-3.5" />
                No Key Configured
              </span>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground">
            Enter your free API key from <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">console.groq.com</a>. Once saved, it will be stored securely in your browser's persistent storage forever and used for all AI features (intuitions, solutions, and custom problem generation).
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="relative flex-1">
              <input
                type={showApiKey ? "text" : "password"}
                placeholder="gsk_..."
                value={localApiKey}
                onChange={(e) => setLocalApiKey(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono focus:border-primary focus:outline-none pr-10"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                title={showApiKey ? "Hide Key" : "Show Key"}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={handleSaveApiKey}
                className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                <Save className="h-4 w-4" /> Save Key
              </button>

              <button 
                onClick={handleTestApiKey}
                disabled={testStatus === 'testing'}
                className="flex items-center gap-1.5 bg-muted text-foreground hover:bg-muted/80 px-3 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
              >
                {testStatus === 'testing' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Test Key
              </button>
            </div>
          </div>

          {testMessage && (
            <div className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 border ${
              testStatus === 'valid' 
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                : 'bg-red-500/10 text-red-500 border-red-500/20'
            }`}>
              {testStatus === 'valid' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
              <span>{testMessage}</span>
            </div>
          )}
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
