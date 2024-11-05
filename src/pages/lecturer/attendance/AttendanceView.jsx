// src/pages/lecturer/attendance/AttendanceListView.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Download, Search, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import LecturerLayout from '../../../components/layout/LecturerLayout';
import { attendanceService } from '../../../services/api';

const AttendanceListView = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [moduleDetails, setModuleDetails] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [dateList, setDateList] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchAttendanceData();
    }, [id]);

    useEffect(() => {
        // Extract unique dates from attendance records
        const dates = [...new Set(attendanceRecords.map(record =>
            new Date(record.date).toISOString().split('T')[0]
        ))].sort();
        setDateList(dates);
    }, [attendanceRecords]);

    useEffect(() => {
        filterRecords();
    }, [selectedDate, searchTerm, attendanceRecords]);

    const fetchAttendanceData = async () => {
        try {
            const response = await attendanceService.getModuleAttendance(id);
            setAttendanceRecords(response.data.data || []);
            setFilteredRecords(response.data.data || []);
            setLoading(false);
        } catch (error) {
            console.error('Fetch attendance error:', error);
            toast.error('Failed to fetch attendance records');
            setLoading(false);
        }
    };

    const filterRecords = () => {
        let filtered = [...attendanceRecords];

        // Filter by date
        if (selectedDate) {
            filtered = filtered.filter(record =>
                record.date.split('T')[0] === selectedDate
            );
        }

        // Filter by search term
        if (searchTerm.trim()) {
            filtered = filtered.map(record => ({
                ...record,
                students: record.students.filter(student => {
                    const searchString = `${student.student.firstName} ${student.student.lastName} ${student.student.studentId}`
                        .toLowerCase();
                    return searchString.includes(searchTerm.toLowerCase().trim());
                })
            })).filter(record => record.students.length > 0);
        }

        setFilteredRecords(filtered);
    };

    useEffect(() => {
        console.log('Search Term:', searchTerm);
        console.log('Filtered Records:', filteredRecords);
    }, [searchTerm, filteredRecords]);


    const exportToCSV = () => {
        const headers = ['Date', 'Student ID', 'Student Name', 'Status', 'Time Marked'];
        const csvData = filteredRecords.flatMap(record =>
            record.students.map(student => [
                new Date(record.date).toLocaleDateString(),
                student.student.studentId,
                `${student.student.firstName} ${student.student.lastName}`,
                student.status,
                student.timeMarked ? new Date(student.timeMarked).toLocaleTimeString() : 'N/A'
            ])
        );

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance-${selectedDate || 'all'}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const calculateStats = (records) => {
        let totalPresent = 0;
        let totalLate = 0;
        let totalAbsent = 0;
        let totalStudents = 0;

        records.forEach(record => {
            record.students.forEach(student => {
                totalStudents++;
                if (student.status === 'present') totalPresent++;
                else if (student.status === 'late') totalLate++;
                else if (student.status === 'absent') totalAbsent++;
            });
        });

        return { totalPresent, totalLate, totalAbsent, totalStudents };
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

    const stats = calculateStats(filteredRecords);

    return (
        <LecturerLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                            Attendance Records
                        </h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            View and manage attendance records for this module
                        </p>
                    </div>
                    <button
                        onClick={exportToCSV}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                    >
                        <Download className="h-5 w-5 mr-2" />
                        Export to CSV
                    </button>
                </div>

                {/* Filters */}

                <div className="bg-white dark:bg-dark-paper shadow rounded-lg p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Select Date
                            </label>
                            <select
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
                            >
                                <option value="">All Dates</option>
                                {dateList.map(date => (
                                    <option key={date} value={date}>
                                        {new Date(date).toLocaleDateString()}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Search Students
                            </label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        console.log('Search input:', e.target.value); // Debug log
                                    }}
                                    placeholder="Search by name or ID"
                                    className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Statistics */}
                    <div className="grid grid-cols-4 gap-4 pt-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Students</div>
                            <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalStudents}</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                            <div className="text-sm font-medium text-green-500">Present</div>
                            <div className="mt-1 text-2xl font-semibold text-green-600">{stats.totalPresent}</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                            <div className="text-sm font-medium text-yellow-500">Late</div>
                            <div className="mt-1 text-2xl font-semibold text-yellow-600">{stats.totalLate}</div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                            <div className="text-sm font-medium text-red-500">Absent</div>
                            <div className="mt-1 text-2xl font-semibold text-red-600">{stats.totalAbsent}</div>
                        </div>
                    </div>
                </div>

                {/* Attendance Records Table */}
                <div className="bg-white dark:bg-dark-paper shadow overflow-hidden sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
                        <thead className="bg-gray-50 dark:bg-dark-paper">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Date
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Student
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Time Marked
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-dark-paper divide-y divide-gray-200 dark:divide-dark-border">
                            {filteredRecords.map((record) => (
                                record.students.map((student) => (
                                    <tr key={`${record._id}-${student.student._id}`}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {new Date(record.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {student.student.firstName} {student.student.lastName}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {student.student.studentId}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${student.status === 'present'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                : student.status === 'late'
                                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                                }`}>
                                                {student.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {student.timeMarked ? new Date(student.timeMarked).toLocaleTimeString() : 'N/A'}
                                        </td>
                                    </tr>
                                ))
                            ))}
                        </tbody>
                    </table>

                    {filteredRecords.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-500 dark:text-gray-400">
                                No attendance records found for the selected criteria
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </LecturerLayout>
    );
};

export default AttendanceListView;