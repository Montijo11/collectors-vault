'use client';

import { useState, type ReactNode } from 'react';
import { Car, MessageCircle, ShieldAlert, LogOut, Menu, X, ImageUp } from 'lucide-react';
import AuthGate from './auth/AuthGate';
import GarageHUD from './garage/GarageHUD';
import CommunityStream from './community/CommunityStream';
import AdminCommandHUD from './admin/AdminCommandHUD';
import CatalogEditor from './admin/CatalogEditor';
import { useAuth } from '@/lib/AuthContext';

type Tab = 'garage' | 'community' | 'admin' | 'catalog';

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
    { id: 'catalog', label: 'Catalog Manager', icon: <ImageUp className="h-4 w-4" />, adminOnly: true },
    { id: 'admin', label: 'Vault Command', icon: <ShieldAlert className="h-4 w-4" />, adminOnly: true },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileNavOpen((value) => !value)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 sm:hidden"
          >
            {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="rounded-xl bg-amber-500/10 p-2">
            <Car className="h-5 w-5 text-amber-400" />
          </div>
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
        <nav className={`${mobileNavOpen ? 'block' : 'hidden'} absolute z-20 w-56 border-r border-slate-800 bg-slate-950 p-3 sm:static sm:block sm:min-h-[calc(100vh-57px)]`}>
          {navItems
            .filter((item) => !item.adminOnly || isAdmin)
            .map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileNavOpen(false);
                }}
                className={`mb-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition ${activeTab === item.id ? 'bg-amber-500/10 text-amber-400' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
        </nav>

        <main className="flex-1 p-4 sm:p-6">
          {activeTab === 'garage' && <GarageHUD />}
          {activeTab === 'community' && <CommunityStream />}
          {activeTab === 'catalog' && isAdmin && <CatalogEditor />}
          {activeTab === 'admin' && isAdmin && <AdminCommandHUD />}
        </main>
      </div>
    </div>
  );
}
