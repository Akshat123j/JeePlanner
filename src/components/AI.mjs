import React, { useState, useRef, useEffect } from 'react';

export default function App(props) {
  return (
    <div className="container" style={{ height: '100vh' }}>
      <ChatApp mode={props.mode} toggleMode={props.toggleMode} />
    </div>
  );
}

function ChatApp(props) {
  const [messages, setMessages] = useState([
    { role: 'model', text: 'Hi! I am your AI Doubt Solver powered by Gemini. Ask me anything about your studies!' }
  ]);

  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (apiKey) localStorage.setItem('gemini_api_key', apiKey);
  }, [apiKey]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const clearChat = () => {
    if (window.confirm("Clear all messages?")) {
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

  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;
    if (!apiKey.trim()) {
      alert("Please paste your Gemini API Key at the top!");
      return;
    }

    // FIX: Capture input BEFORE clearing it
    const currentInput = input;
    const currentImage = selectedImage;

    const newUserMessage = { role: 'user', text: currentInput, image: imagePreview };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);

    setInput('');
    setSelectedImage(null);
    setImagePreview(null);
    setIsLoading(true);

    try {
      // Build conversation history — use currentInput for the last message
      const contents = updatedMessages.map((msg, idx) => {
        const parts = [];
        // For the last message, use currentInput (state is already cleared)
        const text = idx === updatedMessages.length - 1 ? currentInput : msg.text;
        if (text) parts.push({ text });
        return { role: msg.role === 'user' ? 'user' : 'model', parts };
      });

      // Attach image to last user message
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
For math/science problems, show full working.`
              }]
            },
            generationConfig: { temperature: 0.3, maxOutputTokens: 1024 }
          })
        }
      );

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error("Empty response from Gemini.");
      }

      const aiText = data.candidates[0].content.parts[0].text;
      setMessages(prev => [...prev, { role: 'model', text: aiText }]);

    } catch (error) {
      console.error("Gemini error:", error);
      setMessages(prev => [...prev, {
        role: 'model',
        text: `⚠️ Error: ${error.message}. Check your API key or try again.`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const isDark = props.mode === 'dark';
  const themeBg = isDark ? 'bg-dark' : 'bg-white';
  const themeText = isDark ? 'text-white' : 'text-dark';
  const themeBorder = isDark ? 'border-secondary' : 'border-light-subtle';

  return (
    <div className={`d-flex flex-column h-100 ${themeBg} ${themeText} shadow`}>
      {/* Header */}
      <div className={`p-3 d-flex justify-content-between align-items-center border-bottom ${themeBorder}`}>
        <h3 className="m-0 fs-5">🤖 Gemini Doubt Solver</h3>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <input
            type="password"
            placeholder="Paste Gemini API Key"
            className={`form-control form-control-sm ${isDark ? 'bg-dark text-white border-secondary' : ''}`}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            style={{ width: '185px' }}
          />
          <button onClick={clearChat} className="btn btn-sm btn-outline-danger" title="Clear Chat">🗑️</button>
          {props.toggleMode && (
            <button
              onClick={props.toggleMode}
              className={`btn btn-sm ${isDark ? 'btn-outline-light' : 'btn-outline-dark'}`}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          )}
        </div>
      </div>

      {/* Chat History */}
      <div
        className="flex-grow-1 overflow-auto p-4 d-flex flex-column gap-3"
        style={{ background: isDark ? '#1a1a1a' : '#f8f9fa' }}
      >
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={index}
              className={`p-3 rounded-4 shadow-sm ${
                isUser
                  ? 'align-self-end bg-primary text-white'
                  : `align-self-start ${isDark ? 'bg-secondary text-white' : 'bg-white text-dark border'}`
              }`}
              style={{ maxWidth: '82%', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
            >
              {msg.image && (
                <img src={msg.image} alt="uploaded" className="img-fluid rounded mb-2 border" style={{ maxHeight: '200px' }} />
              )}
              <div>{msg.text}</div>
            </div>
          );
        })}

        {isLoading && (
          <div className="align-self-start d-flex align-items-center gap-2 text-muted small ms-2">
            <span className="spinner-border spinner-border-sm"></span>
            Gemini is thinking...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className={`p-3 border-top d-flex gap-2 align-items-center ${themeBorder} ${isDark ? 'bg-dark' : 'bg-white'}`}>
        <input type="file" accept="image/*" id="file-upload" className="d-none" onChange={handleImageChange} />
        <label
          htmlFor="file-upload"
          className={`btn m-0 d-flex align-items-center justify-content-center ${isDark ? 'btn-secondary' : 'btn-light border'}`}
          style={{ width: '42px', height: '42px', flexShrink: 0 }}
          title="Attach image"
        >📷</label>

        {imagePreview && (
          <div className="position-relative" style={{ width: '42px', height: '42px', flexShrink: 0 }}>
            <img src={imagePreview} alt="preview" className="w-100 h-100 rounded border" style={{ objectFit: 'cover' }} />
            <button
              onClick={() => { setSelectedImage(null); setImagePreview(null); }}
              className="btn btn-danger btn-sm position-absolute top-0 start-100 translate-middle rounded-circle p-0 d-flex align-items-center justify-content-center"
              style={{ width: '18px', height: '18px', fontSize: '10px' }}
            >✕</button>
          </div>
        )}

        <input
          type="text"
          placeholder="Ask a doubt... (Enter to send)"
          className={`form-control ${isDark ? 'bg-dark text-white border-secondary' : ''}`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
        />

        <button onClick={handleSend} disabled={isLoading} className="btn btn-primary px-3" style={{ flexShrink: 0 }}>
          {isLoading ? <span className="spinner-border spinner-border-sm"></span> : 'Send'}
        </button>
      </div>
    </div>
  );
}