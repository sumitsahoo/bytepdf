import type { Tool } from "../types.ts";

interface ToolCardProps {
  tool: Tool;
  onClick: () => void;
}

export function ToolCard({ tool, onClick }: ToolCardProps) {
  return (
    <button
      onClick={onClick}
      className="group bg-white rounded-xl border border-slate-200 p-6 text-left hover:border-primary-300 hover:shadow-lg hover:shadow-primary-100/50 transition-all duration-200 cursor-pointer"
    >
      <div className="w-12 h-12 bg-primary-50 group-hover:bg-primary-100 rounded-xl flex items-center justify-center mb-4 transition-colors text-2xl">
        {tool.icon}
      </div>
      <h3 className="font-semibold text-slate-800 mb-1">{tool.title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{tool.description}</p>
    </button>
  );
}
