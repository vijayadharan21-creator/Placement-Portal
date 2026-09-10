import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { GraduationCap, Mail, Lock, User, Shield } from 'lucide-react';

export default function LoginReg() {
    const { login, register } = useContext(AuthContext);
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Form inputs
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (isLogin) {
            const res = await login(email, password);
            if (!res.success) {
                setError(res.message);
            }
        } else {
            const res = await register(name, email, password, role);
            if (!res.success) {
                setError(res.message);
            }
        }
        setLoading(false);
    };

    return (
        <div className="login-reg-container">
            <div className="login-reg-card glass-card">
                <div className="card-brand">
                    <GraduationCap size={44} className="brand-logo-icon" />
                    <h1>TPO Portal</h1>
                    <p>Training & Placement MIS CRM</p>
                </div>

                <div className="form-toggle-bar">
                    <button 
                        type="button"
                        className={`toggle-btn ${isLogin ? 'active' : ''}`}
                        onClick={() => { setIsLogin(true); setError(''); }}
                    >
                        Login
                    </button>
                    <button 
                        type="button"
                        className={`toggle-btn ${!isLogin ? 'active' : ''}`}
                        onClick={() => { setIsLogin(false); setError(''); }}
                    >
                        Register
                    </button>
                </div>

                {error && (
                    <div className="error-alert">
                        {error}
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <div className="input-with-icon">
                                <User size={18} className="input-icon" />
                                <input 
                                    type="text" 
                                    className="input-field" 
                                    placeholder="Enter your name" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required={!isLogin}
                                />
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <div className="input-with-icon">
                            <Mail size={18} className="input-icon" />
                            <input 
                                type="email" 
                                className="input-field" 
                                placeholder="name@tpo.com" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div className="input-with-icon">
                            <Lock size={18} className="input-icon" />
                            <input 
                                type="password" 
                                className="input-field" 
                                placeholder="••••••••" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>



                    <button type="submit" className="btn btn-primary w-full submit-auth-btn" disabled={loading}>
                        {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                    </button>
                </form>
            </div>

            <style>{`
                .error-alert {
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    color: var(--danger);
                    padding: 0.75rem 1rem;
                    border-radius: var(--radius-md);
                    font-size: 0.875rem;
                    font-weight: 600;
                    margin-bottom: 1.5rem;
                    text-align: center;
                }

                .login-reg-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1.5rem;
                }

                .login-reg-card {
                    width: 100%;
                    max-width: 440px;
                    padding: 2.5rem;
                }

                .card-brand {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .brand-logo-icon {
                    color: var(--primary);
                    margin-bottom: 0.5rem;
                    filter: drop-shadow(0 0 10px rgba(37, 99, 235, 0.4));
                }

                .card-brand h1 {
                    font-size: 1.75rem;
                    font-weight: 800;
                    color: white;
                    margin-bottom: 0.25rem;
                }

                .card-brand p {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                }

                .form-toggle-bar {
                    display: flex;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid var(--border-glass);
                    border-radius: var(--radius-md);
                    padding: 0.25rem;
                    margin-bottom: 1.75rem;
                }

                .toggle-btn {
                    flex: 1;
                    padding: 0.6rem;
                    background: transparent;
                    border: none;
                    color: var(--text-secondary);
                    font-weight: 600;
                    font-size: 0.9rem;
                    border-radius: var(--radius-sm);
                    cursor: pointer;
                    transition: var(--transition-smooth);
                }

                .toggle-btn.active {
                    background: var(--primary);
                    color: white;
                    box-shadow: 0 4px 10px rgba(37, 99, 235, 0.3);
                }

                .input-with-icon {
                    position: relative;
                }

                .input-icon {
                    position: absolute;
                    left: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-muted);
                }

                .input-with-icon .input-field {
                    padding-left: 2.75rem;
                }

                .select-field {
                    appearance: none;
                    background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 1rem center;
                    background-size: 1.2em;
                }

                .w-full {
                    width: 100%;
                }

                .submit-auth-btn {
                    margin-top: 1.5rem;
                    padding: 0.85rem;
                }
            `}</style>
        </div>
    );
}
