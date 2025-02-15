import React, {
  useCallback,
  useRef,
  useState,
  useMemo,
  useEffect,
} from "react";
import ForceGraph2D from "react-force-graph-2d";
import { Popover, Text, Paper, CloseButton } from "@mantine/core";

interface EdgeData {
  in: string;
  out: string;
  weight: number;
  in_title?: string;
  out_title?: string;
  in_external_url?: string;
  out_external_url?: string;
  in_vibe?: string;
  out_vibe?: string;
  [key: string]: any;
}

interface ForceGraphProps {
  edges: EdgeData[];
}

const ForceGraph: React.FC<ForceGraphProps> = ({ edges }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 100, height: 100 });
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });

  // Handle container resizing
  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return;
      const parent = containerRef.current.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      setDimensions({
        width: rect.width,
        height: Math.max(rect.height, 400),
      });
    };

    updateDimensions();
    const observer = new ResizeObserver(updateDimensions);
    if (containerRef.current?.parentElement) {
      observer.observe(containerRef.current.parentElement);
    }
    return () => observer.disconnect();
  }, []);

  // Calculate node metrics and graph data
  const graphData = useMemo(() => {
    const inDegree = new Map<string, number>();
    const outDegree = new Map<string, number>();
    const nodeTitles = new Map<string, string>();
    const nodeVibes = new Map<string, string>();

    edges.forEach((edge) => {
      inDegree.set(edge.in, (inDegree.get(edge.in) || 0) + 1);
      outDegree.set(edge.out, (outDegree.get(edge.out) || 0) + 1);
      if (edge.in_title) nodeTitles.set(edge.in, edge.in_title);
      if (edge.out_title) nodeTitles.set(edge.out, edge.out_title);
      if (edge.in_vibe) nodeVibes.set(edge.in, edge.in_vibe);
      if (edge.out_vibe) nodeVibes.set(edge.out, edge.out_vibe);
    });

    const nodeSet = new Set<string>();
    edges.forEach((edge) => {
      nodeSet.add(edge.in);
      nodeSet.add(edge.out);
    });

    const nodes = Array.from(nodeSet).map((id) => ({
      id,
      name: nodeTitles.get(id) || id,
      val: Math.sqrt((inDegree.get(id) || 0) + (outDegree.get(id) || 0)) * 3,
      inDegree: inDegree.get(id) || 0,
      outDegree: outDegree.get(id) || 0,
      vibe: nodeVibes.get(id) || null,
      external_url:
        edges.find((e) => e.in === id)?.in_external_url ||
        edges.find((e) => e.out === id)?.out_external_url,
    }));

    const links = edges.map((edge) => ({
      source: edge.in,
      target: edge.out,
      weight: edge.weight,
      curvature: 0.2,
    }));

    return { nodes, links };
  }, [edges]);

  // Center graph when data or dimensions change
  useEffect(() => {
    if (fgRef.current && graphData.nodes.length > 0) {
      const fg = fgRef.current as any;
      setTimeout(() => {
        fg.zoomToFit(400, 50);
        fg.centerAt(0, 0, 1000);
      }, 300);
    }
  }, [graphData, dimensions]);

  const onNodeClick = useCallback(
    (node: any, event: MouseEvent) => {
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (containerRect && event) {
        setPopoverPosition({
          x: event.clientX - containerRect.left,
          y: event.clientY - containerRect.top,
        });
      }
      setSelectedNode(selectedNode?.id === node.id ? null : node);
    },
    [selectedNode]
  );

  const onBackgroundClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleClosePopover = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const paintNode = useCallback(
    (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const isSelected = selectedNode?.id === node.id;
      const isHovered = hoveredNode === node.id;
      const size = node.val;

      ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
      ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      ctx.beginPath();
      ctx.arc(node.x || 0, node.y || 0, size, 0, 2 * Math.PI);
      ctx.fillStyle = isSelected
        ? "#ff6b6b"
        : node.vibe
        ? node.vibe
        : "#808080";
      ctx.fill();

      ctx.shadowColor = "transparent";

      if (isSelected || isHovered) {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      const showLabel = globalScale > 1 || isHovered || isSelected;
      if (showLabel) {
        const fontSize = isHovered ? 14 / globalScale : 12 / globalScale;
        ctx.font = `${fontSize}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const textWidth = ctx.measureText(node.name).width;
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fillRect(
          (node.x || 0) - textWidth / 2 - 2,
          (node.y || 0) + size + fontSize / 2 - fontSize / 2 - 2,
          textWidth + 4,
          fontSize + 4
        );

        ctx.fillStyle = "#000000";
        ctx.fillText(
          node.name,
          node.x || 0,
          (node.y || 0) + size + fontSize / 2
        );
      }
    },
    [selectedNode, hoveredNode]
  );

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center overflow-hidden relative"
      style={{ minHeight: "400px" }}
    >
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        nodeCanvasObject={paintNode}
        nodeCanvasObjectMode={() => "replace"}
        onNodeClick={onNodeClick}
        onBackgroundClick={onBackgroundClick}
        onNodeHover={(node: any) => setHoveredNode(node ? node.id : null)}
        linkWidth={(link) => Math.sqrt((link as any).weight || 1)}
        linkColor={() => "#999999"}
        linkCurvature="curvature"
        linkDirectionalArrowLength={3}
        linkDirectionalArrowRelPos={0.7}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={2}
        nodeRelSize={1}
        enableNodeDrag={true}
        cooldownTicks={100}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        // centerAt={(0, 0)}
        enableZoomInteraction={true}
        enablePanInteraction={true}
      />

      <Popover
        opened={selectedNode !== null}
        position="right"
        withArrow
        withinPortal={false}
      >
        <Popover.Target>
          <div
            style={{
              position: "absolute",
              left: popoverPosition.x,
              top: popoverPosition.y,
              width: 1,
              height: 1,
            }}
          />
        </Popover.Target>
        <Popover.Dropdown>
          {selectedNode && (
            <Paper p="md" radius="md" className="w-64">
              <div className="flex justify-between items-start mb-2">
                <Text size="lg">{selectedNode.name}</Text>
                <CloseButton onClick={handleClosePopover} />
              </div>
              <Text size="sm" mb="xs">
                <strong>In-degree:</strong> {selectedNode.inDegree}
              </Text>
              <Text size="sm" mb="xs">
                <strong>Out-degree:</strong> {selectedNode.outDegree}
              </Text>
              <Text size="sm" mb="xs">
                <strong>Total connections:</strong>{" "}
                {selectedNode.inDegree + selectedNode.outDegree}
              </Text>
              {selectedNode.vibe && (
                <Text size="sm" mb="xs">
                  <strong>Vibe:</strong> {selectedNode.vibe}
                </Text>
              )}
              {selectedNode.external_url && (
                <Text size="sm" mb="xs">
                  <a
                    href={selectedNode.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 underline"
                  >
                    {selectedNode.external_url}
                  </a>
                </Text>
              )}
            </Paper>
          )}
        </Popover.Dropdown>
      </Popover>
    </div>
  );
};

export default ForceGraph;
