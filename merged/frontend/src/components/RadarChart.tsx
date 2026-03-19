"use client";
import { useRef, useEffect } from "react";
import * as d3 from "d3";

interface RadarProduct {
  name?: string; brand?: string;
  sProt?: number | null; sSante?: number | null;
  bcaa?: number | null; leu?: number | null;
  score_proteique?: number | null; score_sante?: number | null;
  bcaa_per_100g_prot?: number | null; leucine_g?: number | null;
}

export default function RadarChart({ products, size = 300 }: { products: RadarProduct[]; size?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const cats = ["Protéines", "Santé", "BCAA", "Leucine"];
  const cols = ["#3b82f6", "#f59e0b", "#22c55e", "#a855f7", "#ef4444"];

  useEffect(() => {
    if (!ref.current || !products.length) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    const m = 50, r = (size - m * 2) / 2, cx = size / 2, cy = size / 2;
    const angles = cats.map((_, i) => (i * 2 * Math.PI) / cats.length - Math.PI / 2);

    [2, 4, 6, 8, 10].forEach(lev => {
      const pts = angles.map(a => [cx + (r * lev / 10) * Math.cos(a), cy + (r * lev / 10) * Math.sin(a)]);
      svg.append("polygon").attr("points", pts.map(p => p.join(",")).join(" "))
        .attr("fill", "none").attr("stroke", "#1e293b").attr("stroke-width", 0.6);
    });

    angles.forEach((a, i) => {
      svg.append("line").attr("x1", cx).attr("y1", cy)
        .attr("x2", cx + r * Math.cos(a)).attr("y2", cy + r * Math.sin(a))
        .attr("stroke", "#1e293b").attr("stroke-width", 0.5);
      svg.append("text")
        .attr("x", cx + (r + 20) * Math.cos(a)).attr("y", cy + (r + 20) * Math.sin(a))
        .attr("text-anchor", "middle").attr("dominant-baseline", "central")
        .attr("fill", "#94a3b8").attr("font-size", "11px").attr("font-family", "'Outfit',sans-serif")
        .text(cats[i]);
    });

    products.forEach((p, idx) => {
      const sp = (p.sProt ?? p.score_proteique ?? 0) as number;
      const ss = (p.sSante ?? p.score_sante ?? 0) as number;
      const bc = (p.bcaa ?? p.bcaa_per_100g_prot ?? 0) as number;
      const le = (p.leu ?? p.leucine_g ?? 0) as number;
      const vals = [Math.min(sp, 10), Math.min(ss, 10), Math.min(bc / 3, 10), Math.min(le / 1.5, 10)];
      const pts = vals.map((v, i) => [cx + (r * v / 10) * Math.cos(angles[i]), cy + (r * v / 10) * Math.sin(angles[i])]);
      const c = cols[idx % cols.length];
      svg.append("polygon").attr("points", pts.map(p => p.join(",")).join(" "))
        .attr("fill", c).attr("fill-opacity", 0.1).attr("stroke", c).attr("stroke-width", 2);
      pts.forEach(([x, y]) => svg.append("circle").attr("cx", x).attr("cy", y).attr("r", 3).attr("fill", c));
    });
  }, [products, size]);

  return <svg ref={ref} width={size} height={size} />;
}
