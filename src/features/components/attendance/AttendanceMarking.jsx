// client/src/features/attendance/components/AttendanceMarking.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AttendanceMarking = ({ moduleId }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(`/api/modules/${moduleId}/students`);
        setStudents(response.data);
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    fetchStudents();
  }, [moduleId]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const attendanceData = {
        moduleId,
        date: selectedDate,
        studentIds: Object.entries(data)
          .filter(([_, value]) => value === 'present' || value === 'late')
          .map(([studentId]) => studentId)
      };

      await axios.post('/api/attendance/mark', attendanceData);
      reset();
    } catch (error) {
      console.error('Error marking attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mark Attendance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
          />
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4">
              {students.map((student) => (
                <div key={student._id} className="flex items-center justify-between">
                  <span>{student.firstName} {student.lastName}</span>
                  <Select {...register(student._id)}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="present">Present</SelectItem>
                      <SelectItem value="late">Late</SelectItem>
                      <SelectItem value="absent">Absent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            
            <Button type="submit" disabled={loading}>
              {loading ? 'Marking...' : 'Mark Attendance'}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceMarking;
