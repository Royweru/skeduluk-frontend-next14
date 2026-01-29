// src/app/dashboard/profile/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Calendar,
  Shield,
  Mail,
  Zap,
  TrendingUp,
  FileText,
  AlertTriangle,
  Trash2,
  Power,
  Loader2,
  Check,
  X,
  BarChart3,
  Link2,
  Clock,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { userApi } from "@/lib/api";
import { useSocialConnections } from "@/hooks/api/use-social-connections";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface UserStats {
  total_posts: number;
  posts_published: number;
  posts_scheduled: number;
  posts_failed: number;
  connected_platforms: number;
  total_engagement: number;
  member_since_days: number;
}

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const { connections } = useSocialConnections();
  const router = useRouter();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await userApi.getStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* Header with Avatar */}
      <div
        className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800
       text-white relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-center gap-6"
          >
            {/* Avatar */}
            <div className="relative">
              <div
                className="w-28 h-28 rounded-3xl bg-gradient-to-br from-amber-400 
              to-yellow-500 flex items-center justify-center text-4xl font-bold
               text-purple-900 shadow-2xl"
              >
                {user?.username?.substring(0, 2).toUpperCase() || "U"}
              </div>
              <div
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-xl
               flex items-center justify-center border-4 border-purple-700"
              >
                <Check className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* User Info */}
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold">{user?.username || "User"}</h1>
              <p className="text-purple-200 mt-1">
                {user?.email || "email@example.com"}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium",
                    user?.plan === "premium"
                      ? "bg-amber-400 text-amber-900"
                      : "bg-white/20 text-white",
                  )}
                >
                  {user?.plan === "premium"
                    ? "✨ Premium Member"
                    : "🚀 Trial Account"}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white">
                  {user?.auth_provider === "google" ? "🔵 Google" : "📧 Email"}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-6 pb-12">
        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <StatCard
            icon={FileText}
            label="Total Posts"
            value={loadingStats ? "-" : stats?.total_posts.toString() || "0"}
            color="purple"
          />
          <StatCard
            icon={Check}
            label="Published"
            value={
              loadingStats ? "-" : stats?.posts_published.toString() || "0"
            }
            color="green"
          />
          <StatCard
            icon={Clock}
            label="Scheduled"
            value={
              loadingStats ? "-" : stats?.posts_scheduled.toString() || "0"
            }
            color="blue"
          />
          <StatCard
            icon={TrendingUp}
            label="Engagement"
            value={
              loadingStats ? "-" : formatNumber(stats?.total_engagement || 0)
            }
            color="amber"
          />
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">
                  Account Details
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <DetailRow
                  icon={Mail}
                  label="Email Address"
                  value={user?.email || "Not set"}
                />
                <DetailRow
                  icon={User}
                  label="Username"
                  value={user?.username || "Not set"}
                />
                <DetailRow
                  icon={Calendar}
                  label="Member Since"
                  value={formatDate(user?.created_at)}
                />
                <DetailRow
                  icon={Shield}
                  label="Login Method"
                  value={
                    user?.auth_provider === "google"
                      ? "Google Sign-In"
                      : "Email & Password"
                  }
                />
                <DetailRow
                  icon={Zap}
                  label="Current Plan"
                  value={user?.plan === "premium" ? "✨ Premium" : "🚀 Trial"}
                />
                {user?.last_login && (
                  <DetailRow
                    icon={Clock}
                    label="Last Login"
                    value={formatDate(user?.last_login)}
                  />
                )}
              </div>
            </motion.div>

            {/* Post Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">
                  Post Statistics
                </h2>
              </div>
              <div className="p-6">
                {loadingStats ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <ProgressRow
                      label="Published Successfully"
                      value={stats?.posts_published || 0}
                      total={stats?.total_posts || 0}
                      color="green"
                    />
                    <ProgressRow
                      label="Scheduled"
                      value={stats?.posts_scheduled || 0}
                      total={stats?.total_posts || 0}
                      color="blue"
                    />
                    <ProgressRow
                      label="Failed"
                      value={stats?.posts_failed || 0}
                      total={stats?.total_posts || 0}
                      color="red"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Connected Platforms */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">
                    Connected Platforms
                  </h2>
                  <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                    {connections?.length || 0}
                  </span>
                </div>
              </div>
              <div className="p-6">
                {connections && connections.length > 0 ? (
                  <div className="space-y-3">
                    {connections.map((conn: any) => (
                      <div
                        key={conn.platform}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                      >
                        <div
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center text-white",
                            conn.platform === "TWITTER" && "bg-black",
                            conn.platform === "FACEBOOK" && "bg-blue-600",
                            conn.platform === "LINKEDIN" && "bg-blue-700",
                            conn.platform === "YOUTUBE" && "bg-red-600",
                            conn.platform === "TIKTOK" && "bg-black",
                          )}
                        >
                          <Link2 className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 capitalize">
                            {conn.platform.toLowerCase()}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {conn.username || "Connected"}
                          </p>
                        </div>
                        <Check className="w-5 h-5 text-green-500" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Link2 className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 text-sm">
                      No platforms connected
                    </p>
                    <button
                      onClick={() => router.push("/dashboard/social")}
                      className="mt-3 text-sm font-medium text-purple-600 hover:text-purple-700"
                    >
                      Connect platforms →
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">
                  Quick Actions
                </h2>
              </div>
              <div className="p-4 space-y-2">
                <ActionButton
                  icon={Shield}
                  label="Security Settings"
                  onClick={() => router.push("/dashboard/settings")}
                />
                <ActionButton
                  icon={BarChart3}
                  label="View Analytics"
                  onClick={() => router.push("/dashboard/analytics")}
                />
              </div>
            </motion.div>

            {/* Danger Zone */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-2xl shadow-lg border border-red-100 overflow-hidden"
            >
              <div className="p-6 border-b border-red-100 bg-red-50">
                <h2 className="text-lg font-bold text-red-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Danger Zone
                </h2>
              </div>
              <div className="p-4 space-y-2">
                <button
                  onClick={() => setShowDeactivateModal(true)}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border border-amber-200
                   bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                >
                  <Power className="w-5 h-5" />
                  <div className="flex-1 text-left">
                    <p className="font-medium">Deactivate Account</p>
                    <p className="text-xs text-amber-600">
                      Temporarily disable your account
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border border-red-200
                   bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                  <div className="flex-1 text-left">
                    <p className="font-medium">Delete Account</p>
                    <p className="text-xs text-red-600">
                      Permanently remove all data
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Deactivate Modal */}
      <ConfirmModal
        show={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        onConfirm={async () => {
          await userApi.deactivateAccount();
          logout();
          router.push("/auth/login");
        }}
        title="Deactivate Account?"
        description="Your account will be deactivated. You can reactivate it by contacting support."
        confirmText="Deactivate"
        variant="warning"
      />

      {/* Delete Modal */}
      <ConfirmModal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={async () => {
          await userApi.deleteAccount();
          logout();
          router.push("/auth/login");
        }}
        title="Delete Account Permanently?"
        description="This action cannot be undone. All your posts, connections, and data will be permanently deleted."
        confirmText="Delete Forever"
        variant="danger"
      />
    </div>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: "purple" | "green" | "blue" | "amber";
}) {
  const colorClasses = {
    purple: "bg-purple-500",
    green: "bg-green-500",
    blue: "bg-blue-500",
    amber: "bg-amber-500",
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center text-white",
            colorClasses[color],
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
        <Icon className="w-5 h-5 text-gray-600" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function ProgressRow({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: "green" | "blue" | "red";
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const colorClasses = {
    green: "bg-green-500",
    blue: "bg-blue-500",
    red: "bg-red-500",
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">{value}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn("h-full rounded-full", colorClasses[color])}
        />
      </div>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-gray-50 transition-colors text-left"
    >
      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
        <Icon className="w-5 h-5 text-purple-600" />
      </div>
      <span className="flex-1 font-medium text-gray-900">{label}</span>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </button>
  );
}

function ConfirmModal({
  show,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  variant,
}: {
  show: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  description: string;
  confirmText: string;
  variant: "warning" | "danger";
}) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error("Action failed:", error);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6
             bg-white rounded-2xl shadow-2xl z-50"
          >
            <div className="text-center">
              <div
                className={cn(
                  "w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4",
                  variant === "danger" ? "bg-red-100" : "bg-amber-100",
                )}
              >
                <AlertTriangle
                  className={cn(
                    "w-8 h-8",
                    variant === "danger" ? "text-red-600" : "text-amber-600",
                  )}
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900">{title}</h3>
              <p className="text-gray-600 mt-2">{description}</p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl
                 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className={cn(
                  "flex-1 px-4 py-3 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors",
                  variant === "danger"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-amber-600 hover:bg-amber-700",
                  loading && "opacity-50",
                )}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}
