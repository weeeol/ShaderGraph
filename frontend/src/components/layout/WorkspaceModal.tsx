import { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Save, 
  Download, 
  Upload, 
  Trash2, 
  X, 
  Folder,
  Layers,
  ArrowUpRight,
  Check,
  ChevronRight,
  FileCode2
} from 'lucide-react';
import { useGraphStore } from '../../store/useGraphStore';
import { SAMPLE_GRAPHS, type SampleGraph } from '../../core/samples/samples';

interface WorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNewBlankGraph?: () => void;
  onGraphLoaded?: () => void;
}

export const WorkspaceModal = ({ isOpen, onClose, onNewBlankGraph, onGraphLoaded }: WorkspaceModalProps) => {
  const { 
    nodes, 
    edges, 
    currentGraphName, 
    savedGraphs, 
    loadGraph, 
    newGraph, 
    saveCurrentGraph, 
    deleteSavedGraph,
    loadSavedGraphsList 
  } = useGraphStore();

  const [activeTab, setActiveTab] = useState<'templates' | 'saved'>('templates');
  const [saveName, setSaveName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadSavedGraphsList();
    }
  }, [isOpen, loadSavedGraphsList]);

  // Sync save name with currentGraphName when opening
  const prevIsOpenRef = useRef(isOpen);
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setSaveName(currentGraphName);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, currentGraphName]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNewGraph = () => {
    newGraph();
    onClose();
    if (onNewBlankGraph) {
      onNewBlankGraph();
    }
    onGraphLoaded?.();
  };

  const handleLoadSample = (sample: SampleGraph) => {
    loadGraph(sample.nodes, sample.edges, sample.name);
    onClose();
    onGraphLoaded?.();
  };

  const handleLoadSaved = (saved: typeof savedGraphs[0]) => {
    loadGraph(saved.nodes, saved.edges, saved.name);
    onClose();
    onGraphLoaded?.();
  };

  const handleSave = () => {
    if (!saveName.trim()) return;
    saveCurrentGraph(saveName.trim());
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsSaving(false);
    }, 1200);
  };

  const handleExportJSON = () => {
    const data = {
      name: currentGraphName,
      exportedAt: new Date().toISOString(),
      nodes,
      edges,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentGraphName.toLowerCase().replace(/\s+/g, '_')}_graph.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json.nodes) && Array.isArray(json.edges)) {
          loadGraph(json.nodes, json.edges, json.name || file.name.replace(/\.json$/, ''));
          onClose();
          onGraphLoaded?.();
        } else {
          alert('Invalid ShaderGraph JSON structure.');
        }
      } catch (err) {
        console.error('Failed to parse graph JSON', err);
        alert('Could not parse graph file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-[94vw] max-w-6xl h-[84vh] min-h-[620px] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex overflow-hidden ring-1 ring-white/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Navigation Sidebar */}
        <div className="w-72 bg-zinc-900/40 border-r border-zinc-800/80 p-5 flex flex-col justify-between shrink-0">
          <div>
            {/* Studio Header */}
            <div className="pb-5 border-b border-zinc-800/70">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200">
                  <FileCode2 size={15} />
                </div>
                <h1 className="text-base font-bold text-zinc-100 tracking-tight">ShaderGraph</h1>
              </div>
              <p className="text-xs font-mono text-zinc-400 mt-1">WORKSPACE MANAGER</p>
            </div>

            {/* Quick Actions */}
            <div className="py-4 border-b border-zinc-800/70 space-y-2">
              <button
                onClick={handleNewGraph}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition-colors shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <Plus size={15} />
                  <span>New Blank Graph</span>
                </div>
                <span className="text-[10px] font-mono opacity-50">Empty</span>
              </button>

              {!isSaving ? (
                <button
                  onClick={() => setIsSaving(true)}
                  className="w-full flex items-center gap-2 px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 text-zinc-300 font-medium text-xs transition-colors"
                >
                  <Save size={14} className="text-zinc-400" />
                  <span>Save Current Canvas</span>
                </button>
              ) : (
                <div className="p-2 bg-zinc-900 border border-zinc-700 rounded-lg space-y-2">
                  <input 
                    type="text" 
                    value={saveName} 
                    onChange={(e) => setSaveName(e.target.value)}
                    placeholder="Project name..."
                    className="w-full bg-zinc-950 border border-zinc-700 px-2.5 py-1.5 rounded text-xs text-zinc-100 outline-none focus:border-zinc-500 font-mono"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  />
                  <div className="flex items-center justify-end gap-1.5">
                    <button 
                      onClick={() => setIsSaving(false)}
                      className="px-2 py-1 text-[11px] text-zinc-400 hover:text-zinc-200"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSave}
                      className="px-3 py-1 bg-zinc-100 hover:bg-white text-zinc-950 rounded text-[11px] font-semibold flex items-center gap-1"
                    >
                      {saveSuccess ? <Check size={12} className="text-emerald-600" /> : 'Save'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Tabs */}
            <div className="pt-4 space-y-1">
              <button
                onClick={() => setActiveTab('templates')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'templates'
                    ? 'bg-zinc-800 text-zinc-100 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Layers size={15} />
                  <span>Starter Templates</span>
                </div>
                <span className="text-[11px] font-mono text-zinc-400 px-1.5 py-0.5 rounded bg-zinc-900">
                  {SAMPLE_GRAPHS.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('saved')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'saved'
                    ? 'bg-zinc-800 text-zinc-100 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Folder size={15} />
                  <span>Saved Projects</span>
                </div>
                <span className="text-[11px] font-mono text-zinc-400 px-1.5 py-0.5 rounded bg-zinc-900">
                  {savedGraphs.length}
                </span>
              </button>
            </div>
          </div>

          {/* Sidebar Bottom: Import/Export & Status */}
          <div className="pt-4 border-t border-zinc-800/70 space-y-3">
            <div className="flex items-center gap-2">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImportJSON} 
                accept=".json" 
                className="hidden" 
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs transition-colors"
                title="Import Graph JSON"
              >
                <Upload size={13} />
                <span>Import JSON</span>
              </button>

              <button
                onClick={handleExportJSON}
                className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs transition-colors"
                title="Export Current Graph JSON"
              >
                <Download size={13} />
                <span>Export JSON</span>
              </button>
            </div>

            <div className="bg-zinc-950/80 p-2.5 rounded-lg border border-zinc-800/60 text-xs">
              <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Active Graph</div>
              <div className="text-zinc-200 font-medium truncate mt-0.5">{currentGraphName}</div>
              <div className="text-[11px] text-zinc-400 mt-0.5 font-mono">{nodes.length} nodes • {edges.length} wires</div>
            </div>

            <div className="pt-1 text-[11px] font-mono text-zinc-500 text-center select-none">
              Created by <span className="text-zinc-300 font-medium">Veol Steve</span>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-zinc-950">
          {/* Header Bar */}
          <div className="px-8 py-5 border-b border-zinc-800/80 flex items-center justify-between shrink-0 bg-zinc-950">
            <div>
              <h2 className="text-lg font-bold text-zinc-100 tracking-tight">
                {activeTab === 'templates' ? 'Starter Templates' : 'Saved Projects'}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {activeTab === 'templates' 
                  ? 'Functional procedural GLSL graph pipelines for immediate inspection and editing.'
                  : 'Locally stored workspace projects saved in this browser.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                Return to Editor (Esc)
              </button>
              <button 
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Main Body */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {activeTab === 'templates' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {SAMPLE_GRAPHS.map((sample) => (
                  <div 
                    key={sample.id}
                    className="bg-zinc-900/50 hover:bg-zinc-900/90 border border-zinc-800/90 hover:border-zinc-700/90 rounded-lg p-4 flex flex-col justify-between transition-all duration-150 group"
                  >
                    <div>
                      {/* Card Top Title & Specs */}
                      <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-zinc-800/70">
                        <div>
                          <h3 className="text-sm font-bold text-zinc-100 group-hover:text-white transition-colors">
                            {sample.name}
                          </h3>
                          <span className="text-[10.5px] font-mono text-zinc-500 mt-0.5 block">
                            GLSL 3.0 ES
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-zinc-300 bg-zinc-800/90 px-2 py-0.5 rounded shrink-0">
                          {sample.nodes.length} nodes
                        </span>
                      </div>

                      {/* Technical Description */}
                      <p className="text-xs text-zinc-400 leading-relaxed my-3">
                        {sample.description}
                      </p>

                      {/* Node Pipeline Flow Chain */}
                      <div className="mb-3">
                        <span className="text-[9.5px] font-mono text-zinc-500 uppercase tracking-wider block mb-1">Data Pipeline</span>
                        <div className="bg-zinc-950/80 border border-zinc-800/80 rounded p-2 text-[10.5px] font-mono text-zinc-300 flex flex-wrap items-center gap-1.5">
                          {sample.pipeline.map((step, idx) => (
                            <span key={step} className="flex items-center gap-1.5">
                              <span className={idx === sample.pipeline.length - 1 ? 'text-zinc-100 font-semibold' : 'text-zinc-400'}>
                                {step}
                              </span>
                              {idx < sample.pipeline.length - 1 && (
                                <ChevronRight size={11} className="text-zinc-600 shrink-0" />
                              )}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Tech Tags */}
                      <div className="flex flex-wrap gap-1 mb-5">
                        {sample.tags.map(tag => (
                          <span key={tag} className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Open Action */}
                    <button
                      onClick={() => handleLoadSample(sample)}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-zinc-800/80 hover:bg-zinc-100 text-zinc-200 hover:text-zinc-950 font-medium text-xs rounded transition-all active:scale-[0.99]"
                    >
                      <span>Load Template</span>
                      <ArrowUpRight size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'saved' && (
              <div>
                {savedGraphs.length === 0 ? (
                  <div className="py-20 text-center max-w-md mx-auto">
                    <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mx-auto mb-3">
                      <Folder size={22} />
                    </div>
                    <h3 className="text-sm font-semibold text-zinc-200">No Saved Projects</h3>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                      Use the "Save Current Canvas" button in the left panel to save graphs to this browser's local storage.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {savedGraphs.map((saved) => (
                      <div 
                        key={saved.id}
                        className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 flex items-center justify-between hover:border-zinc-700 transition-colors"
                      >
                        <div className="min-w-0 flex-1 mr-4">
                          <h4 className="text-sm font-bold text-zinc-200 truncate">{saved.name}</h4>
                          <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono mt-1">
                            <span>{saved.nodeCount || saved.nodes.length} nodes</span>
                            <span>•</span>
                            <span>{saved.edges.length} wires</span>
                            <span>•</span>
                            <span>{new Date(saved.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleLoadSaved(saved)}
                            className="px-3.5 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold rounded-lg transition-colors"
                          >
                            Open
                          </button>
                          <button
                            onClick={() => deleteSavedGraph(saved.id)}
                            className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
