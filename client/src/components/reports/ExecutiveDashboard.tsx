import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Sample data - this would come from your API in a real implementation
const dependencyTrendData = [
  { month: "Jan", total: 65, resolved: 45, critical: 8 },
  { month: "Feb", total: 78, resolved: 52, critical: 12 },
  { month: "Mar", total: 91, resolved: 58, critical: 15 },
  { month: "Apr", total: 85, resolved: 63, critical: 10 },
  { month: "May", total: 79, resolved: 70, critical: 7 },
  { month: "Jun", total: 92, resolved: 75, critical: 9 },
];

const teamPerformanceData = [
  { name: "Team Alpha", efficiency: 92, responseTime: 1.2, resolution: 85 },
  { name: "Team Beta", efficiency: 78, responseTime: 2.1, resolution: 72 },
  { name: "Team Gamma", efficiency: 86, responseTime: 1.5, resolution: 80 },
  { name: "Team Delta", efficiency: 94, responseTime: 1.0, resolution: 90 },
  { name: "Team Epsilon", efficiency: 81, responseTime: 1.8, resolution: 76 },
];

const dependencyTypeData = [
  { name: "Technical", value: 45 },
  { name: "Business", value: 30 },
  { name: "Design", value: 15 },
  { name: "External", value: 10 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

interface ExecutiveDashboardProps {
  isLoading?: boolean;
  onRefresh?: () => void;
  onExport?: (format: string) => void;
}

export function ExecutiveDashboard({
  isLoading = false,
  onRefresh,
  onExport,
}: ExecutiveDashboardProps) {
  const [timeRange, setTimeRange] = useState("6months");
  const [reportTab, setReportTab] = useState("overview");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Executive Dashboard</h1>
          <p className="text-muted-foreground">
            High-level metrics and insights for leadership
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select
            value={timeRange}
            onValueChange={setTimeRange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="3months">Last quarter</SelectItem>
              <SelectItem value="6months">Last 6 months</SelectItem>
              <SelectItem value="1year">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="flex items-center gap-1"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <i className={`material-icons text-base ${isLoading ? "animate-spin" : ""}`}>refresh</i>
            <span>Refresh</span>
          </Button>
          <Select
            onValueChange={(value) => onExport?.(value)}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Export" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">Export as PDF</SelectItem>
              <SelectItem value="excel">Export as Excel</SelectItem>
              <SelectItem value="ppt">Export as PowerPoint</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Dependencies
                </p>
                <h3 className="text-2xl font-bold mt-1">92</h3>
              </div>
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                <i className="material-icons text-primary">device_hub</i>
              </div>
            </div>
            <div className="flex items-center mt-3 text-xs">
              <span className="text-green-500 font-medium flex items-center">
                <i className="material-icons text-base mr-1">trending_up</i>
                +12%
              </span>
              <span className="text-muted-foreground ml-2">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Critical Dependencies
                </p>
                <h3 className="text-2xl font-bold mt-1">9</h3>
              </div>
              <div className="h-9 w-9 rounded-full bg-red-50 flex items-center justify-center">
                <i className="material-icons text-red-500">priority_high</i>
              </div>
            </div>
            <div className="flex items-center mt-3 text-xs">
              <span className="text-red-500 font-medium flex items-center">
                <i className="material-icons text-base mr-1">trending_down</i>
                -25%
              </span>
              <span className="text-muted-foreground ml-2">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Average Resolution Time
                </p>
                <h3 className="text-2xl font-bold mt-1">8.5 days</h3>
              </div>
              <div className="h-9 w-9 rounded-full bg-amber-50 flex items-center justify-center">
                <i className="material-icons text-amber-500">schedule</i>
              </div>
            </div>
            <div className="flex items-center mt-3 text-xs">
              <span className="text-green-500 font-medium flex items-center">
                <i className="material-icons text-base mr-1">trending_down</i>
                -2.3 days
              </span>
              <span className="text-muted-foreground ml-2">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Optimization Score
                </p>
                <h3 className="text-2xl font-bold mt-1">87/100</h3>
              </div>
              <div className="h-9 w-9 rounded-full bg-green-50 flex items-center justify-center">
                <i className="material-icons text-green-500">auto_graph</i>
              </div>
            </div>
            <div className="flex items-center mt-3 text-xs">
              <span className="text-green-500 font-medium flex items-center">
                <i className="material-icons text-base mr-1">trending_up</i>
                +5 points
              </span>
              <span className="text-muted-foreground ml-2">vs last period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={reportTab} onValueChange={setReportTab}>
        <TabsList className="grid w-full md:w-auto grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="teams">Team Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends & Forecasts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Dependency Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Dependency Trends</CardTitle>
              <CardDescription>
                Tracking dependency counts and resolution rates over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dependencyTrendData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="total"
                      name="Total Dependencies"
                      stackId="a"
                      fill="#8884d8"
                    />
                    <Bar
                      dataKey="resolved"
                      name="Resolved Dependencies"
                      stackId="a"
                      fill="#82ca9d"
                    />
                    <Bar
                      dataKey="critical"
                      name="Critical Dependencies"
                      fill="#ff7300"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Dependency Types Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Dependency Types</CardTitle>
                <CardDescription>
                  Distribution of dependencies by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dependencyTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {dependencyTypeData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
                <CardDescription>
                  AI-generated analysis of dependency trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="mr-3 mt-1">
                      <i className="material-icons text-green-500">trending_down</i>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold">
                        Critical Dependencies Decreasing
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Critical dependencies have decreased by 25% compared to
                        last quarter, indicating improved risk management.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-3 mt-1">
                      <i className="material-icons text-amber-500">warning</i>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold">
                        Technical Debt Risk
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        45% of dependencies are technical, suggesting potential
                        technical debt that may need addressing.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-3 mt-1">
                      <i className="material-icons text-blue-500">insights</i>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold">
                        Resolution Efficiency Improving
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        The ratio of resolved to total dependencies has improved
                        from 69% to 82% over the last 6 months.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-3 mt-1">
                      <i className="material-icons text-purple-500">supervisor_account</i>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold">
                        Team Delta Performance
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Team Delta shows the highest efficiency score at 94%,
                        with the quickest average resolution time.
                      </p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="teams" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Performance Comparison</CardTitle>
              <CardDescription>
                Comparing key performance metrics across teams
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={teamPerformanceData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="efficiency"
                      name="Efficiency Score (%)"
                      fill="#8884d8"
                    />
                    <Bar
                      dataKey="responseTime"
                      name="Response Time (days)"
                      fill="#82ca9d"
                    />
                    <Bar
                      dataKey="resolution"
                      name="Resolution Rate (%)"
                      fill="#ffc658"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Dependency Resolution Forecast</CardTitle>
              <CardDescription>
                Projected dependency resolution based on ML models
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { month: "Jul", actual: 75, forecast: 77 },
                      { month: "Aug", actual: 82, forecast: 85 },
                      { month: "Sep", actual: 88, forecast: 90 },
                      { month: "Oct", forecast: 95 },
                      { month: "Nov", forecast: 97 },
                      { month: "Dec", forecast: 99 },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      name="Actual Resolution Rate (%)"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="forecast"
                      name="Forecasted Resolution Rate (%)"
                      stroke="#82ca9d"
                      strokeDasharray="5 5"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="p-4 mt-4 bg-blue-50 rounded-md">
                <h4 className="text-sm font-semibold text-blue-700 mb-2 flex items-center">
                  <i className="material-icons text-blue-600 mr-1">info</i>
                  ML-Based Forecast Insights
                </h4>
                <p className="text-sm text-blue-600">
                  Based on your UDE and PINN models, we project a 99% dependency
                  resolution rate by year-end if current optimization
                  strategies continue to be applied. Critical dependencies are
                  expected to drop below 5% by November.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="pt-4 border-t text-xs text-muted-foreground">
        <p>
          Data refreshed: {new Date().toLocaleString()} • Report generated for
          executive review • Powered by JIRA-PINN Analytics
        </p>
      </div>
    </div>
  );
}