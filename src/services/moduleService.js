// src/services/moduleService.js
import api from './api';

export const moduleService = {
  createModule: async (moduleData) => {
    const response = await api.post('/modules', moduleData);
    return response.data;
  },

  getAllModules: async () => {
    const response = await api.get('/modules');
    return response.data;
  },

  getLecturerModules: async () => {
    const response = await api.get('/modules/lecturer');
    return response.data;
  },

  getModuleById: async (id) => {
    const response = await api.get(`/modules/${id}`);
    return response.data;
  },

  updateModule: async (id, moduleData) => {
    const response = await api.put(`/modules/${id}`, moduleData);
    return response.data;
  },

  deleteModule: async (id) => {
    const response = await api.delete(`/modules/${id}`);
    return response.data;
  },

// Get students for a specific module
  getModuleStudents: async (moduleId) => {
    const response = await api.get(`/modules/${moduleId}/students`);
    return response.data;
  },

  // Remove student from module
  removeStudent: async (moduleId, studentId) => {
    const response = await api.delete(`/modules/${moduleId}/students/${studentId}`);
    return response.data;
  },

  // Get student details with performance
  getStudentDetails: async (moduleId, studentId) => {
    const response = await api.get(`/modules/${moduleId}/students/${studentId}/details`);
    return response.data;
  },
  // Add students to module
  addStudents: async (moduleId, studentIds) => {
    const response = await api.post(`/modules/${moduleId}/students`, {
      students: studentIds
    });
    return response.data;
  },



// Get enrolled students
getEnrolledStudents: async (moduleId) => {
  const response = await api.get(`/modules/${moduleId}/students`);
  return response.data;
},

// Get available students (not enrolled in module)
getAvailableStudents: async () => {
  const response = await api.get('/users/students');
  return response.data;
},
// Add a single student
addStudent: async (moduleId, studentData) => {
  const response = await api.post(`/modules/${moduleId}/students`, studentData);
  return response.data;
},

// Remove a student
removeStudent: async (moduleId, studentId) => {
  const response = await api.delete(`/modules/${moduleId}/students/${studentId}`);
  return response.data;
},

// Upload students via CSV
uploadStudents: async (moduleId, formData) => {
  try {
    const response = await api.post(
      `/modules/${moduleId}/students/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('CSV Upload Error:', error);
    throw error;
  }
}
};