import React, { useState, useMemo, useEffect, useRef } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const getLocalDateString = (date) => {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split("T")[0];
};

const getStorageKey = (email, type) => `attendance_${type}_${email}`;

export default function AttendanceTracker(props) {
  const isLight = props.mode === "light";
  const userEmail = localStorage.getItem("userEmail") || "guest";

  const [startDate, setStartDate] = useState(() =>
    localStorage.getItem(getStorageKey(userEmail, 'startDate')) || "2026-01-01"
  );
  const [records, setRecords] = useState(() =>
    JSON.parse(localStorage.getItem(getStorageKey(userEmail, 'records')) || '{}')
  );

  // Save on every change
  useEffect(() => {
    localStorage.setItem(getStorageKey(userEmail, 'startDate'), startDate);
  }, [startDate, userEmail]);

  useEffect(() => {
    localStorage.setItem(getStorageKey(userEmail, 'records'), JSON.stringify(records));
  }, [records, userEmail]);

  const palette = {
    bg: isLight ? "#ffffff" : "#212529",
    text: isLight ? "#111827" : "#f9fafb",
    card: isLight ? "#f3f4f6" : "#1f2937",
    cardBorder: isLight ? "#d1d5db" : "#374151",
    present: "#22c55e", presentBorder: "#16a34a", presentText: "#ffffff",
    presentBgLight: isLight ? "#dcfce7" : "#14532d",
    absent: "#ef4444", absentBorder: "#dc2626", absentText: "#ffffff",
    absentBgLight: isLight ? "#fee2e2" : "#7f1d1d",
    holiday: "#eab308", holidayBorder: "#ca8a04", holidayText: "#000000",
    holidayBgLight: isLight ? "#fef9c3" : "#713f12",
  };

  const [popover, setPopover] = useState({ show: false, x: 0, y: 0, date: null });
  const lastClickRef = useRef({ dateStr: null, time: 0 });

  const stats = useMemo(() => {
    if (!startDate) return { total: 0, attended: 0, percentage: 0, absences: [], holidays: [] };
    const start = new Date(startDate);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    let totalClasses = 0, attendedClasses = 0;
    const absencesList = [], holidaysList = [];
    const fixedHolidays = ["01-26", "08-15", "10-02", "12-25"];
    const festivalHolidays2026 = ["2026-01-14","2026-02-15","2026-03-03","2026-03-20","2026-03-26","2026-04-03","2026-08-28","2026-09-04","2026-09-14","2026-10-19","2026-11-08","2026-11-09","2026-11-24"];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = getLocalDateString(d);
      const record = records[dateStr];
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      const isPublicHoliday = fixedHolidays.includes(dateStr.substring(5)) || festivalHolidays2026.includes(dateStr);
      if (record) {
        if (record === "present") { totalClasses++; attendedClasses++; }
        else if (record === "absent") { totalClasses++; absencesList.push(dateStr); }
        else if (record === "holiday") { holidaysList.push(dateStr); }
      } else {
        if (isPublicHoliday) holidaysList.push(dateStr);
        else if (!isWeekend) { totalClasses++; attendedClasses++; }
      }
    }
    const percentage = totalClasses === 0 ? 0 : (attendedClasses / totalClasses) * 100;
    return { total: totalClasses, attended: attendedClasses, percentage: percentage.toFixed(1), absences: absencesList, holidays: holidaysList };
  }, [startDate, records]);

  const handleDateClick = (date, e) => {
    const now = Date.now();
    const dateStr = getLocalDateString(date);
    const last = lastClickRef.current;
    if (last.dateStr === dateStr && now - last.time < 400) {
      const rect = e.target.getBoundingClientRect();
      setPopover({ show: true, x: rect.left + window.scrollX, y: rect.bottom + window.scrollY + 8, date });
    }
    lastClickRef.current = { dateStr, time: now };
  };

  const handleRightClick = (date, e) => {
    e.preventDefault();
    setPopover({ show: true, x: e.clientX, y: e.clientY, date });
  };

  const setStatusFromMenu = (status) => {
    if (!popover.date) return;
    const dateStr = getLocalDateString(popover.date);
    setRecords(prev => {
      const n = { ...prev };
      if (status) n[dateStr] = status; else delete n[dateStr];
      return n;
    });
    setPopover(p => ({ ...p, show: false }));
  };

  const getTileClassName = ({ date, view }) => {
    if (view === "month") {
      const dateStr = getLocalDateString(date);
      if (records[dateStr]) return `status-${records[dateStr]}`;
    }
    return null;
  };

  const btnStyle = (bg, text, border) => ({
    backgroundColor: bg, color: text, border: `2px solid ${border}`,
    borderRadius: "8px", padding: "10px", fontWeight: "bold",
    cursor: "pointer", transition: "all 0.2s ease", width: "100%"
  });

  return (
    <div className="container" style={{ backgroundColor: palette.bg, color: palette.text, minHeight: "100vh", paddingBottom: "2rem" }}>
      <style>{`
        @keyframes popInTile { 0%{transform:scale(0.8);opacity:0.5} 100%{transform:scale(1);opacity:1} }
        .react-calendar { border-radius:12px; border:2px solid ${palette.cardBorder}!important; background-color:${palette.card}!important; color:${palette.text}!important; width:100%!important; }
        .react-calendar__navigation button { color:${palette.text}!important; }
        .react-calendar__navigation button:enabled:hover { background-color:${palette.cardBorder}!important; border-radius:8px; }
        .react-calendar__tile { transition:transform 0.2s ease,background-color 0.3s ease!important; color:${palette.text}; border:2px solid transparent!important; }
        .react-calendar__tile:enabled:hover { background-color:${palette.cardBorder}!important; border-radius:6px; transform:scale(1.08); }
        .react-calendar__tile.status-present { background-color:${palette.present}!important; color:#fff!important; border:2px solid ${palette.presentBorder}!important; border-radius:8px; font-weight:bold; animation:popInTile 0.3s ease; }
        .react-calendar__tile.status-absent { background-color:${palette.absent}!important; color:#fff!important; border:2px solid ${palette.absentBorder}!important; border-radius:8px; font-weight:bold; animation:popInTile 0.3s ease; }
        .react-calendar__tile.status-holiday { background-color:${palette.holiday}!important; color:#000!important; border:2px solid ${palette.holidayBorder}!important; border-radius:8px; font-weight:bold; animation:popInTile 0.3s ease; }
      `}</style>

      {popover.show && (
        <>
          <div onClick={() => setPopover(p => ({ ...p, show: false }))}
            style={{ position:"fixed", inset:0, zIndex:40, backgroundColor:"rgba(0,0,0,0.4)", backdropFilter:"blur(2px)" }} />
          <div style={{ position:"fixed", top:`clamp(16px,${popover.y}px,calc(100vh - 260px))`, left:`clamp(16px,${popover.x}px,calc(100vw - 210px))`, zIndex:50, backgroundColor: isLight?"#fff":"#1f2937", color:palette.text, border:`2px solid ${palette.cardBorder}`, borderRadius:"16px", display:"flex", flexDirection:"column", gap:"10px", padding:"20px", width:"13rem", boxShadow:"0 20px 40px rgba(0,0,0,0.3)" }}>
            <p style={{ margin:0, textAlign:"center", fontWeight:"bold" }}>📅 {getLocalDateString(popover.date)}</p>
            <button style={btnStyle(palette.present, "#fff", palette.presentBorder)} onClick={() => setStatusFromMenu("present")}>✅ Present</button>
            <button style={btnStyle(palette.absent, "#fff", palette.absentBorder)} onClick={() => setStatusFromMenu("absent")}>❌ Absent</button>
            <button style={btnStyle(palette.holiday, "#000", palette.holidayBorder)} onClick={() => setStatusFromMenu("holiday")}>🎉 Holiday</button>
            <button style={btnStyle("transparent", palette.text, palette.cardBorder)} onClick={() => setStatusFromMenu(null)}>↩ Reset</button>
          </div>
        </>
      )}

      <h1 className="fw-bold mb-4 mt-4 text-center fs-3">📅 Semester Attendance Tracker</h1>
      <div className="row">
        <div className="col-md-6 mb-4">
          <h5 className="fw-semibold mb-3">Calendar Log</h5>
          <div className="mb-3 small">
            <p className="fw-bold mb-1">Instructions:</p>
            <ul className="ps-3">
              <li>Double-click or Right-click a date to mark it</li>
              <li><span style={{ backgroundColor:palette.present, color:"#fff", borderRadius:"4px", padding:"1px 6px", fontSize:"0.7rem", fontWeight:"bold" }}>Present</span> = Class attended</li>
              <li><span style={{ backgroundColor:palette.absent, color:"#fff", borderRadius:"4px", padding:"1px 6px", fontSize:"0.7rem", fontWeight:"bold" }}>Absent</span> = Missed class</li>
              <li><span style={{ backgroundColor:palette.holiday, color:"#000", borderRadius:"4px", padding:"1px 6px", fontSize:"0.7rem", fontWeight:"bold" }}>Holiday</span> = No class</li>
            </ul>
          </div>
          <Calendar onClickDay={handleDateClick} tileClassName={getTileClassName}
            tileContent={({ date, view }) => view === "month" ? <div style={{ width:"100%", height:"100%" }} onContextMenu={(e) => handleRightClick(date, e)} /> : null} />
        </div>

        <div className="col-md-6">
          <h5 className="fw-semibold mb-3">Settings</h5>
          <div className="mb-4">
            <label className="form-label small fw-bold">Semester Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="form-control"
              style={{ backgroundColor:palette.card, color:palette.text, border:`2px solid ${palette.cardBorder}` }} />
          </div>
          <h5 className="fw-semibold mb-3">Statistics</h5>
          <div className="row g-2 mb-4">
            <div className="col-4">
              <div className="p-3 rounded text-center" style={{ border:`2px solid ${palette.cardBorder}`, backgroundColor:palette.card }}>
                <div className="small fw-bold text-muted">Expected</div>
                <div className="fs-4 fw-bold">{stats.total}</div>
              </div>
            </div>
            <div className="col-4">
              <div className="p-3 rounded text-center" style={{ border:`2px solid ${palette.presentBorder}`, backgroundColor:palette.presentBgLight }}>
                <div className="small fw-bold" style={{ color:palette.present }}>Attended</div>
                <div className="fs-4 fw-bold">{stats.attended}</div>
              </div>
            </div>
            <div className="col-4">
              <div className="p-3 rounded text-center" style={{ border:`2px solid ${palette.absentBorder}`, backgroundColor:palette.absentBgLight }}>
                <div className="small fw-bold" style={{ color:palette.absent }}>Missed</div>
                <div className="fs-4 fw-bold">{stats.absences.length}</div>
              </div>
            </div>
          </div>
          <div className="text-center p-4 rounded" style={{ backgroundColor:palette.card, border:`2px solid ${palette.cardBorder}`, borderRadius:"16px" }}>
            <p className="fw-bold mb-1">Current Attendance</p>
            <p className="display-5 fw-bolder mb-3" style={{ color: stats.percentage >= 75 ? palette.present : palette.absent }}>
              {stats.percentage}%
            </p>
            <label className="fw-bold small mb-1 d-block">Progress to 75% Goal</label>
            <progress value={stats.percentage} max={100} style={{ width:"100%", height:"12px", accentColor: stats.percentage >= 75 ? palette.present : palette.absent }} />
            {stats.percentage < 75 && stats.total > 0 && (
              <p className="small fw-bold mt-3 mb-0" style={{ color:palette.absent }}>
                ⚠️ Attend {Math.ceil((0.75 * stats.total - stats.attended) / 0.25)} more classes to reach 75%
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}