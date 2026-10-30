import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ArrowRight, LogIn } from 'lucide-react';
import { Logo } from '../common/Logo';
import { Button } from '../common/Button';
import { NAV_ITEMS } from '../../lib/constants';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Monitor scroll for subtle sticky navbar blur
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === 'Escape' || event.key === 'Esc') && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-brand-border/70 py-3'
          : 'bg-[#F8FBFF]/80 backdrop-blur-sm border-b border-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between" aria-label="Main Navigation">
          {/* Left: Brand Logo */}
          <div className="flex-shrink-0">
            <Logo size="md" />
          </div>

          {/* Center: Desktop Navigation Links (Switches at lg: 1024px to prevent tablet overflow) */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="px-3.5 py-2.5 text-sm font-medium text-brand-muted hover:text-brand-500 rounded-lg hover:bg-brand-50/70 transition-colors focus-visible:outline-brand-500 min-h-[44px] flex items-center"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Right: CTA / Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Button
              variant="outline"
              size="md"
              to="/auth/login"
              className="border-slate-300 text-brand-navy hover:border-brand-500 hover:text-brand-500 font-medium px-4 py-2 text-sm rounded-xl min-h-[44px]"
            >
              Log in
            </Button>
            <Button
              variant="primary"
              size="md"
              to="/auth/register"
              className="bg-brand-500 text-white hover:bg-brand-600 font-medium px-4 py-2 text-sm rounded-xl shadow-sm min-h-[44px]"
            >
              Sign up
            </Button>
          </div>

          {/* Mobile & Tablet Menu Hamburger Toggle */}
          <div className="flex lg:hidden">
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-brand-navy hover:text-brand-500 rounded-xl hover:bg-brand-100/50 focus-visible:outline-brand-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? 'Close main menu' : 'Open main menu'}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer Navigation Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-brand-navy/30 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="fixed top-0 right-0 z-50 h-full w-4/5 max-w-sm bg-white p-6 shadow-2xl transition-all duration-300 ease-in-out lg:hidden flex flex-col justify-between translate-x-0"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
        >
          <div>
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
              <Logo size="sm" />
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-slate-500 hover:text-brand-navy rounded-lg hover:bg-slate-100 focus-visible:outline-brand-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Links */}
            <nav className="flex flex-col gap-1.5 pt-6" aria-label="Mobile Menu Links">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 text-base font-medium text-brand-navy hover:text-brand-500 hover:bg-brand-50 rounded-xl transition-colors min-h-[44px] flex items-center"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Drawer Auth Actions */}
          <div className="pt-6 border-t border-slate-100 flex flex-col gap-3">
            <Button
              variant="outline"
              size="md"
              to="/auth/login"
              icon={<LogIn className="w-4 h-4" />}
              iconPosition="left"
              fullWidth
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Log in (Phase 1 Preview)
            </Button>
            <Button
              variant="primary"
              size="md"
              to="/auth/register"
              icon={<ArrowRight className="w-4 h-4" />}
              fullWidth
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sign up
            </Button>
            <p className="text-center text-xs text-brand-muted mt-2">
              Phase 1: Project Foundation &amp; Preview
            </p>
          </div>
        </div>
      )}
    </header>
  );
};
