import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import LoginReg from './pages/LoginReg';
import Dashboard from './pages/Dashboard';

function AppContent() {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-dark)' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route 
                    path="/login" 
                    element={user ? <Navigate to="/dashboard" replace /> : <LoginReg />} 
                />
                <Route 
                    path="/dashboard" 
                    element={user ? <Dashboard /> : <Navigate to="/login" replace />} 
                />
                {/* Fallbacks */}
                <Route 
                    path="*" 
                    element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
                />
            </Routes>
        </BrowserRouter>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}
