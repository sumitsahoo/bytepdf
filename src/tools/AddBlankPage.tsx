/**
 * Add Blank Page tool.
 *
 * Loads a PDF and displays its pages as thumbnails. The user drags the
 * blank page placeholder to the desired insertion position.
 */

import { useState, useCallback } from "react";
import { FileDropZone } from "../components/FileDropZone.tsx";
import { downloadPdf, formatFileSize } from "../utils/file-helpers.ts";
import { addBlankPage } from "../utils/pdf-operations.ts";
import { renderAllThumbnails } from "../utils/pdf-renderer.ts";

export default function AddBlankPage() {
  const [file, setFile] = useState<File | null>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  // Stable IDs for thumbnails to avoid index-based keys.
  const [thumbnailIds, setThumbnailIds] = useState<string[]>([]);
  // insertPosition is the 0-based index at which the blank page will be inserted.
  // 0 = before page 1, thumbnails.length = after the last page.
  const [insertPosition, setInsertPosition] = useState(0);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverPosition, setDragOverPosition] = useState<number | null>(null);

  const handleFile = useCallback(async (files: File[]) => {
    const pdf = files[0];
    if (!pdf) return;
    setFile(pdf);
    setError(null);
    setLoading(true);
    try {
      const thumbs = await renderAllThumbnails(pdf);
      setThumbnails(thumbs);
      setThumbnailIds(thumbs.map((_, idx) => `thumb-${idx}-${Date.now()}`));
      setInsertPosition(thumbs.length); // default: append at end
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Failed to load PDF. The file may be corrupted or password-protected.",
      );
      setFile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInsert = useCallback(async () => {
    if (!file) return;
    setProcessing(true);
    setError(null);
    try {
      const result = await addBlankPage(file, insertPosition);
      const baseName = file.name.replace(/\.pdf$/i, "");
      downloadPdf(result, `${baseName}_blank_added.pdf`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to insert blank page. Please try again.");
    } finally {
      setProcessing(false);
    }
  }, [file, insertPosition]);

  const positionLabel =
    insertPosition === 0
      ? "Before page 1 (at the beginning)"
      : insertPosition === thumbnails.length
        ? `After page ${thumbnails.length} (at the end)`
        : `Before page ${insertPosition + 1}`;

  // Single stable layout: [dropzone_0] [page_0] [dropzone_1] [page_1] ... [page_N-1] [dropzone_N]
  // The dropzone at insertPosition renders the draggable "New" card.
  // Other dropzones are invisible gaps that expand into drop targets while dragging.
  // Keeping the DOM structure stable prevents the drag from being cancelled when
  // the draggable element would otherwise be removed on re-render.
  const renderPageRow = () => {
    const items: React.ReactNode[] = [];

    for (let i = 0; i <= thumbnails.length; i++) {
      const isInsertHere = i === insertPosition;
      const isOver = dragOverPosition === i;
      const dropId = thumbnailIds[i] ?? "drop-end";

      if (isInsertHere) {
        items.push(
          <button
            key="new-blank-page"
            type="button"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = "move";
              setIsDragging(true);
            }}
            onDragEnd={() => {
              setIsDragging(false);
              setDragOverPosition(null);
            }}
            className="shrink-0 flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing border-0 bg-transparent p-0"
          >
            <div className="w-16 aspect-3/4 rounded-lg border-2 border-dashed border-primary-400 bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
              <span className="text-primary-500 text-xl font-light">+</span>
            </div>
            <span className="text-xs text-primary-500 font-medium">New</span>
          </button>,
        );
      } else {
        items.push(
          <button
            key={`drop-${dropId}`}
            type="button"
            aria-label={`Insert before page ${i + 1}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverPosition(i);
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setDragOverPosition(null);
              }
            }}
            onDrop={(e) => {
              e.preventDefault();
              setInsertPosition(i);
              setIsDragging(false);
              setDragOverPosition(null);
            }}
            className={`shrink-0 self-stretch flex items-center justify-center rounded-lg transition-all duration-150 border-0 bg-transparent p-0 ${
              isDragging ? (isOver ? "w-16 bg-primary-50 dark:bg-primary-900/20" : "w-4") : "w-1"
            }`}
          >
            {isDragging && (
              <div
                className={`rounded-full transition-all duration-150 ${
                  isOver
                    ? "w-1 h-14 bg-primary-500"
                    : "w-0.5 h-10 bg-primary-200 dark:bg-primary-800"
                }`}
              />
            )}
          </button>,
        );
      }

      if (i < thumbnails.length) {
        items.push(
          <div key={thumbnailIds[i]} className="shrink-0 flex flex-col items-center gap-1">
            <img
              src={thumbnails[i]}
              className="w-16 aspect-3/4 object-cover rounded-lg border border-slate-200 dark:border-dark-border"
              alt={`Page ${i + 1}`}
            />
            <span className="text-xs text-slate-400 dark:text-dark-text-muted">{i + 1}</span>
          </div>,
        );
      }
    }

    return items;
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <FileDropZone
          accept=".pdf,application/pdf"
          onFiles={handleFile}
          label="Drop a PDF file here"
          hint="A blank page will be inserted at your chosen position"
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600 dark:text-dark-text-muted">
              <span className="font-medium">{file.name}</span> — {formatFileSize(file.size)}
            </p>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setThumbnails([]);
                setThumbnailIds([]);
              }}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Change file
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700 dark:text-dark-text">
                  {isDragging
                    ? "Drop the page at the desired position"
                    : "Drag the new page to set its position"}
                </p>
                <div className="flex items-end gap-2 overflow-x-auto pb-2 min-h-22">
                  {renderPageRow()}
                </div>
                <p className="text-sm text-primary-600 font-medium">{positionLabel}</p>
              </div>

              <button
                type="button"
                onClick={handleInsert}
                disabled={processing}
                className="w-full bg-primary-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {processing ? "Inserting…" : "Insert Blank Page & Download"}
              </button>
            </>
          )}
        </>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}
    </div>
  );
}
