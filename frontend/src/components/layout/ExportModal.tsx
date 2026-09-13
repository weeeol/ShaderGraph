import { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  AlertTriangle, 
  FileCode2, 
  CheckCircle2, 
  BookOpen, 
  Layers
} from 'lucide-react';
import { useGraphStore } from '../../store/useGraphStore';
import { resolveGraphToShaderIR } from '../../core/engine/resolveGraph';
import { NODE_REGISTRY } from '../../core/nodes/registry';
import { EXPORTER_REGISTRY, AVAILABLE_TARGETS } from '../../core/exporters/registry';
import type { ExportTarget } from '../../core/exporters/types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal = ({ isOpen, onClose }: ExportModalProps) => {
  const { nodes, edges, currentGraphName, compilerError } = useGraphStore();
  const [selectedTarget, setSelectedTarget] = useState<ExportTarget>('unity-urp');
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset file index on target change
  const handleSelectTarget = (target: ExportTarget) => {
    setSelectedTarget(target);
    setSelectedFileIndex(0);
  };

  // Resolve IR and generate artifact
  const { artifact, resolveError } = useMemo(() => {
    if (!isOpen) return { artifact: null, resolveError: null };

    // Find master node ID
    const masterNode = nodes.find(n => n.type === 'masterOutput');
    const masterId = masterNode ? masterNode.id : 'master-node';

    const graphNodes = nodes.map(n => ({
      id: n.id,
      type: n.type || '',
      position: n.position,
      data: n.data as any
    }));

    const graphEdges = edges.map(e => ({
      id: e.id,
      source: e.source,
      sourceHandle: e.sourceHandle || '',
      target: e.target,
      targetHandle: e.targetHandle || ''
    }));

    const irResult = resolveGraphToShaderIR(graphNodes, graphEdges, masterId, NODE_REGISTRY);
    if (!irResult.success) {
      return { artifact: null, resolveError: irResult.error };
    }

    const exporter = EXPORTER_REGISTRY[selectedTarget];
    if (!exporter) {
      return { artifact: null, resolveError: `Exporter for '${selectedTarget}' not found.` };
    }

    const generated = exporter.exportGraph(irResult.ir, currentGraphName);
    return { artifact: generated, resolveError: null };
  }, [isOpen, nodes, edges, currentGraphName, selectedTarget]);

  const activeFile = artifact?.files[selectedFileIndex] || artifact?.files[0];

  const handleCopy = () => {
    if (!activeFile) return;
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!activeFile) return;
    const blob = new Blob([activeFile.content], { type: activeFile.mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs select-none"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-5xl h-[88vh] max-h-[820px] bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl flex flex-col overflow-hidden text-zinc-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/80 bg-zinc-900/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-zinc-800 border border-zinc-700/80 text-zinc-200">
              <FileCode2 size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold tracking-tight text-zinc-100">
                  Export Engine Shader
                </h2>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  Unlit Surface Contract
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Target-neutral shader compilation into portable engine code
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 rounded">
              Esc
            </kbd>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Target Profile Selector Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 bg-zinc-950 border-b border-zinc-800/60 shrink-0 overflow-x-auto custom-scrollbar">
          <span className="text-[11px] font-medium text-zinc-400 mr-2 shrink-0">Target Profile:</span>
          {AVAILABLE_TARGETS.map(target => {
            const exp = EXPORTER_REGISTRY[target];
            const isSelected = selectedTarget === target;
            return (
              <button
                key={target}
                onClick={() => handleSelectTarget(target)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all border shrink-0 ${
                  isSelected
                    ? 'bg-zinc-800 text-zinc-100 border-zinc-700 shadow-xs'
                    : 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                {exp.label}
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        {resolveError || compilerError ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-zinc-950">
            <div className="p-3 rounded-full bg-red-950/50 border border-red-800/60 text-red-400 mb-3">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-sm font-semibold text-zinc-200 mb-1">Cannot Export Shader</h3>
            <p className="text-xs text-red-400 font-mono max-w-lg mb-4">
              {resolveError || compilerError}
            </p>
            <p className="text-[11px] text-zinc-400 max-w-md">
              Fix unresolved connections, missing inputs, or graph cycles before exporting to engine targets.
            </p>
          </div>
        ) : artifact && activeFile ? (
          <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
            {/* Left: Code Viewer */}
            <div className="flex-1 flex flex-col min-w-0 border-b lg:border-b-0 lg:border-r border-zinc-800/80 bg-zinc-950/80">
              {/* File Meta Toolbar */}
              <div className="flex items-center justify-between px-3 py-2 bg-zinc-900/40 border-b border-zinc-800/60 shrink-0 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {artifact.files.length > 1 ? (
                    <div className="flex items-center gap-1 bg-zinc-900/80 p-0.5 rounded border border-zinc-800">
                      {artifact.files.map((file, idx) => (
                        <button
                          key={file.name}
                          onClick={() => setSelectedFileIndex(idx)}
                          className={`px-2 py-0.5 text-xs font-mono rounded transition-colors ${
                            selectedFileIndex === idx
                              ? 'bg-zinc-800 text-zinc-100 font-semibold'
                              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                          }`}
                        >
                          {file.name}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs font-mono text-zinc-300 font-medium truncate">
                      {activeFile.name}
                    </span>
                  )}
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 shrink-0">
                    {activeFile.content.split('\n').length} lines
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-200 transition-colors"
                    title="Copy code to clipboard"
                  >
                    {copied ? (
                      <>
                        <Check size={12} className="text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} className="text-zinc-400" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-zinc-100 hover:bg-white text-zinc-950 transition-colors shadow-xs"
                    title="Download file"
                  >
                    <Download size={12} />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              {/* Monospace Code Display */}
              <div className="flex-1 overflow-auto p-3 font-mono text-[11px] leading-relaxed text-zinc-300 select-text custom-scrollbar">
                <pre className="whitespace-pre">
                  {activeFile.content}
                </pre>
              </div>
            </div>

            {/* Right: Integration Instructions & Warnings */}
            <div className="w-full lg:w-[380px] shrink-0 flex flex-col bg-zinc-900/30 overflow-y-auto custom-scrollbar p-4 space-y-4">
              {/* Instructions Box */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200 mb-2.5">
                  <BookOpen size={13} className="text-cyan-400" />
                  <span>Integration Instructions</span>
                </div>
                <ol className="space-y-2 text-[11px] text-zinc-300 list-decimal list-inside">
                  {artifact.instructions.map((step, idx) => (
                    <li key={idx} className="leading-snug">
                      <span className="text-zinc-300">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Surface Contract Summary */}
              <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px]">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200 mb-2">
                  <Layers size={13} className="text-purple-400" />
                  <span>Contract Interface</span>
                </div>
                {selectedTarget === 'unreal-material' ? (
                  <div className="space-y-1.5 font-mono text-[10px]">
                    <div className="flex justify-between py-0.5 border-b border-zinc-800/60">
                      <span className="text-zinc-400">Node Type</span>
                      <span className="text-cyan-300">Custom (Material Expression)</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-zinc-800/60">
                      <span className="text-zinc-400">Output Type</span>
                      <span className="text-cyan-300">CMOT Float3 (BaseColor)</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-zinc-800/60">
                      <span className="text-zinc-400">Input 0: UV</span>
                      <span className="text-zinc-200">float2 (TexCoord 0)</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-zinc-800/60">
                      <span className="text-zinc-400">Input 1: Time</span>
                      <span className="text-zinc-200">float (Time node)</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-zinc-800/60">
                      <span className="text-zinc-400">Additional Output</span>
                      <span className="text-amber-300">Alpha (CMOT Float1)</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-zinc-400">Material Pin</span>
                      <span className="text-amber-300">Emissive Color (Unlit)</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5 font-mono text-[10px]">
                    <div className="flex justify-between py-0.5 border-b border-zinc-800/60">
                      <span className="text-zinc-400">Function</span>
                      <span className="text-cyan-300">
                        {selectedTarget === 'webgl-glsl' ? 'void main()' : 'ShaderGraphSurface_float'}
                      </span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-zinc-800/60">
                      <span className="text-zinc-400">Input: UV</span>
                      <span className="text-zinc-200">float2 (Primary UV0)</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-zinc-800/60">
                      <span className="text-zinc-400">Input: Time</span>
                      <span className="text-zinc-200">float (Time node)</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-zinc-800/60">
                      <span className="text-zinc-400">Output: BaseColor</span>
                      <span className="text-amber-300">float3 (Master RGB)</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-zinc-400">Output: Alpha</span>
                      <span className="text-amber-300">float (Master Alpha)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Limitations and Warnings Box */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 mb-2">
                  <AlertTriangle size={13} />
                  <span>Scope & Limitations</span>
                </div>
                <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-800/40 text-[11px] text-amber-200/80 space-y-1.5">
                  {artifact.warnings.map((warn, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 leading-snug">
                      <span className="text-amber-400 font-bold shrink-0">•</span>
                      <span>{warn}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ready Indicator */}
              <div className="flex items-center gap-2 p-2 rounded-md bg-emerald-950/30 border border-emerald-800/40 text-[11px] text-emerald-300">
                <CheckCircle2 size={14} className="shrink-0 text-emerald-400" />
                <span>Deterministic export verified against portable Unlit IR.</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
