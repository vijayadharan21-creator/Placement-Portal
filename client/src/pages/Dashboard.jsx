import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import AdminDashboard from './AdminDashboard';
import StudentDashboard from './StudentDashboard';

export default function Dashboard() {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('');

    useEffect(() => {
        if (user) {
            // Set default tabs based on role
            if (user.role === 'po' || user.role === 'admin') {
                setActiveTab('analytics');
            } else {
                setActiveTab('jobs');
            }
        }
    }, [user]);

    if (!user) return null;

    return (
        <div className="dashboard-layout">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            
            {user.role === 'student' ? (
                <StudentDashboard activeTab={activeTab} />
            ) : (
                <AdminDashboard activeTab={activeTab} />
            )}
        </div>
    );
}
