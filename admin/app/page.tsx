"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Target,
  TrendingUp,
  Shield,
  Database,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Server,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/admin-layout";

export default function AdminDashboard() {
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalGoals: 0,
    systemHealth: "good",
    serverStatus: "online",
    lastBackup: new Date().toISOString(),
  });

  useEffect(() => {
    // Load system statistics
    loadSystemStats();
  }, []);

  const loadSystemStats = () => {
    // In real implementation, this would fetch from API
    setSystemStats({
      totalUsers: 1247,
      activeUsers: 892,
      totalGoals: 5634,
      systemHealth: "good",
      serverStatus: "online",
      lastBackup: new Date().toISOString(),
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* System Status Banner */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6" />
              <div>
                <h2 className="font-semibold">System Status: All Good</h2>
                <p className="text-green-100">All systems operational</p>
              </div>
            </div>
            <Badge
              variant="secondary"
              className="bg-white/20 text-white border-white/30"
            >
              Live
            </Badge>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {systemStats.totalUsers.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Users
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {systemStats.activeUsers.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                +8% from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {systemStats.totalGoals.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                +23% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                System Health
              </CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Excellent</div>
              <p className="text-xs text-muted-foreground">99.9% uptime</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              Admin Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Button className="h-20 flex-col gap-2 bg-red-600 hover:bg-red-700">
                <Users className="h-6 w-6" />
                <span>Manage Users</span>
              </Button>
              <Button className="h-20 flex-col gap-2 bg-blue-600 hover:bg-blue-700">
                <Database className="h-6 w-6" />
                <span>System Backup</span>
              </Button>
              <Button className="h-20 flex-col gap-2 bg-green-600 hover:bg-green-700">
                <Activity className="h-6 w-6" />
                <span>View Analytics</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>System Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">User registration spike</p>
                    <p className="text-sm text-muted-foreground">
                      47 new users in last hour
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium">High server load</p>
                    <p className="text-sm text-muted-foreground">
                      CPU usage at 78%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Failed Login Attempts</span>
                  <Badge variant="destructive">12</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Active Sessions</span>
                  <Badge variant="default">1,247</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Security Alerts</span>
                  <Badge variant="secondary">0</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
