// src/app/dashboard/settings/page.tsx
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Lock,
  Bell,
  Shield,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Loader2,
  Mail,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { userApi } from "@/lib/api";
import { cn } from "@/lib/utils";

type TabId = "account" | "security" | "notifications";

interface Tab {
  id: TabId;
  name: string;
  icon: React.ElementType;
  description: string;
}

const tabs: Tab[] = [
  {
    id: "account",
    name: "Account",
    icon: User,
    description: "Your profile information",
  },
  {
    id: "security",
    name: "Security",
    icon: Lock,
    description: "Password & authentication",
  },
  {
    id: "notifications",
    name: "Notifications",
    icon: Bell,
    description: "Email preferences",
  },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("account");
  const { user, refreshUser } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 text-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-purple-200 mt-1">
                Manage your account and preferences
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Sidebar Tabs */}
            <div className="lg:w-64 bg-gray-50 border-b lg:border-b-0 lg:border-r border-gray-100">
              <nav className="p-4 space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left",
                        isActive
                          ? "bg-purple-600 text-white shadow-lg shadow-purple-200"
                          : "hover:bg-gray-100 text-gray-600",
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "font-medium text-sm",
                            isActive ? "text-white" : "text-gray-900",
                          )}
                        >
                          {tab.name}
                        </p>
                        <p
                          className={cn(
                            "text-xs truncate",
                            isActive ? "text-purple-200" : "text-gray-500",
                          )}
                        >
                          {tab.description}
                        </p>
                      </div>
                      <ChevronRight
                        className={cn(
                          "w-4 h-4",
                          isActive ? "text-white" : "text-gray-400",
                        )}
                      />
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 lg:p-8">
              <AnimatePresence mode="wait">
                {activeTab === "account" && (
                  <AccountTab key="account" user={user} />
                )}
                {activeTab === "security" && <SecurityTab key="security" />}
                {activeTab === "notifications" && (
                  <NotificationsTab
                    key="notifications"
                    user={user}
                    onUpdate={refreshUser}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// ACCOUNT TAB
// ============================================
function AccountTab({ user }: { user: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-xl font-bold text-gray-900">Account Information</h2>
        <p className="text-sm text-gray-500 mt-1">
          Your personal details and account status
        </p>
      </div>

      {/* User Avatar & Basic Info */}
      <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
          {user?.username?.substring(0, 2).toUpperCase() || "U"}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {user?.username || "User"}
          </h3>
          <p className="text-gray-600">{user?.email || "email@example.com"}</p>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium",
                user?.plan === "premium"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-purple-100 text-purple-700",
              )}
            >
              {user?.plan === "premium" ? "✨ Premium" : "🚀 Trial"}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              {user?.auth_provider === "google"
                ? "🔵 Google Account"
                : "📧 Email Account"}
            </span>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        <InfoCard
          icon={Mail}
          label="Email Address"
          value={user?.email || "Not set"}
          verified={true}
        />
        <InfoCard
          icon={User}
          label="Username"
          value={user?.username || "Not set"}
        />
        <InfoCard
          icon={Shield}
          label="Account Status"
          value={user?.is_active ? "Active" : "Inactive"}
          status={user?.is_active ? "success" : "warning"}
        />
        <InfoCard
          icon={Lock}
          label="Login Method"
          value={
            user?.auth_provider === "google"
              ? "Google Sign-In"
              : "Email & Password"
          }
        />
      </div>

      {/* Usage Stats */}
      <div className="p-6 bg-gray-50 rounded-2xl">
        <h3 className="font-semibold text-gray-900 mb-4">Usage This Month</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Posts Used</span>
              <span className="font-medium">
                {user?.posts_used || 0} / {user?.posts_limit || 10}
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(((user?.posts_used || 0) / (user?.posts_limit || 10)) * 100, 100)}%`,
                }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
  verified,
  status,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  verified?: boolean;
  status?: "success" | "warning";
}) {
  return (
    <div className="p-4 bg-gray-50 rounded-xl">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-white rounded-lg shadow-sm">
          <Icon className="w-4 h-4 text-gray-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 mb-1">{label}</p>
          <div className="flex items-center gap-2">
            <p className="font-medium text-gray-900 truncate">{value}</p>
            {verified && (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <Check className="w-3 h-3" /> Verified
              </span>
            )}
            {status === "success" && (
              <span className="w-2 h-2 rounded-full bg-green-500" />
            )}
            {status === "warning" && (
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SECURITY TAB
// ============================================
function SecurityTab() {
  const { user } = useAuthStore();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const isGoogleUser = user?.auth_provider === "google";

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({
        type: "error",
        text: "Password must be at least 8 characters",
      });
      return;
    }

    setLoading(true);
    try {
      await userApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setMessage({
        type: "success",
        text: "Password updated successfully! 🔐",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.response?.data?.detail || "Failed to change password",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-xl font-bold text-gray-900">Security Settings</h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage your password and account security
        </p>
      </div>

      {isGoogleUser ? (
        <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">
                Google Account Security
              </h3>
              <p className="text-blue-700 text-sm mt-1">
                Your account is secured through Google. Password changes are
                managed through your Google account settings.
              </p>
              <a
                href="https://myaccount.google.com/security"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Manage Google Security <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleChangePassword} className="space-y-6">
          {/* Message */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={cn(
                  "p-4 rounded-xl flex items-center gap-3",
                  message.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-100"
                    : "bg-red-50 text-red-700 border border-red-100",
                )}
              >
                {message.type === "success" ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span>{message.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Password Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Enter current password"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type={showPasswords ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Enter new password (min 8 characters)"
                required
                minLength={8}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type={showPasswords ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Confirm new password"
                required
              />
            </div>

            <button
              type="button"
              onClick={() => setShowPasswords(!showPasswords)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              {showPasswords ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              {showPasswords ? "Hide" : "Show"} passwords
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-purple-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Update Password
              </>
            )}
          </button>
        </form>
      )}

      {/* Security Tips */}
      <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl">
        <h3 className="font-semibold text-amber-900 mb-3">🔒 Security Tips</h3>
        <ul className="space-y-2 text-sm text-amber-800">
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 mt-0.5 text-amber-600" />
            Use a unique password you don't use elsewhere
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 mt-0.5 text-amber-600" />
            Mix uppercase, lowercase, numbers, and symbols
          </li>
          <li className="flex items-start gap-2">
            <Check className="w-4 h-4 mt-0.5 text-amber-600" />
            Never share your password with anyone
          </li>
        </ul>
      </div>
    </motion.div>
  );
}

// ============================================
// NOTIFICATIONS TAB
// ============================================
function NotificationsTab({
  user,
  onUpdate,
}: {
  user: any;
  onUpdate: () => void;
}) {
  const [prefs, setPrefs] = useState({
    email_on_post_success: user?.email_on_post_success ?? true,
    email_on_post_failure: user?.email_on_post_failure ?? true,
    email_weekly_analytics: user?.email_weekly_analytics ?? true,
  });
  const [loading, setLoading] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleToggle = async (key: keyof typeof prefs) => {
    const newValue = !prefs[key];
    setLoading(key);
    setSaved(false);

    try {
      await userApi.updateNotificationPreferences({ [key]: newValue });
      setPrefs((prev) => ({ ...prev, [key]: newValue }));
      setSaved(true);
      onUpdate();
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Failed to update preference:", error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-xl font-bold text-gray-900">Email Notifications</h2>
        <p className="text-sm text-gray-500 mt-1">
          Choose what emails you'd like to receive
        </p>
      </div>

      {/* Saved indicator */}
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-green-50 text-green-700 rounded-xl flex items-center gap-2 text-sm"
          >
            <Check className="w-4 h-4" />
            Preferences saved!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        <NotificationToggle
          icon="🎉"
          title="Post Success Notifications"
          description="Get notified when your scheduled posts are successfully published"
          checked={prefs.email_on_post_success}
          loading={loading === "email_on_post_success"}
          onChange={() => handleToggle("email_on_post_success")}
        />

        <NotificationToggle
          icon="⚠️"
          title="Post Failure Alerts"
          description="Receive alerts when a post fails to publish so you can take action"
          checked={prefs.email_on_post_failure}
          loading={loading === "email_on_post_failure"}
          onChange={() => handleToggle("email_on_post_failure")}
        />

        <NotificationToggle
          icon="📊"
          title="Weekly Analytics Summary"
          description="Get a weekly recap of your social media performance"
          checked={prefs.email_weekly_analytics}
          loading={loading === "email_weekly_analytics"}
          onChange={() => handleToggle("email_weekly_analytics")}
        />
      </div>

      {/* Info box */}
      <div className="p-6 bg-purple-50 border border-purple-100 rounded-2xl">
        <div className="flex items-start gap-4">
          <div className="text-2xl">💌</div>
          <div>
            <h3 className="font-semibold text-purple-900">You're in control</h3>
            <p className="text-purple-700 text-sm mt-1">
              We only send emails that help you succeed. Updates are instant
              when you toggle these settings.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function NotificationToggle({
  icon,
  title,
  description,
  checked,
  loading,
  onChange,
}: {
  icon: string;
  title: string;
  description: string;
  checked: boolean;
  loading: boolean;
  onChange: () => void;
}) {
  return (
    <div className="p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-4">
        <div className="text-2xl">{icon}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        </div>
        <button
          onClick={onChange}
          disabled={loading}
          className={cn(
            "relative w-12 h-7 rounded-full transition-colors",
            checked ? "bg-purple-600" : "bg-gray-300",
            loading && "opacity-50",
          )}
        >
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            </div>
          ) : (
            <motion.div
              initial={false}
              animate={{ x: checked ? 22 : 2 }}
              className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm"
            />
          )}
        </button>
      </div>
    </div>
  );
}
