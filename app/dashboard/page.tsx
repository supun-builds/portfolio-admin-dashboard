"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Code2, FolderKanban, Globe, Inbox, Plus } from "lucide-react";
import api from "@/lib/api";
import type { Msg } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface Stats { projects: number; published: number; technologies: number; messages: number; unread: number; recent: Msg[] }

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => { api.get("/api/stats").then((r) => setStats(r.data)).catch(() => {}); }, []);

  const cards = [
    { label: "Projects", value: stats?.projects, sub: `${stats?.published ?? 0} published`, icon: FolderKanban, href: "/dashboard/projects" },
    { label: "Technologies", value: stats?.technologies, sub: "in your stack", icon: Code2, href: "/dashboard/technologies" },
    { label: "Messages", value: stats?.messages, sub: `${stats?.unread ?? 0} unread`, icon: Inbox, href: "/dashboard/messages" },
  ];

  return (
    <>
      <PageHeader title="Dashboard" description="A quick look at your portfolio.">
        <Button variant="gradient" render={<Link href="/dashboard/projects/new" />}><Plus /> New project</Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="group">
            <Card className="glass h-full transition group-hover:ring-primary/40">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardDescription>{c.label}</CardDescription>
                  <span className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary"><c.icon className="size-4" /></span>
                </div>
                {stats ? <CardTitle className="text-3xl font-semibold">{c.value}</CardTitle> : <Skeleton className="h-9 w-16" />}
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">{c.sub}</CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Latest messages</CardTitle>
              <CardDescription>From the “Let’s Connect” form</CardDescription>
            </div>
            <Button variant="ghost" size="sm" render={<Link href="/dashboard/messages" />}>View all <ArrowRight /></Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          {!stats && <Skeleton className="h-16 w-full" />}
          {stats?.recent.length === 0 && (
            <p className="flex items-center gap-2 py-6 text-sm text-muted-foreground"><Globe className="size-4" /> Nothing yet. Messages from your site will appear here.</p>
          )}
          {stats?.recent.map((m) => (
            <Link key={m.id} href="/dashboard/messages" className="flex items-start justify-between gap-3 rounded-lg p-3 transition hover:bg-muted/50">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-medium">{m.name} {!m.read && <Badge>New</Badge>}</p>
                <p className="truncate text-sm text-muted-foreground">{m.subject || m.message}</p>
              </div>
              <time className="shrink-0 text-xs text-muted-foreground">{new Date(m.createdAt).toLocaleDateString()}</time>
            </Link>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
