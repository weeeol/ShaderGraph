import { useGraphStore } from '../../store/useGraphStore';

export const GLSLViewer = () => {
  const { glslCode } = useGraphStore();

  return (
    <div className="h-full flex flex-col overflow-hidden relative group bg-[#0d0d0f]">
      <div className="absolute top-0 left-0 w-full p-3 flex justify-between items-center z-10 bg-gradient-to-b from-[#0d0d0f]/90 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <h3 className="text-[10px] font-bold text-text/80 uppercase tracking-widest pointer-events-auto shadow-black drop-shadow-md">GLSL Output</h3>
      </div>
      <div className="flex-1 overflow-auto p-4 custom-scrollbar bg-[#0d0d0f]">
        <pre className="text-[10px] font-mono leading-relaxed text-text-muted/80 break-all whitespace-pre-wrap selection:bg-accent/30 selection:text-text">
          {glslCode || "// Graph is empty."}
        </pre>
      </div>
    </div>
  );
};
