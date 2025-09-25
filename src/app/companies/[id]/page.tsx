// src/app/companies/[id]/page.tsx
"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useDataStore } from "@/store/useDataStore";
import { useUiStore } from "@/store/useUiStore";
import LineByMonth from "@/components/charts/LineByMonth";
import PieBySource from "@/components/charts/PieBySource";
import PostList from "@/components/posts/PostList";
import PostEditor from "@/components/posts/PostEditor";
import Spinner from "@/components/ui/Spinner";
import StackedBarByMonth from "@/components/charts/StackedBarByMonth";

function Star({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden="true"
    >
      <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}

export default function CompanyPage() {
  const { id } = useParams<{ id: string }>();
  const { companies, selectCompany, selectedCompanyId, posts, loading, error } =
    useDataStore();
  const { toggleCompanyFavorite, isCompanyFavorite } = useUiStore();

  const company = companies.find((c) => c.id === id);

  useEffect(() => {
    if (id) selectCompany(id);
  }, [id, selectCompany]);

  if (loading) return <Spinner />;
  if (error) return <div className="p-4">에러: {error}</div>;
  if (!company) return <div className="p-4">회사를 찾을 수 없어요.</div>;

  const fav = isCompanyFavorite(id);

  return (
    <div className="grid gap-6">
      {/* 타이틀 + 즐겨찾기 */}
      <div className="flex items-center gap-2">
        <h1 className="text-xl md:text-2xl font-semibold">{company.name}</h1>
        <button
          className={`inline-flex items-center justify-center h-8 w-8 rounded-md border ${
            fav
              ? "text-yellow-500 border-yellow-500"
              : "text-neutral-500 border-neutral-300"
          }`}
          onClick={() => toggleCompanyFavorite(id)}
          aria-label={fav ? "즐겨찾기 해제" : "즐겨찾기 추가"}
          title={fav ? "즐겨찾기 해제" : "즐겨찾기 추가"}
        >
          <Star active={fav} />
        </button>
        <div className="text-sm text-neutral-500">/ {company.country}</div>
      </div>

      {/* 차트 */}
      <div className="grid gap-6 grid-cols-1">
        <LineByMonth data={company.emissions} />
      </div>
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <StackedBarByMonth data={company.emissions} />
        <PieBySource data={company.emissions} />
      </div>

      {/* 메모 영역 */}
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <PostList posts={posts} />
        {selectedCompanyId && <PostEditor companyId={selectedCompanyId} />}
      </div>
    </div>
  );
}
