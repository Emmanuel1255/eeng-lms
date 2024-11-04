// src/pages/dashboard/student/Dashboard.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '@components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { AttendanceReport } from '../../../features/components/attendance/AttendanceReport';

const StudentDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [stats, setStats] = useState({
    totalModules: 0,
    pendingAssignments: 0,
    attendanceRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const attendanceResponse = await axios.get('/api/attendance/student');
        const modulesResponse = await axios.get('/api/modules/enrolled');
        const assignmentsResponse = await axios.get('/api/assignments/pending');

        // Calculate attendance rate
        const totalClasses = attendanceResponse.data.length;
        const presentClasses = attendanceResponse.data.filter(
          record => record.status === 'present' || record.status === 'late'
        ).length;
        const attendanceRate = totalClasses ? (presentClasses / totalClasses) * 100 : 0;

        setStats({
          totalModules: modulesResponse.data.length,
          pendingAssignments: assignmentsResponse.data.length,
          attendanceRate: attendanceRate.toFixed(1)
        });
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <Card className="p-6">
          <h1 className="text-2xl font-semibold text-gray-900">Welcome, {user.firstName}!</h1>
          
          {/* Statistics Cards */}
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-primary-50 rounded-lg p-5">
              <h3 className="text-lg font-medium text-primary-900">My Modules</h3>
              <p className="mt-2 text-3xl font-semibold text-primary-600">
                {loading ? '...' : stats.totalModules}
              </p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-5">
              <h3 className="text-lg font-medium text-yellow-900">Pending Assignments</h3>
              <p className="mt-2 text-3xl font-semibold text-yellow-600">
                {loading ? '...' : stats.pendingAssignments}
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-5">
              <h3 className="text-lg font-medium text-green-900">Attendance Rate</h3>
              <p className="mt-2 text-3xl font-semibold text-green-600">
                {loading ? '...' : `${stats.attendanceRate}%`}
              </p>
            </div>
          </div>
        </Card>

        {/* Attendance Section */}
        <div className="mt-6">
          <AttendanceReport isLecturer={false} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;