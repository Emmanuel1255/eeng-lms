// src/pages/lecturer/modules/ModuleEnrollment.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Upload, UserPlus, UserMinus, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import LecturerLayout from '../../../components/layout/LecturerLayout';
import { moduleService } from '../../../services/moduleService';

const ModuleEnrollment = () => {
  const { id }  = useParams();
  const moduleId = id;
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [module, setModule] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newStudent, setNewStudent] = useState({
    studentId: '',
    email: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchModuleDetails();
  }, [id]);

  const fetchModuleDetails = async () => {
    try {
      const response = await moduleService.getModuleById(id);
      setModule(response.data);
      console.log(response.data);
    } catch (error) {
      toast.error('Failed to fetch module details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      setError('');
      // Create student with password same as student ID
      const studentData = {
        ...newStudent,
        password: newStudent.studentId, // Set password same as student ID
        role: 'student'
      };
      await moduleService.addStudent(id, studentData);
      toast.success('Student added successfully');
      fetchModuleDetails();
      setNewStudent({ studentId: '', firstName: '', lastName: '' });
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to add student');
      toast.error('Failed to add student');
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to remove this student?')) return;

    try {
      await moduleService.removeStudent(id, studentId);
      toast.success('Student removed successfully');
      fetchModuleDetails();
    } catch (error) {
      toast.error('Failed to remove student');
    }
  };

  const handleCSVUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (fileExtension !== 'csv') {
      toast.error('Please upload a CSV file');
      return;
    }
  
    setUploading(true);
    const formData = new FormData();
    formData.append('csvFile', file); // Changed 'file' to 'csvFile'
  
    try {
      await moduleService.uploadStudents(id, formData);
      toast.success('Students uploaded successfully');
      fetchModuleDetails();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || 'Failed to upload students');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const filteredStudents = module?.enrolledStudents?.filter(student => {
    const searchString = searchTerm.toLowerCase();
    return (
      student.studentId?.toLowerCase().includes(searchString) ||
      student.firstName?.toLowerCase().includes(searchString) ||
      student.lastName?.toLowerCase().includes(searchString)
    );
  }) || [];

  console.log("Student", module?.enrolledStudents);

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
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Student Enrollment: {module.code} - {module.name}
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Add or remove students from this module
          </p>
        </div>

        {/* Stats Card */}
        <div className="bg-white dark:bg-dark-paper shadow rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Enrolled Students
              </h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {module.enrolledStudents?.length || 0}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Maximum Capacity
              </h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {module.maxStudents}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Available Slots
              </h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {module.maxStudents - (module.enrolledStudents?.length || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Students Section */}
          <div className="space-y-6">
            {/* Manual Entry Form */}
            <div className="bg-white dark:bg-dark-paper shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Add Student
              </h2>

              <form onSubmit={handleAddStudent} className="space-y-4">
                <div>
                  <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Student ID
                  </label>
                  <input
                    type="text"
                    id="studentId"
                    value={newStudent.studentId}
                    onChange={(e) => setNewStudent({ ...newStudent, studentId: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border dark:bg-dark-paper dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border dark:bg-dark-paper dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={newStudent.firstName}
                      onChange={(e) => setNewStudent({ ...newStudent, firstName: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border dark:bg-dark-paper dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={newStudent.lastName}
                      onChange={(e) => setNewStudent({ ...newStudent, lastName: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border dark:bg-dark-paper dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 px-4 py-3 rounded relative">
                    <span className="block sm:inline">{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Student
                </button>
              </form>
            </div>

            {/* CSV Upload */}
            <div className="bg-white dark:bg-dark-paper shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Bulk Upload
              </h2>

              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 dark:border-dark-border rounded-lg p-6 text-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleCSVUpload}
                    accept=".csv"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-dark-paper hover:bg-gray-50 dark:hover:bg-dark-border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    disabled={uploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload CSV'}
                  </button>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    CSV format: studentId, email, firstName, lastName
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-400 text-blue-700 dark:text-blue-400 px-4 py-3 rounded relative">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <span className="block sm:inline">
                      Download our CSV template to ensure correct formatting
                    </span>
                  </div>
                  <a
                    href="/student_template.csv"
                    download
                    className="inline-block mt-2 text-sm underline"
                  >
                    Download Template
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Enrolled Students List */}
          <div className="bg-white dark:bg-dark-paper shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Enrolled Students
              </h2>

              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search students..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-dark-paper dark:border-dark-border dark:text-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="mt-6 flow-root">
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
                    <thead>
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
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-dark-paper divide-y divide-gray-200 dark:divide-dark-border">
                      {filteredStudents.map((student) => (
                        <tr key={student._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {student.studentId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {student.firstName} {student.lastName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {student.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleRemoveStudent(student._id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <UserMinus className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredStudents.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">
                        No students found
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LecturerLayout>
  );
};

export default ModuleEnrollment;