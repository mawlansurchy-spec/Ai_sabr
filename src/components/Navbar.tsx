import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { LanguageCode } from "../types";
import {
  Sparkles,
  LayoutDashboard,
  Wand2,
  Boxes,
  CreditCard,
  History,
  Bell,
  User as UserIcon,
  Shield,
  MessageSquare,
  LogOut,
  Moon,
  Sun,
  Globe,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openAuthModal: (tab: "login" | "signup") => void;
  unreadNotifsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  openAuthModal,
  unreadNotifsCount,
}) => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const languages: { code: LanguageCode; name: string; native: string }[] = [
    { code: "ku_so", name: "Kurdish Sorani", native: "کوردی سۆرانی" },
    { code: "ku_ba", name: "Kurdish Badini", native: "کوردی بادینی" },
    { code: "ar", name: "Arabic", native: "العربية" },
    { code: "en", name: "English", native: "English" },
  ];

  const currentLangObj = languages.find((l) => l.code === language) || languages[0];

  const handleNavClick = (tab: string) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl border-b transition-colors bg-white/80 dark:bg-slate-950/80 border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          id="brand-logo"
          onClick={() => handleNavClick(user ? "dashboard" : "home")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center overflow-hidden">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                Dr.Devan
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                AI
              </span>
            </div>
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 hidden sm:block">
              {t("hero_title")}
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {user ? (
            <>
              <button
                id="nav-dashboard"
                onClick={() => handleNavClick("dashboard")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  currentTab === "dashboard"
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/60"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                {t("dashboard")}
              </button>

              <button
                id="nav-generator"
                onClick={() => handleNavClick("generator")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  currentTab === "generator"
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-sm"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/60"
                }`}
              >
                <Wand2 className="w-4 h-4 text-emerald-500" />
                {t("ai_generator")}
              </button>

              <button
                id="nav-services"
                onClick={() => handleNavClick("services")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  currentTab === "services"
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/60"
                }`}
              >
                <Boxes className="w-4 h-4" />
                {t("services")}
              </button>

              <button
                id="nav-subscriptions"
                onClick={() => handleNavClick("subscriptions")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  currentTab === "subscriptions"
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/60"
                }`}
              >
                <CreditCard className="w-4 h-4" />
                {t("subscriptions")}
              </button>

              <button
                id="nav-history"
                onClick={() => handleNavClick("history")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  currentTab === "history"
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/60"
                }`}
              >
                <History className="w-4 h-4" />
                {t("my_history")}
              </button>
            </>
          ) : (
            <>
              <button
                id="nav-home"
                onClick={() => handleNavClick("home")}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  currentTab === "home"
                    ? "text-emerald-600 dark:text-emerald-400 font-bold"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {t("home")}
              </button>
              <button
                id="nav-public-services"
                onClick={() => handleNavClick("services")}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                {t("services")}
              </button>
              <button
                id="nav-public-pricing"
                onClick={() => handleNavClick("subscriptions")}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                {t("subscriptions")}
              </button>
            </>
          )}
        </nav>

        {/* Right Actions: Lang, Theme, User Profile or Login */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* User Credits Badge (When Logged In) */}
          {user && (
            <div
              id="user-credits-badge"
              onClick={() => handleNavClick("subscriptions")}
              className="cursor-pointer hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-all shadow-sm"
              title={t("free_ai_generations")}
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              {user.active_subscription && user.active_subscription.subscription_status === "ACTIVE" ? (
                <span>{user.active_subscription.plan_name}</span>
              ) : (
                <span>
                  {user.free_ai_credits} / 4 {t("free_ai_generations")}
                </span>
              )}
            </div>
          )}

          {/* Notifications Icon (When Logged In) */}
          {user && (
            <button
              id="btn-nav-notifications"
              onClick={() => handleNavClick("notifications")}
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              title={t("notifications")}
            >
              <Bell className="w-5 h-5" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-950"></span>
              )}
            </button>
          )}

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              id="btn-lang-dropdown"
              onClick={() => {
                setLangMenuOpen(!langMenuOpen);
                setUserMenuOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              <Globe className="w-4 h-4 text-emerald-500" />
              <span className="hidden md:inline">{currentLangObj.native}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {langMenuOpen && (
              <div
                id="lang-menu"
                className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100"
              >
                {languages.map((l) => (
                  <button
                    key={l.code}
                    id={`lang-select-${l.code}`}
                    onClick={() => {
                      setLanguage(l.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-start px-4 py-2.5 text-xs font-semibold flex items-center justify-between transition-colors ${
                      language === l.code
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span>{l.native}</span>
                    <span className="text-[10px] opacity-60 uppercase">{l.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            id="btn-theme-toggle"
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            title={theme === "dark" ? t("light_mode") : t("dark_mode")}
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>

          {/* User Profile Dropdown or Auth Buttons */}
          {user ? (
            <div className="relative">
              <button
                id="btn-user-menu"
                onClick={() => {
                  setUserMenuOpen(!userMenuOpen);
                  setLangMenuOpen(false);
                }}
                className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 bg-slate-50 dark:bg-slate-900 transition-all"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm">
                  {user.full_name.charAt(0) || "U"}
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 hidden md:inline max-w-[100px] truncate">
                  {user.full_name}
                </span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {userMenuOpen && (
                <div
                  id="user-dropdown-menu"
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.full_name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">@{user.username}</p>
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {t("free_ai_generations")}: {user.free_ai_credits} / 4
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      id="menu-item-profile"
                      onClick={() => handleNavClick("profile")}
                      className="w-full text-start px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      {t("profile")}
                    </button>
                    <button
                      id="menu-item-security"
                      onClick={() => handleNavClick("security")}
                      className="w-full text-start px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5"
                    >
                      <Shield className="w-4 h-4 text-slate-400" />
                      {t("security")}
                    </button>
                    <button
                      id="menu-item-contact"
                      onClick={() => handleNavClick("contact")}
                      className="w-full text-start px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5"
                    >
                      <MessageSquare className="w-4 h-4 text-slate-400" />
                      {t("contact_admin")}
                    </button>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                    <button
                      id="menu-item-logout"
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                        setCurrentTab("home");
                      }}
                      className="w-full text-start px-4 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2.5"
                    >
                      <LogOut className="w-4 h-4" />
                      {t("logout")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                id="btn-nav-login"
                onClick={() => openAuthModal("login")}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-500 transition-colors"
              >
                {t("login")}
              </button>
              <button
                id="btn-nav-signup"
                onClick={() => openAuthModal("signup")}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-md shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
              >
                {t("sign_up")}
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            id="btn-mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-drawer"
          className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl px-4 py-4 flex flex-col gap-2 animate-in slide-in-from-top-2"
        >
          {user ? (
            <>
              <div className="p-3 mb-2 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{user.full_name}</p>
                  <p className="text-[10px] text-slate-500">@{user.username}</p>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  {user.free_ai_credits} / 4 {t("free_ai_generations")}
                </div>
              </div>

              <button
                onClick={() => handleNavClick("dashboard")}
                className={`p-3 rounded-xl text-xs font-bold flex items-center gap-3 ${
                  currentTab === "dashboard" ? "bg-emerald-500/15 text-emerald-500" : "text-slate-700 dark:text-slate-300"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" /> {t("dashboard")}
              </button>
              <button
                onClick={() => handleNavClick("generator")}
                className={`p-3 rounded-xl text-xs font-bold flex items-center gap-3 ${
                  currentTab === "generator" ? "bg-emerald-500/15 text-emerald-500" : "text-slate-700 dark:text-slate-300"
                }`}
              >
                <Wand2 className="w-4 h-4 text-emerald-500" /> {t("ai_generator")}
              </button>
              <button
                onClick={() => handleNavClick("services")}
                className={`p-3 rounded-xl text-xs font-bold flex items-center gap-3 ${
                  currentTab === "services" ? "bg-emerald-500/15 text-emerald-500" : "text-slate-700 dark:text-slate-300"
                }`}
              >
                <Boxes className="w-4 h-4" /> {t("services")}
              </button>
              <button
                onClick={() => handleNavClick("subscriptions")}
                className={`p-3 rounded-xl text-xs font-bold flex items-center gap-3 ${
                  currentTab === "subscriptions" ? "bg-emerald-500/15 text-emerald-500" : "text-slate-700 dark:text-slate-300"
                }`}
              >
                <CreditCard className="w-4 h-4" /> {t("subscriptions")}
              </button>
              <button
                onClick={() => handleNavClick("history")}
                className={`p-3 rounded-xl text-xs font-bold flex items-center gap-3 ${
                  currentTab === "history" ? "bg-emerald-500/15 text-emerald-500" : "text-slate-700 dark:text-slate-300"
                }`}
              >
                <History className="w-4 h-4" /> {t("my_history")}
              </button>
              <button
                onClick={() => handleNavClick("notifications")}
                className={`p-3 rounded-xl text-xs font-bold flex items-center gap-3 ${
                  currentTab === "notifications" ? "bg-emerald-500/15 text-emerald-500" : "text-slate-700 dark:text-slate-300"
                }`}
              >
                <Bell className="w-4 h-4" /> {t("notifications")}
              </button>
              <button
                onClick={() => handleNavClick("profile")}
                className={`p-3 rounded-xl text-xs font-bold flex items-center gap-3 ${
                  currentTab === "profile" ? "bg-emerald-500/15 text-emerald-500" : "text-slate-700 dark:text-slate-300"
                }`}
              >
                <UserIcon className="w-4 h-4" /> {t("profile")}
              </button>
              <button
                onClick={() => handleNavClick("security")}
                className={`p-3 rounded-xl text-xs font-bold flex items-center gap-3 ${
                  currentTab === "security" ? "bg-emerald-500/15 text-emerald-500" : "text-slate-700 dark:text-slate-300"
                }`}
              >
                <Shield className="w-4 h-4" /> {t("security")}
              </button>
              <button
                onClick={() => handleNavClick("contact")}
                className={`p-3 rounded-xl text-xs font-bold flex items-center gap-3 ${
                  currentTab === "contact" ? "bg-emerald-500/15 text-emerald-500" : "text-slate-700 dark:text-slate-300"
                }`}
              >
                <MessageSquare className="w-4 h-4" /> {t("contact_admin")}
              </button>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                  setCurrentTab("home");
                }}
                className="p-3 rounded-xl text-xs font-bold text-rose-500 flex items-center gap-3 mt-2 border-t border-slate-100 dark:border-slate-800"
              >
                <LogOut className="w-4 h-4" /> {t("logout")}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleNavClick("home")}
                className="p-3 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 text-start"
              >
                {t("home")}
              </button>
              <button
                onClick={() => handleNavClick("services")}
                className="p-3 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 text-start"
              >
                {t("services")}
              </button>
              <button
                onClick={() => handleNavClick("subscriptions")}
                className="p-3 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 text-start"
              >
                {t("subscriptions")}
              </button>
              <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    openAuthModal("login");
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  {t("login")}
                </button>
                <button
                  onClick={() => {
                    openAuthModal("signup");
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-xs font-bold text-white shadow-md shadow-emerald-500/20"
                >
                  {t("sign_up")}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
};
