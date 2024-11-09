import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentLayout from '../../components/layout/StudentLayout';
import { 
  BookOpen, 
  GraduationCap, 
  ClipboardCheck, 
  Calendar, 
  ArrowRight,
  Users
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from 'react-hot-toast';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { moduleService } from '../../services/moduleService';
import { gradeService } from '../../services/gradeService';
import { attendanceServiceStop } from '../../services/attendanceService';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState({
    present: 0,
    late: 0,
    absent: 0,
    total: 0
  });
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Get enrolled modules
      const modulesResponse = await moduleService.getStudentModules();
      if (modulesResponse.success) {
        setModules(modulesResponse.data);

        // Fetch grades for all modules
        const allGrades = await gradeService.getStudentGrades(user._id);
        const formattedGrades = modulesResponse.data.map(module => {
          const moduleGrade = allGrades.data.find(grade => grade.module._id === module._id);
          return {
            module: module.code,
            grade: moduleGrade ? moduleGrade.grades.finalGrade || 0 : 0
          };
        });
        setGrades(formattedGrades);

        // Calculate attendance for all modules
        let totalPresent = 0;
        let totalLate = 0;
        let totalAbsent = 0;
        let totalSessions = 0;

        await Promise.all(modulesResponse.data.map(async (module) => {
          const attendanceResponse = await attendanceServiceStop.getStudentAttendance(module._id);
          if (attendanceResponse.data) {
            const moduleAttendance = attendanceResponse.data;
            totalPresent += moduleAttendance.filter(record => record.status === 'present').length;
            totalLate += moduleAttendance.filter(record => record.status === 'late').length;
            totalAbsent += moduleAttendance.filter(record => record.status === 'absent').length;
            totalSessions += moduleAttendance.length;
          }
        }));

        setAttendance({
          present: totalPresent,
          late: totalLate,
          absent: totalAbsent,
          total: totalSessions
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateAttendancePercentage = () => {
    if (attendance.total === 0) return 0;
    return ((attendance.present + (attendance.late * 0.5)) / attendance.total * 100).toFixed(1);
  };

  const calculateAverageGrade = () => {
    if (grades.length === 0) return 0;
    const total = grades.reduce((acc, curr) => acc + curr.grade, 0);
    return (total / grades.length).toFixed(1);
  };

  const getModuleProgress = (moduleId) => {
    const moduleGrade = grades.find(grade => grade.module === moduleId);
    return moduleGrade ? moduleGrade.grade : 0;
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Student Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Welcome back, {user.firstName}
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Enrolled Modules</CardTitle>
              <BookOpen className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{modules.length}</div>
              <p className="text-xs text-gray-500 mt-1">Active courses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Average Grade</CardTitle>
              <GraduationCap className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{calculateAverageGrade()}%</div>
              <p className="text-xs text-gray-500 mt-1">Overall performance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Attendance Rate</CardTitle>
              <ClipboardCheck className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{calculateAttendancePercentage()}%</div>
              <p className="text-xs text-gray-500 mt-1">Present + Half Late</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Sessions</CardTitle>
              <Calendar className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attendance.total}</div>
              <p className="text-xs text-gray-500 mt-1">Total sessions</p>
            </CardContent>
          </Card>
        </div>

        {/* Grade Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={grades}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="module" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    dataKey="grade" 
                    fill="#6366f1" 
                    name="Grade %" 
                    label={{ position: 'top' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Enrolled Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map(module => (
            <Card 
              key={module._id}
              className="hover:shadow-lg transition-all duration-300"
              // onClick={() => navigate(`/student/modules/${module._id}`)}
            >
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{module.code}</CardTitle>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">{module.name}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Overall Grade</span>
                    <span className="font-medium">{getModuleProgress(module.code)}%</span>
                  </div>
                  <Progress value={getModuleProgress(module.code)} className="h-2" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{module.schedule.day}</span>
                    <span>{module.schedule.startTime} - {module.schedule.endTime}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Attendance Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{attendance.present}</div>
                <div className="text-sm text-gray-500">Present</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{attendance.late}</div>
                <div className="text-sm text-gray-500">Late</div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{attendance.absent}</div>
                <div className="text-sm text-gray-500">Absent</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
};

export default StudentDashboard;