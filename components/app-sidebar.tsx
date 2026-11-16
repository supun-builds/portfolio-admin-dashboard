"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, Code2, FolderKanban, GraduationCap, Inbox, LayoutDashboard, LogOut, Sparkles, UserRound, type LucideIcon } from "lucide-react";
import api from "@/lib/api";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader,
  SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarRail, useSidebar,
} from "@/components/ui/sidebar";

type Item = { label: string; href: string; icon: LucideIcon; badge?: number };

function NavLink({ item, pathname }: { item: Item; pathname: string }) {
  const { setOpenMobile } = useSidebar();
  const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
  const Icon = item.icon;
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        render={<Link href={item.href} aria-current={active ? "page" : undefined} onClick={() => setOpenMobile(false)} />}
        isActive={active}
        tooltip={item.label}
      >
        <Icon aria-hidden="true" />
        <span>{item.label}</span>
      </SidebarMenuButton>
      {!!item.badge && <SidebarMenuBadge className="bg-primary/20 text-primary">{item.badge}</SidebarMenuBadge>}
    </SidebarMenuItem>
  );
}

export function AppSidebar({ unread }: { unread: number }) {
  const pathname = usePathname();
  const router = useRouter();
  const [name, setName] = useState("");

  useEffect(() => {
    api.get("/api/auth", { skipToast: true }).then((r) => setName(r.data.name)).catch(() => {});
  }, []);

  const groups: { label: string; items: Item[] }[] = [
    { label: "Overview", items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }] },
    {
      label: "Content",
      items: [
        { label: "Projects", href: "/dashboard/projects", icon: FolderKanban },
        { label: "Research & Writing", href: "/dashboard/research", icon: GraduationCap },
        { label: "Technologies", href: "/dashboard/technologies", icon: Code2 },
        { label: "Profile & CV", href: "/dashboard/profile", icon: UserRound },
      ],
    },
    { label: "Inbox", items: [{ label: "Messages", href: "/dashboard/messages", icon: Inbox, badge: unread }] },
  ];

  async function logout() {
    await api.delete("/api/auth", { skipToast: true }).catch(() => {});
    router.replace("/login");
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="Portfolio Admin" render={<Link href="/dashboard" />}>
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand text-white shadow-md shadow-primary/30">
                <Sparkles className="size-4" aria-hidden="true" />
              </span>
              <span className="grid flex-1 text-left leading-tight">
                <span className="truncate font-semibold">Portfolio</span>
                <span className="truncate text-xs text-muted-foreground">Admin console</span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((g) => (
          <SidebarGroup key={g.label}>
            <SidebarGroupLabel>{g.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{g.items.map((i) => <NavLink key={i.href} item={i} pathname={pathname} />)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} tooltip="Sign out">
              <LogOut aria-hidden="true" />
              <span className="truncate">Sign out{name ? ` · ${name}` : ""}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
