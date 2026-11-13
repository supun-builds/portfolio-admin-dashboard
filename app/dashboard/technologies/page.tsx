"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import type { ImageRef, Tech } from "@/lib/types";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ImageUpload } from "@/components/image-upload";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";

export default function TechnologiesPage() {
  const [items, setItems] = useState<Tech[] | null>(null);
  const [editing, setEditing] = useState<Tech | "new" | null>(null);
  const [name, setName] = useState("");
  const [logo, setLogo] = useState<ImageRef[]>([]);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<Tech | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    api.get("/api/technologies").then((r) => setItems(r.data.technologies)).catch(() => setItems([]));
  }, []);
  useEffect(load, [load]);

  function openDialog(t: Tech | "new") {
    setEditing(t);
    setName(t === "new" ? "" : t.name);
    setLogo(t === "new" || !t.logo ? [] : [{ id: t.logo, url: t.logoUrl! }]);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const body = { name, logo: logo[0]?.id ?? null };
    try {
      if (editing === "new") await api.post("/api/technologies", body);
      else if (editing) await api.put(`/api/technologies/${editing.id}`, body);
      toast.success("Saved");
      setEditing(null);
      load();
    } catch { /* interceptor */ }
    setSaving(false);
  }

  async function remove() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/api/technologies/${toDelete.id}`);
      toast.success("Technology removed");
      setToDelete(null);
      load();
    } catch { /* interceptor */ }
    setDeleting(false);
  }

  return (
    <>
      <PageHeader title="Technologies" description="Shown as the “Core technologies” chips on your hero section.">
        <Button variant="gradient" onClick={() => openDialog("new")}><Plus /> Add technology</Button>
      </PageHeader>

      {!items && <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>}
      {items?.length === 0 && (
        <Card className="glass"><CardContent className="py-16 text-center text-sm text-muted-foreground">No technologies yet. Add React, Node.js, MongoDB…</CardContent></Card>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {items?.map((t) => (
          <Card key={t.id} className="glass group relative items-center gap-3 px-3 py-5 text-center transition hover:ring-primary/40">
            <div className="flex size-12 items-center justify-center rounded-xl bg-muted/60">
              {t.logoUrl ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={t.logoUrl} alt="" className="size-8 object-contain" /> : <span className="text-lg font-semibold text-primary">{t.name[0]}</span>}
            </div>
            <p className="w-full truncate text-sm font-medium">{t.name}</p>
            <div className="absolute top-1.5 right-1.5 flex gap-0.5 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
              <Button variant="ghost" size="icon-xs" aria-label={`Edit ${t.name}`} onClick={() => openDialog(t)}><Pencil /></Button>
              <Button variant="ghost" size="icon-xs" aria-label={`Delete ${t.name}`} onClick={() => setToDelete(t)}><Trash2 className="text-destructive" /></Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <form onSubmit={save} className="grid gap-4">
            <DialogHeader>
              <DialogTitle>{editing === "new" ? "Add technology" : "Edit technology"}</DialogTitle>
              <DialogDescription>A name and a logo (square works best).</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="tech-name">Name</Label>
              <Input id="tech-name" required maxLength={60} value={name} onChange={(e) => setName(e.target.value)} placeholder="React" />
            </div>
            <div className="space-y-2">
              <Label>Logo</Label>
              <ImageUpload value={logo} onChange={setLogo} max={1} shape="square" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button type="submit" variant="gradient" disabled={saving}>{saving && <Spinner />} Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}
        title={`Remove ${toDelete?.name}?`} description="It will also be removed from any projects that use it."
        confirmLabel="Remove" loading={deleting} onConfirm={remove}
      />
    </>
  );
}
