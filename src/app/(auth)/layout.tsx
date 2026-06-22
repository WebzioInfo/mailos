import Link from "next/link";
import { Mail } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left side - Dark branding */}
      <div className="hidden md:flex flex-col justify-between bg-primary p-12 text-primary-foreground">
        <Link href="/" className="flex items-center gap-2">
          <Mail className="h-6 w-6" />
          <span className="font-bold text-xl tracking-tight">WEBZIO MAILOS</span>
        </Link>
        <div>
          <h1 className="text-4xl font-bold mb-4">The AI-Powered Email Operating System</h1>
          <p className="text-primary-foreground/80 max-w-md">Join Webzio International's premium infrastructure. Scale your campaigns securely with zero-trust SMTP architecture.</p>
        </div>
        <div className="text-sm text-primary-foreground/60">
          © 2026 Webzio International.
        </div>
      </div>
      
      {/* Right side - Form */}
      <div className="flex flex-col justify-center items-center p-8 bg-background">
        <div className="w-full max-w-[400px]">
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-center gap-2 mb-8 text-primary">
            <Mail className="h-6 w-6" />
            <span className="font-bold text-xl tracking-tight">WEBZIO</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
