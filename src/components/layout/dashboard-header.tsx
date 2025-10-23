// src/components/layout/dashboard-header.tsx
'use client'

import React from 'react'
import { Menu, Bell, Settings, User, LogOut } from 'lucide-react'
import { User as UserType } from '@/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/providers/auth-provider'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface DashboardHeaderProps {
  user: UserType | null
  onMenuClick: () => void
  pathname: string
}

const getPageTitle = (pathname: string) => {
  if (pathname === '/dashboard') return 'Dashboard'
  if (pathname.startsWith('/dashboard/calendar')) return 'Calendar'
  if (pathname.startsWith('/dashboard/posts')) return 'Posts'
  if (pathname.startsWith('/dashboard/templates')) return 'Templates'
  if (pathname.startsWith('/dashboard/analytics')) return 'Analytics'
  if (pathname.startsWith('/dashboard/social')) return 'Social Accounts'
  if (pathname.startsWith('/dashboard/ai-tools')) return 'AI Tools'
  if (pathname.startsWith('/dashboard/settings')) return 'Settings'
  return 'Dashboard'
}

const getPageDescription = (pathname: string) => {
  if (pathname === '/dashboard') return 'Overview of your social media activity'
  if (pathname.startsWith('/dashboard/calendar')) return 'Schedule and manage your content'
  if (pathname.startsWith('/dashboard/posts')) return 'Create and manage your posts'
  if (pathname.startsWith('/dashboard/templates')) return 'Content templates library'
  if (pathname.startsWith('/dashboard/analytics')) return 'Performance metrics and insights'
  if (pathname.startsWith('/dashboard/social')) return 'Connected social platforms'
  if (pathname.startsWith('/dashboard/ai-tools')) return 'AI-powered content tools'
  if (pathname.startsWith('/dashboard/settings')) return 'Manage your account settings'
  return ''
}

const getPlanColor = (plan: string) => {
  switch (plan.toLowerCase()) {
    case 'trial':
      return 'bg-blue-100 text-blue-800'
    case 'basic':
      return 'bg-green-100 text-green-800'
    case 'pro':
      return 'bg-purple-100 text-purple-800'
    case 'enterprise':
      return 'bg-amber-100 text-amber-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function DashboardHeader({ user, onMenuClick, pathname }: DashboardHeaderProps) {
   const { logout } = useAuth()
  //was using useAuth here
  const handleSignOut = () => {
     logout()
  }

  const userInitials = user?.username?.slice(0, 2).toUpperCase() || 'U'
  const userName = user?.username || 'User'

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-slate-700" />
          </button>

          {/* Page Title */}
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {getPageTitle(pathname)}
            </h1>
            <p className="text-xs text-slate-600 hidden sm:block">
              {getPageDescription(pathname)}
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Notifications Button */}
          <button 
            className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          </button>

          {/* Settings Button - Desktop only */}
          <Link 
            href="/dashboard/settings"
            className="hidden sm:flex p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-slate-600" />
          </Link>

          {/* User Menu Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              <div className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:shadow-lg transition-all cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                  <span className="text-xs font-bold text-slate-900">
                    {userInitials}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <span className="text-sm font-medium text-slate-900">
                    {userName}
                  </span>
                  {user?.plan && (
                    <Badge variant="secondary" className={cn("text-xs ml-2", getPlanColor(user.plan))}>
                      {user.plan}
                    </Badge>
                  )}
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <span className="font-medium">{userName}</span>
                  <span className="text-xs text-slate-500 font-normal truncate">{user?.email}</span>
                  {user?.plan && (
                    <Badge variant="outline" className={cn("w-fit mt-1", getPlanColor(user.plan))}>
                      {user.plan} Plan
                    </Badge>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}