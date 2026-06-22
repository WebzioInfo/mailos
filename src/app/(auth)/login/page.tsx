'use client';

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.error || 'Invalid email or password.');
      } else if (data.success && data.redirectUrl) {
        router.push(data.redirectUrl);
        router.refresh(); // Refresh to clear any cached middleware state
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center md:text-left">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground text-sm">Enter your credentials to access your workspace.</p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded-md text-sm font-medium">
          {errorMsg}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="email">Email</label>
          <input 
            id="email"
            name="email"
            type="email" 
            required 
            placeholder="john@example.com"
            className="w-full h-10 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium" htmlFor="password">Password</label>
            <Link href="/forgot-password" className="text-xs text-primary hover:underline font-medium">Forgot password?</Link>
          </div>
          <input 
            id="password"
            name="password"
            type="password" 
            required 
            placeholder="••••••••"
            className="w-full h-10 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full flex items-center justify-center h-10 bg-primary text-primary-foreground rounded-md font-medium text-sm hover:bg-primary/90 transition-colors mt-2 disabled:opacity-50"
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <div className="text-center text-sm text-muted-foreground pt-4">
        Don't have an account?{" "}
        <Link href="/signup" className="text-primary hover:underline font-medium">Sign up</Link>
      </div>
    </div>
  );
}
