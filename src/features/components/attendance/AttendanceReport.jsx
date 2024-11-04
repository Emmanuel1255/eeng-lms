import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const AttendanceReport = ({ moduleId, isLecturer }) => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const endpoint = isLecturer 
          ? `/api/attendance/module/${moduleId}`
          : '/api/attendance/student';
        
        const response = await axios.get(endpoint);
        setAttendance(response.data);
      } catch (error) {
        console.error('Error fetching attendance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [moduleId, isLecturer]);

  if (loading) {
    return <div>Loading attendance data...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isLecturer ? 'Module Attendance Report' : 'My Attendance'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{isLecturer ? 'Student' : 'Module'}</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              {isLecturer && <TableHead>Marked By</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendance.map((record) => (
              <TableRow key={record._id}>
                <TableCell>
                  {isLecturer 
                    ? `${record.studentId.firstName} ${record.studentId.lastName}`
                    : record.moduleId.name}
                </TableCell>
                <TableCell>
                  {new Date(record.date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <span className={`capitalize ${
                    record.status === 'present' ? 'text-green-600' :
                    record.status === 'late' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {record.status}
                  </span>
                </TableCell>
                {isLecturer && (
                  <TableCell>{record.markedBy.firstName} {record.markedBy.lastName}</TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export {AttendanceReport };