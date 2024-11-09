// src/pages/lecturer/LecturerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, Clock, CalendarDays, BarChart, CheckCircle, AlertCircle, PlusCircle, Book, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { lecturerService } from '../../services/lecturerService';
import LecturerLayout from '../../components/layout/LecturerLayout';

const LecturerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState([]);
  const [activeModules, setActiveModules] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsResponse, modulesResponse, activitiesResponse, sessionsResponse] = await Promise.all([
        lecturerService.getStats(),
        lecturerService.getActiveModules(),
        // lecturerService.getRecentActivities(),
        // lecturerService.getUpcomingSessions()
      ]);

      setStats([
        {
          label: 'Active Modules',
          value: statsResponse.data.activeModules,
          icon: BookOpen,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100'
        },
        {
          label: 'Total Students',
          value: statsResponse.data.totalStudents,
          icon: Users,
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        },
        {
          label: 'Average Attendance',
          value: `${Math.round(statsResponse.data.averageAttendance)}%`,
          icon: Clock,
          color: 'text-purple-600',
          bgColor: 'bg-purple-100'
        },
        {
          label: 'Upcoming Sessions',
          value: statsResponse.data.upcomingSessions,
          icon: CalendarDays,
          color: 'text-orange-600',
          bgColor: 'bg-orange-100'
        }
      ]);

      setActiveModules(modulesResponse.data);
      console.log(modulesResponse.data);
      // setRecentActivities(activitiesResponse.data);
      // setUpcomingSessions(sessionsResponse.data);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';

    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Just now';
    }
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    }
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'attendance':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'grade':
        return <BarChart className="w-5 h-5 text-blue-600" />;
      default:
        return <Clock className="w-5 h-5 text-purple-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-lg text-gray-800 mb-4">{error}</p>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <LecturerLayout>
    <div className="space-y-6 p-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-gray-600">Here's what's happening in your modules today</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => navigate('/lecturer/modules/create')}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            New Module
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-semibold mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-full`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Modules */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center">
              <Book className="w-5 h-5 mr-2" />
              Active Modules
            </CardTitle>
            <button
              onClick={() => navigate('/lecturer/modules')}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              View All
            </button>
          </CardHeader>
          <CardContent>
            {activeModules.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No active modules found
              </div>
            ) : (
              <div className="space-y-4">
                {activeModules.map((module) => (
                  <div
                    key={module._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => navigate(`/lecturer/modules/edit/${module._id}`)}
                  >
                    <div>
                      <h3 className="font-medium">{module.code}</h3>
                      <p className="text-sm text-gray-600">{module.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {module.enrolledStudents} students
                      </p>
                      <p className="text-sm text-gray-600">
                        {module.level}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No recent activities
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity._id} className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${
                      activity.type === 'attendance' ? 'bg-green-100' :
                      activity.type === 'grade' ? 'bg-blue-100' : 'bg-purple-100'
                    }`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {formatTimestamp(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card> */}
      </div>

      {/* Upcoming Sessions */}
      {/* <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center">
            <CalendarDays className="w-5 h-5 mr-2" />
            Upcoming Sessions
          </CardTitle>
          <button
            onClick={() => navigate('/lecturer/sessions')}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            View All
          </button>
        </CardHeader>
        <CardContent>
          {upcomingSessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No upcoming sessions scheduled
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingSessions.map((session) => (
                <div
                  key={session._id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{session.module.code}</h4>
                      <p className="text-sm text-gray-600">{session.type}</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                      {session.venue}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarDays className="w-4 h-4 mr-1" />
                    {new Date(session.date).toLocaleDateString('en-GB', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short'
                    })}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <Clock className="w-4 h-4 mr-1" />
                    {session.startTime}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card> */}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/lecturer/attendance')}
              className="p-4 text-center bg-gray-50 rounded-lg hover:bg-gray-100 hover:shadow-md transition-all"
            >
              <Clock className="w-6 h-6 mx-auto mb-2 text-primary-600" />
              <span className="text-sm font-medium">Mark Attendance</span>
            </button>
            <button
              onClick={() => navigate('/lecturer/grades')}
              className="p-4 text-center bg-gray-50 rounded-lg hover:bg-gray-100 hover:shadow-md transition-all"
            >
              <BarChart className="w-6 h-6 mx-auto mb-2 text-primary-600" />
              <span className="text-sm font-medium">Update Grades</span>
            </button>
            <button
              onClick={() => navigate('/lecturer/sessions')}
              className="p-4 text-center bg-gray-50 rounded-lg hover:bg-gray-100 hover:shadow-md transition-all"
            >
              <BookOpen className="w-6 h-6 mx-auto mb-2 text-primary-600" />
              <span className="text-sm font-medium">Start Session</span>
            </button>
            <button
              onClick={() => navigate('/lecturer/reports')}
              className="p-4 text-center bg-gray-50 rounded-lg hover:bg-gray-100 hover:shadow-md transition-all"
            >
              <AlertCircle className="w-6 h-6 mx-auto mb-2 text-primary-600" />
              <span className="text-sm font-medium">View Reports</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
    </LecturerLayout>
  );
};

export default LecturerDashboard;