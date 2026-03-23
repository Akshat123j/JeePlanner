import React, { useState } from 'react';
import axios from 'axios';

const DEFAULT_PLAN = [
  {
    title: "Mechanics & Newton's Laws",
    duration: "90 mins",
    priority: "High",
    reason: "Core foundation of JEE Physics — Newton's laws and free body diagrams appear in almost every paper.",
    subject: "Physics",
    time: "8:00 AM",
    icon: "⚙️",
  },
  {
    title: "Integral Calculus",
    duration: "75 mins",
    priority: "High",
    reason: "Integration techniques are heavily tested and underpin topics across all three subjects.",
    subject: "Mathematics",
    time: "9:30 AM",
    icon: "∫",
  },
  {
    title: "Chemical Bonding & Molecular Structure",
    duration: "60 mins",
    priority: "Medium",
    reason: "Frequently tested in JEE Mains and Advanced; forms the basis for organic and inorganic chemistry.",
    subject: "Chemistry",
    time: "11:00 AM",
    icon: "⚗️",
  },
  {
    title: "Waves & Oscillations",
    duration: "60 mins",
    priority: "Medium",
    reason: "Regular appearance in JEE; connects to optics, sound, and modern physics chapters.",
    subject: "Physics",
    time: "1:00 PM",
    icon: "〰️",
  },
  {
    title: "Coordinate Geometry",
    duration: "75 mins",
    priority: "High",
    reason: "One of the highest-scoring areas in JEE Math — circles, parabolas, and hyperbolas are predictable.",
    subject: "Mathematics",
    time: "2:30 PM",
    icon: "📐",
  },
  {
    title: "Organic Reaction Mechanisms",
    duration: "90 mins",
    priority: "High",
    reason: "Reaction mechanisms and named reactions are consistently tested; mastering them boosts overall score significantly.",
    subject: "Chemistry",
    time: "4:00 PM",
    icon: "🧪",
  },
];

const PRIORITY_STYLES = {
  High:   { border: '#ef4444', bg: 'rgba(239,68,68,0.08)',   badge: '#ef4444' },
  Medium: { border: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  badge: '#f59e0b' },
  Low:    { border: '#3b82f6', bg: 'rgba(59,130,246,0.08)',  badge: '#3b82f6' },
};

const SUBJECT_COLORS = {
  Physics:     '#818cf8',
  Mathematics: '#34d399',
  Chemistry:   '#fb923c',
};

