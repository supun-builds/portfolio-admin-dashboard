"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Mail, MapPin, Phone, Trash2, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { Github, Linkedin } from "@/components/brand-icons";
import api, { uploadFile } from "@/lib/api";
import type { ImageRef, Profile } from "@/lib/types";
import { ImageUpload } from "@/components/image-upload";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export default function ProfilePage() {
  const [p, setP] = useState<Profile | null>(null);
  const [avatar, setAvatar] = useState<ImageRef[]>([]);
  const [cv, setCv] = useState<{ id: string; name: string; url: string } | null>(null);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [saving, setSaving] = useState(false);
  const cvInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get("/api/profile").then((r) => {
      const prof: Profile = r.data.profile;
      setP(prof);
      setAvatar(prof.avatar ? [{ id: prof.avatar, url: prof.avatarUrl! }] : []);
      setCv(prof.cvFile ? { id: prof.cvFile, name: prof.cvName || "CV.pdf", url: prof.cvUrl! } : null);
    }).catch(() => {});
  }, []);

  if (!p) return <Skeleton className="h-[32rem] w-full" />;
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => setP({ ...p, [k]: v });

  async function pickCv(file?: File) {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) return toast.error("CV must be under 8 MB");
    setUploadingCv(true);
    try {
      const up = await uploadFile(file, "document");
      setCv({ id: up.id, name: file.name, url: up.url });
    } catch { /* interceptor */ }
    setUploadingCv(false);
    if (cvInput.current) cvInput.current.value = "";
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!p) return;
    setSaving(true);
    const { fullName, headline, bio, githubUrl, linkedinUrl, connectText, email, phone, location, openToWork } = p;
    try {
      await api.put("/api/profile", {
        fullName, headline, bio, githubUrl: githubUrl.trim(), linkedinUrl: linkedinUrl.trim(), connectText, email: email.trim(), phone, location, openToWork,
        avatar: avatar[0]?.id ?? null, cvFile: cv?.id ?? null, cvName: cv?.name ?? "",
      });
      toast.success("Profile saved");
    } catch { /* interceptor */ }
    setSaving(false);
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <PageHeader title="Profile & CV" description="Your photo, hero text, CV and the “Let’s Connect” section.">
        <Button type="submit" variant="gradient" disabled={saving}>{saving && <Spinner />} {saving ? "Saving" : "Save changes"}</Button>
      </PageHeader>

      <Card className="glass">
        <CardHeader><CardTitle>Hero</CardTitle><CardDescription>The first thing visitors see.</CardDescription></CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-[9rem_1fr]">
          <div className="space-y-2">
            <Label>Personal photo</Label>
            <ImageUpload value={avatar} onChange={setAvatar} max={1} shape="circle" hint="Square, 5 MB max" />
          </div>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="fullName">Full name</Label><Input id="fullName" maxLength={100} value={p.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Supun Silva" /></div>
              <div className="space-y-2"><Label htmlFor="headline">Headline</Label><Input id="headline" maxLength={120} value={p.headline} onChange={(e) => set("headline", e.target.value)} placeholder="Building Smart Solutions." /></div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Short bio</Label>
              <Textarea id="bio" rows={4} maxLength={1000} value={p.bio} onChange={(e) => set("bio", e.target.value)} placeholder="I'm a full-stack developer passionate about…" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader><CardTitle>Curriculum vitae</CardTitle><CardDescription>Powers the “Download CV” button. PDF only, 8 MB max.</CardDescription></CardHeader>
        <CardContent>
          {cv ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border bg-muted/30 p-3">
              <a href={cv.url} target="_blank" rel="noopener noreferrer" className="flex min-w-0 items-center gap-3 hover:text-primary">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary"><FileText className="size-5" /></span>
                <span className="truncate text-sm font-medium">{cv.name}</span>
              </a>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => cvInput.current?.click()} disabled={uploadingCv}>{uploadingCv ? <Spinner /> : <Upload />} Replace</Button>
                <Button type="button" variant="destructive" size="icon-sm" aria-label="Remove CV" onClick={() => setCv(null)}><Trash2 /></Button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => cvInput.current?.click()} disabled={uploadingCv}
              className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-input py-10 text-sm text-muted-foreground transition hover:border-primary/60 hover:bg-primary/5 hover:text-foreground">
              {uploadingCv ? <Spinner className="size-5" /> : <Upload className="size-5" />} {uploadingCv ? "Uploading" : "Upload your CV (PDF)"}
            </button>
          )}
          <input ref={cvInput} type="file" hidden accept="application/pdf" onChange={(e) => pickCv(e.target.files?.[0])} />
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader><CardTitle>Let’s Connect</CardTitle><CardDescription>Contact details and the intro text above your contact form.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="connectText">Intro text</Label>
            <Textarea id="connectText" rows={3} maxLength={600} value={p.connectText} onChange={(e) => set("connectText", e.target.value)} placeholder="I'm currently looking for new opportunities. Whether you have a question or just want to say hi, I'll try my best to get back to you!" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="email"><Mail className="size-3.5" /> Email</Label><Input id="email" type="email" value={p.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" /></div>
            <div className="space-y-2"><Label htmlFor="phone"><Phone className="size-3.5" /> Phone</Label><Input id="phone" maxLength={40} value={p.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+94 77 123 4567" /></div>
            <div className="space-y-2"><Label htmlFor="location"><MapPin className="size-3.5" /> Location</Label><Input id="location" maxLength={100} value={p.location} onChange={(e) => set("location", e.target.value)} placeholder="Colombo, Sri Lanka" /></div>
            <div className="space-y-2"><Label htmlFor="gh"><Github className="size-3.5" /> GitHub</Label><Input id="gh" type="url" value={p.githubUrl} onChange={(e) => set("githubUrl", e.target.value)} placeholder="https://github.com/you" /></div>
            <div className="space-y-2 sm:col-span-2"><Label htmlFor="li"><Linkedin className="size-3.5" /> LinkedIn</Label><Input id="li" type="url" value={p.linkedinUrl} onChange={(e) => set("linkedinUrl", e.target.value)} placeholder="https://linkedin.com/in/you" /></div>
          </div>
          <div className="flex items-center justify-between rounded-xl border bg-muted/30 p-3">
            <div><Label>Open to opportunities</Label><p className="mt-1 text-xs text-muted-foreground">Shows an availability indicator on your site.</p></div>
            <Switch checked={p.openToWork} onCheckedChange={(v) => set("openToWork", v)} aria-label="Open to opportunities" />
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
