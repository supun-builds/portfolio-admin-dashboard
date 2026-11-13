"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Check, Globe } from "lucide-react";
import { Github } from "@/components/brand-icons";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ImageRef, Project, Tech } from "@/lib/types";
import { ImageUpload } from "@/components/image-upload";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export function ProjectForm({ project }: { project?: Project }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [allTech, setAllTech] = useState<Tech[]>([]);
  const [title, setTitle] = useState(project?.title ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [githubUrl, setGithubUrl] = useState(project?.githubUrl ?? "");
  const [liveUrl, setLiveUrl] = useState(project?.liveUrl ?? "");
  const [images, setImages] = useState<ImageRef[]>(project?.images ?? []);
  const [techIds, setTechIds] = useState<string[]>(project?.technologies.map((t) => t.id) ?? []);
  const [featured, setFeatured] = useState(project?.featured ?? false);
  const [published, setPublished] = useState((project?.status ?? "PUBLISHED") === "PUBLISHED");

  useEffect(() => { api.get("/api/technologies").then((r) => setAllTech(r.data.technologies)).catch(() => {}); }, []);

  const toggleTech = (id: string) => setTechIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const body = {
      title, description, githubUrl: githubUrl.trim(), liveUrl: liveUrl.trim(),
      images: images.map((i) => i.id), technologies: techIds, featured,
      status: published ? "PUBLISHED" : "DRAFT",
    };
    try {
      if (project) await api.put(`/api/projects/${project.id}`, body);
      else await api.post("/api/projects", body);
      toast.success(project ? "Project updated" : "Project created");
      router.push("/dashboard/projects");
    } catch { /* toast by interceptor */ }
    setSaving(false);
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <PageHeader title={project ? "Edit project" : "New project"} description="Shown in the Featured Projects section of your portfolio.">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button type="submit" variant="gradient" disabled={saving}>{saving && <Spinner />} {saving ? "Saving" : "Save project"}</Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <Card className="glass">
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Project name</Label>
                <Input id="title" required maxLength={100} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Beauty Cloud E-Commerce Platform" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" required maxLength={1000} rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What it does, who it’s for and what you built…" />
                <p className="text-right text-xs text-muted-foreground">{description.length}/1000</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="github"><Github className="size-3.5" /> GitHub link</Label>
                  <Input id="github" type="url" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/you/project" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="live"><Globe className="size-3.5" /> Live demo (optional)</Label>
                  <Input id="live" type="url" value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} placeholder="https://project.app" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle>Images</CardTitle>
              <CardDescription>Up to 6 images · PNG, JPG, WEBP, GIF or SVG · 5 MB each. The first image is the cover.</CardDescription>
            </CardHeader>
            <CardContent><ImageUpload value={images} onChange={setImages} max={6} /></CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle>Technologies used</CardTitle>
              <CardDescription>Pick from your technology list.</CardDescription>
            </CardHeader>
            <CardContent>
              {allTech.length === 0 ? (
                <p className="text-sm text-muted-foreground">No technologies yet. Add some on the Technologies page first.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {allTech.map((t) => {
                    const on = techIds.includes(t.id);
                    return (
                      <button key={t.id} type="button" onClick={() => toggleTech(t.id)} aria-pressed={on}
                        className={cn("flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                          on ? "border-primary/60 bg-primary/15 text-foreground" : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground")}>
                        {t.logoUrl && /* eslint-disable-next-line @next/next/no-img-element */ <img src={t.logoUrl} alt="" className="size-4 object-contain" />}
                        {t.name}
                        {on && <Check className="size-3 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="glass h-fit lg:sticky lg:top-20">
          <CardHeader><CardTitle>Visibility</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div><Label>Published</Label><p className="mt-1 text-xs text-muted-foreground">Drafts stay hidden from your site.</p></div>
              <Switch checked={published} onCheckedChange={setPublished} aria-label="Published" />
            </div>
            <div className="flex items-start justify-between gap-3">
              <div><Label>Featured</Label><p className="mt-1 text-xs text-muted-foreground">Pinned to the top of the list.</p></div>
              <Switch checked={featured} onCheckedChange={setFeatured} aria-label="Featured" />
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
