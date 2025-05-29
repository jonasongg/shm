type RawDataReport = {
  id: number;
  timestamp: string;
  cpuUsagePercent: number;
  name: string;
  totalMemory: number;
  freeMemory: number;
  totalSpace: number;
  freeSpace: number;
};

type DataReport = Pick<RawDataReport, "cpuUsagePercent"> & {
  name: string;
  timestamp: Date;
  totalMemory: string;
  usedMemory: string;
  memoryUsagePercent: number;
  totalSpace: string;
  usedSpace: string;
  spaceUsagePercent: number;
};
