// src/components/posts/PostList.tsx  ← 교체
import Card from "@/components/ui/Card";
import { Post } from "@/lib/types";

export default function PostList({ posts }: { posts: Post[] }) {
  if (!posts.length) return <Card title="메모">아직 메모가 없어요.</Card>;

  return (
    <Card title="메모">
      <div className="space-y-3">
        {posts.map((p) => (
          <div key={p.id} className="p-3 rounded-xl border bg-neutral-50">
            <div className="text-xs text-neutral-500">{p.dateTime}</div>
            <div className="font-semibold truncate">{p.title}</div>
            <div className="text-sm line-clamp-3">{p.content}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
