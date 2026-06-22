import Link from "next/link";
import { Check } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4">Simple, transparent pricing</h1>
            <p className="text-xl text-muted-foreground">Choose the perfect plan for your email operations.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter Plan */}
            <div className="border rounded-xl p-8 bg-background shadow-sm flex flex-col">
              <h3 className="text-2xl font-semibold mb-2">Starter</h3>
              <div className="text-4xl font-bold mb-6">$49<span className="text-lg text-muted-foreground font-normal">/mo</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-primary" /> <span>10,000 emails/mo</span></li>
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-primary" /> <span>3 SMTP Profiles</span></li>
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-primary" /> <span>Basic Templates</span></li>
              </ul>
              <Link href="/signup" className="w-full text-center py-2 px-4 rounded-md border border-input hover:bg-accent font-medium transition-colors">Start Free Trial</Link>
            </div>

            {/* Pro Plan */}
            <div className="border-2 border-primary rounded-xl p-8 bg-background shadow-md flex flex-col relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</div>
              <h3 className="text-2xl font-semibold mb-2">Professional</h3>
              <div className="text-4xl font-bold mb-6">$149<span className="text-lg text-muted-foreground font-normal">/mo</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-primary" /> <span>100,000 emails/mo</span></li>
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-primary" /> <span>Unlimited SMTP</span></li>
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-primary" /> <span>AI Studio Access</span></li>
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-primary" /> <span>Advanced CRM</span></li>
              </ul>
              <Link href="/signup" className="w-full text-center py-2 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors">Start Free Trial</Link>
            </div>

            {/* Enterprise Plan */}
            <div className="border rounded-xl p-8 bg-background shadow-sm flex flex-col">
              <h3 className="text-2xl font-semibold mb-2">Enterprise</h3>
              <div className="text-4xl font-bold mb-6">Custom</div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-primary" /> <span>Unlimited Volume</span></li>
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-primary" /> <span>Dedicated IP</span></li>
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-primary" /> <span>Custom Contracts</span></li>
              </ul>
              <Link href="/contact" className="w-full text-center py-2 px-4 rounded-md border border-input hover:bg-accent font-medium transition-colors">Contact Sales</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
