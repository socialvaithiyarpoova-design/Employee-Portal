import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import chat_bg from '../assets/images/chat_bg.gif';
import SvgContent from '../components/svgcontent.jsx';
import configModule from '../../config.js';

function formatTimeIST(datetime) {
  const date = new Date(datetime);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata'
  });
}

function Chatbot({ ShowChatbotTab }) {
  const session_id = localStorage.getItem('session_id');
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const pyconfig = configModule.config();

  const chatBodyRef = useRef(null);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!query.trim()) return;
    const userMsgObj = {
      isUser: true,
      message: query,
       time: formatTimeIST(new Date()),
    };
    setMessages(msgs => [...msgs, userMsgObj]);
    setQuery('');
    setLoading(true);

    try {
      const response = await fetch(`${pyconfig.apiBaseUrlpy}vpbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id, query }),
      });
      const data = await response.json();
      setMessages(msgs => [
        ...msgs,
        {
          isUser: false,
          message: data?.response || 'Sorry, I did not understand that. Please try again.',
          time: new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          timeZone: 'Asia/Kolkata'
        }),
        },
      ]);
    } catch (error) {
      console.error('Chatbot fetch error:', error);
      setMessages(msgs => [
        ...msgs,
        {
          isUser: false,
          message: 'Error: Unable to connect to server.',
          time:  formatTimeIST(new Date()),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && !loading) handleSend();
  };

  const hasUserMessage = messages.some(msg => msg.isUser);

  return (
    <div className='chatbot-main-st'>
      <div className='chatbot-container-st'>
        <div className='chatbot-head-st'>
          <h5 className='mb-0 fw-semibold'>Chatbot</h5>
          <button
            type="button"
            style={{
              fontSize: "25px",
              cursor: "pointer",
              background: "none",
              border: "none",
              padding: 0,
              lineHeight: 1
            }}
            aria-label="Close chatbot"
            onClick={ShowChatbotTab}
          >
            &times;
          </button>
        </div>
        <div className='chatbot-body-st' ref={chatBodyRef}>
          {!hasUserMessage && (
            <>
              <h6 className='mb-0 fw-semibold'>Welcome!!</h6>
              <p style={{ color: "rgb(157 154 154)" }}>Ask me anything...</p>
              <img src={chat_bg} alt='chat_bg' className='img-init-bodyst' />
            </>
          )}
          <div>
            {messages.map((msg, idx) => (
              <div
                key={msg.time + idx}
                className={`chat-row ${msg.isUser ? 'user' : 'bot'}`}
                style={{ marginBottom: '8px' }}
              >
                <div className={`chat-bubble ${msg.isUser ? 'user' : 'bot'}`}>
                  <div>
                    {msg.isUser ? (
                      <pre className="mb-0" style={{ margin: 0 }}>{msg.message}</pre>
                    ) : (
                      msg.message
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: '0.78em',
                      color: '#000000ff',
                      textAlign: 'right',
                    }}
                  >
                    {msg.time}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ textAlign: 'left', margin: '10px 0' }}>
                <div style={{
                  display: 'inline-block',
                  padding: '10px 15px',
                  borderRadius: '20px',
                  background: '#f1f0f0',
                  color: '#000',
                  maxWidth: '70%',
                  wordWrap: 'break-word'
                }}>
                  Typing...
                </div>
              </div>
            )}
          </div>
        </div>
        <div className='chatbot-foot-st'>
          <div className='d-flex align-items-center gap-2 w-100 inner-footcont-st'>
            <textarea
              className='inner-footcont-textarea'
              placeholder='Type here...'
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleInputKeyDown}
              disabled={loading}
            />
            <button
              type='button'
              onClick={handleSend}
              disabled={loading || !query.trim()}
              className='send-btn-st'
            >
              <SvgContent svg_name="send_msg" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

Chatbot.propTypes = {
  ShowChatbotTab: PropTypes.func.isRequired,
};

export default Chatbot;
