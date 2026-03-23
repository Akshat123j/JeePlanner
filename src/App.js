import React, { useState, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";

// Components
import Navbar from "./components/Navbar.mjs";
import Auth from "./components/Auth";
import Quotes from "./components/Quotes";
import Timer from "./components/Timer.mjs";
import ToDoList from "./components/ToDoList.mjs";
import AttendenceTracker from "./components/Attendence.mjs";
import About from "./components/About.mjs";
import AI from "./components/AI.mjs";
import TimeTable from "./components/Timetable.mjs";
import StudyTrends from "./components/StudyTrends.mjs";
import PdfSummarizer from "./components/PdfReader.mjs";
// import Profile from "./components/Profile.mjs";
import { StudyTracker } from "./components/StudyTracker.mjs";
import AISuggestions from "./components/AISuggestions.mjs";
import Mocktest from "./components/Mocktest.mjs";

/* ─── Animated background particles ──────────────────────────────── */
function ParticleField({ mode }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2.2 + 0.6,
      alpha: Math.random() * 0.5 + 0.15,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const color = mode === "dark" ? "120,200,255" : "99,102,241";
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color},${p.alpha})`;
        ctx.fill();
      });
      // Connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${color},${0.12 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [mode]);

  return (
    <canvas ref={canvasRef} className="particle-canvas" aria-hidden="true" />
  );
}

/* ─── Section wrapper with staggered reveal ──────────────────────── */
function Section({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal-section ${visible ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ─── Animated welcome greeting ──────────────────────────────────── */
function WelcomeBanner({ user, mode }) {
  const [tick, setTick] = useState(0);
  const greetings = ["Welcome back", "Great to see you", "Ready to learn"];
  useEffect(() => {
    const id = setInterval(
      () => setTick((t) => (t + 1) % greetings.length),
      3500,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div className={`welcome-banner ${mode}`}>
      <div className="welcome-glow" />
      <div className="welcome-inner">
        <div className="welcome-avatar">{user?.[0]?.toUpperCase() ?? "S"}</div>
        <div>
          <div className="welcome-greeting">
            <span className="greeting-text" key={tick}>
              {greetings[tick]},
            </span>
          </div>
          <h2 className="welcome-name">{user}! 🚀</h2>
        </div>
      </div>
      <div className="welcome-badge">
        <span className="badge-dot" />
        Study Session Active
      </div>
    </div>
  );
}

/* ─── Divider with label ─────────────────────────────────────────── */
function SectionDivider({ label, icon }) {
  return (
    <div className="section-divider">
      <div className="divider-line" />
      <div className="divider-label">
        <span className="divider-icon">{icon}</span>
        {label}
      </div>
      <div className="divider-line" />
    </div>
  );
}

/* ─── Card shell around each component ──────────────────────────── */
function ComponentCard({ children, accent, glow = false }) {
  return (
    <div
      className={`component-card ${glow ? "card-glow" : ""}`}
      style={{ "--card-accent": accent ?? "var(--color-primary)" }}
    >
      <div className="card-accent-bar" />
      {children}
    </div>
  );
}

/* ─── Main App ───────────────────────────────────────────────────── */
export default function App() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(savedUser);
    const savedMode = localStorage.getItem("colorMode") || "light";
    setMode(savedMode);
    setTimeout(() => setMounted(true), 60);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userEmail");
    setUser(null);
  };

  const toggleMode = () => {
    setMode((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("colorMode", next);
      return next;
    });
  };

  return (
    <div className={`app-root ${mode} ${mounted ? "app-mounted" : ""}`}>
      {/* Animated background */}
      <ParticleField mode={mode} />

      {/* Ambient gradient orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <Router>
        <Navbar
          mode={mode}
          toggleMode={toggleMode}
          user={user}
          logout={handleLogout}
        />

        <main className="main-container">
          <Routes>
            {/* Public: Login */}
            <Route
              path="/login"
              element={
                !user ? (
                  <div className="auth-wrapper">
                    <div className="auth-card-shell">
                      <Auth mode={mode} setUser={setUser} />
                    </div>
                  </div>
                ) : (
                  <Navigate to="/" />
                )
              }
            />

            {/* Protected: Home */}
            <Route
              path="/"
              element={
                user ? (
                  <div className="home-feed">
                    {/* Welcome banner */}
                    <Section delay={0}>
                      <WelcomeBanner user={user} mode={mode} />
                    </Section>

                    {/* Daily Quote */}
                    <Section delay={80}>
                      <ComponentCard accent="var(--color-amber)" glow>
                        <Quotes mode={mode} />
                      </ComponentCard>
                    </Section>

                    <SectionDivider label="AI Assistant" icon="🤖" />

                    {/* AI Study Suggestions */}
                    <Section delay={120}>
                      <ComponentCard accent="var(--color-violet)">
                        <AISuggestions mode={mode} />
                      </ComponentCard>
                    </Section>

                    <SectionDivider label="Study Tracking" icon="📈" />

                    {/* Study Tracker */}
                    <Section delay={0}>
                      <ComponentCard accent="var(--color-cyan)">
                        <StudyTracker mode={mode} />
                      </ComponentCard>
                    </Section>

                    {/* Timer */}
                    <Section delay={60}>
                      <ComponentCard accent="var(--color-rose)" glow>
                        <Timer mode={mode} />
                      </ComponentCard>
                    </Section>

                    <SectionDivider label="Tasks & Attendance" icon="✅" />

                    {/* To-Do List */}
                    <Section delay={0}>
                      <ComponentCard accent="var(--color-emerald)">
                        <ToDoList mode={mode} />
                      </ComponentCard>
                    </Section>

                    {/* Attendance Tracker */}
                    <Section delay={80}>
                      <ComponentCard accent="var(--color-orange)">
                        <AttendenceTracker mode={mode} />
                      </ComponentCard>
                    </Section>

                    <SectionDivider label="Insights & Tools" icon="🔬" />

                    {/* Study Trends */}
                    <Section delay={0}>
                      <ComponentCard accent="var(--color-sky)">
                        <StudyTrends mode={mode} />
                      </ComponentCard>
                    </Section>

                    {/* PDF Summarizer */}
                    {/* <Section delay={80}>
                      <ComponentCard accent="var(--color-fuchsia)">
                        <PdfSummarizer mode={mode} />
                      </ComponentCard>
                    </Section> */}

                    <SectionDivider label="Mock Test" icon="📝" />

                    {/* Mock Test */}
                    <Section delay={0}>
                      <ComponentCard accent="var(--color-indigo)" glow>
                        <Mocktest />
                      </ComponentCard>
                    </Section>

                    {/* <SectionDivider label="Profile" icon="👤" /> */}

                    {/* Profile */}
                    {/* <Section delay={0}>
                      <ComponentCard accent="var(--color-violet)">
                        <Profile mode={mode} />
                      </ComponentCard>
                    </Section> */}

                    {/* Footer spacer */}
                    <div className="feed-footer" />
                  </div>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            {/* Protected sub-routes */}
            <Route
              path="/about"
              element={
                user ? (
                  <div className="page-wrapper">
                    <ComponentCard accent="var(--color-amber)">
                      <About mode={mode} />
                    </ComponentCard>
                  </div>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/ai"
              element={
                user ? (
                  <div className="page-wrapper">
                    <ComponentCard accent="var(--color-violet)" glow>
                      <AI mode={mode} />
                    </ComponentCard>
                  </div>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/pdfsummariser"
              element={
                user ? (
                  <div className="page-wrapper">
                    <ComponentCard accent="var(--color-fuchsia)">
                      <PdfSummarizer mode={mode} />
                    </ComponentCard>
                  </div>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/timetable"
              element={
                user ? (
                  <div className="page-wrapper">
                    <ComponentCard accent="var(--color-cyan)">
                      <TimeTable mode={mode} />
                    </ComponentCard>
                  </div>
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </Router>
    </div>
  );
}
