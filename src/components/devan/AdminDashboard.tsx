import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  UserCheck,
  Clock,
  AlertTriangle,
  UserX,
  Shield,
  Search,
  Filter,
  RefreshCw,
  LogOut,
  CheckCircle,
  Calendar,
  Phone,
  Mail,
  Zap,
  Trash2,
  Lock,
  ArrowRight,
  TrendingUp,
  Activity,
  Award,
  Layers,
  ChevronRight,
  SlidersHorizontal,
  FileText,
  Settings as SettingsIcon,
  Send,
  Globe
} from "lucide-react";
import { DevanUser, DevanAdminStats, DevanActivationRequest, DevanAdminLog } from "../../types";

interface AdminDashboardProps {
  token: string;
  onLogout: () => void;
  onReturnToPlatform: () => void;
}

export function AdminDashboard({ token, onLogout, onReturnToPlatform }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "pending" | "active" | "expired" | "suspended" | "logs" | "settings"
  >("overview");

  const [users, setUsers] = useState<DevanUser[]>([]);
  const [requests, setRequests] = useState<DevanActivationRequest[]>([]);
  const [logs, setLogs] = useState<DevanAdminLog[]>([]);
  const [stats, setStats] = useState<DevanAdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    expiredUsers: 0,
    suspendedUsers: 0,
  });

  const [settings, setSettings] = useState({
    adminLanguage: "bilingual" as "ku" | "en" | "bilingual",
    telegramBotToken: "",
    telegramChatId: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);

  // Load all admin data
  const fetchData = async () => {
    setIsLoading(true);
    setActionErrorMsg(null);
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [usersRes, statsRes, reqsRes, logsRes, settingsRes] = await Promise.all([
        fetch("/api/devan/admin/users", { headers }),
        fetch("/api/devan/admin/stats", { headers }),
        fetch("/api/devan/admin/requests", { headers }),
        fetch("/api/devan/admin/logs", { headers }),
        fetch("/api/devan/admin/settings", { headers }),
      ]);

      if (usersRes.status === 401 || statsRes.status === 401) {
        onLogout();
        return;
      }

      const usersData = await usersRes.json();
      const statsData = await statsRes.json();
      const reqsData = await reqsRes.json();
      const logsData = await logsRes.json();
      const settingsData = await settingsRes.json();

      if (usersData.users) setUsers(usersData.users);
      if (statsData.stats) setStats(statsData.stats);
      if (reqsData.requests) setRequests(reqsData.requests);
      if (logsData.logs) setLogs(logsData.logs);
      if (settingsData.settings) setSettings(settingsData.settings);
    } catch (err: any) {
      setActionErrorMsg("Failed to synchronize with server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Handle User Activation
  const handleActivate = async (userId: string, plan: "WEEKLY" | "MONTHLY" | "YEARLY") => {
    try {
      const res = await fetch("/api/devan/admin/activate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, plan }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccessMsg(`User activated successfully for ${plan}! Expiration calculated & saved securely.`);
        setTimeout(() => setActionSuccessMsg(null), 4000);
        fetchData();
      } else {
        setActionErrorMsg(data.error || "Activation failed.");
      }
    } catch (err: any) {
      setActionErrorMsg(err.message || "Activation request failed.");
    }
  };

  // Handle Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/devan/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccessMsg("Admin & Telegram settings updated successfully.");
        setTimeout(() => setActionSuccessMsg(null), 4000);
      } else {
        setActionErrorMsg(data.error || "Failed to save settings.");
      }
    } catch (e: any) {
      setActionErrorMsg(e.message || "Failed to save settings.");
    }
  };

  // Handle User Suspend
  const handleSuspend = async (userId: string) => {
    try {
      const res = await fetch("/api/devan/admin/suspend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccessMsg("User account suspended.");
        setTimeout(() => setActionSuccessMsg(null), 4000);
        fetchData();
      } else {
        setActionErrorMsg(data.error || "Suspension failed.");
      }
    } catch (err: any) {
      setActionErrorMsg(err.message || "Suspension request failed.");
    }
  };

  // Handle User Restore
  const handleRestore = async (userId: string) => {
    try {
      const res = await fetch("/api/devan/admin/restore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccessMsg("User account restored to Active.");
        setTimeout(() => setActionSuccessMsg(null), 4000);
        fetchData();
      } else {
        setActionErrorMsg(data.error || "Restoration failed.");
      }
    } catch (err: any) {
      setActionErrorMsg(err.message || "Restoration request failed.");
    }
  };

  // Handle User Delete
  const handleDelete = async (userId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${name}"?`)) {
      return;
    }

    try {
      const res = await fetch("/api/devan/admin/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccessMsg("User deleted permanently.");
        setTimeout(() => setActionSuccessMsg(null), 4000);
        fetchData();
      } else {
        setActionErrorMsg(data.error || "Deletion failed.");
      }
    } catch (err: any) {
      setActionErrorMsg(err.message || "Deletion request failed.");
    }
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (activeTab === "pending" && u.accountStatus !== "PENDING") return false;
      if (activeTab === "active" && u.accountStatus !== "ACTIVE") return false;
      if (activeTab === "expired" && u.accountStatus !== "EXPIRED") return false;
      if (activeTab === "suspended" && u.accountStatus !== "SUSPENDED") return false;

      if (statusFilter !== "ALL" && u.accountStatus !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = u.fullName?.toLowerCase().includes(q);
        const matchesEmail = u.email?.toLowerCase().includes(q);
        const matchesPhone = u.phone?.toLowerCase().includes(q);
        const matchesUid = u.uid?.toLowerCase().includes(q);
        return matchesName || matchesEmail || matchesPhone || matchesUid;
      }

      return true;
    });
  }, [users, activeTab, statusFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-[#07090e] text-gray-100 flex flex-col select-none font-sans">
      
      {/* Top Navbar */}
      <header className="h-16 bg-[#0c1017] border-b border-white/10 px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-wider text-white flex items-center gap-2">
              <span>DEVAN</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30">
                MASTER ADMIN
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors"
            title="Refresh All Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#d4af37]" : ""}`} />
          </button>

          <button
            onClick={onReturnToPlatform}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-200 hover:text-white flex items-center gap-1.5 transition-all"
          >
            <span>Platform</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onLogout}
            className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-bold text-red-300 hover:text-red-200 flex items-center gap-1.5 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-[#0a0d14] border-r border-white/10 p-4 shrink-0 flex flex-col gap-1">
          <div className="text-[11px] font-mono font-bold text-gray-500 px-3 py-2 uppercase tracking-wider">
            Navigation
          </div>

          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "overview"
                ? "bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 shadow-sm"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Activity className="w-4 h-4" /> Overview & Metrics
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "users"
                ? "bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 shadow-sm"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Users className="w-4 h-4" /> All Users
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white/10 text-gray-300 font-mono text-[10px]">
              {stats.totalUsers}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("pending")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "pending"
                ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-amber-400" /> Pending Approval
            </span>
            {stats.pendingUsers > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-amber-500 text-black font-black text-[10px] animate-pulse">
                {stats.pendingUsers}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("active")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "active"
                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <UserCheck className="w-4 h-4 text-emerald-400" /> Active Subscriptions
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
              {stats.activeUsers}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("expired")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "expired"
                ? "bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-sm"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400" /> Expired Accounts
            </span>
            <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 font-mono text-[10px]">
              {stats.expiredUsers}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("suspended")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "suspended"
                ? "bg-gray-500/15 text-gray-300 border border-gray-500/30 shadow-sm"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <UserX className="w-4 h-4 text-gray-400" /> Suspended Accounts
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white/10 text-gray-400 font-mono text-[10px]">
              {stats.suspendedUsers}
            </span>
          </button>

          <div className="border-t border-white/10 my-2"></div>

          <button
            onClick={() => setActiveTab("logs")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "logs"
                ? "bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-sm"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-purple-400" /> Audit Logs
            </span>
            <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-mono text-[10px]">
              {logs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "settings"
                ? "bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 shadow-sm"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <SettingsIcon className="w-4 h-4 text-[#d4af37]" /> Telegram & Language
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
          </button>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl">
          
          {/* Notifications */}
          {actionSuccessMsg && (
            <div className="p-3 mb-6 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{actionSuccessMsg}</span>
            </div>
          )}

          {actionErrorMsg && (
            <div className="p-3 mb-6 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{actionErrorMsg}</span>
            </div>
          )}

          {/* Metric Cards (Visible in Overview and across top) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-8">
            <div className="bg-[#0c1017] border border-white/10 p-4 rounded-2xl relative overflow-hidden group hover:border-[#d4af37]/40 transition-all">
              <div className="text-gray-400 text-xs font-semibold mb-1 flex items-center justify-between">
                <span>Total Users</span>
                <Users className="w-4 h-4 text-[#d4af37]" />
              </div>
              <div className="text-2xl font-black text-white font-mono">{stats.totalUsers}</div>
              <div className="text-[10px] text-gray-500 mt-1">Permanent DB Records</div>
            </div>

            <div className="bg-[#0c1017] border border-emerald-500/20 p-4 rounded-2xl relative overflow-hidden group hover:border-emerald-500/50 transition-all">
              <div className="text-emerald-400 text-xs font-semibold mb-1 flex items-center justify-between">
                <span>Active Users</span>
                <UserCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-300 font-mono">{stats.activeUsers}</div>
              <div className="text-[10px] text-gray-500 mt-1">Full Trading Access</div>
            </div>

            <div className="bg-[#0c1017] border border-amber-500/20 p-4 rounded-2xl relative overflow-hidden group hover:border-amber-500/50 transition-all">
              <div className="text-amber-400 text-xs font-semibold mb-1 flex items-center justify-between">
                <span>Pending Approvals</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-300 font-mono">{stats.pendingUsers}</div>
              <div className="text-[10px] text-gray-500 mt-1">Telegram Requests</div>
            </div>

            <div className="bg-[#0c1017] border border-rose-500/20 p-4 rounded-2xl relative overflow-hidden group hover:border-rose-500/50 transition-all">
              <div className="text-rose-400 text-xs font-semibold mb-1 flex items-center justify-between">
                <span>Expired</span>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-black text-rose-300 font-mono">{stats.expiredUsers}</div>
              <div className="text-[10px] text-gray-500 mt-1">Needs Renewal</div>
            </div>

            <div className="bg-[#0c1017] border border-white/10 p-4 rounded-2xl relative overflow-hidden group hover:border-gray-500/50 transition-all col-span-2 sm:col-span-1">
              <div className="text-gray-400 text-xs font-semibold mb-1 flex items-center justify-between">
                <span>Suspended</span>
                <UserX className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-black text-gray-300 font-mono">{stats.suspendedUsers}</div>
              <div className="text-[10px] text-gray-500 mt-1">Denied Access</div>
            </div>
          </div>

          {/* User Management Section */}
          {activeTab !== "logs" && activeTab !== "settings" && (
            <div className="bg-[#0c1017] border border-white/10 rounded-3xl p-6 shadow-2xl">
              
              {/* Table Header & Controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>User Records & Subscriptions</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/10 text-gray-300">
                      {filteredUsers.length} matching
                    </span>
                  </h2>
                  <p className="text-xs text-gray-400">
                    Manage client accounts, grant weekly (7D), monthly (30D), or yearly (365D) subscriptions securely.
                  </p>
                </div>

                {/* Search & Filter */}
                <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search name, email, phone..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37]"
                    />
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-gray-300 focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="ACTIVE">Active</option>
                    <option value="EXPIRED">Expired</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>
              </div>

              {/* User Table */}
              <div className="overflow-x-auto rounded-2xl border border-white/5">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/60 text-gray-400 uppercase font-mono text-[10px] tracking-wider border-b border-white/10">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Phone / Contact</th>
                      <th className="py-3 px-4">Registered</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Plan & Expiration</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-sans">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-500 text-xs">
                          No user records matching the filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const isPending = u.accountStatus === "PENDING";
                        const isActive = u.accountStatus === "ACTIVE";
                        const isExpired = u.accountStatus === "EXPIRED";
                        const isSuspended = u.accountStatus === "SUSPENDED";

                        const expDateStr = u.expirationDate
                          ? new Date(u.expirationDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "N/A";

                        const regDateStr = u.registrationDate
                          ? new Date(u.registrationDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "N/A";

                        return (
                          <tr key={u.uid} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-white text-xs">{u.fullName || "Unnamed User"}</div>
                              <div className="text-[11px] text-gray-400 font-mono">{u.email}</div>
                              <div className="text-[9px] text-gray-600 font-mono truncate max-w-[140px]" title={u.uid}>
                                {u.uid}
                              </div>
                            </td>

                            <td className="py-3.5 px-4 font-mono text-gray-300">
                              {u.phone ? (
                                <span className="flex items-center gap-1.5">
                                  <Phone className="w-3 h-3 text-[#d4af37]" /> {u.phone}
                                </span>
                              ) : (
                                <span className="text-gray-600">None</span>
                              )}
                            </td>

                            <td className="py-3.5 px-4 font-mono text-gray-400 text-[11px]">
                              {regDateStr}
                            </td>

                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider inline-block border ${
                                  isActive
                                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                                    : isPending
                                    ? "bg-amber-500/15 border-amber-500/40 text-amber-300 animate-pulse"
                                    : isExpired
                                    ? "bg-rose-500/15 border-rose-500/40 text-rose-400"
                                    : "bg-gray-500/15 border-gray-500/40 text-gray-400"
                                }`}
                              >
                                {u.accountStatus}
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="font-bold text-white text-xs">
                                {u.subscriptionType || "NONE"}
                              </div>
                              <div className="text-[10px] text-gray-400 font-mono">
                                Exp: {expDateStr}
                              </div>
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => handleActivate(u.uid, "WEEKLY")}
                                  className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-bold text-emerald-300 hover:text-emerald-200 transition-all cursor-pointer"
                                  title="Activate for 7 Days (1 Week)"
                                >
                                  +1 Week
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleActivate(u.uid, "MONTHLY")}
                                  className="px-2.5 py-1 rounded-lg bg-[#d4af37]/15 hover:bg-[#d4af37]/30 border border-[#d4af37]/40 text-[10px] font-black text-[#d4af37] hover:text-white transition-all shadow-sm cursor-pointer"
                                  title="Activate for 30 Days (1 Month)"
                                >
                                  +1 Month
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleActivate(u.uid, "YEARLY")}
                                  className="px-2 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-[10px] font-bold text-purple-300 hover:text-purple-200 transition-all cursor-pointer"
                                  title="Activate for 365 Days (1 Year)"
                                >
                                  +1 Year
                                </button>

                                {isActive ? (
                                  <button
                                    type="button"
                                    onClick={() => handleSuspend(u.uid)}
                                    className="px-2 py-1 rounded-lg bg-gray-500/10 hover:bg-gray-500/20 border border-gray-500/30 text-[10px] font-bold text-gray-400 hover:text-white transition-all cursor-pointer"
                                    title="Suspend account access"
                                  >
                                    Suspend
                                  </button>
                                ) : isSuspended ? (
                                  <button
                                    type="button"
                                    onClick={() => handleRestore(u.uid)}
                                    className="px-2 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-[10px] font-bold text-blue-300 hover:text-white transition-all cursor-pointer"
                                    title="Restore active status"
                                  >
                                    Restore
                                  </button>
                                ) : null}

                                <button
                                  type="button"
                                  onClick={() => handleDelete(u.uid, u.fullName)}
                                  className="p-1 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                                  title="Permanently delete user record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* Activity Logs */}
          {activeTab === "logs" && (
            <div className="bg-[#0c1017] border border-white/10 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" /> Security & Activity Audit Trail
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto font-mono text-xs">
                {logs.length === 0 ? (
                  <p className="text-gray-500 py-4">No audit logs recorded yet.</p>
                ) : (
                  logs.map((log) => (
                    <div
                      key={log.logId}
                      className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded bg-white/10 text-[#d4af37] font-bold text-[10px]">
                          {log.action}
                        </span>
                        <span className="text-gray-300">
                          Target: {log.targetUserId || "System"}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Telegram & Bilingual Settings */}
          {activeTab === "settings" && (
            <div className="bg-[#0c1017] border border-[#d4af37]/30 rounded-3xl p-6 shadow-2xl max-w-2xl">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Send className="w-5 h-5 text-[#d4af37]" /> Telegram & Bilingual Notification Settings
              </h3>
              <p className="text-xs text-gray-400 mb-6">
                Configure Telegram Bot credentials for instant activation alerts and select notification language preferences (Kurdish Sorani & English).
              </p>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">
                    Notification Language Mode (زمان و زمانەکان)
                  </label>
                  <select
                    value={settings.adminLanguage}
                    onChange={(e: any) => setSettings({ ...settings, adminLanguage: e.target.value })}
                    className="w-full bg-black/50 border border-white/20 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#d4af37]"
                  >
                    <option value="bilingual">Bilingual (Kurdish Sorani & English)</option>
                    <option value="ku">Kurdish Sorani Only (کوردی سۆرانی)</option>
                    <option value="en">English Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">
                    Telegram Bot Token (TELEGRAM_BOT_TOKEN)
                  </label>
                  <input
                    type="text"
                    value={settings.telegramBotToken}
                    onChange={(e) => setSettings({ ...settings, telegramBotToken: e.target.value })}
                    placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                    className="w-full bg-black/50 border border-white/20 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">
                    Telegram Chat ID / Admin ID (TELEGRAM_CHAT_ID)
                  </label>
                  <input
                    type="text"
                    value={settings.telegramChatId}
                    onChange={(e) => setSettings({ ...settings, telegramChatId: e.target.value })}
                    placeholder="-100123456789 or @qaesarr88"
                    className="w-full bg-black/50 border border-white/20 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b38e22] text-black font-extrabold text-xs shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    Save Settings
                  </button>
                </div>
              </form>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
