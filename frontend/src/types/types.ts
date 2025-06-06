export type RawDataReport = {
  vmId: number;
  timestamp: string;
  cpuUsagePercent: number;
  totalMemory: number;
  freeMemory: number;
  totalSpace: number;
  freeSpace: number;
};

export type RawVm = {
  id: number;
  name: string;
};

export type DataReport = Pick<RawDataReport, "cpuUsagePercent"> & {
  timestamp: Date;
  totalMemory: string;
  usedMemory: string;
  memoryUsagePercent: number;
  totalSpace: string;
  usedSpace: string;
  spaceUsagePercent: number;
};
