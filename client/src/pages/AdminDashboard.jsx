import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
    ResponsiveContainer, 
    PieChart, 
    Pie, 
    Cell, 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    Tooltip, 
    Legend 
} from 'recharts';
import { 
    Users, 
    Briefcase, 
    TrendingUp, 
    DollarSign, 
    Award,
    Search,
    Filter,
    Plus,
    Edit,
    Trash2,
    CheckCircle,
    UserCheck,
    Eye,
    X,
    Calendar,
    ChevronRight,
    MapPin,
    AlertCircle
} from 'lucide-react';

export default function AdminDashboard({ activeTab }) {
    // ----------------------------------------------------
    // Shared & Global States
    // ----------------------------------------------------
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Analytics States
    const [stats, setStats] = useState({
        counts: { totalStudents: 0, totalDrives: 0, totalPOs: 0 },
        placementRatio: { Placed: 0, Unplaced: 0, Total: 0 },
        departmentStats: [],
        salaryStats: { averagePackage: 0, highestPackage: 0, lowestPackage: 0 },
        drivesStats: { Upcoming: 0, Ongoing: 0, Completed: 0, Total: 0 },
        topCompanies: []
    });

    // PO Management States
    const [pos, setPOs] = useState([]);
    const [poName, setPoName] = useState('');
    const [poEmail, setPoEmail] = useState('');
    const [poPassword, setPoPassword] = useState('');
    const [poMessage, setPoMessage] = useState({ type: '', text: '' });
    const [poSubmitLoading, setPoSubmitLoading] = useState(false);

    // Student Database States
    const [students, setStudents] = useState([]);
    const [studentSearch, setStudentSearch] = useState('');
    const [filterDept, setFilterDept] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterCgpa, setFilterCgpa] = useState('');

    // Drives States
    const [drives, setDrives] = useState([]);
    
    // ----------------------------------------------------
    // Modals & Action States
    // ----------------------------------------------------
    // Student Placement Modal
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [placeStatus, setPlaceStatus] = useState('Unplaced');
    const [placeCompany, setPlaceCompany] = useState('');
    const [placePackage, setPlacePackage] = useState('');

    // Drive Create/Edit Modal
    const [showDriveModal, setShowDriveModal] = useState(false);
    const [driveFormMode, setDriveFormMode] = useState('create'); // 'create' or 'edit'
    const [selectedDriveId, setSelectedDriveId] = useState(null);
    const [driveForm, setDriveForm] = useState({
        companyName: '',
        jobProfile: '',
        eligibilityCriteria: '',
        packageLPA: '',
        driveDate: '',
        skillsRequired: '',
        description: '',
        status: 'Upcoming'
    });

    // Drive Applicants Drawer
    const [showApplicantsDrawer, setShowApplicantsDrawer] = useState(false);
    const [activeDriveDetails, setActiveDriveDetails] = useState(null);
    const [driveApplicants, setDriveApplicants] = useState([]);
    const [drawerLoading, setDrawerLoading] = useState(false);

    // Recharts colors
    const COLORS = ['#2563eb', '#60a5fa', '#3b82f6', '#1d4ed8', '#10b981'];

    // ----------------------------------------------------
    // Data Fetching Hook
    // ----------------------------------------------------
    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'analytics') {
                const res = await api.get('/analytics/stats');
                setStats(res.data);
            }
            if (activeTab === 'students') {
                await fetchStudents();
            }
            if (activeTab === 'drives') {
                const res = await api.get('/drives');
                setDrives(res.data.drives || []);
            }
            if (activeTab === 'manage_po') {
                const res = await api.get('/auth/pos');
                setPOs(res.data.pos || []);
            }
        } catch (err) {
            console.error('Error loading admin data:', err);
            showToast('danger', 'Failed to retrieve data.');
        }
        setLoading(false);
    };

    const showToast = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    };

    // ----------------------------------------------------
    // PO Actions
    // ----------------------------------------------------
    const handleCreatePO = async (e) => {
        e.preventDefault();
        setPoSubmitLoading(true);
        setPoMessage({ type: '', text: '' });
        try {
            await api.post('/auth/create-po', {
                name: poName,
                email: poEmail,
                password: poPassword
            });
            setPoMessage({ type: 'success', text: 'Placement Officer account created successfully!' });
            setPoName('');
            setPoEmail('');
            setPoPassword('');
            // Reload list
            const res = await api.get('/auth/pos');
            setPOs(res.data.pos || []);
        } catch (err) {
            console.error('Error creating PO:', err);
            const errorMsg = err.response?.data?.message || 'Failed to create Placement Officer.';
            setPoMessage({ type: 'danger', text: errorMsg });
        } finally {
            setPoSubmitLoading(false);
        }
    };

    const handleDeletePO = async (poId) => {
        if (!poId) return;
        if (!window.confirm('Are you sure you want to delete this Placement Officer?')) {
            return;
        }
        setPoMessage({ type: '', text: '' });
        try {
            await api.delete(`/auth/pos/${poId}`);
            setPoMessage({ type: 'success', text: 'Placement Officer account deleted successfully!' });
            // Reload list
            const res = await api.get('/auth/pos');
            setPOs(res.data.pos || []);
        } catch (err) {
            console.error('Error deleting PO:', err);
            const errorMsg = err.response?.data?.message || 'Failed to delete Placement Officer.';
            setPoMessage({ type: 'danger', text: errorMsg });
        }
    };

    // ----------------------------------------------------
    // Student Actions
    // ----------------------------------------------------
    const fetchStudents = async () => {
        try {
            const queryParams = new URLSearchParams();
            if (studentSearch) queryParams.append('search', studentSearch);
            if (filterDept) queryParams.append('department', filterDept);
            if (filterStatus) queryParams.append('placedStatus', filterStatus);
            if (filterCgpa) queryParams.append('cgpa', filterCgpa);

            const res = await api.get(`/students?${queryParams.toString()}`);
            setStudents(res.data.students || []);
        } catch (err) {
            console.error('Error fetching students list:', err);
        }
    };

    const handleSearchChange = (e) => {
        setStudentSearch(e.target.value);
    };

    useEffect(() => {
        if (activeTab === 'students') {
            const delayDebounceFn = setTimeout(() => {
                fetchStudents();
            }, 400);
            return () => clearTimeout(delayDebounceFn);
        }
    }, [studentSearch, filterDept, filterStatus, filterCgpa]);

    const openStatusModal = (student) => {
        setSelectedStudent(student);
        setPlaceStatus(student.placedStatus);
        setPlaceCompany(student.placedCompany || '');
        setPlacePackage(student.packageLPA || '');
        setShowStatusModal(true);
    };

    const submitPlacementStatus = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/students/${selectedStudent.userId}/status`, {
                placedStatus: placeStatus,
                placedCompany: placeStatus === 'Placed' ? placeCompany : '',
                packageLPA: placeStatus === 'Placed' ? parseFloat(placePackage) : null
            });
            showToast('success', 'Student placement status updated!');
            setShowStatusModal(false);
            fetchStudents();
        } catch (err) {
            showToast('danger', err.response?.data?.message || 'Update failed.');
        }
    };

    // ----------------------------------------------------
    // Recruitment Drive Actions
    // ----------------------------------------------------
    const openCreateDriveModal = () => {
        setDriveFormMode('create');
        setDriveForm({
            companyName: '',
            jobProfile: '',
            eligibilityCriteria: '',
            packageLPA: '',
            driveDate: '',
            skillsRequired: '',
            description: '',
            status: 'Upcoming'
        });
        setShowDriveModal(true);
    };

    const openEditDriveModal = (drive) => {
        setDriveFormMode('edit');
        setSelectedDriveId(drive._id);
        
        // Format Date to YYYY-MM-DD
        const formattedDate = drive.driveDate ? drive.driveDate.split('T')[0] : '';

        setDriveForm({
            companyName: drive.companyName,
            jobProfile: drive.jobProfile,
            eligibilityCriteria: drive.eligibilityCriteria,
            packageLPA: drive.packageLPA,
            driveDate: formattedDate,
            skillsRequired: drive.skillsRequired.join(', '),
            description: drive.description,
            status: drive.status
        });
        setShowDriveModal(true);
    };

    const submitDrive = async (e) => {
        e.preventDefault();
        try {
            const driveData = {
                ...driveForm,
                eligibilityCriteria: parseFloat(driveForm.eligibilityCriteria),
                packageLPA: parseFloat(driveForm.packageLPA),
                skillsRequired: driveForm.skillsRequired.split(',').map(s => s.trim()).filter(Boolean)
            };

            if (driveFormMode === 'create') {
                await api.post('/drives', driveData);
                showToast('success', 'New drive created successfully!');
            } else {
                await api.put(`/drives/${selectedDriveId}`, driveData);
                showToast('success', 'Recruitment drive updated successfully!');
            }
            setShowDriveModal(false);
            // Refresh
            const res = await api.get('/drives');
            setDrives(res.data.drives || []);
        } catch (err) {
            showToast('danger', err.response?.data?.message || 'Operation failed.');
        }
    };

    const handleDeleteDrive = async (id) => {
        if (!window.confirm('Are you sure you want to delete this drive?')) return;
        try {
            await api.delete(`/drives/${id}`);
            showToast('success', 'Recruitment drive deleted.');
            setDrives(drives.filter(d => d._id !== id));
        } catch (err) {
            showToast('danger', 'Failed to delete drive.');
        }
    };

    // ----------------------------------------------------
    // Drive Applicants Drawer Actions
    // ----------------------------------------------------
    const openApplicantsDrawer = async (drive) => {
        setActiveDriveDetails(drive);
        setDriveApplicants([]);
        setShowApplicantsDrawer(true);
        setDrawerLoading(true);

        try {
            const res = await api.get(`/applications/drive/${drive._id}`);
            setDriveApplicants(res.data.applications || []);
        } catch (err) {
            console.error('Error fetching drive applications:', err);
            showToast('danger', 'Could not fetch applicants.');
        }
        setDrawerLoading(false);
    };

    const updateCandidateStatus = async (appId, newStatus) => {
        try {
            await api.put(`/applications/${appId}/status`, { status: newStatus });
            showToast('success', `Candidate marked as ${newStatus}!`);
            
            // Refresh applicant list inside drawer
            const res = await api.get(`/applications/drive/${activeDriveDetails._id}`);
            setDriveApplicants(res.data.applications || []);
        } catch (err) {
            showToast('danger', 'Failed to update candidate status.');
        }
    };

    // Helper: Pie Chart Data Formatter
    const getPieData = () => {
        return [
            { name: 'Placed', value: stats.placementRatio.Placed },
            { name: 'Unplaced', value: stats.placementRatio.Unplaced }
        ].filter(item => item.value > 0);
    };

    if (loading) {
        return (
            <div className="dashboard-content flex-center">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <main className="dashboard-content admin-dashboard">
            {message.text && (
                <div className={`toast-alert toast-${message.type}`}>
                    <span>{message.text}</span>
                    <button onClick={() => setMessage({ type: '', text: '' })}>
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* ANALYTICS SECTION */}
            {activeTab === 'analytics' && (
                <section className="dashboard-section animate-fade">
                    <div className="section-header">
                        <h2 className="heading-gradient">Placement Analytics Overview</h2>
                        <p>Real-time analytics, hiring ratios, packages, and departmental statistics.</p>
                    </div>

                    <div className="stat-grid">
                        <div className="glass-card stat-card">
                            <div className="stat-icon"><Users size={24} /></div>
                            <div className="stat-info">
                                <span className="stat-label">Total Students</span>
                                <div className="stat-value">{stats.counts.totalStudents}</div>
                            </div>
                        </div>

                        <div className="glass-card stat-card">
                            <div className="stat-icon"><Briefcase size={24} /></div>
                            <div className="stat-info">
                                <span className="stat-label">Recruitment Drives</span>
                                <div className="stat-value">{stats.counts.totalDrives}</div>
                            </div>
                        </div>

                        <div className="glass-card stat-card">
                            <div className="stat-icon"><TrendingUp size={24} /></div>
                            <div className="stat-info">
                                <span className="stat-label">Avg Package</span>
                                <div className="stat-value">{stats.salaryStats.averagePackage} <span className="lpa-text">LPA</span></div>
                            </div>
                        </div>

                        <div className="glass-card stat-card">
                            <div className="stat-icon text-success"><UserCheck size={24} /></div>
                            <div className="stat-info">
                                <span className="stat-label">Placed Students</span>
                                <div className="stat-value text-success">{stats.placementRatio.Placed}</div>
                            </div>
                        </div>
                    </div>

                    <div className="charts-grid">
                        {/* Placement Ratio Pie Chart */}
                        <div className="glass-card chart-container-card">
                            <h3>Placed vs Unplaced Ratio</h3>
                            <div className="chart-wrapper">
                                {getPieData().length > 0 ? (
                                    <ResponsiveContainer width="100%" height={260}>
                                        <PieChart>
                                            <Pie
                                                data={getPieData()}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {getPieData().map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ background: '#0a0a0a', borderColor: '#222222' }} />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className="no-data">No student statistics to visualize.</p>
                                )}
                            </div>
                        </div>

                        {/* Department Placements Bar Chart */}
                        <div className="glass-card chart-container-card">
                            <h3>Placements by Department</h3>
                            <div className="chart-wrapper">
                                {stats.departmentStats.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={260}>
                                        <BarChart data={stats.departmentStats}>
                                            <XAxis dataKey="department" stroke="#94a3b8" fontSize={11} />
                                            <YAxis stroke="#94a3b8" fontSize={11} />
                                            <Tooltip contentStyle={{ background: '#0a0a0a', borderColor: '#222222' }} />
                                            <Legend />
                                            <Bar dataKey="Placed" fill="#10b981" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="Unplaced" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className="no-data">No department statistics to visualize.</p>
                                )}
                            </div>
                        </div>

                        {/* Top Recruiter Statistics */}
                        <div className="glass-card recruiter-list-card full-width">
                            <h3>Top Recruitment Partners</h3>
                            <div className="recruiters-table">
                                <div className="recruiter-table-header">
                                    <span>Company Name</span>
                                    <span>Offers Extended</span>
                                </div>
                                {stats.topCompanies.map((comp, idx) => (
                                    <div key={idx} className="recruiter-row">
                                        <div className="recruiter-company">
                                            <span className="recruiter-badge">{idx + 1}</span>
                                            <strong>{comp.companyName}</strong>
                                        </div>
                                        <span className="offers-badge">{comp.placedCount} Hired</span>
                                    </div>
                                ))}
                                {stats.topCompanies.length === 0 && (
                                    <p className="no-data">No companies have placed students yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* STUDENT DATABASE SECTION */}
            {activeTab === 'students' && (
                <section className="dashboard-section animate-fade">
                    <div className="section-header">
                        <h2 className="heading-gradient">Student Placement Database</h2>
                        <p>Search, filter, review resumes, and manage individual student placement statuses.</p>
                    </div>

                    <div className="filters-bar glass-card">
                        <div className="search-box">
                            <Search size={18} className="search-icon" />
                            <input 
                                type="text" 
                                placeholder="Search by name, roll, or email..." 
                                className="input-field"
                                value={studentSearch}
                                onChange={handleSearchChange}
                            />
                        </div>

                        <div className="filter-group">
                            <Filter size={16} className="filter-icon" />
                            
                            <select className="input-field select-box" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
                                <option value="">All Branches</option>
                                <option value="CSE">CSE</option>
                                <option value="IT">IT</option>
                                <option value="ECE">ECE</option>
                                <option value="Mechanical">Mechanical</option>
                                <option value="Civil">Civil</option>
                            </select>

                            <select className="input-field select-box" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                                <option value="">All Statuses</option>
                                <option value="Placed">Placed</option>
                                <option value="Unplaced">Unplaced</option>
                            </select>

                            <input 
                                type="number" 
                                step="0.1" 
                                placeholder="Min CGPA" 
                                className="input-field cgpa-filter"
                                value={filterCgpa}
                                onChange={e => setFilterCgpa(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="table-container glass-card">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Roll Number</th>
                                    <th>Name</th>
                                    <th>Branch</th>
                                    <th>CGPA</th>
                                    <th>Skills</th>
                                    <th>Resume</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student) => (
                                    <tr key={student._id}>
                                        <td><strong>{student.rollNumber}</strong></td>
                                        <td>
                                            <div className="student-name-block">
                                                <span>{student.name}</span>
                                                <span className="student-email">{student.email}</span>
                                            </div>
                                        </td>
                                        <td>{student.department}</td>
                                        <td><span className="cgpa-badge">{student.CGPA}</span></td>
                                        <td>
                                            <div className="skills-cell-tags">
                                                {student.skills.slice(0, 3).map((sk, idx) => (
                                                    <span key={idx} className="mini-tag">{sk}</span>
                                                ))}
                                                {student.skills.length > 3 && (
                                                    <span className="skills-more">+{student.skills.length - 3}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            {student.resumeUrl ? (
                                                <a href={`${api.defaults.baseURL}/students/${student.userId}/resume?token=${localStorage.getItem('token')}`} target="_blank" rel="noreferrer" className="resume-view-btn">
                                                    View
                                                </a>
                                            ) : (
                                                <span className="text-muted text-xs">No Upload</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`badge badge-${student.placedStatus === 'Placed' ? 'success' : 'danger'}`}>
                                                {student.placedStatus}
                                            </span>
                                            {student.placedStatus === 'Placed' && (
                                                <span className="placed-company-label">
                                                    at {student.placedCompany} ({student.packageLPA} LPA)
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <button 
                                                className="btn btn-secondary btn-sm-action"
                                                onClick={() => openStatusModal(student)}
                                            >
                                                <UserCheck size={14} />
                                                <span>Status</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {students.length === 0 && (
                                    <tr>
                                        <td colSpan="8" className="empty-table-row">No students matched search criteria.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {/* COMPANY DRIVES SECTION */}
            {activeTab === 'drives' && (
                <section className="dashboard-section animate-fade">
                    <div className="section-header space-between">
                        <div>
                            <h2 className="heading-gradient">Company Recruitment Drives</h2>
                            <p>Schedule campus interviews, configure eligibility criteria, and manage applicants.</p>
                        </div>
                        <button className="btn btn-primary" onClick={openCreateDriveModal}>
                            <Plus size={18} />
                            <span>Post New Drive</span>
                        </button>
                    </div>

                    <div className="admin-drives-list">
                        {drives.map((drive) => (
                            <div key={drive._id} className="admin-drive-row glass-card">
                                <div className="drive-main-info">
                                    <div className="header-bar">
                                        <h3>{drive.companyName}</h3>
                                        <span className="role">{drive.jobProfile}</span>
                                    </div>
                                    <div className="meta-info-bar">
                                        <span>Salary: <strong>{drive.packageLPA} LPA</strong></span>
                                        <span>Min CGPA: <strong>{drive.eligibilityCriteria}</strong></span>
                                        <span>Date: {new Date(drive.driveDate).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="drive-stats-info">
                                    <span className="status-label badge badge-primary">{drive.status}</span>
                                    <span className="applicants-counter">
                                        Applicants: <strong>{drive.applicantsCount || 0}</strong>
                                    </span>
                                </div>

                                <div className="drive-actions">
                                    <button className="btn btn-glass btn-icon-only" title="View Candidates" onClick={() => openApplicantsDrawer(drive)}>
                                        <Eye size={16} />
                                    </button>
                                    <button className="btn btn-glass btn-icon-only" title="Edit Drive" onClick={() => openEditDriveModal(drive)}>
                                        <Edit size={16} />
                                    </button>
                                    <button className="btn btn-glass btn-icon-only text-danger" title="Delete Drive" onClick={() => handleDeleteDrive(drive._id)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {drives.length === 0 && (
                            <div className="empty-state glass-card">
                                <Briefcase size={48} className="empty-icon" />
                                <h3>No recruitment drives found</h3>
                                <p>Click "Post New Drive" above to create one.</p>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* ----------------------------------------------------
                MODAL: Update Student Placement Status
               ---------------------------------------------------- */}
            {showStatusModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass-card animate-scale">
                        <div className="modal-header">
                            <h3>Update Placement Status</h3>
                            <button className="close-modal-btn" onClick={() => setShowStatusModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={submitPlacementStatus} className="modal-form">
                            <p className="subtext">
                                Editing details for: <strong>{selectedStudent?.name}</strong> ({selectedStudent?.rollNumber})
                            </p>

                            <div className="form-group">
                                <label className="form-label">Placement Status</label>
                                <select 
                                    className="input-field"
                                    value={placeStatus}
                                    onChange={e => setPlaceStatus(e.target.value)}
                                >
                                    <option value="Unplaced">Unplaced</option>
                                    <option value="Placed">Placed</option>
                                </select>
                            </div>

                            {placeStatus === 'Placed' && (
                                <>
                                    <div className="form-group">
                                        <label className="form-label">Recruiting Company</label>
                                        <input 
                                            type="text" 
                                            className="input-field" 
                                            placeholder="Google, Microsoft, etc."
                                            value={placeCompany}
                                            onChange={e => setPlaceCompany(e.target.value)}
                                            required={placeStatus === 'Placed'}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Offered CTC (LPA)</label>
                                        <input 
                                            type="number" 
                                            step="0.1"
                                            className="input-field" 
                                            placeholder="12.5"
                                            value={placePackage}
                                            onChange={e => setPlacePackage(e.target.value)}
                                            required={placeStatus === 'Placed'}
                                        />
                                    </div>
                                </>
                            )}

                            <div className="form-actions">
                                <button type="button" className="btn btn-glass" onClick={() => setShowStatusModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Save Status
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ----------------------------------------------------
                MODAL: Create / Edit Recruitment Drive
               ---------------------------------------------------- */}
            {showDriveModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass-card animate-scale">
                        <div className="modal-header">
                            <h3>{driveFormMode === 'create' ? 'Post Recruitment Drive' : 'Modify Recruitment Drive'}</h3>
                            <button className="close-modal-btn" onClick={() => setShowDriveModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={submitDrive} className="modal-form">
                            <div className="form-group">
                                <label className="form-label">Company Name</label>
                                <input 
                                    type="text" 
                                    className="input-field" 
                                    placeholder="e.g. Amazon"
                                    value={driveForm.companyName}
                                    onChange={e => setDriveForm({...driveForm, companyName: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Job Profile / Designation</label>
                                <input 
                                    type="text" 
                                    className="input-field" 
                                    placeholder="e.g. Systems Development Engineer"
                                    value={driveForm.jobProfile}
                                    onChange={e => setDriveForm({...driveForm, jobProfile: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label className="form-label">Package (LPA)</label>
                                    <input 
                                        type="number" 
                                        step="0.1"
                                        className="input-field" 
                                        placeholder="e.g. 18.5"
                                        value={driveForm.packageLPA}
                                        onChange={e => setDriveForm({...driveForm, packageLPA: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Minimum CGPA</label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        className="input-field" 
                                        placeholder="e.g. 8.0"
                                        value={driveForm.eligibilityCriteria}
                                        onChange={e => setDriveForm({...driveForm, eligibilityCriteria: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label className="form-label">Drive Date</label>
                                    <input 
                                        type="date" 
                                        className="input-field" 
                                        value={driveForm.driveDate}
                                        onChange={e => setDriveForm({...driveForm, driveDate: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Drive Status</label>
                                    <select 
                                        className="input-field"
                                        value={driveForm.status}
                                        onChange={e => setDriveForm({...driveForm, status: e.target.value})}
                                    >
                                        <option value="Upcoming">Upcoming</option>
                                        <option value="Ongoing">Ongoing</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Skills Required (Comma separated)</label>
                                <input 
                                    type="text" 
                                    className="input-field" 
                                    placeholder="React, C++, Python"
                                    value={driveForm.skillsRequired}
                                    onChange={e => setDriveForm({...driveForm, skillsRequired: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Job Description</label>
                                <textarea 
                                    className="input-field textarea-field" 
                                    rows="4"
                                    placeholder="Provide detailed description of roles, responsibilities, interview stages..."
                                    value={driveForm.description}
                                    onChange={e => setDriveForm({...driveForm, description: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="form-actions">
                                <button type="button" className="btn btn-glass" onClick={() => setShowDriveModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {driveFormMode === 'create' ? 'Post Drive' : 'Save Modifications'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ----------------------------------------------------
                DRAWER / SLIDE-OUT PANEL: Drive Applicants
               ---------------------------------------------------- */}
            {showApplicantsDrawer && (
                <div className="drawer-overlay">
                    <div className="drawer-panel glass-card">
                        <div className="drawer-header">
                            <div>
                                <h3>Applicants Database</h3>
                                <p className="subtext">{activeDriveDetails?.companyName} - {activeDriveDetails?.jobProfile}</p>
                            </div>
                            <button className="close-modal-btn" onClick={() => setShowApplicantsDrawer(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="drawer-body">
                            {drawerLoading ? (
                                <div className="drawer-spinner-container">
                                    <div className="spinner"></div>
                                </div>
                            ) : driveApplicants.length > 0 ? (
                                <div className="drawer-applicants-list">
                                    {driveApplicants.map((app) => (
                                        <div key={app._id} className="applicant-item-card">
                                            <div className="applicant-info">
                                                <h4>{app.studentId?.userId?.name || 'Unknown'}</h4>
                                                <span className="email">{app.studentId?.userId?.email}</span>
                                                
                                                <div className="applicant-academic">
                                                    <span>Roll: <strong>{app.studentId?.rollNumber}</strong></span>
                                                    <span>CGPA: <strong>{app.studentId?.CGPA}</strong></span>
                                                </div>

                                                {app.studentId?.resumeUrl && (
                                                    <a href={`${api.defaults.baseURL}/students/${app.studentId.userId?._id || app.studentId.userId}/resume?token=${localStorage.getItem('token')}`} target="_blank" rel="noreferrer" className="resume-pill">
                                                        Resume View
                                                    </a>
                                                )}
                                            </div>

                                            <div className="applicant-status-controls">
                                                <div className="applicant-status-row">
                                                    <span className={`badge badge-${
                                                        app.status === 'Selected' ? 'success' :
                                                        app.status === 'Rejected' ? 'danger' :
                                                        app.status === 'Shortlisted' ? 'primary' : 'warning'
                                                    }`}>
                                                        {app.status}
                                                    </span>
                                                </div>

                                                <div className="applicant-action-buttons">
                                                    <button 
                                                        className="btn btn-glass btn-xs text-success"
                                                        onClick={() => updateCandidateStatus(app._id, 'Selected')}
                                                    >
                                                        Select
                                                    </button>
                                                    <button 
                                                        className="btn btn-glass btn-xs text-primary"
                                                        onClick={() => updateCandidateStatus(app._id, 'Shortlisted')}
                                                    >
                                                        Shortlist
                                                    </button>
                                                    <button 
                                                        className="btn btn-glass btn-xs text-danger"
                                                        onClick={() => updateCandidateStatus(app._id, 'Rejected')}
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="drawer-empty-state">
                                    <Users size={36} className="text-muted" />
                                    <p>No students have applied to this drive yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* MANAGE POS SECTION */}
            {activeTab === 'manage_po' && (
                <section className="dashboard-section animate-fade">
                    <div className="section-header">
                        <h2 className="heading-gradient">Manage Placement Officers</h2>
                        <p>Create and monitor accounts for Placement Officers (POs) in the system.</p>
                    </div>

                    <div className="manage-pos-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '2rem', alignItems: 'start' }}>
                        {/* Create PO Form Card */}
                        <div className="glass-card">
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', color: 'white', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
                                Create PO Account
                            </h3>
                            {poMessage.text && (
                                <div className={`error-alert`} style={{ 
                                    background: poMessage.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    border: poMessage.type === 'success' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
                                    color: poMessage.type === 'success' ? 'var(--success)' : 'var(--danger)',
                                    padding: '0.75rem 1rem',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    marginBottom: '1.25rem',
                                    textAlign: 'center'
                                }}>
                                    {poMessage.text}
                                </div>
                            )}
                            <form onSubmit={handleCreatePO} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Full Name</label>
                                    <input 
                                        type="text" 
                                        className="input-field" 
                                        placeholder="Jane Doe" 
                                        value={poName}
                                        onChange={e => setPoName(e.target.value)}
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email Address</label>
                                    <input 
                                        type="email" 
                                        className="input-field" 
                                        placeholder="jane.doe@tpo.com" 
                                        value={poEmail}
                                        onChange={e => setPoEmail(e.target.value)}
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Password</label>
                                    <input 
                                        type="password" 
                                        className="input-field" 
                                        placeholder="••••••••" 
                                        value={poPassword}
                                        onChange={e => setPoPassword(e.target.value)}
                                        required 
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary w-full" disabled={poSubmitLoading} style={{ marginTop: '0.5rem' }}>
                                    {poSubmitLoading ? 'Creating...' : 'Create Account'}
                                </button>
                            </form>
                        </div>

                        {/* POs List Table Card */}
                        <div className="glass-card">
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', color: 'white', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
                                Current Placement Officers
                            </h3>
                            <div className="table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Created Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pos.map((po, index) => (
                                            <tr key={po._id || index}>
                                                <td style={{ fontWeight: '600' }}>{po.name}</td>
                                                <td>{po.email}</td>
                                                <td>{new Date(po.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <button 
                                                        onClick={() => handleDeletePO(po._id)}
                                                        className="btn btn-danger btn-sm-action"
                                                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                                                        title="Delete Placement Officer"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {pos.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="no-data" style={{ textAlign: 'center', padding: '2rem' }}>
                                                    No Placement Officers registered in the system.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <style>{`
                .admin-dashboard {
                    padding: 2.5rem;
                }

                .section-header {
                    margin-bottom: 2rem;
                }

                .section-header.space-between {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .section-header h2 {
                    font-size: 1.75rem;
                    margin-bottom: 0.5rem;
                }

                .section-header p {
                    color: var(--text-secondary);
                }

                .lpa-text {
                    font-size: 0.85rem;
                    font-weight: 500;
                    color: var(--text-muted);
                }

                /* Charts Grid Layout */
                .charts-grid {
                    display: grid;
                    grid-template-columns: 1fr 1.25fr;
                    gap: 1.5rem;
                }

                .chart-container-card h3,
                .recruiter-list-card h3 {
                    font-size: 1.05rem;
                    margin-bottom: 1.25rem;
                    color: white;
                    border-bottom: 1px solid var(--border-glass);
                    padding-bottom: 0.5rem;
                }

                .chart-wrapper {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 260px;
                }

                .no-data {
                    color: var(--text-muted);
                    font-size: 0.9rem;
                }

                /* Top recruiters table list */
                .recruiters-table {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .recruiter-table-header {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    padding-bottom: 0.25rem;
                    border-bottom: 1px solid var(--border-glass);
                }

                .recruiter-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: rgba(255, 255, 255, 0.02);
                    padding: 0.75rem 1rem;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border-glass);
                }

                .recruiter-company {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .recruiter-badge {
                    background: var(--primary-glow);
                    border: 1px solid var(--border-active);
                    color: white;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    font-size: 0.75rem;
                    font-weight: 700;
                }

                .offers-badge {
                    background: rgba(16, 185, 129, 0.1);
                    color: var(--success);
                    border: 1px solid rgba(16, 185, 129, 0.2);
                    padding: 0.25rem 0.6rem;
                    font-size: 0.8rem;
                    font-weight: 700;
                    border-radius: 99px;
                }

                /* Students Filtering */
                .filters-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 1.5rem;
                    margin-bottom: 1.5rem;
                    padding: 1rem;
                }

                .search-box {
                    position: relative;
                    flex: 1;
                    max-width: 400px;
                }

                .search-icon {
                    position: absolute;
                    left: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-muted);
                }

                .search-box .input-field {
                    padding-left: 2.75rem;
                }

                .filter-group {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .filter-icon {
                    color: var(--text-muted);
                    margin-right: 0.25rem;
                }

                .select-box {
                    min-width: 140px;
                }

                .cgpa-filter {
                    width: 100px;
                }

                /* Student List Table additions */
                .student-name-block {
                    display: flex;
                    flex-direction: column;
                }

                .student-email {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }

                .cgpa-badge {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid var(--border-glass);
                    color: white;
                    padding: 0.2rem 0.5rem;
                    font-size: 0.8rem;
                    font-weight: 700;
                    border-radius: 4px;
                }

                .skills-cell-tags {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 0.25rem;
                }

                .skills-more {
                    font-size: 0.7rem;
                    color: var(--text-muted);
                    font-weight: 600;
                    background: rgba(255, 255, 255, 0.03);
                    padding: 0.1rem 0.3rem;
                    border-radius: 3px;
                }

                .resume-view-btn {
                    color: var(--primary);
                    font-size: 0.85rem;
                    font-weight: 600;
                    text-decoration: none;
                }

                .resume-view-btn:hover {
                    text-decoration: underline;
                }

                .placed-company-label {
                    display: block;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    margin-top: 0.15rem;
                }

                .btn-sm-action {
                    padding: 0.4rem 0.75rem;
                    font-size: 0.8rem;
                }

                .empty-table-row {
                    text-align: center;
                    padding: 2.5rem;
                    color: var(--text-muted);
                }

                /* Admin Company Drives List */
                .admin-drives-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .admin-drive-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 2rem;
                    padding: 1.5rem;
                }

                .drive-main-info {
                    flex: 1;
                }

                .drive-main-info .header-bar {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 0.5rem;
                }

                .drive-main-info h3 {
                    font-size: 1.2rem;
                    color: white;
                }

                .drive-main-info .role {
                    font-size: 0.85rem;
                    color: var(--primary);
                    font-weight: 600;
                    background: var(--primary-glow);
                    padding: 0.15rem 0.5rem;
                    border-radius: 4px;
                }

                .meta-info-bar {
                    display: flex;
                    gap: 1.5rem;
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                }

                .drive-stats-info {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 0.35rem;
                }

                .applicants-counter {
                    font-size: 0.85rem;
                    color: var(--text-muted);
                }

                .applicants-counter strong {
                    color: white;
                }

                .drive-actions {
                    display: flex;
                    gap: 0.5rem;
                }

                .btn-icon-only {
                    padding: 0.6rem;
                    border-radius: var(--radius-md);
                }

                /* Modals Styling details */
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    border-bottom: 1px solid var(--border-glass);
                    padding-bottom: 0.75rem;
                }

                .modal-header h3 {
                    color: white;
                }

                .close-modal-btn {
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                }

                .close-modal-btn:hover {
                    color: white;
                }

                .modal-form .subtext {
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                    margin-bottom: 1.25rem;
                }

                .form-grid-2 {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                .textarea-field {
                    resize: vertical;
                }

                .modal-form .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.75rem;
                    margin-top: 1.5rem;
                }

                /* Applicants Drawer Styling */
                .drawer-overlay {
                    position: fixed;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    left: 0;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(6px);
                    z-index: 200;
                    display: flex;
                    justify-content: flex-end;
                    animation: fadeIn 0.3s ease;
                }

                .drawer-panel {
                    width: 100%;
                    max-width: 520px;
                    height: 100%;
                    border-radius: 0;
                    border-left: 1px solid var(--border-glass);
                    display: flex;
                    flex-direction: column;
                    padding: 2rem 1.5rem;
                    animation: slideLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }

                @keyframes slideLeft {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }

                .drawer-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    border-bottom: 1px solid var(--border-glass);
                    padding-bottom: 1rem;
                    margin-bottom: 1.5rem;
                }

                .drawer-header h3 {
                    color: white;
                    font-size: 1.3rem;
                }

                .drawer-body {
                    flex: 1;
                    overflow-y: auto;
                }

                .drawer-spinner-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 300px;
                }

                .drawer-applicants-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .applicant-item-card {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid var(--border-glass);
                    border-radius: var(--radius-md);
                    padding: 1.25rem;
                    display: flex;
                    justify-content: space-between;
                    gap: 1rem;
                }

                .applicant-info h4 {
                    color: white;
                    font-size: 0.95rem;
                    margin-bottom: 0.15rem;
                }

                .applicant-info .email {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    display: block;
                    margin-bottom: 0.5rem;
                }

                .applicant-academic {
                    display: flex;
                    gap: 1rem;
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                    margin-bottom: 0.75rem;
                }

                .resume-pill {
                    display: inline-flex;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: var(--primary);
                    text-decoration: none;
                    background: var(--primary-glow);
                    border: 1px solid var(--border-active);
                    padding: 0.2rem 0.5rem;
                    border-radius: 4px;
                }

                .resume-pill:hover {
                    background: var(--primary);
                    color: white;
                }

                .applicant-status-controls {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    justify-content: space-between;
                }

                .applicant-action-buttons {
                    display: flex;
                    gap: 0.25rem;
                    margin-top: 0.5rem;
                }

                .btn-xs {
                    padding: 0.25rem 0.5rem;
                    font-size: 0.75rem;
                    border-radius: 4px;
                }

                .drawer-empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 300px;
                    color: var(--text-muted);
                    gap: 0.75rem;
                }

                @media (max-width: 1024px) {
                    .charts-grid {
                        grid-template-columns: 1fr;
                    }
                    .filters-bar {
                        flex-direction: column;
                        align-items: stretch;
                    }
                }
            `}</style>
        </main>
    );
}
