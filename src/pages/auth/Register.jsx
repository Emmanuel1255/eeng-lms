// src/pages/auth/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authService } from '../../services/api';

const faculties = [
  'Engineering',
  'Science',
  'Arts',
  'Business',
  'Medicine',
  'Law'
];

const departments = {
  Engineering: [
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'Computer Engineering'
  ],
  Science: [
    'Physics',
    'Chemistry',
    'Biology',
    'Mathematics',
    'Computer Science'
  ],
  // Add more faculty-department mappings as needed
};

const Register = () => {
  const [error, setError] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, watch } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await authService.register(data);
      console.log(response);

      if (!response.success) {
        throw new Error(result.error || 'Registration failed');
      }

      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-bold text-white">
          Create your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Existing fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-200">
                  First Name
                </label>
                <input
                  {...register('firstName', { required: 'First name is required' })}
                  className="mt-1 block w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-md"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-400">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-200">
                  Last Name
                </label>
                <input
                  {...register('lastName', { required: 'Last name is required' })}
                  className="mt-1 block w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-md"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-400">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Gender Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-200">
                Gender
              </label>
              <select
                {...register('gender', { required: 'Gender is required' })}
                className="mt-1 block w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-md"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && (
                <p className="mt-1 text-sm text-red-400">{errors.gender.message}</p>
              )}
            </div>

            {/* Faculty Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-200">
                Faculty
              </label>
              <select
                {...register('faculty', { required: 'Faculty is required' })}
                onChange={(e) => setSelectedFaculty(e.target.value)}
                className="mt-1 block w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-md"
              >
                <option value="">Select Faculty</option>
                {faculties.map((faculty) => (
                  <option key={faculty} value={faculty}>
                    {faculty}
                  </option>
                ))}
              </select>
              {errors.faculty && (
                <p className="mt-1 text-sm text-red-400">{errors.faculty.message}</p>
              )}
            </div>

            {/* Department Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-200">
                Department
              </label>
              <select
                {...register('department', { required: 'Department is required' })}
                className="mt-1 block w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-md"
                disabled={!selectedFaculty}
              >
                <option value="">Select Department</option>
                {selectedFaculty && departments[selectedFaculty]?.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              {errors.department && (
                <p className="mt-1 text-sm text-red-400">{errors.department.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200">
                Email address
              </label>
              <input
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className="mt-1 block w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200">
                Password
              </label>
              <input
                type="password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
                className="mt-1 block w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-200">
                Role
              </label>
              <select
                {...register('role', { required: 'Role is required' })}
                className="mt-1 block w-full bg-gray-700 border border-gray-600 text-gray-200 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select a role</option>
                <option value="student">Student</option>
                <option value="lecturer">Lecturer</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-400">{errors.role.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Sign up
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-gray-400">
                  Already have an account?{' '}
                  <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300">
                    Sign in
                  </Link>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;