import { useState, useEffect, useRef, useCallback } from "react";

const SUBJECTS = {
  Physics: {
    color: "#00d4ff",
    icon: "⚛",
    topics: ["Mechanics", "Thermodynamics", "Electromagnetism", "Optics", "Modern Physics", "Waves & Sound"],
  },
  Chemistry: {
    color: "#39ff14",
    icon: "⚗",
    topics: ["Physical Chemistry", "Organic Chemistry", "Inorganic Chemistry", "Electrochemistry", "Chemical Kinetics", "Equilibrium"],
  },
  Mathematics: {
    color: "#ff6b35",
    icon: "∑",
    topics: ["Calculus", "Algebra", "Coordinate Geometry", "Trigonometry", "Vectors & 3D", "Probability"],
  },
};

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #060810; --surface: #0d1117; --surface2: #161b27; --border: #1e2535;
    --text: #e8eaf0; --muted: #6b7594; --accent: #7c3aed;
    --danger: #ff3b5c; --success: #10b981; --warning: #f59e0b;
  }
  body { background: var(--bg); color: var(--text); font-family: 'Syne', sans-serif; }
  .app { min-height: 100vh; position: relative; overflow-x: hidden; }
  .grid-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image: linear-gradient(rgba(124,58,237,.03)1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,.03)1px,transparent 1px);
    background-size: 40px 40px; }
  .wrap { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; padding: 0 20px; }

  /* ── INITIAL LOADER ── */
  .init-loader { position: fixed; inset: 0; background: var(--bg); z-index: 9999; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .init-logo { font-size: 32px; display: flex; align-items: center; gap: 16px; margin-bottom: 30px; animation: initPulse 2s infinite ease-in-out; }
  .init-logo-mark { width: 56px; height: 56px; background: linear-gradient(135deg, var(--accent), #06b6d4); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-family: 'Space Mono', monospace; font-size: 20px; font-weight: 700; color: white; box-shadow: 0 0 30px rgba(124,58,237,0.3); }
  .init-logo-text { font-size: 28px; font-weight: 800; letter-spacing: -1px; }
  .init-logo-text span { color: var(--accent); }
  .init-bar { width: 200px; height: 4px; background: var(--surface2); border-radius: 2px; overflow: hidden; position: relative; }
  .init-fill { position: absolute; top: 0; left: 0; height: 100%; width: 50%; background: linear-gradient(90deg, transparent, var(--accent), transparent); animation: initSweep 1.5s infinite linear; }
  @keyframes initPulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.8; transform: scale(0.98); } }
  @keyframes initSweep { 0% { left: -50%; } 100% { left: 100%; } }

  /* ── QUIZ GENERATION LOADER ── */
  .qgen-loader { position: fixed; inset: 0; background: var(--bg); z-index: 9000; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0; }
  .qgen-orbit { position: relative; width: 120px; height: 120px; margin-bottom: 40px; }
  .qgen-core { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
  .qgen-core-inner { width: 48px; height: 48px; background: linear-gradient(135deg, var(--accent), #06b6d4); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-family: 'Space Mono', monospace; font-size: 16px; font-weight: 700; color: white; animation: corePulse 2s infinite ease-in-out; }
  .qgen-ring { position: absolute; inset: 0; border: 2px solid transparent; border-top-color: var(--accent); border-radius: 50%; animation: spin 1.4s linear infinite; }
  .qgen-ring2 { position: absolute; inset: 8px; border: 1px solid transparent; border-bottom-color: #06b6d4; border-radius: 50%; animation: spin 2s linear infinite reverse; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes corePulse { 0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(124,58,237,0)} 50%{transform:scale(1.06);box-shadow:0 0 0 10px rgba(124,58,237,0)} }

  .qgen-title { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 6px; }
  .qgen-title span { color: var(--accent); }
  .qgen-sub { font-size: 13px; color: var(--muted); font-family: 'Space Mono', monospace; margin-bottom: 36px; }

  .qgen-steps { display: flex; flex-direction: column; gap: 10px; width: 320px; }
  .qgen-step { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; transition: all .3s; }
  .qgen-step.done { border-color: rgba(16,185,129,.3); background: rgba(16,185,129,.04); }
  .qgen-step.active { border-color: rgba(124,58,237,.4); background: rgba(124,58,237,.06); animation: stepGlow .8s ease-in-out infinite alternate; }
  @keyframes stepGlow { from { border-color: rgba(124,58,237,.3); } to { border-color: rgba(124,58,237,.6); } }
  .qgen-step-icon { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0; background: var(--border); transition: all .3s; }
  .qgen-step.done .qgen-step-icon { background: rgba(16,185,129,.15); }
  .qgen-step.active .qgen-step-icon { background: rgba(124,58,237,.2); }
  .qgen-step-info { flex: 1; }
  .qgen-step-label { font-size: 13px; font-weight: 700; color: var(--muted); transition: color .3s; }
  .qgen-step.done .qgen-step-label { color: var(--success); }
  .qgen-step.active .qgen-step-label { color: var(--text); }
  .qgen-step-detail { font-size: 11px; color: var(--muted); font-family: 'Space Mono', monospace; margin-top: 2px; opacity: 0; transition: opacity .3s; }
  .qgen-step.active .qgen-step-detail, .qgen-step.done .qgen-step-detail { opacity: 1; }
  .qgen-step-check { font-size: 14px; opacity: 0; transition: opacity .3s; }
  .qgen-step.done .qgen-step-check { opacity: 1; }

  .qgen-progress { width: 320px; margin-top: 28px; }
  .qgen-prog-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px; font-family: 'Space Mono', monospace; }
  .qgen-prog-label { color: var(--muted); }
  .qgen-prog-val { color: var(--accent); }
  .qgen-prog-track { width: 100%; height: 4px; background: var(--surface2); border-radius: 2px; overflow: hidden; }
  .qgen-prog-fill { height: 100%; background: linear-gradient(90deg, var(--accent), #06b6d4); border-radius: 2px; transition: width .4s ease; }

  /* ── QUESTION SKELETON ── */
  .qskel { animation: skelFade 1.4s ease-in-out infinite; }
  @keyframes skelFade { 0%,100%{opacity:.5} 50%{opacity:1} }
  .skel-block { background: var(--surface2); border-radius: 8px; }
  .skel-line { height: 14px; border-radius: 6px; background: var(--border); margin-bottom: 10px; }

  /* ── HEADER ── */
  .hdr { padding: 20px 0; border-bottom: 1px solid var(--border); margin-bottom: 32px; }
  .hdr-inner { display: flex; align-items: center; justify-content: space-between; }
  .logo { display: flex; align-items: center; gap: 12px; }
  .logo-mark { width: 36px; height: 36px; background: linear-gradient(135deg,var(--accent),#06b6d4); border-radius: 8px;
    display: flex; align-items: center; justify-content: center; font-family: 'Space Mono',monospace; font-size: 14px; font-weight: 700; color: white; }
  .logo-text { font-size: 18px; font-weight: 800; letter-spacing: -.5px; }
  .logo-text span { color: var(--accent); }
  .nav-tabs { display: flex; gap: 4px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 4px; }
  .nav-tab { padding: 8px 20px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all .15s;
    color: var(--muted); border: none; background: transparent; font-family: 'Syne',sans-serif; }
  .nav-tab.active { background: var(--surface2); color: var(--text); }
  .pill { display: flex; align-items: center; gap: 6px; background: var(--surface2); border: 1px solid var(--border);
    border-radius: 20px; padding: 6px 14px; font-size: 12px; font-family: 'Space Mono',monospace; }
  .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--success); box-shadow: 0 0 6px var(--success); animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }

  /* ── DASHBOARD ── */
  .dgrid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 28px; }
  .sc { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 24px;
    cursor: pointer; transition: all .2s; position: relative; overflow: hidden; }
  .sc::before { content:''; position:absolute; top:0;left:0;right:0;height:3px; background:var(--cc); opacity:0; transition:opacity .2s; }
  .sc:hover { border-color: var(--cc); transform: translateY(-2px); } .sc:hover::before { opacity:1; }
  .sc.active { border-color: var(--cc); background: var(--surface2); } .sc.active::before { opacity:1; }
  .ci { font-size: 28px; margin-bottom: 12px; } .ct { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
  .cs { font-size: 12px; color: var(--muted); font-family: 'Space Mono',monospace; }
  .cst { margin-top: 16px; display: flex; align-items: center; gap: 8px; }
  .sbar { flex:1;height:3px;background:var(--border);border-radius:2px;overflow:hidden; }
  .sfill { height:100%;background:var(--cc);border-radius:2px;transition:width .5s; }
  .spct { font-size:11px;font-family:'Space Mono',monospace;color:var(--cc); }

  /* ── TOPICS ── */
  .section-header { display:flex;align-items:center;justify-content:space-between;margin-bottom:16px; }
  .section-title { font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:var(--muted); }
  .tgrid { display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:28px; }
  .tc { background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:12px 16px;cursor:pointer;
    transition:all .15s;font-size:13px;font-weight:600;display:flex;align-items:center;justify-content:space-between; }
  .tc:hover { border-color:var(--ac); } .tc.sel { background:var(--surface2);border-color:var(--ac);color:var(--ac); }
  .tw { font-size:10px;color:var(--danger);font-family:'Space Mono',monospace; }

  /* ── START PANEL ── */
  .sp { background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:32px;text-align:center; }
  .spt { font-size:24px;font-weight:800;margin-bottom:8px; }
  .sps { font-size:14px;color:var(--muted);margin-bottom:28px; }
  .crow { display:flex;gap:12px;justify-content:center;margin-bottom:28px;flex-wrap:wrap; }
  .cchip { background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:10px 20px;
    cursor:pointer;font-size:13px;font-weight:600;transition:all .15s; }
  .cchip.sel { border-color:var(--accent);color:var(--accent);background:rgba(124,58,237,.1); }
  .btn-p { background:linear-gradient(135deg,var(--accent),#06b6d4);border:none;border-radius:12px;padding:16px 40px;
    font-size:15px;font-weight:700;color:white;cursor:pointer;font-family:'Syne',sans-serif;transition:all .2s;letter-spacing:.5px; }
  .btn-p:hover { transform:translateY(-2px);box-shadow:0 8px 24px rgba(124,58,237,.4); }
  .btn-p:disabled { opacity:.5;cursor:not-allowed;transform:none; }

  /* ── QUIZ ── */
  .qlayout { display:grid;grid-template-columns:1fr 280px;gap:20px; }
  .qhdr { display:flex;align-items:center;gap:12px;margin-bottom:20px; }
  .qbadge { background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:6px 12px;
    font-size:12px;font-family:'Space Mono',monospace; }
  .qtbadge { border-radius:8px;padding:6px 12px;font-size:12px;font-weight:700; }
  .tbadge { margin-left:auto;display:flex;align-items:center;gap:6px;background:var(--surface2);border:1px solid var(--border);
    border-radius:8px;padding:6px 14px;font-size:13px;font-family:'Space Mono',monospace; }
  .tbadge.warning { border-color:var(--warning);color:var(--warning); }
  .tbadge.danger { border-color:var(--danger);color:var(--danger);animation:flash .5s infinite; }
  @keyframes flash{0%,100%{opacity:1}50%{opacity:.5}}
  .qcard { background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:28px;margin-bottom:16px; }
  .qmeta { display:flex;gap:8px;margin-bottom:16px; }
  .qdiff { font-size:11px;font-family:'Space Mono',monospace;padding:3px 10px;border-radius:20px; }
  .diff-easy { background:rgba(16,185,129,.1);color:var(--success);border:1px solid rgba(16,185,129,.2); }
  .diff-medium { background:rgba(245,158,11,.1);color:var(--warning);border:1px solid rgba(245,158,11,.2); }
  .diff-hard { background:rgba(255,59,92,.1);color:var(--danger);border:1px solid rgba(255,59,92,.2); }
  .qpyq { font-size:11px;font-family:'Space Mono',monospace;padding:3px 10px;border-radius:20px;
    background:rgba(124,58,237,.1);color:var(--accent);border:1px solid rgba(124,58,237,.2); }
  .qtext { font-size:16px;line-height:1.7;margin-bottom:24px;font-weight:500; }
  .qformula { background:var(--surface2);border-left:3px solid var(--accent);border-radius:0 8px 8px 0;
    padding:12px 16px;margin:12px 0;font-family:'Space Mono',monospace;font-size:14px;color:#a78bfa; }
  .opts { display:flex;flex-direction:column;gap:10px; }
  .opt { background:var(--surface2);border:1px solid var(--border);border-radius:12px;padding:16px 20px;cursor:pointer;
    text-align:left;transition:all .15s;display:flex;align-items:center;gap:14px;font-size:14px;font-weight:500;
    color:var(--text);font-family:'Syne',sans-serif;width:100%; }
  .opt:hover:not(:disabled) { border-color:var(--accent);background:rgba(124,58,237,.05); }
  .opt.correct { border-color:var(--success);background:rgba(16,185,129,.1);color:var(--success); }
  .opt.wrong { border-color:var(--danger);background:rgba(255,59,92,.1);color:var(--danger); }
  .opt:disabled { cursor:default; }
  .olabel { width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;
    font-family:'Space Mono',monospace;font-size:12px;font-weight:700;background:var(--border);flex-shrink:0; }
  .opt.correct .olabel { background:var(--success);color:#000; }
  .opt.wrong .olabel { background:var(--danger);color:#fff; }

  /* ── EXPLANATION ── */
  .expcard { background:var(--surface2);border:1px solid var(--border);border-radius:16px;padding:24px;margin-bottom:16px; }
  .exphdr { display:flex;align-items:center;gap:10px;margin-bottom:16px; }
  .expicon { width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px; }
  .exptitle { font-size:14px;font-weight:700; }
  .expbody { font-size:13px;line-height:1.8;color:#c8ccd8; }
  .expf { background:rgba(124,58,237,.1);border:1px solid rgba(124,58,237,.2);border-radius:8px;
    padding:10px 14px;margin:10px 0;font-family:'Space Mono',monospace;font-size:12px;color:#a78bfa; }
  .ldots { display:flex;align-items:center;gap:10px;color:var(--muted);font-size:13px; }
  .ldot { width:6px;height:6px;border-radius:50%;background:var(--accent);animation:bounce 1s infinite; }
  .ldot:nth-child(2){animation-delay:.15s}.ldot:nth-child(3){animation-delay:.3s}
  @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
  .actrow { display:flex;gap:12px; }
  .btn-s { background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:12px 24px;
    font-size:13px;font-weight:700;color:var(--text);cursor:pointer;font-family:'Syne',sans-serif;transition:all .15s; }
  .btn-s:hover { border-color:var(--muted); }
  .btn-a { background:var(--accent);border:none;border-radius:10px;padding:12px 24px;font-size:13px;font-weight:700;
    color:white;cursor:pointer;font-family:'Syne',sans-serif;transition:all .15s; }
  .btn-a:hover { opacity:.85; }
  .btn-d { background:rgba(255,59,92,.1);border:1px solid rgba(255,59,92,.3);border-radius:10px;padding:12px 24px;
    font-size:13px;font-weight:700;color:var(--danger);cursor:pointer;font-family:'Syne',sans-serif; }

  /* ── SIDEBAR ── */
  .sdcard { background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:20px;margin-bottom:16px; }
  .sdtitle { font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:var(--muted);margin-bottom:16px; }
  .scdisp { text-align:center;padding:8px 0; }
  .scnum { font-size:40px;font-weight:800;font-family:'Space Mono',monospace;line-height:1; }
  .scdenom { font-size:14px;color:var(--muted);margin-top:4px;font-family:'Space Mono',monospace; }
  .scbr { display:flex;flex-direction:column;gap:8px;margin-top:16px; }
  .scrow { display:flex;justify-content:space-between;align-items:center;font-size:13px; }
  .scl { color:var(--muted); } .scv { font-weight:700;font-family:'Space Mono',monospace; }
  .scv.ok{color:var(--success)}.scv.ng{color:var(--danger)}.scv.sk{color:var(--muted)}
  .qnav { display:grid;grid-template-columns:repeat(5,1fr);gap:6px; }
  .qnb { aspect-ratio:1;border-radius:8px;border:1px solid var(--border);background:var(--surface2);
    font-size:11px;font-family:'Space Mono',monospace;cursor:pointer;color:var(--muted);transition:all .15s; }
  .qnb.cur{border-color:var(--accent);background:rgba(124,58,237,.2);color:var(--accent)}
  .qnb.aok{border-color:var(--success);background:rgba(16,185,129,.15);color:var(--success)}
  .qnb.ang{border-color:var(--danger);background:rgba(255,59,92,.15);color:var(--danger)}
  .qnb.ask{border-color:var(--warning);background:rgba(245,158,11,.1);color:var(--warning)}
  .war { display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border); }
  .war:last-child{border-bottom:none}
  .winfo{flex:1}.wname{font-size:13px;font-weight:600}
  .wstat{font-size:11px;color:var(--muted);font-family:'Space Mono',monospace}
  .wbar{width:100%;height:3px;background:var(--border);border-radius:2px;margin-top:4px;overflow:hidden}
  .wfill{height:100%;border-radius:2px}

  /* ── RESULTS ── */
  .rpage { max-width: 920px; margin: 0 auto; }
  .rhero { background:var(--surface);border:1px solid var(--border);border-radius:24px;padding:40px;text-align:center;margin-bottom:24px;position:relative;overflow:hidden; }
  .rhero::after{content:'';position:absolute;top:-40px;right:-40px;width:200px;height:200px;background:radial-gradient(circle,rgba(124,58,237,.15),transparent 70%);pointer-events:none}
  .rbig { font-size:72px;font-weight:800;font-family:'Space Mono',monospace;line-height:1; }
  .rlbl { font-size:14px;color:var(--muted);margin-top:8px;margin-bottom:28px; }
  .rrow { display:flex;justify-content:center;gap:40px;flex-wrap:wrap; }
  .rstat{text-align:center} .rsnum{font-size:28px;font-weight:800;font-family:'Space Mono',monospace}
  .rslbl{font-size:12px;color:var(--muted);margin-top:4px}
  .ranalysis { background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:28px;margin-bottom:20px; }
  .ratitle { font-size:16px;font-weight:700;margin-bottom:20px;display:flex;align-items:center;gap:8px; }
  .trrow { display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid var(--border); }
  .trrow:last-child{border-bottom:none}
  .trname{font-size:13px;font-weight:600;min-width:130px}
  .trbar{flex:1;height:8px;background:var(--border);border-radius:4px;overflow:hidden}
  .trfill{height:100%;border-radius:4px;transition:width .5s}
  .trpct{font-size:13px;font-weight:700;font-family:'Space Mono',monospace;width:40px;text-align:right}
  .ract { display:flex;gap:12px;justify-content:center;margin-top:4px; }

  /* ── ANALYSIS PAGE ── */
  .apage { max-width: 1100px; }
  .sum-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px; }
  .sum-card { background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:20px 24px; }
  .sum-label { font-size:11px;color:var(--muted);font-family:'Space Mono',monospace;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px; }
  .sum-val { font-size:28px;font-weight:800;font-family:'Space Mono',monospace; }
  .chart-grid { display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px; }
  .chart-card { background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:24px; }
  .chart-card-full { background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:24px;margin-bottom:20px; }
  .chart-title { font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:20px; }
  .tbrow { display:flex;align-items:center;gap:10px;margin-bottom:10px; }
  .tblabel { font-size:12px;width:130px;color:var(--text);flex-shrink:0; }
  .tbtrack { flex:1;height:10px;background:var(--border);border-radius:5px;overflow:hidden; }
  .tbfill { height:100%;border-radius:5px;transition:width .6s; }
  .tbval { font-size:11px;font-family:'Space Mono',monospace;color:var(--muted);width:36px;text-align:right;flex-shrink:0; }
  .dnutwrap { display:flex;align-items:center;gap:24px; }
  .dlegend { display:flex;flex-direction:column;gap:10px; }
  .dlegrow { display:flex;align-items:center;gap:8px;font-size:13px; }
  .dlegd { width:10px;height:10px;border-radius:3px;flex-shrink:0; }
  .dlegv { font-family:'Space Mono',monospace;font-weight:700;margin-left:auto; }
  .irow { display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:1px solid var(--border); }
  .irow:last-child{border-bottom:none}
  .iicon{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0}
  .ilbl{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px}
  .itxt{font-size:13px;line-height:1.6;color:#c8ccd8}
  .sessrow { display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border); }
  .sessrow:last-child{border-bottom:none}
  .sessbadge { font-size:11px;font-family:'Space Mono',monospace;padding:3px 8px;border-radius:6px;
    background:var(--surface2);border:1px solid var(--border); }
  .empty-analysis { text-align:center;padding:80px 0;color:var(--muted); }
  .empty-icon { font-size:48px;margin-bottom:16px; }
  .empty-txt { font-size:16px;margin-bottom:8px; }
  .empty-sub { font-size:13px;margin-bottom:28px; }

  @media(max-width:768px){
    .dgrid,.tgrid,.chart-grid,.sum-grid{ grid-template-columns:1fr; }
    .qlayout{ grid-template-columns:1fr; }
    .dnutwrap{ flex-direction:column; }
    .rrow{ gap:24px; }
  }
`;

// ─── Quiz Generation Loading Screen ───────────────────────────────────────
function QuizGenLoader({ subject, topics, questionCount, generatedCount }) {
  const subjectColor = SUBJECTS[subject]?.color || "#7c3aed";
  const subjectIcon = SUBJECTS[subject]?.icon || "⚡";

  const steps = [
    { icon: "🧠", label: "Analyzing weak areas", detail: "Scanning your performance history..." },
    { icon: "🎯", label: "Selecting topics", detail: `${topics.join(", ")}` },
    { icon: "⚡", label: "Generating questions", detail: `${generatedCount}/${questionCount} questions ready` },
    { icon: "✅", label: "Finalizing test", detail: "Applying JEE difficulty calibration..." },
  ];

  const activeStep = generatedCount === 0 ? 1 : generatedCount < questionCount ? 2 : 3;
  const progress = Math.round((generatedCount / questionCount) * 100);

  return (
    <div className="qgen-loader">
      <div className="qgen-orbit">
        <div className="qgen-ring" />
        <div className="qgen-ring2" />
        <div className="qgen-core">
          <div className="qgen-core-inner" style={{ background: `linear-gradient(135deg, ${subjectColor}, #7c3aed)` }}>
            {subjectIcon}
          </div>
        </div>
      </div>

      <div className="qgen-title">Building Your <span style={{ color: subjectColor }}>Test</span></div>
      <div className="qgen-sub">AI is crafting {questionCount} JEE-pattern questions</div>

      <div className="qgen-steps">
        {steps.map((step, i) => {
          const isDone = i < activeStep;
          const isActive = i === activeStep;
          return (
            <div key={i} className={`qgen-step ${isDone ? "done" : isActive ? "active" : ""}`}>
              <div className="qgen-step-icon">{step.icon}</div>
              <div className="qgen-step-info">
                <div className="qgen-step-label">{step.label}</div>
                <div className="qgen-step-detail">{step.detail}</div>
              </div>
              <div className="qgen-step-check">✓</div>
            </div>
          );
        })}
      </div>

      <div className="qgen-progress">
        <div className="qgen-prog-row">
          <span className="qgen-prog-label">Generation progress</span>
          <span className="qgen-prog-val">{progress}%</span>
        </div>
        <div className="qgen-prog-track">
          <div className="qgen-prog-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}

// ─── Question Skeleton Loader ──────────────────────────────────────────────
function QuestionSkeleton() {
  return (
    <div className="qlayout">
      <div className="qskel">
        {/* Header badges */}
        <div className="qhdr" style={{ marginBottom: 20 }}>
          <div className="skel-block" style={{ width: 60, height: 30, borderRadius: 8 }} />
          <div className="skel-block" style={{ width: 120, height: 30, borderRadius: 8 }} />
          <div className="skel-block" style={{ width: 80, height: 30, borderRadius: 8, marginLeft: "auto" }} />
        </div>

        {/* Question card skeleton */}
        <div className="qcard">
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <div className="skel-block" style={{ width: 60, height: 22, borderRadius: 20 }} />
            <div className="skel-block" style={{ width: 120, height: 22, borderRadius: 20 }} />
          </div>
          <div className="skel-line" style={{ width: "95%" }} />
          <div className="skel-line" style={{ width: "88%" }} />
          <div className="skel-line" style={{ width: "72%", marginBottom: 24 }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="skel-block" style={{ height: 54, borderRadius: 12, display: "flex", alignItems: "center", gap: 14, padding: "0 20px" }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--border)" }} />
                <div className="skel-line" style={{ flex: 1, margin: 0, height: 12 }} />
              </div>
            ))}
          </div>
        </div>

        {/* Action row skeleton */}
        <div className="actrow">
          <div className="skel-block" style={{ width: 80, height: 42, borderRadius: 10 }} />
          <div className="skel-block" style={{ width: 100, height: 42, borderRadius: 10, marginLeft: "auto" }} />
        </div>
      </div>

      {/* Sidebar skeleton */}
      <div className="qskel">
        <div className="sdcard">
          <div className="skel-line" style={{ width: 80, marginBottom: 16 }} />
          <div className="skel-block" style={{ height: 80, borderRadius: 10, marginBottom: 8 }} />
          <div className="skel-line" style={{ width: "60%", margin: "8px auto" }} />
        </div>
        <div className="sdcard">
          <div className="skel-line" style={{ width: 100, marginBottom: 16 }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6 }}>
            {Array(10).fill(0).map((_, i) => (
              <div key={i} className="skel-block" style={{ aspectRatio: 1, borderRadius: 8 }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Gemini AI ─────────────────────────────────────────────────────────────
async function callGemini(systemPrompt, userPrompt) {
  const API_KEY = "AAIzaSyDeJi-Ao-V68cvcHliTEFa59FZch5BGF4k";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: { responseMimeType: "application/json" },
    }),
  });
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

function pj(raw) {
  try { return JSON.parse(raw.replace(/```json|```/g, "").trim()); }
  catch { return null; }
}

async function generateQuestion(subject, topic, difficulty, weakAreas) {
  const sys = `You are a JEE expert. Generate a single JEE-level MCQ. Return ONLY valid JSON:
{"question":"...","formula":"key equation or empty string","options":["A) ...","B) ...","C) ...","D) ..."],"correct":0,"difficulty":"Easy|Medium|Hard","pyq":"JEE Main 2023|JEE Advanced 2022|Original","concept":"key concept"}`;
  const wk = weakAreas?.length ? `Focus on weak concepts: ${weakAreas.join(", ")}.` : "";
  return pj(await callGemini(sys, `Subject:${subject}. Topic:${topic}. Difficulty:${difficulty}. ${wk} Generate a challenging JEE question.`));
}

async function generateExplanation(subject, topic, question, options, ci, chosen) {
  const sys = `You are a JEE expert teacher. Give step-by-step explanation. Return ONLY valid JSON:
{"explanation":"numbered steps","keyFormula":"formula or empty string","concept":"1 sentence","tip":"exam tip"}`;
  return pj(await callGemini(sys, `Q: ${question}\nOptions: ${options.join(" | ")}\nCorrect: ${options[ci]}\nStudent: ${chosen >= 0 ? options[chosen] : "Skipped"}\n${subject}, ${topic}. Explain.`));
}

// ─── localStorage helpers ──────────────────────────────────────────────────
const LS = {
  get: (k, def = null) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch { return def; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

// ─── SVG Charts ────────────────────────────────────────────────────────────
function DonutChart({ correct, wrong, skipped }) {
  const tot = correct + wrong + skipped;
  if (!tot) return <div style={{ textAlign: "center", color: "var(--muted)", fontSize: 13, padding: "30px 0" }}>No data yet</div>;
  const r = 60, cx = 78, cy = 78, circ = 2 * Math.PI * r;
  const items = [
    { v: correct, c: "#10b981", l: "Correct" },
    { v: wrong, c: "#ff3b5c", l: "Wrong" },
    { v: skipped, c: "#6b7594", l: "Skipped" },
  ];
  let off = 0;
  const slices = items.map(d => {
    const da = (d.v / tot) * circ;
    const s = { ...d, off: circ - off, da };
    off += da; return s;
  });
  return (
    <div className="dnutwrap">
      <svg width="156" height="156" viewBox="0 0 156 156" style={{ flexShrink: 0 }}>
        {slices.map((s, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.c} strokeWidth="22"
            strokeDasharray={`${s.da} ${circ - s.da}`} strokeDashoffset={s.off} />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fill="#e8eaf0" fontSize="20" fontWeight="800" fontFamily="Space Mono">{tot}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="#6b7594" fontSize="10" fontFamily="Space Mono">total</text>
      </svg>
      <div className="dlegend">
        {items.map(d => (
          <div key={d.l} className="dlegrow">
            <div className="dlegd" style={{ background: d.c }} />
            <span style={{ color: "var(--muted)", fontSize: 12 }}>{d.l}</span>
            <span className="dlegv" style={{ color: d.c, marginLeft: 8 }}>{d.v}</span>
            <span style={{ fontSize: 11, color: "var(--muted)", marginLeft: 4 }}>({Math.round(d.v / tot * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RadarChart({ topics, weakAreas, color }) {
  const N = topics.length;
  if (N < 3) return <div style={{ textAlign: "center", color: "var(--muted)", fontSize: 13, padding: "40px 0" }}>Select more topics to see radar</div>;
  const cx = 150, cy = 150, r = 112;
  const ang = topics.map((_, i) => (i / N) * 2 * Math.PI - Math.PI / 2);
  const pt = (val, i) => { const rd = (val / 100) * r; return [cx + rd * Math.cos(ang[i]), cy + rd * Math.sin(ang[i])]; };
  const gpt = (f) => topics.map((_, i) => [cx + f * r * Math.cos(ang[i]), cy + f * r * Math.sin(ang[i])]);
  const tp = (pts) => pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ") + "Z";
  const scores = topics.map(t => weakAreas[t]?.accuracy ?? 40);
  const dpts = scores.map((s, i) => pt(s, i));
  return (
    <svg viewBox="0 0 300 300" style={{ width: "100%", maxHeight: 260 }}>
      {[.25, .5, .75, 1].map(f => <path key={f} d={tp(gpt(f))} fill="none" stroke="#1e2535" strokeWidth="1" />)}
      {topics.map((_, i) => (
        <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(ang[i])} y2={cy + r * Math.sin(ang[i])} stroke="#1e2535" strokeWidth="1" />
      ))}
      <path d={tp(dpts)} fill={color + "25"} stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
      {dpts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="4" fill={color} />)}
      {topics.map((t, i) => {
        const x = cx + (r + 22) * Math.cos(ang[i]), y = cy + (r + 22) * Math.sin(ang[i]);
        const a = Math.cos(ang[i]) > 0.1 ? "start" : Math.cos(ang[i]) < -0.1 ? "end" : "middle";
        return <text key={i} x={x} y={y + 4} textAnchor={a} fill="#6b7594" fontSize="10" fontFamily="Syne,sans-serif" fontWeight="700">{t.split(" ")[0]}</text>;
      })}
      {[25, 50, 75].map(v => <text key={v} x={cx + 4} y={cy - (v / 100) * r + 3} fill="#2e3650" fontSize="8" fontFamily="Space Mono">{v}</text>)}
    </svg>
  );
}

function LineChart({ sessions }) {
  if (sessions.length < 2) return (
    <div style={{ textAlign: "center", color: "var(--muted)", fontSize: 13, padding: "40px 0" }}>
      Complete 2+ sessions to see trend
    </div>
  );
  const W = 380, H = 130, pd = { t: 10, r: 12, b: 28, l: 38 };
  const iW = W - pd.l - pd.r, iH = H - pd.t - pd.b;
  const sc = sessions.map(s => s.score);
  const mn = Math.min(...sc), mx = Math.max(...sc), rng = mx - mn || 1;
  const tx = (i) => pd.l + (i / (sessions.length - 1)) * iW;
  const ty = (v) => pd.t + iH - ((v - mn) / rng) * iH;
  const pts = sessions.map((s, i) => [tx(i), ty(s.score)]);
  const pd2 = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${pd2} L${pts[pts.length - 1][0]},${H - pd.b} L${pts[0][0]},${H - pd.b}Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", overflow: "visible" }}>
      {[0, .5, 1].map(f => {
        const y = pd.t + iH * (1 - f), v = Math.round(mn + f * rng);
        return <g key={f}><line x1={pd.l} y1={y} x2={W - pd.r} y2={y} stroke="#1e2535" strokeWidth="1" />
          <text x={pd.l - 4} y={y + 4} textAnchor="end" fill="#6b7594" fontSize="9" fontFamily="Space Mono">{v}</text></g>;
      })}
      <path d={area} fill="#7c3aed" opacity=".09" />
      <path d={pd2} fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinejoin="round" />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="4" fill="#7c3aed" />)}
      {sessions.map((_, i) => (
        <text key={i} x={tx(i)} y={H - pd.b + 14} textAnchor="middle" fill="#6b7594" fontSize="9" fontFamily="Space Mono">S{i + 1}</text>
      ))}
    </svg>
  );
}

function Heatmap({ weakAreas }) {
  const allTopics = Object.values(SUBJECTS).flatMap(s => s.topics);
  const gc = (a) => a === undefined ? "#1e2535" : a >= 75 ? "#10b981" : a >= 50 ? "#f59e0b" : "#ff3b5c";
  const go = (a) => a === undefined ? 0.2 : 0.25 + (a / 100) * 0.75;
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 6, marginBottom: 14 }}>
        {allTopics.map(t => {
          const a = weakAreas[t]?.accuracy;
          return (
            <div key={t} title={`${t}: ${a !== undefined ? a + "%" : "not attempted"}`}
              style={{ height: 38, borderRadius: 6, background: gc(a), opacity: go(a), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontFamily: "Space Mono", color: "#fff", padding: "0 2px", textAlign: "center", lineHeight: 1.2, cursor: "default" }}>
              {t.split(" ")[0].slice(0, 7)}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 16, fontSize: 11, color: "var(--muted)" }}>
        {[["#10b981", "≥75%"], ["#f59e0b", "50–74%"], ["#ff3b5c", "<50%"], ["#1e2535", "Not tried"]].map(([c, l]) => (
          <span key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: c, display: "inline-block" }} />{l}
          </span>
        ))}
      </div>
    </div>
  );
}

function Gauge({ avgTime }) {
  const frac = Math.min((avgTime || 0) / 120, 1);
  const cx = 100, cy = 95, r = 74;
  const pol = (deg, rd) => [cx + rd * Math.cos((deg - 90) * Math.PI / 180), cy + rd * Math.sin((deg - 90) * Math.PI / 180)];
  const arc = (s, e, rd) => { const [sx, sy] = pol(s, rd), [ex, ey] = pol(e, rd); return `M${sx},${sy} A${rd},${rd} 0 ${e - s > 180 ? 1 : 0} 1 ${ex},${ey}`; };
  const col = avgTime < 40 ? "#10b981" : avgTime < 80 ? "#f59e0b" : "#ff3b5c";
  const [nx, ny] = pol(-140 + frac * 280, 56);
  return (
    <svg viewBox="0 0 200 130" style={{ width: "100%", maxHeight: 150 }}>
      <path d={arc(-140, 140, r)} fill="none" stroke="#1e2535" strokeWidth="14" strokeLinecap="round" />
      <path d={arc(-140, -140 + frac * 280, r)} fill="none" stroke={col} strokeWidth="14" strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#e8eaf0" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="5" fill="#e8eaf0" />
      <text x={cx} y={cy + 20} textAnchor="middle" fill={col} fontSize="14" fontWeight="800" fontFamily="Space Mono">{Math.round(avgTime || 0)}s</text>
      <text x={cx} y={cy + 32} textAnchor="middle" fill="#6b7594" fontSize="9" fontFamily="Space Mono">{avgTime < 40 ? "Fast" : avgTime < 80 ? "Steady" : "Slow"}</text>
      <text x="26" y={cy + 8} fill="#2e3650" fontSize="8" fontFamily="Space Mono">Fast</text>
      <text x="142" y={cy + 8} fill="#2e3650" fontSize="8" fontFamily="Space Mono">Slow</text>
    </svg>
  );
}

function PerformanceRings({ progress }) {
  const data = Object.entries(SUBJECTS).map(([name, info]) => {
    const keys = info.topics.map(t => `${name}_${t}`);
    const tot = keys.reduce((a, k) => a + (progress[k]?.count || 0), 0);
    const cor = keys.reduce((a, k) => a + (progress[k]?.correct || 0), 0);
    return { name, color: info.color, icon: info.icon, acc: tot ? Math.round(cor / tot * 100) : 0, tot };
  });
  const cx = 108, rs = [{ r: 85, i: 0 }, { r: 60, i: 1 }, { r: 35, i: 2 }];
  return (
    <svg viewBox="0 0 220 220" style={{ width: "100%", maxHeight: 220 }}>
      {rs.map(({ r, i }) => {
        const d = data[i]; if (!d) return null;
        const c = 2 * Math.PI * r, f = (d.acc / 100) * c;
        return (
          <g key={i}>
            <circle cx={cx} cy={cx} r={r} fill="none" stroke="#1e2535" strokeWidth="14" />
            <circle cx={cx} cy={cx} r={r} fill="none" stroke={d.color} strokeWidth="14"
              strokeDasharray={`${f} ${c - f}`} strokeDashoffset={c * .25} strokeLinecap="round" />
          </g>
        );
      })}
      <text x={cx} y={cx - 6} textAnchor="middle" fill="#e8eaf0" fontSize="16" fontWeight="800" fontFamily="Space Mono">
        {data.some(d => d.tot) ? Math.round(data.reduce((a, d) => a + d.acc * (d.tot || 1), 0) / Math.max(data.reduce((a, d) => a + (d.tot || 1), 0), 1)) : "—"}
      </text>
      <text x={cx} y={cx + 11} textAnchor="middle" fill="#6b7594" fontSize="9" fontFamily="Space Mono">avg %</text>
      <g transform="translate(170,52)">
        {data.map((d, i) => (
          <g key={i} transform={`translate(0,${i * 24})`}>
            <circle cx="6" cy="6" r="5" fill={d.color} />
            <text x="14" y="11" fill="#6b7594" fontSize="9" fontFamily="Space Mono">{d.icon} {d.name.slice(0, 4)}: {d.acc}%</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

function ExamAnalysis({ questions, answers, timePerQ, subject, weakAreas }) {
  const topicAcc = {};
  questions.forEach((q, i) => {
    if (!topicAcc[q.topic]) topicAcc[q.topic] = { tot: 0, cor: 0, times: [] };
    topicAcc[q.topic].tot++;
    if (answers[i] === q.correct) topicAcc[q.topic].cor++;
    if (timePerQ[i]) topicAcc[q.topic].times.push(timePerQ[i]);
  });
  const correct = Object.entries(answers).filter(([i, a]) => a === questions[parseInt(i)]?.correct).length;
  const wrong = Object.entries(answers).filter(([, a]) => a !== -1).filter(([i, a]) => a !== questions[parseInt(i)]?.correct).length;
  const skipped = Object.values(answers).filter(a => a === -1).length;
  const avgT = Object.values(timePerQ).length ? Object.values(timePerQ).reduce((a, b) => a + b, 0) / Object.values(timePerQ).length : 0;
  const sc = SUBJECTS[subject]?.color || "#7c3aed";

  return (
    <>
      <div className="chart-grid">
        <div className="ranalysis" style={{ marginBottom: 0 }}>
          <div className="ratitle">🍩 Answer Breakdown</div>
          <DonutChart correct={correct} wrong={wrong} skipped={skipped} />
        </div>
        <div className="ranalysis" style={{ marginBottom: 0 }}>
          <div className="ratitle">📊 Topic Performance</div>
          {Object.entries(topicAcc).map(([t, d]) => {
            const pct = Math.round(d.cor / d.tot * 100);
            return (
              <div key={t} className="trrow">
                <div className="trname">{t}</div>
                <div className="trbar"><div className="trfill" style={{ width: `${pct}%`, background: pct >= 70 ? "#10b981" : pct >= 40 ? "#f59e0b" : "#ff3b5c" }} /></div>
                <div className="trpct" style={{ color: pct >= 70 ? "#10b981" : pct >= 40 ? "#f59e0b" : "#ff3b5c" }}>{pct}%</div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="ranalysis">
        <div className="ratitle">⏱ Time Analysis</div>
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 24, alignItems: "center" }}>
          <Gauge avgTime={avgT} />
          <div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>Time per topic</div>
            {Object.entries(topicAcc).map(([t, d]) => {
              const avg = d.times.length ? d.times.reduce((a, b) => a + b, 0) / d.times.length : 0;
              const mx = Math.max(...Object.values(topicAcc).map(x => x.times.length ? x.times.reduce((a, b) => a + b, 0) / x.times.length : 0), 1);
              return (
                <div key={t} className="tbrow">
                  <div className="tblabel">{t.slice(0, 16)}</div>
                  <div className="tbtrack"><div className="tbfill" style={{ width: `${(avg / mx) * 100}%`, background: avg > 80 ? "#ff3b5c" : avg > 45 ? "#f59e0b" : "#10b981" }} /></div>
                  <div className="tbval">{Math.round(avg)}s</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="ranalysis">
        <div className="ratitle">🕸 Mastery Radar — {subject}</div>
        <RadarChart topics={SUBJECTS[subject]?.topics || []} weakAreas={weakAreas} color={sc} />
      </div>
    </>
  );
}

function AnalysisPage({ progress, weakAreas, sessions, selectedSubject, setSelectedSubject }) {
  const totAtt = Object.values(weakAreas).reduce((a, v) => a + v.count, 0);
  const ovAcc = totAtt ? Math.round(Object.values(weakAreas).reduce((a, v) => a + v.correct, 0) / totAtt * 100) : 0;
  const avgTA = (() => {
    const vals = Object.values(weakAreas).filter(v => v.count > 0).map(v => v.totalTime / v.count);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  })();
  const topTimes = Object.entries(weakAreas).map(([t, d]) => ({ t, avg: d.count ? d.totalTime / d.count : 0, acc: d.accuracy, cnt: d.count })).filter(d => d.cnt > 0).sort((a, b) => b.avg - a.avg);
  const sc = SUBJECTS[selectedSubject]?.color || "#7c3aed";

  if (!totAtt && !sessions.length) return (
    <div className="empty-analysis">
      <div className="empty-icon">📊</div>
      <div className="empty-txt">No data yet</div>
      <div className="empty-sub">Complete practice sessions to unlock graphical analysis</div>
    </div>
  );

  return (
    <div className="apage">
      <div className="sum-grid">
        {[
          { l: "Overall Accuracy", v: ovAcc + "%", c: ovAcc >= 70 ? "#10b981" : ovAcc >= 45 ? "#f59e0b" : "#ff3b5c" },
          { l: "Total Attempted", v: totAtt, c: "#7c3aed" },
          { l: "Sessions Done", v: sessions.length, c: "#00d4ff" },
          { l: "Avg Time / Q", v: Math.round(avgTA || 0) + "s", c: avgTA < 50 ? "#10b981" : "#f59e0b" },
        ].map(c => (
          <div key={c.l} className="sum-card">
            <div className="sum-label">{c.l}</div>
            <div className="sum-val" style={{ color: c.c }}>{c.v}</div>
          </div>
        ))}
      </div>
      <div className="chart-grid">
        <div className="chart-card">
          <div className="chart-title">Topic Mastery Radar — {selectedSubject}</div>
          <RadarChart topics={SUBJECTS[selectedSubject].topics} weakAreas={weakAreas} color={sc} />
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            {Object.entries(SUBJECTS).map(([s, info]) => (
              <button key={s} onClick={() => setSelectedSubject(s)} style={{ padding: "4px 12px", borderRadius: 8, border: `1px solid ${selectedSubject === s ? info.color : "var(--border)"}`, background: selectedSubject === s ? info.color + "20" : "var(--surface2)", color: selectedSubject === s ? info.color : "var(--muted)", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Syne" }}>{s}</button>
            ))}
          </div>
        </div>
        <div className="chart-card">
          <div className="chart-title">Subject Performance Rings</div>
          <PerformanceRings progress={progress} />
          <div style={{ marginTop: 12 }}>
            {Object.entries(SUBJECTS).map(([name, info]) => {
              const keys = info.topics.map(t => `${name}_${t}`);
              const tot = keys.reduce((a, k) => a + (progress[k]?.count || 0), 0);
              const cor = keys.reduce((a, k) => a + (progress[k]?.correct || 0), 0);
              const ac = tot ? Math.round(cor / tot * 100) : 0;
              return (
                <div key={name} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 16 }}>{info.icon}</span>
                  <span style={{ fontSize: 13, flex: 1 }}>{name}</span>
                  <span style={{ fontSize: 11, fontFamily: "Space Mono", color: "var(--muted)" }}>{tot} Qs</span>
                  <span style={{ fontSize: 13, fontFamily: "Space Mono", fontWeight: 700, color: ac >= 70 ? "#10b981" : ac >= 45 ? "#f59e0b" : "#ff3b5c" }}>{ac}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="chart-card-full">
        <div className="chart-title">Concept Accuracy Heatmap — All Topics</div>
        <Heatmap weakAreas={weakAreas} />
      </div>
      <div className="chart-grid">
        <div className="chart-card">
          <div className="chart-title">Score Trend ({sessions.length} sessions)</div>
          <LineChart sessions={sessions} />
          {sessions.length > 0 && (
            <div style={{ marginTop: 16 }}>
              {sessions.slice(-5).reverse().map((s, i) => (
                <div key={i} className="sessrow">
                  <div className="sessbadge">S{sessions.length - i}</div>
                  <div style={{ flex: 1, fontSize: 12 }}>{s.subject} · {s.date}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "Space Mono", color: s.score >= 0 ? "#10b981" : "#ff3b5c" }}>{s.score >= 0 ? "+" : ""}{s.score}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "Space Mono" }}>{s.correct}/{s.total}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="chart-card">
          <div className="chart-title">Average Response Speed</div>
          <Gauge avgTime={isNaN(avgTA) ? 0 : avgTA} />
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>Slowest topics</div>
            {topTimes.slice(0, 6).map(d => {
              const mx = Math.max(...topTimes.map(x => x.avg), 1), fr = d.avg / mx;
              const col = fr > 0.7 ? "#ff3b5c" : fr > 0.4 ? "#f59e0b" : "#10b981";
              return (
                <div key={d.t} className="tbrow">
                  <div className="tblabel">{d.t.slice(0, 16)}</div>
                  <div className="tbtrack"><div className="tbfill" style={{ width: `${fr * 100}%`, background: col }} /></div>
                  <div className="tbval">{Math.round(d.avg)}s</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="chart-grid">
        <div className="chart-card">
          <div className="chart-title">All-Time Answer Distribution</div>
          <DonutChart
            correct={sessions.reduce((a, s) => a + s.correct, 0)}
            wrong={sessions.reduce((a, s) => a + (s.total - s.correct - (s.skipped || 0)), 0)}
            skipped={sessions.reduce((a, s) => a + (s.skipped || 0), 0)}
          />
          <div style={{ marginTop: 20 }}>
            {Object.entries(SUBJECTS).map(([name, info]) => {
              const subs = sessions.filter(x => x.subject === name);
              if (!subs.length) return null;
              const av = Math.round(subs.reduce((a, x) => a + (x.correct / x.total * 100), 0) / subs.length);
              return (
                <div key={name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 12, width: 90, color: "var(--text)" }}>{info.icon} {name}</span>
                  <div style={{ flex: 1, height: 8, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${av}%`, background: info.color, borderRadius: 4, transition: "width .5s" }} />
                  </div>
                  <span style={{ fontSize: 12, fontFamily: "Space Mono", color: info.color, width: 36, textAlign: "right" }}>{av}%</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="chart-card">
          <div className="chart-title">Weak Area Insights</div>
          {!Object.keys(weakAreas).length ? (
            <div style={{ color: "var(--muted)", fontSize: 13, padding: "20px 0" }}>Practice to reveal weak areas</div>
          ) : Object.entries(weakAreas).sort((a, b) => a[1].accuracy - b[1].accuracy).slice(0, 6).map(([t, d]) => (
            <div key={t} className="irow">
              <div className="iicon" style={{ background: d.accuracy < 40 ? "rgba(255,59,92,.15)" : d.accuracy < 65 ? "rgba(245,158,11,.15)" : "rgba(16,185,129,.15)" }}>
                {d.accuracy < 40 ? "🔴" : d.accuracy < 65 ? "🟡" : "🟢"}
              </div>
              <div style={{ flex: 1 }}>
                <div className="ilbl" style={{ color: d.accuracy < 40 ? "var(--danger)" : d.accuracy < 65 ? "var(--warning)" : "var(--success)" }}>{t}</div>
                <div className="itxt">{d.accuracy}% accuracy · {d.count} attempts · avg {Math.round(d.totalTime / d.count)}s/q</div>
                <div style={{ marginTop: 5, height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${d.accuracy}%`, background: d.accuracy < 40 ? "#ff3b5c" : d.accuracy < 65 ? "#f59e0b" : "#10b981", transition: "width .5s" }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────────
export default function JEEMockTest() {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("test");
  const [screen, setScreen] = useState("dashboard");
  const [selectedSubject, setSelectedSubject] = useState("Physics");
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [questionCount, setQuestionCount] = useState(10);
  const [difficultyMode, setDifficultyMode] = useState("Mixed");
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [explanations, setExplanations] = useState({});
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [timePerQ, setTimePerQ] = useState({});
  const [qStartTime, setQStartTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(120);
  const [weakAreas, setWeakAreas] = useState({});
  const [progress, setProgress] = useState({});
  const [sessions, setSessions] = useState([]);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [generatedCount, setGeneratedCount] = useState(0); // NEW: tracks live progress

  const timerRef = useRef(null);
  const savedHandleTimeout = useRef();

  useEffect(() => {
    setProgress(LS.get("jee_progress", {}));
    setWeakAreas(LS.get("jee_weak", {}));
    setSessions(LS.get("jee_sessions", []));
    const initTimer = setTimeout(() => setIsAppLoading(false), 1800);
    return () => clearTimeout(initTimer);
  }, []);

  function handleTimeout() {
    if (answers[currentQ] !== undefined) return;
    const elapsed = (Date.now() - qStartTime) / 1000;
    setTimePerQ(p => ({ ...p, [currentQ]: elapsed }));
    setAnswers(a => ({ ...a, [currentQ]: -1 }));
    if (currentQ + 1 < questions.length) {
      setTimeout(() => setCurrentQ(q => q + 1), 500);
    } else {
      saveSessionAndResults();
    }
  }

  useEffect(() => { savedHandleTimeout.current = handleTimeout; });

  useEffect(() => {
    if (screen !== "quiz") return;
    setTimeLeft(120);
    setQStartTime(Date.now());
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { if (savedHandleTimeout.current) savedHandleTimeout.current(); return 120; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [currentQ, screen]);

  const getWeakTopics = useCallback(() =>
    Object.entries(weakAreas).filter(([, v]) => v.accuracy < 50 && v.count >= 2)
      .sort((a, b) => a[1].accuracy - b[1].accuracy).slice(0, 3).map(([k]) => k),
    [weakAreas]);

  async function startQuiz() {
    if (!selectedTopics.length) return;
    setGeneratingQuiz(true);
    setGeneratedCount(0);  // reset progress counter
    const diffs = difficultyMode === "Mixed" ? ["Easy", "Medium", "Hard", "Medium", "Hard"] : Array(questionCount).fill(difficultyMode);
    const weak = getWeakTopics();
    const qs = [];
    for (let i = 0; i < questionCount; i++) {
      const topic = selectedTopics[i % selectedTopics.length];
      const q = await generateQuestion(selectedSubject, topic, diffs[i % diffs.length], weak);
      if (q) qs.push({ ...q, topic, subject: selectedSubject });
      setGeneratedCount(i + 1);  // update live count after each question
    }
    setQuestions(qs); setAnswers({}); setExplanations({}); setTimePerQ({});
    setCurrentQ(0); setGeneratingQuiz(false); setScreen("quiz");
  }

  async function handleAnswer(optIdx) {
    if (answers[currentQ] !== undefined) return;
    clearInterval(timerRef.current);
    const elapsed = (Date.now() - qStartTime) / 1000;
    setTimePerQ(p => ({ ...p, [currentQ]: elapsed }));
    setAnswers(a => ({ ...a, [currentQ]: optIdx }));
    const q = questions[currentQ], isCorrect = optIdx === q.correct;

    setWeakAreas(prev => {
      const e = prev[q.topic] || { count: 0, correct: 0, totalTime: 0, accuracy: 100 };
      const u = { count: e.count + 1, correct: e.correct + (isCorrect ? 1 : 0), totalTime: e.totalTime + elapsed, accuracy: Math.round(((e.correct + (isCorrect ? 1 : 0)) / (e.count + 1)) * 100) };
      const n = { ...prev, [q.topic]: u }; LS.set("jee_weak", n); return n;
    });
    setProgress(prev => {
      const k = `${selectedSubject}_${q.topic}`, e = prev[k] || { count: 0, correct: 0 };
      const u = { count: e.count + 1, correct: e.correct + (isCorrect ? 1 : 0) };
      const n = { ...prev, [k]: u }; LS.set("jee_progress", n); return n;
    });
    setLoadingExplanation(true);
    const exp = await generateExplanation(q.subject, q.topic, q.question, q.options, q.correct, optIdx);
    setExplanations(e => ({ ...e, [currentQ]: exp }));
    setLoadingExplanation(false);
  }

  function nextQuestion() {
    if (currentQ + 1 >= questions.length) { saveSessionAndResults(); return; }
    setCurrentQ(q => q + 1);
  }

  function saveSessionAndResults() {
    const sc = Object.entries(answers).reduce((a, [i, v]) => v === -1 ? a : a + (v === questions[parseInt(i)]?.correct ? 4 : -1), 0);
    const cor = Object.entries(answers).filter(([i, v]) => v === questions[parseInt(i)]?.correct).length;
    const skp = Object.values(answers).filter(v => v === -1).length;
    const newSess = {
      date: new Date().toLocaleDateString("en-IN"),
      subject: selectedSubject,
      topics: selectedTopics,
      score: sc,
      maxScore: questions.length * 4,
      total: questions.length,
      correct: cor,
      wrong: questions.length - cor - skp,
      skipped: skp,
      avgTime: Object.values(timePerQ).length ? Math.round(Object.values(timePerQ).reduce((a, b) => a + b, 0) / Object.values(timePerQ).length) : 0,
    };
    setSessions(prev => { const n = [...prev, newSess].slice(-30); LS.set("jee_sessions", n); return n; });
    setScreen("results");
  }

  function skipQuestion() {
    if (answers[currentQ] !== undefined) return;
    clearInterval(timerRef.current);
    setTimePerQ(p => ({ ...p, [currentQ]: (Date.now() - qStartTime) / 1000 }));
    setAnswers(a => ({ ...a, [currentQ]: -1 }));
    nextQuestion();
  }

  const score = Object.entries(answers).reduce((a, [i, v]) => v === -1 ? a : a + (v === questions[parseInt(i)]?.correct ? 4 : -1), 0);
  const maxScore = questions.length * 4;
  const correct = Object.entries(answers).filter(([i, v]) => v === questions[parseInt(i)]?.correct).length;
  const wrong = Object.entries(answers).filter(([, v]) => v !== -1).filter(([i, v]) => v !== questions[parseInt(i)]?.correct).length;
  const skipped = Object.values(answers).filter(v => v === -1).length;
  const timerClass = timeLeft <= 10 ? "danger" : timeLeft <= 30 ? "warning" : "";
  const q = questions[currentQ], answered = answers[currentQ], exp = explanations[currentQ];
  const subjectColor = SUBJECTS[selectedSubject]?.color || "#7c3aed";

  // ── INITIAL APP LOADING ──
  if (isAppLoading) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="init-loader">
          <div className="grid-bg" />
          <div className="init-logo">
            <div className="init-logo-mark">JEE</div>
            <div className="init-logo-text">Mock<span>Forge</span></div>
          </div>
          <div className="init-bar"><div className="init-fill" /></div>
          <div style={{ marginTop: 20, fontSize: 12, color: 'var(--muted)', fontFamily: 'Space Mono', letterSpacing: 2 }}>
            INITIALIZING AI ENGINE...
          </div>
        </div>
      </>
    );
  }

  // ── QUIZ GENERATION FULL-SCREEN LOADING ──
  if (generatingQuiz) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="app">
          <div className="grid-bg" />
          <QuizGenLoader
            subject={selectedSubject}
            topics={selectedTopics}
            questionCount={questionCount}
            generatedCount={generatedCount}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        <div className="grid-bg" />
        <div className="wrap">

          {/* ── HEADER ── */}
          <div className="hdr">
            <div className="hdr-inner">
              <div className="logo">
                <div className="logo-mark">JEE</div>
                <div className="logo-text">Mock<span>Forge</span></div>
              </div>
              <div className="nav-tabs">
                <button className={`nav-tab ${activeTab === "test" ? "active" : ""}`} onClick={() => setActiveTab("test")}>Test</button>
                <button className={`nav-tab ${activeTab === "analysis" ? "active" : ""}`} onClick={() => setActiveTab("analysis")}>Analysis</button>
              </div>
              <div className="pill">
                {screen === "quiz" && <><div className="dot" />{currentQ + 1}/{questions.length} · </>}
                <span style={{ color: "#a78bfa" }}>AI</span> Powered
              </div>
            </div>
          </div>

          {/* ── ANALYSIS TAB ── */}
          {activeTab === "analysis" && (
            <AnalysisPage
              progress={progress} weakAreas={weakAreas} sessions={sessions}
              selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject}
            />
          )}

          {/* ── TEST TAB ── */}
          {activeTab === "test" && (
            <>
              {/* DASHBOARD */}
              {screen === "dashboard" && (
                <>
                  <div className="section-header"><div className="section-title">Select Subject</div></div>
                  <div className="dgrid">
                    {Object.entries(SUBJECTS).map(([sub, info]) => {
                      const keys = info.topics.map(t => `${sub}_${t}`);
                      const tot = keys.reduce((a, k) => a + (progress[k]?.count || 0), 0);
                      const cor = keys.reduce((a, k) => a + (progress[k]?.correct || 0), 0);
                      const acc = tot ? Math.round(cor / tot * 100) : 0;
                      return (
                        <div key={sub} className={`sc ${selectedSubject === sub ? "active" : ""}`}
                          style={{ "--cc": info.color }}
                          onClick={() => { setSelectedSubject(sub); setSelectedTopics([]); }}>
                          <div className="ci">{info.icon}</div>
                          <div className="ct">{sub}</div>
                          <div className="cs">{info.topics.length} topics · {tot} practiced</div>
                          <div className="cst">
                            <div className="sbar"><div className="sfill" style={{ width: `${acc}%` }} /></div>
                            <div className="spct">{acc}%</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="section-header">
                    <div className="section-title">Topics — {selectedSubject}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "Space Mono" }}>{selectedTopics.length} selected</div>
                  </div>
                  <div className="tgrid" style={{ "--ac": subjectColor }}>
                    {SUBJECTS[selectedSubject].topics.map(t => {
                      const wk = weakAreas[t], isWeak = wk && wk.accuracy < 55 && wk.count >= 2;
                      return (
                        <div key={t} className={`tc ${selectedTopics.includes(t) ? "sel" : ""}`}
                          onClick={() => setSelectedTopics(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t])}>
                          <span>{t}</span>{isWeak && <span className="tw">⚠ Weak</span>}
                        </div>
                      );
                    })}
                  </div>

                  <div className="sp">
                    <div className="spt">Configure Your Session</div>
                    <div className="sps">AI generates fresh PYQ-pattern questions every time</div>
                    <div className="crow">
                      <div style={{ fontSize: 13, color: "var(--muted)", display: "flex", alignItems: "center" }}>Questions:</div>
                      {[5, 10, 15, 20].map(n => <div key={n} className={`cchip ${questionCount === n ? "sel" : ""}`} onClick={() => setQuestionCount(n)}>{n} Qs</div>)}
                    </div>
                    <div className="crow">
                      <div style={{ fontSize: 13, color: "var(--muted)", display: "flex", alignItems: "center" }}>Difficulty:</div>
                      {["Easy", "Mixed", "Hard"].map(d => <div key={d} className={`cchip ${difficultyMode === d ? "sel" : ""}`} onClick={() => setDifficultyMode(d)}>{d}</div>)}
                    </div>
                    {getWeakTopics().length > 0 && (
                      <div style={{ marginBottom: 20, padding: "12px 20px", background: "rgba(255,59,92,.05)", border: "1px solid rgba(255,59,92,.2)", borderRadius: 12, fontSize: 13, color: "#ff8fa3" }}>
                        🎯 Weak areas detected: <strong>{getWeakTopics().join(", ")}</strong> — AI will target these
                      </div>
                    )}
                    <button className="btn-p" disabled={!selectedTopics.length} onClick={startQuiz}>
                      Start Test — {questionCount} Questions
                    </button>
                    {!selectedTopics.length && <div style={{ marginTop: 12, fontSize: 12, color: "var(--muted)" }}>Select at least one topic to begin</div>}
                  </div>

                  {Object.keys(weakAreas).length > 0 && (
                    <div style={{ marginTop: 24 }}>
                      <div className="section-header"><div className="section-title">Weak Area Tracker</div></div>
                      <div className="sdcard" style={{ background: "var(--surface)" }}>
                        {Object.entries(weakAreas).sort((a, b) => a[1].accuracy - b[1].accuracy).slice(0, 6).map(([t, d]) => (
                          <div key={t} className="war">
                            <div style={{ fontSize: 18 }}>{d.accuracy < 40 ? "🔴" : d.accuracy < 65 ? "🟡" : "🟢"}</div>
                            <div className="winfo">
                              <div className="wname">{t}</div>
                              <div className="wstat">{d.count} attempts · avg {Math.round(d.totalTime / d.count)}s</div>
                              <div className="wbar"><div className="wfill" style={{ width: `${d.accuracy}%`, background: d.accuracy < 40 ? "#ff3b5c" : d.accuracy < 65 ? "#f59e0b" : "#10b981" }} /></div>
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "Space Mono", color: d.accuracy < 40 ? "#ff3b5c" : d.accuracy < 65 ? "#f59e0b" : "#10b981" }}>{d.accuracy}%</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* QUIZ — show skeleton while first question loads, real UI after */}
              {screen === "quiz" && (
                !q ? <QuestionSkeleton /> : (
                  <div className="qlayout">
                    <div>
                      <div className="qhdr">
                        <div className="qbadge">Q{currentQ + 1}/{questions.length}</div>
                        <div className="qtbadge" style={{ background: `${subjectColor}15`, color: subjectColor, border: `1px solid ${subjectColor}40` }}>{q.topic}</div>
                        <div className={`tbadge ${timerClass}`}>⏱ {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:{String(timeLeft % 60).padStart(2, "0")}</div>
                      </div>
                      <div className="qcard">
                        <div className="qmeta">
                          <div className={`qdiff diff-${q.difficulty?.toLowerCase()}`}>{q.difficulty}</div>
                          <div className="qpyq">{q.pyq}</div>
                        </div>
                        <div className="qtext">{q.question}</div>
                        {q.formula && <div className="qformula">{q.formula}</div>}
                        <div className="opts">
                          {q.options.map((opt, i) => {
                            let cls = "";
                            if (answered !== undefined) { if (i === q.correct) cls = "correct"; else if (i === answered) cls = "wrong"; }
                            return (
                              <button key={i} className={`opt ${cls}`} onClick={() => handleAnswer(i)} disabled={answered !== undefined}>
                                <div className="olabel">{["A", "B", "C", "D"][i]}</div>
                                <span>{opt.replace(/^[A-D]\)\s*/, "")}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      {answered !== undefined && (
                        <div className="expcard">
                          <div className="exphdr">
                            <div className="expicon">{answered === q.correct ? "✅" : answered === -1 ? "⏭" : "❌"}</div>
                            <div className="exptitle">{answered === q.correct ? "Correct! +4 marks" : answered === -1 ? "Skipped — 0 marks" : "Wrong — −1 mark"}</div>
                          </div>
                          {loadingExplanation ? (
                            <div className="ldots"><div style={{ display: "flex", gap: 4 }}>{[0, 1, 2].map(i => <div key={i} className="ldot" />)}</div>AI generating explanation...</div>
                          ) : exp ? (
                            <>
                              <div className="expbody" style={{ whiteSpace: "pre-line" }}>{exp.explanation}</div>
                              {exp.keyFormula && <div className="expf">📐 {exp.keyFormula}</div>}
                              {exp.concept && <div style={{ marginTop: 10, fontSize: 12, color: "#a78bfa", fontWeight: 600 }}>💡 {exp.concept}</div>}
                              {exp.tip && <div style={{ marginTop: 8, fontSize: 12, color: "var(--warning)", background: "rgba(245,158,11,.05)", border: "1px solid rgba(245,158,11,.15)", borderRadius: 8, padding: "8px 12px" }}>⚡ {exp.tip}</div>}
                            </>
                          ) : null}
                        </div>
                      )}
                      <div className="actrow">
                        {answered === undefined && <button className="btn-s" onClick={skipQuestion}>Skip →</button>}
                        {answered !== undefined && currentQ + 1 < questions.length && <button className="btn-a" onClick={nextQuestion}>Next Question →</button>}
                        {answered !== undefined && currentQ + 1 >= questions.length && <button className="btn-a" onClick={saveSessionAndResults}>View Results 🏁</button>}
                        <button className="btn-d" style={{ marginLeft: "auto" }} onClick={saveSessionAndResults}>End Test</button>
                      </div>
                    </div>
                    {/* Sidebar */}
                    <div>
                      <div className="sdcard">
                        <div className="sdtitle">Live Score</div>
                        <div className="scdisp">
                          <div className="scnum" style={{ color: score >= 0 ? "var(--success)" : "var(--danger)" }}>{score >= 0 ? "+" : ""}{score}</div>
                          <div className="scdenom">/{maxScore} marks</div>
                        </div>
                        <div className="scbr">
                          <div className="scrow"><span className="scl">Correct</span><span className="scv ok">{correct} × +4</span></div>
                          <div className="scrow"><span className="scl">Wrong</span><span className="scv ng">{wrong} × −1</span></div>
                          <div className="scrow"><span className="scl">Skipped</span><span className="scv sk">{skipped}</span></div>
                        </div>
                      </div>
                      <div className="sdcard">
                        <div className="sdtitle">Question Map</div>
                        <div className="qnav">
                          {questions.map((_, i) => {
                            const a = answers[i]; let cls = i === currentQ ? "cur" : "";
                            if (a !== undefined && i !== currentQ) cls = a === -1 ? "ask" : a === questions[i].correct ? "aok" : "ang";
                            return <button key={i} className={`qnb ${cls}`} onClick={() => { if (a !== undefined || i <= currentQ) setCurrentQ(i); }}>{i + 1}</button>;
                          })}
                        </div>
                      </div>
                      {getWeakTopics().length > 0 && (
                        <div className="sdcard">
                          <div className="sdtitle">AI Focus Areas</div>
                          {getWeakTopics().map(t => <div key={t} style={{ fontSize: 12, color: "var(--danger)", padding: "4px 0", display: "flex", gap: 6 }}>🎯 {t}</div>)}
                        </div>
                      )}
                    </div>
                  </div>
                )
              )}

              {/* RESULTS */}
              {screen === "results" && (
                <div className="rpage">
                  <div className="rhero">
                    <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 8, fontFamily: "Space Mono" }}>FINAL SCORE</div>
                    <div className="rbig" style={{ color: score >= 0 ? "var(--success)" : "var(--danger)" }}>{score >= 0 ? "+" : ""}{score}</div>
                    <div className="rlbl">out of {maxScore} marks · {maxScore > 0 ? Math.round(score / maxScore * 100) : 0}% efficiency</div>
                    <div className="rrow">
                      <div className="rstat"><div className="rsnum" style={{ color: "var(--success)" }}>{correct}</div><div className="rslbl">Correct</div></div>
                      <div className="rstat"><div className="rsnum" style={{ color: "var(--danger)" }}>{wrong}</div><div className="rslbl">Wrong</div></div>
                      <div className="rstat"><div className="rsnum" style={{ color: "var(--muted)" }}>{skipped}</div><div className="rslbl">Skipped</div></div>
                      <div className="rstat"><div className="rsnum" style={{ color: "#00d4ff" }}>{Object.values(timePerQ).length ? Math.round(Object.values(timePerQ).reduce((a, b) => a + b, 0) / Object.values(timePerQ).length) : 0}s</div><div className="rslbl">Avg Time/Q</div></div>
                    </div>
                  </div>
                  <ExamAnalysis
                    questions={questions} answers={answers}
                    timePerQ={timePerQ} subject={selectedSubject}
                    weakAreas={weakAreas}
                  />
                  <div className="ranalysis">
                    <div className="ratitle">🤖 AI Insights</div>
                    <div style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.8 }}>
                      {correct / questions.length >= 0.8 ? "🏆 Excellent! You're mastering these concepts." :
                        correct / questions.length >= 0.6 ? "📈 Good progress. Focus on weak topics for improvement." :
                          "🎯 Keep practicing! AI has identified your weak areas for next session."}
                    </div>
                    {getWeakTopics().length > 0 && (
                      <div style={{ marginTop: 12, padding: "12px 16px", background: "rgba(255,59,92,.05)", border: "1px solid rgba(255,59,92,.2)", borderRadius: 10, fontSize: 13 }}>
                        Priority revision: <strong style={{ color: "var(--danger)" }}>{getWeakTopics().join(", ")}</strong>
                      </div>
                    )}
                  </div>
                  <div className="ract">
                    <button className="btn-s" onClick={() => { setScreen("dashboard"); setQuestions([]); setAnswers({}); }}>← Dashboard</button>
                    <button className="btn-a" onClick={() => setActiveTab("analysis")}>📊 Full Analysis</button>
                    <button className="btn-p" onClick={() => { setAnswers({}); setExplanations({}); setCurrentQ(0); startQuiz(); }}>Retry — New Questions</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}