"use client";
import { useRef, useEffect } from "react";
import * as d3 from "d3";

interface DataPoint {
  week: string;
  [key: string]: any;
}

interface Line {
  key: string;
  color: string;
  label: string;
}

export default function ProgressChart({
  data,
  lines,
  width = 600,
  height = 260,
  yDomain = [40, 140],
}: {
  data: DataPoint[];
  lines: Line[];
  width?: number;
  height?: number;
  yDomain?: [number, number];
}) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current || !data.length) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    const m = { top: 20, right: 20, bottom: 30, left: 45 };
    const w = width - m.left - m.right;
    const h = height - m.top - m.bottom;
    const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);

    const x = d3.scalePoint().domain(data.map(d => d.week)).range([0, w]).padding(0.3);
    const y = d3.scaleLinear().domain(yDomain).range([h, 0]);

    g.append("g").attr("transform", `translate(0,${h})`).call(d3.axisBottom(x).tickSize(0))
      .selectAll("text").attr("fill", "#64748b").attr("font-size", "11px").attr("font-family", "'Outfit',sans-serif");
    g.append("g").call(d3.axisLeft(y).ticks(5).tickSize(-w))
      .selectAll("text").attr("fill", "#64748b").attr("font-size", "10px");
    g.selectAll(".tick line").attr("stroke", "#1e293b").attr("stroke-dasharray", "2,3");
    g.selectAll(".domain").attr("stroke", "#1e293b");

    lines.forEach(({ key, color }) => {
      const lineGen = d3.line<DataPoint>()
        .x(d => x(d.week)!)
        .y(d => y(d[key]))
        .curve(d3.curveMonotoneX);
      g.append("path").datum(data).attr("d", lineGen).attr("fill", "none").attr("stroke", color).attr("stroke-width", 2.5);
      g.selectAll(`.dot-${key}`).data(data).enter().append("circle")
        .attr("cx", d => x(d.week)!).attr("cy", d => y(d[key])).attr("r", 3.5).attr("fill", color);
    });
  }, [data, lines, width, height, yDomain]);

  return <svg ref={ref} width={width} height={height} style={{ maxWidth: "100%" }} />;
}
