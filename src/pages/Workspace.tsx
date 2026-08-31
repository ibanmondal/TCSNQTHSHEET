import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTrackerStore } from '../store/useTrackerStore';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  Play, 
  ArrowLeft, 
  CheckCircle2, 
  RotateCcw, 
  AlertTriangle, 
  Sparkles, 
  Loader2,
  FileText,
  Code2,
  Terminal,
  Edit3,
  ExternalLink,
  BookOpenCheck
} from 'lucide-react';
import { getAIPrompt } from '../lib/aiPrompt';
import { generateProblem } from '../lib/problemGenerator';
import { cn } from '../lib/utils';
import { JupyterNotebook } from '../components/JupyterNotebook';

export function Workspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const problemId = parseInt(id || '0', 10);
  
  const [compilerMode, setCompilerMode] = useState<'notebook' | 'classic'>('notebook');
  
  const { 
    problems, 
    toggleCompletion, 
    saveCode, 
    groqApiKey, 
    aiCache, 
    saveAiIntuition, 
    globalScratchpad, 
    setGlobalScratchpad, 
    generatedProblems, 
    saveGeneratedProblem 
  } = useTrackerStore();
  
  const problem = problems.find(p => p.id === problemId);

  const [code, setCode] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [pyodideReady, setPyodideReady] = useState(false);
  
  const [aiState, setAiState] = useState<'idle' | 'loading' | 'done'>('idle');
  const [aiResponse, setAiResponse] = useState('');
  
  const [activeLeftTab, setActiveLeftTab] = useState<'description' | 'scratchpad'>('description');
  const [mobileTab, setMobileTab] = useState<'problem' | 'editor' | 'console' | 'scratchpad'>('problem');
  
  const generatedProblem = generatedProblems[problemId];
  const [genState, setGenState] = useState<'idle' | 'loading'>('idle');

  const handleGenerateProblemClick = async () => {
    const activeApiKey = groqApiKey || import.meta.env.VITE_GROQ_API_KEY;
    if (!activeApiKey) {
      alert('Please configure your Groq API key in the Settings page or .env file to use this feature.');
      return;
    }

    setGenState('loading');
    try {
      const data = await generateProblem(problem!, activeApiKey);
      saveGeneratedProblem(problemId, data);
      
      if (!code || code.trim() === '') {
        setCode(data.boilerplate);
        saveCode(problemId, data.boilerplate);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to generate problem. Check console for details.");
    } finally {
      setGenState('idle');
    }
  };

  const handleAskAI = async (forceRegenerate = false) => {
    if (!forceRegenerate && aiCache[problemId]) {
      setAiResponse(aiCache[problemId]);
      setAiState('done');
      return;
    }

    const activeApiKey = groqApiKey || import.meta.env.VITE_GROQ_API_KEY;

    if (!activeApiKey) {
      setAiResponse('Please configure your Groq API key in the Settings page or .env file to use the AI Intuition feature.');
      setAiState('done');
      return;
    }

    setAiState('loading');
    
    try {
      const prompt = getAIPrompt(problem!);

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeApiKey}`
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages: [{ role: 'user', content: prompt }]
        })
      });

      const data = await res.json();
      
      if (data.error) {
        setAiResponse(`Error: ${data.error.message || 'Failed to fetch AI response'}`);
      } else {
        const intuition = data.choices[0].message.content;
        setAiResponse(intuition);
        saveAiIntuition(problemId, intuition);
      }
    } catch (err) {
      setAiResponse('Error: Failed to connect to AI service. Check your API key and network.');
    }
    
    setAiState('done');
  };
  
  const pyodideRef = useRef<any>(null);

  // Initialize Code only when problemId changes
  useEffect(() => {
    const currentProblem = problems.find(p => p.id === problemId);
    if (currentProblem) {
      if (currentProblem.savedCode !== undefined) {
        setCode(currentProblem.savedCode);
      } else if (generatedProblems[problemId]?.boilerplate) {
        setCode(generatedProblems[problemId].boilerplate);
      } else {
        setCode(`def solve():\n    # Write your code here\n    pass\n\nprint("Result:", solve())`);
      }
    }
  }, [problemId]);

  // Load Pyodide script dynamically
  useEffect(() => {
    const loadPyodide = async () => {
      try {
        if (!(window as any).loadPyodide) {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
          document.body.appendChild(script);
          
          await new Promise((resolve) => {
            script.onload = resolve;
          });
        }
        
        pyodideRef.current = await (window as any).loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/'
        });
        
        setPyodideReady(true);
        setOutput('Compiler Ready.\n');
      } catch (err) {
        console.error("Failed to load Pyodide", err);
        setOutput('Error loading python environment. Check internet connection.\n');
      }
    };

    loadPyodide();
  }, []);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      saveCode(problemId, value);
    }
  };

  const runCode = async () => {
    if (!pyodideReady || !pyodideRef.current) return;
    
    setIsRunning(true);
    setOutput('Running...\n');
    setMobileTab('console'); // Switch to console view on mobile
    
    try {
      let currentOutput = '';
      pyodideRef.current.setStdout({ batched: (msg: string) => {
        currentOutput += msg + '\n';
      }});
      pyodideRef.current.setStderr({ batched: (msg: string) => {
        currentOutput += '[Error] ' + msg + '\n';
      }});

      await pyodideRef.current.runPythonAsync(code);
      
      setOutput(currentOutput || 'Execution completed with no output.');
    } catch (err: any) {
      setOutput(`Error:\n${err.message || String(err)}`);
    } finally {
      setIsRunning(false);
    }
  };

  const submitCode = async () => {
    if (!pyodideReady || !pyodideRef.current || !generatedProblem) return;
    
    setIsRunning(true);
    setOutput('Running LeetCode Submission Tests...\n');
    setMobileTab('console'); // Switch to console view on mobile
    
    try {
      let currentOutput = '';
      pyodideRef.current.setStdout({ batched: (msg: string) => {
        currentOutput += msg + '\n';
      }});
      pyodideRef.current.setStderr({ batched: (msg: string) => {
        currentOutput += '[Error] ' + msg + '\n';
      }});

      const bridgeShim = `
try:
    if 'Solution' not in globals() or not isinstance(globals()['Solution'], type):
        class _SolutionMeta(type):
            def __getattr__(cls, name):
                for _k, _v in list(globals().items()):
                    if callable(_v) and not _k.startswith('_') and _k not in ('Solution', '_SolutionMeta'):
                        return _v
                raise AttributeError(f"No method '{name}' found")
        class Solution(metaclass=_SolutionMeta):
            def __getattr__(self, name):
                for _k, _v in list(globals().items()):
                    if callable(_v) and not _k.startswith('_') and _k not in ('Solution', '_SolutionMeta'):
                        return _v
                raise AttributeError(f"No method '{name}' found")
        for _k, _v in list(globals().items()):
            if callable(_v) and not _k.startswith('_') and _k not in ('Solution', '_SolutionMeta'):
                setattr(Solution, _k, staticmethod(_v))
    else:
        _sol_inst = Solution()
        for _k in dir(_sol_inst):
            if not _k.startswith('_') and callable(getattr(_sol_inst, _k)):
                if _k not in globals():
                    globals()[_k] = getattr(_sol_inst, _k)
except Exception:
    pass
`;

      const fullCode = `${code}\n\n${bridgeShim}\n\n${generatedProblem.testScript}`;
      await pyodideRef.current.runPythonAsync(fullCode);
      
      setOutput(currentOutput || 'Execution completed with no output.');
    } catch (err: any) {
      setOutput(`Error:\n${err.message || String(err)}`);
    } finally {
      setIsRunning(false);
    }
  };

  if (!problem) {
    return <div className="p-8">Problem not found.</div>;
  }

  // Common Problem Description view component
  const renderProblemDescription = () => (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{problem.title}</h1>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
            problem.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
            problem.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
            'bg-rose-500/10 text-rose-500 border border-rose-500/20'
          }`}>
            {problem.difficulty}
          </span>
          <span className="bg-muted px-2.5 py-0.5 rounded-full text-xs text-muted-foreground font-medium">
            {problem.category}
          </span>
          {problem.leetcodeUrl && (
            <a 
              href={problem.leetcodeUrl} 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 text-xs font-bold text-orange-500 hover:bg-orange-500/20 transition-colors"
            >
              LeetCode #{problem.leetcodeNumber}
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>

      {generatedProblem ? (
        <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({node, inline, className, children, ...props}: any) {
                const match = /language-(\w+)/.exec(className || '')
                return !inline && match ? (
                  <SyntaxHighlighter
                    {...props}
                    children={String(children).replace(/\n$/, '')}
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                  />
                ) : (
                  <code {...props} className={className}>
                    {children}
                  </code>
                )
              }
            }}
          >
            {generatedProblem.description}
          </ReactMarkdown>
        </div>
      ) : (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <div className="bg-muted/40 p-4 rounded-xl border border-border">
            <div className="flex items-center gap-2 text-amber-500 mb-2 font-bold text-sm">
              <AlertTriangle className="h-4 w-4" />
              Custom Problem Description
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground m-0 mb-4">
              Click below to generate detailed constraints, edge cases, and automated test runners using AI!
            </p>
            <button
              onClick={handleGenerateProblemClick}
              disabled={genState === 'loading'}
              className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all w-full justify-center disabled:opacity-50 shadow-xs"
            >
              {genState === 'loading' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Test Cases...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Problem & Tests (AI)
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* AI Intuition Section */}
      <div className="pt-4 border-t border-border/80">
        {aiState === 'idle' && (
          <button
            onClick={() => handleAskAI()}
            className="flex items-center gap-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all w-full justify-center border border-indigo-500/20"
          >
            <Sparkles className="h-4 w-4 text-indigo-400" />
            Ask AI for Intuition & Approach
          </button>
        )}

        {aiState === 'loading' && (
          <div className="flex flex-col items-center justify-center p-6 bg-muted/20 rounded-xl border border-border/60 animate-pulse">
            <Loader2 className="h-6 w-6 text-indigo-500 animate-spin mb-3" />
            <p className="text-xs text-muted-foreground font-semibold">Analyzing problem constraints & optimal patterns...</p>
          </div>
        )}

        {aiState === 'done' && (
          <div className="bg-indigo-500/5 p-4 sm:p-5 rounded-xl border border-indigo-500/20 relative space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                <Sparkles className="h-4 w-4" />
                AI Intuition
              </div>
              <button 
                onClick={() => handleAskAI(true)}
                className="text-[11px] font-bold bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 px-2.5 py-1 rounded-lg transition-colors border border-indigo-500/20"
              >
                Regenerate
              </button>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap text-xs sm:text-sm">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({node, inline, className, children, ...props}: any) {
                    const match = /language-(\w+)/.exec(className || '')
                    return !inline && match ? (
                      <SyntaxHighlighter
                        {...props}
                        children={String(children).replace(/\n$/, '')}
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                      />
                    ) : (
                      <code {...props} className={className}>
                        {children}
                      </code>
                    )
                  }
                }}
              >
                {aiResponse}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      {/* Top Header */}
      <header className="flex items-center justify-between px-3 sm:px-4 py-2.5 border-b border-border bg-card/90 backdrop-blur-md z-10 shrink-0 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button 
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-muted rounded-xl transition-colors shrink-0"
            title="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="font-bold text-xs sm:text-sm truncate">
            <span className="text-muted-foreground font-mono mr-1">#{problem.id}</span>
            {problem.title}
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Compiler Mode Switcher */}
          <div className="hidden sm:flex items-center p-0.5 bg-muted/60 border border-border rounded-xl">
            <button
              onClick={() => setCompilerMode('notebook')}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all",
                compilerMode === 'notebook'
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Interactive Jupyter Notebook with cell-by-cell execution"
            >
              <BookOpenCheck className="h-3.5 w-3.5" />
              <span>Jupyter</span>
            </button>
            <button
              onClick={() => setCompilerMode('classic')}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all",
                compilerMode === 'classic'
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Classic single-file script IDE"
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>Classic</span>
            </button>
          </div>

          <button
            onClick={runCode}
            disabled={!pyodideReady || isRunning}
            className="flex items-center gap-1.5 bg-muted hover:bg-muted/80 text-foreground disabled:opacity-50 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
          >
            <Play className="h-3.5 w-3.5 fill-foreground text-foreground" />
            <span className="hidden sm:inline">{isRunning ? 'Running...' : 'Run'}</span>
          </button>
          
          {generatedProblem && (
            <button
              onClick={submitCode}
              disabled={!pyodideReady || isRunning}
              className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20 disabled:opacity-50 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{isRunning ? 'Testing...' : 'Submit'}</span>
            </button>
          )}
          
          <button
            onClick={() => toggleCompletion(problem.id)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all",
              problem.completed 
                ? 'bg-emerald-500 text-white shadow-xs' 
                : 'bg-primary text-primary-foreground hover:opacity-90'
            )}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{problem.completed ? 'Solved' : 'Mark Done'}</span>
          </button>
        </div>
      </header>

      {/* Mobile/Tablet Tab Switcher (< 1024px) */}
      <div className="flex lg:hidden border-b border-border bg-card px-2 shrink-0 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setMobileTab('problem')}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors",
            mobileTab === 'problem' ? "border-primary text-foreground" : "border-transparent text-muted-foreground"
          )}
        >
          <FileText className="h-3.5 w-3.5" />
          Problem
        </button>
        <button
          onClick={() => setMobileTab('editor')}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors",
            mobileTab === 'editor' ? "border-primary text-foreground" : "border-transparent text-muted-foreground"
          )}
        >
          <BookOpenCheck className="h-3.5 w-3.5" />
          Jupyter Notebook
        </button>
        <button
          onClick={() => setMobileTab('console')}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors",
            mobileTab === 'console' ? "border-primary text-foreground" : "border-transparent text-muted-foreground"
          )}
        >
          <Terminal className="h-3.5 w-3.5" />
          Console
        </button>
        <button
          onClick={() => setMobileTab('scratchpad')}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors",
            mobileTab === 'scratchpad' ? "border-primary text-foreground" : "border-transparent text-muted-foreground"
          )}
        >
          <Edit3 className="h-3.5 w-3.5" />
          Notes
        </button>
      </div>

      {/* MOBILE / TABLET VIEW (< 1024px) */}
      <div className="flex-1 overflow-hidden lg:hidden flex flex-col">
        {mobileTab === 'problem' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-card">
            {renderProblemDescription()}
          </div>
        )}

        {mobileTab === 'editor' && (
          <div className="flex-1 flex flex-col relative h-full">
            <JupyterNotebook
              problemId={problemId}
              initialCode={code}
              pyodideRef={pyodideRef}
              pyodideReady={pyodideReady}
              onCodeChange={(newCode) => {
                setCode(newCode);
                saveCode(problemId, newCode);
              }}
            />
          </div>
        )}

        {mobileTab === 'console' && (
          <div className="flex-1 bg-[#1e1e1e] flex flex-col h-full">
            <div className="bg-[#2d2d2d] border-b border-[#3d3d3d] px-4 py-2 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                Console Output
                {!pyodideReady && (
                  <span className="text-amber-400 lowercase font-normal flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> loading...
                  </span>
                )}
              </span>
              <button
                onClick={() => setOutput('')}
                className="text-xs text-gray-400 hover:text-white"
              >
                Clear
              </button>
            </div>
            <div className="p-4 flex-1 overflow-auto font-mono text-xs sm:text-sm text-gray-200 whitespace-pre-wrap custom-scrollbar">
              {output || 'No output yet. Click "Run" or "Submit" to execute code.'}
            </div>
          </div>
        )}

        {mobileTab === 'scratchpad' && (
          <div className="flex-1 flex flex-col p-4 bg-card h-full">
            <div className="text-xs font-bold text-muted-foreground mb-2 flex items-center justify-between">
              <span>Scratchpad / Notes</span>
              <span className="text-[10px] text-emerald-500">Auto-saved</span>
            </div>
            <textarea
              value={globalScratchpad}
              onChange={(e) => setGlobalScratchpad(e.target.value)}
              placeholder="Write your pseudo-code or notes here..."
              className="flex-1 w-full bg-muted/20 border border-border rounded-xl p-3 font-mono text-xs sm:text-sm resize-none focus:outline-none focus:border-primary transition-colors custom-scrollbar"
            />
          </div>
        )}
      </div>

      {/* DESKTOP VIEW (>= 1024px) */}
      <div className="hidden lg:flex flex-1 overflow-hidden">
        <PanelGroup orientation="horizontal">
          
          {/* Left Panel: Description */}
          <Panel defaultSize={40} minSize={25} className="bg-card flex flex-col">
            <div className="flex border-b border-border shrink-0">
              <button
                onClick={() => setActiveLeftTab('description')}
                className={cn(
                  "px-4 py-3 text-xs font-bold border-b-2 transition-colors",
                  activeLeftTab === 'description'
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                Problem Description
              </button>
              <button
                onClick={() => setActiveLeftTab('scratchpad')}
                className={cn(
                  "px-4 py-3 text-xs font-bold border-b-2 transition-colors",
                  activeLeftTab === 'scratchpad'
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                Scratchpad
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative">
              {activeLeftTab === 'description' ? renderProblemDescription() : (
                <div className="h-full flex flex-col">
                  <div className="text-xs font-bold text-muted-foreground mb-3 flex items-center justify-between">
                    <span>Global Scratchpad</span>
                    <span className="text-[11px] text-emerald-500">Auto-saved</span>
                  </div>
                  <textarea
                    value={globalScratchpad}
                    onChange={(e) => setGlobalScratchpad(e.target.value)}
                    placeholder="Write your rough ideas, pseudo-code, or notes here. This is shared across all problems..."
                    className="flex-1 w-full bg-muted/20 border border-border rounded-xl p-4 font-mono text-sm resize-none focus:outline-none focus:border-primary transition-colors custom-scrollbar"
                  />
                </div>
              )}
            </div>
          </Panel>

          <PanelResizeHandle className="w-1.5 bg-border hover:bg-primary/50 transition-colors cursor-col-resize" />

          {/* Right Panel: Jupyter Notebook or Classic Editor */}
          <Panel defaultSize={60} minSize={30}>
            {compilerMode === 'notebook' ? (
              <JupyterNotebook
                problemId={problemId}
                initialCode={code}
                pyodideRef={pyodideRef}
                pyodideReady={pyodideReady}
                onCodeChange={(newCode) => {
                  setCode(newCode);
                  saveCode(problemId, newCode);
                }}
              />
            ) : (
              <PanelGroup orientation="vertical">
                
                {/* Code Editor */}
                <Panel defaultSize={70} minSize={20} className="relative">
                  <div className="absolute top-0 left-0 right-0 bg-muted/30 border-b border-border px-4 py-1.5 flex justify-between items-center z-10 backdrop-blur-sm">
                    <span className="text-xs font-bold text-muted-foreground tracking-wider uppercase">Python 3</span>
                    <button 
                      onClick={() => {
                        const defaultCode = generatedProblem 
                          ? generatedProblem.boilerplate 
                          : `def solve():\n    # Write your code here\n    pass\n\nprint("Result:", solve())`;
                        setCode(defaultCode);
                        saveCode(problemId, defaultCode);
                      }}
                      className="p-1 hover:bg-muted rounded-lg text-muted-foreground transition-colors"
                      title="Reset to default code"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="pt-8 h-full">
                    <Editor
                      height="100%"
                      language="python"
                      theme="vs-dark"
                      value={code}
                      onChange={handleEditorChange}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineHeight: 24,
                        padding: { top: 16 },
                        scrollBeyondLastLine: false,
                        smoothScrolling: true,
                      }}
                    />
                  </div>
                </Panel>

                <PanelResizeHandle className="h-1.5 bg-border hover:bg-primary/50 transition-colors cursor-row-resize" />

                {/* Console Output */}
                <Panel defaultSize={30} minSize={15} className="bg-[#1e1e1e] flex flex-col">
                  <div className="bg-[#2d2d2d] border-b border-[#3d3d3d] px-4 py-1.5 flex items-center justify-between shrink-0">
                    <span className="text-xs font-bold text-gray-400 tracking-wider uppercase flex items-center gap-2">
                      Console Output
                      {!pyodideReady && (
                        <span className="text-amber-500 lowercase font-normal flex items-center gap-1.5">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                          </span>
                          loading python engine...
                        </span>
                      )}
                    </span>
                    <button 
                      onClick={() => setOutput('')} 
                      className="text-xs text-gray-400 hover:text-white"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="p-4 flex-1 overflow-auto font-mono text-sm text-gray-300 whitespace-pre-wrap custom-scrollbar">
                    {output || 'No output yet. Click "Run" or "Submit" to execute.'}
                  </div>
                </Panel>

              </PanelGroup>
            )}
          </Panel>

        </PanelGroup>
      </div>
    </div>
  );
}
