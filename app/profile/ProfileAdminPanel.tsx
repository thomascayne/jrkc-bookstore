// app/profile/AdminPanel.tsx
"use client";

import type { AppUser as User } from "@/auth/types";
import { useState, useEffect } from "react";
import { apiRequest } from "@/utils/apiClient";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AdminPanelProps {
  user: User | null;
}

export default function ProfileAdminPanel({ user }: AdminPanelProps) {
  const [userCount, setUserCount] = useState<number>(0);
  const [recentUsers, setRecentUsers] = useState<
    Array<{ created_at: string; email: string; id: string }>
  >([]);
  const [newUsersThisMonth, setNewUsersThisMonth] = useState(0);

  useEffect(() => {
    async function fetchAdminData() {
      const result = await apiRequest<{
        newThisMonth: number;
        recentUsers: Array<{ created_at: string; email: string; id: string }>;
        total: number;
      }>("/api/admin/users");
      setUserCount(result.total);
      setNewUsersThisMonth(result.newThisMonth);
      setRecentUsers(result.recentUsers);
    }

    void fetchAdminData();
  }, []);

  // Sample data for the chart
  const data = [
    { name: "Jan", users: 400 },
    { name: "Feb", users: 300 },
    { name: "Mar", users: 550 },
    { name: "Apr", users: 780 },
    { name: "May", users: 690 },
    { name: "Jun", users: 1000 },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="dark:text-white dark:border-gray-200 dark:border-1 p-6 rounded-lg shadow-all-sides">
          <h3 className="text-xl font-semibold mb-2">Total Users</h3>
          <p className="text-3xl font-bold">{userCount}</p>
        </div>
        <div className="dark:text-white dark:border-gray-200 dark:border-1 p-6 rounded-lg shadow-all-sides">
          <h3 className="text-xl font-semibold mb-2">New Users (This Month)</h3>
          <p className="text-3xl font-bold">{newUsersThisMonth}</p>
        </div>
        <div className="dark:text-white dark:border-gray-200 dark:border-1 p-6 rounded-lg shadow-all-sides">
          <h3 className="text-xl font-semibold mb-2">Active Users</h3>
          <p className="text-3xl font-bold">1,234</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="dark:text-white dark:border-gray-200 dark:border-1 p-6 rounded-lg shadow-all-sides">
          <h3 className="text-xl font-semibold mb-4">Recent Users</h3>
          <ul>
            {recentUsers.map((user) => (
              <li key={user.id} className="mb-2">
                <p className="font-semibold">{user.email}</p>
                <p className="text-sm text-gray-500">
                  Joined: {new Date(user.created_at).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        </div>
        <div className="dark:text-white dark:border-gray-200 dark:border-1 p-6 rounded-lg shadow-all-sides">
          <h3 className="text-xl font-semibold mb-4">User Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="users" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
