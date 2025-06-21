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
  Node,
  NodeProps,
  OnEdgesChange,
  Position,
  ReactFlow,
  useNodesInitialized,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import { X } from "lucide-react";
import { Dispatch, SetStateAction, useCallback, useEffect } from "react";
import { baseEdge } from "./dependencySettingsDialog";

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
  g.setGraph({ rankdir: "LR", ranksep: 100, nodesep: 30 });

  edges.forEach((e) => g.setEdge(e.source, e.target));
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

export default function DependencyGraph({
  vms,
  setDependenciesDirty,
  edges,
  setEdges,
  onEdgesChange,
}: {
  vms: VmType[];
  setDependenciesDirty: Dispatch<SetStateAction<boolean>>;
  edges: Edge[];
  setEdges: Dispatch<SetStateAction<Edge[]>>;
  onEdgesChange: OnEdgesChange<Edge>;
}) {
  const initialNodes: CircleNodeType[] = vms.map((vm) => ({
    id: vm.id.toString(),
    data: { label: vm.name },
    position: { x: vm.id * 100, y: 0 },
    type: "circleNode",
  }));

  const nodesInitialized = useNodesInitialized();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const { fitView } = useReactFlow();

  const onLayout = useCallback(() => {
    const layouted = getLayoutedElements(nodes, edges);

    setNodes([...layouted.nodes]);
    setEdges([...layouted.edges]);
  }, [nodes, edges]);

  useEffect(() => {
    if (nodesInitialized) {
      onLayout();
      fitView({
        padding: 0.5,
      });
    }
  }, [nodesInitialized]);

  const onConnect = useCallback((params: Connection) => {
    setDependenciesDirty(true);
    setEdges((edges) => addEdge({ ...params, ...baseEdge }, edges));
  }, []);

  return (
    <div className="h-100 border-2 rounded-xl">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={(changes) => {
          setDependenciesDirty(true);
          onEdgesChange(changes);
        }}
        onConnect={onConnect}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
