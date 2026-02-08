import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const footerLinks = {
  company: [
    { label: "About", href: "/about" },
    { label: "Features", href: "/features" },
  ],
  support: [
    { label: "Help Center", href: "/help" },
    { label: "FAQ", href: "/faq" },
  ],
  contact: [
    { label: "Email", href: "mailto:hello@recipeapp.com" },
    { label: "GitHub", href: "https://github.com" },
  ],
};

export function Footer() {
  return (
    <footer className="w-full bg-footer-bg text-footer-text">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo and Tagline */}
          <div className="space-y-4">
            <div className="flex items-center gap-1 text-xl font-bold">
              <span>RECIPE</span>
              <span className="text-primary">APP</span>
            </div>
            <p className="text-sm text-gray-300">
              Your personal recipe companion
            </p>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-300 transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-300 transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Contact</h3>
            <ul className="space-y-2">
              {footerLinks.contact.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-300 transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-8 border-t border-gray-700 pt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 max-w-md">
              <h3 className="mb-2 text-sm font-semibold">
                Subscribe to our newsletter
              </h3>
              <form className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-white/10 border-gray-600 text-white placeholder:text-gray-400"
                />
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary-hover text-white rounded-full px-6"
                >
                  Subscribe
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
          <p>© 2026 RecipeApp. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
