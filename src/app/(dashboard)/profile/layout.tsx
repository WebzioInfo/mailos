import Link from "next/link";
import { UserCircle, Shield, Mail, Palette } from "lucide-react";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile & Identity</h1>
        <p className="text-muted-foreground mt-1">Manage your personal information, security, and global sender defaults.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 flex-shrink-0">
          <nav className="flex space-x-2 md:flex-col md:space-x-0 md:space-y-1">
            <Link href="/profile/account" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md bg-accent text-accent-foreground">
              <UserCircle className="h-4 w-4" /> Account Details
            </Link>
            <Link href="/profile/security" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground">
              <Shield className="h-4 w-4" /> Security
            </Link>
            <Link href="/profile/sender-profile" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground">
              <Mail className="h-4 w-4" /> Sender Profile
            </Link>
            <Link href="/profile/branding" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground">
              <Palette className="h-4 w-4" /> Branding
            </Link>
          </nav>
        </aside>

        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
