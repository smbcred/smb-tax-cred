/**
 * @file DashboardLayout.tsx
 * @description Layout component for dashboard pages
 * @author R&D Tax Credit SAAS Team
 * @date 2024-01-15
 * @modified 2024-01-15
 * @dependencies React, Auth Service
 * @knowledgeBase Dashboard layout with navigation, header, and content area
 */

import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/api.service";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const NAVIGATION_ITEMS = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: "fas fa-chart-line",
  },
  {
    title: "Calculator",
    href: "/",
    icon: "fas fa-calculator",
  },
  {
    title: "Intake Forms",
    href: "/intake",
    icon: "fas fa-edit",
  },
  {
    title: "Documents",
    href: "/documents", 
    icon: "fas fa-file-alt",
  },
  {
    title: "Payment",
    href: "/checkout",
    icon: "fas fa-credit-card",
  },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    authService.logout();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Header */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/dashboard">
                <div className="flex items-center cursor-pointer">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <i className="fas fa-calculator text-white text-lg"></i>
                  </div>
                  <span className="ml-3 text-xl font-semibold text-slate-900">
                    SMBTaxCredits.com
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {NAVIGATION_ITEMS.map((item) => (
                <Link key={item.href} href={item.href}>
                  <button
                    className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      location === item.href || (item.href === "/dashboard" && location === "/")
                        ? "text-rd-primary-500 bg-blue-50"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <i className={item.icon}></i>
                    <span>{item.title}</span>
                  </button>
                </Link>
              ))}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <i className="fas fa-user text-white text-sm"></i>
                    </div>
                    <span className="hidden md:block text-sm font-medium text-slate-700">
                      {user?.email}
                    </span>
                    <i className="fas fa-chevron-down text-xs text-slate-500"></i>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem>
                    <i className="fas fa-user mr-2"></i>
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <i className="fas fa-cog mr-2"></i>
                    Account Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <i className="fas fa-question-circle mr-2"></i>
                    Help & Support
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt mr-2"></i>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 text-slate-600 hover:text-slate-900"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <i className={`fas ${isMobileMenuOpen ? "fa-times" : "fa-bars"}`}></i>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-slate-200 py-4">
              <div className="space-y-2">
                {NAVIGATION_ITEMS.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <button
                      className={`w-full flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        location === item.href || (item.href === "/dashboard" && location === "/")
                          ? "text-rd-primary-500 bg-blue-50"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <i className={item.icon}></i>
                      <span>{item.title}</span>
                    </button>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <i className="fas fa-calculator text-white"></i>
                </div>
                <span className="ml-2 font-semibold text-slate-900">SMBTaxCredits.com</span>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Professional R&D tax credit documentation service for small businesses.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Support</h4>
              <ul className="text-sm text-slate-600 space-y-2">
                <li><a href="#" className="hover:text-slate-900">Help Center</a></li>
                <li><a href="#" className="hover:text-slate-900">Contact Support</a></li>
                <li><a href="#" className="hover:text-slate-900">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Legal</h4>
              <ul className="text-sm text-slate-600 space-y-2">
                <li><a href="#" className="hover:text-slate-900">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-slate-900">Terms of Service</a></li>
                <li><a href="#" className="hover:text-slate-900">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 mt-8 pt-8 text-center">
            <p className="text-sm text-slate-500">
              © 2024 SMBTaxCredits.com. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
