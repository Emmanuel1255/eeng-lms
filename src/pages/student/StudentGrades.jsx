import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  ClipboardCheck, 
  FileText, 
  AlertCircle,
  BookOpen,
  BookMarked,
  Medal,
  ScrollText
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { toast } from 'react-hot-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import StudentLayout from '../../components/layout/StudentLayout';
import { gradeService } from '../../services/gradeService';
import { moduleService } from '../../services/moduleService';
import { attendanceServiceStop } from '../../services/attendanceService';

const StudentGrades = () => {
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);
  const [grades, setGrades] = useState({});
  const [attendanceData, setAttendanceData] = useState({});
  const [totalCreditHours, setTotalCreditHours] = useState(0);
  const [cgpa, setCGPA] = useState(0);
  const [earnedCreditHours, setEarnedCreditHours] = useState(0);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchGradesData();
  }, []);

  const getGradePoints = (percentage) => {
    if (!percentage || percentage === 'N/A') return 0;
    if (percentage >= 70) return 4.0;  // A
    if (percentage >= 65) return 3.75;  // B+
    if (percentage >= 60) return 3.25;  // B
    if (percentage >= 55) return 3.0;  // B-
    if (percentage >= 50) return 2.75;  // C+
    if (percentage >= 45) return 2.5;  // C
    if (percentage >= 40) return 2.0;  // C-
    if (percentage >= 35) return 1.5;  // D+
    if (percentage >= 30) return 1.0;  // D
    return 0.0;  // F
  };

  const getGPAColor = (gpa) => {
    if (gpa >= 3.7) return 'text-green-600';
    if (gpa >= 3.0) return 'text-blue-600';
    if (gpa >= 2.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const calculateCGPA = (modules, grades) => {
    let totalPoints = 0;
    let totalCredits = 0;
    let earned = 0;
  
    // Calculate totals first
    modules.forEach(module => {
      // Add to total credits immediately
      totalCredits += module.creditHours;
      
      const grade = getModuleGrade(module._id);
      if (grade !== 'N/A') {
        const gradePoints = getGradePoints(grade);
        totalPoints += gradePoints * module.creditHours;
        if (grade >= 40) { // Pass mark
          earned += module.creditHours;
        }
      }
    });
  
    // Calculate CGPA
    const calculatedCGPA = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 0;
  
    // Update all states at once
    setTotalCreditHours(totalCredits);
    setEarnedCreditHours(earned);
    setCGPA(calculatedCGPA);
  
    return {
      cgpa: calculatedCGPA,
      totalCredits,
      earnedCredits: earned
    };
  };

  const fetchGradesData = async () => {
    try {
      const modulesResponse = await moduleService.getStudentModules();
      if (modulesResponse.success) {
        const moduleData = modulesResponse.data;
        setModules(moduleData);
  
        const allGrades = await gradeService.getStudentGrades(user._id);
        const tempGrades = {};
        const tempAttendance = {};
  
        await Promise.all(moduleData.map(async (module) => {
          const moduleGrades = allGrades.data.find((grade) => grade.module._id === module._id);
          tempGrades[module._id] = moduleGrades ? moduleGrades.grades : null;
  
          const attendance = await attendanceServiceStop.getStudentAttendance(module._id);
          tempAttendance[module._id] = attendance.data;
        }));
  
        setGrades(tempGrades);
        setAttendanceData(tempAttendance);

        
        // Calculate all stats at once
        const stats = calculateCGPA(moduleData, tempGrades);
        
        // Use the returned values immediately for any calculations needed
        console.log('Credit Hours:', stats.totalCredits);
        console.log('CGPA:', stats.cgpa);
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
      toast.error('Failed to fetch grades');
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

    return ((present / total) * 100 * 0.05).toFixed(2);
  };

  const getLetterGrade = (percentage) => {
    if (!percentage || percentage === 'N/A') return 'N/A';
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

  const getGradeColor = (percentage) => {
    if (!percentage || percentage === 'N/A') return 'text-gray-500';
    if (percentage >= 70) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getModuleGrade = (moduleId) => {
    return grades[moduleId] ? grades[moduleId].finalGrade || 'N/A' : 'N/A';
  };

  // Calculate overall statistics
  const validGrades = modules
    .map(module => getModuleGrade(module._id))
    .filter(grade => grade !== 'N/A')
    .map(Number);

  const averageGrade = validGrades.length > 0
    ? (validGrades.reduce((a, b) => a + b, 0) / validGrades.length).toFixed(1)
    : 'N/A';

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
            Academic Transcript
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            View your academic performance and CGPA calculation
          </p>
        </div>

        {/* Academic Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="pt-6">
              <div className="text-center">
                <Medal className="h-8 w-8 mx-auto text-primary-500" />
                <h3 className={`mt-2 text-xl font-semibold ${getGPAColor(parseFloat(cgpa))}`}>
                  {cgpa}
                </h3>
                <p className="text-sm text-gray-500">CGPA (4.0 Scale)</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="pt-6">
              <div className="text-center">
                <ScrollText className="h-8 w-8 mx-auto text-blue-500" />
                <h3 className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
                  {earnedCreditHours} / {totalCreditHours}
                </h3>
                <p className="text-sm text-gray-500">Credit Hours (Earned/Total)</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="pt-6">
              <div className="text-center">
                <GraduationCap className="h-8 w-8 mx-auto text-green-500" />
                <h3 className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
                  {validGrades.filter(grade => grade >= 40).length} / {modules.length}
                </h3>
                <p className="text-sm text-gray-500">Modules Passed</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="pt-6">
              <div className="text-center">
                <FileText className="h-8 w-8 mx-auto text-yellow-500" />
                <h3 className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
                  {averageGrade}%
                </h3>
                <p className="text-sm text-gray-500">Average Grade</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grade Details Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Module Grades</CardTitle>
            <div className="text-sm text-gray-500">
              Total Credit Hours: {totalCreditHours}
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Module</TableHead>
                    <TableHead className="text-center">Credits</TableHead>
                    <TableHead className="text-center">Attendance</TableHead>
                    <TableHead className="text-center">Assignments</TableHead>
                    <TableHead className="text-center">Test</TableHead>
                    <TableHead className="text-center">Final Exam</TableHead>
                    <TableHead className="text-center">Final Grade</TableHead>
                    <TableHead className="text-center">Letter Grade</TableHead>
                    <TableHead className="text-center">Grade Points</TableHead>
                    <TableHead className="text-center">Quality Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modules.map((module) => {
                    const moduleGrades = grades[module._id];
                    const finalGrade = getModuleGrade(module._id);
                    const gradePoints = getGradePoints(finalGrade);
                    const qualityPoints = (gradePoints * module.creditHours).toFixed(1);
                    const attendanceRate = calculateAttendanceRate(module._id);

                    return (
                      <TableRow key={module._id}>
                        <TableCell>
                          <div className="font-medium">{module.code}</div>
                          <div className="text-sm text-gray-500">{module.name}</div>
                        </TableCell>
                        <TableCell className="text-center">{module.creditHours}</TableCell>
                        <TableCell className="text-center">{attendanceRate}%</TableCell>
                        <TableCell className="text-center">
                          {moduleGrades?.assignments?.grade || 'N/A'}
                        </TableCell>
                        <TableCell className="text-center">
                          {moduleGrades?.test?.grade || 'N/A'}
                        </TableCell>
                        <TableCell className="text-center">
                          {moduleGrades?.exam?.grade || 'N/A'}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={getGradeColor(finalGrade)}>
                            {finalGrade}%
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant="outline" 
                            className={getGradeColor(finalGrade)}
                          >
                            {getLetterGrade(finalGrade)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {gradePoints.toFixed(1)}
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {qualityPoints}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {/* Summary Row */}
                  <TableRow className="bg-gray-50 dark:bg-gray-800">
                    <TableCell colSpan={2} className="font-medium">
                      Total/CGPA
                    </TableCell>
                    <TableCell colSpan={6} className="text-right font-medium">
                      Total Credit Hours: {totalCreditHours}
                    </TableCell>
                    <TableCell colSpan={2} className="text-center font-medium">
                      CGPA: {cgpa}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {modules.length === 0 && (
              <div className="text-center py-8">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  No Grades Available
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  You are not enrolled in any modules yet.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* GPA Scale Reference */}
        <Card>
          <CardHeader>
            <CardTitle>Grading Scale Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <div className="text-sm">
                <p className="font-medium">A (70-100%)</p>
                <p className="text-gray-500">4.0 Points</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">B+ (65-69%)</p>
                <p className="text-gray-500">3.5 Points</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">B (60-64%)</p>
                <p className="text-gray-500">3.0 Points</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">B- (55-59%)</p>
                <p className="text-gray-500">2.7 Points</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">C+ (50-54%)</p>
                <p className="text-gray-500">2.3 Points</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">C (45-49%)</p>
                <p className="text-gray-500">2.0 Points</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">C- (40-44%)</p>
                <p className="text-gray-500">1.7 Points</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">D+ (35-39%)</p>
                <p className="text-gray-500">1.3 Points</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">D (30-34%)</p>
                <p className="text-gray-500">1.0 Points</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">F (0-29%)</p>
                <p className="text-gray-500">0.0 Points</p>
              </div>
            </div>
            
            {/* CGPA Class Reference */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="font-medium text-green-600">First Class</p>
                <p className="text-sm text-green-600">CGPA 3.50 - 4.00</p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="font-medium text-blue-600">Second Class Upper</p>
                <p className="text-sm text-blue-600">CGPA 3.00 - 3.49</p>
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="font-medium text-yellow-600">Second Class Lower</p>
                <p className="text-sm text-yellow-600">CGPA 2.50 - 2.99</p>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="font-medium text-red-600">Fail</p>
                <p className="text-sm text-red-600">CGPA  2.00</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
};

export default StudentGrades;