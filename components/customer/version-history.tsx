"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { FileText, Settings, Clock, ArrowUpDown, Filter, Eye } from "lucide-react"

// Mock data for version history
const planVersions = [
  {
    id: "1",
    planId: "1",
    planName: "E-commerce Website",
    versionNumber: 3,
    changeType: "update",
    description: "Updated features section with mobile responsiveness details",
    timestamp: "2 days ago",
    user: "You",
  },
  {
    id: "2",
    planId: "1",
    planName: "E-commerce Website",
    versionNumber: 2,
    changeType: "update",
    description: "Added shipping and return policy details",
    timestamp: "3 days ago",
    user: "You",
  },
  {
    id: "3",
    planId: "1",
    planName: "E-commerce Website",
    versionNumber: 1,
    changeType: "create",
    description: "Initial plan creation",
    timestamp: "3 days ago",
    user: "You",
  },
  {
    id: "4",
    planId: "2",
    planName: "Portfolio Site",
    versionNumber: 2,
    changeType: "update",
    description: "Updated project showcase section",
    timestamp: "1 week ago",
    user: "You",
  },
  {
    id: "5",
    planId: "2",
    planName: "Portfolio Site",
    versionNumber: 1,
    changeType: "create",
    description: "Initial plan creation",
    timestamp: "1 week ago",
    user: "You",
  },
]

const settingsVersions = [
  {
    id: "1",
    changeType: "update",
    section: "Profile",
    description: "Updated profile information",
    timestamp: "1 day ago",
    user: "You",
  },
  {
    id: "2",
    changeType: "update",
    section: "Notifications",
    description: "Changed email notification preferences",
    timestamp: "1 week ago",
    user: "You",
  },
  {
    id: "3",
    changeType: "update",
    section: "Privacy",
    description: "Updated plan visibility settings",
    timestamp: "2 weeks ago",
    user: "You",
  },
]

export function VersionHistory() {
  const [activeTab, setActiveTab] = useState("plans")

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="plans" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Plan History
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Plan Version History</CardTitle>
                  <CardDescription>Track changes made to your website plans</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm" className="h-8">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    Sort
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead className="hidden md:table-cell">Description</TableHead>
                    <TableHead className="hidden md:table-cell">Time</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {planVersions.map((version) => (
                    <TableRow key={version.id}>
                      <TableCell>
                        <div className="font-medium">{version.planName}</div>
                      </TableCell>
                      <TableCell>v{version.versionNumber}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            version.changeType === "create"
                              ? "bg-green-500/10 text-green-500 border-green-500/20"
                              : version.changeType === "update"
                                ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                          }
                        >
                          {version.changeType}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell max-w-xs truncate">{version.description}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {version.timestamp}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/dashboard/plans/${version.planId}?version=${version.versionNumber}`}>
                          <Button variant="ghost" size="sm" className="h-8">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Showing 5 of 5 versions</div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#" isActive>
                      1
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink href="#">2</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext href="#" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Settings Change History</CardTitle>
                  <CardDescription>Track changes made to your account settings</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Section</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead className="hidden md:table-cell">Description</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settingsVersions.map((version) => (
                    <TableRow key={version.id}>
                      <TableCell>
                        <div className="font-medium">{version.section}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                          {version.changeType}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell max-w-xs truncate">{version.description}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {version.timestamp}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

