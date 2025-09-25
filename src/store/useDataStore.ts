// src/store/useDataStore.ts  ← 교체
import { create } from "zustand";
import {
  fetchCompanies,
  fetchPostsByCompany,
  savePost,
  fetchCountries,
} from "@/lib/api";
import { Post, Company, Country } from "@/lib/types";
import { toMessage } from "@/lib/error";
type State = {
  countries: Country[];
  companies: Company[];
  posts: Post[];
  selectedCompanyId?: string;
  loading: boolean;
  error?: string;
};

type Actions = {
  loadCountries: () => Promise<void>;
  loadCompanies: () => Promise<void>;
  selectCompany: (id: string) => Promise<void>;
  addOrUpdatePost: (post: Omit<Post, "id"> & { id?: string }) => Promise<Post>; // ✅ 반환타입 변경
  clearError: () => void;
};

export const useDataStore = create<State & Actions>((set, get) => ({
  countries: [],
  companies: [],
  posts: [],
  selectedCompanyId: undefined,
  loading: false,
  error: undefined,

  loadCountries: async () => {
    try {
      const list = await fetchCountries();
      set({ countries: list });
    } catch (e: any) {
      set({ error: e?.message ?? "Failed to load countries" });
    }
  },

  loadCompanies: async () => {
    set({ loading: true, error: undefined });
    try {
      const list = await fetchCompanies();
      set({ companies: list, loading: false });
    } catch (e: unknown) {
      set({ loading: false, error: toMessage(e, "Failed to load companies") });
    }
  },

  selectCompany: async (id: string) => {
    set({ selectedCompanyId: id, loading: true, error: undefined, posts: [] });
    try {
      const posts = await fetchPostsByCompany(id);
      set({ posts, loading: false });
    } catch (e: any) {
      set({ loading: false, error: e?.message ?? "Failed to load posts" });
    }
  },

  addOrUpdatePost: async (post) => {
    const prev = get().posts;

    // 임시 ID로 낙관적 반영
    const tempId = post.id ?? `temp-${Date.now()}`;
    const optimistic: Post[] = post.id
      ? prev.map((p) =>
          p.id === post.id ? ({ ...(post as any), id: post.id } as Post) : p
        )
      : [...prev, { ...(post as any), id: tempId } as Post];

    set({ posts: optimistic });

    try {
      const saved = await savePost(post); // 여기서 maybeFail()로 실패 가능
      // tempId 또는 기존 id를 saved로 치환
      set({
        posts: optimistic.map((p) =>
          p.id === tempId || p.id === post.id ? saved : p
        ),
      });
      return saved; // ✅ 저장 결과 반환
    } catch (e: any) {
      // 롤백 후 반드시 다시 던진다 (UI에서 catch → 토스트)
      set({ posts: prev });
      const err = e instanceof Error ? e : new Error("Save failed");
      // 선택: 전역 에러도 남기고 싶다면 유지
      set({ error: err.message });
      throw err; // ✅ rethrow 필수
    }
  },

  clearError: () => set({ error: undefined }),
}));
