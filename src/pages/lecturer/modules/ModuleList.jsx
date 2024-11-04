// src/pages/lecturer/modules/ModuleList.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, UserPlus } from 'lucide-react';
import LecturerLayout from '../../../components/layout/LecturerLayout';
import { moduleService } from '../../../services/moduleService';
import { toast } from 'react-hot-toast';

const ModuleList = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

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
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Module
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <div
              key={module._id}
              className="bg-white dark:bg-dark-paper shadow rounded-lg overflow-hidden"
            >
              <div className="p-6">
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

                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {module.description}
                  </p>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Schedule: {module.schedule.day} {module.schedule.startTime} - {module.schedule.endTime}
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => navigate(`/lecturer/modules/${module._id}/enrollment`)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <UserPlus className="h-4 w-4 mr-1.5" />
                    Manage Students
                  </button>
                  <Link
                    to={`/lecturer/modules/edit/${module._id}`}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-dark-border rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-border"
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(module._id)}
                    className="inline-flex items-center px-3 py-1 border border-red-300 rounded-md text-sm font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </LecturerLayout>
  );
};

export default ModuleList;