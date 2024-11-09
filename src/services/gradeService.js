// src/services/gradeService.js
import api from './api';

export const gradeService = {
  // Get all grades for a specific module
  getModuleGrades: async (moduleId) => {
    const response = await api.get(`/grades/module/${moduleId}/grades`);
    return response.data;
  },

  // Get grade statistics for a module
  getGradeStatistics: async (moduleId) => {
    const response = await api.get(`/grades/module/${moduleId}/statistics`);
    return response.data;
  },

  // Update a specific grade for a student in a module
  updateGrade: async (moduleId, studentId, gradeData) => {
    const response = await api.post(`/grades/module/${moduleId}/student/${studentId}`, gradeData);
    return response.data;
  },

  // Update attendance grades for a module
  updateAttendanceGrades: async (moduleId) => {
    const response = await api.post(`/grades/module/${moduleId}/attendance`);
    return response.data;
  },

  // Get all grades for a specific student
  getStudentGrades: async (studentId) => {
    const response = await api.get(`/grades/student/${studentId}`);
    return response.data;
  },

  // Calculate final grades for a module
  calculateModuleGrades: async (moduleId) => {
    const response = await api.post(`/grades/module/${moduleId}/calculate`);
    return response.data;
  },

  // Export grades for a module to a CSV file
  exportGrades: async (moduleId) => {
    try {
      // Use api instance instead of fetch to maintain authentication
      const response = await api.get(`/grades/module/${moduleId}/export`, {
        responseType: 'blob', // Important for file download
        headers: {
          'Accept': 'text/csv',
        },
      });

      return response; // Will be handled by the blob in the component
    } catch (error) {
      throw error;
    }
  },

  // Import grades for a module from a CSV file
  importGrades: async (moduleId, formData) => {
    const response = await api.post(`/grades/module/${moduleId}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  

};

export default gradeService;
