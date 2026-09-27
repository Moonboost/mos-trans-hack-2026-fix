"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUser } from "@/entities/user/model/user-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SignOut, User, Gear, Briefcase } from "@phosphor-icons/react";

export function ProfileSidebar() {
  const pathname = usePathname();
  const { logout } = useUser();
  const router = useRouter();
  const [domain, setDomain] = useState('');
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDomain(window.location.hostname);
    }
  }, []);

  const navItems = [
    { label: "Профиль", href: `/app/profile`, icon: User },
    { label: "Настройки", href: `/app/profile/settings`, icon: Gear },
    { label: "Безопасность", href: `/app/profile/security`, icon: Briefcase },
  ];

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <aside className="w-full md:w-64 shrink-0 h-fit rounded-2xl border border-[var(--outline)] bg-[var(--card)] p-5 transition-all">
      <div className="mb-5 pb-5 border-b border-[var(--outline)]">
        <h2 className="text-lg font-semibold tracking-tight text-[var(--on-bg-high)]">
          Личный кабинет
        </h2>
      </div>
      
      <nav className="flex flex-col space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-[var(--primary-glass)] text-[var(--primary)]"
                  : "text-[var(--on-bg-medium)] hover:bg-[var(--state-hover)] hover:text-[var(--on-bg-high)]"
              )}
            >
              <Icon 
                className="size-5 shrink-0" 
                weight={isActive ? "fill" : "regular"} 
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
        
        <div className="mt-4 pt-4 border-t border-[var(--outline)]">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--on-bg-medium)] transition-all duration-200 hover:bg-red-500/10 hover:text-red-500"
          >
            <SignOut className="size-5 shrink-0" />
            <span>Выйти</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}