import React, { useState, useEffect } from 'react';

const quotes = [
  "The secret of getting ahead is getting started.",
  "Don’t stop until you’re proud.",
  "Focus on being productive instead of busy.",
  "It always seems impossible until it's done.",
  "Success is the sum of small efforts, repeated day in and day out.",
  "Your future self will thank you for studying today."
];
const StudyCard = (props) => {

  const [quote, setQuote] = useState("");

  useEffect(() => {
    // Selects a random quote on component mount
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
  }, []);

  return (
    <div
      className={`card shadow-lg p-4 mx-auto ${props.mode === "light" ? "bg-light text-dark" : "bg-dark text-white"}`}
      style={{
        width: "100%",
        maxWidth: "420px",
        border: "none",
        borderRadius: "15px",
        textAlign: "center",
      }}
    >
      <i className="bi bi-quote mb-2" style={{ fontSize: "1.5rem", opacity: 0.5 }}></i>
      <p style={{ 
        fontStyle: "italic", 
        fontSize: "1.1rem", 
        fontWeight: "500",
        lineHeight: "1.5" 
      }}>
        "{quote}"
      </p>
      <hr style={{ width: "30%", margin: "15px auto", opacity: 0.2 }} />
      <small style={{ opacity: 0.6 }}>Keep Pushing!</small>
    </div>
  );
};

export default StudyCard;