import { Link } from '@inertiajs/react'
import {
  IconBrandFacebook,
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandTwitter,
} from '@tabler/icons-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer
      className="mt-auto bg-[var(--footer-background)] text-[var(--footer-foreground)] border-t border-[var(--footer-border)]"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="container mx-auto px-4 pt-8 pb-12 md:pt-12 md:pb-16 lg:pb-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Logo and Description Section */}
          <div className="lg:col-span-4">
            <Link
              href="/"
              className="inline-block mb-6 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-[var(--footer-background)] rounded-md"
              aria-label="Company home"
            >
              <div className="flex items-center gap-2">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <rect width="32" height="32" rx="8" fill="currentColor" />
                  <path d="M16 8L24 14V22L16 28L8 22V14L16 8Z" fill="var(--footer-background)" />
                </svg>
                <span className="text-xl font-semibold">Company</span>
              </div>
            </Link>
            <p className="text-[var(--footer-foreground-muted)] leading-relaxed mb-6 text-sm">
              {
                'Building innovative solutions for modern businesses. We create exceptional digital experiences that drive growth and success.'
              }
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://twitter.com"
                className="text-[var(--footer-foreground-muted)] hover:text-[var(--footer-foreground)] transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-[var(--footer-background)] rounded-md p-1"
                aria-label="Follow us on Twitter"
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconBrandTwitter size={20} aria-hidden="true" />
              </a>
              <a
                href="https://facebook.com"
                className="text-[var(--footer-foreground-muted)] hover:text-[var(--footer-foreground)] transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-[var(--footer-background)] rounded-md p-1"
                aria-label="Follow us on Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconBrandFacebook size={20} aria-hidden="true" />
              </a>
              <a
                href="https://linkedin.com"
                className="text-[var(--footer-foreground-muted)] hover:text-[var(--footer-foreground)] transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-[var(--footer-background)] rounded-md p-1"
                aria-label="Follow us on LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconBrandLinkedin size={20} aria-hidden="true" />
              </a>
              <a
                href="https://instagram.com"
                className="text-[var(--footer-foreground-muted)] hover:text-[var(--footer-foreground)] transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-[var(--footer-background)] rounded-md p-1"
                aria-label="Follow us on Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconBrandInstagram size={20} aria-hidden="true" />
              </a>
              <a
                href="https://github.com"
                className="text-[var(--footer-foreground-muted)] hover:text-[var(--footer-foreground)] transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-[var(--footer-background)] rounded-md p-1"
                aria-label="Follow us on GitHub"
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconBrandGithub size={20} aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Navigation Links Section */}
          <nav
            className="lg:col-span-8 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4"
            aria-label="Footer navigation"
          >
            {/* Product Column */}
            <div>
              <h3 className="font-semibold mb-4 text-[var(--footer-foreground)]">Product</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-sm text-[var(--footer-foreground-muted)] hover:text-[var(--footer-foreground)] transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-[var(--footer-background)] rounded-sm"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-[var(--footer-foreground-muted)] hover:text-[var(--footer-foreground)] transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-[var(--footer-background)] rounded-sm"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-[var(--footer-foreground-muted)] hover:text-[var(--footer-foreground)] transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-[var(--footer-background)] rounded-sm"
                  >
                    Integrations
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-[var(--footer-foreground-muted)] hover:text-[var(--footer-foreground)] transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-[var(--footer-background)] rounded-sm"
                  >
                    Changelog
                  </a>
                </li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h3 className="font-semibold mb-4 text-[var(--footer-foreground)]">Company</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-sm text-[var(--footer-foreground-muted)] hover:text-[var(--footer-foreground)] transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-[var(--footer-background)] rounded-sm"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-[var(--footer-foreground-muted)] hover:text-[var(--footer-foreground)] transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-[var(--footer-background)] rounded-sm"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-[var(--footer-foreground-muted)] hover:text-[var(--footer-foreground)] transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-[var(--footer-background)] rounded-sm"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-[var(--footer-foreground-muted)] hover:text-[var(--footer-foreground)] transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-[var(--footer-background)] rounded-sm"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources Column */}
            <div>
              <h3 className="font-semibold mb-4 text-[var(--footer-foreground)]">Resources</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-sm text-[var(--footer-foreground-muted)] hover:text-[var(--footer-foreground)] transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-[var(--footer-background)] rounded-sm"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-[var(--footer-foreground-muted)] hover:text-[var(--footer-foreground)] transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-[var(--footer-background)] rounded-sm"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-[var(--footer-foreground-muted)] hover:text-[var(--footer-foreground)] transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-[var(--footer-background)] rounded-sm"
                  >
                    Community
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-[var(--footer-foreground-muted)] hover:text-[var(--footer-foreground)] transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-[var(--footer-background)] rounded-sm"
                  >
                    Guides
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h3 className="font-semibold mb-4 text-[var(--footer-foreground)]">Legal</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-sm text-[var(--footer-foreground-muted)] hover:text-[var(--footer-foreground)] transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-[var(--footer-background)] rounded-sm"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-[var(--footer-foreground-muted)] hover:text-[var(--footer-foreground)] transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-[var(--footer-background)] rounded-sm"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-[var(--footer-foreground-muted)] hover:text-[var(--footer-foreground)] transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-[var(--footer-background)] rounded-sm"
                  >
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-[var(--footer-foreground-muted)] hover:text-[var(--footer-foreground)] transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-[var(--footer-background)] rounded-sm"
                  >
                    Licenses
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[var(--footer-border)] flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--footer-foreground-muted)]">
            &copy; {currentYear} Company, Inc. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <a
              href="#"
              className="text-sm text-[var(--footer-foreground-muted)] hover:text-[var(--footer-foreground)] transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-[var(--footer-background)] rounded-sm"
            >
              Sitemap
            </a>
            <a
              href="#"
              className="text-sm text-[var(--footer-foreground-muted)] hover:text-[var(--footer-foreground)] transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-[var(--footer-background)] rounded-sm"
            >
              Accessibility
            </a>
            <a
              href="#"
              className="text-sm text-[var(--footer-foreground-muted)] hover:text-[var(--footer-foreground)] transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-[var(--footer-background)] rounded-sm"
            >
              Status
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
