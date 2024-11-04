// src/pages/lecturer/modules/EditModule.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { moduleService } from '../../../services/moduleService';
import LecturerLayout from '../../../components/layout/LecturerLayout';
import { toast } from 'react-hot-toast';

const EditModule = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    level: '',
    description: '',
    schedule: {
      day: '',
      startTime: '',
      endTime: ''
    },
    maxStudents: 30,
    assessmentMethods: {
      assignments: true,
      test: true,
      finalExam: true,
      attendance: true
    },
    assessmentWeights: {
      assignments: 30,
      test: 20,
      finalExam: 40,
      attendance: 10
    }
  });

  useEffect(() => {
    fetchModule();
  }, [id]);

  const fetchModule = async () => {
    try {
      const response = await moduleService.getModuleById(id);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching module:', error);
      toast.error('Failed to fetch module details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAssessmentMethodChange = (method) => {
    setFormData(prev => ({
      ...prev,
      assessmentMethods: {
        ...prev.assessmentMethods,
        [method]: !prev.assessmentMethods[method]
      }
    }));
  };

  const handleAssessmentWeightChange = (method, value) => {
    setFormData(prev => ({
      ...prev,
      assessmentWeights: {
        ...prev.assessmentWeights,
        [method]: parseInt(value)
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Validate assessment weights total 100%
      const totalWeight = Object.entries(formData.assessmentMethods)
        .reduce((sum, [key, enabled]) => 
          enabled ? sum + formData.assessmentWeights[key] : sum, 0);

      if (totalWeight !== 100) {
        toast.error('Assessment weights must total 100%');
        return;
      }

      await moduleService.updateModule(id, formData);
      toast.success('Module updated successfully');
      navigate('/lecturer/modules');
    } catch (error) {
      console.error('Error updating module:', error);
      toast.error(error.response?.data?.error || 'Failed to update module');
    } finally {
      setSaving(false);
    }
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
      <div className="max-w-3xl mx-auto">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Edit Module
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Update your module details and assessment structure
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white dark:bg-dark-paper shadow rounded-lg p-6">
              {/* Basic Information */}
              <div className="space-y-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Basic Information
                </h2>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Module Code
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border dark:bg-dark-paper dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Module Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border dark:bg-dark-paper dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Level
                    </label>
                    <select
                      name="level"
                      value={formData.level}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border dark:bg-dark-paper dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      required
                    >
                      <option value="">Select Level</option>
                      <option value="Year 1">Year 1</option>
                      <option value="Year 2">Year 2</option>
                      <option value="Year 3">Year 3</option>
                      <option value="Year 4">Year 4</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Maximum Students
                    </label>
                    <input
                      type="number"
                      name="maxStudents"
                      value={formData.maxStudents}
                      onChange={handleInputChange}
                      min="1"
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border dark:bg-dark-paper dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border dark:bg-dark-paper dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Schedule */}
              <div className="mt-6 space-y-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Schedule
                </h2>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Day
                    </label>
                    <select
                      name="schedule.day"
                      value={formData.schedule.day}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border dark:bg-dark-paper dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      required
                    >
                      <option value="">Select Day</option>
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Start Time
                    </label>
                    <input
                      type="time"
                      name="schedule.startTime"
                      value={formData.schedule.startTime}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border dark:bg-dark-paper dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      End Time
                    </label>
                    <input
                      type="time"
                      name="schedule.endTime"
                      value={formData.schedule.endTime}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border dark:bg-dark-paper dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Assessment Methods */}
              <div className="mt-6 space-y-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Assessment Methods
                </h2>

                <div className="space-y-4">
                  {Object.entries(formData.assessmentMethods).map(([method, enabled]) => (
                    <div key={method} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-paper rounded-lg">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={() => handleAssessmentMethodChange(method)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300 capitalize">
                          {method}
                        </label>
                      </div>
                      {enabled && (
                        <div className="flex items-center">
                          <input
                            type="number"
                            value={formData.assessmentWeights[method]}
                            onChange={(e) => handleAssessmentWeightChange(method, e.target.value)}
                            min="0"
                            max="100"
                            className="w-16 text-sm border-gray-300 dark:border-dark-border dark:bg-dark-paper dark:text-white rounded-md"
                          />
                          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">%</span>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Total Weight Display */}
                  <div className="mt-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                        Total Weight
                      </span>
                      <span className="text-sm font-bold text-primary-700 dark:text-primary-300">
                        {Object.entries(formData.assessmentMethods)
                          .reduce((total, [key, enabled]) => 
                            enabled ? total + formData.assessmentWeights[key] : total, 0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/lecturer/modules')}
                  className="px-4 py-2 border border-gray-300 dark:border-dark-border rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </LecturerLayout>
  );
};

export default EditModule;