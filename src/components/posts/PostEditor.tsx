// src/components/posts/PostEditor.tsx
"use client";
import { useState } from "react";
import { useDataStore } from "@/store/useDataStore";
import Card from "@/components/ui/Card";
import { useToast } from "@/components/ui/ToastProvider";
import { toMessage } from "@/lib/error";
export default function PostEditor({ companyId }: { companyId: string }) {
  const { addOrUpdatePost } = useDataStore();
  const { showToast } = useToast();

  const [title, setTitle] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const canSave = Boolean(title.trim() && dateTime.trim());
  const redirectPath = `/companies/${companyId}`; // ✅ 닫기 시 돌아갈 경로

  async function onSave() {
    if (!canSave || saving) return;
    setSaving(true);

    const payload = { resourceUid: companyId, title, dateTime, content };

    const doSave = async () => {
      await addOrUpdatePost(payload);
      showToast("저장 성공 ✅", { duration: 0, redirectTo: redirectPath }); // ✅ 닫기 시 이동
      setTitle("");
      setDateTime("");
      setContent("");
    };

    try {
      await doSave();
    } catch (err: unknown) {
      const message = toMessage(err, "알 수 없는 오류")

      // 실패 토스트 + 재시도 버튼 (닫기 시에도 페이지로 복귀)
      showToast(
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm">
            저장 실패 ❌ <span className="text-neutral-500">({message})</span>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={async () => {
              if (saving) return;
              try {
                setSaving(true);
                await doSave();
              } catch (e: any) {
                showToast(
                  `다시 실패했습니다 ❌ (${e?.message || "알 수 없는 오류"})`,
                  { duration: 0, redirectTo: redirectPath }
                );
              } finally {
                setSaving(false);
              }
            }}
            className="shrink-0 rounded-md px-3 py-1 text-xs border border-neutral-300 hover:bg-neutral-50 disabled:opacity-50"
          >
            재시도
          </button>
        </div>,
        { duration: 0, redirectTo: redirectPath } // ✅ 닫기 시 이동
      );
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
          type="button"
          className="w-full h-10 rounded-xl bg-black text-white disabled:opacity-50"
          onClick={onSave}
          disabled={!canSave || saving}
          aria-busy={saving}
        >
          {saving ? "저장 중..." : "저장"}
        </button>
      </div>
    </Card>
  );
}
