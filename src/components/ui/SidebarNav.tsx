'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, LayoutDashboard, Users, LayoutTemplate, Send, Settings, HardDrive, BarChart, Sparkles, ShieldCheck, UserCog } from "lucide-react";

type Role = 'OWNER' | 'ADMIN' | 'MANAGER' | 'EDITOR' | 'VIEWER';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  roles?: Role[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navigation: NavSection[] = [
  {
    title: "Core",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Send Email", href: "/send-email", icon: Mail },
      { name: "Campaigns", href: "/campaigns", icon: Send },
      { name: "Contacts", href: "/contacts", icon: Users },
      { name: "Templates", href: "/templates", icon: LayoutTemplate },
      { name: "Analytics", href: "/analytics", icon: BarChart },
    ]
  },
  {
    title: "Studio",
    items: [
      { name: "AI Studio", href: "/ai", icon: Sparkles },
      { name: "Media Library", href: "/media", icon: HardDrive },
    ]
  },
  {
    title: "Infrastructure",
    items: [
      { name: "SMTP Setup", href: "/smtp", icon: Settings, roles: ['OWNER', 'ADMIN', 'MANAGER'] },
      { name: "Settings", href: "/settings", icon: Settings, roles: ['OWNER', 'ADMIN'] },
    ]
  },
  {
    title: "Admin",
    items: [
      { name: "Team", href: "/team", icon: UserCog, roles: ['OWNER', 'ADMIN'] },
      { name: "Audit Logs", href: "/audit", icon: ShieldCheck, roles: ['OWNER', 'ADMIN'] },
    ]
  }
];

export function SidebarNav({ userRole }: { userRole: Role }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {navigation.map((section) => {
        const allowedItems = section.items.filter(item => !item.roles || item.roles.includes(userRole));
        if (allowedItems.length === 0) return null;

        return (
          <div key={section.title} className="mb-6">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
              {section.title}
            </div>
            {allowedItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}
