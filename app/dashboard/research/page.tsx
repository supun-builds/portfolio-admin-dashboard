"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Download, ExternalLink, GraduationCap, ImageOff, Pencil, Plus, Star, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Github } from "@/components/brand-icons";
import api from "@/lib/api";
import type { Pagination as Pg, ResearchItem } from "@/lib/types";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ResearchPage() {
  const [items, setItems] = useState<ResearchItem[] | null>(null);
  const [page, setPage] = useState(1);
  const [pg, setPg] = useState<Pg | null>(null);
  const [toDelete, setToDelete] = useState<ResearchItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    api
      .get("/api/research", { params: { pageNumber: page, pageSize: 9 } })
      .then((r) => {
        setItems(r.data.research);
        setPg(r.data.pagination);
      })
      .catch(() => setItems([]));
  }, [page]);

  useEffect(load, [load]);

  async function remove() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/api/research/${toDelete.id}`);
      toast.success("Research item deleted");
      setToDelete(null);
      load();
    } catch {
      /* toast by interceptor */
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Research & Writing"
        description={pg ? `${pg.totalCount} items in your Research & Writing section` : "Manage thesis, papers, and research systems"}
      >
        <Button variant="gradient" render={<Link href="/dashboard/research/new" />}>
          <Plus /> Add research item
        </Button>
      </PageHeader>

      {!items && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      )}

      {items?.length === 0 && (
        <Card className="glass">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <GraduationCap className="size-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No research items yet. Add your thesis or research project.</p>
            <Button variant="gradient" render={<Link href="/dashboard/research/new" />}>
              <Plus /> Add research item
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items?.map((r) => (
          <Card key={r.id} className="glass group gap-0 py-0 transition hover:ring-primary/40">
            <div className="relative aspect-video overflow-hidden rounded-t-xl bg-muted/40">
              {r.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.coverImageUrl} alt={r.title} className="size-full object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center text-muted-foreground">
                  <ImageOff className="size-6" />
                </div>
              )}
              <div className="absolute top-2 left-2 flex gap-1">
                {r.featured && (
                  <Badge variant="secondary" className="gap-1 bg-black/70 text-amber-400 backdrop-blur">
                    <Star className="size-3 fill-amber-400" /> Featured
                  </Badge>
                )}
                <Badge
                  variant={r.status === "PUBLISHED" ? "default" : "outline"}
                  className="bg-black/70 backdrop-blur"
                >
                  {r.status}
                </Badge>
              </div>
              {r.images && r.images.length > 0 && (
                <Badge className="absolute right-2 bottom-2 bg-black/70 text-xs text-white backdrop-blur">
                  +{r.images.length} system screenshots
                </Badge>
              )}
            </div>

            <CardContent className="space-y-3 p-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-primary">{r.badge}</p>
                <h3 className="line-clamp-1 font-semibold">{r.title}</h3>
                {r.authors && <p className="line-clamp-1 text-xs text-muted-foreground">{r.authors}</p>}
                <p className="line-clamp-2 text-xs text-muted-foreground">{r.description}</p>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {r.thesisUrl && (
                  <a
                    href={r.thesisUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    <Download className="size-3 text-primary" /> Thesis
                  </a>
                )}
                {r.githubUrl && (
                  <a
                    href={r.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    <Github className="size-3" /> Code
                  </a>
                )}
                {r.projectUrl && (
                  <a
                    href={r.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    <ExternalLink className="size-3" /> Demo
                  </a>
                )}
              </div>

              <div className="flex items-center justify-end gap-1 border-t border-border/40 pt-2">
                <Button
                  size="sm"
                  variant="ghost"
                  render={<Link href={`/dashboard/research/${r.id}/edit`} />}
                >
                  <Pencil className="size-3.5" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setToDelete(r)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete research item?"
        description={`This will permanently remove "${toDelete?.title}".`}
        confirmLabel={deleting ? "Deleting…" : "Delete"}
        destructive
        onConfirm={remove}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
