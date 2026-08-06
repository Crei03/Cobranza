"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, ClipboardList, BarChart3 } from "lucide-react";

const navItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/payments/new", label: "Nuevo", icon: PlusCircle },
  { href: "/history", label: "Historial", icon: ClipboardList },
  { href: "/reports", label: "Reportes", icon: BarChart3 },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: "var(--nav-bg)",
        backdropFilter: "blur(16px)",
        borderTop: "1px solid var(--glass-border)",
      }}
    >
      <div className="max-w-lg mx-auto flex">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center gap-1 py-3 text-sm press-effect transition-smooth"
              style={{
                color: isActive ? "var(--accent)" : "var(--text-muted)",
                fontWeight: isActive ? 600 : 400,
              }}
            >
              <div className="relative">
                <Icon
                  size={24}
                  strokeWidth={isActive ? 2.2 : 1.6}
                  className="transition-smooth"
                />
                {isActive && (
                  <div
                    style={{ background: "var(--accent)" }}
                  />
                )}
              </div>
              <span className="text-xs leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
