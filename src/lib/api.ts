import {
  companies as seedCompanies,
  posts as seedPosts,
  countries as seedCountries,
} from "./seed";
import { Post, Company, Country } from "@/lib/types";

const _countries: Country[] = [...seedCountries];
const _companies: Company[] = [...seedCompanies];
let _posts: Post[] = [...seedPosts];

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
const jitter = () => 200 + Math.random() * 600;
const maybeFail = () => Math.random() < 0.15;

export async function fetchCountries(): Promise<Country[]> {
  await delay(jitter());
  return _countries;
}

export async function fetchCompanies(): Promise<Company[]> {
  await delay(jitter());
  return _companies;
}

export async function fetchCompany(id: string): Promise<Company | undefined> {
  await delay(jitter());
  return _companies.find((c) => c.id === id);
}

export async function fetchPosts(): Promise<Post[]> {
  await delay(jitter());
  return _posts;
}

export async function fetchPostsByCompany(companyId: string): Promise<Post[]> {
  await delay(jitter());
  return _posts.filter((p) => p.resourceUid === companyId);
}

export async function savePost(
  p: Omit<Post, "id"> & { id?: string }
): Promise<Post> {
  await delay(jitter());
  if (maybeFail()) throw new Error("Save failed");
  if (p.id) {
    _posts = _posts.map((x) => (x.id === p.id ? (p as Post) : x));
    return p as Post;
  }
  const created = { ...p, id: crypto.randomUUID() } as Post;
  _posts = [..._posts, created];
  return created;
}
