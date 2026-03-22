import React, { useState } from 'react';
// The import stays the same, but we will handle how it's executed below
import pdfToText from 'react-pdftotext';
import axios from 'axios';

const PdfSummarizer = (props) => {
  // 1. Main container style: Added centering, thick borders, and colorful shadows
  const myStyle = {
    backgroundColor: props.mode === "dark" ? "#121212" : "#ffffff",
    color: props.mode === "dark" ? "#f8f9fa" : "#212529",
    padding: '40px', 
    maxWidth: '850px', 
    margin: '40px auto', 
    fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    minHeight: '80vh',
    transition: 'all 0.3s ease',
    textAlign: 'center', // Central text alignment applied here
    border: `4px solid ${props.mode === "dark" ? '#333333' : '#e9ecef'}`,
    borderRadius: '20px',
    boxShadow: props.mode === "dark" 
      ? '0 10px 30px rgba(187, 134, 252, 0.15)' // Subtle purple glow in dark mode
      : '0 10px 30px rgba(0, 123, 255, 0.15)'   // Subtle blue glow in light mode
  };

  // 2. Card style: Added chunky top borders, distinct background tints, and centered text
  const cardStyle = {
    marginBottom: '25px', 
    padding: '30px 20px', 
    borderRadius: '12px', 
    backgroundColor: props.mode === "dark" ? "#1e1e24" : "#f4f7fb", 
    border: `2px solid ${props.mode === "dark" ? '#444' : '#dbe4f0'}`, 
    borderTop: `6px solid ${props.mode === "dark" ? '#bb86fc' : '#007bff'}`, // Colorful accent border
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    transition: 'all 0.3s ease',
    textAlign: 'center' // Ensures card content is perfectly centered
  };

  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🚨 SECURITY WARNING: Do not hardcode your real API key in production!
  const API_KEY = "AIzaSyBkGcYogu3CvsTvO2KhXMPWlxmZrN7SDg0"; 
  const API_URL =  ` https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`;

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setLoading(true);
    
    for (const file of files) {
      try {
        let extractPdf = pdfToText;
        if (typeof extractPdf !== 'function' && extractPdf && typeof extractPdf.default === 'function') {
          extractPdf = extractPdf.default;
        }

        if (typeof extractPdf !== 'function') {
          throw new Error("PDF library failed to load properly. Check your imports.");
        }

        let text = await extractPdf(file);

        if (!text || text.trim() === "") {
          throw new Error("No readable text found in this PDF (it might be scanned images).");
        }

        const payload = {
          contents: [{
            parts: [{ text: `Summarize this text concisely: ${text}` }]
          }]
        };

        const response = await axios.post(API_URL, payload, {
          headers: { 'Content-Type': 'application/json' }
        });

        if (response.data.candidates && response.data.candidates[0].content) {
          const result = response.data.candidates[0].content.parts[0].text;
          setSummaries(prev => [...prev, { name: file.name, text: result }]);
        } else {
           throw new Error("Unexpected API response structure.");
        }

      } catch (error) {
        console.error(`Error processing ${file.name}:`, error.response?.data || error.message);
        const errorMessage = error.response?.data?.error?.message || error.message;
        setSummaries(prev => [...prev, { name: file.name, text: `❌ Error: ${errorMessage}` }]);
      }
    }
    
    setLoading(false);
    e.target.value = null; 
  };

  return (
    <div style={myStyle}>
      {/* Colorful Heading */}
      <h2 style={{ 
        color: props.mode === "dark" ? '#bb86fc' : '#007bff', 
        marginBottom: '30px',
        fontSize: '2.2rem',
        textTransform: 'uppercase',
        letterSpacing: '1px'
      }}>
        PDF Summarizer
      </h2>
      
      {/* Styled Input Area */}
      <div style={{
        border: `2px dashed ${props.mode === "dark" ? '#bb86fc' : '#007bff'}`,
        padding: '30px',
        borderRadius: '12px',
        backgroundColor: props.mode === "dark" ? 'rgba(187, 134, 252, 0.05)' : 'rgba(0, 123, 255, 0.05)',
        marginBottom: '30px'
      }}>
        <input 
          type="file" 
          multiple 
          accept=".pdf" 
          onChange={handleFileUpload} 
          disabled={loading}
          style={{ 
            color: props.mode === "dark" ? "white" : "black",
            fontSize: '16px',
            cursor: 'pointer'
          }}
        />
      </div>

      {loading && (
        <p style={{ 
          color: props.mode === "dark" ? '#66b2ff' : '#0056b3', 
          fontWeight: 'bold',
          fontSize: '18px',
          padding: '15px',
          backgroundColor: props.mode === "dark" ? 'rgba(102, 178, 255, 0.1)' : 'rgba(0, 86, 179, 0.1)',
          borderRadius: '8px'
        }}>
          ⏳ Extracting text & generating summaries... Please wait.
        </p>
      )}

      {/* Summary Cards Container */}
      <div style={{ marginTop: '40px' }}>
        {summaries.map((item, index) => (
          <div key={index} style={cardStyle}>
            <strong style={{ 
              display: 'block', 
              marginBottom: '15px', 
              fontSize: '1.3em',
              color: props.mode === "dark" ? '#bb86fc' : '#0056b3'
            }}>
              📄 {item.name}
            </strong>
            <p style={{ 
              lineHeight: '1.8', 
              fontSize: '16px', 
              whiteSpace: 'pre-wrap', 
              color: props.mode === "dark" ? '#e0e0e0' : '#444444',
              margin: '0 auto',
              maxWidth: '90%' // Keeps the text from stretching too far horizontally
            }}>
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PdfSummarizer;