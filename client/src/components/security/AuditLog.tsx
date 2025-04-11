import { useState } from "react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuditLog as AuditLogType } from "@shared/schema";

// Sample audit log categories
const LOG_CATEGORIES = [
  "All",
  "Authentication",
  "Authorization",
  "Data Access",
  "Configuration",
  "Dependency",
  "Model Training",
  "System",
];

interface AuditLogProps {
  logs: AuditLogType[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function AuditLog({ logs, isLoading = false, onRefresh }: AuditLogProps) {
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [timeRange, setTimeRange] = useState<string>("all");

  // Filter logs based on selected filters
  const filteredLogs = logs.filter((log) => {
    // Filter by category
    const categoryMatch =
      filterCategory === "All" || log.action.startsWith(filterCategory);

    // Filter by search term
    const searchMatch =
      searchTerm === "" ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName?.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter by time range
    let timeMatch = true;
    const now = new Date();
    const logDate = new Date(log.createdAt || new Date());

    if (timeRange === "today") {
      const today = new Date(now.setHours(0, 0, 0, 0));
      timeMatch = logDate >= today;
    } else if (timeRange === "week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      timeMatch = logDate >= weekAgo;
    } else if (timeRange === "month") {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      timeMatch = logDate >= monthAgo;
    }

    return categoryMatch && searchMatch && timeMatch;
  });

  // Get severity class for log entry
  const getSeverityClass = (action: string): string => {
    if (action.includes("delete") || action.includes("remove")) {
      return "text-red-500 bg-red-50 border-red-200";
    } else if (action.includes("update") || action.includes("modify")) {
      return "text-amber-500 bg-amber-50 border-amber-200";
    } else if (action.includes("create") || action.includes("add")) {
      return "text-green-500 bg-green-50 border-green-200";
    } else if (action.includes("login") || action.includes("access")) {
      return "text-blue-500 bg-blue-50 border-blue-200";
    }
    return "text-gray-500 bg-gray-50 border-gray-200";
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Audit Log</CardTitle>
            <CardDescription>
              Comprehensive record of all system activities
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center"
          >
            <i className={`material-icons mr-1 ${isLoading ? "animate-spin" : ""}`}>
              refresh
            </i>
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <Select
              value={filterCategory}
              onValueChange={(value) => setFilterCategory(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {LOG_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={timeRange}
              onValueChange={(value) => setTimeRange(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 days</SelectItem>
                <SelectItem value="month">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Timestamp</TableHead>
                <TableHead className="w-[150px]">User</TableHead>
                <TableHead className="w-[180px]">Action</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="w-[150px]">IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex justify-center items-center">
                      <i className="material-icons animate-spin mr-2">refresh</i>
                      Loading audit logs...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs">
                      {log.createdAt
                        ? format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss")
                        : "Unknown"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <i className="material-icons text-gray-400">person</i>
                        <span>{log.userName || "System"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityClass(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="max-w-md truncate">
                        {typeof log.details === "object"
                          ? JSON.stringify(log.details)
                          : log.details || "No details"}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {log.ipAddress || "Unknown"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex flex-col items-center">
                      <i className="material-icons text-4xl text-gray-300 mb-2">
                        search_off
                      </i>
                      <p className="text-gray-500">No audit logs found</p>
                      <p className="text-sm text-gray-400">
                        Try changing your search criteria
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
          <div>
            Showing{" "}
            <span className="font-medium">{filteredLogs.length}</span> of{" "}
            <span className="font-medium">{logs.length}</span> logs
          </div>
          <div className="flex space-x-4">
            <Button variant="ghost" size="sm" className="h-8">
              <i className="material-icons mr-1">download</i>
              Export
            </Button>
            <Button variant="ghost" size="sm" className="h-8">
              <i className="material-icons mr-1">visibility_off</i>
              Clear
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}