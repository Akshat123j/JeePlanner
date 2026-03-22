import React, { useState, useEffect } from 'react';

export const Profile = () => {
  const [profile, setProfile] = useState({
    name: "Akshat Kumar Jain",
    exam: "JEE",
    targetYear: "2026",
    dailyGoal: "8",
    strength: "Physics",
    weakness: "Inorganic Chemistry"
  });

  useEffect(() => {
    const saved = localStorage.getItem('userProfile');
    if (saved) setProfile(JSON.parse(saved));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('userProfile', JSON.stringify(profile));
    alert("Profile Updated!");
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow border-0 rounded-4">
            
            {/* Header with Bootstrap Icon */}
            <div className="card-header bg-primary text-white text-center py-4 rounded-top-4">
              <i className="bi bi-person-circle display-4"></i>
              <h4 className="mt-2 mb-0">Student Profile</h4>
            </div>

            <div className="card-body p-4">
              <form onSubmit={handleSave}>
                <div className="row g-4">
                  
                  {/* Name Input */}
                  <div className="col-12">
                    <label className="form-label fw-bold">
                      <i className="bi bi-person me-2"></i>Full Name
                    </label>
                    <input 
                      type="text" 
                      name="name"
                      className="form-control" 
                      value={profile.name} 
                      onChange={handleChange}
                    />
                  </div>

                  {/* Exam Selection */}
                  <div className="col-md-6">
                    <label className="form-label fw-bold">
                      <i className="bi bi-journal-check me-2"></i>Target Exam
                    </label>
                    <select 
                      name="exam"
                      className="form-select text-primary fw-semibold" 
                      value={profile.exam} 
                      onChange={handleChange}
                    >
                      <option value="JEE">JEE (Mains/Adv)</option>
                      <option value="NEET">NEET</option>
                      <option value="UPSC">UPSC CSE</option>
                    </select>
                  </div>

                  {/* Daily Goal */}
                  <div className="col-md-6">
                    <label className="form-label fw-bold">
                      <i className="bi bi-clock-history me-2"></i>Study Goal (Hrs)
                    </label>
                    <input 
                      type="number" 
                      name="dailyGoal"
                      className="form-control" 
                      value={profile.dailyGoal} 
                      onChange={handleChange}
                    />
                  </div>

                  {/* Strength */}
                  <div className="col-12">
                    <label className="form-label fw-bold">
                      <i className="bi bi-lightning-charge me-2"></i>Strongest Subject
                    </label>
                    <input 
                      type="text" 
                      name="strength"
                      className="form-control" 
                      placeholder="e.g. Modern Physics"
                      value={profile.strength} 
                      onChange={handleChange}
                    />
                  </div>

                </div>

                <div className="d-grid mt-5">
                  <button type="submit" className="btn btn-primary btn-lg rounded-3 fw-bold shadow-sm">
                    <i className="bi bi-cloud-arrow-up me-2"></i>Update Preferences
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;