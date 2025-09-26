// src/store/useDataStore.ts  ← 교체
import { create } from "zustand";
import {
  fetchCompanies,
  fetchPostsByCompany,
  savePost,
  fetchCountries,
} from "@/lib/api";
import type { Post, Company, Country } from "@/lib/types";
import { toMessage } from "@/lib/error";

type State = {
  // 데이터
  countries: Country[];
  companies: Company[];
  posts: Post[];
  selectedCompanyId?: string;

  // 상태
  loading: boolean;          // 조회 로딩
  saving: boolean;           // 쓰기(저장) 로딩

  // 에러
  error?: string;            // 조회 실패(페치) 전용 에러 → 페이지 분기에서 사용
  mutationError?: string;    // 쓰기 실패(저장) 전용 에러 → 페이지 분기엔 사용하지 않음
};

type Actions = {
  // 조회 관련
  loadCountries: () => Promise<void>;
  loadCompanies: () => Promise<void>;
  selectCompany: (id: string) => Promise<void>;

  // 쓰기(저장) 관련
  addOrUpdatePost: (post: Omit<Post, "id"> & { id?: string }) => Promise<Post>;

  // 에러 정리
  clearError: () => void;           // 조회 에러 클리어
  clearMutationError: () => void;   // 쓰기 에러 클리어
};

export const useDataStore = create<State & Actions>((set, get) => ({
  countries: [],
  companies: [],
  posts: [],
  selectedCompanyId: undefined,

  loading: false,
  saving: false,

  error: undefined,          // 조회 에러
  mutationError: undefined,  // 쓰기 에러

  // ---------- 조회 ----------
  loadCountries: async () => {
    // 조회 에러만 다루기
    set({ error: undefined });
    try {
      const list = await fetchCountries();
      set({ countries: list });
    } catch (e: unknown) {
      set({ error: toMessage(e, "Failed to load countries") });
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
    set({
      selectedCompanyId: id,
      loading: true,
      error: undefined,
      posts: [],
    });
    try {
      const posts = await fetchPostsByCompany(id);
      set({ posts, loading: false });
    } catch (e: unknown) {
      set({ loading: false, error: toMessage(e, "Failed to load posts") });
    }
  },

  // ---------- 쓰기(저장) ----------
  addOrUpdatePost: async (post) => {
    const prev = get().posts;

    // 낙관적 업데이트: 임시 ID
    const tempId = post.id ?? `temp-${Date.now()}`;

    const optimistic: Post[] = post.id
      ? prev.map((p) =>
          p.id === post.id ? ({ ...(post as Post), id: post.id } as Post) : p
        )
      : [...prev, { ...(post as Post), id: tempId } as Post];

    // 저장 전 mutationError 초기화 + 낙관적 반영 + saving on
    set({ posts: optimistic, mutationError: undefined, saving: true });

    try {
      const saved = await savePost(post); // 여기서 실패 가능
      // tempId 또는 기존 id 치환
      set({
        posts: optimistic.map((p) =>
          p.id === tempId || p.id === post.id ? saved : p
        ),
        saving: false,
      });
      return saved;
    } catch (e: unknown) {
      // 롤백
      set({
        posts: prev,
        saving: false,
        // ✅ 쓰기 실패는 mutationError에만 기록 (전역 error는 건드리지 않음)
        mutationError: toMessage(e, "Save failed"),
      });
      // UI(토스트)에서 처리할 수 있도록 반드시 rethrow
      throw (e instanceof Error ? e : new Error("Save failed"));
    }
  },

  // ---------- 에러 클리어 ----------
  clearError: () => set({ error: undefined }),
  clearMutationError: () => set({ mutationError: undefined }),
}));
