"use client";

import { use, useEffect, useState } from "react";
import api from "@/lib/api";
import type { Project } from "@/lib/types";
import { ProjectForm } from "@/components/project-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    api.get(`/api/projects/${id}`, { skipToast: true }).then((r) => setProject(r.data.project)).catch(() => setMissing(true));
  }, [id]);

  if (missing) return <p className="text-sm text-muted-foreground">Project not found.</p>;
  if (!project) return <Skeleton className="h-96 w-full" />;
  return <ProjectForm project={project} />;
}
