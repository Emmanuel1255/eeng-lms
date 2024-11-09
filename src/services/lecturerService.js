// src/services/lecturerService.js
import api from './api';

export const lecturerService = {
  // Get overall stats
  getStats: async () => {
    try {
      const modulesData = await api.get('/modules/lecturer');
      // const attendanceData = await api.get('/attendance/stats');
      // const upcomingSessions = await api.get('/attendance/upcoming');

      const modules = modulesData.data.data || [];
      const totalStudents = modules.reduce((acc, module) => acc + (module.enrolledStudents?.length || 0), 0);
      const level = modulesData.data.level;

      return {
        success: true,
        data: {
          activeModules: modules.length,
          totalStudents,
          level,
          // averageAttendance: attendanceData.data?.averageAttendance || 0
        }
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      throw error;
    }
  },

  // Get active modules with attendance stats
  getActiveModules: async () => {
    try {
      const response = await api.get('/modules/lecturer');
      const modules = response.data.data || [];

      const modulesWithStats = await Promise.all(
        modules.map(async (module) => {
          try {
            const attendanceStats = await api.get(`/attendance/stats/module/${module._id}`);
            return {
              _id: module._id,
              code: module.code,
              name: module.name,
              enrolledStudents: module.enrolledStudents?.length || 0,
              averageAttendance: attendanceStats.data?.averageAttendance || 0,
              level: module.level,
              creditHours: module.creditHours
            };
          } catch (error) {
            console.error(`Error getting stats for module ${module._id}:`, error);
            return {
              _id: module._id,
              code: module.code,
              name: module.name,
              enrolledStudents: module.enrolledStudents?.length || 0,
              averageAttendance: 0
            };
          }
        })
      );

      return {
        success: true,
        data: modulesWithStats
      };
    } catch (error) {
      console.error('Error getting active modules:', error);
      throw error;
    }
  },

  // Get recent activities
  // getRecentActivities: async () => {
  //   try {
  //     const [attendanceResponse, gradesResponse] = await Promise.all([
  //       api.get('/attendance/recent'),
  //       api.get('/grades/recent')
  //     ]);

  //     const attendanceActivities = (attendanceResponse.data.data || []).map(attendance => ({
  //       _id: attendance._id,
  //       type: 'attendance',
  //       description: `Marked attendance for ${attendance.module?.code || 'Unknown Module'}`,
  //       timestamp: attendance.createdAt,
  //       moduleId: attendance.module?._id
  //     }));

  //     const gradeActivities = (gradesResponse.data.data || []).map(grade => ({
  //       _id: grade._id,
  //       type: 'grade',
  //       description: `Updated grades for ${grade.module?.code || 'Unknown Module'}`,
  //       timestamp: grade.updatedAt,
  //       moduleId: grade.module?._id
  //     }));

  //     const allActivities = [...attendanceActivities, ...gradeActivities]
  //       .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  //       .slice(0, 10);

  //     return {
  //       success: true,
  //       data: allActivities
  //     };
  //   } catch (error) {
  //     console.error('Error getting recent activities:', error);
  //     throw error;
  //   }
  // },

  // Get upcoming sessions
  // getUpcomingSessions: async () => {
  //   try {
  //     const response = await api.get('/attendance/upcoming');
  //     const sessions = response.data.data || [];

  //     const formattedSessions = sessions.map(session => ({
  //       _id: session._id,
  //       module: {
  //         code: session.module?.code || 'Unknown Module',
  //         name: session.module?.name || ''
  //       },
  //       type: session.type || 'lecture',
  //       date: session.date,
  //       startTime: session.startTime,
  //       venue: session.venue || 'TBD'
  //     }));

  //     return {
  //       success: true,
  //       data: formattedSessions
  //     };
  //   } catch (error) {
  //     console.error('Error getting upcoming sessions:', error);
  //     throw error;
  //   }
  // }
};

export default lecturerService;
