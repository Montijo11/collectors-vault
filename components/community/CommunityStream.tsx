'use client';

import { useMemo, useState } from 'react';
import { MessageCircle, Send, Tag, Users } from 'lucide-react';

const categories = ['All posts', 'Updates', 'Hunting Logs', 'Error & Variation Discoveries', 'Trade Listings', 'General Chat', 'Show & Tell'];

type Post = {
  id: number;
  category: string;
  author: string;
  time: string;
  title: string;
  body: string;
  comments: number;
};

const initialPosts: Post[] = [
  {
    id: 1,
    category: 'Hunting Logs',
    author: 'DiecastDan',
    time: '18 min ago',
    title: 'Fresh premium restock at the northside store',
    body: 'Found the new boulevard wave and a few team transport sets. The pegs were picked over, but there are still a couple of premiums left.',
    comments: 7,
  },
  {
    id: 2,
    category: 'Trade Listings',
    author: 'R34Collector',
    time: '1 hr ago',
    title: 'Looking to trade duplicate JDM premiums',
    body: 'Offering an extra Nissan Skyline GT-R R34 premium. Looking for Porsche, Audi, or Honda premiums in mint card condition.',
    comments: 12,
  },
  {
    id: 3,
    category: 'Show & Tell',
    author: 'MintCardMike',
    time: '3 hrs ago',
    title: 'My first completed Super Treasure Hunt display',
    body: 'Finally arranged the display case after years of hunting. The 55 Chevy Bel Air Gasser is still the centerpiece.',
    comments: 23,
  },
  {
    id: 4,
    category: 'Error & Variation Discoveries',
    author: 'CastingScout',
    time: 'Yesterday',
    title: 'Possible tampo variation on the latest Camaro',
    body: 'Has anyone else found this version with the missing side stripe? I checked two cases and only one had it.',
    comments: 9,
  },
];

function categoryStyle(category: string) {
  if (category === 'Trade Listings') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';
  if (category === 'Hunting Logs') return 'border-amber-500/30 bg-amber-500/10 text-amber-300';
  if (category === 'Error & Variation Discoveries') return 'border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300';
  return 'border-sky-500/30 bg-sky-500/10 text-sky-300';
}

export default function CommunityStream() {
  const [posts, setPosts] = useState(initialPosts);
  const [activeCategory, setActiveCategory] = useState('All posts');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('General Chat');

  const visiblePosts = useMemo(
    () => activeCategory === 'All posts' ? posts : posts.filter((post) => post.category === activeCategory),
    [posts, activeCategory]
  );

  function publishPost() {
    if (!title.trim() || !body.trim()) return;
    setPosts((current) => [
      {
        id: Date.now(),
        category,
        author: 'You',
        time: 'Just now',
        title: title.trim(),
        body: body.trim(),
        comments: 0,
      },
      ...current,
    ]);
    setTitle('');
    setBody('');
    setCategory('General Chat');
    setActiveCategory('All posts');
  }

  return (
    <section className="mx-auto max-w-5xl">
      <div className="mb-6">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">Community Hub</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">Collector Exchange</h1>
        <p className="mt-1 text-sm text-slate-500">Share finds, identify variations, and connect with other collectors.</p>
      </div>

      <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-lg bg-sky-500/10 p-2 text-sky-400"><Send className="h-4 w-4" /></div>
          <h2 className="font-semibold text-slate-100">Start a conversation</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-[170px_1fr]">
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="input-field">
            {categories.slice(1).map((item) => <option key={item}>{item}</option>)}
          </select>
          <input value={title} onChange={(event) => setTitle(event.target.value)} className="input-field" placeholder="Post title" />
        </div>
        <textarea value={body} onChange={(event) => setBody(event.target.value)} className="input-field mt-3 min-h-28 resize-y" placeholder="What would you like to share?" />
        <div className="mt-3 flex justify-end">
          <button onClick={publishPost} className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400"><Send className="h-3.5 w-3.5" />Publish post</button>
        </div>
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {categories.map((item) => (
          <button key={item} onClick={() => setActiveCategory(item)} className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition ${activeCategory === item ? 'border-amber-500 bg-amber-500 text-slate-950' : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600 hover:text-slate-200'}`}>{item}</button>
        ))}
      </div>

      <div className="space-y-3">
        {visiblePosts.map((post) => (
          <article key={post.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-slate-700 sm:p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${categoryStyle(post.category)}`}>{post.category}</span>
              <span className="text-xs text-slate-600">{post.time}</span>
            </div>
            <h2 className="text-base font-semibold text-slate-100">{post.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">{post.body}</p>
            <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500"><Users className="h-3.5 w-3.5" />{post.author}</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500"><MessageCircle className="h-3.5 w-3.5" />{post.comments} comments</span>
            </div>
          </article>
        ))}
        {visiblePosts.length === 0 && <div className="rounded-2xl border border-dashed border-slate-700 p-10 text-center text-sm text-slate-500">No posts in this category yet.</div>}
      </div>

      <div className="mt-6 flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3 text-xs text-slate-500">
        <Tag className="h-4 w-4 text-amber-400" />
        Community posting is currently a local interface preview. Connect this screen to the `forum_posts` Supabase table in the next data-integration step.
      </div>
    </section>
  );
}
