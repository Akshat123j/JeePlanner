import React, { useState, useEffect, useRef } from "react";

export default function UniversalTimeTracker(props) {
  const isLight = props.mode === "light";

  // --- NEW RED/YELLOW/GREEN THEME ---
  const palette = {
    bg: isLight ? "#ffffff" : "#212529", 
    text: isLight ? "#111827" : "#f9fafb",
    card: isLight ? "#f3f4f6" : "#1f2937",
    cardBorder: isLight ? "#d1d5db" : "#374151",
    
    // Traffic Light Colors mapped to Start/Stop/Reset
    start: "#22c55e",       // Green
    startBorder: "#16a34a", 
    startText: "#ffffff",
    
    reset: "#ef4444",        // Red
    resetBorder: "#dc2626",
    resetText: "#ffffff",
    
    stop: "#eab308",       // Yellow
    stopBorder: "#ca8a04",
    stopText: "#000000",   // Black text for readability
  };

  // --- UI State ---
  const [activeTab, setActiveTab] = useState("stopwatch");
  const [timeIsUp, setTimeIsUp] = useState(false);

  // --- Stopwatch State ---
  const [swSeconds, setSwSeconds] = useState(0);
  const [swIsRunning, setSwIsRunning] = useState(false);

  // --- Timer State ---
  const [tmSeconds, setTmSeconds] = useState(0);
  const [tmIsRunning, setTmIsRunning] = useState(false);
  const [tmInputMinutes, setTmInputMinutes] = useState(5);

  // --- Refs ---
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  // 1. Initial Load: Setup Audio and Restore States
  useEffect(() => {
    audioRef.current = new Audio(
      "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
    );
    audioRef.current.loop = true;

    // Restore Stopwatch
    const storedSwRunning = localStorage.getItem("sw_running") === "true";
    const storedSwAccum = parseInt(localStorage.getItem("sw_accumulated")) || 0;
    if (storedSwRunning) {
      setSwIsRunning(true);
      const start = parseInt(localStorage.getItem("sw_start")) || Date.now();
      setSwSeconds(storedSwAccum + Math.floor((Date.now() - start) / 1000));
    } else {
      setSwSeconds(storedSwAccum);
    }

    // Restore Timer
    const storedTmRunning = localStorage.getItem("tm_running") === "true";
    const storedTmAccum = parseInt(localStorage.getItem("tm_accumulated")) || 0;
    const storedTmDuration = parseInt(localStorage.getItem("tm_duration")) || 0;

    if (storedTmRunning) {
      setTmIsRunning(true);
      const start = parseInt(localStorage.getItem("tm_start")) || Date.now();
      const elapsed = storedTmAccum + Math.floor((Date.now() - start) / 1000);
      const remaining = storedTmDuration - elapsed;
      setTmSeconds(remaining > 0 ? remaining : 0);
    } else {
      setTmSeconds(storedTmDuration > 0 ? storedTmDuration - storedTmAccum : 0);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // 2. Main Engine
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const now = Date.now();

      // Update Stopwatch
      if (swIsRunning) {
        const start = parseInt(localStorage.getItem("sw_start")) || now;
        const accum = parseInt(localStorage.getItem("sw_accumulated")) || 0;
        setSwSeconds(accum + Math.floor((now - start) / 1000));
      }

      // Update Timer
      if (tmIsRunning) {
        const start = parseInt(localStorage.getItem("tm_start")) || now;
        const accum = parseInt(localStorage.getItem("tm_accumulated")) || 0;
        const duration = parseInt(localStorage.getItem("tm_duration")) || 0;

        const elapsed = accum + Math.floor((now - start) / 1000);
        const remaining = duration - elapsed;

        if (remaining <= 0) {
          if (audioRef.current) {
            audioRef.current
              .play()
              .catch((error) => console.log("Audio playback failed:", error));
          }

          setTimeIsUp(true);

          setTmSeconds(0);
          setTmIsRunning(false);
          localStorage.setItem("tm_running", "false");
          localStorage.removeItem("tm_start");
          localStorage.removeItem("tm_accumulated");
          localStorage.removeItem("tm_duration");
        } else {
          setTmSeconds(remaining);
        }
      }
    }, 100);

    return () => clearInterval(intervalRef.current);
  }, [swIsRunning, tmIsRunning]);

  // --- Utility to Stop Alarm ---
  const stopAlarm = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0; 
    }
    setTimeIsUp(false);
  };

  // --- Stopwatch Handlers ---
  const handleSwStart = () => {
    if (!swIsRunning) {
      localStorage.setItem("sw_running", "true");
      localStorage.setItem("sw_start", Date.now().toString());
      setSwIsRunning(true);
    }
  };

  const handleSwStop = () => {
    if (swIsRunning) {
      setSwIsRunning(false);
      const start = parseInt(localStorage.getItem("sw_start"));
      const accum = parseInt(localStorage.getItem("sw_accumulated")) || 0;
      const newAccum = accum + Math.floor((Date.now() - start) / 1000);

      localStorage.setItem("sw_accumulated", newAccum.toString());
      localStorage.setItem("sw_running", "false");
      localStorage.removeItem("sw_start");
      setSwSeconds(newAccum);
    }
  };

  const handleSwReset = () => {
    setSwIsRunning(false);
    setSwSeconds(0);
    localStorage.removeItem("sw_start");
    localStorage.removeItem("sw_accumulated");
    localStorage.setItem("sw_running", "false");
  };

  // --- Timer Handlers ---
  const handleTmStart = () => {
    stopAlarm();

    if (!tmIsRunning) {
      let duration = parseInt(localStorage.getItem("tm_duration"));

      if (!duration) {
        if (tmInputMinutes <= 0) return;
        duration = tmInputMinutes * 60;
        localStorage.setItem("tm_duration", duration.toString());
      }

      localStorage.setItem("tm_running", "true");
      localStorage.setItem("tm_start", Date.now().toString());
      setTmIsRunning(true);
    }
  };

  const handleTmStop = () => {
    if (tmIsRunning) {
      setTmIsRunning(false);
      const start = parseInt(localStorage.getItem("tm_start"));
      const accum = parseInt(localStorage.getItem("tm_accumulated")) || 0;
      const newAccum = accum + Math.floor((Date.now() - start) / 1000);

      localStorage.setItem("tm_accumulated", newAccum.toString());
      localStorage.setItem("tm_running", "false");
      localStorage.removeItem("tm_start");
    }
  };

  const handleTmReset = () => {
    stopAlarm(); 
    setTmIsRunning(false);
    setTmSeconds(0);
    localStorage.removeItem("tm_start");
    localStorage.removeItem("tm_accumulated");
    localStorage.removeItem("tm_duration");
    localStorage.setItem("tm_running", "false");
  };

  // --- Formatting & Styles ---
  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const containerStyle = {
    color: palette.text,
    backgroundColor: palette.bg,
    transition: "background-color 0.4s ease, color 0.4s ease",
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    minHeight: "100vh",
  };

  return (
    <>
      <style>{`
        /* --- ANIMATIONS --- */
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.9) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }

        @keyframes pulseBorder {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }

        /* --- THEMED BUTTONS --- */
        .theme-btn {
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          border-radius: 8px;
          font-weight: bold;
          border: 2px solid transparent;
        }

        .theme-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none !important;
          box-shadow: none !important;
        }

        .btn-start-custom {
          background-color: ${palette.start};
          color: ${palette.startText};
          border-color: ${palette.startBorder};
        }
        .btn-start-custom:not(:disabled):hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px ${palette.startBorder}80;
        }
        .btn-start-custom:not(:disabled):active {
          transform: scale(0.95);
        }

        .btn-stop-custom {
          background-color: ${palette.stop};
          color: ${palette.stopText};
          border-color: ${palette.stopBorder};
        }
        .btn-stop-custom:not(:disabled):hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px ${palette.stopBorder}80;
        }
        .btn-stop-custom:not(:disabled):active {
          transform: scale(0.95);
        }

        .btn-reset-custom {
          background-color: ${palette.reset};
          color: ${palette.resetText};
          border-color: ${palette.resetBorder};
        }
        .btn-reset-custom:not(:disabled):hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px ${palette.resetBorder}80;
        }
        .btn-reset-custom:not(:disabled):active {
          transform: scale(0.95);
        }

        /* --- TAB BUTTONS --- */
        .tab-btn {
          background-color: transparent;
          color: ${palette.text};
          border: 2px solid ${palette.cardBorder};
          transition: all 0.3s ease;
        }
        .tab-btn:hover {
          background-color: ${palette.cardBorder}40;
        }
        .tab-btn.active {
          background-color: ${palette.cardBorder};
          font-weight: bold;
        }

        /* --- ALARM BANNER --- */
        .alarm-banner {
          background-color: ${palette.reset};
          color: ${palette.resetText};
          border: 2px solid ${palette.resetBorder};
          animation: pulseBorder 1.5s infinite;
        }
      `}</style>

      <div className="container-fluid my-3" style={containerStyle}>
        <div
          className="card p-4 mx-auto"
          style={{
            backgroundColor: palette.card,
            color: palette.text,
            width: "100%",
            maxWidth: "420px",
            border: `2px solid ${palette.cardBorder}`,
            borderRadius: "15px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
            transition: "all 0.4s ease",
            animation: "popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards"
          }}
        >
          <div className="btn-group w-100 mb-4" role="group">
            <button
              type="button"
              className={`btn theme-btn tab-btn ${activeTab === "stopwatch" ? "active" : ""}`}
              onClick={() => setActiveTab("stopwatch")}
            >
              Stopwatch
            </button>
            <button
              type="button"
              className={`btn theme-btn tab-btn ${activeTab === "timer" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("timer");
              }}
            >
              Timer
            </button>
          </div>

          {/* --- STOPWATCH UI --- */}
          {activeTab === "stopwatch" && (
            <div style={{ animation: "popIn 0.3s ease forwards" }}>
              <h3 className="mb-4" style={{ opacity: 0.7 }}>Stopwatch</h3>
              <div className="display-3 mb-5 font-monospace fw-bold" style={{ transition: "color 0.4s ease" }}>
                {formatTime(swSeconds)}
              </div>
              <div className="d-flex justify-content-center gap-3">
                <button
                  className="btn theme-btn btn-start-custom btn-lg px-3"
                  onClick={handleSwStart}
                  disabled={swIsRunning}
                >
                  Start
                </button>
                <button
                  className="btn theme-btn btn-stop-custom btn-lg px-3"
                  style={{backgroundColor:"#fecd0a",color:"white",border:"solid #a76e18"}}
                  onClick={handleSwStop}
                  disabled={!swIsRunning}
                >
                  Stop
                </button>
                <button
                  className="btn theme-btn btn-reset-custom btn-lg px-3"
                  onClick={handleSwReset}
                >
                  Reset
                </button>
              </div>
            </div>
          )}

          {/* --- TIMER UI --- */}
          {activeTab === "timer" && (
            <div style={{ animation: "popIn 0.3s ease forwards" }}>
              <h3 className="mb-3" style={{ opacity: 0.7 }}>Countdown Timer</h3>

              {/* Visual Alarm Banner with Stop Button */}
              {timeIsUp && (
                <div
                  className="alert alarm-banner fw-bold d-flex justify-content-between align-items-center"
                  role="alert"
                >
                  <span>🔔 Time's Up!</span>
                  <button 
                    className="btn btn-sm" 
                    style={{ backgroundColor: palette.bg, color: palette.text, border: `2px solid ${palette.text}`, fontWeight: "bold" }} 
                    onClick={stopAlarm}
                  >
                    Stop Alarm
                  </button>
                </div>
              )}

              {!tmIsRunning &&
                tmSeconds === 0 &&
                !localStorage.getItem("tm_duration") &&
                !timeIsUp && (
                  <div className="input-group mb-4 w-75 mx-auto">
                    <input
                      type="number"
                      className="form-control text-center"
                      style={{ backgroundColor: palette.bg, color: palette.text, border: `2px solid ${palette.cardBorder}`, transition: "all 0.4s ease" }}
                      value={tmInputMinutes}
                      onChange={(e) =>
                        setTmInputMinutes(parseInt(e.target.value) || 0)
                      }
                      min="1"
                    />
                    <span className="input-group-text" style={{ backgroundColor: palette.cardBorder, color: palette.text, border: `2px solid ${palette.cardBorder}`, transition: "all 0.4s ease" }}>Minutes</span>
                  </div>
                )}

              <div className="display-3 mb-5 font-monospace fw-bold" style={{ transition: "color 0.4s ease" }}>
                {formatTime(tmSeconds > 0 ? tmSeconds : tmInputMinutes * 60)}
              </div>

              <div className="d-flex justify-content-center gap-3">
                <button
                  className="btn theme-btn btn-start-custom btn-lg px-3"
                  onClick={handleTmStart}
                  disabled={tmIsRunning}
                >
                  Start
                </button>
                <button
                  className="btn theme-btn btn-stop-custom btn-lg px-3"
                  onClick={handleTmStop}
                  disabled={!tmIsRunning}
                >
                  Stop
                </button>
                <button
                  className="btn theme-btn btn-reset-custom btn-lg px-3"
                  onClick={handleTmReset}
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}