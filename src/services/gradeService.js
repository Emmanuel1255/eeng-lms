// src/services/gradeService.js
import api from './api';

export const gradeService = {
  // Get all grades for a module
  getModuleGrades: async (moduleId) => {
    try {
      const response = await api.get(`/modules/${moduleId}/grades`);
      return response.data;
    } catch (error) {
      console.error('Get module grades error:', error);
      throw error.response?.data || error;
    }
  },

  // Get grades for a specific student in a module
  getStudentGrades: async (moduleId, studentId) => {
    try {
      const response = await api.get(`/modules/${moduleId}/grades/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Get student grades error:', error);
      throw error.response?.data || error;
    }
  },

  // Update grade for a specific type (attendance, assignment, test, exam)
  updateGrade: async (moduleId, studentId, gradeData) => {
    try {
      const response = await api.post(`/modules/${moduleId}/grades/${studentId}`, gradeData);
      return response.data;
    } catch (error) {
      console.error('Update grade error:', error);
      throw error.response?.data || error;
    }
  },

  // Update attendance grade
  updateAttendanceGrade: async (moduleId, studentId, attendanceData) => {
    try {
      const response = await api.post(`/modules/${moduleId}/grades/${studentId}/attendance`, {
        attendanceCount: attendanceData.count,
        totalSessions: attendanceData.total
      });
      return response.data;
    } catch (error) {
      console.error('Update attendance grade error:', error);
      throw error.response?.data || error;
    }
  },

  // Update assignment grade
  updateAssignmentGrade: async (moduleId, studentId, assignmentData) => {
    try {
      const response = await api.post(`/modules/${moduleId}/grades/${studentId}/assignment`, {
        grade: assignmentData.grade,
        comments: assignmentData.comments
      });
      return response.data;
    } catch (error) {
      console.error('Update assignment grade error:', error);
      throw error.response?.data || error;
    }
  },

  // Update test grade
  updateTestGrade: async (moduleId, studentId, testData) => {
    try {
      const response = await api.post(`/modules/${moduleId}/grades/${studentId}/test`, {
        grade: testData.grade,
        comments: testData.comments
      });
      return response.data;
    } catch (error) {
      console.error('Update test grade error:', error);
      throw error.response?.data || error;
    }
  },

  // Update exam grade
  updateExamGrade: async (moduleId, studentId, examData) => {
    try {
      const response = await api.post(`/modules/${moduleId}/grades/${studentId}/exam`, {
        grade: examData.grade,
        comments: examData.comments
      });
      return response.data;
    } catch (error) {
      console.error('Update exam grade error:', error);
      throw error.response?.data || error;
    }
  },

  // Calculate final grade for a student
  calculateFinalGrade: async (moduleId, studentId) => {
    try {
      const response = await api.post(`/modules/${moduleId}/grades/${studentId}/calculate`);
      return response.data;
    } catch (error) {
      console.error('Calculate final grade error:', error);
      throw error.response?.data || error;
    }
  },

  // Calculate final grades for all students in a module
  calculateAllFinalGrades: async (moduleId) => {
    try {
      const response = await api.post(`/modules/${moduleId}/grades/calculate-all`);
      return response.data;
    } catch (error) {
      console.error('Calculate all final grades error:', error);
      throw error.response?.data || error;
    }
  },

  // Export grades to CSV
  exportGrades: async (moduleId) => {
    try {
      const response = await api.get(`/modules/${moduleId}/grades/export`, {
        responseType: 'blob'
      });
      
      // Create and download file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `module-${moduleId}-grades.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Export grades error:', error);
      throw error.response?.data || error;
    }
  },

  // Import grades from CSV
  importGrades: async (moduleId, file) => {
    try {
      const formData = new FormData();
      formData.append('grades', file);

      const response = await api.post(`/modules/${moduleId}/grades/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Import grades error:', error);
      throw error.response?.data || error;
    }
  },

  // Get grade statistics for a module
  getGradeStatistics: async (moduleId) => {
    try {
      const response = await api.get(`/modules/${moduleId}/grades/statistics`);
      return response.data;
    } catch (error) {
      console.error('Get grade statistics error:', error);
      throw error.response?.data || error;
    }
  },

  // Get grade distribution for a module
  getGradeDistribution: async (moduleId) => {
    try {
      const response = await api.get(`/modules/${moduleId}/grades/distribution`);
      return response.data;
    } catch (error) {
      console.error('Get grade distribution error:', error);
      throw error.response?.data || error;
    }
  },

  // Bulk update grades
  bulkUpdateGrades: async (moduleId, gradesData) => {
    try {
      const response = await api.post(`/modules/${moduleId}/grades/bulk-update`, {
        grades: gradesData
      });
      return response.data;
    } catch (error) {
      console.error('Bulk update grades error:', error);
      throw error.response?.data || error;
    }
  },

  // Get grade history for a student
  getGradeHistory: async (moduleId, studentId) => {
    try {
      const response = await api.get(`/modules/${moduleId}/grades/${studentId}/history`);
      return response.data;
    } catch (error) {
      console.error('Get grade history error:', error);
      throw error.response?.data || error;
    }
  },

  // Calculate class average
  getClassAverage: async (moduleId) => {
    try {
      const response = await api.get(`/modules/${moduleId}/grades/average`);
      return response.data;
    } catch (error) {
      console.error('Get class average error:', error);
      throw error.response?.data || error;
    }
  },

  // Helper function to calculate grade from raw score
  calculateGrade: (score, maxScore = 100) => {
    const percentage = (score / maxScore) * 100;
    
    // Grade boundaries
    if (percentage >= 90) return { grade: 'A', percentage };
    if (percentage >= 80) return { grade: 'B', percentage };
    if (percentage >= 70) return { grade: 'C', percentage };
    if (percentage >= 60) return { grade: 'D', percentage };
    return { grade: 'F', percentage };
  }
};

