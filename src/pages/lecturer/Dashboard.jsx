// src/pages/lecturer/Dashboard.jsx
import { useState, useEffect } from 'react';
import LecturerLayout from '../../components/layout/LecturerLayout';
import { Users, BookOpen, FileText, Clock } from 'lucide-react';

const LecturerDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalModules: 0,
    pendingAssignments: 0,
    upcomingClasses: 0
  });

  // Mock data for recent activities
  const recentActivities = [
    {
      id: 1,
      type: 'assignment',
      message: 'New submission for Web Development Assignment',
      time: '2 hours ago'
    },
    {
      id: 2,
      type: 'module',
      message: 'Updated materials for Database Design',
      time: '5 hours ago'
    },
    // Add more activities as needed
  ];

  return (
    <LecturerLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Lecturer Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Overview of your teaching activities and student progress
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Students */}
          <div className="bg-white dark:bg-dark-paper rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-primary-100 dark:bg-primary-900/20">
                <Users className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Students
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {stats.totalStudents}
                </p>
              </div>
            </div>
          </div>

          {/* Active Modules */}
          <div className="bg-white dark:bg-dark-paper rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Modules
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {stats.totalModules}
                </p>
              </div>
            </div>
          </div>

          {/* Pending Assignments */}
          <div className="bg-white dark:bg-dark-paper rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/20">
                <FileText className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Pending Assignments
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {stats.pendingAssignments}
                </p>
              </div>
            </div>
          </div>

          {/* Upcoming Classes */}
          <div className="bg-white dark:bg-dark-paper rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
                <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Upcoming Classes
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {stats.upcomingClasses}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-dark-paper rounded-lg shadow">
          <div className="px-6 py-4 border-b dark:border-dark-border">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Recent Activity
            </h2>
          </div>
          <div className="divide-y dark:divide-dark-border">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {activity.type === 'assignment' ? (
                      <FileText className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <BookOpen className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </LecturerLayout>
  );
};

export default LecturerDashboard;