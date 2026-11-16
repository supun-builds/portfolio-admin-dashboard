"use client";

import { use, useEffect, useState } from "react";
import api from "@/lib/api";
import type { ResearchItem } from "@/lib/types";
import { ResearchForm } from "@/components/research-form";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditResearchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [item, setItem] = useState<ResearchItem | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    api
      .get(`/api/research/${id}`, { skipToast: true })
      .then((r) => setItem(r.data.research))
      .catch(() => setMissing(true));
  }, [id]);

  if (missing) return <p className="text-sm text-muted-foreground">Research item not found.</p>;
  if (!item) return <Skeleton className="h-96 w-full" />;
  return <ResearchForm item={item} />;
}
