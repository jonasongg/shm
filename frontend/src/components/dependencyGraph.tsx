import { VmType } from "@/types/types";
import Dagre from "@dagrejs/dagre";
import {
  addEdge,
  Background,
  BaseEdge,
  Connection,
  Controls,
  Edge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  Handle,
  MarkerType,
  Node,
  NodeProps,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesInitialized,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import { X } from "lucide-react";
import { useCallback, useEffect } from "react";

type CircleNodeType = Node<{
  label: string;
}>;

const CircleNode = ({ data }: NodeProps<CircleNodeType>) => {
  return (
    <div className="w-20 h-20 rounded-full bg-white border-2 flex justify-center items-center hover:border-neutral-500 transition-all">
      {data.label}
      <Handle type="source" position={Position.Right} />
      <Handle type="target" position={Position.Left} />
    </div>
  );
};

const DeletableEdge = ({
  id,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  markerEnd,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const { setEdges } = useReactFlow();

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} />
      <EdgeLabelRenderer>
        <div
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
          }}
          className="absolute p-3 opacity-20 hover:opacity-100 transition-opacity rounded-full"
          onClick={() => setEdges((edges) => edges.filter((e) => e.id !== id))}
        >
          <X className="bg-red-300 p-1 rounded-full" />
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

const nodeTypes = { circleNode: CircleNode };
const edgeTypes = { deletableEdge: DeletableEdge };

const getLayoutedElements = (nodes: CircleNodeType[], edges: Edge[]) => {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "LR" });

  edges.forEach((e) => g.setEdge(e.source, e.target));
  console.log(nodes.map((n) => n.measured));
  nodes.forEach((n) =>
    g.setNode(n.id, {
      ...n,
      width: n.measured?.width ?? 0,
      height: n.measured?.height ?? 0,
    }),
  );

  Dagre.layout(g);

  return {
    nodes: nodes.map((n) => {
      const position = g.node(n.id);
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      const x = position.x - (n.measured?.width ?? 0) / 2;
      const y = position.y - (n.measured?.height ?? 0) / 2;

      return { ...n, position: { x, y } };
    }),
    edges,
  };
};

export default function DependencyGraph({ vms }: { vms: VmType[] }) {
  const initialNodes: CircleNodeType[] = vms.map((vm) => ({
    id: vm.id.toString(),
    data: { label: vm.name },
    position: { x: vm.id * 100, y: 0 },
    type: "circleNode",
  }));

  const baseEdge = {
    markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
    animated: true,
    type: "deletableEdge",
  };
  const initialEdges = vms.flatMap((vm) =>
    vm.dependantIds.map<Edge>((depId) => ({
      ...baseEdge,
      id: `${vm.id}-${depId}`,
      source: vm.id.toString(),
      target: depId.toString(),
    })),
  );

  const nodesInitialized = useNodesInitialized();

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onLayout = useCallback(() => {
    const layouted = getLayoutedElements(nodes, edges);

    setNodes([...layouted.nodes]);
    setEdges([...layouted.edges]);
  }, [nodes, edges]);

  useEffect(() => {
    if (nodesInitialized) {
      onLayout();
    }
  }, [nodesInitialized]);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((edges) => addEdge({ ...params, ...baseEdge }, edges)),
    [],
  );

  return (
    <div className="h-100">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
