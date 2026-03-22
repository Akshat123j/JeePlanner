import React, { useState, useEffect, useRef } from 'react';

const getKey = (email, type) => `timetable_${type}_${email}`;

const DEFAULT_SLOTS = [
  { start: "09:00", end: "10:00" },
  { start: "11:00", end: "12:00" },
  { start: "14:00", end: "15:00" }
];

export default function Timetable(props) {
  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  const userEmail = localStorage.getItem("userEmail") || "guest";

  const [timeSlots, setTimeSlots] = useState(() =>
    JSON.parse(localStorage.getItem(getKey(userEmail, 'slots')) || 'null') || DEFAULT_SLOTS
  );
  const [data, setData] = useState(() =>
    JSON.parse(localStorage.getItem(getKey(userEmail, 'data')) || '{}')
  );
  const [newStartTime, setNewStartTime] = useState("");
  const [newEndTime, setNewEndTime] = useState("");
  const [slotError, setSlotError] = useState('');
  const [saveStatus, setSaveStatus] = useState('');

  const latestData = useRef(data);
  const latestSlots = useRef(timeSlots);

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem(getKey(userEmail, 'slots'), JSON.stringify(timeSlots));
    localStorage.setItem(getKey(userEmail, 'data'), JSON.stringify(data));
    setSaveStatus('saved');
    const t = setTimeout(() => setSaveStatus(''), 1500);
    return () => clearTimeout(t);
  }, [timeSlots, data, userEmail]);

  const addTimeSlot = (e) => {
    e.preventDefault();
    setSlotError('');
    if (newEndTime <= newStartTime) { setSlotError("End time must be after start time."); return; }
    const slotId = `${newStartTime}-${newEndTime}`;
    if (timeSlots.some(s => `${s.start}-${s.end}` === slotId)) { setSlotError("Slot already exists."); return; }
    const updated = [...timeSlots, { start: newStartTime, end: newEndTime }].sort((a,b) => a.start.localeCompare(b.start));
    latestSlots.current = updated;
    setTimeSlots(updated);
    setNewStartTime(""); setNewEndTime("");
  };

  const deleteColumn = (slotObj) => {
    if (!window.confirm(`Delete slot ${slotObj.start} – ${slotObj.end}?`)) return;
    const slotId = `${slotObj.start}-${slotObj.end}`;
    const updatedSlots = timeSlots.filter(s => `${s.start}-${s.end}` !== slotId);
    const newData = { ...data };
    days.forEach(day => delete newData[`${day}-${slotId}`]);
    latestSlots.current = updatedSlots;
    latestData.current = newData;
    setTimeSlots(updatedSlots);
    setData(newData);
  };

  const updateCell = (day, slotId, value) => {
    const newData = { ...data, [`${day}-${slotId}`]: value };
    latestData.current = newData;
    setData(newData);
  };

  const isDark = props.mode === 'dark';

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: isDark?"#000":"#f4f7f6", minHeight:"100vh" }}>
      <div className="container p-4 rounded-4 shadow" style={{ backgroundColor: isDark?"#1a1d20":"#ffffff", color: isDark?"white":"#212529" }}>

        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <h2 className="fw-bold m-0 text-primary">📅 Smart Weekly Planner</h2>
          {saveStatus === 'saved' && <span className="text-success small fw-bold">✅ Saved!</span>}
        </div>

        <form onSubmit={addTimeSlot} className={`mb-4 d-flex justify-content-center align-items-center gap-3 p-3 rounded flex-wrap shadow-sm ${isDark?'bg-secondary bg-opacity-10 border border-secondary':'bg-light'}`}>
          <div className="d-flex align-items-center gap-2">
            <label className="fw-bold small mb-0">Start:</label>
            <input type="time" className={`form-control form-control-sm w-auto ${isDark?'bg-dark text-white border-secondary':''}`}
              value={newStartTime} onChange={(e)=>{setNewStartTime(e.target.value);setSlotError('');}} required />
          </div>
          <div className="d-flex align-items-center gap-2">
            <label className="fw-bold small mb-0">End:</label>
            <input type="time" className={`form-control form-control-sm w-auto ${isDark?'bg-dark text-white border-secondary':''}`}
              value={newEndTime} onChange={(e)=>{setNewEndTime(e.target.value);setSlotError('');}} required />
          </div>
          <button type="submit" className="btn btn-primary btn-sm px-4">
            <i className="bi bi-plus-lg me-1"></i> Add Slot
          </button>
          {slotError && <div className="w-100 text-center"><small className="text-danger fw-bold">{slotError}</small></div>}
        </form>

        {timeSlots.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-calendar-week display-4 opacity-50"></i>
            <p className="mt-3">No slots yet. Add your first above!</p>
          </div>
        ) : (
          <div className="table-responsive shadow-sm rounded">
            <table className={`table table-bordered align-middle m-0 ${isDark?'table-dark table-hover':'table-light'}`}>
              <thead className={isDark?'table-secondary text-dark':'table-primary'}>
                <tr>
                  <th style={{ width:'130px' }}>Day \ Time</th>
                  {timeSlots.map((slot, i) => (
                    <th key={i} className="text-center p-2">
                      <div className="d-flex flex-column align-items-center">
                        <span className="fw-bold text-primary" style={{ fontSize:'0.8rem' }}>{slot.start}</span>
                        <span className="text-muted" style={{ fontSize:'0.65rem' }}>to</span>
                        <span className="fw-bold text-primary" style={{ fontSize:'0.8rem' }}>{slot.end}</span>
                        <button className="btn btn-sm btn-link text-danger p-0 mt-1" onClick={() => deleteColumn(slot)}>
                          <i className="bi bi-x-circle"></i>
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map(day => (
                  <tr key={day}>
                    <td className="fw-bold text-info">{day}</td>
                    {timeSlots.map(slot => {
                      const slotId = `${slot.start}-${slot.end}`;
                      return (
                        <td key={`${day}-${slotId}`} className="p-0">
                          <input type="text"
                            className={`form-control border-0 text-center shadow-none py-3 ${isDark?'bg-dark text-white':''}`}
                            placeholder="—"
                            value={data[`${day}-${slotId}`] || ""}
                            onChange={(e) => updateCell(day, slotId, e.target.value)}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// REACT_APP_GEMINI_KEY='AIzaSyBkGcYogu3CvsTvO2KhXMPWlxmZrN7SDg0';