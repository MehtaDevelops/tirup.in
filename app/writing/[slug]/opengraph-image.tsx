import { ImageResponse } from "next/og";
import { OgShell, OG_SIZE, loadOgFonts } from "@/lib/og";
import { formatCategory } from "@/lib/category";
import { CONVEX_API_URL } from "@/lib/utils";

export const runtime = "nodejs";
export const alt = "Article by Tirup Mehta";
export const size = OG_SIZE;
export const contentType = "image/png";

const API_BASE = CONVEX_API_URL.replace(/\/+$/, "");
const SAFE_SLUG_RE = /^[a-zA-Z0-9_.-]{1,300}$/;

export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_BASE}/api/posts`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const posts = await res.json();
    if (Array.isArray(posts)) {
      return posts
        .filter((p) => p && p.slug && (p.status === "published" || !p.status))
        .map((p: { slug: string }) => ({ slug: String(p.slug) }));
    }
  } catch {
    /* fall through */
  }
  return [];
}

function plainTldr(tldr: string): string {
  return String(tldr ?? "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`>#]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 220);
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${String(d.getUTCDate()).padStart(2, "0")}.${months[d.getUTCMonth()]}.${d.getUTCFullYear()}`;
  } catch {
    return "";
  }
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const fonts = await loadOgFonts();
  const { slug } = await params;

  let title = "Article";
  let excerpt = "";
  let meta: string[] = [];
  let kicker = "Writing";

  if (slug && SAFE_SLUG_RE.test(slug) && !/^\.+$/.test(slug)) {
    try {
      const res = await fetch(`${API_BASE}/api/post?slug=${encodeURIComponent(slug)}`, {
        next: { revalidate: 60 },
      });
      if (res.ok) {
        const post = await res.json();
        // Published only: drafts never get share cards.
        if (post && !post.error && post.title && (post.status === "published" || post.status === undefined)) {
          title = String(post.title).slice(0, 140);
          excerpt = plainTldr(post.tldr ?? "");
          kicker = formatCategory(Array.isArray(post.tags) ? post.tags : []);
          if (post.createdAt) meta.push(formatDate(post.createdAt));
          if (Number.isFinite(post.readingTime) && post.readingTime > 0) {
            meta.push(`${Math.max(1, Math.min(999, post.readingTime))} min read`);
          }
        }
      }
    } catch {
      /* fall through to generic card */
    }
  }

  return new ImageResponse(
    <OgShell kicker={kicker} section="Writing" title={title} excerpt={excerpt} meta={meta} />,
    { ...OG_SIZE, fonts }
  );
}
