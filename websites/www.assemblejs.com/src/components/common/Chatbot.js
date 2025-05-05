import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

/**
 * Chatbot component for AssemblyJS website that communicates with ARLO API
 */
const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Hi! I'm the A.R.L.O. assistant. How can I help you with AssemblyJS?", 
      sender: 'bot' 
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };
  
  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && inputText.trim()) {
      handleSendMessage();
    }
  };
  
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    
    // Add user message to chat
    const userMessage = {
      id: messages.length + 1,
      text: inputText,
      sender: 'user'
    };
    
    setMessages([...messages, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    try {
      // Simulate API call with simple responses
      setTimeout(() => {
        const responses = [
          "AssemblyJS is a framework that allows you to build components using any frontend framework of your choice.",
          "A.R.L.O. stands for AssemblyJS Repository Logic Orchestrator, an AI agent system for maintaining the framework.",
          "You can create components with React, Vue, Svelte, Preact, or Web Components in AssemblyJS.",
          "The BlueprintController is the core class that manages server-side component rendering.",
          "AssemblyJS uses an event bus system to facilitate communication between components.",
          "The islands architecture in AssemblyJS allows you to mix multiple frontend frameworks on a single page.",
          "You can find comprehensive documentation in our docs section at /docs.",
          "AssemblyJS provides automatic server-side rendering for all supported frameworks."
        ];
        
        const botResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const botMessage = {
          id: messages.length + 2,
          text: botResponse,
          sender: 'bot'
        };
        
        setMessages(prevMessages => [...prevMessages, botMessage]);
        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      // Add error message
      const errorMessage = {
        id: messages.length + 2,
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
        sender: 'bot'
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
      setIsLoading(false);
    }
  };
  
  return (
    <div className="chatbot-container">
      {/* Chatbot toggle button */}
      <button 
        className="chatbot-toggle"
        onClick={toggleChatbot}
        aria-label={isOpen ? "Close chat assistant" : "Open chat assistant"}
      >
        {isOpen ? "×" : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 16c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" fill="currentColor"/>
            <path d="M10 9h4v6h-4z" fill="currentColor"/>
          </svg>
        )}
      </button>
      
      {/* Chatbot dialog */}
      {isOpen && (
        <div className="chatbot-dialog">
          <div className="chatbot-header">
            <h3>A.R.L.O. Assistant</h3>
          </div>
          
          <div className="chatbot-messages">
            {messages.map(message => (
              <div 
                key={message.id} 
                className={`message ${message.sender === 'bot' ? 'bot-message' : 'user-message'}`}
              >
                {message.text}
              </div>
            ))}
            {isLoading && (
              <div className="message bot-message loading">
                <span className="dot-arlo"></span>
                <span className="dot-arlo"></span>
                <span className="dot-arlo"></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="chatbot-input">
            <input
              type="text"
              placeholder="Ask about AssemblyJS..."
              value={inputText}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <button 
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;