export const AISuggestions = ({ mode }) => {
  const [plan, setPlan] = useState(DEFAULT_PLAN);
  const [loading, setLoading] = useState(false);
  const [isAIGenerated, setIsAIGenerated] = useState(false);
  const [animating, setAnimating] = useState(false);

  const isDark = mode === 'dark';

  const generatePlan = async () => {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) return alert("Please log in to use the AI Agent.");

    const GEMINI_API_KEY = "AIzaSyBkGcYogu3CvsTvO2KhXMPWlxmZrN7SDg0";

    setLoading(true);
    try {
      const profileStr = localStorage.getItem(`profile_${userEmail}`);
      const profile = profileStr ? JSON.parse(profileStr) : { exam: 'JEE', dailyGoal: 8 };

      const prompt = `
        You are an AI Study Planner. The student is preparing for the ${profile.exam} exam.
        Their daily goal is ${profile.dailyGoal} hours.

        TASK: Generate a completely RANDOM but realistic 6-item daily study plan.
        Pick 6 random high-yield topics from the standard ${profile.exam} syllabus (2 Physics, 2 Math, 2 Chemistry).
        Also assign a realistic time slot for each item (starting from 8:00 AM, no overlap).

        Output Requirements:
        Return ONLY a raw JSON array of 6 objects. NO markdown. NO backticks.
        Format exactly like this:
        [
          {
            "title": "Topic Name",
            "duration": "e.g., 90 mins",
            "priority": "High/Medium/Low",
            "reason": "Short realistic reason why this is important.",
            "subject": "Physics/Mathematics/Chemistry",
            "time": "e.g., 8:00 AM",
            "icon": "one relevant emoji"
          }
        ]
      `;

      const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          responseMimeType: "application/json"
        }
      };

      const aiRes = await axios.post(
       `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      const rawText = aiRes.data.candidates[0].content.parts[0].text;
      const parsed = JSON.parse(rawText);

      setAnimating(true);
      setTimeout(() => {
        setPlan(parsed);
        setIsAIGenerated(true);
        setAnimating(false);
      }, 400);

    } catch (err) {
      console.error("AI Error:", err.response?.data || err.message);
      alert("AI generation failed. Check the console (F12) for details.");
    } finally {
      setLoading(false);
    }
  };

  const resetToDefault = () => {
    setAnimating(true);
    setTimeout(() => {
      setPlan(DEFAULT_PLAN);
      setIsAIGenerated(false);
      setAnimating(false);
    }, 400);
  };

  const totalMins = plan.reduce((acc, item) => {
    const m = parseInt(item.duration);
    return acc + (isNaN(m) ? 0 : m);
  }, 0);

  const bg     = isDark ? '#0f172a' : '#f8fafc';
  const card   = isDark ? '#1e293b' : '#ffffff';
  const border = isDark ? '#334155' : '#e2e8f0';
  const text   = isDark ? '#f1f5f9' : '#0f172a';
  const muted  = isDark ? '#94a3b8' : '#64748b';

  return (
    <div style={{
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      background: bg,
      borderRadius: '20px',
      padding: '0',
      marginBottom: '2rem',
      border: `1px solid ${border}`,
      overflow: 'hidden',
      boxShadow: isDark
        ? '0 4px 32px rgba(0,0,0,0.4)'
        : '0 4px 32px rgba(15,23,42,0.08)',
      transition: 'all 0.3s ease',
    }}>

      {/* ── Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #a855f7 100%)',
        padding: '24px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span style={{ fontSize: '22px' }}>🗓️</span>
            <h4 style={{ color: '#fff', fontWeight: 700, fontSize: '1.2rem', margin: 0 }}>
              Daily Study Timetable
            </h4>
            {isAIGenerated && (
              <span style={{
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 10px',
                borderRadius: '20px',
                letterSpacing: '0.05em',
              }}>✨ AI Generated</span>
            )}
          </div>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', margin: 0 }}>
            {isAIGenerated
              ? 'Personalised by Gemini AI based on your profile'
              : 'Default high-yield JEE schedule — click AI to personalise'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {isAIGenerated && (
            <button
              onClick={resetToDefault}
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '10px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
              ↩ Reset Default
            </button>
          )}
          <button
            onClick={generatePlan}
            disabled={loading}
            style={{
              background: '#fff',
              color: '#6366f1',
              border: 'none',
              borderRadius: '10px',
              padding: '8px 20px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: loading ? 0.7 : 1,
              boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
              transition: 'all 0.2s',
            }}>
            {loading
              ? <><span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}></span> Generating...</>
              : <>{isAIGenerated ? '🎲 Regenerate' : '🤖 Generate with AI'}</>
            }
          </button>
        </div>
      </div>

      {/* ── Stats Bar ── */}
      <div style={{
        display: 'flex',
        gap: '0',
        borderBottom: `1px solid ${border}`,
        background: card,
      }}>
        {[
          { label: 'Sessions', value: plan.length },
          { label: 'Total Hours', value: `${(totalMins / 60).toFixed(1)}h` },
          { label: 'High Priority', value: plan.filter(p => p.priority === 'High').length },
          { label: 'Subjects', value: [...new Set(plan.map(p => p.subject))].length },
        ].map((stat, i) => (
          <div key={i} style={{
            flex: 1,
            padding: '14px 16px',
            textAlign: 'center',
            borderRight: i < 3 ? `1px solid ${border}` : 'none',
          }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#6366f1' }}>{stat.value}</div>
            <div style={{ fontSize: '11px', color: muted, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '2px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── Timetable Grid ── */}
      <div style={{
        padding: '20px 24px',
        background: bg,
        opacity: animating ? 0 : 1,
        transform: animating ? 'translateY(8px)' : 'translateY(0)',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {plan.map((item, index) => {
            const pStyle = PRIORITY_STYLES[item.priority] || PRIORITY_STYLES.Medium;
            const subjectColor = SUBJECT_COLORS[item.subject] || '#6366f1';

            return (
              <div key={index} style={{
                display: 'flex',
                gap: '16px',
                alignItems: 'stretch',
                animation: `fadeSlideIn 0.4s ease ${index * 0.06}s both`,
              }}>
                {/* Time column */}
                <div style={{
                  minWidth: '70px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  paddingTop: '14px',
                }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: subjectColor,
                    whiteSpace: 'nowrap',
                  }}>{item.time || '—'}</span>
                  <div style={{
                    width: '2px',
                    flex: 1,
                    background: `linear-gradient(to bottom, ${subjectColor}55, transparent)`,
                    marginTop: '6px',
                    borderRadius: '2px',
                  }}></div>
                </div>

                {/* Card */}
                <div style={{
                  flex: 1,
                  background: card,
                  borderRadius: '14px',
                  borderLeft: `4px solid ${pStyle.border}`,
                  padding: '14px 18px',
                  boxShadow: isDark
                    ? '0 1px 8px rgba(0,0,0,0.3)'
                    : '0 1px 8px rgba(15,23,42,0.06)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'default',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        fontSize: '20px',
                        background: pStyle.bg,
                        borderRadius: '8px',
                        padding: '4px 8px',
                        lineHeight: 1,
                      }}>{item.icon || '📚'}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: text }}>{item.title}</div>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          color: subjectColor,
                          background: `${subjectColor}18`,
                          padding: '1px 8px',
                          borderRadius: '20px',
                          display: 'inline-block',
                          marginTop: '3px',
                        }}>{item.subject}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{
                        background: '#6366f1',
                        color: '#fff',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: '20px',
                      }}>{item.duration}</span>
                      <span style={{
                        background: pStyle.badge + '22',
                        color: pStyle.badge,
                        border: `1px solid ${pStyle.badge}44`,
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: '20px',
                      }}>{item.priority}</span>
                    </div>
                  </div>

                  <p style={{
                    fontSize: '12.5px',
                    color: muted,
                    margin: '10px 0 0',
                    lineHeight: 1.55,
                  }}>
                    <span style={{ fontWeight: 600, color: isDark ? '#a5b4fc' : '#6366f1' }}>💡 Insight: </span>
                    {item.reason}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Footer note ── */}
      <div style={{
        padding: '12px 24px 20px',
        background: bg,
        textAlign: 'center',
        fontSize: '12px',
        color: muted,
      }}>
        {isAIGenerated
          ? '✨ Schedule generated by Gemini AI · Click "Regenerate" for a fresh plan'
          : '📌 This is a default schedule · Click "Generate with AI" to personalise it'}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AISuggestions;