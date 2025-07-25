import { cn } from "@/lib/utils";
import { VmStatus, VmType } from "@/types/types";
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
import { useTheme } from "next-themes";
import { Dispatch, SetStateAction, useEffect } from "react";
import { baseEdge } from "./dependencySettingsDialog";

type CircleNodeType = Node<{
  label: string;
  status: VmStatus;
}>;

const CircleNode = ({ data: { label, status } }: NodeProps<CircleNodeType>) => {
  return (
    <div
      className={cn(
        "w-20 h-20 rounded-full bg-white dark:bg-accent border-2 flex justify-center items-center hover:border-neutral-500 dark:hover:border-neutral-300 transition-all",
        {
          "bg-red-100 border-neutral-300 dark:bg-red-900 dark:border-neutral-500":
            status === "Offline",
          "bg-orange-100 border-neutral-300 dark:bg-amber-800 dark:border-neutral-500":
            status === "Degraded",
        },
      )}
    >
      {label}
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
    curvature: 0.5,
  });
  const { setEdges } = useReactFlow();

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} />
      <EdgeLabelRenderer>
        <button
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
          }}
          className="absolute p-0.5 rounded-full bg-red-100 hover:bg-red-300 dark:bg-red-900 dark:hover:bg-red-700 border-background dark:border-(--xy-background-color-default) border-6 transition-colors cursor-pointer text-neutral-500 dark:text-neutral-300 hover:text-black dark:hover:text-white"
          data-id={id}
          onClick={() => setEdges((edges) => edges.filter((e) => e.id !== id))}
        >
          <X className="p-1" />
        </button>
      </EdgeLabelRenderer>
    </>
  );
};

const nodeTypes = { circleNode: CircleNode };
const edgeTypes = { deletableEdge: DeletableEdge };

export default function DependencyGraph({
  vms,
  setDependenciesDirty,
  edges,
  setEdges,
  onEdgesChange,
  error,
}: {
  vms: VmType[];
  setDependenciesDirty: Dispatch<SetStateAction<boolean>>;
  edges: Edge[];
  setEdges: Dispatch<SetStateAction<Edge[]>>;
  onEdgesChange: OnEdgesChange<Edge>;
  error: boolean;
}) {
  const initialNodes: CircleNodeType[] = vms.map((vm) => ({
    id: vm.id.toString(),
    data: { label: vm.name, status: vm.status },
    position: { x: 0, y: 0 },
    type: "circleNode",
  }));

  const nodesInitialised = useNodesInitialized();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const { fitView } = useReactFlow();

  const statusChanged =
    initialNodes.map((n) => n.data.status).join(",") !==
    nodes.map((n) => n.data.status).join(",");

  useEffect(() => {
    if (nodesInitialised && !statusChanged) {
      setNodes((nodes) => {
        const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
        g.setGraph({ rankdir: "LR", ranksep: 100, nodesep: 30 });
        edges.forEach((e) => g.setEdge(e.source, e.target));
        nodes.forEach((n) => g.setNode(n.id, { ...n, ...n.measured }));
        Dagre.layout(g);

        return nodes.map((n) => ({ ...n, position: g.node(n.id) }));
      });
      fitView({ padding: 0.5 });
    }
  }, [nodesInitialised, statusChanged, setNodes, fitView, edges]);

  if (statusChanged) {
    setNodes((nodes) =>
      nodes.map((node) => {
        const status = vms.find((vm) => vm.id === +node.id)?.status;
        return { ...node, data: { ...node.data, ...(status && { status }) } };
      }),
    );
  }

  const onConnect = (params: Connection) => {
    setDependenciesDirty(true);
    setEdges((edges) => addEdge({ ...params, ...baseEdge }, edges));
  };

  const { theme } = useTheme();

  return (
    <div
      className={cn("h-100 border-2 rounded-xl transition-all", {
        "border-destructive outline-destructive/30 outline-3": error,
      })}
    >
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
        colorMode={theme === "dark" ? "dark" : "light"}
      >
        <Background />
        <Controls
          fitViewOptions={{ duration: 500, padding: 0.5 }}
          showInteractive={false}
        />
      </ReactFlow>
    </div>
  );
}
