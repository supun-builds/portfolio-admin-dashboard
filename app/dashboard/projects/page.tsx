"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, ImageOff, Pencil, Plus, Star, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Github } from "@/components/brand-icons";
import api from "@/lib/api";
import type { Pagination as Pg, Project } from "@/lib/types";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [page, setPage] = useState(1);
  const [pg, setPg] = useState<Pg | null>(null);
  const [toDelete, setToDelete] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    api.get("/api/projects", { params: { pageNumber: page, pageSize: 9 } })
      .then((r) => { setProjects(r.data.projects); setPg(r.data.pagination); })
      .catch(() => setProjects([]));
  }, [page]);
  useEffect(load, [load]);

  async function remove() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/api/projects/${toDelete.id}`);
      toast.success("Project deleted");
      setToDelete(null);
      load();
    } catch { /* interceptor */ }
    setDeleting(false);
  }

  return (
    <>
      <PageHeader title="Projects" description={pg ? `${pg.totalCount} total` : "Everything in your Featured Projects section"}>
        <Button variant="gradient" render={<Link href="/dashboard/projects/new" />}><Plus /> Add project</Button>
      </PageHeader>

      {!projects && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-72" />)}</div>}

      {projects?.length === 0 && (
        <Card className="glass"><CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-sm text-muted-foreground">No projects yet. Add your first one.</p>
          <Button variant="gradient" render={<Link href="/dashboard/projects/new" />}><Plus /> Add project</Button>
        </CardContent></Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects?.map((p) => (
          <Card key={p.id} className="glass group gap-0 py-0 transition hover:ring-primary/40">
            <div className="relative aspect-video bg-muted/40">
              {p.images[0] ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={p.images[0].url} alt="" className="size-full object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center text-muted-foreground"><ImageOff className="size-6" /></div>
              )}
              <div className="absolute top-2 left-2 flex gap-1.5">
                <Badge variant={p.status === "PUBLISHED" ? "success" : "warning"}>{p.status === "PUBLISHED" ? "Published" : "Draft"}</Badge>
                {p.featured && <Badge variant="default"><Star className="fill-current" /> Featured</Badge>}
              </div>
            </div>
            <CardContent className="flex flex-1 flex-col gap-3 p-4">
              <div className="space-y-1">
                <h3 className="font-semibold leading-snug">{p.title}</h3>
                <p className="line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {p.technologies.slice(0, 4).map((t) => <Badge key={t.id} variant="secondary">{t.name}</Badge>)}
                {p.technologies.length > 4 && <Badge variant="outline">+{p.technologies.length - 4}</Badge>}
              </div>
              <div className="mt-auto flex items-center justify-between pt-1">
                <div className="flex gap-1">
                  {p.githubUrl && <Button variant="ghost" size="icon-sm" aria-label="GitHub" render={<a href={p.githubUrl} target="_blank" rel="noopener noreferrer" />}><Github /></Button>}
                  {p.liveUrl && <Button variant="ghost" size="icon-sm" aria-label="Live demo" render={<a href={p.liveUrl} target="_blank" rel="noopener noreferrer" />}><ExternalLink /></Button>}
                </div>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" render={<Link href={`/dashboard/projects/${p.id}/edit`} />}><Pencil /> Edit</Button>
                  <Button variant="destructive" size="icon-sm" aria-label="Delete project" onClick={() => setToDelete(p)}><Trash2 /></Button>
                </div>
              </div>
            </CardContent>
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

      <ConfirmDialog
        open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}
        title="Delete this project?" description={`“${toDelete?.title}” and its images will be permanently removed.`}
        loading={deleting} onConfirm={remove}
      />
    </>
  );
}
