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

type DataReportForVm = Omit<DataReport, "name" | "timestamp"> & {
  timestamp: Date;
};
