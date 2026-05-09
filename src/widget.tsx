'use client'

import { useState, useRef, useEffect, useMemo } from "react";
import { DoclessClient } from "./client.js";
import { toast, Toaster } from "react-hot-toast";
import ReactMarkdown from 'react-markdown';
import remarkGfm from "remark-gfm";

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    image?: string;
    route?: string | null;
    elementId?: string | null;
}

const highlightElement = (id?: string | null) => {
    if (!id) return;

    const el = document.getElementById(id);

    if (!el) return;

    el.scrollIntoView({
        behavior: "smooth",
        block: "center",
    });

    el.classList.add("docless-highlight");

    setTimeout(() => {
        el.classList.remove("docless-highlight");
    }, 3000);
};

const navigateAndHighlight = (
    route?: string | null,
    elementId?: string | null
) => {
    if (route && window.location.pathname !== route) {
        window.location.href = route;

        setTimeout(() => {
            highlightElement(elementId);
        }, 700);
    } else {
        highlightElement(elementId);
    }
};

export default function ChatWidget({
    name = 'Assistant',
    appKey
}: {
    name?: string,
    appKey: string
}) {

    const [openChatBubble, setOpenChatBubble] =
        useState<boolean>(false);

    const [input, setInput] = useState("");

    const [messages, setMessages] = useState<Message[]>([
        {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: 'Hello! How can I help you today?'
        }
    ]);

    const [isTyping, setIsTyping] =
        useState(false);

    const [statusText, setStatusText] =
        useState("");

    const [selectedFile, setSelectedFile] =
        useState<File | null>(null);

    const [zoomedImage, setZoomedImage] =
        useState<string | null>(null);

    const fileInputRef =
        useRef<HTMLInputElement>(null);

    const scrollRef =
        useRef<HTMLDivElement>(null);

    const ai = useMemo(
        () => new DoclessClient({ appKey }),
        [appKey]
    );

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop =
                scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const sendMessage = async () => {

        if ((!input.trim() && !selectedFile) || isTyping) {
            return;
        }

        const userMsg = input.trim();

        const fileToUpload = selectedFile;

        setInput("");
        setSelectedFile(null);

        // USER MESSAGE
        setMessages(prev => [
            ...prev,
            {
                id: crypto.randomUUID(),
                role: 'user',
                content: userMsg
            }
        ]);

        // EMPTY ASSISTANT MESSAGE
        const assistantId = crypto.randomUUID();

        setMessages(prev => [
            ...prev,
            {
                id: assistantId,
                role: 'assistant',
                content: ''
            }
        ]);

        setIsTyping(true);

        try {

            await ai.ask({

                query: userMsg,

                ...(fileToUpload
                    ? { file: fileToUpload }
                    : {}),

                onStatus(message) {

                    setStatusText(message);
                },

                onText(chunk) {

                    setMessages(prev =>
                        prev.map(msg =>
                            msg.id === assistantId
                                ? {
                                    ...msg,
                                    content:
                                        msg.content + chunk
                                }
                                : msg
                        )
                    );
                },

                onMeta(meta) {

                    setMessages(prev =>
                        prev.map(msg =>
                            msg.id === assistantId
                                ? {
                                    ...msg,
                                    route: meta.route,
                                    elementId: meta.elementId
                                }
                                : msg
                        )
                    );
                },

                onDone() {

                    setIsTyping(false);

                    setStatusText("");
                },

                onError(message) {

                    setIsTyping(false);

                    setStatusText("");

                    toast.error(message);

                    setMessages(prev =>
                        prev.map(msg =>
                            msg.id === assistantId
                                ? {
                                    ...msg,
                                    content: message
                                }
                                : msg
                        )
                    );
                }
            });

        } catch (error: any) {

            setIsTyping(false);

            setStatusText("");

            toast.error(
                error?.message ||
                "Something went wrong"
            );
        }
    };

    const btnPrimary = {
        backgroundColor: '#4f46e5',
        color: 'white',
        padding: '8px 14px',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: 500,
        border: 'none',
        cursor: 'pointer'
    };

    const btnSecondary = {
        backgroundColor: '#eef2ff',
        color: '#4338ca',
        padding: '8px 14px',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: 500,
        border: '1px solid #c7d2fe',
        cursor: 'pointer'
    };

    return (
        <div style={{
            fontFamily:
                'Inter, system-ui, sans-serif'
        }}>

            <Toaster
                position="top-center"
                reverseOrder={false}
            />

            <style>
                {`
                    @keyframes float {
                        0%, 100% {
                            transform: translateY(0px);
                        }
                        50% {
                            transform: translateY(-5px);
                        }
                    }

                    @keyframes blink {
                        0%, 90%, 100% {
                            opacity: 1;
                        }
                        95% {
                            opacity: 0.3;
                        }
                    }

                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                            transform: translateY(10px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    .chat-bubble {
                        animation: float 2s ease-in-out infinite;
                    }

                    .robot-eye {
                        animation: blink 3s ease-in-out infinite;
                    }

                    .markdown-container {
                        line-height: 1.7;
                    }

                    .markdown-container pre {
                        overflow-x: auto;
                    }

                    .markdown-container code {
                        font-family: monospace;
                    }

                    .markdown-container table {
                        border-collapse: collapse;
                        width: 100%;
                    }

                    .markdown-container th,
                    .markdown-container td {
                        border: 1px solid #e5e7eb;
                        padding: 8px;
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

                    @keyframes pulseHighlight {
                        0% {
                            box-shadow: 0 0 0 0 rgba(99,102,241,0.6);
                        }
                        70% {
                            box-shadow: 0 0 0 12px rgba(99,102,241,0);
                        }
                        100% {
                            box-shadow: 0 0 0 0 rgba(99,102,241,0);
                        }
                    }

                    .docless-highlight {
                        animation: pulseHighlight 1.5s ease-out 2;
                        outline: 3px solid #6366f1;
                        border-radius: 8px;
                    }
                `}
            </style>

            {zoomedImage && (
                <div
                    onClick={() => setZoomedImage(null)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor:
                            'rgba(0,0,0,0.8)',
                        backdropFilter: 'blur(5px)',
                        zIndex: 20000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'zoom-out',
                        padding: '20px'
                    }}
                >
                    <button
                        style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            background: '#fff',
                            border: 'none',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            cursor: 'pointer',
                            fontSize: '20px'
                        }}
                    >
                        ✕
                    </button>

                    <img
                        src={zoomedImage}
                        alt="Zoomed reference"
                        style={{
                            maxWidth: '100%',
                            maxHeight: '90vh',
                            borderRadius: '8px',
                            boxShadow:
                                '0 0 30px rgba(0,0,0,0.5)'
                        }}
                    />
                </div>
            )}

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

                <div
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        width: 'min(400px, 90vw)',
                        height: 'min(600px, 85vh)',
                        backgroundColor: '#fff',
                        boxShadow:
                            '0 12px 40px rgba(79, 70, 229, 0.25)',
                        borderRadius: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        zIndex: 10000,
                        overflow: 'hidden',
                        border: '1px solid #e5e7eb',
                        animation: 'fadeIn 0.2s ease-out'
                    }}
                >

                    {/* HEADER */}

                    <div
                        style={{
                            backgroundColor: "#4f46e5",
                            padding: '14px 18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            color: '#fff'
                        }}
                    >

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}
                        >

                            <div
                                style={{
                                    width: '8px',
                                    height: '8px',
                                    backgroundColor: '#22c55e',
                                    borderRadius: '50%',
                                    boxShadow:
                                        '0 0 8px #22c55e'
                                }}
                            />

                            <span
                                style={{
                                    fontWeight: 600,
                                    fontSize: '15px'
                                }}
                            >
                                {name}
                            </span>
                        </div>

                        <span
                            style={{
                                cursor: 'pointer',
                                fontSize: '18px',
                                opacity: 0.8
                            }}
                            onClick={() =>
                                setOpenChatBubble(false)
                            }
                        >
                            ✕
                        </span>
                    </div>

                    {/* MESSAGES */}

                    <div
                        ref={scrollRef}
                        style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            backgroundColor: '#f9fafb'
                        }}
                    >

                        {messages.map((msg) => (

                            <div
                                key={msg.id}
                                style={{
                                    alignSelf:
                                        msg.role === 'user'
                                            ? 'flex-end'
                                            : 'flex-start',
                                    maxWidth: '85%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '4px'
                                }}
                            >

                                <div
                                    style={{
                                        backgroundColor:
                                            msg.role === 'user'
                                                ? '#4f46e5'
                                                : '#fff',

                                        color:
                                            msg.role === 'user'
                                                ? '#fff'
                                                : '#374151',

                                        padding: '12px 16px',
                                        borderRadius: '12px',
                                        fontSize: '14px',

                                        border:
                                            msg.role === 'user'
                                                ? 'none'
                                                : '1px solid #e5e7eb',

                                        boxShadow:
                                            msg.role === 'user'
                                                ? '0 2px 4px rgba(79,70,229,0.2)'
                                                : '0 1px 2px rgba(0,0,0,0.05)'
                                    }}
                                >

                                    {msg.image && (
                                        <div
                                            style={{
                                                marginBottom: '10px'
                                            }}
                                        >
                                            <img
                                                src={msg.image}
                                                alt="Reference"
                                                onClick={() =>
                                                    setZoomedImage(msg.image!)
                                                }
                                                style={{
                                                    width: '100%',
                                                    borderRadius: '8px',
                                                    cursor: 'zoom-in'
                                                }}
                                            />
                                        </div>
                                    )}

                                    {msg.role === 'assistant' ? (

                                        <div className="markdown-container">

                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    code(props) {
                                                        const { children, className } = props;

                                                        const isInline =
                                                            !className?.includes("language-");

                                                        if (isInline) {
                                                            return (
                                                                <code
                                                                    style={{
                                                                        background: "#eef2ff",
                                                                        color: "#4338ca",
                                                                        padding: "2px 6px",
                                                                        borderRadius: "6px",
                                                                        fontSize: "13px",
                                                                        fontFamily: "monospace",
                                                                    }}
                                                                >
                                                                    {children}
                                                                </code>
                                                            );
                                                        }

                                                        return (
                                                            <pre
                                                                style={{
                                                                    background: "#111827",
                                                                    color: "#f9fafb",
                                                                    padding: "14px",
                                                                    borderRadius: "10px",
                                                                    overflowX: "auto",
                                                                    marginTop: "10px",
                                                                    marginBottom: "10px",
                                                                    fontSize: "13px",
                                                                    lineHeight: 1.6,
                                                                }}
                                                            >
                                                                <code>{children}</code>
                                                            </pre>
                                                        );
                                                    },

                                                    p(props) {
                                                        return (
                                                            <p
                                                                style={{
                                                                    marginTop: "8px",
                                                                    marginBottom: "8px",
                                                                    lineHeight: 1.7,
                                                                }}
                                                            >
                                                                {props.children}
                                                            </p>
                                                        );
                                                    },

                                                    ul(props) {
                                                        return (
                                                            <ul
                                                                style={{
                                                                    paddingLeft: "20px",
                                                                    marginTop: "10px",
                                                                    marginBottom: "10px",
                                                                }}
                                                            >
                                                                {props.children}
                                                            </ul>
                                                        );
                                                    },

                                                    ol(props) {
                                                        return (
                                                            <ol
                                                                style={{
                                                                    paddingLeft: "20px",
                                                                    marginTop: "10px",
                                                                    marginBottom: "10px",
                                                                }}
                                                            >
                                                                {props.children}
                                                            </ol>
                                                        );
                                                    },

                                                    li(props) {
                                                        return (
                                                            <li
                                                                style={{
                                                                    marginBottom: "6px",
                                                                    lineHeight: 1.6,
                                                                }}
                                                            >
                                                                {props.children}
                                                            </li>
                                                        );
                                                    },

                                                    h1(props) {
                                                        return (
                                                            <h1
                                                                style={{
                                                                    fontSize: "22px",
                                                                    fontWeight: 700,
                                                                    marginTop: "16px",
                                                                    marginBottom: "10px",
                                                                    color: "#111827",
                                                                }}
                                                            >
                                                                {props.children}
                                                            </h1>
                                                        );
                                                    },

                                                    h2(props) {
                                                        return (
                                                            <h2
                                                                style={{
                                                                    fontSize: "18px",
                                                                    fontWeight: 700,
                                                                    marginTop: "14px",
                                                                    marginBottom: "8px",
                                                                    color: "#111827",
                                                                }}
                                                            >
                                                                {props.children}
                                                            </h2>
                                                        );
                                                    },

                                                    h3(props) {
                                                        return (
                                                            <h3
                                                                style={{
                                                                    fontSize: "16px",
                                                                    fontWeight: 600,
                                                                    marginTop: "12px",
                                                                    marginBottom: "6px",
                                                                    color: "#111827",
                                                                }}
                                                            >
                                                                {props.children}
                                                            </h3>
                                                        );
                                                    },

                                                    a(props) {
                                                        return (
                                                            <a
                                                                href={props.href}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                style={{
                                                                    color: "#4f46e5",
                                                                    textDecoration: "underline",
                                                                    fontWeight: 500,
                                                                }}
                                                            >
                                                                {props.children}
                                                            </a>
                                                        );
                                                    },

                                                    blockquote(props) {
                                                        return (
                                                            <blockquote
                                                                style={{
                                                                    borderLeft: "4px solid #6366f1",
                                                                    paddingLeft: "12px",
                                                                    marginLeft: 0,
                                                                    color: "#4b5563",
                                                                    fontStyle: "italic",
                                                                    marginTop: "10px",
                                                                    marginBottom: "10px",
                                                                }}
                                                            >
                                                                {props.children}
                                                            </blockquote>
                                                        );
                                                    },
                                                }}
                                            >
                                                {msg.content}
                                            </ReactMarkdown>

                                            {(msg.route || msg.elementId) && (

                                                <div
                                                    style={{
                                                        marginTop: '12px',
                                                        borderTop:
                                                            '1px solid #f3f4f6',

                                                        paddingTop: '10px',

                                                        display: 'flex',

                                                        gap: '8px',

                                                        flexWrap: 'wrap'
                                                    }}
                                                >

                                                    {msg.route && (

                                                        <button
                                                            onClick={() =>
                                                                window.location.href =
                                                                msg.route!
                                                            }
                                                            style={btnPrimary}
                                                        >
                                                            Explore Page
                                                        </button>
                                                    )}

                                                    {msg.elementId && (

                                                        <button
                                                            onClick={() =>
                                                                navigateAndHighlight(
                                                                    msg.route,
                                                                    msg.elementId
                                                                )
                                                            }
                                                            style={btnSecondary}
                                                        >
                                                            View
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                    ) : (

                                        <div
                                            style={{
                                                whiteSpace: 'pre-wrap'
                                            }}
                                        >
                                            {msg.content}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div
                                style={{
                                    fontSize: '12px',
                                    color: '#6b7280',
                                    marginLeft: '4px'
                                }}
                            >
                                {statusText ||
                                    `${name} is thinking...`}
                            </div>
                        )}
                    </div>

                    {/* INPUT */}

                    <div
                        style={{
                            padding: '16px',
                            borderTop: '1px solid #e5e7eb',
                            backgroundColor: '#fff'
                        }}
                    >

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                backgroundColor: '#f3f4f6',
                                padding: '6px 14px',
                                borderRadius: '28px'
                            }}
                        >

                            <button
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    display: 'flex'
                                }}
                                onClick={() =>
                                    fileInputRef.current?.click()
                                }
                            >

                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#9ca3af"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <rect
                                        x="3"
                                        y="3"
                                        width="18"
                                        height="18"
                                        rx="2"
                                        ry="2"
                                    />

                                    <circle
                                        cx="8.5"
                                        cy="8.5"
                                        r="1.5"
                                    />

                                    <polyline
                                        points="21 15 16 10 5 21"
                                    />
                                </svg>

                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={(e) => {

                                        const file =
                                            e.target.files?.[0];

                                        if (file) {
                                            setSelectedFile(file);

                                            toast.success(
                                                `Attached: ${file.name}`
                                            );
                                        }
                                    }}
                                />
                            </button>

                            {selectedFile && (
                                <div
                                    style={{
                                        fontSize: '11px',
                                        color: '#4f46e5',
                                        maxWidth: '80px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    📎 {selectedFile.name}
                                </div>
                            )}

                            <input
                                type="text"
                                value={input}
                                onChange={(e) =>
                                    setInput(e.target.value)
                                }
                                onKeyDown={(e) =>
                                    e.key === 'Enter' &&
                                    sendMessage()
                                }
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
                                disabled={
                                    (!input.trim() &&
                                        !selectedFile) ||
                                    isTyping
                                }
                                style={{
                                    background:
                                        (input.trim() ||
                                            selectedFile) &&
                                            !isTyping
                                            ? '#4f46e5'
                                            : 'transparent',

                                    border: 'none',

                                    borderRadius: '50%',

                                    width: '34px',

                                    height: '34px',

                                    display: 'flex',

                                    alignItems: 'center',

                                    justifyContent: 'center',

                                    cursor:
                                        (input.trim() ||
                                            selectedFile) &&
                                            !isTyping
                                            ? 'pointer'
                                            : 'default',

                                    transition: 'all 0.2s'
                                }}
                            >

                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke={
                                        (input.trim() ||
                                            selectedFile) &&
                                            !isTyping
                                            ? "#fff"
                                            : "#9ca3af"
                                    }
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <line
                                        x1="22"
                                        y1="2"
                                        x2="11"
                                        y2="13"
                                    />

                                    <polyline
                                        points="22 2 15 22 11 13 2 9 22 2"
                                    />
                                </svg>
                            </button>
                        </div>

                        <div
                            style={{
                                textAlign: 'center',
                                fontSize: '11px',
                                color: '#9ca3af',
                                marginTop: '10px'
                            }}
                        >
                            Powered by <strong>DoclessAI</strong>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}