import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff } from 'lucide-react';
import {
  User,
  Mail,
  Key,
  Save,
  Loader2,
  AlertCircle,
  GraduationCap,
  Building
} from 'lucide-react';
import StudentLayout from '../../components/layout/StudentLayout';
import { studentService } from '../../services/studentService';

const faculties = [
  'Engineering'
  // 'Science',
  // 'Arts',
  // 'Business',
  // 'Medicine',
  // 'Law'
];

const departments = {
  Engineering: [
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Mining Engineering',
    'Architecture'
  ]

  // Science: [
  //   'Physics',
  //   'Chemistry',
  //   'Biology',
  //   'Mathematics',
  //   'Computer Science'
  // ],
  // Add more faculty-department mappings
};

const StudentProfile = () => {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    control // Add this
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      gender: '',
      faculty: '',
      department: ''
    }
  });

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch: watchPassword
  } = useForm();

  // Watch faculty for department updates
  const watchedFaculty = watch('faculty');

  // Watch new password for confirmation validation
  const newPassword = watchPassword('newPassword');

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (watchedFaculty) {
      setSelectedFaculty(watchedFaculty);
    }
  }, [watchedFaculty]);

  const fetchUserData = async () => {
    try {
      const userData = await studentService.getCurrentUser();
      if (userData.success) {
        setUser(userData.data);
        // Reset form with user data
        reset({
          firstName: userData.data.firstName,
          lastName: userData.data.lastName,
          email: userData.data.email,
          gender: userData.data.gender,
          faculty: userData.data.faculty,
          department: userData.data.department
        });
        setSelectedFaculty(userData.data.faculty);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsUpdatingProfile(true);

      // Prepare the update data
      const updateData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        gender: data.gender,
        faculty: data.faculty,
        department: data.department
      };

      console.log('Updating profile with data:', updateData); // Debug log

      const response = await studentService.updateProfile(updateData);

      if (response.success) {
        setUser(response.data);
        // Update form with new values
        reset(response.data);
        // Update selected faculty
        setSelectedFaculty(response.data.faculty);
        toast.success('Profile updated successfully');
      } else {
        // Handle validation errors
        if (response.errors && response.errors.length > 0) {
          response.errors.forEach(error => {
            toast.error(error.msg || error.message);
            if (error.path === 'department') {
              setValue('department', ''); // Reset department if invalid
            }
          });
        } else {
          throw new Error(response.error || 'Failed to update profile');
        }
      }
    } catch (error) {
      console.error('Profile update error:', error);
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach(err =>
          toast.error(err.msg || err.message)
        );
      } else {
        toast.error(error.message || 'Failed to update profile');
      }
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      setIsUpdatingPassword(true);
      await studentService.updatePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword
      });
      toast.success('Password updated successfully');
      resetPassword();
    } catch (error) {
      toast.error(error.message || 'Failed to update password');
      console.error('Password update error:', error);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Profile Settings
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage your account settings and personal information
          </p>
        </div>

        {/* Profile Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* First Name & Last Name Grid */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* First Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    First Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('firstName', {
                        required: 'First name is required',
                        minLength: {
                          value: 2,
                          message: 'First name must be at least 2 characters'
                        }
                      })}
                      className="pl-10 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Last Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('lastName', {
                        required: 'Last name is required',
                        minLength: {
                          value: 2,
                          message: 'Last name must be at least 2 characters'
                        }
                      })}
                      className="pl-10 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              {/* Gender Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Gender
                </label>
                <Select
                  value={watch('gender') || ''}
                  onValueChange={(value) => setValue('gender', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-sm text-red-600">{errors.gender.message}</p>
                )}
              </div>

              {/* Faculty Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Faculty
                </label>
                <Select
                  value={watch('faculty') || ''}
                  onValueChange={(value) => {
                    setValue('faculty', value);
                    setValue('department', ''); // Reset department when faculty changes
                    setSelectedFaculty(value);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculties.map((faculty) => (
                      <SelectItem key={faculty} value={faculty}>
                        {faculty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.faculty && (
                  <p className="text-sm text-red-600">{errors.faculty.message}</p>
                )}
              </div>

              {/* Department Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Department
                </label>
                <Select
                  value={watch('department') || ''}
                  onValueChange={(value) => {
                    // Validate department before setting
                    if (selectedFaculty && departments[selectedFaculty]?.includes(value)) {
                      setValue('department', value);
                    } else {
                      toast.error('Invalid department selection');
                      setValue('department', '');
                    }
                  }}
                  disabled={!selectedFaculty}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedFaculty && departments[selectedFaculty]?.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.department && (
                  <p className="text-sm text-red-600">{errors.department.message}</p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    className="pl-10 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Student ID Field (Read-only) */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Student ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <GraduationCap className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    readOnly
                    value={user?.studentId || ''}
                    className="pl-10 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 bg-gray-50 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-500">Student ID cannot be changed</p>
              </div>

              {/* Profile Form Actions */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => reset(user)}
                  disabled={isUpdatingProfile}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="inline-flex items-center"
                >
                  {isUpdatingProfile ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Password Change Card */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
              {/* Current Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Current Password
                </label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    {...registerPassword('currentPassword', {
                      required: 'Current password is required'
                    })}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
                )}
              </div>

              {/* New Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    {...registerPassword('newPassword', {
                      required: 'New password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      },
                      pattern: {
                        value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/,
                        message: 'Password must contain at least one letter and one number'
                      }
                    })}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-sm text-red-600">{passwordErrors.newPassword.message}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    {...registerPassword('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) => value === newPassword || 'Passwords do not match'
                    })}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>

              {/* Password Requirements Notice */}
              <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0" />
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p>Password must:</p>
                    <ul className="list-disc pl-5 mt-1">
                      <li>Be at least 6 characters long</li>
                      <li>Contain at least one letter and one number</li>
                      <li>Not be the same as your current password</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Password Form Actions */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="inline-flex items-center"
                >
                  {isUpdatingPassword ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Key className="w-4 h-4 mr-2" />
                  )}
                  {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
};

export default StudentProfile;