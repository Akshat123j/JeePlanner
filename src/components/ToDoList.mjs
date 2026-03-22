import React, { useState, useEffect, useRef, useCallback } from 'react';

const getKey = (email) => `tasks_${email}`;

export default function ScheduledTodoList(props) {
  const isLight = props.mode === 'light';
  const [userEmail] = useState(() => localStorage.getItem("userEmail"));
  const [tasks, setTasks] = useState(() => {
    const email = localStorage.getItem("userEmail");
    if (!email) return [];
    return JSON.parse(localStorage.getItem(getKey(email)) || '[]');
  });
  const [taskTitle, setTaskTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [formError, setFormError] = useState('');
  const [activeAlarm, setActiveAlarm] = useState(null);
  const audioRef = useRef(null);
  const alarmFiredRef = useRef(new Set());

  const palette = {
    bg: isLight ? "#ffffff" : "#212529",
    text: isLight ? "#111827" : "#f9fafb",
    card: isLight ? "#f3f4f6" : "#1f2937",
    cardBorder: isLight ? "#d1d5db" : "#374151",
    pending: "#eab308", active: "#22c55e",
    completed: "#a855f7", uncomplete: "#ef4444"
  };

  // Save to localStorage whenever tasks change
  useEffect(() => {
    if (userEmail) localStorage.setItem(getKey(userEmail), JSON.stringify(tasks));
  }, [tasks, userEmail]);

  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audioRef.current.loop = true;
    return () => { if (audioRef.current) audioRef.current.pause(); };
  }, []);

  const updateStatus = useCallback((taskId, newStatus) => {
    setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
  }, []);

  // Alarm engine
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTasks(prev => {
        let changed = false;
        const updated = prev.map(task => {
          if (task.status === 'completed' || task.status === 'uncomplete') return task;
          const startKey = `${task._id}_start`;
          const endKey = `${task._id}_end`;
          if (now >= task.startTimeMs && task.status === 'pending' && !alarmFiredRef.current.has(startKey)) {
            alarmFiredRef.current.add(startKey);
            triggerAlarm(task, 'START');
            changed = true;
            return { ...task, status: 'active' };
          }
          if (now >= task.endTimeMs && task.status === 'active' && !alarmFiredRef.current.has(endKey)) {
            alarmFiredRef.current.add(endKey);
            triggerAlarm(task, 'DEADLINE');
            changed = true;
            return { ...task, status: 'uncomplete' };
          }
          return task;
        });
        return changed ? updated : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const triggerAlarm = (task, type) => {
    if (audioRef.current) audioRef.current.play().catch(() => {});
    setActiveAlarm({ taskId: task._id, title: task.title, type });
  };

  const stopAlarm = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    setActiveAlarm(null);
  };

  const addTask = (e) => {
    e.preventDefault();
    setFormError('');
    const startMs = new Date(startTime).getTime();
    const endMs = new Date(endTime).getTime();
    if (endMs <= startMs) { setFormError("End time must be after start time."); return; }
    const newTask = {
      _id: Date.now().toString(),
      title: taskTitle, startTimeMs: startMs, endTimeMs: endMs, status: 'pending'
    };
    setTasks(prev => [newTask, ...prev]);
    setTaskTitle(''); setStartTime(''); setEndTime('');
  };

  const formatDateTime = (ms) => new Date(ms).toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="p-4 rounded shadow" style={{ backgroundColor: palette.card, color: palette.text }}>
      <h3 className="text-center mb-4 fw-bold">📋 Task Performance Tracker</h3>

      {activeAlarm && (
        <div className="alert d-flex justify-content-between align-items-center mb-4 shadow"
          style={{ backgroundColor: activeAlarm.type === 'START' ? palette.active : palette.uncomplete, color: '#fff', borderRadius: '10px' }}>
          <span><strong>{activeAlarm.type === 'START' ? '⏰ Started' : '❌ Missed'}:</strong> {activeAlarm.title}</span>
          <button className="btn btn-light btn-sm fw-bold" onClick={stopAlarm}>STOP</button>
        </div>
      )}

      <form onSubmit={addTask} className="mb-4 p-3 border rounded shadow-sm"
        style={{ borderColor: palette.cardBorder, backgroundColor: palette.bg }}>
        <h6 className="fw-bold mb-3">Add New Task</h6>
        {formError && <div className="alert alert-danger py-2 small fw-bold">{formError}</div>}
        <input type="text" className="form-control mb-2" placeholder="Task Name" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} required />
        <div className="row g-2">
          <div className="col-6">
            <label className="form-label small fw-bold text-muted">Start Time</label>
            <input type="datetime-local" className="form-control" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
          </div>
          <div className="col-6">
            <label className="form-label small fw-bold text-muted">End Time</label>
            <input type="datetime-local" className="form-control" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
          </div>
        </div>
        <button type="submit" className="btn btn-primary w-100 mt-3 fw-bold">➕ Add Task</button>
      </form>

      {tasks.length === 0 ? (
        <div className="text-center py-4 text-muted">
          <i className="bi bi-clipboard-check display-4 opacity-50"></i>
          <p className="mt-2">No tasks yet. Add one above!</p>
        </div>
      ) : (
        <div className="list-group mt-2">
          {tasks.map(task => (
            <div key={task._id} className="list-group-item d-flex justify-content-between align-items-center mb-2 rounded"
              style={{ backgroundColor: palette.bg, color: palette.text, borderLeft: `5px solid ${palette[task.status] || palette.pending}`, border: `1px solid ${palette.cardBorder}`, borderLeftWidth: '5px' }}>
              <div>
                <h6 className="mb-0 fw-bold">{task.title}</h6>
                <small className="text-muted">{formatDateTime(task.startTimeMs)} → {formatDateTime(task.endTimeMs)}</small>
                <div className="mt-1">
                  <span className="badge text-uppercase" style={{ fontSize: '0.6rem', border: `1px solid ${palette[task.status]}`, color: palette[task.status], backgroundColor: 'transparent' }}>{task.status}</span>
                </div>
              </div>
              {task.status !== 'completed' && task.status !== 'uncomplete' && (
                <button className="btn btn-sm btn-success fw-bold px-3" onClick={() => { updateStatus(task._id, 'completed'); if (activeAlarm?.taskId === task._id) stopAlarm(); }}>✓ DONE</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}