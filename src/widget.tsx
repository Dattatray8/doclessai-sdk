'use client'

import { useState, useRef, useEffect, useMemo } from "react";
import { DoclessClient } from "./client.js";
import { toast, Toaster } from "react-hot-toast";
import ReactMarkdown from 'react-markdown';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    image?: string;
    route?: string | null;
    elementId?: string | null;
}

export default function ChatWidget({ name = 'Assistant', appKey }: { name?: string, appKey: string }) {
    const [openChatBubble, setOpenChatBubble] = useState<boolean>(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hello! How can I help you today?' }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const ai = useMemo(() => new DoclessClient({ appKey }), [appKey]);

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
        const fileToUpload = selectedFile;

        setInput("");
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsTyping(true);

        try {
            const res = await ai.ask(userMsg, fileToUpload || undefined);
            setSelectedFile(null);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: res.res,
                image: res.image!,
                route: res.route,
                elementId: res.elementId
            }]);
        } catch (error: any) {
            toast.error(error?.message || "Something went wrong");
            setInput(userMsg); // Return text to input on failure
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            <Toaster position="top-center" reverseOrder={false} />

            <style>
                {`
                    @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-5px); } }
                    @keyframes blink { 0%, 90%, 100% { opacity: 1; } 95% { opacity: 0.3; } }
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                    
                    .chat-bubble { animation: float 2s ease-in-out infinite; }
                    .robot-eye { animation: blink 3s ease-in-out infinite; }

                    .markdown-container {
                        word-break: break-word;
                    }

                    .markdown-container strong {
                        font-weight: 700;
                        color: #111827;
                    }

                    .markdown-container a {
                        color: #4f46e5;
                        text-decoration: underline;
                    }

                    .markdown-container pre {
                        white-space: pre-wrap;
                        word-wrap: break-word;
                    }
                `}
            </style>

            {zoomedImage && (
                <div onClick={() => setZoomedImage(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', zIndex: 20000, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out', padding: '20px' }}>
                    <button style={{ position: 'absolute', top: '20px', right: '20px', background: '#fff', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', fontSize: '20px' }}>✕</button>
                    <img src={zoomedImage} style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '8px', boxShadow: '0 0 30px rgba(0,0,0,0.5)' }} alt="Zoomed reference" />
                </div>
            )}

            {/* Floating Icon */}
            {!openChatBubble && (
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none" style={{ cursor: 'pointer', position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, filter: 'drop-shadow(0px 4px 12px rgba(0, 0, 0, 0.15))' }} onClick={() => setOpenChatBubble(true)}>
                    <g className="chat-bubble">
                        <ellipse cx="30" cy="52" rx="15" ry="3" fill="#000" opacity="0.1" />
                        <path d="M45 15C45 8.37258 39.6274 3 33 3H15C8.37258 3 3 8.37258 3 15V33C3 39.6274 8.37258 45 15 45H18V52L26 45H33C39.6274 45 45 39.6274 45 33V15Z" fill="#4F46E5" />
                        <g transform="translate(12, 14)">
                            <line x1="12" y1="0" x2="12" y2="3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                            <circle cx="12" cy="0" r="1.5" fill="white" />
                            <rect x="6" y="3" width="12" height="10" rx="2" fill="white" />
                            <circle className="robot-eye" cx="9.5" cy="8" r="1.5" fill="#4F46E5" />
                            <circle className="robot-eye" cx="14.5" cy="8" r="1.5" fill="#4F46E5" />
                            <line x1="9" y1="11" x2="15" y2="11" stroke="#4F46E5" strokeWidth="1" strokeLinecap="round" />
                            <rect x="7" y="14" width="10" height="6" rx="1" fill="white" />
                            <rect x="4" y="15" width="2" height="4" rx="1" fill="white" />
                            <rect x="18" y="15" width="2" height="4" rx="1" fill="white" />
                        </g>
                    </g>
                </svg>
            )}

            {openChatBubble && (
                <div style={{ position: 'fixed', bottom: '20px', right: '20px', width: 'min(400px, 90vw)', height: 'min(600px, 85vh)', backgroundColor: '#fff', boxShadow: '0 12px 40px rgba(79, 70, 229, 0.25)', borderRadius: '16px', display: 'flex', flexDirection: 'column', zIndex: 10000, overflow: 'hidden', border: '1px solid #e5e7eb', animation: 'fadeIn 0.2s ease-out' }}>

                    {/* Header */}
                    <div style={{ backgroundColor: "#4f46e5", padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '8px', height: '8px', backgroundColor: '#22c55e', borderRadius: '50%', boxShadow: '0 0 8px #22c55e' }}></div>
                            <span style={{ fontWeight: 600, fontSize: '15px' }}>{name}</span>
                        </div>
                        <span style={{ cursor: 'pointer', fontSize: '18px', opacity: 0.8 }} onClick={() => setOpenChatBubble(false)}>✕</span>
                    </div>

                    {/* Messages Area */}
                    <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#f9fafb' }}>
                        {messages.map((msg, index) => (
                            <div key={index} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{
                                    backgroundColor: msg.role === 'user' ? '#4f46e5' : '#fff',
                                    color: msg.role === 'user' ? '#fff' : '#374151',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    border: msg.role === 'user' ? 'none' : '1px solid #e5e7eb',
                                    boxShadow: msg.role === 'user' ? '0 2px 4px rgba(79,70,229,0.2)' : '0 1px 2px rgba(0,0,0,0.05)'
                                }}>
                                    {msg.image && (
                                        <div style={{ marginBottom: '10px' }}>
                                            <img src={msg.image} onClick={() => setZoomedImage(msg.image!)} style={{ width: '100%', borderRadius: '8px', cursor: 'zoom-in' }} alt="Reference" />
                                        </div>
                                    )}

                                    {/* 3. Logic to render Markdown for Assistant or Plain Text for User */}
                                    {msg.role === 'assistant' ? (
                                        <div className="markdown-container">
                                            <ReactMarkdown
                                                components={{
                                                    p: ({ children }) => <p style={{ marginBottom: '12px', lineHeight: '1.6' }}>{children}</p>,
                                                    ul: ({ children }) => <ul style={{ listStyleType: 'disc', marginLeft: '20px', marginBottom: '12px' }}>{children}</ul>,
                                                    ol: ({ children }) => <ol style={{ listStyleType: 'decimal', marginLeft: '20px', marginBottom: '12px' }}>{children}</ol>,
                                                    li: ({ children }) => <li style={{ marginBottom: '4px' }}>{children}</li>,
                                                    h1: ({ children }) => <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '16px 0 8px' }}>{children}</h1>,
                                                    h2: ({ children }) => <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '14px 0 7px' }}>{children}</h2>,
                                                    h3: ({ children }) => <h3 style={{ fontSize: '1rem', fontWeight: 'bold', margin: '12px 0 6px' }}>{children}</h3>,
                                                    code: ({ node, inline, className, children, ...props }: any) => {
                                                        return inline ? (
                                                            <code style={{ backgroundColor: '#f3f4f6', padding: '2px 5px', borderRadius: '4px', fontSize: '13px', color: '#e03e2d', fontFamily: 'monospace' }} {...props}>
                                                                {children}
                                                            </code>
                                                        ) : (
                                                            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', margin: '12px 0', overflowX: 'auto' }}>
                                                                <code style={{ fontSize: '13px', color: '#1e293b', fontFamily: 'monospace', whiteSpace: 'pre' }} {...props}>
                                                                    {children}
                                                                </code>
                                                            </div>
                                                        );
                                                    },
                                                    blockquote: ({ children }) => (
                                                        <blockquote style={{ borderLeft: '4px solid #4f46e5', paddingLeft: '12px', color: '#4b5563', fontStyle: 'italic', margin: '12px 0' }}>
                                                            {children}
                                                        </blockquote>
                                                    ),
                                                    table: ({ children }) => (
                                                        <div style={{ overflowX: 'auto', margin: '12px 0' }}>
                                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>{children}</table>
                                                        </div>
                                                    ),
                                                    th: ({ children }) => <th style={{ border: '1px solid #e5e7eb', padding: '8px', backgroundColor: '#f9fafb', textAlign: 'left' }}>{children}</th>,
                                                    td: ({ children }) => <td style={{ border: '1px solid #e5e7eb', padding: '8px' }}>{children}</td>,
                                                }}
                                            >
                                                {msg.content}
                                            </ReactMarkdown>
                                            {msg.route && (
                                                <div style={{ marginTop: '12px', borderTop: '1px solid #f3f4f6', paddingTop: '10px' }}>
                                                    <button
                                                        onClick={() => {
                                                            window.location.href = msg.route!;
                                                        }}
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            backgroundColor: '#4f46e5',
                                                            color: 'white',
                                                            padding: '8px 14px',
                                                            borderRadius: '8px',
                                                            fontSize: '13px',
                                                            fontWeight: 500,
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            transition: 'background 0.2s',
                                                        }}
                                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4338ca'}
                                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
                                                    >
                                                        Explore Page
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                            <line x1="7" y1="17" x2="17" y2="7"></line>
                                                            <polyline points="7 7 17 7 17 17"></polyline>
                                                        </svg>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={scrollRef} />
                        {isTyping && <div style={{ fontSize: '12px', color: '#6b7280', marginLeft: '4px' }}>{name} is thinking...</div>}
                    </div>

                    {/* Input Area */}
                    <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb', backgroundColor: '#fff' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f3f4f6', padding: '6px 14px', borderRadius: '28px' }}>
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }} onClick={() => fileInputRef.current?.click()}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <polyline points="21 15 16 10 5 21" />
                                </svg>
                                <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) { setSelectedFile(file); toast.success(`Attached: ${file.name}`); }
                                }} />
                            </button>
                            {selectedFile && <div style={{ fontSize: '11px', color: '#4f46e5', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📎 {selectedFile.name}</div>}
                            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Type a message..." style={{ flex: 1, border: 'none', background: 'none', padding: '10px 0', outline: 'none', fontSize: '14px', color: '#1f2937' }} />
                            <button onClick={sendMessage} disabled={!input.trim() || isTyping} style={{ background: input.trim() && !isTyping ? '#4f46e5' : 'transparent', border: 'none', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() && !isTyping ? 'pointer' : 'default', transition: 'all 0.2s' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={input.trim() && !isTyping ? "#fff" : "#9ca3af"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="22" y1="2" x2="11" y2="13" />
                                    <polyline points="22 2 15 22 11 13 2 9 22 2" />
                                </svg>
                            </button>
                        </div>
                        <div style={{ textAlign: 'center', fontSize: '11px', color: '#9ca3af', marginTop: '10px' }}>Powered by <strong>DoclessAI</strong></div>
                    </div>
                </div>
            )}
        </div>
    );
}