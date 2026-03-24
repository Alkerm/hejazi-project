'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { AdminAuditLog } from '@/lib/types';
import { Pagination } from '@/components/ui/pagination';
import { formatDate } from '@/lib/format';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    api
      .adminAuditLogs(`?page=${page}&pageSize=20`)
      .then((res) => {
        setLogs(res.items);
        setTotalPages(res.meta.totalPages || 1);
      })
      .catch((e: Error) => setMessage(e.message));
  }, [page]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Audit Logs</h2>
        <p className="text-sm text-slate-600">Recent admin actions affecting products and orders.</p>
      </div>

      <div className="rounded border bg-white p-4">
        {logs.length === 0 ? (
          <p className="text-sm text-slate-600">No audit log entries yet.</p>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="rounded border border-slate-200 p-3 text-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {log.action} on {log.entityType}
                      {log.entityId ? ` (${log.entityId.slice(-8)})` : ''}
                    </p>
                    <p className="text-slate-600">
                      {log.adminUser.firstName} {log.adminUser.lastName} ({log.adminUser.email})
                    </p>
                  </div>
                  <p className="text-slate-500">{formatDate(log.createdAt)}</p>
                </div>
                {log.metadata ? (
                  <pre className="mt-3 overflow-x-auto rounded bg-slate-50 p-3 text-xs text-slate-700">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                ) : null}
              </div>
            ))}
          </div>
        )}

        <div className="mt-4">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      {message && <p className="text-sm text-red-600">{message}</p>}
    </div>
  );
}
