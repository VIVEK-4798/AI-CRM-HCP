import React, { useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { Bell, Menu, X, User } from 'lucide-react';

export const Layout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/hcps", label: "HCP Directory" },
    { to: "/log-interaction", label: "Log Interaction" },
    { to: "/history", label: "History" },
  ];

  return (
    <div className="min-h-screen bg-brand-bg text-text-primary flex flex-col font-sans">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-border-custom sticky top-0 z-40 shadow-premium-soft backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo Brand */}
          <Link to="/" className="flex items-center gap-3 group select-none">
            <div className="w-10 h-10 rounded-[14px] bg-primary flex items-center justify-center text-text-primary shadow-sm group-hover:scale-105 transition-all duration-200">
              <span className="font-extrabold text-xl tracking-tight">C</span>
            </div>
            <div>
              <span className="font-bold text-text-primary text-lg tracking-tight block">AI First CRM</span>
              <span className="text-[10px] text-primary font-bold block -mt-1 tracking-wider uppercase">HCP Module</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-sm font-medium transition-all duration-200 relative py-1 hover:text-text-primary ${
                    isActive 
                      ? 'text-text-primary font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary after:rounded-full' 
                      : 'text-text-secondary'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Right Action Icons */}
          <div className="hidden md:flex items-center gap-4">
            <button className="p-2 text-text-secondary hover:text-text-primary rounded-full hover:bg-slate-50 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-status-danger" />
            </button>
            
            <div className="h-6 w-px bg-border-custom" />
            
            <div className="flex items-center gap-3 pl-1">
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center border border-border-custom shadow-sm cursor-pointer select-none">
                <User className="w-4 h-4 text-text-secondary" />
              </div>
              <div className="hidden lg:block text-left select-none">
                <span className="text-xs font-semibold text-text-primary block">Rep Account</span>
                <span className="text-[10px] text-text-secondary block">Commercial Rep</span>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-text-secondary hover:text-text-primary rounded-lg focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-border-custom animate-in slide-in-from-top-4 duration-200">
            <div className="px-6 py-4 space-y-3">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block text-base font-medium py-2 px-3 rounded-button transition-colors ${
                      isActive 
                        ? 'bg-secondary-light text-text-primary font-semibold' 
                        : 'text-text-secondary hover:bg-slate-50'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="h-px bg-border-custom my-3" />
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-border-custom">
                    <User className="w-4 h-4 text-text-secondary" />
                  </div>
                  <span className="text-sm font-semibold text-text-primary">Rep Account</span>
                </div>
                <span className="text-xs bg-slate-100 text-text-secondary py-1 px-2.5 rounded-full border border-border-custom">Notifications (1)</span>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 lg:px-8 py-10">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-border-custom py-6">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-text-secondary select-none">
          <p>© 2026 AI-First CRM HCP Module. Designed for commercial excellence.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-text-primary transition-colors">Privacy Statement</a>
            <a href="#" className="hover:text-text-primary transition-colors">Support Portal</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
