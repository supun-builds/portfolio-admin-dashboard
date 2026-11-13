"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import api from "@/lib/api";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [unread, setUnread] = useState(0);

  // Session check: the API cookie is httpOnly, so we ask the API who we are.
  useEffect(() => {
    api.get("/api/auth", { skipToast: true })
      .then(() => setReady(true))
      .catch(() => router.replace("/login"));
  }, [router]);

  useEffect(() => {
    if (!ready) return;
    api.get("/api/stats", { skipToast: true }).then((r) => setUnread(r.data.unread)).catch(() => {});
  }, [ready, pathname]);

  if (!ready) {
    return <div className="flex min-h-screen items-center justify-center"><Spinner className="size-6 text-primary" /></div>;
  }

  return (
    <SidebarProvider defaultOpen>
      <AppSidebar unread={unread} />
      <SidebarInset className="min-w-0 bg-transparent">
        <header className="glass sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b px-4 md:px-6">
          <SidebarTrigger />
          <span aria-hidden="true" className="h-4 w-px bg-border" />
          <span className="text-sm text-muted-foreground">Manage everything that shows on your portfolio</span>
        </header>
        <main className="mx-auto flex w-full max-w-6xl min-w-0 flex-1 flex-col gap-6 p-4 md:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
