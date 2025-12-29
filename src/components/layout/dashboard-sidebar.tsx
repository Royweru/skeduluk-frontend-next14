// src/components/layout/dashboard-sidebar.tsx
'use client'

import React from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, Calendar, BarChart2, BookOpen, Settings, 
  ChevronLeft, ChevronRight, Sparkles, CheckCircle, FileText, Users, Zap
} from 'lucide-react'
import { useSocialConnections } from '@/hooks/api/use-social-connections'
import { cn } from '@/lib/utils'

interface SidebarProps {
  collapsed: boolean
  onCollapse: (collapsed: boolean) => void
  pathname: string
  onNavigate?: () => void
  isMobile?: boolean
}

const navigation = [
  { 
    name: 'Dashboard', 
    icon: LayoutDashboard, 
    href: '/dashboard/overview',
    description: 'Overview & stats'
  },
  { 
    name: 'Calendar', 
    icon: Calendar, 
    href: '/dashboard/calendar',
    description: 'Schedule posts'
  },
  { 
    name: 'Posts', 
    icon: FileText, 
    href: '/dashboard/posts',
    description: 'Manage content'
  },
  { 
    name: 'Analytics', 
    icon: BarChart2, 
    href: '/dashboard/analytics',
    description: 'Performance metrics'
  },
  { 
    name: 'Templates', 
    icon: BookOpen, 
    href: '/dashboard/templates',
    description: 'Content templates'
  },
  { 
    name: 'Social Accounts', 
    icon: Users, 
    href: '/dashboard/social',
    description: 'Connected platforms'
  },
  { 
    name: 'AI Tools', 
    icon: Zap, 
    href: '/dashboard/ai-tools',
    description: 'AI enhancements'
  },
  { 
    name: 'Settings', 
    icon: Settings, 
    href: '/dashboard/settings',
    description: 'Preferences'
  },
]

const platformConfig = {
  TWITTER: { name: 'Twitter', color: 'bg-black' },
  FACEBOOK: { name: 'Facebook', color: 'bg-blue-600' },
  LINKEDIN: { name: 'LinkedIn', color: 'bg-blue-700' },
}

export function DashboardSidebar({ 
  collapsed, 
  onCollapse, 
  pathname, 
  onNavigate, 
  isMobile = false 
}: SidebarProps) {
  const { connections } = useSocialConnections()
  const connectedPlatforms = connections || []

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed && !isMobile ? 80 : 288 }}
      className={cn(
        "fixed left-0 top-0 h-full bg-gradient-to-b from-slate-800 via-slate-900 to-blue-950 text-white shadow-2xl z-40",
        isMobile && "relative"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-white/10">
          <AnimatePresence mode="wait">
            {(!collapsed || isMobile) && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-slate-900" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">Skeduluk</h1>
                  <p className="text-xs text-slate-400">Social Scheduler</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Collapse/Expand Button - Only show when expanded on desktop */}
          {!isMobile && !collapsed && (
            <button
              onClick={() => onCollapse(!collapsed)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Show just logo when collapsed */}
          {collapsed && !isMobile && (
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center mx-auto">
              <Sparkles className="w-5 h-5 text-slate-900" />
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                  active
                    ? "bg-white/10 text-white shadow-lg"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                )}
                title={collapsed && !isMobile ? item.name : undefined}
              >
                <Icon className={cn(
                  "w-5 h-5 flex-shrink-0",
                  collapsed && !isMobile && "mx-auto"
                )} />
                
                <AnimatePresence mode="wait">
                  {(!collapsed || isMobile) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 min-w-0"
                    >
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-slate-400 truncate">
                        {item.description}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {active && (!collapsed || isMobile) && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute right-2 w-1 h-8 bg-amber-400 rounded-full"
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Expand Button - Show when collapsed on desktop */}
        {!isMobile && collapsed && (
          <div className="px-3 py-4 border-t border-white/10">
            <button
              onClick={() => onCollapse(false)}
              className="w-full p-2 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Connected Platforms Section - Expanded State */}
        <AnimatePresence mode="wait">
          {(!collapsed || isMobile) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="px-4 py-6 border-t border-white/10 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Connected
                </h3>
                <span className="text-xs font-medium text-amber-400">
                  {connectedPlatforms.length}
                </span>
              </div>

              <div className="space-y-2">
                {connectedPlatforms.length > 0 ? (
                  connectedPlatforms.map((conn:any) => {
                    const config = platformConfig[conn.platform as keyof typeof platformConfig]
                    return (
                      <div
                        key={conn.platform}
                        className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div className={cn("w-2 h-2 rounded-full", config?.color || 'bg-gray-500')} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {config?.name || conn.platform}
                          </p>
                          {conn.username && (
                            <p className="text-xs text-slate-400 truncate">
                              {conn.username}
                            </p>
                          )}
                        </div>
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      </div>
                    )
                  })
                ) : (
                  <p className="text-xs text-slate-400 text-center py-2">
                    No platforms connected
                  </p>
                )}
              </div>

              {connectedPlatforms.length < 3 && (
                <Link
                  href="/dashboard/social"
                  className="block text-center text-xs font-medium text-amber-400 hover:text-amber-300 py-2 transition-colors"
                >
                  + Connect Platforms
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Connected Platforms Section - Collapsed State */}
        {collapsed && !isMobile && connectedPlatforms.length > 0 && (
          <div className="px-3 py-4 border-t border-white/10">
            <div className="flex flex-col items-center gap-2">
              {connectedPlatforms.slice(0, 3).map((conn:any) => {
                const config = platformConfig[conn.platform as keyof typeof platformConfig]
                return (
                  <div
                    key={conn.platform}
                    className={cn("w-2 h-2 rounded-full", config?.color || 'bg-gray-500')}
                    title={config?.name}
                  />
                )
              })}
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  )
}