'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Calendar } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type BlogPostSummary = {
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function BlogList() {
  const supabase = createClient();
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadPosts() {
      setLoading(true);

      const { data, error } = await supabase
        .from('blog_posts')
        .select('slug, title, excerpt, cover_image_url, published_at')
        .not('published_at', 'is', null)
        .lte('published_at', new Date().toISOString())
        .order('published_at', { ascending: false });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setPosts((data ?? []) as BlogPostSummary[]);
      }

      setLoading(false);
    }

    void loadPosts();
  }, []);

  return (
    <section className="mx-auto max-w-4xl">
      <div className="mb-8">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
          Collector Guides
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">
          Vault Blog
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Tips, guides, and news for Hot Wheels collectors.
        </p>
      </div>

      {errorMsg && (
        <p className="mb-4 rounded-xl border border-red-900/50 bg-red-950/35 px-3 py-2.5 text-sm text-red-300">
          {errorMsg}
        </p>
      )}

      {loading && (
        <p className="p-10 text-center text-sm text-slate-500">Loading posts...</p>
      )}

      {!loading && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-700 py-16 text-slate-500">
          <BookOpen className="h-8 w-8" />
          <p className="text-sm">No posts published yet.</p>
        </div>
      )}

      <div className="grid gap-4">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 transition hover:border-amber-500/40"
          >
            {post.cover_image_url && (
              <div className="aspect-[3/1] w-full overflow-hidden bg-slate-950">
                <img
                  src={post.cover_image_url}
                  alt={post.title}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              </div>
            )}
            <div className="p-5">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(post.published_at)}
              </p>
              <h2 className="mt-2 text-lg font-bold text-slate-100 transition group-hover:text-amber-300">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="mt-2 text-sm leading-6 text-slate-400">{post.excerpt}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
