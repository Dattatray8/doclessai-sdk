'use client'

import {useState, useRef, useEffect, useMemo} from "react";
import {DoclessClient} from "./client";
import toast from "react-hot-toast";

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function ChatWidget({name = 'Assistant', appKey}: { name?: string, appKey: string }) {
    const [openChatBubble, setOpenChatBubble] = useState<boolean>(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        {role: 'assistant', content: 'Hello! How can I help you today?'}
    ]);
    const [isTyping, setIsTyping] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);

    const ai = useMemo(() => new DoclessClient({appKey}), [appKey]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages, isTyping]);

    const sendMessage = async () => {
        if (!input.trim() || isTyping) return;

        const userMsg = input.trim();
        setInput(""); // Clear input immediately for better UX
        setMessages(prev => [...prev, {role: 'user', content: userMsg}]);
        setIsTyping(true);

        try {
            const res = await ai.ask(userMsg);
            setMessages(prev => [...prev, {role: 'assistant', content: res.res}]);
        } catch (error: any) {
            setIsTyping(false);
            toast.error(error?.message || "Something went wrong");
            // Optional: Remove the user message if the send fails
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div style={{fontFamily: 'Inter, system-ui, sans-serif'}}>
            {/* --- Floating Chat Icon --- */}
            <svg
                width="60"
                height="60"
                viewBox="0 0 60 60"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                    cursor: 'pointer',
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    display: openChatBubble ? 'none' : 'block',
                    zIndex: 9999,
                    filter: 'drop-shadow(0px 4px 12px rgba(0, 0, 0, 0.15))'
                }}
                onClick={() => setOpenChatBubble(true)}
            >
                <style>
                    {`
                        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-5px); } }
                        @keyframes blink { 0%, 90%, 100% { opacity: 1; } 95% { opacity: 0.3; } }
                        .chat-bubble { animation: float 2s ease-in-out infinite; }
                        .robot-eye { animation: blink 3s ease-in-out infinite; }
                    `}
                </style>
                <g className="chat-bubble">
                    <ellipse cx="30" cy="52" rx="15" ry="3" fill="#000" opacity="0.1"/>
                    <path
                        d="M45 15C45 8.37258 39.6274 3 33 3H15C8.37258 3 3 8.37258 3 15V33C3 39.6274 8.37258 45 15 45H18V52L26 45H33C39.6274 45 45 39.6274 45 33V15Z"
                        fill="#4F46E5"/>
                    <g transform="translate(12, 14)">
                        <line x1="12" y1="0" x2="12" y2="3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                        <circle cx="12" cy="0" r="1.5" fill="white"/>
                        <rect x="6" y="3" width="12" height="10" rx="2" fill="white"/>
                        <circle className="robot-eye" cx="9.5" cy="8" r="1.5" fill="#4F46E5"/>
                        <circle className="robot-eye" cx="14.5" cy="8" r="1.5" fill="#4F46E5"/>
                        <line x1="9" y1="11" x2="15" y2="11" stroke="#4F46E5" strokeWidth="1" strokeLinecap="round"/>
                        <rect x="7" y="14" width="10" height="6" rx="1" fill="white"/>
                        <rect x="4" y="15" width="2" height="4" rx="1" fill="white"/>
                        <rect x="18" y="15" width="2" height="4" rx="1" fill="white"/>
                    </g>
                </g>
            </svg>

            {/* --- Chat Window --- */}
            {openChatBubble && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    width: 'min(400px, 90vw)',
                    height: 'min(600px, 85vh)',
                    backgroundColor: '#fff',
                    boxShadow: '0 12px 40px rgba(79, 70, 229, 0.25)',
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 10000,
                    overflow: 'hidden',
                    border: '1px solid #e5e7eb',
                    animation: 'fadeIn 0.2s ease-out'
                }}>
                    <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>

                    {/* Header */}
                    <div style={{
                        backgroundColor: "#4f46e5",
                        padding: '14px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        color: '#fff'
                    }}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                            <div style={{
                                width: '8px',
                                height: '8px',
                                backgroundColor: '#22c55e',
                                borderRadius: '50%',
                                boxShadow: '0 0 8px #22c55e'
                            }}></div>
                            <span style={{fontWeight: 600, fontSize: '15px'}}>{name}</span>
                        </div>
                        <span style={{cursor: 'pointer', fontSize: '18px', opacity: 0.8}}
                              onClick={() => setOpenChatBubble(false)}>✕</span>
                    </div>

                    {/* Scrollable Messages Area */}
                    <div
                        ref={scrollRef}
                        style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '16px',
                            backgroundColor: '#f9fafb',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            scrollBehavior: 'smooth'
                        }}
                    >
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                style={{
                                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    backgroundColor: msg.role === 'user' ? '#4f46e5' : '#fff',
                                    color: msg.role === 'user' ? '#fff' : '#374151',
                                    padding: '10px 14px',
                                    borderRadius: msg.role === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                                    fontSize: '14px',
                                    lineHeight: '1.4',
                                    maxWidth: '85%',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.04)',
                                    border: msg.role === 'user' ? 'none' : '1px solid #e5e7eb',
                                    wordWrap: 'break-word'
                                }}
                            >
                                {msg.content}
                            </div>
                        ))}

                        {isTyping && (
                            <div style={{
                                alignSelf: 'flex-start',
                                backgroundColor: '#fff',
                                padding: '10px 14px',
                                borderRadius: '18px 18px 18px 2px',
                                fontSize: '13px',
                                color: '#6b7280',
                                border: '1px solid #e5e7eb',
                                display: 'flex',
                                gap: '4px'
                            }}>
                                <span className="dot-flashing">Thinking...</span>
                            </div>
                        )}
                    </div>

                    {/* Footer / Input Area */}
                    <div style={{padding: '16px', borderTop: '1px solid #e5e7eb', backgroundColor: '#fff'}}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            backgroundColor: '#f3f4f6',
                            padding: '6px 14px',
                            borderRadius: '28px'
                        }}>
                            <button style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '4px',
                                display: 'flex'
                            }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af"
                                     strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                    <circle cx="8.5" cy="8.5" r="1.5"/>
                                    <polyline points="21 15 16 10 5 21"/>
                                </svg>
                            </button>

                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder="Type a message..."
                                style={{
                                    flex: 1,
                                    border: 'none',
                                    background: 'none',
                                    padding: '10px 0',
                                    outline: 'none',
                                    fontSize: '14px',
                                    color: '#1f2937'
                                }}
                            />

                            <button
                                onClick={sendMessage}
                                disabled={!input.trim() || isTyping}
                                style={{
                                    background: input.trim() && !isTyping ? '#4f46e5' : 'transparent',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '34px',
                                    height: '34px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: input.trim() && !isTyping ? 'pointer' : 'default',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                     stroke={input.trim() && !isTyping ? "#fff" : "#9ca3af"}
                                     strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="22" y1="2" x2="11" y2="13"/>
                                    <polyline points="22 2 15 22 11 13 2 9 22 2"/>
                                </svg>
                            </button>
                        </div>
                        <div style={{
                            textAlign: 'center',
                            fontSize: '11px',
                            color: '#9ca3af',
                            marginTop: '10px',
                            letterSpacing: '0.3px'
                        }}>
                            Powered by <strong>DoclessAI</strong>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}