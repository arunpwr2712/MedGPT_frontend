"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import ChatBubble from "../components/ChatBubble";
import ConsentModal from "../components/ConsentModal";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
}

export default function MedGPTChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm MedGPT, your medical assistant. Please describe your symptoms and I'll provide helpful remedies and guidance. Remember, this is for informational purposes only and shouldn't replace professional medical advice.",
      sender: 'ai'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
    // Show initialization message before user can chat
    const initMsg: Message = {
      id: 'init',
      content: "Initializing the LLM model… please wait before asking questions.",
      sender: 'ai'
    };
    setMessages([initMsg]);

   let cancelled = false;
    const pollPing = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/ping');
        if (res.data.status === 'ready') {
          if (!cancelled) {
            setMessages([{ id: 'ready', content: "MedGPT is ready! How can I assist you?", sender: 'ai' }]);
            setMessages([{ id: '1', content: "Hello! I'm MedGPT, your medical assistant. Please describe your symptoms and I'll provide helpful remedies and guidance. Remember, this is for informational purposes only and shouldn't replace professional medical advice.", sender: 'ai' }]);
            setIsInitializing(false);
          }
        } else {
          setTimeout(pollPing, 2000);
        }
      } catch {
        setTimeout(pollPing, 2000);
      }
    };

    pollPing();
    return () => { cancelled = true; };
  }, []);

  



  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // if (!inputValue.trim() || isLoading) return;
    if (!inputValue.trim() || isLoading || isInitializing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      // Replace with your actual FastAPI backend URL
      const response = await axios.post('http://localhost:8000/api/chat', {
        message: userMessage.content
      });
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.data.reply || response.data.message || 'I apologize, but I encountered an issue processing your request.',
        sender: 'ai'
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      setError('Failed to connect to MedGPT. Please check your connection and try again.');
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    axios.post("http://localhost:8000/api/refresh", {
      flag: "page_refreshed"
    }).catch(err => console.error("Refresh flag failed:", err));
  }, []);

  const [hasConsented, setHasConsented] = useState(false);

if (!hasConsented) {
  return <ConsentModal onAgree={() => setHasConsented(true)} />;
}
  return (
    <div className="flex flex-col h-screen p-4 bg-gray-100">
      <div className="flex-1 overflow-y-auto">
        {messages.map((msg, idx) => (
          <ChatBubble
            key={idx}
            message={{
              role: msg.sender === 'user' ? 'user' : 'assistant',
              content: msg.content
            }}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="mt-4 flex">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
          disabled={isInitializing}
          placeholder={isInitializing ? "Initializing..." : "Describe your symptoms..."}
          // placeholder="Describe your symptoms..."
          className="flex-1 p-2 rounded border border-gray-300"
        />
        <button
          onClick={handleSubmit}
          className="ml-2 px-4 bg-blue-600 text-white rounded"
        >
          {/* Send */}
          {isInitializing ? "Please wait…" : "Send"}
        </button>
      </div>
    </div>
  );
}
