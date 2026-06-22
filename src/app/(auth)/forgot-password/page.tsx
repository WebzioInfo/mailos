import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center md:text-left">
        <h1 className="text-3xl font-bold tracking-tight">Reset password</h1>
        <p className="text-muted-foreground text-sm">Enter your email and we'll send you a link to reset your password.</p>
      </div>

      <form className="space-y-4" action="/api/auth/reset" method="POST">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="email">Email</label>
          <input 
            id="email" name="email" type="email" required placeholder="john@example.com"
            className="w-full h-10 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        
        <button type="submit" className="w-full flex items-center justify-center h-10 bg-primary text-primary-foreground rounded-md font-medium text-sm hover:bg-primary/90 transition-colors mt-2">
          Send Reset Link
        </button>
      </form>

      <div className="text-center text-sm text-muted-foreground pt-4">
        Remember your password?{" "}
        <Link href="/login" className="text-primary hover:underline font-medium">Log in</Link>
      </div>
    </div>
  );
}
