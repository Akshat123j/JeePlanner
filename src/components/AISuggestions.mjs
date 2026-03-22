import React, { useState } from 'react';
import axios from 'axios';

export const AISuggestions = ({ mode }) => {
  const [plan, setPlan] = useState([]);
  const [loading, setLoading] = useState(false);

  const generatePlan = async () => {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) return alert("Please log in to use the AI Agent.");

    // IMPORTANT: Replace this with your actual Gemini API Key from aistudio.google.com
    const GEMINI_API_KEY = "AIzaSyBkGcYogu3CvsTvO2KhXMPWlxmZrN7SDg0"; 

    setLoading(true);
    try {
      // Pull basic profile info so the AI knows which exam to pull random topics for
      const profileStr = localStorage.getItem(`profile_${userEmail}`);
      const profile = profileStr ? JSON.parse(profileStr) : { exam: 'JEE', dailyGoal: 8 };

      // The Updated Prompt: Instructing Gemini to generate a RANDOM mock schedule
      const prompt = `
        You are an AI Study Planner. The student is preparing for the ${profile.exam} exam.
        Their daily goal is ${profile.dailyGoal} hours.

        TASK: Generate a completely RANDOM but realistic 3-item daily study plan for UI testing purposes.
        Pick 3 random high-yield topics from the standard ${profile.exam} syllabus. Make sure they are distinct subjects (e.g., one Physics, one Math, one Chem).

        Output Requirements:
        Return ONLY a raw JSON array of 3 objects. NO markdown formatting. NO backticks.
        Format exactly like this:
        [
          {
            "title": "Topic Name", 
            "duration": "e.g., 90 mins", 
            "priority": "High/Medium/Low", 
            "reason": "Write a short, realistic-sounding reason why this topic is important for the exam."
          }
        ]
      `;

      // Call Gemini 1.5 Flash (Using responseMimeType to guarantee JSON)
      const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { 
            temperature: 0.8, // Increased temperature makes the AI more random/creative
            responseMimeType: "application/json" 
        }
      };

      const aiRes = await axios.post(
   `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`,
        payload, 
        { headers: { "Content-Type": "application/json" } }
      );

      // Parse and set the data
      const rawText = aiRes.data.candidates[0].content.parts[0].text;
      setPlan(JSON.parse(rawText));

    } catch (err) {
      console.error("AI Error:", err.response?.data || err.message);
      alert("AI Failed. Open Console (F12) to see the error.");
    } finally {
      setLoading(false);
    }
  };

  const isDark = mode === 'dark';

  return (
    <div className={`card shadow-lg rounded-4 border-0 mb-5 ${isDark ? 'bg-dark text-white' : 'bg-white'}`}>
      <div className="card-header bg-gradient bg-primary text-white p-4 rounded-top-4 d-flex justify-content-between align-items-center">
        <div>
          <h4 className="fw-bold mb-1"><i className="bi bi-robot me-2"></i>AI Study Agent</h4>
          <p className="small mb-0 opacity-75">Generating random syllabus suggestions for testing</p>
        </div>
        <button className="btn btn-light btn-sm rounded-pill fw-bold px-3 shadow-sm" onClick={generatePlan} disabled={loading}>
          {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-dice-5 me-2"></i>}
          {plan.length > 0 ? "Roll Again" : "Generate Random Plan"}
        </button>
      </div>
      
      <div className="card-body p-4">
        {plan.length > 0 ? (
          <div className="row g-3">
            {plan.map((item, index) => (
              <div className="col-12" key={index}>
                <div className={`p-3 rounded-3 border-start border-4 shadow-sm ${item.priority === 'High' ? 'border-danger bg-danger bg-opacity-10' : item.priority === 'Medium' ? 'border-warning bg-warning bg-opacity-10' : 'border-info bg-info bg-opacity-10'}`}>
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="fw-bold mb-1">{item.title}</h6>
                    <span className="badge bg-primary rounded-pill">{item.duration}</span>
                  </div>
                  <p className={`small mb-2 ${isDark ? 'text-light-50' : 'text-muted'}`}><strong>AI Insight:</strong> {item.reason}</p>
                  <span className={`badge ${isDark ? 'bg-secondary' : 'bg-light text-dark'} border mt-1`}>
                    Priority: {item.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5">
            <i className="bi bi-cpu display-1 text-muted opacity-25"></i>
            <p className="mt-3 text-muted">Click "Generate Random Plan" to test the Gemini API connection.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AISuggestions;