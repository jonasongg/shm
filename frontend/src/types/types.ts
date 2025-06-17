export type RawDataReport = {
  vmId: number;
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
  id: number;
  name: string;
  status: VmStatus;
  reports: RawDataReport[];
  dependantIds: number[];
  dependencyIds: number[];
};

export type VmType = Omit<RawVm, "reports"> & {
  reports: DataReport[];
};

export type VmStatusUpdate = {
  id: number;
  status: VmStatus;
};
