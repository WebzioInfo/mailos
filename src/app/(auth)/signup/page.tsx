import Link from "next/link";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  
  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center md:text-left">
        <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
        <p className="text-muted-foreground text-sm">Start your 14-day free trial. No credit card required.</p>
      </div>

      {params.error && (
        <div className="p-3 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded-md text-sm font-medium">
          {params.error}
        </div>
      )}

      <form className="space-y-4" action="/api/auth/signup" method="POST">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="firstName">First Name</label>
            <input 
              id="firstName" name="firstName" type="text" required 
              className="w-full h-10 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="lastName">Last Name</label>
            <input 
              id="lastName" name="lastName" type="text" required 
              className="w-full h-10 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="email">Work Email</label>
          <input 
            id="email" name="email" type="email" required placeholder="john@company.com"
            className="w-full h-10 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="password">Password</label>
          <input 
            id="password" name="password" type="password" required 
            className="w-full h-10 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        
        <button type="submit" className="w-full flex items-center justify-center h-10 bg-primary text-primary-foreground rounded-md font-medium text-sm hover:bg-primary/90 transition-colors mt-4">
          Create Account
        </button>
      </form>

      <div className="text-center text-sm text-muted-foreground pt-4">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline font-medium">Log in</Link>
      </div>
    </div>
  );
}
