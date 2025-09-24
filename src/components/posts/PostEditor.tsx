// src/components/posts/PostEditor.tsx  ← 교체
"use client";
import { useState } from "react";
import { useDataStore } from "@/store/useDataStore";
import Card from "@/components/ui/Card";

export default function PostEditor({ companyId }: { companyId: string }) {
  const { addOrUpdatePost } = useDataStore();
  const [title, setTitle] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const canSave = title.trim() && dateTime.trim();

  async function onSave() {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      await addOrUpdatePost({ resourceUid: companyId, title, dateTime, content });
      setTitle(""); setDateTime(""); setContent("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card title="메모 추가">
      <div className="space-y-3">
        <div>
          <label className="block text-sm text-neutral-600 mb-1">제목</label>
          <input
            className="w-full h-10 border rounded-lg px-3 text-sm outline-none focus:border-neutral-400"
            placeholder="예: 2월 세수 급증 원인"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-neutral-600 mb-1">연월</label>
          <input
            className="w-full h-10 border rounded-lg px-3 text-sm outline-none focus:border-neutral-400"
            placeholder="예: 2024-02"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-neutral-600 mb-1">내용</label>
          <textarea
            className="w-full border rounded-lg p-3 text-sm h-28 outline-none focus:border-neutral-400"
            placeholder="메모 내용을 입력하세요..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <button
          className="w-full h-10 rounded-xl bg-black text-white disabled:opacity-50"
          onClick={onSave}
          disabled={!canSave || saving}
        >
          {saving ? "저장 중..." : "저장"}
        </button>
      </div>
    </Card>
  );
}
