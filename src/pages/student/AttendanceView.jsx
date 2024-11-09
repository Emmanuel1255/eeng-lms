import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import {
    Calendar,
    Clock,
    Users,
    CheckCircle,
    XCircle,
    AlertCircle,
    BookOpen,
    QrCode
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from 'react-hot-toast';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import QRScanner from '@/components/QRScanner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import StudentLayout from '../../components/layout/StudentLayout';
import { moduleService } from '../../services/moduleService';
import { attendanceServiceStop } from '../../services/attendanceService';

const AttendanceView = () => {
    const [loading, setLoading] = useState(true);
    const [modules, setModules] = useState([]);
    const [selectedModuleId, setSelectedModuleId] = useState('');
    const [attendanceData, setAttendanceData] = useState({});
    const [showScanner, setShowScanner] = useState(false);
    const [scanning, setScanning] = useState(false);
    const user = JSON.parse(localStorage.getItem('user'));


    useEffect(() => {
        fetchModules();
    }, []);

    useEffect(() => {
        let scanner;
        if (showScanner) {
            scanner = new Html5QrcodeScanner('qr-reader', {
                fps: 10,
                qrbox: 250,
                aspectRatio: 1
            });

            scanner.render(onScanSuccess, onScanError);
        }

        return () => {
            if (scanner) {
                scanner.clear();
            }
        };
    }, [showScanner]);

    const fetchModules = async () => {
        try {
            const modulesResponse = await moduleService.getStudentModules();
            if (modulesResponse.success) {
                setModules(modulesResponse.data);
                if (modulesResponse.data.length > 0) {
                    setSelectedModuleId(modulesResponse.data[0]._id);
                    await fetchAttendanceData(modulesResponse.data[0]._id);
                }
            }
        } catch (error) {
            console.error('Error fetching modules:', error);
            toast.error('Failed to fetch modules');
        } finally {
            setLoading(false);
        }
    };

    const fetchAttendanceData = async (moduleId) => {
        try {
            const attendance = await attendanceServiceStop.getStudentAttendance(moduleId);
            setAttendanceData({ [moduleId]: attendance.data });
        } catch (error) {
            console.error('Error fetching attendance:', error);
            toast.error('Failed to fetch attendance records');
        }
    };

    const onScanSuccess = async (qrData) => {
        try {
            setScanning(true);
            // Parse the scanned data first to validate it's proper JSON
            const scannedData = JSON.parse(qrData);

            // Send the attendanceId and token to the server
            const response = await attendanceServiceStop.markAttendanceQR({
                attendanceId: scannedData.attendanceId,
                token: scannedData.token // Add this line
            });

            if (response.success) {
                toast.success('Attendance marked successfully');
                setShowScanner(false);
                await fetchAttendanceData(selectedModuleId);
            } else {
                throw new Error('Failed to mark attendance');
            }
        } catch (error) {
            console.error('Scan error:', error);
            toast.error(error.response?.data?.message || 'Invalid QR code');
        } finally {
            setScanning(false);
        }
    };

    const onScanError = (error) => {
        if (error?.includes('NotFound')) {
            console.log('No QR code found');
            return;
        }
        console.warn(error);
    };

    const handleModuleChange = async (moduleId) => {
        setSelectedModuleId(moduleId);
        await fetchAttendanceData(moduleId);
    };

    const calculateStats = () => {
        const records = attendanceData[selectedModuleId] || [];
        return {
            present: records.filter(record => record.status === 'present').length,
            late: records.filter(record => record.status === 'late').length,
            absent: records.filter(record => record.status === 'absent').length,
            total: records.length
        };
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'present':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'late':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'absent':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleQRSuccess = async (decodedText) => {
        try {
            const qrData = JSON.parse(decodedText);

            // Validate QR data structure
            if (!qrData.attendanceId || !qrData.token) {
                throw new Error('Invalid QR code format');
            }

            const response = await attendanceServiceStop.markAttendanceQR({
                attendanceId: qrData.attendanceId,
                token: qrData.token,
                moduleId: selectedModuleId,
                studentId: user._id
            });

            if (response.success) {
                toast.success('Attendance marked successfully');
                await fetchAttendanceData(selectedModuleId);
            } else {
                throw new Error(response.error || 'Failed to mark attendance');
            }
        } catch (error) {
            console.error('QR attendance error:', error);
            toast.error(error.message || 'Failed to mark attendance');
        }
    };

    const QRScannerModal = () => {
        if (!showScanner) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white dark:bg-dark-paper rounded-lg p-6 max-w-lg w-full">
                    <div className="text-center">
                        <h3 className="text-lg font-medium mb-4">Scan Attendance QR Code</h3>
                        <div id="qr-reader" className="mb-4"></div>
                        <button
                            onClick={() => setShowScanner(false)}
                            className="mt-4 w-full inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <StudentLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            </StudentLayout>
        );
    }

    const stats = calculateStats();
    const attendanceRate = stats.total > 0
        ? (((stats.present + (stats.late * 0.5)) / stats.total) * 100).toFixed(1)
        : 0;
    const selectedModule = modules.find(m => m._id === selectedModuleId);

    return (
        <StudentLayout>
            <div className="space-y-6">
                {/* Header with Module Selector and Mark Attendance Button */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                            Attendance Records
                        </h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            View your attendance for each module
                        </p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Button
                            onClick={() => setShowScanner(true)}
                            className="inline-flex items-center"
                            disabled={scanning}
                        >
                            <QrCode className="h-4 w-4 mr-2" />
                            Mark Attendance
                        </Button>
                        <div className="w-72">
                            <Select
                                value={selectedModuleId}
                                onValueChange={handleModuleChange}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select Module" />
                                </SelectTrigger>
                                <SelectContent>
                                    {modules.map((module) => (
                                        <SelectItem key={module._id} value={module._id}>
                                            {module.code} - {module.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {selectedModule && (
                    <>
                        {/* Statistics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <Card className="bg-white dark:bg-gray-800">
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <CheckCircle className="h-8 w-8 mx-auto text-green-500" />
                                        <h3 className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
                                            {attendanceRate}%
                                        </h3>
                                        <p className="text-sm text-gray-500">Overall Attendance</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-white dark:bg-gray-800">
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <CheckCircle className="h-8 w-8 mx-auto text-green-500" />
                                        <h3 className="mt-2 text-xl font-semibold text-green-600">
                                            {stats.present}
                                        </h3>
                                        <p className="text-sm text-gray-500">Present</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-white dark:bg-gray-800">
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <AlertCircle className="h-8 w-8 mx-auto text-yellow-500" />
                                        <h3 className="mt-2 text-xl font-semibold text-yellow-600">
                                            {stats.late}
                                        </h3>
                                        <p className="text-sm text-gray-500">Late</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-white dark:bg-gray-800">
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <XCircle className="h-8 w-8 mx-auto text-red-500" />
                                        <h3 className="mt-2 text-xl font-semibold text-red-600">
                                            {stats.absent}
                                        </h3>
                                        <p className="text-sm text-gray-500">Absent</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Attendance Records */}
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>Attendance Records</CardTitle>
                                    <Badge
                                        className={attendanceRate >= 80 ? 'bg-green-100 text-green-800' :
                                            attendanceRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'}
                                    >
                                        {attendanceRate}% Attendance
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Time Marked</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(attendanceData[selectedModuleId] || []).map((record, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{formatDate(record.date)}</TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusColor(record.status)}>
                                                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {record.timeMarked ? formatTime(record.timeMarked) : '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {(!attendanceData[selectedModuleId] || attendanceData[selectedModuleId].length === 0) && (
                                    <div className="text-center py-8">
                                        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                                            No Attendance Records
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            No attendance has been recorded for this module yet.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}

                {/* Empty State */}
                {modules.length === 0 && (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
                        <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                            No Modules Found
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            You are not enrolled in any modules yet.
                        </p>
                    </div>
                )}

                {showScanner && (
                    <QRScanner
                        onScanSuccess={handleQRSuccess}
                        onClose={() => setShowScanner(false)}
                    />
                )}
            </div>
        </StudentLayout>
    );
};

export default AttendanceView;