import { VmType } from "@/types/types";
import {
  Background,
  Controls,
  Edge,
  Handle,
  MarkerType,
  Node,
  NodeProps,
  Position,
  ReactFlow,
} from "@xyflow/react";
import { useMemo } from "react";

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

export default function DependencyGraph({ vms }: { vms: VmType[] }) {
  const nodes: CircleNodeType[] = vms.map((vm) => ({
    id: vm.id.toString(),
    data: { label: vm.name },
    position: { x: vm.id * 100, y: 0 },
    type: "circleNode",
  }));

  const edges = vms.flatMap((vm) =>
    vm.dependantIds.map<Edge>((depId) => ({
      id: `${vm.id}-${depId}`,
      source: vm.id.toString(),
      target: depId.toString(),
      markerEnd: MarkerType.Arrow,
      animated: true,
    })),
  );

  const nodeTypes = useMemo(() => ({ circleNode: CircleNode }), []);

  return (
    <div className="h-100">
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes}>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
