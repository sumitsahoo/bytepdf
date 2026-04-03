/**
 * Clickable card displayed on the home screen for each available tool.
 *
 * Shows the tool's emoji icon, title, and a short description. Hover
 * state adds a subtle border highlight, shadow, and a cursor-tracking
 * spotlight glow effect.
 *
 * Wrapped in `React.memo` — the parent passes a single stable
 * `onSelect` callback (via `useCallback`) and each `tool` reference
 * comes from a module-level constant array, so cards skip re-renders
 * when unrelated state (e.g. the search query) changes.
 */

import { memo, useCallback, useRef, useState } from "react";
import type { Tool, ToolId } from "../types.ts";

interface ToolCardProps {
  /** Tool metadata (id, title, description, icon). */
  tool: Tool;
  /** Stable callback invoked with the tool's ID when the card is clicked. */
  onSelect: (id: ToolId) => void;
}

export const ToolCard = memo(function ToolCard({ tool, onSelect }: ToolCardProps) {
  const cardRef = useRef<HTMLButtonElement>(null);
  const [glowStyle, setGlowStyle] = useState<React.CSSProperties>({ opacity: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setGlowStyle({
      opacity: 1,
      background: `radial-gradient(300px circle at ${x}px ${y}px, rgba(37,99,235,0.08), transparent 70%)`,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setGlowStyle({ opacity: 0 });
  }, []);

  return (
    <button
      ref={cardRef}
      onClick={() => onSelect(tool.id as ToolId)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative overflow-hidden bg-white dark:bg-dark-surface rounded-xl border border-slate-200 dark:border-dark-border p-6 text-left hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-lg hover:shadow-primary-100/50 dark:hover:shadow-primary-900/30 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
    >
      {/* Cursor spotlight glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl transition-opacity duration-300"
        style={glowStyle}
      />

      <div className="relative z-10 w-12 h-12 bg-primary-50 dark:bg-primary-900/40 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/60 group-hover:scale-110 group-hover:-translate-y-0.5 rounded-xl flex items-center justify-center mb-4 transition-all duration-200 text-2xl">
        {tool.icon}
      </div>
      <h3 className="relative z-10 font-semibold text-slate-800 dark:text-dark-text mb-1">
        {tool.title}
      </h3>
      <p className="relative z-10 text-sm text-slate-500 dark:text-dark-text-muted leading-relaxed">
        {tool.description}
      </p>
    </button>
  );
});
