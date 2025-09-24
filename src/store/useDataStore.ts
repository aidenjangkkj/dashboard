import { create } from "zustand";
import {
  fetchCompanies,
  fetchPostsByCompany,
  savePost,
  fetchCountries,
} from "@/lib/api";
import { Post, Company, Country } from "@/lib/types";

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
  addOrUpdatePost: (post: Omit<Post, "id"> & { id?: string }) => Promise<void>;
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
    } catch (e: any) {
      set({ loading: false, error: e?.message ?? "Failed to load companies" });
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
    const tempId = post.id ?? `temp-${Date.now()}`;
    const optimistic = post.id
      ? prev.map((p) =>
          p.id === post.id ? { ...(post as any), id: post.id } : p
        )
      : [...prev, { ...(post as any), id: tempId }];

    set({ posts: optimistic });

    try {
      const saved = await savePost(post);
      set({
        posts: optimistic.map((p) =>
          p.id === tempId || p.id === post.id ? saved : p
        ),
      });
    } catch (e: any) {
      set({ posts: prev, error: e?.message ?? "Save failed" });
    }
  },

  clearError: () => set({ error: undefined }),
}));
