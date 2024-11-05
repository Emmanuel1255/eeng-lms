// src/pages/lecturer/attendance/AttendanceManagement.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
    Calendar,
    Clock,
    Users,
    QrCode,
    CheckCircle,
    XCircle,
    AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import LecturerLayout from '../../../components/layout/LecturerLayout';
import { attendanceService } from '../../../services/api';

const AttendanceManagement = () => {
    const { moduleId } = useParams();
    const [loading, setLoading] = useState(true);
    const [module, setModule] = useState(null);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [showQRCode, setShowQRCode] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [qrCodeData, setQRCodeData] = useState(null);
    const [currentSession, setCurrentSession] = useState(null);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        fetchAttendanceData();
    }, [moduleId]);

    const fetchAttendanceData = async () => {
        try {
            const response = await attendanceService.getModuleAttendance(moduleId);
            console.log('Attendance data:', response.data);
            setAttendanceRecords(response.data.data || []);
        } catch (error) {
            console.error('Fetch attendance error:', error);
            toast.error('Failed to fetch attendance records');
        } finally {
            setLoading(false);
        }
    };

    const formatTimeForAPI = (date) => {
        return date.toTimeString().split(' ')[0].substr(0, 5);
    };

    const createAttendanceSession = async () => {
        try {
            setGenerating(true);
            const now = new Date();
            const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

            const data = {
                moduleId,
                date: now.toISOString().split('T')[0],
                startTime: formatTimeForAPI(now),
                endTime: formatTimeForAPI(twoHoursLater),
                type: 'lecture'
            };

            console.log('Creating attendance session with data:', data);

            const response = await attendanceService.createAttendance(data);
            console.log('Attendance creation response:', response);

            if (response?.data?._id) {
                setCurrentSession(response.data);
                try {
                    const qrResponse = await generateQRCode(response.data._id);
                    console.log('QR code response:', qrResponse);
                    if (qrResponse?.data?.data) {
                        setQRCodeData(qrResponse.data.data);
                        setShowQRCode(true);
                        await fetchAttendanceData();
                        toast.success('Attendance session started');
                    } else {
                        throw new Error('Invalid QR code data');
                    }
                } catch (qrError) {
                    console.error('QR generation error:', qrError);
                    toast.error('Failed to generate QR code');
                }
            } else {
                throw new Error('Invalid session creation response');
            }
        } catch (error) {
            console.error('Create session error:', error);
            toast.error(error.response?.data?.error || 'Failed to create attendance session');
        } finally {
            setGenerating(false);
        }
    };

    const generateQRCode = async (attendanceId) => {
        try {
            const response = await attendanceService.generateQRCode(attendanceId);
            if (response.data?.data) {
                setQRCodeData(response.data.data);
                return response;
            }
            throw new Error('Invalid QR code data received');
        } catch (error) {
            console.error('Generate QR code error:', error);
            toast.error('Failed to generate QR code');
            throw error;
        }
    };

    const updateAttendanceStatus = async (attendanceId, studentId, status) => {
        try {
            await attendanceService.updateAttendance(attendanceId, studentId, { status });
            await fetchAttendanceData();
            toast.success('Attendance status updated successfully');
        } catch (error) {
            console.error('Update attendance error:', error);
            toast.error('Failed to update attendance status');
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

    const QRCodeModal = () => {
        if (!showQRCode || !qrCodeData) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white dark:bg-dark-paper rounded-lg p-6 max-w-sm w-full">
                    <div className="text-center">
                        <h3 className="text-lg font-medium mb-4">Scan to Mark Attendance</h3>
                        <div className="bg-white p-4 rounded-lg shadow-inner mb-4">
                            <QRCodeSVG
                                value={qrCodeData}
                                size={200}
                                level="H"
                                includeMargin={true}
                            />
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                            QR Code will expire in 5 minutes
                        </p>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => currentSession && generateQRCode(currentSession._id)}
                                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                            >
                                Regenerate
                            </button>
                            <button
                                onClick={() => setShowQRCode(false)}
                                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <LecturerLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                            Attendance Management
                        </h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Manage attendance for your module sessions
                        </p>
                    </div>
                    <button
                        onClick={createAttendanceSession}
                        disabled={generating}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {generating ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating...
                            </>
                        ) : (
                            <>
                                <Clock className="h-5 w-5 mr-2" />
                                Start Session
                            </>
                        )}
                    </button>
                </div>

                {/* QR Code Modal */}
                <QRCodeModal />

                {/* Attendance Records */}
                <div className="bg-white dark:bg-dark-paper shadow overflow-hidden sm:rounded-lg">
                    <ul className="divide-y divide-gray-200 dark:divide-dark-border">
                        {attendanceRecords.map((record) => (
                            <li key={record._id}>
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {new Date(record.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                {record.type}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                            <Users className="h-5 w-5 mr-2" />
                                            <span>
                                                Present: {record.students.filter(s => s.status === 'present').length} / {record.students.length}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Student List */}
                                    <div className="mt-4">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
                                            <thead className="bg-gray-50 dark:bg-dark-paper">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Student
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white dark:bg-dark-paper divide-y divide-gray-200 dark:divide-dark-border">
                                                {record.students.map((student) => (
                                                    <tr key={student._id}>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <div>
                                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                        {student.student.firstName} {student.student.lastName}
                                                                    </div>
                                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                        {student.student.studentId}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${student.status === 'present'
                                                                ? 'bg-green-100 text-green-800'
                                                                : student.status === 'late'
                                                                    ? 'bg-yellow-100 text-yellow-800'
                                                                    : 'bg-red-100 text-red-800'
                                                                }`}>
                                                                {student.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <div className="flex justify-end space-x-2">
                                                                <button
                                                                    onClick={() => updateAttendanceStatus(record._id, student.student._id, 'present')}
                                                                    className="text-green-600 hover:text-green-900"
                                                                >
                                                                    <CheckCircle className="h-5 w-5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => updateAttendanceStatus(record._id, student.student._id, 'late')}
                                                                    className="text-yellow-600 hover:text-yellow-900"
                                                                >
                                                                    <AlertCircle className="h-5 w-5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => updateAttendanceStatus(record._id, student.student._id, 'absent')}
                                                                    className="text-red-600 hover:text-red-900"
                                                                >
                                                                    <XCircle className="h-5 w-5" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </LecturerLayout>
    );
};

export default AttendanceManagement;