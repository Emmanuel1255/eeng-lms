// src/pages/lecturer/students/StudentList.jsx
import { useState, useEffect } from 'react';
import { Search, Download } from 'lucide-react';
import LecturerLayout from '../../../components/layout/LecturerLayout';
import { moduleService } from '../../../services/moduleService';
import { toast } from 'react-hot-toast';

const StudentList = () => {
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const response = await moduleService.getLecturerModules();
      setModules(response.data);
    } catch (error) {
      toast.error('Failed to fetch modules');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredStudents = () => {
    if (!selectedModule) return [];
    
    const module = modules.find(m => m._id === selectedModule);
    if (!module) return [];

    return module.enrolledStudents.filter(student => 
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };


  const handleExportToCSV = () => {
    const students = getFilteredStudents();
    if (students.length === 0) {
      toast.error('No students to export');
      return;
    }

    const csvContent = [
      ['Student ID', 'First Name', 'Last Name', 'Email'],
      ...students.map(student => [
        student.studentId,
        student.firstName,
        student.lastName,
        student.email
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students-${selectedModule}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Student Management
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage and view students enrolled in your modules
          </p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Module
            </label>
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border dark:bg-dark-paper dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">All Modules</option>
              {modules.map((module) => (
                <option key={module._id} value={module._id}>
                  {module.code} - {module.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Search Students
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 rounded-md border-gray-300 dark:border-dark-border dark:bg-dark-paper dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Search by name..."
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleExportToCSV}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Download className="h-4 w-4 mr-2" />
              Export to CSV
            </button>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white dark:bg-dark-paper shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b dark:border-dark-border">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Enrolled Students
            </h3>
          </div>
          
          {selectedModule ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
                <thead className="bg-gray-50 dark:bg-dark-paper">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Student ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-paper divide-y divide-gray-200 dark:divide-dark-border">
                  {getFilteredStudents().map((student) => (
                    <tr key={student._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {student.studentId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {student.firstName} {student.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {student.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => {/* View student details */}}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {getFilteredStudents().length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    No students found matching your search criteria.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                Please select a module to view enrolled students.
              </p>
            </div>
          )}
        </div>
      </div>
    </LecturerLayout>
  );
};

export default StudentList;