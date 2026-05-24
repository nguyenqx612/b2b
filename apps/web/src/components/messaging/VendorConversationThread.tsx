'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface VendorMsg {
  id: string;
  senderId: string;
  body: string | null;
  createdAt: string;
  sender: { email: string; companyName: string | null; role: string };
}

interface VendorConversationThreadProps {
  conversationId: string;
  token: string;
  currentUserId?: string;
}

export function VendorConversationThread({ conversationId, token, currentUserId }: VendorConversationThreadProps) {
  const [messages, setMessages] = useState<VendorMsg[]>([]);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${API}/api/vendor-conversations/${conversationId}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setMessages)
      .catch(() => {});
  }, [conversationId, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    const res = await fetch(`${API}/api/vendor-conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ body }),
    });
    setSending(false);
    if (res.ok) {
      const msg = await res.json();
      setMessages((prev) => [...prev, msg]);
      setBody('');
    }
  }

  return (
    <div className="flex h-[400px] flex-col rounded-xl border border-border bg-card">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No messages yet. Start the conversation.</p>
        )}
        {messages.map((m) => {
          const isMine = currentUserId ? m.senderId === currentUserId : false;
          return (
            <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${isMine ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <p className="text-xs opacity-70 mb-1">
                  {m.sender.companyName ?? m.sender.email}
                </p>
                <p>{m.body}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="border-t border-border p-3 flex gap-2">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 rounded-md border border-border px-3 py-2 text-sm"
        />
        <Button type="submit" size="sm" disabled={sending}>Send</Button>
      </form>
    </div>
  );
}
