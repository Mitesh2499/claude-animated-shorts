// theSVG UI icons (MIT, https://thesvg.org) inlined from src/icons.json (built by build.py from brand/icons/*.svg).
// They draw with currentColor, so `color` recolours them to the brand palette; every icon shares the same 24-grid and stroke weight.
import React from "react";
import ICONS from "./icons.json";

const LIB = ICONS as Record<string, { vb: string; body: string }>;
/** name = "<slug>" or "<slug>.<look>" (default look duotone), e.g. "bot", "database.outline". Rendered inside an <svg>. */
export const Icon: React.FC<{ name: string; x?: number; y?: number; size?: number; color?: string; opacity?: number; rot?: number }> = ({ name, x = 0, y = 0, size = 48, color = "#0B1220", opacity = 1, rot = 0 }) => {
  const ic = LIB[name] ?? LIB[`${name}.duotone`] ?? LIB[`${name}.outline`];
  if (!ic) return <rect x={x} y={y} width={size} height={size} fill="none" stroke="red" strokeDasharray="4 4" />;
  return (
    <svg x={x} y={y} width={size} height={size} viewBox={ic.vb} overflow="visible" opacity={opacity} style={{ color }}
      transform={rot ? `rotate(${rot} ${x + size / 2} ${y + size / 2})` : undefined}
      dangerouslySetInnerHTML={{ __html: ic.body }} />
  );
};
/** Icon for plain HTML layouts (outside an <svg>). */
export const IconHtml: React.FC<{ name: string; size?: number; color?: string; style?: React.CSSProperties }> = ({ name, size = 48, color = "#0B1220", style }) => (
  <svg width={size} height={size} style={{ flex: "none", ...style }}><Icon name={name} size={size} color={color} /></svg>
);
