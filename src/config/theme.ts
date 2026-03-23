/**
 * Centralized color palette for BytePDF.
 *
 * The primary scale is derived from #4db8a8.
 * Use Tailwind classes (`primary-500`, `primary-600`, …) in markup — they are
 * registered via `@theme` in index.css.  Import from here only when you need
 * raw hex values (e.g. inline SVG fills).
 */
export const colors = {
  primary: {
    50: "#eefaf7",
    100: "#d5f2ec",
    200: "#aee6db",
    300: "#7dd5c5",
    400: "#4db8a8",
    500: "#3da396",
    600: "#318680",
    700: "#296c68",
    800: "#235654",
    900: "#1d4644",
  },
  /** Slightly shifted hue for gradients (deeper teal-blue) */
  accent: "#2e9e9e",
} as const;
