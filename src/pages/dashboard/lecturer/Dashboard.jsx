import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '@components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AttendanceMarking from '../../../features/components/attendance/AttendanceMarking';
import { AttendanceReport } from '../../../features/components/attendance/AttendanceReport';

const LecturerDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [stats, setStats] = useState({
    totalModules: 0,
    totalStudents: 0,
    activeAssignments: 0,
    averageAttendance: 0
  });
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [modulesResponse, statsResponse] = await Promise.all([
          axios.get('/api/modules/lecturer'),
          axios.get('/api/lecturer/stats')
        ]);

        setModules(modulesResponse.data);
        setStats(statsResponse.data);
        
        if (modulesResponse.data.length > 0) {
          setSelectedModule(modulesResponse.data[0]._id);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <Card className="p-6">
          <h1 className="text-2xl font-semibold text-gray-900">Welcome, {user.firstName}!</h1>
          
          {/* Statistics Cards */}
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-primary-50 rounded-lg p-5">
              <h3 className="text-lg font-medium text-primary-900">My Modules</h3>
              <p className="mt-2 text-3xl font-semibold text-primary-600">
                {loading ? '...' : stats.totalModules}
              </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-5">
              <h3 className="text-lg font-medium text-purple-900">Total Students</h3>
              <p className="mt-2 text-3xl font-semibold text-purple-600">
                {loading ? '...' : stats.totalStudents}
              </p>
            </div>

            <div className="bg-yellow-50 rounded-lg p-5">
              <h3 className="text-lg font-medium text-yellow-900">Active Assignments</h3>
              <p className="mt-2 text-3xl font-semibold text-yellow-600">
                {loading ? '...' : stats.activeAssignments}
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-5">
              <h3 className="text-lg font-medium text-green-900">Average Attendance</h3>
              <p className="mt-2 text-3xl font-semibold text-green-600">
                {loading ? '...' : `${stats.averageAttendance}%`}
              </p>
            </div>
          </div>
        </Card>

        {/* Module Selection and Attendance Section */}
        {modules.length > 0 ? (
          <Card className="p-6">
            <Tabs defaultValue="mark" className="space-y-6">
              <TabsList>
                <TabsTrigger value="mark">Mark Attendance</TabsTrigger>
                <TabsTrigger value="report">View Report</TabsTrigger>
              </TabsList>

              <div className="mb-4">
                <select
                  className="w-full p-2 border rounded"
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                >
                  {modules.map((module) => (
                    <option key={module._id} value={module._id}>
                      {module.name}
                    </option>
                  ))}
                </select>
              </div>

              <TabsContent value="mark">
                <AttendanceMarking moduleId={selectedModule} />
              </TabsContent>

              <TabsContent value="report">
                <AttendanceReport moduleId={selectedModule} isLecturer={true} />
              </TabsContent>
            </Tabs>
          </Card>
        ) : (
          <Card className="p-6">
            <p className="text-center text-gray-500">
              No modules assigned yet. Please contact the administrator.
            </p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default LecturerDashboard;