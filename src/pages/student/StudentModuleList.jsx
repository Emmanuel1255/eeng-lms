import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen,
    Clock,
    Users,
    Calendar,
    ArrowRight,
    ClipboardCheck,
    GraduationCap,
    FileText
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { toast } from 'react-hot-toast';
import StudentLayout from '../../components/layout/StudentLayout';
import { moduleService } from '../../services/moduleService';
import { gradeService } from '../../services/gradeService';
import { attendanceServiceStop } from '../../services/attendanceService';

const StudentModuleList = () => {
    const navigate = useNavigate();
    const [modules, setModules] = useState([]);
    const [moduleStats, setModuleStats] = useState({});
    const [grades, setGrades] = useState({});
    const [attendanceData, setAttendanceData] = useState({});
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));
    //   console.log("User",user);

    useEffect(() => {
        fetchModules();
    }, []);

    const fetchModules = async () => {
        try {
            const response = await moduleService.getStudentModules();
            if (response.success) {
                setModules(response.data);

                // Fetch all grades once for the student
                const allGrades = await gradeService.getStudentGrades(user._id);
                
                // Initialize temporary objects for grades and attendance
                const tempGrades = {};
                const tempAttendance = {};

                // Map over modules to filter grades and fetch attendance per module
                await Promise.all(response.data.map(async (module) => {
                    // Filter grades by module ID and store the first match
                    const moduleGrades = allGrades.data.find((grade) => grade.module._id === module._id);
                    tempGrades[module._id] = moduleGrades ? moduleGrades.grades : 'N/A';

                    // Fetch attendance for each module and store in tempAttendance
                    const attendance = await attendanceServiceStop.getStudentAttendance(module._id);
                    tempAttendance[module._id] = attendance.data;
                }));

                // Set state with grades and attendance data for each module
                setGrades(tempGrades);
                setAttendanceData(tempAttendance);
            }
        } catch (error) {
            console.error('Error fetching modules:', error);
            toast.error('Failed to fetch enrolled modules');
        } finally {
            setLoading(false);
        }
    };

    const calculateAttendanceRate = (moduleId) => {
        const stats = attendanceData[moduleId];
        if (!stats) return 0;

        const total = stats.length;
        if (total === 0) return 0;

        const present = stats.filter(record =>
            record.status === 'present' || record.status === 'late'
        ).length;

        return ((present / total) * 100).toFixed(1);
    };

    const getModuleGrade = (moduleId) => {
        return grades[moduleId] ? grades[moduleId].finalGrade || 'N/A' : 'N/A';
    };



    const getLevelColor = (level) => {
        switch (level) {
            case 'Year 1': return 'bg-blue-100 text-blue-800';
            case 'Year 2': return 'bg-green-100 text-green-800';
            case 'Year 3': return 'bg-yellow-100 text-yellow-800';
            case 'Year 4': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
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
                        My Modules
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {modules.length} Enrolled {modules.length === 1 ? 'Module' : 'Modules'}
                    </p>
                </div>

                {/* Module Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {modules.map((module) => (
                        <Card
                            key={module._id}
                            className="hover:shadow-lg transition-all duration-300 cursor-pointer"
                            // onClick={() => navigate(`/student/modules/${module._id}`)}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg">{module.code}</CardTitle>
                                        <p className="text-sm text-gray-500 mt-1">{module.name}</p>
                                    </div>
                                    <Badge className={getLevelColor(module.level)}>
                                        {module.level}
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {/* Schedule Info */}
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center text-gray-500">
                                        <Calendar className="h-4 w-4 mr-1.5" />
                                        {module.schedule.day}
                                    </div>
                                    <div className="flex items-center text-gray-500">
                                        <Clock className="h-4 w-4 mr-1.5" />
                                        {module.schedule.startTime} - {module.schedule.endTime}
                                    </div>
                                </div>

                                {/* Lecturer Info */}
                                <div className="flex items-center text-sm text-gray-500">
                                    <Users className="h-4 w-4 mr-1.5" />
                                    {module.lecturer.firstName} {module.lecturer.lastName}
                                </div>

                                {/* Quick Stats */}
                                <div className="grid grid-cols-2 gap-4 py-2">
                                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                                        <div className="text-xl font-semibold text-gray-900">
                                            {calculateAttendanceRate(module._id)}%
                                        </div>
                                        <div className="text-xs text-gray-500">Attendance</div>
                                    </div>
                                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                                        <div className="text-xl font-semibold text-gray-900">
                                            {getModuleGrade(module._id)}
                                        </div>
                                        <div className="text-xs text-gray-500">Grade</div>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                {/* <div className="grid grid-cols-2 gap-2 pt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                    >
                                        <FileText className="h-4 w-4 mr-1.5" />
                                        Materials
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full"
                                    >
                                        <ClipboardCheck className="h-4 w-4 mr-1.5" />
                                        Mark Attendance
                                    </Button>
                                </div> */}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Empty State */}
                {modules.length === 0 && (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
                        <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                            No Modules Found
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            You are not enrolled in any modules yet.
                        </p>
                    </div>
                )}
            </div>
        </StudentLayout>
    );
};

export default StudentModuleList;