import React, { useState, useEffect } from 'react';
import { updateConceptRetention } from '../logic/RevisionEngine.mjs';

export const StudyTracker = ({ mode }) => {
  const [concepts, setConcepts] = useState([]);

  useEffect(() => {
    const savedGraph = localStorage.getItem('knowledgeGraph');
    if (savedGraph) {
      setConcepts(JSON.parse(savedGraph));
    } else {
      const initialData = [
        { id: 1, name: "Gauss's Law", subject: "Physics", repetitions: 0, interval: 0, ease: 2.5, status: "New" },
        { id: 2, name: "Lami's Theorem", subject: "Mechanics", repetitions: 0, interval: 0, ease: 2.5, status: "New" },
        { id: 3, name: "Fundamental Rights", subject: "Polity", repetitions: 0, interval: 0, ease: 2.5, status: "New" }
      ];
      setConcepts(initialData);
    }
  }, []);

  const handleStudySession = (id, quality) => {
    const updated = concepts.map(c => {
      if (c.id === id) {
        return updateConceptRetention(c, quality);
      }
      return c;
    });
    
    setConcepts(updated);
    localStorage.setItem('knowledgeGraph', JSON.stringify(updated));
  };

  // Theme Logic
  const isDark = mode === 'dark';
  const mainCardClass = isDark ? 'bg-dark text-light border-secondary' : 'bg-white text-dark border-0';
  const subCardClass = isDark ? 'bg-secondary bg-opacity-10 text-light border-secondary' : 'bg-white text-dark border-light';

  return (
    <div className={`card shadow-sm rounded-4 ${mainCardClass} p-3 mb-4`}>
      <div className="card-body">
        <h5 className="fw-bold mb-4 d-flex align-items-center">
          <i className="bi bi-graph-up-arrow me-2 text-primary"></i>
          Revision Scheduler
        </h5>

        <div className="row g-3">
          {concepts.map(concept => {
            // Logic to highlight if revision is due today or overdue
            const isDue = concept.nextReview && new Date(concept.nextReview) <= new Date();
            
            return (
              <div className="col-md-6 col-lg-4" key={concept.id}>
                <div className={`card h-100 ${subCardClass} border-start border-4 ${isDue ? 'border-danger' : 'border-primary'} shadow-sm`}>
                  <div className="card-body p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="fw-bold mb-0">{concept.name}</h6>
                      <span className={`badge rounded-pill ${concept.status === 'Mastered' ? 'bg-success' : 'bg-info text-dark'}`} style={{fontSize: '10px'}}>
                        {concept.status}
                      </span>
                    </div>
                    
                    <p className={`${isDark ? 'text-light-50' : 'text-muted'} small mb-2`}>{concept.subject}</p>

                    <div className="mb-3">
                      <div className="d-flex justify-content-between small">
                        <span className={isDark ? 'text-light-50' : 'text-secondary'}>Next:</span>
                        <span className={`fw-bold ${isDue ? 'text-danger' : 'text-primary'}`}>
                          {concept.nextReview ? new Date(concept.nextReview).toLocaleDateString() : 'Today'}
                        </span>
                      </div>
                      <div className="progress mt-1" style={{ height: '6px', backgroundColor: isDark ? '#444' : '#e9ecef' }}>
                        <div 
                          className={`progress-bar ${isDue ? 'bg-danger' : 'bg-primary'}`} 
                          style={{ width: `${Math.min((concept.repetitions / 5) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="d-flex gap-1 justify-content-between">
                      <button 
                        onClick={() => handleStudySession(concept.id, 5)} 
                        className="btn btn-sm btn-outline-success flex-grow-1"
                        title="Mastered"
                      >
                        <i className="bi bi-check-lg"></i>
                      </button>
                      <button 
                        onClick={() => handleStudySession(concept.id, 3)} 
                        className="btn btn-sm btn-outline-warning flex-grow-1"
                        title="Reviewing"
                      >
                        <i className="bi bi-hourglass-split"></i>
                      </button>
                      <button 
                        onClick={() => handleStudySession(concept.id, 1)} 
                        className="btn btn-sm btn-outline-danger flex-grow-1"
                        title="Forgotten"
                      >
                        <i className="bi bi-arrow-counterclockwise"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StudyTracker;