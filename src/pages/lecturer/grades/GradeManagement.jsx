// src/pages/lecturer/grades/GradeManagement.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Download,
    Upload,
    RefreshCw,
    FileSpreadsheet,
    AlertCircle,
    BarChart3
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { gradeService } from '../../../services/gradeService';
import { moduleService } from '../../../services/moduleService';
import { attendanceServiceStop } from '../../../services/attendanceService';
import LecturerLayout from '../../../components/layout/LecturerLayout';

const GradeManagement = () => {
    const { moduleId } = useParams();
    const [students, setStudents] = useState([]);
    const [moduleDetails, setModuleDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statistics, setStatistics] = useState(null);
    const [selectedTab, setSelectedTab] = useState('attendance');
    const [grades, setGrades] = useState({});
    const [uploading, setUploading] = useState(false);
    const [attendanceData, setAttendanceData] = useState({});


    useEffect(() => {
        fetchAllData();
    }, [moduleId]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [
                moduleResponse,
                studentsResponse,
                gradesResponse,
                statsResponse,
                attendanceResponse
            ] = await Promise.all([
                moduleService.getModuleById(moduleId),
                moduleService.getEnrolledStudents(moduleId),
                gradeService.getModuleGrades(moduleId),
                gradeService.getGradeStatistics(moduleId),
                attendanceServiceStop.getModuleAttendance(moduleId)
            ]);

            if (moduleResponse.success) {
                setModuleDetails(moduleResponse.data);
            }

            if (studentsResponse.success) {
                setStudents(studentsResponse.data || []);
            }

            if (gradesResponse.success) {
                setGrades(gradesResponse.data || {});
            }

            if (statsResponse.success) {
                setStatistics(statsResponse.data || {
                    average: 0,
                    highest: 0,
                    lowest: 0,
                    passRate: 0,
                    distribution: { A: 0, B: 0, C: 0, D: 0, F: 0 }
                });
            };

            console.log("attendanceResponse", attendanceResponse);

            if (attendanceResponse.success) {
                // Process attendance data to count sessions per student
                const processedAttendance = {};
                attendanceResponse.data.forEach(session => {
                    session.students.forEach(studentRecord => {
                        // Using studentRecord.student._id as the key since student is a nested object
                        const studentId = studentRecord.student._id;
                        if (!processedAttendance[studentId]) {
                            processedAttendance[studentId] = {
                                total: 0,
                                present: 0,
                                late: 0,
                                absent: 0
                            };
                        }
                        processedAttendance[studentId].total++;
                        processedAttendance[studentId][studentRecord.status]++;
                    });
                });
                setAttendanceData(processedAttendance);
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load grade data');
        } finally {
            setLoading(false);
        }
    };



    const handleGradeChange = async (studentId, type, value) => {
        try {

            const gradeData = {
                type,
                value: parseFloat(value)
            };

            console.log(gradeData);
            // Updated endpoint
            const response = await gradeService.updateGrade(moduleId, studentId, gradeData);
            console.log(response);

            if (!response.success) {
                throw new Error('Failed to update grade');
            }

            const result = await response;

            if (result.success) {
                // Update local state
                setGrades(prev => ({
                    ...prev,
                    [studentId]: {
                        ...prev[studentId],
                        [type]: parseFloat(value)
                    }
                }));

                // Refresh statistics
                const statsResponse = await gradeService.getGradeStatistics(moduleId);
                console.log(statsResponse);
                // const statsData = await statsResponse.json();
                if (statsResponse.success) {
                    setStatistics(statsResponse.data);
                }

                toast.success('Grade updated successfully');
            } else {
                throw new Error(result.error || 'Failed to update grade');
            }
        } catch (error) {
            console.error('Grade update error:', error);
            toast.error(error.message || 'Failed to update grade');
        }
    };

    const handleExportGrades = async () => {
        try {
            const response = await gradeService.exportGrades(moduleId);
            
            // Create blob from the response data
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `grades-${moduleId}.csv`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
    
            toast.success('Grades exported successfully');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export grades');
        }
    };

    const handleImportGrades = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            // Updated endpoint
            const response = await fetch(`/api/grades/module/${moduleId}/import`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to import grades');
            }

            const result = await response.json();
            if (result.success) {
                await fetchAllData();
                toast.success('Grades imported successfully');
            } else {
                throw new Error(result.error || 'Failed to import grades');
            }
        } catch (error) {
            console.error('Import error:', error);
            toast.error(error.message || 'Failed to import grades');
        } finally {
            setUploading(false);
            event.target.value = '';
        }
    };

    const getLetterGrade = (percentage) => {
        if (percentage >= 70) return 'A';
        if (percentage >= 65) return 'B+';
        if (percentage >= 60) return 'B';
        if (percentage >= 55) return 'B-';
        if (percentage >= 50) return 'C+';
        if (percentage >= 45) return 'C';
        if (percentage >= 40) return 'C-';
        if (percentage >= 35) return 'D+';
        if (percentage >= 30) return 'D';
        return 'F';
    };
    
    const calculateFinalGrade = (studentId) => {
        const studentGrades = grades[studentId] || {};
        const weights = moduleDetails?.assessmentWeights || {};
    
        const attendanceGrade = parseFloat(calculateAttendanceGrade(studentId));
        const testGrade = studentGrades.test || 0;
        const assignmentGrade = studentGrades.assignment || 0;
        const examGrade = studentGrades.exam || 0;
    
        const finalGrade = attendanceGrade + testGrade + assignmentGrade + examGrade;
        return { percentage: finalGrade.toFixed(2) };
    };
    


    const calculateAttendanceGrade = (studentId) => {
        const studentAttendance = attendanceData[studentId] || { present: 0, late: 0, total: 0 };
        const presentSessions = studentAttendance.present + (studentAttendance.late * 0.5);
        const totalSessions = studentAttendance.total || 1;
        const attendancePercentage = (presentSessions / totalSessions) * 100;
        // Convert to 5% of total grade
        return ((attendancePercentage / 100) * 5).toFixed(2);
    };

    const handleRefreshData = () => {
        fetchAllData();
    };

    const handleCalculateAllGrades = async () => {
        try {
            // Updated endpoint
            const response = await gradeService.calculateModuleGrades(moduleId);

            if (!response.success) {
                throw new Error('Failed to calculate grades');
            }

            const result = await response;
            if (result.success) {
                await fetchAllData();
                toast.success('Final grades calculated successfully');
            } else {
                throw new Error(result.error || 'Failed to calculate grades');
            }
        } catch (error) {
            console.error('Calculate grades error:', error);
            toast.error(error.message || 'Failed to calculate final grades');
        }
    };

    const renderAttendanceTab = () => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Present</TableHead>
                    <TableHead>Late</TableHead>
                    <TableHead>Absent</TableHead>
                    <TableHead>Total Sessions</TableHead>
                    <TableHead>Attendance Rate</TableHead>
                    <TableHead>Grade (5%)</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {students.map((student) => {
                    const studentAttendance = attendanceData[student._id] || {
                        present: 0,
                        late: 0,
                        absent: 0,
                        total: 0
                    };
                    const attendanceRate = ((studentAttendance.present + (studentAttendance.late * 0.5)) /
                        (studentAttendance.total || 1) * 100).toFixed(1);

                    return (
                        <TableRow key={student._id}>
                            <TableCell>{student.studentId}</TableCell>
                            <TableCell>{student.firstName} {student.lastName}</TableCell>
                            <TableCell className="text-green-600">
                                {studentAttendance.present || 0}
                            </TableCell>
                            <TableCell className="text-yellow-600">
                                {studentAttendance.late || 0}
                            </TableCell>
                            <TableCell className="text-red-600">
                                {studentAttendance.absent || 0}
                            </TableCell>
                            <TableCell>{studentAttendance.total || 0}</TableCell>
                            <TableCell>
                                <span className={`${parseFloat(attendanceRate) >= 80 ? 'text-green-600' :
                                    parseFloat(attendanceRate) >= 60 ? 'text-yellow-600' :
                                        'text-red-600'
                                    }`}>
                                    {attendanceRate}%
                                </span>
                            </TableCell>
                            <TableCell className="font-semibold">
                                {calculateAttendanceGrade(student._id)}%
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );

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
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Grade Management</CardTitle>
                <div className="flex space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefreshData}
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportGrades}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>

                    <div className="relative">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={uploading}
                            onClick={() => document.getElementById('grade-import').click()}
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            Import
                        </Button>
                        <input
                            id="grade-import"
                            type="file"
                            accept=".csv"
                            className="hidden"
                            onChange={handleImportGrades}
                        />
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCalculateAllGrades}
                    >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Calculate All
                    </Button>
                </div>
            </CardHeader>

            <CardContent>
                {/* Statistics Summary */}
                {statistics && (
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <p className="text-sm text-gray-500">Class Average</p>
                            <p className="text-2xl font-semibold">{statistics.average.toFixed(1)}%</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <p className="text-sm text-gray-500">Highest Grade</p>
                            <p className="text-2xl font-semibold">{statistics.highest.toFixed(1)}%</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <p className="text-sm text-gray-500">Lowest Grade</p>
                            <p className="text-2xl font-semibold">{statistics.lowest.toFixed(1)}%</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <p className="text-sm text-gray-500">Pass Rate</p>
                            <p className="text-2xl font-semibold">{statistics.passRate.toFixed(1)}%</p>
                        </div>
                    </div>
                )}

                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                    <TabsList>
                        <TabsTrigger value="attendance">Attendance (5%)</TabsTrigger>
                        <TabsTrigger value="assignments">
                            Assignments ({moduleDetails?.assessmentWeights?.assignments || 0}%)
                        </TabsTrigger>
                        <TabsTrigger value="tests">
                            Tests ({moduleDetails?.assessmentWeights?.test || 0}%)
                        </TabsTrigger>
                        <TabsTrigger value="exam">
                            Final Exam ({moduleDetails?.assessmentWeights?.finalExam || 0}%)
                        </TabsTrigger>
                        <TabsTrigger value="final">Final Grades</TabsTrigger>
                    </TabsList>

                    {/* Attendance Tab */}
                    <TabsContent value="attendance">
                        {renderAttendanceTab()}
                    </TabsContent>

                    {/* Assignments Tab */}
                    <TabsContent value="assignments">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Grade</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map((student) => (
                                    <TableRow key={student._id}>
                                        <TableCell>{student.studentId}</TableCell>
                                        <TableCell>{student.firstName} {student.lastName}</TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={grades[student._id]?.assignment || ''}
                                                onChange={(e) => handleGradeChange(student._id, 'assignment', e.target.value)}
                                                className="w-24"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                size="sm"
                                                onClick={() => handleGradeChange(student._id, 'assignment', grades[student._id]?.assignment || 0)}
                                            >
                                                Save
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TabsContent>

                    {/* Tests Tab */}
                    <TabsContent value="tests">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Grade</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map((student) => (
                                    <TableRow key={student._id}>
                                        <TableCell>{student.studentId}</TableCell>
                                        <TableCell>{student.firstName} {student.lastName}</TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={grades[student._id]?.test || ''}
                                                onChange={(e) => handleGradeChange(student._id, 'test', e.target.value)}
                                                className="w-24"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                size="sm"
                                                onClick={() => handleGradeChange(student._id, 'test', grades[student._id]?.test || 0)}
                                            >
                                                Save
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TabsContent>

                    {/* Final Exam Tab */}
                    <TabsContent value="exam">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Grade</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map((student) => (
                                    <TableRow key={student._id}>
                                        <TableCell>{student.studentId}</TableCell>
                                        <TableCell>{student.firstName} {student.lastName}</TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={grades[student._id]?.exam || ''}
                                                onChange={(e) => handleGradeChange(student._id, 'exam', e.target.value)}
                                                className="w-24"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                size="sm"
                                                onClick={() => handleGradeChange(student._id, 'exam', grades[student._id]?.exam || 0)}
                                            >
                                                Save
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TabsContent>

                    {/* Final Grades Tab */}
                    <TabsContent value="final">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Attendance (5%)</TableHead>
                                    <TableHead>Assignments ({moduleDetails?.assessmentWeights?.assignments}%)</TableHead>
                                    <TableHead>Tests ({moduleDetails?.assessmentWeights?.test}%)</TableHead>
                                    <TableHead>Final Exam ({moduleDetails?.assessmentWeights?.finalExam}%)</TableHead>
                                    <TableHead>Final Grade</TableHead>
                                    <TableHead>Letter Grade</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map((student) => {
                                    const finalGrade = calculateFinalGrade(student._id);
                                    const letterGrade = getLetterGrade(finalGrade.percentage);

                                    return (
                                        <TableRow key={student._id}>
                                            <TableCell>{student.studentId}</TableCell>
                                            <TableCell>{student.firstName} {student.lastName}</TableCell>
                                            <TableCell>{calculateAttendanceGrade(student._id)}%</TableCell>
                                            <TableCell>{grades[student._id]?.assignment || 0}%</TableCell>
                                            <TableCell>{grades[student._id]?.test || 0}%</TableCell>
                                            <TableCell>{grades[student._id]?.exam || 0}%</TableCell>
                                            <TableCell className={`font-bold ${parseFloat(finalGrade.percentage) >= 40
                                                ? 'text-green-600'
                                                : 'text-red-600'
                                                }`}>
                                                {finalGrade.percentage}%
                                            </TableCell>
                                            <TableCell className={`font-bold ${parseFloat(finalGrade.percentage) >= 40
                                                ? 'text-green-600'
                                                : 'text-red-600'
                                                }`}>
                                                {letterGrade} 
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>

                        </Table>

                        {/* Grade Distribution */}
                        {statistics?.distribution && (
                            <div className="mt-6">
                                <h3 className="text-lg font-medium mb-4">Grade Distribution</h3>
                                <div className="grid grid-cols-5 gap-4">
                                    {Object.entries(statistics.distribution).map(([grade, count]) => (
                                        <div key={grade} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                            <p className="text-xl font-semibold">{grade}</p>
                                            <p className="text-sm text-gray-500">
                                                {count} student{count !== 1 ? 's' : ''} ({((count / students.length) * 100).toFixed(1)}%)
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Export Options */}
                        <div className="mt-6 flex justify-end space-x-4">
                            <Button
                                variant="outline"
                                onClick={handleExportGrades}
                            >
                                <FileSpreadsheet className="h-4 w-4 mr-2" />
                                Export Final Grades
                            </Button>

                            <Button
                                variant="default"
                                onClick={handleCalculateAllGrades}
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Recalculate All Grades
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Footer with module information */}
                <div className="mt-6 border-t pt-4">
                    <div className="flex justify-between text-sm text-gray-500">
                        <div>
                            <p>Module: {moduleDetails?.code} - {moduleDetails?.name}</p>
                            <p>Total Students: {students.length}</p>
                        </div>
                        <div>
                            <p>Last Updated: {new Date().toLocaleDateString()}</p>
                            <p>
                                Pass Rate: {statistics ? `${statistics.passRate.toFixed(1)}%` : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Warning message if no students */}
                {students.length === 0 && (
                    <div className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg mt-6">
                        <div className="text-center">
                            <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                            <p className="text-gray-600">No students enrolled in this module.</p>
                            <p className="text-sm text-gray-500">
                                Students need to be enrolled before grades can be managed.
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default GradeManagement;