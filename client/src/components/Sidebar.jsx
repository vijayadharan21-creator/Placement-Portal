import  { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
    BarChart3, 
    Users, 
    Briefcase, 
    User, 
    FileText, 
    LogOut,
    GraduationCap,
    UserPlus
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
    const { user, logout } = useContext(AuthContext);

    if (!user) return null;

    const isPOOrAdmin = user.role === 'po' || user.role === 'admin';

    return (
        <aside className="tpo-sidebar">
            <div className="sidebar-brand">
                <GraduationCap size={32} className="brand-icon" />
                <div>
                    <h2>TPO Portal</h2>
                    <span>MIS CRM Portal</span>
                </div>
            </div>

            <div className="user-profile-badge">
                <div className="avatar">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="user-info">
                    <h4>{user.name}</h4>
                    <span className={`badge badge-${user.role === 'student' ? 'primary' : 'warning'}`}>
                        {user.role}
                    </span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {isPOOrAdmin ? (
                    <>
                        <button 
                            className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
                            onClick={() => setActiveTab('analytics')}
                        >
                            <BarChart3 size={20} />
                            <span>Analytics Dashboard</span>
                        </button>
                        <button 
                            className={`nav-item ${activeTab === 'students' ? 'active' : ''}`}
                            onClick={() => setActiveTab('students')}
                        >
                            <Users size={20} />
                            <span>Student Profiles</span>
                        </button>
                        <button 
                            className={`nav-item ${activeTab === 'drives' ? 'active' : ''}`}
                            onClick={() => setActiveTab('drives')}
                        >
                            <Briefcase size={20} />
                            <span>Recruitment Drives</span>
                        </button>
                        {user.role === 'admin' && (
                            <button 
                                className={`nav-item ${activeTab === 'manage_po' ? 'active' : ''}`}
                                onClick={() => setActiveTab('manage_po')}
                            >
                                <UserPlus size={20} />
                                <span>Manage POs</span>
                            </button>
                        )}
                    </>
                ) : (
                    <>
                        <button 
                            className={`nav-item ${activeTab === 'jobs' ? 'active' : ''}`}
                            onClick={() => setActiveTab('jobs')}
                        >
                            <Briefcase size={20} />
                            <span>Job Opportunities</span>
                        </button>
                        <button 
                            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            <User size={20} />
                            <span>My Profile</span>
                        </button>
                        <button 
                            className={`nav-item ${activeTab === 'applications' ? 'active' : ''}`}
                            onClick={() => setActiveTab('applications')}
                        >
                            <FileText size={20} />
                            <span>My Applications</span>
                        </button>
                    </>
                )}
            </nav>

            <button className="sidebar-logout-btn" onClick={logout}>
                <LogOut size={20} />
                <span>Sign Out</span>
            </button>

            <style>{`
                .tpo-sidebar {
                    position: fixed;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 280px;
                    background: var(--bg-sidebar);
                    border-right: 1px solid var(--border-glass);
                    display: flex;
                    flex-direction: column;
                    padding: 2rem 1.5rem;
                    z-index: 100;
                    backdrop-filter: blur(20px);
                    box-shadow: 10px 0 30px rgba(0, 0, 0, 0.2);
                }

                .sidebar-brand {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 2.5rem;
                }

                .brand-icon {
                    color: var(--primary);
                    filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.5));
                }

                .sidebar-brand h2 {
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: white;
                    line-height: 1.2;
                }

                .sidebar-brand span {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    font-weight: 600;
                    letter-spacing: 0.05em;
                }

                .user-profile-badge {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid var(--border-glass);
                    padding: 0.75rem;
                    border-radius: var(--radius-md);
                    margin-bottom: 2rem;
                }

                .avatar {
                    width: 42px;
                    height: 42px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 1.1rem;
                    box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
                }

                .user-info h4 {
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: white;
                    margin-bottom: 0.25rem;
                }

                .sidebar-nav {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    flex: 1;
                }

                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    background: transparent;
                    border: none;
                    color: var(--text-secondary);
                    font-size: 0.95rem;
                    font-weight: 600;
                    padding: 0.85rem 1rem;
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    text-align: left;
                    width: 100%;
                    transition: var(--transition-smooth);
                }

                .nav-item:hover {
                    color: white;
                    background: rgba(255, 255, 255, 0.04);
                }

                .nav-item.active {
                    color: white;
                    background: var(--primary-glow);
                    border: 1px solid var(--border-active);
                }

                .sidebar-logout-btn {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    background: rgba(239, 68, 68, 0.05);
                    border: 1px solid rgba(239, 68, 68, 0.1);
                    color: #fca5a5;
                    font-size: 0.95rem;
                    font-weight: 600;
                    padding: 0.85rem 1rem;
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    margin-top: auto;
                    transition: var(--transition-smooth);
                }

                .sidebar-logout-btn:hover {
                    background: var(--danger);
                    color: white;
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
                }

                @media (max-width: 1024px) {
                    .tpo-sidebar {
                        display: none;
                    }
                }
            `}</style>
        </aside>
    );
}
