type DataReport = {
  id: number;
  timestamp: string;
  cpuUsagePercent: number;
  name: string;
  totalMemory: number;
  freeMemory: number;
  totalSpace: number;
  freeSpace: number;
};

type DataReportForVm = Pick<DataReport, "cpuUsagePercent"> & {
  timestamp: Date;
  totalMemory: string;
  freeMemory: string;
  memoryUsagePercent: number;
  totalSpace: string;
  freeSpace: string;
  spaceUsagePercent: number;
};
