import './App.css';
import React, { useEffect, useRef, useState } from 'react';

function MessageBubble({ text, sender, time }) {
  return (
    <div className={`message-row ${sender}`}>
      <div className="avatar" aria-hidden="true">
        {sender === 'bot' ? '🤖' : '🙂'}
      </div>
      <div className={`message ${sender}`}>
        <div className="message-text">{text}</div>
        {time && <div className="message-meta">{time}</div>}
      </div>
    </div>
  );
}

function App() {
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState([
    { text: 'Hello! How can I help you today?', sender: 'bot', time: new Date().toLocaleTimeString() }
  ]);

  const listRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isSending) return;

    const userMessage = {
      text: trimmed,
      sender: 'user',
      time: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsSending(true);

    try {
      const response = await fetch('http://localhost:8080/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      });

      const data = await response.json();

      const botMessage = {
        text: data?.message ?? "Hmm, I didn't get a response.",
        sender: 'bot',
        time: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.log('Error connecting to the backend: ', error);
      setMessages((prev) => [
        ...prev,
        {
          text: "Sorry, I couldn't connect to the server. Please try again later.",
          sender: 'bot',
          time: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="App">
      <div className="chat-container" role="main" aria-label="Chat interface">
        <header className="chat-header">
          <h1>LLM Playground</h1>
        </header>

        <div className="message-list" ref={listRef} aria-live="polite">
          {messages.map((m, i) => (
            <MessageBubble key={i} text={m.text} sender={m.sender} time={m.time} />
          ))}

          {isSending && (
            <div className="typing">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </div>
          )}
        </div>

        <form
          className="input-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          aria-label="Message input"
        >
          <textarea
            className="input-textarea"
            placeholder="Type your message… (Enter to send, Shift+Enter for newline)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
          />
          <button
            type="submit"
            className="send-button"
            disabled={isSending || !inputValue.trim()}
            aria-disabled={isSending || !inputValue.trim()}
          >
            {isSending ? 'Sending…' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;