import React from "react";
import { Link } from "react-router-dom";

export default function Navbar(props) {
  const textMode = props.mode === "light" ? "dark" : "light";

  return (
    <nav className={`navbar navbar-expand-lg navbar-${props.mode} bg-${props.mode}`}>
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">Student Dash</Link>
        
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {/* Links only visible when logged in */}
            {props.user && (
              <>
                <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/about">About</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/ai">AI</Link></li>
                <li className="nav-item"><Link className="nav-link" to="/timetable">TimeTable</Link></li>
              </>
            )}
          </ul>

          <div className="d-flex align-items-center">
            {/* LOGIN/LOGOUT BUTTON LOGIC */}
            {props.user ? (
              <div className="d-flex align-items-center me-3">
                <span className={`badge bg-info text-dark me-2`}>{props.user}</span>
                <button className="btn btn-sm btn-outline-danger" onClick={props.logout}>Logout</button>
              </div>
            ) : (
              <Link className="btn btn-sm btn-primary me-3" to="/login">Login / Sign Up</Link>
            )}

            <div className="form-check form-switch">
              <input className="form-check-input" type="checkbox" onClick={props.toggleMode} id="switchCheckDefault" />
              <label className={`form-check-label text-${textMode}`} htmlFor="switchCheckDefault">Dark Mode</label>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}