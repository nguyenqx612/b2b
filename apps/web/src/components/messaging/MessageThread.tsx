'use client';

import { useEffect, useRef, useState } from 'react';
import { getSocket } from '@/lib/socket';

interface Message {
  id: string;
  senderId: string;
  messageType: 'text' | 'file' | 'system';
  body: string | null;
  fileName: string | null;
  fileS3Key: string | null;
  sender: { email: string; companyName: string | null; role: string };
  createdAt: string;
}

interface Props {
  poId: string;
  initialMessages: Message[];
  token: string;
}

function FileDownloadLink({ s3Key, fileName, token }: { s3Key: string; fileName: string | null; token: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

  async function getSignedUrl() {
    if (url) {
      window.open(url, '_blank');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/messages/s3-signed-url?key=${encodeURIComponent(s3Key)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to get download link');
      const data = await res.json();
      setUrl(data.url);
      window.open(data.url, '_blank');
    } catch (err) {
      console.error('Error getting signed URL:', err);
      alert('Failed to get download link');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={getSignedUrl}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs hover:bg-blue-100 transition disabled:opacity-50"
      type="button"
    >
      📎 <span className="text-blue-600 underline">{loading ? 'Loading...' : fileName}</span>
    </button>
  );
}

export function MessageThread({ poId, initialMessages, token }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const socket = getSocket(token);

    socket.emit('join:po', poId);

    socket.on('message:new', (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('typing:start', ({ email }: { email: string }) => {
      setTyping(email);
    });

    socket.on('typing:stop', () => setTyping(null));

    return () => {
      socket.off('message:new');
      socket.off('typing:start');
      socket.off('typing:stop');
      socket.emit('leave:po', poId);
    };
  }, [poId, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    const socket = getSocket(token);
    socket.emit('message:send', { poId, body: text });
    setInput('');
  }

  function handleTyping() {
    const socket = getSocket(token);
    socket.emit('typing:start', poId);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => socket.emit('typing:stop', poId), 2000);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
      const res = await fetch(`${API}/api/messages/${poId}/attachments`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('File upload error:', err);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white flex flex-col h-[600px]">
      <div className="border-b px-4 py-3 font-semibold text-sm">Messages</div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className="text-sm">
            <div className="flex items-baseline gap-2 mb-0.5">
              <span className="font-medium text-gray-800">
                {msg.sender.companyName ?? msg.sender.email}
              </span>
              <span className="text-xs text-gray-400 capitalize">{msg.sender.role}</span>
              <span className="text-xs text-gray-400 ml-auto">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </span>
            </div>
            {msg.messageType === 'text' && (
              <p className="text-gray-700 break-words">{msg.body}</p>
            )}
            {msg.messageType === 'file' && msg.fileS3Key && (
              <FileDownloadLink s3Key={msg.fileS3Key} fileName={msg.fileName} token={token} />
            )}
          </div>
        ))}

        {typing && (
          <div className="text-xs text-gray-400 italic">{typing} is typing…</div>
        )}

        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="border-t px-4 py-3 flex gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex-shrink-0 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition"
          title="Attach file"
        >
          📎
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleTyping}
          placeholder="Type a message…"
          className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition"
        >
          Send
        </button>
      </form>
    </div>
  );
}
