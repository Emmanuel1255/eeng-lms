import React from 'react';
import { useParams } from 'react-router-dom';
import LecturerLayout from '../../../components/layout/LecturerLayout';
import GradeManagement from './GradeManagement';

const ModuleGrades = () => {
  const { moduleId } = useParams();

  return (
    <LecturerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Module Grades
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage and view grades for this module
          </p>
        </div>

        <GradeManagement moduleId={moduleId} />
      </div>
    </LecturerLayout>
  );
};

export default ModuleGrades;