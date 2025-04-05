"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar, Download, BarChart, LineChart, PieChart, Users, FileText, Cpu } from "lucide-react"
import {
  Line,
  LineChart as RechartsLineChart,
  Bar,
  BarChart as RechartsBarChart,
  Pie,
  PieChart as RechartsPieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Mock data for user growth
const userGrowthData = [
  { month: "Jan", users: 120 },
  { month: "Feb", users: 150 },
  { month: "Mar", users: 200 },
  { month: "Apr", users: 250 },
  { month: "May", users: 300 },
  { month: "Jun", users: 400 },
  { month: "Jul", users: 500 },
  { month: "Aug", users: 600 },
  { month: "Sep", users: 700 },
  { month: "Oct", users: 800 },
  { month: "Nov", users: 900 },
  { month: "Dec", users: 1000 },
]

// Mock data for plan creation
const planCreationData = [
  { month: "Jan", plans: 80 },
  { month: "Feb", plans: 100 },
  { month: "Mar", plans: 130 },
  { month: "Apr", plans: 170 },
  { month: "May", plans: 220 },
  { month: "Jun", plans: 280 },
  { month: "Jul", plans: 350 },
  { month: "Aug", plans: 430 },
  { month: "Sep", plans: 520 },
  { month: "Oct", plans: 620 },
  { month: "Nov", plans: 730 },
  { month: "Dec", plans: 850 },
]

// Mock data for AI requests
const aiRequestsData = [
  { month: "Jan", requests: 500 },
  { month: "Feb", requests: 800 },
  { month: "Mar", requests: 1200 },
  { month: "Apr", requests: 1800 },
  { month: "May", requests: 2500 },
  { month: "Jun", requests: 3500 },
  { month: "Jul", requests: 4800 },
  { month: "Aug", requests: 6200 },
  { month: "Sep", requests: 8000 },
  { month: "Oct", requests: 10000 },
  { month: "Nov", requests: 12500 },
  { month: "Dec", requests: 15000 },
]

// Mock data for plan types
const planTypesData = [
  { name: "E-commerce", value: 35 },
  { name: "Portfolio", value: 25 },
  { name: "Blog", value: 20 },
  { name: "Corporate", value: 15 },
  { name: "Other", value: 5 },
]

// Mock data for user activity
const userActivityData = [
  { day: "Mon", active: 450, new: 50 },
  { day: "Tue", active: 420, new: 45 },
  { day: "Wed", active: 480, new: 60 },
  { day: "Thu", active: 520, new: 55 },
  { day: "Fri", active: 550, new: 70 },
  { day: "Sat", active: 400, new: 40 },
  { day: "Sun", active: 380, new: 35 },
]

// Colors for pie chart
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("year")

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last 7 days</SelectItem>
            <SelectItem value="month">Last 30 days</SelectItem>
            <SelectItem value="quarter">Last 90 days</SelectItem>
            <SelectItem value="year">Last 12 months</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Custom Range
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+21% from last month</p>
            <div className="mt-4 h-[80px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart width={300} height={100} data={userGrowthData.slice(-6)}>
                  <Line type="monotone" dataKey="users" stroke="#06b6d4" strokeWidth={2} dot={false} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,879</div>
            <p className="text-xs text-muted-foreground">+10% from last month</p>
            <div className="mt-4 h-[80px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart width={300} height={100} data={planCreationData.slice(-6)}>
                  <Line type="monotone" dataKey="plans" stroke="#06b6d4" strokeWidth={2} dot={false} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Requests</CardTitle>
            <Cpu className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28,493</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
            <div className="mt-4 h-[80px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart width={300} height={100} data={aiRequestsData.slice(-6)}>
                  <Line type="monotone" dataKey="requests" stroke="#06b6d4" strokeWidth={2} dot={false} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="growth">
        <TabsList>
          <TabsTrigger value="growth">
            <LineChart className="mr-2 h-4 w-4" />
            Growth Metrics
          </TabsTrigger>
          <TabsTrigger value="usage">
            <BarChart className="mr-2 h-4 w-4" />
            Usage Metrics
          </TabsTrigger>
          <TabsTrigger value="distribution">
            <PieChart className="mr-2 h-4 w-4" />
            Distribution
          </TabsTrigger>
        </TabsList>
        <TabsContent value="growth" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>Monthly user growth over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  users: {
                    label: "Users",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={userGrowthData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line type="monotone" dataKey="users" stroke="var(--color-users)" strokeWidth={2} />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="usage" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
              <CardDescription>Daily active users and new sign-ups</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  active: {
                    label: "Active Users",
                    color: "hsl(var(--chart-1))",
                  },
                  new: {
                    label: "New Users",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={userActivityData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="active" fill="var(--color-active)" />
                    <Bar dataKey="new" fill="var(--color-new)" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="distribution" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Plan Type Distribution</CardTitle>
              <CardDescription>Distribution of website plan types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={planTypesData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {planTypesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

