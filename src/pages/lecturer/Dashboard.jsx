import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Label } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { lecturerService } from '../../services/lecturerService';
import { gradeService } from '../../services/gradeService';
import { attendanceServiceStop } from '../../services/attendanceService';
import { BookOpen, Users, GraduationCap, ClipboardCheck, ArrowRight } from 'lucide-react';
import LecturerLayout from '../../components/layout/LecturerLayout';

const ATTENDANCE_COLORS = {
  present: '#22c55e',
  late: '#eab308',
  absent: '#ef4444'
};

// Custom tooltip for grade distribution
const GradeTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-200 shadow-lg rounded-lg">
        <p className="font-medium">{`Grade ${label}`}</p>
        <p className="text-gray-600">{`Students: ${payload[0].value}`}</p>
        <p className="text-gray-600">{`Percentage: ${((payload[0].value / payload[0].payload.total) * 100).toFixed(1)}%`}</p>
      </div>
    );
  }
  return null;
};

// Custom tooltip for attendance pie chart
const AttendanceTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-200 shadow-lg rounded-lg">
        <p className="font-medium">{payload[0].name}</p>
        <p className="text-gray-600">{`Count: ${payload[0].value}`}</p>
        <p className="text-gray-600">{`Percentage: ${((payload[0].value / payload[0].payload.total) * 100).toFixed(1)}%`}</p>
      </div>
    );
  }
  return null;
};

// Custom label for pie chart
const renderCustomLabel = ({ name, value, percent }) => {
  return `${name}: ${value} (${(percent * 100).toFixed(1)}%)`;
};

const LecturerDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeModules: 0,
    totalStudents: 0,
  });
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState('');
  const [gradeDistribution, setGradeDistribution] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('grades');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (selectedModule) {
      fetchModuleData(selectedModule);
    }
  }, [selectedModule]);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, modulesResponse] = await Promise.all([
        lecturerService.getStats(),
        lecturerService.getActiveModules(),
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      if (modulesResponse.success) {
        console.log(modulesResponse.data);
        setModules(modulesResponse.data);
        if (modulesResponse.data.length > 0) {
          setSelectedModule(modulesResponse.data[0]._id);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchModuleData = async (moduleId) => {
    try {
      const [gradeResponse, attendanceResponse] = await Promise.all([
        gradeService.getGradeStatistics(moduleId),
        attendanceServiceStop.getModuleAttendance(moduleId)
      ]);

      // Process grade distribution
      if (gradeResponse.success && gradeResponse.data.distribution) {
        const total = Object.values(gradeResponse.data.distribution).reduce((a, b) => a + b, 0);
        const distributionData = Object.entries(gradeResponse.data.distribution).map(([grade, count]) => ({
          grade,
          students: count,
          total
        }));
        setGradeDistribution(distributionData);
      }

      // Process attendance data
      if (attendanceResponse.data) {
        const attendanceCounts = {
          present: 0,
          late: 0,
          absent: 0,
          total: 0
        };

        attendanceResponse.data.forEach(session => {
          session.students.forEach(record => {
            attendanceCounts[record.status]++;
            attendanceCounts.total++;
          });
        });

        const attendanceStats = {
          present: (attendanceCounts.present / attendanceCounts.total) * 100,
          late: (attendanceCounts.late / attendanceCounts.total) * 100,
          absent: (attendanceCounts.absent / attendanceCounts.total) * 100,
          total: attendanceCounts.total,
          pieData: [
            { name: 'Present', value: attendanceCounts.present, total: attendanceCounts.total },
            { name: 'Late', value: attendanceCounts.late, total: attendanceCounts.total },
            { name: 'Absent', value: attendanceCounts.absent, total: attendanceCounts.total }
          ]
        };

        setAttendanceData(attendanceStats);
      }
    } catch (error) {
      console.error('Error fetching module data:', error);
    }
  };

  if (loading) {
    return (
      <LecturerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </LecturerLayout>
    );
  }

  return (
    <LecturerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Lecturer Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Welcome back, {user.firstName}
          </p>
        </div>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Modules</CardTitle>
              <BookOpen className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.activeModules}</div>
              <p className="text-sm text-gray-500 mt-2">Active teaching modules</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Students</CardTitle>
              <Users className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.totalStudents}</div>
              <p className="text-sm text-gray-500 mt-2">Enrolled across all modules</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Average Performance</CardTitle>
              <GraduationCap className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {gradeDistribution.length > 0
                  ? `${(gradeDistribution.reduce((acc, curr) => acc + (curr.students || 0), 0) / gradeDistribution.length).toFixed(1)}%`
                  : 'N/A'}
              </div>
              <p className="text-sm text-gray-500 mt-2">Overall student performance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Attendance Rate</CardTitle>
              <ClipboardCheck className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {attendanceData.present ?
                  `${((attendanceData.present + (attendanceData.late * 0.5))).toFixed(1)}%`
                  : 'N/A'}
              </div>
              <p className="text-sm text-gray-500 mt-2">Average attendance rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Module Analytics</CardTitle>
              <Select
                value={selectedModule}
                onValueChange={setSelectedModule}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select Module" />
                </SelectTrigger>
                <SelectContent>
                  {modules.map((module) => (
                    <SelectItem key={module._id} value={module._id}>
                      {module.code} - {module.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mt-4">
              <TabsList>
                <TabsTrigger value="grades">Grade Distribution</TabsTrigger>
                <TabsTrigger value="attendance">Attendance Overview</TabsTrigger>
              </TabsList>

              <TabsContent value="grades">
                <div className="h-[400px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={gradeDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="grade" />
                      <YAxis>
                        <Label
                          value="Number of Students"
                          angle={-90}
                          position="insideLeft"
                          style={{ textAnchor: 'middle' }}
                        />
                      </YAxis>
                      <Tooltip content={<GradeTooltip />} />
                      <Legend />
                      <Bar
                        dataKey="students"
                        fill="#6366f1"
                        name="Number of Students"
                        radius={[4, 4, 0, 0]}
                      >
                        <Label
                          position="top"
                          content={({ value, x, y, width }) => (
                            <text
                              x={x + width / 2}
                              y={y - 10}
                              fill="#6366f1"
                              textAnchor="middle"
                              fontSize="12"
                            >
                              {value}
                            </text>
                          )}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="attendance">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Attendance Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                          Present
                        </span>
                        <span className="font-medium">{attendanceData.present?.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                          Late
                        </span>
                        <span className="font-medium">{attendanceData.late?.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                          Absent
                        </span>
                        <span className="font-medium">{attendanceData.absent?.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={attendanceData.pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={renderCustomLabel}
                        >
                          {attendanceData.pieData?.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={ATTENDANCE_COLORS[entry.name.toLowerCase()]}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<AttendanceTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>

        {/* Module Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <Card
              key={module._id}
              className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
              onClick={() => navigate(`/lecturer/modules`)}
            >
              <CardHeader>
                <CardTitle className="text-lg flex justify-between items-center">
                  <span>{module.code}</span>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 group-hover:transform group-hover:translate-x-1 transition-all" />
                </CardTitle>
                <p className="text-sm text-gray-500">{module.name}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Enrolled Students</span>
                    <span className="font-medium">{module.enrolledStudents}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Level</span>
                    <span className="font-medium">{module.level}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Credit Hours</span>
                    <span className="font-medium">{module.creditHours}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {modules.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-dark-paper rounded-lg shadow">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No Modules</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              You haven't been assigned to any modules yet.
            </p>
          </div>
        )}
      </div>
    </LecturerLayout>
  );
};

export default LecturerDashboard;