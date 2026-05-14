'use client';

import { useState } from 'react';

interface Version {
  id: string;
  versionNumber: number;
  changedByUser: { email: string; companyName: string | null };
  changeReason: string | null;
  createdAt: string;
}

export function POVersionHistory({ versions }: { versions: Version[] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full"
      >
        <h2 className="font-semibold">Version History ({versions.length})</h2>
        <span className="text-gray-400 text-sm">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <ol className="mt-4 space-y-3 border-l-2 border-gray-200 pl-4">
          {[...versions].reverse().map((v) => (
            <li key={v.id} className="relative">
              <div className="absolute -left-[21px] top-1.5 h-3 w-3 rounded-full border-2 border-blue-500 bg-white" />
              <div className="text-sm">
                <span className="font-medium">v{v.versionNumber}</span>
                <span className="mx-2 text-gray-400">·</span>
                <span className="text-gray-600">{v.changedByUser.companyName ?? v.changedByUser.email}</span>
                <span className="mx-2 text-gray-400">·</span>
                <span className="text-gray-400 text-xs">{new Date(v.createdAt).toLocaleString()}</span>
              </div>
              {v.changeReason && (
                <div className="mt-0.5 text-xs text-gray-500">{v.changeReason}</div>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
