import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Calendar,
  Clock,
  Users,
  FileText,
  BookOpen,
  GraduationCap,
  Download,
  QrCode
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';

const StudentModuleView = () => {
  const { moduleId } = useParams();
  const [loading, setLoading] = useState(true);
  const [module, setModule] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [attendance, setAttendance] = useState({
    present: 0,
    late: 0,
    absent: 0,
    total: 0
  });

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setModule({
        id: moduleId,
        code: 'CS101',
        name: 'Introduction to Computing',
        description: 'Fundamental concepts of computer science and programming',
        schedule: {
          day: 'Monday',
          startTime: '09:00',
          endTime: '11:00'
        },
        lecturer: {
          name: 'Dr. Smith',
          email: 'smith@university.edu'
        },
        progress: 75
      });

      setMaterials([
        { id: 1, title: 'Week 1 - Introduction', type: 'pdf', size: '2.4 MB' },
        { id: 2, title: 'Week 2 - Basic Concepts', type: 'pdf', size: '1.8 MB' },
        { id: 3, title: 'Programming Exercise 1', type: 'zip', size: '1.1 MB' }
      ]);

      setAssignments([
        { id: 1, title: 'Assignment 1', dueDate: '2024-03-20', status: 'submitted', grade: 85 },
        { id: 2, title: 'Assignment 2', dueDate: '2024-04-05', status: 'pending' }
      ]);

      setAttendance({
        present: 8,
        late: 1,
        absent: 1,
        total: 10
      });

      setLoading(false);
    }, 1000);
  }, [moduleId]);

  const handleMarkAttendance = async () => {
    try {
      // Simulate QR code scanning
      toast.success('Attendance marked successfully');
    } catch (error) {
      toast.error('Failed to mark attendance');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const attendanceRate = ((attendance.present + (attendance.late * 0.5)) / attendance.total * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {module.code} - {module.name}
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {module.description}
          </p>
        </div>
        <Button 
          onClick={handleMarkAttendance}
          className="inline-flex items-center"
        >
          <QrCode className="w-4 h-4 mr-2" />
          Mark Attendance
        </Button>
      </div>

      {/* Module Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                <span>{module.schedule.day}</span>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                <span>{module.schedule.startTime} - {module.schedule.endTime}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span>Attendance Rate</span>
                <span className="font-medium">{attendanceRate}%</span>
              </div>
              <Progress value={parseFloat(attendanceRate)} className="h-2" />
              <div className="grid grid-cols-3 gap-2 text-xs text-center mt-2">
                <div className="text-green-600">
                  <div className="font-medium">{attendance.present}</div>
                  <div>Present</div>
                </div>
                <div className="text-yellow-600">
                  <div className="font-medium">{attendance.late}</div>
                  <div>Late</div>
                </div>
                <div className="text-red-600">
                  <div className="font-medium">{attendance.absent}</div>
                  <div>Absent</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span>Overall Progress</span>
                <span className="font-medium">{module.progress}%</span>
              </div>
              <Progress value={module.progress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Materials */}
      <Card>
        <CardHeader>
          <CardTitle>Course Materials</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {materials.map(material => (
              <div
                key={material.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <div className="font-medium">{material.title}</div>
                    <div className="text-sm text-gray-500">{material.size}</div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assignments.map(assignment => (
              <div
                key={assignment.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <div className="font-medium">{assignment.title}</div>
                    <div className="text-sm text-gray-500">
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {assignment.grade ? (
                    <span className="font-medium text-green-600">
                      Grade: {assignment.grade}%
                    </span>
                  ) : (
                    <Badge variant={assignment.status === 'pending' ? 'yellow' : 'green'}>
                      {assignment.status}
                    </Badge>
                  )}
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentModuleView;