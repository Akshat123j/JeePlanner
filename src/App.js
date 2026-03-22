import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
import Profile from "./components/Profile.mjs";
import { StudyTracker } from './components/StudyTracker.mjs';
import AISuggestions from "./components/AISuggestions.mjs";
import Mocktest from './components/Mocktest.mjs';

export default function App() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("light");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(savedUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userEmail");
    setUser(null);
  };

  const toggleMode = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <Router>
      <Navbar mode={mode} toggleMode={toggleMode} user={user} logout={handleLogout} />

      <div className="container my-3">
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={!user ? <Auth mode={mode} setUser={setUser} /> : <Navigate to="/" />} />

          {/* Protected Home Route */}
          <Route path="/" element={
            user ? (
              <>
                <h4 className="text-center mt-4">Welcome, {user}!</h4>
                <Quotes mode={mode} />
                
                {/* AI Study Plan Agent - Now fully self-contained! */}
                <div className="my-4"><AISuggestions mode={mode} /></div>
                
                <div className="my-5"><StudyTracker mode={mode} /></div>
                <Timer mode={mode} />
                <div className="my-5"><ToDoList mode={mode} /></div>
                <AttendenceTracker mode={mode} />
                <StudyTrends mode={mode} />
                <PdfSummarizer mode={mode} />
                <Mocktest />
                <div className="my-5"><Profile mode={mode} /></div>
              </>
            ) : (
              <Navigate to="/login" />
            )
          } />

          {/* Protected Sub-URLs */}
          <Route path="/about" element={user ? <About mode={mode} /> : <Navigate to="/login" />} />
          <Route path="/ai" element={user ? <AI mode={mode} /> : <Navigate to="/login" />} />
          <Route path="/timetable" element={user ? <TimeTable mode={mode} /> : <Navigate to="/login" />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}