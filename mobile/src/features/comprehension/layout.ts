/** Stable layout math shared by native and web (RN handles text wrapping). */
export function readingMetrics(viewportWidth: number): {
  contentWidth: number;
  fontSize: number;
  lineHeight: number;
  touchMinHeight: number;
} {
  const width = Number.isFinite(viewportWidth) ? Math.max(0, viewportWidth) : 0;
  const contentWidth = Math.min(760, Math.max(0, width - 32));
  return {
    contentWidth,
    fontSize: width < 400 ? 18 : 20,
    lineHeight: width < 400 ? 31 : 35,
    touchMinHeight: 48,
  };
}
