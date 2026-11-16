"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { BookOpen, Download, ExternalLink, Globe, GraduationCap, Image as ImageIcon, Sparkles } from "lucide-react";
import { Github } from "@/components/brand-icons";
import api from "@/lib/api";
import type { ImageRef, ResearchItem } from "@/lib/types";
import { ImageUpload } from "@/components/image-upload";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export function ResearchForm({ item }: { item?: ResearchItem }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState(
    item?.title ?? "An AI-Powered Guide for Sustainable Eco & Cultural Tourism in Sri Lanka"
  );
  const [badge, setBadge] = useState(item?.badge ?? "🎓 Final-year thesis · October 2026");
  const [authors, setAuthors] = useState(
    item?.authors ?? "Supun Silva · BSc (Hons) Information Technology · Faculty of Information Technology, Horizon Campus"
  );
  const [description, setDescription] = useState(
    item?.description ??
      "My final-year dissertation, written around CEYLO: the research, design, AI models and user testing behind a mobile guide that helps travellers explore Sri Lanka sustainably and safely."
  );

  const [coverImages, setCoverImages] = useState<ImageRef[]>(
    item?.coverImage && item?.coverImageUrl ? [{ id: item.coverImage, url: item.coverImageUrl }] : []
  );
  const [systemImages, setSystemImages] = useState<ImageRef[]>(item?.images ?? []);

  const [thesisUrl, setThesisUrl] = useState(
    item?.thesisUrl ?? "https://drive.google.com/file/d/1hOhyevcBc3neNGb1mmdn3NgWQSJHhy5I/view?usp=sharing"
  );
  const [projectUrl, setProjectUrl] = useState(item?.projectUrl ?? "");
  const [githubUrl, setGithubUrl] = useState(item?.githubUrl ?? "");
  const [paperUrl, setPaperUrl] = useState(item?.paperUrl ?? "");

  const [featured, setFeatured] = useState(item?.featured ?? true);
  const [published, setPublished] = useState((item?.status ?? "PUBLISHED") === "PUBLISHED");
  const [order, setOrder] = useState(item?.order ?? 0);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const body = {
      title: title.trim(),
      badge: badge.trim(),
      authors: authors.trim(),
      description: description.trim(),
      coverImage: coverImages[0]?.id ?? null,
      images: systemImages.map((img) => img.id),
      thesisUrl: thesisUrl.trim(),
      projectUrl: projectUrl.trim(),
      githubUrl: githubUrl.trim(),
      paperUrl: paperUrl.trim(),
      featured,
      order,
      status: published ? "PUBLISHED" : "DRAFT",
    };

    try {
      if (item) {
        await api.put(`/api/research/${item.id}`, body);
        toast.success("Research item updated");
      } else {
        await api.post("/api/research", body);
        toast.success("Research item created");
      }
      router.push("/dashboard/research");
    } catch {
      /* toast handled by interceptor */
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <PageHeader
        title={item ? "Edit research item" : "New research item"}
        description="Shown in the Research & Writing section of your portfolio."
      >
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" variant="gradient" disabled={saving}>
          {saving && <Spinner />} {saving ? "Saving" : "Save research"}
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        {/* Main Column */}
        <div className="space-y-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="size-5 text-primary" /> Research & Thesis Details
              </CardTitle>
              <CardDescription>Title, author affiliation, and dissertation summary.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Research / Thesis Title</Label>
                <Input
                  id="title"
                  required
                  maxLength={200}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="An AI-Powered Guide for Sustainable Eco & Cultural Tourism in Sri Lanka"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="badge">Category / Date Badge</Label>
                  <Input
                    id="badge"
                    maxLength={100}
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="🎓 Final-year thesis · October 2026"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="authors">Author / Degree / Faculty</Label>
                  <Input
                    id="authors"
                    maxLength={300}
                    value={authors}
                    onChange={(e) => setAuthors(e.target.value)}
                    placeholder="Supun Silva · BSc (Hons) Information Technology · Horizon Campus"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Abstract / Description</Label>
                <Textarea
                  id="description"
                  required
                  maxLength={3000}
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe the research methodology, AI models, systems created, and results…"
                />
                <p className="text-right text-xs text-muted-foreground">{description.length}/3000</p>
              </div>
            </CardContent>
          </Card>

          {/* Links & Downloads */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="size-5 text-primary" /> Links & Document Downloads
              </CardTitle>
              <CardDescription>
                Provide the Google Drive link or direct document URL for readers to download your thesis.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="thesisUrl" className="flex items-center gap-1.5">
                  <Download className="size-3.5 text-primary" /> Thesis Document Download Link (Google Drive / PDF)
                </Label>
                <Input
                  id="thesisUrl"
                  type="url"
                  value={thesisUrl}
                  onChange={(e) => setThesisUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/1hOhyevcBc3neNGb1mmdn3NgWQSJHhy5I/view?usp=sharing"
                />
                <p className="text-xs text-muted-foreground">
                  Viewers can click the download button on your portfolio to open or download your thesis.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="projectUrl" className="flex items-center gap-1.5">
                    <Globe className="size-3.5" /> Live System Demo
                  </Label>
                  <Input
                    id="projectUrl"
                    type="url"
                    value={projectUrl}
                    onChange={(e) => setProjectUrl(e.target.value)}
                    placeholder="https://ceylo-demo.app"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="githubUrl" className="flex items-center gap-1.5">
                    <Github className="size-3.5" /> Source Code
                  </Label>
                  <Input
                    id="githubUrl"
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/you/repo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paperUrl" className="flex items-center gap-1.5">
                    <BookOpen className="size-3.5" /> Paper / Publication
                  </Label>
                  <Input
                    id="paperUrl"
                    type="url"
                    value={paperUrl}
                    onChange={(e) => setPaperUrl(e.target.value)}
                    placeholder="https://researchgate.net/..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Thesis Cover Photo */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="size-5 text-primary" /> Thesis Hardbound Book Cover Photo
              </CardTitle>
              <CardDescription>
                Upload the photo of your physical thesis book (as shown on the left of the card).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload value={coverImages} onChange={setCoverImages} max={1} shape="rect" />
            </CardContent>
          </Card>

          {/* System & Architecture Screenshots */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="size-5 text-primary" /> System Screenshots & Architecture Diagrams
              </CardTitle>
              <CardDescription>
                Add additional images of the systems developed during your research (app screens, system architecture, models, or evaluations).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload value={systemImages} onChange={setSystemImages} max={10} shape="rect" />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Visibility & Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="published" className="cursor-pointer">
                    Publish on portfolio
                  </Label>
                  <p className="text-xs text-muted-foreground">Visible to all visitors.</p>
                </div>
                <Switch id="published" checked={published} onCheckedChange={setPublished} />
              </div>

              <div className="flex items-center justify-between border-t border-border/40 pt-4">
                <div>
                  <Label htmlFor="featured" className="cursor-pointer">
                    Featured Research
                  </Label>
                  <p className="text-xs text-muted-foreground">Highlighted as top research card.</p>
                </div>
                <Switch id="featured" checked={featured} onCheckedChange={setFeatured} />
              </div>

              <div className="space-y-2 border-t border-border/40 pt-4">
                <Label htmlFor="order">Display Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground">Lower numbers appear first.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
