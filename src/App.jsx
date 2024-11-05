// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProtectedRoute from './components/common/ProtectedRoute';
import StudentDashboard from './pages/dashboard/student/Dashboard';

// Lecturer
import LecturerDashboard from './pages/lecturer/Dashboard';
import ModuleList from './pages/lecturer/modules/ModuleList';
import AddModule from './pages/lecturer/modules/AddModule';
import EditModule from './pages/lecturer/modules/EditModule';
import StudentList from './pages/lecturer/students/StudentList';
import ModuleEnrollment from './pages/lecturer/modules/ModuleEnrollment';
import AttendanceManagement from './pages/lecturer/attendance/AttendanceManagement';
import AttendanceListView from './pages/lecturer/attendance/AttendanceView';
import MarkAttendance from './pages/lecturer/attendance/MarkAttendance';
import GradeManagement from './pages/lecturer/grades/GradeManagement';
import ModuleGrades from './pages/lecturer/grades/ModuleGrades';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Student Routes */}
          <Route element={<ProtectedRoute roles={['student']} />}>
            <Route path="/student" element={<StudentDashboard />} />
          </Route>
          
          {/* Lecturer Routes */}
          <Route element={<ProtectedRoute roles={['lecturer']} />}>
            <Route path="/lecturer" element={<LecturerDashboard />} />
            <Route path="/lecturer/dashboard" element={<LecturerDashboard />} />
            <Route path="/lecturer/modules" element={<ModuleList />} />
            <Route path="/lecturer/modules/new" element={<AddModule />} />
            <Route path="/lecturer/modules/edit/:id" element={<EditModule />} />
            <Route path="/lecturer/students" element={<StudentList />} />
            <Route path="/lecturer/modules/:id/enrollment" element={<ModuleEnrollment />} />
            <Route path="/lecturer/modules/:moduleId/attendance" element={<AttendanceManagement />} />
            <Route path="/lecturer/modules/:id/attendance-list" element={<AttendanceListView />} />
            <Route path="/lecturer/modules/:moduleId/attendance/mark" element={<MarkAttendance />} />
            {/* Grade Management */}
            <Route path="/lecturer/modules/:moduleId/grades" element={<GradeManagement />} />
            <Route path="/lecturer/modules/:moduleId/grades/overview" element={<ModuleGrades />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;