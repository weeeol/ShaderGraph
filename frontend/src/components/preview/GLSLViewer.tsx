import { useState, useMemo } from 'react';
import { useGraphStore } from '../../store/useGraphStore';
import { Copy, Check, Terminal } from 'lucide-react';

export const GLSLViewer = () => {
  const { glslCode } = useGraphStore();
  const [copied, setCopied] = useState(false);

  const lines = useMemo(() => {
    if (!glslCode) return ['// Graph is empty.'];
    return glslCode.split('\n');
  }, [glslCode]);

  const handleCopy = async () => {
    if (!glslCode) return;
    try {
      await navigator.clipboard.writeText(glslCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy GLSL: ', err);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-zinc-950 select-none">
      {/* Studio Header */}
      <div className="h-9 px-3 border-b border-zinc-800/80 bg-zinc-950 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <Terminal size={13} className="text-zinc-400" />
          <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
            GLSL Source
          </h3>
          <span className="text-[9.5px] font-mono px-1 py-0.2 rounded bg-zinc-900/80 border border-zinc-800/80 text-zinc-500">
            {lines.length} lines
          </span>
        </div>

        <button
          onClick={handleCopy}
          disabled={!glslCode}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 hover:border-zinc-700 text-xs font-mono text-zinc-300 hover:text-zinc-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title={copied ? "Copied!" : "Copy GLSL to clipboard"}
        >
          {copied ? (
            <>
              <Check size={11} className="text-emerald-400" />
              <span className="text-emerald-400 text-xs">Copied</span>
            </>
          ) : (
            <>
              <Copy size={11} className="text-zinc-400" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body with Line Numbers */}
      <div className="flex-1 overflow-auto p-3 custom-scrollbar bg-zinc-950 font-mono text-xs select-text">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-zinc-900/40 group">
                <td className="w-9 pr-3 text-right text-zinc-600 select-none text-[11px] align-top font-mono border-r border-zinc-800/50 group-hover:text-zinc-400 transition-colors">
                  {idx + 1}
                </td>
                <td className="pl-3 text-zinc-300 whitespace-pre break-all leading-relaxed align-top font-mono text-[11px]">
                  {line}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
