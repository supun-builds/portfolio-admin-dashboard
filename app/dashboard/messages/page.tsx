"use client";

import { useCallback, useEffect, useState } from "react";
import { Mail, MailOpen, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import type { Msg, Pagination as Pg } from "@/lib/types";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function MessagesPage() {
  const [items, setItems] = useState<Msg[] | null>(null);
  const [unread, setUnread] = useState(0);
  const [pg, setPg] = useState<Pg | null>(null);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Msg | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    api.get("/api/messages", { params: { pageNumber: page, pageSize: 10 } })
      .then((r) => { setItems(r.data.messages); setUnread(r.data.unread); setPg(r.data.pagination); })
      .catch(() => setItems([]));
  }, [page]);
  useEffect(load, [load]);

  async function setRead(m: Msg, read: boolean) {
    setItems((cur) => cur?.map((x) => (x.id === m.id ? { ...x, read } : x)) ?? null);
    setUnread((u) => u + (read ? -1 : 1) * (m.read === read ? 0 : 1));
    try { await api.patch(`/api/messages/${m.id}`, { read }); } catch { load(); }
  }

  function toggle(m: Msg) {
    const next = open === m.id ? null : m.id;
    setOpen(next);
    if (next && !m.read) setRead(m, true);
  }

  async function remove() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/api/messages/${toDelete.id}`);
      toast.success("Message deleted");
      setToDelete(null);
      load();
    } catch { /* interceptor */ }
    setDeleting(false);
  }

  return (
    <>
      <PageHeader title="Messages" description={`${unread} unread · from your “Let’s Connect” form`} />

      {!items && <Skeleton className="h-64 w-full" />}
      {items?.length === 0 && <Card className="glass"><CardContent className="py-16 text-center text-sm text-muted-foreground">No messages yet.</CardContent></Card>}

      <div className="space-y-3">
        {items?.map((m) => (
          <Card key={m.id} className="glass gap-0 py-0">
            <button type="button" onClick={() => toggle(m)} aria-expanded={open === m.id} className="flex w-full items-start gap-3 p-4 text-left">
              <span className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${m.read ? "bg-muted text-muted-foreground" : "bg-primary/15 text-primary"}`}>
                {m.read ? <MailOpen className="size-4" /> : <Mail className="size-4" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-sm font-medium">{m.name} {!m.read && <Badge>New</Badge>}</span>
                <span className="block truncate text-sm text-muted-foreground">{m.subject || m.message}</span>
              </span>
              <time className="shrink-0 text-xs text-muted-foreground">{new Date(m.createdAt).toLocaleString()}</time>
            </button>
            {open === m.id && (
              <div className="space-y-4 border-t px-4 pt-4 pb-4">
                <div className="text-sm">
                  <p className="text-muted-foreground">From <a className="text-primary hover:underline" href={`mailto:${m.email}`}>{m.email}</a></p>
                  {m.subject && <p className="mt-1 font-medium">{m.subject}</p>}
                  <p className="mt-3 whitespace-pre-wrap">{m.message}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="gradient" size="sm" render={<a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || "Your message"}`)}`} />}><Mail /> Reply</Button>
                  <Button variant="outline" size="sm" onClick={() => setRead(m, false)}>Mark unread</Button>
                  <Button variant="destructive" size="sm" onClick={() => setToDelete(m)}><Trash2 /> Delete</Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {pg && pg.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {pg.pageNumber} of {pg.totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= pg.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}

      <ConfirmDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)} title="Delete this message?" description={`Message from ${toDelete?.name} will be permanently removed.`} loading={deleting} onConfirm={remove} />
    </>
  );
}
