import React, { useCallback, useRef, useEffect, useState } from "react";
import ForceGraph2D, { NodeObject, LinkObject } from "react-force-graph-2d";

// Base type for node data
export interface NodeData {
  id: string;
  name: string;
  color?: string;
  val?: number;
}

// Complete node type including force graph properties
export type Node = NodeObject<NodeData>;

// Base type for link data
export interface LinkData {
  source: string;
  target: string;
  color?: string;
  value?: number;
}

// Complete link type including force graph properties
export type Link = LinkObject<Node>;

export interface GraphData {
  nodes: Node[];
  links: Link[];
}

interface ForceGraphProps {
  data: GraphData;
  width?: number;
  height?: number;
  onNodeClick?: (node: Node) => void;
  onLinkClick?: (link: Link) => void;
  nodeSize?: number;
  linkWidth?: number;
}

export const ForceGraph: React.FC<ForceGraphProps> = ({
  data,
  width = 800,
  height = 600,
  onNodeClick,
  onLinkClick,
  nodeSize = 8,
  linkWidth = 1,
}) => {
  const fgRef = useRef<any>();
  const [dimensions, setDimensions] = useState({ width, height });
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  useEffect(() => {
    const handleResize = () => {
      const container = fgRef.current?.containerElem;
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: container.clientHeight,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNodeClick = useCallback(
    (node: Node) => {
      setSelectedNode(selectedNode?.id === node.id ? null : node);
      if (onNodeClick) onNodeClick(node);
    },
    [selectedNode, onNodeClick]
  );

  const paintNode = useCallback(
    (node: Node, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const size = nodeSize;
      const fontSize = 12 / globalScale;
      const isSelected = selectedNode?.id === node.id;

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x || 0, node.y || 0, size, 0, 2 * Math.PI);
      ctx.fillStyle = node.color || "#1f77b4";
      ctx.fill();

      // Selected node highlight
      if (isSelected) {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Node label
      if (globalScale > 1) {
        ctx.font = `${fontSize}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#000000";
        ctx.fillText(node.name, node.x || 0, (node.y || 0) + size + fontSize);
      }
    },
    [selectedNode, nodeSize]
  );

  return (
    <div
      className="force-graph-container"
      style={{ width: "100%", height: "100%" }}
    >
      <ForceGraph2D
        ref={fgRef}
        graphData={data}
        width={dimensions.width}
        height={dimensions.height}
        nodeCanvasObject={paintNode}
        nodeCanvasObjectMode={() => "replace"}
        onNodeClick={handleNodeClick}
        onLinkClick={onLinkClick}
        linkWidth={(link) => (link as Link).value || linkWidth}
        linkColor={(link) => (link as Link).color || "#999999"}
        nodeRelSize={nodeSize}
        enableNodeDrag={true}
        // zoomable={true}
        // pannable={true}
        cooldownTicks={100}
      />
    </div>
  );
};

export default ForceGraph;
