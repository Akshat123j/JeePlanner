import React, { useState, useEffect, useMemo } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function StudyTrends(props) {
  const isLight = props.mode === 'light';
  const userEmail = localStorage.getItem("userEmail");
  const [tasks, setTasks] = useState([]);
  const [timeframe, setTimeframe] = useState('weekly');

  useEffect(() => {
    if (!userEmail) return;
    const saved = JSON.parse(localStorage.getItem(`tasks_${userEmail}`) || '[]');
    setTasks(saved);
  }, [userEmail]);

  const palette = {
    bg: isLight ? "#ffffff" : "#212529", text: isLight ? "#111827" : "#f9fafb",
    card: isLight ? "#f3f4f6" : "#1f2937", cardBorder: isLight ? "#d1d5db" : "#374151",
    primary: "#3b82f6", primaryLight: isLight ? "#dbeafe" : "#1e3a8a",
    grid: isLight ? "#e5e7eb" : "#374151", tooltipBg: isLight ? "#ffffff" : "#1f2937"
  };

  const chartData = useMemo(() => {
    const now = new Date(); now.setHours(0,0,0,0);
    const dailyTotals = {};
    for (let i = 0; i < 28; i++) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      dailyTotals[dateKey] = { dateObj: d, hours: 0, daysAgo: i };
    }
    tasks.forEach(task => {
      if (task.status !== 'completed' || !task.startTimeMs || !task.endTimeMs) return;
      const td = new Date(task.startTimeMs);
      const dateKey = `${td.getFullYear()}-${String(td.getMonth()+1).padStart(2,'0')}-${String(td.getDate()).padStart(2,'0')}`;
      if (dailyTotals[dateKey]) dailyTotals[dateKey].hours += Math.min((task.endTimeMs - task.startTimeMs) / 3600000, 24);
    });

    if (timeframe === 'weekly') {
      return Array.from({length:7}, (_,i) => 6-i).map(i => {
        const d = Object.values(dailyTotals).find(x => x.daysAgo === i);
        return d ? { label: d.dateObj.toLocaleDateString([],{weekday:'short'}), hours: Number(d.hours.toFixed(1)) } : null;
      }).filter(Boolean);
    } else {
      const weeks = { 'Week 1':0, 'Week 2':0, 'Week 3':0, 'This Week':0 };
      Object.values(dailyTotals).forEach(d => {
        if (d.daysAgo <= 6) weeks['This Week'] += d.hours;
        else if (d.daysAgo <= 13) weeks['Week 3'] += d.hours;
        else if (d.daysAgo <= 20) weeks['Week 2'] += d.hours;
        else weeks['Week 1'] += d.hours;
      });
      return Object.entries(weeks).map(([label, hours]) => ({ label, hours: Number(hours.toFixed(1)) }));
    }
  }, [tasks, timeframe]);

  const totalHours = Number(chartData.reduce((s,i) => s+i.hours, 0).toFixed(1));
  const avgHours = (totalHours / (timeframe === 'weekly' ? 7 : 28)).toFixed(1);

  return (
    <div className="container py-4" style={{ backgroundColor:palette.bg }}>
      <div className="card shadow-lg p-4 mx-auto border-0" style={{ backgroundColor:palette.card, color:palette.text, maxWidth:'900px', borderRadius:'15px' }}>
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <h3 className="fw-bold m-0">Study Hours Trend</h3>
          <div className="btn-group">
            <button className={`btn ${timeframe==='weekly'?'btn-primary':isLight?'btn-light':'btn-dark'} fw-bold`} onClick={()=>setTimeframe('weekly')}>Weekly</button>
            <button className={`btn ${timeframe==='monthly'?'btn-primary':isLight?'btn-light':'btn-dark'} fw-bold`} onClick={()=>setTimeframe('monthly')}>Monthly</button>
          </div>
        </div>
        <div className="row mb-4 text-center">
          <div className="col-6">
            <div className="p-3 rounded" style={{ backgroundColor:palette.primaryLight, border:`1px solid ${palette.primary}40` }}>
              <h6 className="text-uppercase mb-1 fw-bold" style={{ color:palette.primary }}>Total Hours</h6>
              <h2 className="m-0 fw-bolder">{totalHours} <span className="fs-6 fw-normal text-muted">hrs</span></h2>
            </div>
          </div>
          <div className="col-6">
            <div className="p-3 rounded" style={{ backgroundColor:palette.primaryLight, border:`1px solid ${palette.primary}40` }}>
              <h6 className="text-uppercase mb-1 fw-bold" style={{ color:palette.primary }}>Daily Average</h6>
              <h2 className="m-0 fw-bolder">{avgHours} <span className="fs-6 fw-normal text-muted">hrs/day</span></h2>
            </div>
          </div>
        </div>
        {totalHours > 0 ? (
          <div style={{ width:'100%', height:350 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top:10, right:10, left:-20, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={palette.grid} vertical={false} />
                <XAxis dataKey="label" stroke={palette.text} fontSize={12} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis stroke={palette.text} fontSize={12} axisLine={false} tickLine={false} tickFormatter={v=>`${v}h`} />
                <Tooltip contentStyle={{ backgroundColor:palette.tooltipBg, borderColor:palette.cardBorder, color:palette.text, borderRadius:'8px' }}
                  itemStyle={{ color:palette.primary, fontWeight:'bold' }} formatter={v=>[`${v} Hours`,'Studied']} />
                <Bar dataKey="hours" fill={palette.primary} radius={[4,4,0,0]} animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-5 border rounded" style={{ borderColor:palette.cardBorder }}>
            <i className="bi bi-bar-chart text-muted display-4 opacity-50"></i>
            <p className="mt-3 text-muted">Complete some tasks to see your trends here!</p>
          </div>
        )}
      </div>
    </div>
  );
}