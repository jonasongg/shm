export type RawDataReport = {
  vmId: string;
  timestamp: string;
  cpuUsagePercent: number;
  totalMemory: number;
  freeMemory: number;
  totalSpace: number;
  freeSpace: number;
};

export type DataReport = Pick<RawDataReport, "cpuUsagePercent" | "vmId"> & {
  timestamp: Date;
  totalMemory: string;
  usedMemory: string;
  memoryUsagePercent: number;
  totalSpace: string;
  usedSpace: string;
  spaceUsagePercent: number;
};

export type VmStatus = "Offline" | "Online" | "Degraded";

export type RawVm = {
  id: string;
  name: string;
  status: VmStatus;
  reports: RawDataReport[];
  dependantIds: string[];
  dependencyIds: string[];
};

export type VmType = Omit<RawVm, "reports"> & {
  reports: DataReport[];
};

export type VmStatusUpdate = {
  id: string;
  status: VmStatus;
};

export type SystemStatus = "Ok" | "KafkaBrokerDown";

export type SystemStatusUpdate = {
  status: SystemStatus;
};
