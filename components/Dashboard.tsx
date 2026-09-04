'use client';

import { useState, type ReactNode } from 'react';
import { BookOpen, Car, ImageUp, LogOut, Menu, MessageCircle, ShieldAlert, X } from 'lucide-react';
import AuthGate from './auth/AuthGate';
import AboutVault from './AboutVault';
import GarageHUD from './garage/GarageHUD';
import CommunityStream from './community/CommunityStream';
import AdminCommandHUD from './admin/AdminCommandHUD';
import CatalogEditor from './admin/CatalogEditor';
import { useAuth } from '@/lib/AuthContext';

type Tab = 'garage' | 'community' | 'about' | 'admin' | 'catalog';

export default function Dashboard() {
  return (
    <AuthGate>
      <DashboardShell />
    </AuthGate>
  );
}

function DashboardShell() {
  const { profile, isAdmin, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('garage');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navItems: { id: Tab; label: string; icon: ReactNode; adminOnly?: boolean }[] = [
    { id: 'garage', label: 'My Vault', icon: <Car className="h-4 w-4" /> },
    { id: 'community', label: 'Collector Exchange', icon: <MessageCircle className="h-4 w-4" /> },
    { id: 'about', label: 'Getting Started', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'catalog', label: 'Catalog Manager', icon: <ImageUp className="h-4 w-4" />, adminOnly: true },
    { id: 'admin', label: 'Vault Command', icon: <ShieldAlert className="h-4 w-4" />, adminOnly: true },
  ];

  function selectTab(tab: Tab) {
    setActiveTab(tab);
    setMobileNavOpen(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileNavOpen((value) => !value)}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 sm:hidden"
            aria-label="Toggle navigation"
          >
            {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="rounded-xl bg-amber-500/10 p-2"><Car className="h-5 w-5 text-amber-400" /></div>
          <span className="text-sm font-bold tracking-wide sm:text-base">Collector&apos;s Vault</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-slate-200">{profile?.username}</p>
            <p className="text-xs text-slate-500">{isAdmin ? 'Vault Administrator' : 'Collector'}</p>
          </div>
          <button
            onClick={() => void signOut()}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 px-3 py-2 text-xs font-medium text-slate-400 transition hover:border-red-900/50 hover:text-red-400"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      <div className="flex">
        {mobileNavOpen && (
          <button
            onClick={() => setMobileNavOpen(false)}
            className="fixed inset-0 z-10 bg-slate-950/65 sm:hidden"
            aria-label="Close navigation"
          />
        )}

        <nav className={`${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'} fixed bottom-0 left-0 top-[57px] z-20 w-64 border-r border-slate-800 bg-slate-950 p-3 transition-transform sm:sticky sm:top-[57px] sm:min-h-[calc(100vh-57px)] sm:translate-x-0`}>
          {navItems
            .filter((item) => !item.adminOnly || isAdmin)
            .map((item) => (
              <button
                key={item.id}
                onClick={() => selectTab(item.id)}
                className={`mb-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition ${activeTab === item.id ? 'bg-amber-500/10 text-amber-400' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
        </nav>

        <main className="min-w-0 flex-1 p-4 sm:p-6">
          {activeTab === 'garage' && <GarageHUD />}
          {activeTab === 'community' && <CommunityStream />}
          {activeTab === 'about' && <AboutVault />}
          {activeTab === 'catalog' && isAdmin && <CatalogEditor />}
          {activeTab === 'admin' && isAdmin && <AdminCommandHUD />}
        </main>
      </div>
    </div>
  );
}
