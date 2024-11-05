// // src/pages/student/grades/StudentGrades.jsx
// import React, { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import StudentLayout from '../../../components/layout/StudentLayout';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";

// const StudentGrades = () => {
//   const { moduleId } = useParams();
//   const [grades, setGrades] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchGrades();
//   }, [moduleId]);

//   const fetchGrades = async () => {
//     try {
//       const response = await fetch(`/api/grades/student/${moduleId}`);
//       const data = await response.json();
//       setGrades(data.data);
//     } catch (error) {
//       console.error('Failed to fetch grades:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <StudentLayout>
//         <div className="flex items-center justify-center h-64">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
//         </div>
//       </StudentLayout>
//     );
//   }

//   return (
//     <StudentLayout>
//       <div className="space-y-6">
//         <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
//           My Grades
//         </h1>

//         <Card>
//           <CardHeader>
//             <CardTitle>Grade Overview</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Module</TableHead>
//                   <TableHead>Attendance (5%)</TableHead>
//                   <TableHead>Assignments</TableHead>
//                   <TableHead>Tests</TableHead>
//                   <TableHead>Final Exam</TableHead>
//                   <TableHead>Final Grade</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {grades?.map((grade) => (
//                   <TableRow key={grade.module._id}>
//                     <TableCell>{grade.module.name}</TableCell>
//                     <TableCell>{grade.grades.attendance.grade}%</TableCell>
//                     <TableCell>{grade.grades.assignments.grade}%</TableCell>
//                     <TableCell>{grade.grades.test.grade}%</TableCell>
//                     <TableCell>{grade.grades.exam.grade}%</TableCell>
//                     <TableCell className="font-bold">
//                       {grade.grades.finalGrade}%
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </CardContent>
//         </Card>
//       </div>
//     </StudentLayout>
//   );
// };

// export default StudentGrades;