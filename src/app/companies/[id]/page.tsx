// src/app/companies/[id]/page.tsx  ← 교체
"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useDataStore } from "@/store/useDataStore";
import LineByMonth from "@/components/charts/LineByMonth";
import PieBySource from "@/components/charts/PieBySource";
import PostList from "@/components/posts/PostList";
import PostEditor from "@/components/posts/PostEditor";
import Spinner from "@/components/ui/Spinner";

export default function CompanyPage() {
  const { id } = useParams<{ id: string }>();
  const { companies, selectCompany, selectedCompanyId, posts, loading, error } = useDataStore();

  const company = companies.find((c) => c.id === id);

  useEffect(() => {
    if (id) selectCompany(id);
  }, [id, selectCompany]);

  if (!company) return <div className="p-4">회사를 찾을 수 없어요.</div>;
  if (loading) return <Spinner />;
  if (error) return <div className="p-4">에러: {error}</div>;

  return (
    <div className="grid gap-6">
      <h1 className="text-xl md:text-2xl font-semibold truncate">{company.name}</h1>
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <LineByMonth data={company.emissions} />
        <PieBySource data={company.emissions} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <PostList posts={posts} />
        <PostEditor companyId={selectedCompanyId!} />
      </div>
    </div>
  );
}
