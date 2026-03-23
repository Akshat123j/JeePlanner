import React, { useState, useRef, useEffect, useCallback } from 'react';

export default function App(props) {
  return (
    <div style={{ height: '100vh', fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <ChatApp mode={props.mode} toggleMode={props.toggleMode} />
    </div>
  );
}

// Utility: strip markdown for TTS
function stripMarkdown(text) {
  return text
    .replace(/#{1,6}\s*/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/>\s.*/g, '')
    .replace(/[-*+]\s/g, '')
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, ' ')
    .trim();
}

function ChatApp(props) {
  const [messages, setMessages] = useState([
    { role: 'model', text: 'Hi! I am your AI Doubt Solver. Ask me anything — type, attach an image, or use the mic to speak!' }
  ]);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');

  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  const isDark = props.mode === 'dark';

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSpeechSupported(!!SpeechRecognition);
    setTtsSupported('speechSynthesis' in window);
  }, []);

  useEffect(() => {
    if (apiKey) localStorage.setItem('gemini_api_key', apiKey);
  }, [apiKey]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Stop speaking on unmount
  useEffect(() => () => synthRef.current?.cancel(), []);

  /* ─── Speech-to-Text ─── */
  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => { setIsListening(false); setTranscript(''); };

    recognition.onresult = (e) => {
      let interim = '';
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      setTranscript(interim || final);
      if (final) setInput(prev => (prev + ' ' + final).trim());
    };

    recognition.onerror = (e) => {
      console.error('Speech error:', e.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const toggleListening = () => {
    if (isListening) stopListening();
    else startListening();
  };

  /* ─── Text-to-Speech ─── */
  const speak = useCallback((text, index) => {
    if (!ttsSupported) return;
    synthRef.current.cancel();

    const clean = stripMarkdown(text);
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = 'en-IN';

    // Try to pick a natural voice
    const voices = synthRef.current.getVoices();
    const preferred = voices.find(v =>
      v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Neural'))
    ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => { setIsSpeaking(true); setSpeakingIndex(index); };
    utterance.onend = () => { setIsSpeaking(false); setSpeakingIndex(null); };
    utterance.onerror = () => { setIsSpeaking(false); setSpeakingIndex(null); };

    synthRef.current.speak(utterance);
  }, [ttsSupported]);

  const stopSpeaking = useCallback(() => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
    setSpeakingIndex(null);
  }, []);

  /* ─── Helpers ─── */
  const clearChat = () => {
    if (window.confirm('Clear all messages?')) {
      stopSpeaking();
      setMessages([{ role: 'model', text: 'Chat cleared! How can I help?' }]);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const fileToGenerativePart = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve({
        inline_data: { data: reader.result.split(',')[1], mime_type: file.type }
      });
      reader.readAsDataURL(file);
    });

  /* ─── Send Message ─── */
  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;
    if (!apiKey.trim()) { alert('Please paste your Gemini API Key at the top!'); return; }

    stopSpeaking();
    const currentInput = input;
    const currentImage = selectedImage;

    const newUserMessage = { role: 'user', text: currentInput, image: imagePreview };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInput(''); setSelectedImage(null); setImagePreview(null);
    setIsLoading(true);

    try {
      const contents = updatedMessages.map((msg, idx) => {
        const parts = [];
        const text = idx === updatedMessages.length - 1 ? currentInput : msg.text;
        if (text) parts.push({ text });
        return { role: msg.role === 'user' ? 'user' : 'model', parts };
      });

      if (currentImage) {
        const imagePart = await fileToGenerativePart(currentImage);
        contents[contents.length - 1].parts.push(imagePart);
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            systemInstruction: {
              parts: [{
                text: `You are an expert tutor helping competitive exam students (JEE, NEET, UPSC).
Give clear, concise, step-by-step explanations. Use simple language.
For math/science problems, show full working. Keep answers concise when spoken aloud.`
              }]
            },
            generationConfig: { temperature: 0.3, maxOutputTokens: 1024 }
          })
        }
      );

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) throw new Error('Empty response from Gemini.');

      const aiText = data.candidates[0].content.parts[0].text;
      const newIndex = updatedMessages.length; // index of the about-to-be-added model message
      setMessages(prev => [...prev, { role: 'model', text: aiText }]);

      if (autoSpeak) {
        // slight delay to let state settle
        setTimeout(() => speak(aiText, newIndex), 100);
      }
    } catch (error) {
      const errMsg = `⚠️ Error: ${error.message}. Check your API key or try again.`;
      setMessages(prev => [...prev, { role: 'model', text: errMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  /* ─── Styles ─── */
  const bg = isDark ? '#0f0f0f' : '#f5f4f0';
  const surface = isDark ? '#1a1a1a' : '#ffffff';
  const surfaceAlt = isDark ? '#222222' : '#f0ede8';
  const border = isDark ? '#2e2e2e' : '#e2ddd8';
  const textPrimary = isDark ? '#f0ede8' : '#1a1918';
  const textMuted = isDark ? '#666' : '#999';
  const accent = '#e8642c';
  const accentLight = isDark ? 'rgba(232,100,44,0.15)' : 'rgba(232,100,44,0.08)';

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      background: bg, color: textPrimary,
      fontFamily: "'DM Sans', sans-serif"
    }}>
      {/* ── Header ── */}
      <div style={{
        padding: '12px 20px', borderBottom: `1px solid ${border}`,
        background: surface, display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', gap: 10, flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: accent, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 18
          }}>🤖</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.2 }}>Doubt Solver</div>
            <div style={{ fontSize: 11, color: textMuted }}>Powered by Gemini</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Auto-speak toggle */}
          {ttsSupported && (
            <button
              onClick={() => setAutoSpeak(p => !p)}
              title={autoSpeak ? 'Auto-speak ON' : 'Auto-speak OFF'}
              style={{
                border: `1px solid ${autoSpeak ? accent : border}`,
                background: autoSpeak ? accentLight : 'transparent',
                color: autoSpeak ? accent : textMuted,
                borderRadius: 8, padding: '5px 10px',
                cursor: 'pointer', fontSize: 12, fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: 4
              }}
            >
              {autoSpeak ? '🔊' : '🔇'} Auto-read
            </button>
          )}

          <input
            type="password"
            placeholder="Gemini API Key"
            style={{
              border: `1px solid ${border}`, background: surfaceAlt, color: textPrimary,
              borderRadius: 8, padding: '6px 10px', fontSize: 13,
              width: 180, fontFamily: 'inherit', outline: 'none'
            }}
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
          />

          <button onClick={clearChat} title="Clear Chat" style={iconBtnStyle(border, textMuted)}>🗑️</button>
          {props.toggleMode && (
            <button onClick={props.toggleMode} title="Toggle theme" style={iconBtnStyle(border, textMuted)}>
              {isDark ? '☀️' : '🌙'}
            </button>
          )}
        </div>
      </div>

      {/* ── Chat Area ── */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '20px 16px',
        display: 'flex', flexDirection: 'column', gap: 12, background: bg
      }}>
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          const isThisSpeaking = speakingIndex === index && isSpeaking;
          return (
            <div key={index} style={{
              display: 'flex',
              justifyContent: isUser ? 'flex-end' : 'flex-start',
              alignItems: 'flex-end', gap: 6
            }}>
              {!isUser && (
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: accent, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 14, flexShrink: 0
                }}>🤖</div>
              )}

              <div style={{ maxWidth: '78%', display: 'flex', flexDirection: 'column', gap: 4,
                alignItems: isUser ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  background: isUser ? accent : surface,
                  color: isUser ? '#fff' : textPrimary,
                  borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  padding: '10px 14px',
                  border: isUser ? 'none' : `1px solid ${border}`,
                  fontSize: 14, lineHeight: 1.6,
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  boxShadow: isThisSpeaking ? `0 0 0 2px ${accent}` : 'none',
                  transition: 'box-shadow 0.2s'
                }}>
                  {msg.image && (
                    <img src={msg.image} alt="uploaded"
                      style={{ maxHeight: 160, borderRadius: 8, marginBottom: 8, display: 'block' }} />
                  )}
                  {msg.text}
                </div>

                {/* TTS button for model messages */}
                {!isUser && ttsSupported && (
                  <button
                    onClick={() => isThisSpeaking ? stopSpeaking() : speak(msg.text, index)}
                    style={{
                      border: `1px solid ${isThisSpeaking ? accent : border}`,
                      background: isThisSpeaking ? accentLight : 'transparent',
                      color: isThisSpeaking ? accent : textMuted,
                      borderRadius: 6, padding: '2px 8px',
                      cursor: 'pointer', fontSize: 11, fontFamily: 'inherit',
                      display: 'flex', alignItems: 'center', gap: 4
                    }}
                  >
                    {isThisSpeaking ? (
                      <><SoundWave />&nbsp;Stop</>
                    ) : '▶ Read aloud'}
                  </button>
                )}
              </div>

              {isUser && (
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: surfaceAlt, border: `1px solid ${border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, flexShrink: 0
                }}>👤</div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 34 }}>
            <TypingDots color={accent} />
            <span style={{ color: textMuted, fontSize: 13 }}>Gemini is thinking…</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* ── Input Area ── */}
      <div style={{
        borderTop: `1px solid ${border}`, background: surface,
        padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8
      }}>
        {/* Interim transcript hint */}
        {isListening && transcript && (
          <div style={{
            fontSize: 12, color: accent, padding: '4px 8px',
            background: accentLight, borderRadius: 6, fontStyle: 'italic'
          }}>
            🎙 {transcript}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Image attach */}
          <input type="file" accept="image/*" id="file-upload" style={{ display: 'none' }} onChange={handleImageChange} />
          <label htmlFor="file-upload" title="Attach image" style={{
            ...iconBtnStyle(border, textMuted), cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>📷</label>

          {/* Image preview */}
          {imagePreview && (
            <div style={{ position: 'relative', width: 40, height: 40, flexShrink: 0 }}>
              <img src={imagePreview} alt="preview" style={{
                width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8,
                border: `1px solid ${border}`
              }} />
              <button
                onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                style={{
                  position: 'absolute', top: -6, right: -6,
                  width: 18, height: 18, borderRadius: '50%',
                  background: '#e53935', border: 'none', color: '#fff',
                  fontSize: 10, cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center'
                }}
              >✕</button>
            </div>
          )}

          {/* Text input */}
          <input
            type="text"
            placeholder={isListening ? '🎙 Listening…' : 'Ask a doubt… (Enter to send)'}
            style={{
              flex: 1, border: `1px solid ${isListening ? accent : border}`,
              background: isListening ? accentLight : surfaceAlt,
              color: textPrimary, borderRadius: 10, padding: '9px 14px',
              fontSize: 14, fontFamily: 'inherit', outline: 'none',
              transition: 'border-color 0.2s, background 0.2s'
            }}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !isLoading && handleSend()}
          />

          {/* Mic button */}
          {speechSupported && (
            <button
              onClick={toggleListening}
              title={isListening ? 'Stop recording' : 'Speak your question'}
              style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                border: `1px solid ${isListening ? accent : border}`,
                background: isListening ? accent : 'transparent',
                color: isListening ? '#fff' : textMuted,
                cursor: 'pointer', fontSize: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: isListening ? 'pulse 1s infinite' : 'none',
                transition: 'all 0.2s'
              }}
            >
              🎙
            </button>
          )}

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={isLoading}
            style={{
              height: 40, padding: '0 18px', borderRadius: 10,
              background: accent, color: '#fff', border: 'none',
              fontFamily: 'inherit', fontWeight: 600, fontSize: 14,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1, flexShrink: 0,
              display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            {isLoading ? <MiniSpinner /> : 'Send'}
          </button>
        </div>

        {/* Feature hints */}
        {(speechSupported || ttsSupported) && (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {speechSupported && (
              <span style={{ fontSize: 11, color: textMuted }}>
                🎙 Tap mic to speak your question
              </span>
            )}
            {ttsSupported && (
              <span style={{ fontSize: 11, color: textMuted }}>
                🔊 Tap ▶ on any reply to hear it read aloud
              </span>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(232,100,44,0.4); }
          50% { box-shadow: 0 0 0 8px rgba(232,100,44,0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; } 50% { opacity: 0.3; }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: ${border}; border-radius: 4px; }
      `}</style>
    </div>
  );
}

/* ─── Small components ─── */
function iconBtnStyle(border, color) {
  return {
    width: 38, height: 38, borderRadius: 8,
    border: `1px solid ${border}`, background: 'transparent',
    color, cursor: 'pointer', fontSize: 16,
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  };
}

function MiniSpinner() {
  return (
    <div style={{
      width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)',
      borderTopColor: '#fff', borderRadius: '50%',
      animation: 'spin 0.7s linear infinite'
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function TypingDots({ color }) {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 6, height: 6, borderRadius: '50%', background: color,
          animation: `blink 1.2s ${i * 0.2}s infinite`
        }} />
      ))}
    </div>
  );
}

function SoundWave() {
  return (
    <span style={{ display: 'inline-flex', gap: 2, alignItems: 'center', height: 12 }}>
      {[1, 2, 1.5].map((h, i) => (
        <span key={i} style={{
          width: 2, height: h * 4, background: 'currentColor', borderRadius: 1,
          animation: `blink 0.8s ${i * 0.15}s infinite`
        }} />
      ))}
    </span>
  );
}