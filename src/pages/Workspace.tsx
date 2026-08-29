import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTrackerStore } from '../store/useTrackerStore';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Play, ArrowLeft, CheckCircle2, RotateCcw, AlertTriangle, Sparkles, Loader2 } from 'lucide-react';
import { getAIPrompt } from '../lib/aiPrompt';
import { generateProblem } from '../lib/problemGenerator';

export function Workspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const problemId = parseInt(id || '0', 10);
  
  const { problems, toggleCompletion, saveCode, groqApiKey, aiCache, saveAiIntuition, globalScratchpad, setGlobalScratchpad, generatedProblems, saveGeneratedProblem } = useTrackerStore();
  const problem = problems.find(p => p.id === problemId);

  const [code, setCode] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [pyodideReady, setPyodideReady] = useState(false);
  
  const [aiState, setAiState] = useState<'idle' | 'loading' | 'done'>('idle');
  const [aiResponse, setAiResponse] = useState('');
  
  const [activeLeftTab, setActiveLeftTab] = useState<'description' | 'scratchpad'>('description');
  
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
      
      // Also automatically populate the editor if it's empty
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
      // problem is guaranteed to exist here, otherwise the page wouldn't render this part
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
  
  // We store the pyodide instance in a ref so it persists across renders
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
    
    try {
      // Clear previous stdout
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
    if (!pyodideReady || !pyodideRef.current) return;
    if (!generatedProblem || !generatedProblem.testScript) {
      setOutput('No test cases generated for this problem. Click "Generate Problem" first.');
      return;
    }
    
    setIsRunning(true);
    setOutput('Submitting and running tests...\n');
    
    try {
      let currentOutput = '';
      pyodideRef.current.setStdout({ batched: (msg: string) => {
        currentOutput += msg + '\n';
      }});
      pyodideRef.current.setStderr({ batched: (msg: string) => {
        currentOutput += '[Error] ' + msg + '\n';
      }});

      const bridgeShim = `
# Universal bridge between standalone functions and Solution class
try:
    class _SolutionMeta(type):
        def __getattr__(cls, name):
            for _k, _v in list(globals().items()):
                if callable(_v) and not _k.startswith('_') and _k not in ('Solution', '_SolutionMeta'):
                    return staticmethod(_v)
            raise AttributeError(f"No method '{name}' found")

    if 'Solution' not in globals():
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

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-border bg-card z-10 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-muted rounded-md transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="font-medium truncate">
            {problem.id}. {problem.title}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={runCode}
            disabled={!pyodideReady || isRunning}
            className="flex items-center gap-1.5 bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-50 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
          >
            <Play className="h-4 w-4" />
            {isRunning ? 'Running...' : 'Run Code'}
          </button>
          
          {generatedProblem && (
            <button
              onClick={submitCode}
              disabled={!pyodideReady || isRunning}
              className="flex items-center gap-1.5 bg-success/20 text-success hover:bg-success/30 disabled:opacity-50 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              {isRunning ? 'Submitting...' : 'Submit'}
            </button>
          )}
          
          <button
            onClick={() => toggleCompletion(problem.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              problem.completed 
                ? 'bg-success text-success-foreground hover:bg-success/90' 
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            {problem.completed ? 'Completed' : 'Mark Complete'}
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup orientation="horizontal">
          
          {/* Left Panel: Description */}
          <Panel defaultSize={40} minSize={25} className="bg-card flex flex-col">
            <div className="flex border-b border-border shrink-0">
              <button
                onClick={() => setActiveLeftTab('description')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeLeftTab === 'description'
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Problem Description
              </button>
              <button
                onClick={() => setActiveLeftTab('scratchpad')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeLeftTab === 'scratchpad'
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Scratchpad
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative">
              {activeLeftTab === 'description' ? (
                <>
                  <div>
                    <h1 className="text-2xl font-bold mb-2">{problem.title}</h1>
                    <div className="flex items-center gap-2 text-sm">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        problem.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-500' :
                        problem.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {problem.difficulty}
                      </span>
                      <span className="bg-muted px-2.5 py-0.5 rounded-full text-xs text-muted-foreground font-medium">
                        {problem.category}
                      </span>
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
                      <p>
                        <strong>Note:</strong> This problem was requested from your custom DSA sheet and does not have an official LeetCode URL mapped to it. 
                      </p>
                      <div className="bg-muted/50 p-4 rounded-lg border border-border mt-4">
                        <div className="flex items-center gap-2 text-amber-500 mb-2 font-medium">
                          <AlertTriangle className="h-5 w-5" />
                          Missing Detailed Description
                        </div>
                        <p className="text-sm text-muted-foreground m-0 mb-4">
                          Your master list only provided the problem title. Click below to generate a dynamic LeetCode-style problem description, test cases, and starter code!
                        </p>
                        <button
                          onClick={handleGenerateProblemClick}
                          disabled={genState === 'loading'}
                          className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors w-full justify-center disabled:opacity-50"
                        >
                          {genState === 'loading' ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Generating Problem...
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
                  <div className="pt-4 border-t border-border">
                    {aiState === 'idle' && (
                      <button
                        onClick={() => handleAskAI()}
                        className="flex items-center gap-2 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 px-4 py-2 rounded-md text-sm font-medium transition-colors w-full justify-center border border-indigo-500/20"
                      >
                        <Sparkles className="h-4 w-4" />
                        Ask AI for Intuition
                      </button>
                    )}

                    {aiState === 'loading' && (
                      <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-lg border border-border animate-pulse">
                        <Loader2 className="h-6 w-6 text-indigo-500 animate-spin mb-3" />
                        <p className="text-sm text-muted-foreground font-medium">Analyzing problem constraints...</p>
                      </div>
                    )}

                    {aiState === 'done' && (
                      <div className="bg-indigo-500/5 p-5 rounded-lg border border-indigo-500/20 relative">
                        <div className="flex items-center gap-2 text-indigo-500 mb-3 font-semibold">
                          <Sparkles className="h-5 w-5" />
                          AI Intuition
                        </div>
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
                            {aiResponse}
                          </ReactMarkdown>
                        </div>
                        <button 
                          onClick={() => handleAskAI(true)}
                          className="absolute top-4 right-4 text-xs bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 px-2.5 py-1 rounded transition-colors"
                        >
                          Regenerate
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col">
                  <div className="text-sm text-muted-foreground mb-3 flex items-center justify-between">
                    <span>Global Scratchpad</span>
                    <span className="text-xs opacity-70">Saved automatically</span>
                  </div>
                  <textarea
                    value={globalScratchpad}
                    onChange={(e) => setGlobalScratchpad(e.target.value)}
                    placeholder="Write your rough ideas, pseudo-code, or notes here. This is shared across all problems..."
                    className="flex-1 w-full bg-muted/20 border border-border rounded-lg p-4 font-mono text-sm resize-none focus:outline-none focus:border-primary transition-colors custom-scrollbar"
                  />
                </div>
              )}
            </div>
          </Panel>

          <PanelResizeHandle className="w-1.5 bg-border hover:bg-primary/50 transition-colors cursor-col-resize" />

          {/* Right Panel: Editor & Console */}
          <Panel defaultSize={60} minSize={30}>
            <PanelGroup orientation="vertical">
              
              {/* Code Editor */}
              <Panel defaultSize={70} minSize={20} className="relative">
                <div className="absolute top-0 left-0 right-0 bg-muted/30 border-b border-border px-4 py-1.5 flex justify-between items-center z-10 backdrop-blur-sm">
                  <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Python 3</span>
                  <button 
                    onClick={() => {
                      const defaultCode = generatedProblem 
                        ? generatedProblem.boilerplate 
                        : `def solve():\n    # Write your code here\n    pass\n\nprint("Result:", solve())`;
                      setCode(defaultCode);
                      saveCode(problemId, defaultCode);
                    }}
                    className="p-1 hover:bg-muted rounded text-muted-foreground transition-colors"
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
                <div className="bg-[#2d2d2d] border-b border-[#3d3d3d] px-4 py-1.5 flex items-center shrink-0">
                  <span className="text-xs font-semibold text-gray-400 tracking-wider uppercase flex items-center gap-2">
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
                </div>
                <div className="p-4 flex-1 overflow-auto font-mono text-sm text-gray-300 whitespace-pre-wrap custom-scrollbar">
                  {output}
                </div>
              </Panel>

            </PanelGroup>
          </Panel>

        </PanelGroup>
      </div>
    </div>
  );
}
