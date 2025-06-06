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

export type RawVm = {
  id: number;
  name: string;
  reports: RawDataReport[];
};

export type VmType = {
  id: number;
  name: string;
  reports: DataReport[];
};
