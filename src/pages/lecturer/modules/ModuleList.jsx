// src/pages/lecturer/modules/ModuleList.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  UserPlus, 
  ClipboardCheck, 
  List,
  GraduationCap,
  BookOpen,
  FileText,
  PenTool,
  Calendar,
  MoreVertical
} from 'lucide-react';
import LecturerLayout from '../../../components/layout/LecturerLayout';
import { moduleService } from '../../../services/moduleService';
import { toast } from 'react-hot-toast';

const ModuleList = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const response = await moduleService.getLecturerModules();
      setModules(response.data);
    } catch (error) {
      console.error('Error fetching modules:', error);
      toast.error('Failed to fetch modules');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this module?')) {
      try {
        await moduleService.deleteModule(id);
        toast.success('Module deleted successfully');
        fetchModules();
      } catch (error) {
        console.error('Error deleting module:', error);
        toast.error('Failed to delete module');
      }
    }
  };

  const moduleActions = (module) => [
    {
      name: 'Overview',
      icon: BookOpen,
      href: `/lecturer/modules/edit/${module._id}`,
      color: 'text-blue-600'
    },
    {
      name: 'Student Enrollment',
      icon: UserPlus,
      href: `/lecturer/modules/${module._id}/enrollment`,
      color: 'text-green-600'
    },
    {
      name: 'Attendance',
      icon: Calendar,
      href: `/lecturer/modules/${module._id}/attendance/mark`,
      color: 'text-purple-600'
    },
    {
      name: 'Grades',
      icon: GraduationCap,
      href: `/lecturer/modules/${module._id}/grades`,
      color: 'text-yellow-600'
    },
    {
      name: 'Assignments',
      icon: ClipboardCheck,
      href: `/lecturer/modules/${module._id}/assignments`,
      color: 'text-indigo-600'
    },
    {
      name: 'Tests',
      icon: PenTool,
      href: `/lecturer/modules/${module._id}/tests`,
      color: 'text-pink-600'
    },
    {
      name: 'Final Exam',
      icon: FileText,
      href: `/lecturer/modules/${module._id}/exams`,
      color: 'text-orange-600'
    }
  ];

  const renderModuleCard = (module) => (
    <div key={module._id} className="bg-white dark:bg-dark-paper shadow rounded-lg overflow-hidden">
      <div className="p-6">
        {/* Module Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {module.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {module.code}
            </p>
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            {module.level}
          </span>
        </div>

        {/* Module Details */}
        <div className="mt-4 space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {module.description}
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Schedule: {module.schedule.day} {module.schedule.startTime} - {module.schedule.endTime}
          </div>
        </div>

        {/* Module Actions */}
        <div className="mt-6 space-y-4">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate(`/lecturer/modules/${module._id}/attendance`)}
              className="inline-flex items-center justify-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              <Calendar className="h-4 w-4 mr-1.5" />
              Take Attendance
            </button>
            <button
              onClick={() => navigate(`/lecturer/modules/${module._id}/grades`)}
              className="inline-flex items-center justify-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700"
            >
              <GraduationCap className="h-4 w-4 mr-1.5" />
              Manage Grades
            </button>
          </div>

          {/* Navigation Grid */}
          <div className="grid grid-cols-4 gap-2">
            {moduleActions(module).map((action) => (
              <Link
                key={action.name}
                to={action.href}
                className="flex flex-col items-center p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <action.icon className={`h-5 w-5 ${action.color}`} />
                <span className="mt-1 text-xs text-gray-600 dark:text-gray-400 text-center">
                  {action.name}
                </span>
              </Link>
            ))}
          </div>

          {/* Delete Action */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => handleDelete(module._id)}
              className="inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
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
    <LecturerLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              My Modules
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Manage your teaching modules and course materials
            </p>
          </div>
          <Link
            to="/lecturer/modules/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Module
          </Link>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map(renderModuleCard)}
        </div>

        {/* Empty State */}
        {modules.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No modules</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by creating a new module.
            </p>
            <div className="mt-6">
              <Link
                to="/lecturer/modules/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Module
              </Link>
            </div>
          </div>
        )}
      </div>
    </LecturerLayout>
  );
};

export default ModuleList;