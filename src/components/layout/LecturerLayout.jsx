// src/components/layout/LecturerLayout.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  LogOut,
  Menu,
  Users,
  GraduationCap,
  ClipboardCheck,
  PenTool,
  FileText,
  Calendar,
  X,
  ChevronDown
} from 'lucide-react';
import { moduleService } from '../../services/moduleService';

const LecturerLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentModule, setCurrentModule] = useState(null);
  const location = useLocation();
  const { moduleId } = useParams();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (moduleId) {
      fetchModuleDetails();
    }
  }, [moduleId]);

  const fetchModuleDetails = async () => {
    try {
      const response = await moduleService.getLecturerModules();
      // const data = await response.json();
      setCurrentModule(response.data);
    } catch (error) {
      console.error('Failed to fetch module details:', error);
    }
  };

  const mainNavigation = [
    {
      name: 'Dashboard',
      href: '/lecturer/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'Modules',
      href: '/lecturer/modules',
      icon: BookOpen
    },
    {
      name: 'Students',
      href: '/lecturer/students',
      icon: Users
    }
  ];

  const moduleNavigation = moduleId ? [
    {
      name: 'Module Overview',
      href: `/lecturer/modules/edit/${moduleId}`,
      icon: BookOpen
    },
    {
      name: 'Student Enrollment',
      href: `/lecturer/modules/${moduleId}/enrollment`,
      icon: Users
    },
    {
      name: 'Attendance',
      href: `/lecturer/modules/${moduleId}/attendance/mark`,
      icon: Calendar
    },
    {
      name: 'Grades',
      href: `/lecturer/modules/${moduleId}/grades/overview`,
      icon: GraduationCap
    }
  ] : [];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const SidebarLink = ({ item }) => (
    <Link
      to={item.href}
      className={`${location.pathname === item.href
          ? 'bg-gray-100 text-gray-900'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
    >
      <item.icon
        className={`${location.pathname === item.href
            ? 'text-gray-500'
            : 'text-gray-400 group-hover:text-gray-500'
          } mr-3 h-5 w-5`}
      />
      {item.name}
    </Link>
  );

  const MobileNav = () => (
    <div className={`
      fixed inset-0 flex z-40 md:hidden
      transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      transition-transform duration-300 ease-in-out
    `}>
      <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
        <div className="absolute top-0 right-0 -mr-12 pt-2">
          <button
            type="button"
            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="sr-only">Close sidebar</span>
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
          <div className="flex-shrink-0 flex items-center px-4">
            <h1 className="text-xl font-semibold text-gray-900">LMS Portal</h1>
          </div>
          <nav className="mt-5 px-2 space-y-1">
            {mainNavigation.map((item) => (
              <SidebarLink key={item.name} item={item} />
            ))}

            {moduleId && (
              <div className="mt-8">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {currentModule?.name || 'Module Management'}
                </h3>
                <div className="mt-1 space-y-1">
                  {moduleNavigation.map((item) => (
                    <SidebarLink key={item.name} item={item} />
                  ))}
                </div>
              </div>
            )}

          </nav>
        </div>

        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <button
            onClick={handleLogout}
            className="flex-shrink-0 group block w-full flex items-center"
          >
            <div className="flex items-center">
              <LogOut className="inline-block h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-gray-900">
                Logout
              </span>
            </div>
          </button>
        </div>
      </div>

      <div className="flex-shrink-0 w-14" aria-hidden="true">
        {/* Force sidebar to shrink to fit close icon */}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Static sidebar for desktop */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <h1 className="text-xl font-semibold text-gray-900">LMS Portal</h1>
            </div>

            <nav className="mt-5 flex-1 space-y-1 bg-white px-2">
              {mainNavigation.map((item) => (
                <SidebarLink key={item.name} item={item} />
              ))}

              {moduleId && (
                <div className="mt-8">
                  <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {currentModule?.name || 'Module Management'}
                  </h3>
                  <div className="mt-1 space-y-1">
                    {moduleNavigation.map((item) => (
                      <SidebarLink key={item.name} item={item} />
                    ))}
                  </div>
                </div>
              )}
            </nav>
          </div>

          <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
            <button
              onClick={handleLogout}
              className="group block w-full flex items-center"
            >
              <div className="flex items-center">
                <LogOut className="inline-block h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  Logout
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sticky top-0 z-10 md:hidden bg-white pl-1 pt-1 sm:pl-3 sm:pt-3">
        <button
          type="button"
          className="-ml-0.5 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          onClick={() => setSidebarOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      {/* Mobile sidebar */}
      <MobileNav />

      {/* Main content */}
      <div className="flex flex-1 flex-col md:pl-64">
        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
              {currentModule && (
                <div className="mb-6">
                  <h2 className="text-lg font-medium text-gray-900">
                    {currentModule.code} - {currentModule.name}
                  </h2>
                  {/* <p className="mt-1 text-sm text-gray-500">
                    {currentModule.level} • {currentModule.schedule.day} {currentModule.schedule.startTime}-{currentModule.schedule.endTime}
                  </p> */}
                </div>
              )}
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LecturerLayout;