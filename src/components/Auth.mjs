import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Auth({ mode, setUser }) {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '', password: '', fullName: '', institute: '',
        location: '', phone: '', parentPhone: '',
        targetExam: 'JEE', dailyGoal: '8', strength: '', weakness: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errorMsg) setErrorMsg('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        if (isLogin) {
            // LOGIN: find user in localStorage
            const users = JSON.parse(localStorage.getItem('all_users') || '{}');
            const user = users[formData.email];
            if (!user || user.password !== formData.password) {
                setErrorMsg("Invalid email or password.");
                setLoading(false);
                return;
            }
            localStorage.setItem("user", user.fullName);
            localStorage.setItem("userEmail", formData.email);
            setUser(user.fullName);
            navigate('/');
        } else {
            // SIGNUP: save new user to localStorage
            const users = JSON.parse(localStorage.getItem('all_users') || '{}');
            if (users[formData.email]) {
                setErrorMsg("Email already registered. Please login.");
                setLoading(false);
                return;
            }
            users[formData.email] = { ...formData };
            localStorage.setItem('all_users', JSON.stringify(users));
            setIsLogin(true);
            setErrorMsg('');
            alert("Profile created! Please log in.");
        }
        setLoading(false);
    };

    const isDarkMode = mode === 'dark';
    const inputClass = `form-control ${isDarkMode ? 'bg-secondary text-white border-secondary' : ''}`;
    const selectClass = `form-select ${isDarkMode ? 'bg-secondary text-white border-secondary' : ''}`;

    return (
        <div className="container d-flex justify-content-center align-items-center my-5" style={{ minHeight: '80vh' }}>
            <div className={`card shadow-lg p-4 border-0 rounded-4 ${isDarkMode ? 'bg-dark text-white' : 'bg-white'}`} style={{ width: '100%', maxWidth: '550px' }}>
                <h2 className="text-center fw-bold mb-4">{isLogin ? '👋 Welcome Back' : '🚀 Create Student Profile'}</h2>

                {errorMsg && <div className="alert alert-danger py-2 text-center small fw-bold">{errorMsg}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                        <div className="col-12">
                            <label className="form-label fw-bold small">Email Address</label>
                            <input type="email" name="email" required className={inputClass} placeholder="name@example.com" value={formData.email} onChange={handleChange} />
                        </div>
                        <div className="col-12">
                            <label className="form-label fw-bold small">Password</label>
                            <input type="password" name="password" required className={inputClass} placeholder="Enter password" value={formData.password} onChange={handleChange} />
                        </div>

                        {!isLogin && (<>
                            <div className="col-12"><hr className="opacity-25 my-1" /></div>
                            <div className="col-12"><h6 className="text-primary fw-bold mb-0">Personal Details</h6></div>

                            <div className="col-12">
                                <label className="form-label fw-bold small">Full Name</label>
                                <input type="text" name="fullName" required className={inputClass} placeholder="Your full name" value={formData.fullName} onChange={handleChange} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small">Institute</label>
                                <input type="text" name="institute" className={inputClass} placeholder="NIT Raipur" value={formData.institute} onChange={handleChange} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small">Location</label>
                                <input type="text" name="location" className={inputClass} placeholder="City" value={formData.location} onChange={handleChange} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small">Phone</label>
                                <input type="tel" name="phone" className={inputClass} placeholder="Your number" value={formData.phone} onChange={handleChange} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small">Parent's Phone</label>
                                <input type="tel" name="parentPhone" className={inputClass} placeholder="Parent's number" value={formData.parentPhone} onChange={handleChange} />
                            </div>

                            <div className="col-12"><hr className="opacity-25 my-1" /></div>
                            <div className="col-12"><h6 className="text-success fw-bold mb-0">Study Preferences</h6></div>

                            <div className="col-md-6">
                                <label className="form-label fw-bold small">Target Exam</label>
                                <select name="targetExam" className={selectClass} value={formData.targetExam} onChange={handleChange}>
                                    <option value="JEE">JEE (Mains/Adv)</option>
                                    <option value="NEET">NEET</option>
                                    <option value="UPSC">UPSC CSE</option>
                                    <option value="CAT">CAT</option>
                                    <option value="GATE">GATE</option>
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small">Study Goal (Hrs/Day)</label>
                                <input type="number" name="dailyGoal" className={inputClass} min="1" max="20" value={formData.dailyGoal} onChange={handleChange} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small">Strongest Subject</label>
                                <input type="text" name="strength" className={inputClass} placeholder="e.g. Physics" value={formData.strength} onChange={handleChange} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold small">Weakest Subject</label>
                                <input type="text" name="weakness" className={inputClass} placeholder="e.g. Organic Chemistry" value={formData.weakness} onChange={handleChange} />
                            </div>
                        </>)}
                    </div>

                    <button type="submit" className="btn btn-primary w-100 mt-4 py-2 fw-bold" disabled={loading}>
                        {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Please wait...</> : isLogin ? 'Login' : 'Begin My Journey 🚀'}
                    </button>
                </form>

                <div className="text-center mt-3">
                    <button className={`btn btn-link text-decoration-none ${isDarkMode ? 'text-info' : ''}`} onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); }}>
                        {isLogin ? "New Aspirant? Register here" : "Already have an account? Login"}
                    </button>
                </div>
            </div>
        </div>
    );
}