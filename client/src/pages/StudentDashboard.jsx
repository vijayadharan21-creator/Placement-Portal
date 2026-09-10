import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { 
    User, 
    Briefcase, 
    FileText, 
    Save, 
    Plus, 
    X,
    Calendar,
    Award,
    DollarSign,
    CheckCircle,
    Clock,
    AlertCircle,
    FileCheck
} from 'lucide-react';

export default function StudentDashboard({ activeTab }) {
    const { user } = useContext(AuthContext);
    
    // States
    const [profile, setProfile] = useState({
        rollNumber: '',
        department: '',
        CGPA: '',
        skills: [],
        resumeUrl: ''
    });
    const [drives, setDrives] = useState([]);
    const [applications, setApplications] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    // Skill tag input state
    const [skillInput, setSkillInput] = useState('');
    const [resumeUploadLoading, setResumeUploadLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Profile
            const profileRes = await api.get('/students/profile');
            if (profileRes.data.profile) {
                setProfile({
                    ...profileRes.data.profile,
                    CGPA: profileRes.data.profile.CGPA || ''
                });
            }

            // 2. Fetch Job Opportunities (Drives)
            const drivesRes = await api.get('/drives');
            setDrives(drivesRes.data.drives || []);

            // 3. Fetch My Applications
            const appRes = await api.get('/applications/student');
            setApplications(appRes.data.applications || []);
        } catch (err) {
            console.error('Error fetching student dashboard data:', err);
        }
        setLoading(false);
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await api.post('/students/profile', {
                rollNumber: profile.rollNumber,
                department: profile.department,
                CGPA: parseFloat(profile.CGPA),
                skills: profile.skills,
                resumeUrl: profile.resumeUrl
            });
            setProfile(res.data.profile);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to update profile.';
            setMessage({ type: 'danger', text: errorMsg });
        }
        setSubmitLoading(false);
    };

    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validation
        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword'
        ];
        if (!allowedTypes.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.docx') && !file.name.endsWith('.doc')) {
            setMessage({ type: 'danger', text: 'Please upload a PDF or Word document (.doc, .docx).' });
            return;
        }

        const formData = new FormData();
        formData.append('resume', file);

        setResumeUploadLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await api.post('/students/resume/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setProfile(prev => ({
                ...prev,
                resumeUrl: res.data.resumeUrl
            }));
            setMessage({ type: 'success', text: 'Resume uploaded to S3 successfully!' });
        } catch (err) {
            console.error('Resume upload error:', err);
            const errorMsg = err.response?.data?.message || 'Failed to upload resume to S3.';
            setMessage({ type: 'danger', text: errorMsg });
        } finally {
            setResumeUploadLoading(false);
        }
    };

    const handleApply = async (driveId) => {
        try {
            await api.post('/applications/apply', { driveId });
            setMessage({ type: 'success', text: 'Application submitted successfully!' });
            // Refresh drives & applications
            fetchData();
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Application failed.';
            setMessage({ type: 'danger', text: errorMsg });
        }
    };

    // Skills tag helpers
    const addSkill = () => {
        if (skillInput.trim() && !profile.skills.includes(skillInput.trim())) {
            setProfile({
                ...profile,
                skills: [...profile.skills, skillInput.trim()]
            });
            setSkillInput('');
        }
    };

    const removeSkill = (indexToRemove) => {
        setProfile({
            ...profile,
            skills: profile.skills.filter((_, index) => index !== indexToRemove)
        });
    };

    if (loading) {
        return (
            <div className="dashboard-content flex-center">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <main className="dashboard-content student-dashboard">
            {message.text && (
                <div className={`toast-alert toast-${message.type}`}>
                    <span>{message.text}</span>
                    <button onClick={() => setMessage({ type: '', text: '' })}>
                        <X size={16} />
                    </button>
                </div>
            )}

            {activeTab === 'profile' && (
                <section className="dashboard-section animate-fade">
                    <div className="section-header">
                        <h2 className="heading-gradient">Edit Professional Profile</h2>
                        <p>Keep your academic record and skills up-to-date to attract recruitment opportunities.</p>
                    </div>

                    <form onSubmit={handleProfileSubmit} className="profile-form-grid glass-card">
                        <div className="form-group">
                            <label className="form-label">Roll Number</label>
                            <input 
                                type="text" 
                                className="input-field" 
                                placeholder="CS2023045"
                                value={profile.rollNumber}
                                onChange={(e) => setProfile({...profile, rollNumber: e.target.value})}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Department / Branch</label>
                            <select 
                                className="input-field"
                                value={profile.department}
                                onChange={(e) => setProfile({...profile, department: e.target.value})}
                                required
                            >
                                <option value="">Select Department</option>
                                <option value="CSE">Computer Science (CSE)</option>
                                <option value="IT">Information Technology (IT)</option>
                                <option value="ECE">Electronics (ECE)</option>
                                <option value="Mechanical">Mechanical Engineering</option>
                                <option value="Civil">Civil Engineering</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Current Cumulative GPA (CGPA)</label>
                            <input 
                                type="number" 
                                step="0.01" 
                                min="0" 
                                max="10" 
                                className="input-field" 
                                placeholder="8.50"
                                value={profile.CGPA}
                                onChange={(e) => setProfile({...profile, CGPA: e.target.value})}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Upload Resume to S3 (PDF, DOCX)</label>
                            <div className="file-upload-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <input 
                                    type="file" 
                                    accept=".pdf,.doc,.docx" 
                                    className="input-field" 
                                    onChange={handleResumeUpload}
                                    disabled={resumeUploadLoading}
                                    style={{ padding: '0.5rem' }}
                                />
                                {resumeUploadLoading && <p className="text-secondary" style={{ fontSize: '0.85rem' }}>Uploading to AWS S3...</p>}
                                {profile.resumeUrl && (
                                    <div className="resume-status" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                                        <FileCheck className="text-success" size={16} />
                                        <a href={`${api.defaults.baseURL}/students/${user?._id || user?.id}/resume?token=${localStorage.getItem('token')}`} target="_blank" rel="noreferrer" className="link" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>
                                            View Uploaded Resume
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-group full-width">
                            <label className="form-label">Key Technical Skills</label>
                            <div className="skills-input-wrapper">
                                <input 
                                    type="text" 
                                    className="input-field" 
                                    placeholder="e.g. React, Python, MongoDB"
                                    value={skillInput}
                                    onChange={(e) => setSkillInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                                />
                                <button type="button" className="btn btn-secondary" onClick={addSkill}>
                                    <Plus size={18} />
                                    <span>Add</span>
                                </button>
                            </div>
                            
                            <div className="skills-tags-container">
                                {profile.skills.map((skill, index) => (
                                    <span key={index} className="skill-tag">
                                        {skill}
                                        <button type="button" onClick={() => removeSkill(index)}>
                                            <X size={12} />
                                        </button>
                                    </span>
                                ))}
                                {profile.skills.length === 0 && (
                                    <span className="no-skills-placeholder">No skills added yet. Add skills to stand out.</span>
                                )}
                            </div>
                        </div>

                        <div className="form-actions full-width">
                            <button type="submit" className="btn btn-primary" disabled={submitLoading}>
                                <Save size={18} />
                                <span>{submitLoading ? 'Saving changes...' : 'Save Profile Details'}</span>
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {activeTab === 'jobs' && (
                <section className="dashboard-section animate-fade">
                    <div className="section-header">
                        <h2 className="heading-gradient">Job Opportunities & Drives</h2>
                        <p>Explore ongoing recruitment drives and apply to companies recruiting on campus.</p>
                    </div>

                    <div className="drives-grid">
                        {drives.map((drive) => {
                            const hasApplied = applications.some(app => app.driveId?._id === drive._id);
                            const cgpaNum = parseFloat(profile.CGPA) || 0;
                            const isEligible = cgpaNum >= drive.eligibilityCriteria;
                            
                            return (
                                <div key={drive._id} className="drive-card glass-card">
                                    <div className="drive-card-header">
                                        <div>
                                            <h3>{drive.companyName}</h3>
                                            <p className="role-title">{drive.jobProfile}</p>
                                        </div>
                                        <span className={`badge badge-${
                                            drive.status === 'Ongoing' ? 'success' : 
                                            drive.status === 'Upcoming' ? 'warning' : 'danger'
                                        }`}>
                                            {drive.status}
                                        </span>
                                    </div>

                                    <div className="drive-card-body">
                                        <div className="meta-item">
                                            <DollarSign size={16} />
                                            <span>Package: <strong>{drive.packageLPA} LPA</strong></span>
                                        </div>
                                        <div className="meta-item">
                                            <Award size={16} />
                                            <span>Min. CGPA: <strong>{drive.eligibilityCriteria}</strong></span>
                                        </div>
                                        <div className="meta-item">
                                            <Calendar size={16} />
                                            <span>Drive Date: {new Date(drive.driveDate).toLocaleDateString()}</span>
                                        </div>
                                        
                                        <div className="skills-req">
                                            <span>Skills Required:</span>
                                            <div className="skills-list">
                                                {drive.skillsRequired.map((skill, sIdx) => (
                                                    <span key={sIdx} className="mini-tag">{skill}</span>
                                                ))}
                                            </div>
                                        </div>

                                        <p className="drive-desc">{drive.description}</p>
                                    </div>

                                    <div className="drive-card-footer">
                                        {hasApplied ? (
                                            <button className="btn btn-glass w-full" disabled>
                                                <CheckCircle size={18} className="text-success" />
                                                <span>Applied</span>
                                            </button>
                                        ) : drive.status === 'Completed' ? (
                                            <button className="btn btn-glass w-full" disabled>
                                                <span>Drive Closed</span>
                                            </button>
                                        ) : !isEligible ? (
                                            <div className="eligibility-notice danger">
                                                <AlertCircle size={14} />
                                                <span>Not Eligible (Min CGPA: {drive.eligibilityCriteria})</span>
                                            </div>
                                        ) : (
                                            <button 
                                                className="btn btn-primary w-full"
                                                onClick={() => handleApply(drive._id)}
                                            >
                                                <FileCheck size={18} />
                                                <span>Apply Now</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {drives.length === 0 && (
                            <div className="empty-state glass-card full-width">
                                <Briefcase size={48} className="empty-icon" />
                                <h3>No Recruitment Drives Posted</h3>
                                <p>There are no job opportunities currently listed. Check back later.</p>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {activeTab === 'applications' && (
                <section className="dashboard-section animate-fade">
                    <div className="section-header">
                        <h2 className="heading-gradient">Application Tracker</h2>
                        <p>Track the progress of your student recruitment applications in real-time.</p>
                    </div>

                    <div className="applications-list">
                        {applications.map((app) => (
                            <div key={app._id} className="app-tracker-card glass-card">
                                <div className="app-info-block">
                                    <h3>{app.driveId?.companyName || 'Unknown Company'}</h3>
                                    <p>{app.driveId?.jobProfile || 'Unknown Role'}</p>
                                    <span className="app-date">
                                        Applied on: {new Date(app.appliedAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <div className="status-progress-block">
                                    <div className="status-timeline">
                                        <div className={`timeline-node completed`}>
                                            <span className="node-dot"></span>
                                            <span className="node-label">Applied</span>
                                        </div>
                                        
                                        <div className={`timeline-node ${
                                            ['Shortlisted', 'Selected', 'Rejected'].includes(app.status) ? 'completed' : ''
                                        }`}>
                                            <span className="node-dot"></span>
                                            <span className="node-label">Shortlisted</span>
                                        </div>

                                        <div className={`timeline-node final ${
                                            app.status === 'Selected' ? 'selected' : 
                                            app.status === 'Rejected' ? 'rejected' : ''
                                        }`}>
                                            <span className="node-dot"></span>
                                            <span className="node-label">
                                                {app.status === 'Rejected' ? 'Rejected' : 'Selected'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="action-status-block">
                                    <span className={`badge badge-${
                                        app.status === 'Selected' ? 'success' :
                                        app.status === 'Rejected' ? 'danger' :
                                        app.status === 'Shortlisted' ? 'primary' : 'warning'
                                    }`}>
                                        {app.status}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {applications.length === 0 && (
                            <div className="empty-state glass-card">
                                <FileText size={48} className="empty-icon" />
                                <h3>No Applications Submitted</h3>
                                <p>You haven't applied to any companies yet. Go to Job Opportunities to start applying.</p>
                            </div>
                        )}
                    </div>
                </section>
            )}

            <style>{`
                .student-dashboard {
                    padding: 2.5rem;
                }

                .section-header {
                    margin-bottom: 2rem;
                }

                .section-header h2 {
                    font-size: 1.75rem;
                    margin-bottom: 0.5rem;
                }

                .section-header p {
                    color: var(--text-secondary);
                }

                /* Form Layout */
                .profile-form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                }

                .full-width {
                    grid-column: 1 / -1;
                }

                .skills-input-wrapper {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 1rem;
                }

                .skills-tags-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    padding: 0.75rem;
                    border: 1px dashed var(--border-glass);
                    border-radius: var(--radius-md);
                    min-height: 50px;
                    align-items: center;
                }

                .skill-tag {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid var(--border-glass);
                    color: var(--text-primary);
                    padding: 0.35rem 0.75rem;
                    border-radius: 99px;
                    font-size: 0.85rem;
                    font-weight: 500;
                }

                .skill-tag button {
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                }

                .skill-tag button:hover {
                    color: var(--danger);
                }

                .no-skills-placeholder {
                    color: var(--text-muted);
                    font-size: 0.875rem;
                }

                /* Toast Alerts */
                .toast-alert {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1rem 1.5rem;
                    border-radius: var(--radius-md);
                    margin-bottom: 1.5rem;
                    animation: fadeIn 0.3s ease;
                }

                .toast-success {
                    background: rgba(16, 185, 129, 0.15);
                    border: 1px solid rgba(16, 185, 129, 0.3);
                    color: var(--success);
                }

                .toast-danger {
                    background: rgba(239, 68, 68, 0.15);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    color: var(--danger);
                }

                .toast-alert button {
                    background: transparent;
                    border: none;
                    color: currentColor;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                }

                /* Job Opportunities Drives Cards */
                .drives-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                    gap: 1.5rem;
                }

                .drive-card {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }

                .drive-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1.25rem;
                }

                .drive-card-header h3 {
                    color: white;
                    font-size: 1.15rem;
                    font-weight: 700;
                }

                .role-title {
                    color: var(--primary);
                    font-size: 0.9rem;
                    font-weight: 600;
                }

                .drive-card-body {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                }

                .meta-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                }

                .meta-item strong {
                    color: white;
                }

                .skills-req {
                    margin-top: 0.5rem;
                }

                .skills-req span {
                    display: block;
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    font-weight: 600;
                    margin-bottom: 0.35rem;
                }

                .skills-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.35rem;
                }

                .mini-tag {
                    font-size: 0.75rem;
                    background: rgba(99, 102, 241, 0.08);
                    border: 1px solid rgba(99, 102, 241, 0.15);
                    color: #a5b4fc;
                    padding: 0.15rem 0.5rem;
                    border-radius: 4px;
                    font-weight: 600;
                }

                .drive-desc {
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    line-height: 1.5;
                    margin-top: 0.5rem;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .eligibility-notice {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    padding: 0.6rem;
                    border-radius: var(--radius-md);
                    font-size: 0.8rem;
                    font-weight: 600;
                    width: 100%;
                }

                .eligibility-notice.danger {
                    background: rgba(239, 68, 68, 0.08);
                    border: 1px solid rgba(239, 68, 68, 0.15);
                    color: var(--danger);
                }

                /* App Tracker Cards */
                .applications-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .app-tracker-card {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 2rem;
                }

                .app-info-block h3 {
                    font-size: 1.1rem;
                    color: white;
                    margin-bottom: 0.25rem;
                }

                .app-info-block p {
                    color: var(--primary);
                    font-size: 0.9rem;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                }

                .app-date {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    display: block;
                }

                /* Timeline styling */
                .status-progress-block {
                    flex: 1;
                    max-width: 450px;
                }

                .status-timeline {
                    display: flex;
                    justify-content: space-between;
                    position: relative;
                }

                .status-timeline::before {
                    content: '';
                    position: absolute;
                    top: 8px;
                    left: 20px;
                    right: 20px;
                    height: 2px;
                    background: rgba(255, 255, 255, 0.05);
                    z-index: 1;
                }

                .timeline-node {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    position: relative;
                    z-index: 2;
                    gap: 0.5rem;
                }

                .node-dot {
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: #1e293b;
                    border: 3px solid rgba(255, 255, 255, 0.05);
                    transition: var(--transition-smooth);
                }

                .node-label {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    font-weight: 600;
                }

                .timeline-node.completed .node-dot {
                    background: var(--primary);
                    border-color: var(--primary-glow);
                    box-shadow: 0 0 10px var(--primary);
                }

                .timeline-node.completed .node-label {
                    color: var(--text-primary);
                }

                .timeline-node.final.selected .node-dot {
                    background: var(--success);
                    border-color: var(--success-glow);
                    box-shadow: 0 0 10px var(--success);
                }

                .timeline-node.final.selected .node-label {
                    color: var(--success);
                }

                .timeline-node.final.rejected .node-dot {
                    background: var(--danger);
                    border-color: rgba(239, 68, 68, 0.2);
                    box-shadow: 0 0 10px var(--danger);
                }

                .timeline-node.final.rejected .node-label {
                    color: var(--danger);
                }

                /* Empty States */
                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 3.5rem;
                    text-align: center;
                    gap: 0.75rem;
                }

                .empty-icon {
                    color: var(--text-muted);
                    margin-bottom: 0.5rem;
                }

                .empty-state h3 {
                    font-size: 1.15rem;
                    color: white;
                }

                .empty-state p {
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                    max-width: 320px;
                }

                .flex-center {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 400px;
                }

                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid rgba(255, 255, 255, 0.05);
                    border-left-color: var(--primary);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                @media (max-width: 768px) {
                    .profile-form-grid {
                        grid-template-columns: 1fr;
                    }
                    .app-tracker-card {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1.25rem;
                    }
                    .status-progress-block {
                        width: 100%;
                    }
                }
            `}</style>
        </main>
    );
}
