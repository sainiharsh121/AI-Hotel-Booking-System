import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';

const STARTERS = [
  'Which room suits a couple?',
  'I am travelling with my family',
  'What is the cheapest room?',
  'Tell me about the suites'
];

const GREETING = {
  role: 'agent',
  text: 'Hello. I can help you choose a room, compare prices, or suggest one for your group. What are you planning?'
};

// The backend marks emphasis with **double asterisks**; render it as bold text.
const renderText = (text) =>
  text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : <React.Fragment key={i}>{part}</React.Fragment>
  );

export default function AgentPage({ onNavigate }) {
  const [messages, setMessages] = useState([GREETING]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const logRef = useRef(null);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, sending]);

  const send = async (raw) => {
    const message = raw.trim();
    if (!message || sending) return;

    const history = messages
      .filter((m) => m !== GREETING)
      .slice(-10)
      .map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text }));

    setMessages((prev) => [...prev, { role: 'user', text: message }]);
    setDraft('');
    setError('');
    setSending(true);
    try {
      const res = await api.chat(message, history);
      setMessages((prev) => [
        ...prev,
        { role: 'agent', text: res.reply, category: res.suggested_category }
      ]);
    } catch (err) {
      console.error(err);
      setError('The agent could not be reached. Check that the backend is running, then send your message again.');
    } finally {
      setSending(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    send(draft);
  };

  return (
    <div className="rk-page">
      <header className="rk-page-head">
        <h1 className="rk-page-title">Ask about our rooms</h1>
        <p className="rk-page-lede">
          The agent knows our five room types and their prices. It can suggest one for your group, but it cannot make or change a booking.
        </p>
      </header>

      <div className="rk-chat">
        <div className="rk-chat-log" ref={logRef} role="log" aria-live="polite" aria-label="Conversation with the room agent">
          {messages.map((m, i) => (
            <div key={i} className={`rk-msg ${m.role === 'user' ? 'is-user' : 'is-agent'}`}>
              <p className="rk-msg-text">{renderText(m.text)}</p>
              {m.category && (
                <button type="button" className="rk-msg-action" onClick={() => onNavigate('rooms')}>
                  See {m.category} rooms
                </button>
              )}
            </div>
          ))}
          {sending && <p className="rk-chat-status" role="status">The agent is typing…</p>}
        </div>

        {error && <p className="rk-chat-error" role="alert">{error}</p>}

        <div className="rk-starters" role="group" aria-label="Suggested questions">
          {STARTERS.map((s) => (
            <button key={s} type="button" className="rk-starter" onClick={() => send(s)} disabled={sending}>
              {s}
            </button>
          ))}
        </div>

        <form className="rk-chat-form" onSubmit={onSubmit}>
          <label htmlFor="rk-chat-input" className="rk-sr-only">Your question</label>
          <input
            id="rk-chat-input"
            type="text"
            className="rk-chat-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type your question"
            autoComplete="off"
            maxLength={500}
          />
          <button type="submit" className="rk-btn" disabled={sending || !draft.trim()}>Send</button>
        </form>
      </div>
    </div>
  );
}
