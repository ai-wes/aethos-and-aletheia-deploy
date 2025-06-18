import React, { useEffect, useRef, useState } from "react";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Panel
} from "@reactflow/core";
import { Controls } from "@reactflow/controls";
import { Background } from "@reactflow/background";
import dagre from "dagre";
import { gsap } from "gsap";
import { X, ZoomIn, ZoomOut } from "lucide-react";

// Custom node component
const ArgumentNode = ({ data, selected }) => {
  const citationCount = data.citationCount || 0;
  const heatOpacity = Math.min(citationCount / 3, 1);

  return (
    <div
      className={`p-3 rounded-lg border-2 bg-gray-800 min-w-32 max-w-48 ${
        selected
          ? "border-cyan-400 shadow-lg shadow-cyan-400/20"
          : "border-gray-600"
      }`}
      style={{
        backgroundColor:
          citationCount > 0
            ? `rgba(244, 63, 94, ${heatOpacity * 0.3})`
            : "rgb(31, 41, 55)"
      }}
    >
      <div className="text-sm font-semibold text-white mb-1">{data.label}</div>
      {data.era && <div className="text-xs text-gray-400 mb-2">{data.era}</div>}
      <div className="text-xs text-gray-300 line-clamp-3">
        {data.excerpt || data.full_text}
      </div>
      {citationCount > 0 && (
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {citationCount}
        </div>
      )}
    </div>
  );
};

const nodeTypes = {
  argument: ArgumentNode
};

const ReasonGraph = ({ traceData, onClose, sentenceMap = {} }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const containerRef = useRef();

  // Layout nodes using dagre
  const layoutElements = (nodes, edges) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: "TB", ranksep: 100, nodesep: 80 });

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, { width: 200, height: 150 });
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - 100,
          y: nodeWithPosition.y - 75
        }
      };
    });

    return { nodes: layoutedNodes, edges };
  };

  useEffect(() => {
    if (!traceData?.nodes || !traceData?.links) return;

    // Calculate citation counts from sentence map
    const citationCounts = {};
    Object.values(sentenceMap).forEach((weights) => {
      Object.entries(weights).forEach(([nodeId, weight]) => {
        citationCounts[nodeId] = (citationCounts[nodeId] || 0) + 1;
      });
    });

    // Convert trace data to React Flow format
    const flowNodes = traceData.nodes.map((node, index) => ({
      id: node.id || `node-${index}`,
      type: "argument",
      data: {
        label: node.author || `Node ${index + 1}`,
        excerpt: node.excerpt || node.content,
        full_text: node.full_text,
        era: node.era,
        citationCount: citationCounts[node.id] || 0
      },
      position: { x: 0, y: 0 } // Will be set by layout
    }));

    const flowEdges = traceData.links.map((link, index) => ({
      id: `edge-${index}`,
      source: link.source,
      target: link.target,
      animated:
        traceData.focusPath &&
        traceData.focusPath.includes(link.source) &&
        traceData.focusPath.includes(link.target),
      style: {
        stroke:
          traceData.focusPath &&
          traceData.focusPath.includes(link.source) &&
          traceData.focusPath.includes(link.target)
            ? "#06b6d4"
            : "#6b7280",
        strokeWidth:
          traceData.focusPath &&
          traceData.focusPath.includes(link.source) &&
          traceData.focusPath.includes(link.target)
            ? 3
            : 1
      }
    }));

    const { nodes: layoutedNodes, edges: layoutedEdges } = layoutElements(
      flowNodes,
      flowEdges
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [traceData, sentenceMap, setNodes, setEdges]);

  // Animation on mount
  useEffect(() => {
    if (nodes.length === 0) return;

    const container = containerRef.current;
    if (!container) return;

    // Animate container in
    gsap.fromTo(
      container,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" }
    );

    // Stagger animate nodes in
    const nodeElements = container.querySelectorAll("[data-id]");
    gsap.fromTo(
      nodeElements,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.3,
        stagger: 0.1,
        delay: 0.3
      }
    );
  }, [nodes]);

  const handleNodeClick = (event, node) => {
    setSelectedNode(node);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div
        ref={containerRef}
        className="bg-gray-900 rounded-lg w-full max-w-6xl h-5/6 flex flex-col border border-gray-700"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">
            Argument Flow Graph
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Graph Container */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-gray-950"
          >
            <Controls
              className="bg-gray-800 border-gray-600"
              showInteractive={false}
            />
            <Background color="#374151" gap={20} />

            <Panel
              position="top-right"
              className="bg-gray-800 p-2 rounded border border-gray-600"
            >
              <div className="text-xs text-gray-300 space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-cyan-400 rounded"></div>
                  <span>Focus Path</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>High Citations</span>
                </div>
              </div>
            </Panel>
          </ReactFlow>
        </div>

        {/* Side Card for Selected Node */}
        {selectedNode && (
          <div className="absolute right-4 top-20 w-80 bg-gray-800 border border-gray-600 rounded-lg p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white">
                {selectedNode.data.label}
              </h3>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedNode.data.era && (
              <div className="text-sm text-gray-400 mb-2">
                Era: {selectedNode.data.era}
              </div>
            )}

            <div className="text-sm text-gray-200 leading-relaxed">
              {selectedNode.data.full_text || selectedNode.data.excerpt}
            </div>

            {selectedNode.data.citationCount > 0 && (
              <div className="mt-3 text-xs text-red-400">
                Cited {selectedNode.data.citationCount} times in response
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReasonGraph;
