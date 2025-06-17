import React, { useEffect, useRef, useMemo, useState } from "react";
import * as d3 from "d3";
import { Popover } from "@headlessui/react";
import { useAnalysis } from "../contexts/AnalysisContext";

const FRAMEWORK_COLORS = {
  Utilitarian: "#1e7ded",
  Deontological: "#7c3aed",
  "Virtue Ethics": "#059669",
  "Buddhist Ethics": "#dc2626",
  "Stoic Ethics": "#6b7280",
  "Care Ethics": "#ec4899",
  "Natural Law": "#f59e0b",
  "Confucian Ethics": "#3b82f6"
};

const CompassWheel = ({ frameworks = [], onFrameworkClick, isAnalyzing = false }) => {
  const svgRef = useRef();
  const { setActiveFramework } = useAnalysis();
  const [hoveredFramework, setHoveredFramework] = useState(null);

  const processedData = useMemo(() => {
    if (!frameworks || frameworks.length === 0) return [];

    return frameworks.map((fw) => ({
      framework: fw.framework,
      weight: fw.weight || 0,
      color: FRAMEWORK_COLORS[fw.framework] || "#6b7280",
      retrievedDocs: fw.retrieved_docs || [],
      avgRelevance: fw.retrieved_docs
        ? fw.retrieved_docs.reduce((sum, doc) => sum + (doc.score || 0), 0) /
          fw.retrieved_docs.length
        : 0,
      isTopThree: false // Will be set below
    }));
  }, [frameworks]);

  const totalWeight = useMemo(
    () => processedData.reduce((sum, d) => sum + d.weight, 0),
    [processedData]
  );

  // Mark top 3 frameworks for special effects
  const enhancedData = useMemo(() => {
    const sorted = [...processedData].sort((a, b) => b.weight - a.weight);
    return processedData.map(item => ({
      ...item,
      isTopThree: sorted.slice(0, 3).some(top => top.framework === item.framework)
    }));
  }, [processedData]);

  useEffect(() => {
    if (!enhancedData.length || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2 - 20;
    const innerRadius = radius * 0.3;

    svg.attr("width", width).attr("height", height);

    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Create pie generator
    const pie = d3
      .pie()
      .value((d) => d.weight)
      .sort(null);

    // Create arc generator
    const arc = d3.arc().innerRadius(innerRadius).outerRadius(radius);

    const hoverArc = d3
      .arc()
      .innerRadius(innerRadius)
      .outerRadius(radius + 10);

    // Create pie slices
    const arcs = g
      .selectAll(".arc")
      .data(pie(enhancedData))
      .enter()
      .append("g")
      .attr("class", "arc")
      .style("cursor", "pointer");

    // Add paths with breathing animation for top frameworks
    const paths = arcs
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => d.data.color)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("opacity", (d) => d.data.isTopThree ? 1 : 0.4) // Fade inactive wedges
      .style("transition", "all 0.3s ease");

    // Add breathing effect for top 3 frameworks
    paths
      .filter((d) => d.data.isTopThree)
      .style("animation", "compass-breathing 3s ease-in-out infinite");

    // Add hover effects
    paths
      .on("mouseenter", function (event, d) {
        setHoveredFramework(d.data.framework);
        d3.select(this)
          .transition()
          .duration(200)
          .attr("d", hoverArc)
          .style("opacity", 1);
      })
      .on("mouseleave", function (event, d) {
        setHoveredFramework(null);
        d3.select(this)
          .transition()
          .duration(200)
          .attr("d", arc)
          .style("opacity", d.data.isTopThree ? 1 : 0.4);
      })
      .on("click", function (event, d) {
        setActiveFramework(d.data.framework);
        if (onFrameworkClick) {
          onFrameworkClick(d.data.framework);
        }
      });

    // Add labels
    arcs
      .append("text")
      .attr("transform", (d) => `translate(${arc.centroid(d)})`)
      .attr("dy", "0.35em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "600")
      .style("fill", "#fff")
      .style("pointer-events", "none")
      .text((d) => {
        const percentage = ((d.data.weight / totalWeight) * 100).toFixed(0);
        return percentage > 5 ? `${percentage}%` : "";
      });

    // Add center needle animation with energy pulse effect
    const needle = g.append("g").attr("class", "needle");

    // Central hub with pulsing effect when analyzing
    const centralHub = needle
      .append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 8)
      .attr("fill", "#ffc34d")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    if (isAnalyzing) {
      centralHub
        .style("animation", "pulse-glow 1.5s ease-in-out infinite")
        .attr("filter", "drop-shadow(0 0 8px #ffc34d)");
    }

    // Energy filaments - spark particles racing along spokes when analyzing
    if (isAnalyzing) {
      enhancedData.forEach((_, index) => {
        const spokeAngle = (index / enhancedData.length) * 2 * Math.PI - Math.PI / 2;
        const spark = needle
          .append("circle")
          .attr("cx", 0)
          .attr("cy", 0)
          .attr("r", 2)
          .attr("fill", "#23d9d9")
          .attr("opacity", 0.8);
        
        // Animate spark racing along spoke
        spark
          .transition()
          .duration(2000)
          .ease(d3.easeLinear)
          .attrTween("transform", () => {
            return (t) => {
              const distance = t * (radius * 0.8);
              const x = distance * Math.cos(spokeAngle);
              const y = distance * Math.sin(spokeAngle);
              return `translate(${x}, ${y})`;
            };
          })
          .attr("opacity", 0)
          .on("end", function() {
            d3.select(this).remove();
          });
      });
    }

    // Animate needle to point to the highest weight framework
    if (enhancedData.length > 0) {
      const maxWeight = Math.max(...enhancedData.map((d) => d.weight));
      const maxFramework = enhancedData.find((d) => d.weight === maxWeight);
      const maxIndex = enhancedData.indexOf(maxFramework);

      const angle =
        (maxIndex / enhancedData.length) * 2 * Math.PI - Math.PI / 2;

      const needleLine = needle
        .append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", -radius * 0.7)
        .attr("stroke", "#ffc34d")
        .attr("stroke-width", 3)
        .attr("stroke-linecap", "round")
        .style("transform-origin", "0 0")
        .style("transform", "rotate(0deg)");

      if (isAnalyzing) {
        needleLine.attr("filter", "drop-shadow(0 0 4px #ffc34d)");
      }

      needleLine
        .transition()
        .duration(1500)
        .ease(d3.easeElastic.period(0.5))
        .style("transform", `rotate(${angle + Math.PI / 2}rad)`);
    }
  }, [enhancedData, totalWeight, setActiveFramework, onFrameworkClick, isAnalyzing]);

  const SparklinePopover = ({ framework }) => (
    <Popover className="relative">
      <Popover.Button className="outline-none">
        <div className="w-4 h-4 bg-blue-500 rounded-full opacity-0 hover:opacity-100 transition-opacity" />
      </Popover.Button>
      <Popover.Panel className="absolute z-10 w-64 p-3 mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-lg">
        <div className="text-sm text-white mb-2 font-semibold">
          {framework.framework}
        </div>
        <div className="text-xs text-gray-300 mb-2">
          Relevance Scores: Avg {framework.avgRelevance.toFixed(2)} | Max{" "}
          {Math.max(
            ...framework.retrievedDocs.map((d) => d.score || 0)
          ).toFixed(2)}
        </div>
        <div className="h-8 flex items-end space-x-1">
          {framework.retrievedDocs.slice(0, 10).map((doc, i) => (
            <div
              key={i}
              className="bg-cyan-400 rounded-sm flex-1"
              style={{ height: `${(doc.score || 0) * 100}%` }}
            />
          ))}
        </div>
      </Popover.Panel>
    </Popover>
  );

  return (
    <div className="relative">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">Moral Compass</h3>
        <p className="text-sm text-gray-400">Framework confidence analysis</p>
      </div>

      <div className="relative flex justify-center">
        <svg ref={svgRef} className="drop-shadow-lg" />

        {/* Framework legend with tooltips */}
        <div className="absolute -right-4 top-0 space-y-2">
          {processedData.map((framework, index) => (
            <div
              key={framework.framework}
              className="flex items-center space-x-2"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: framework.color }}
              />
              <span className="text-xs text-gray-300">
                {framework.framework.split(" ")[0]}
              </span>
              <SparklinePopover framework={framework} />
            </div>
          ))}
        </div>
      </div>

      {processedData.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          No framework analysis available
        </div>
      )}
    </div>
  );
};

export default CompassWheel;
