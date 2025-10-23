// src/app/dashboard/layout.tsx
'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '@/providers/auth-provider'
import { redirect } from 'next/navigation'
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const {isAuthenticated, isLoading} = useAuth() 
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
const user = null

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      redirect('/auth/login')
    }
  }, [isAuthenticated, isLoading])

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 bg-white/30 rounded-full animate-pulse"></div>
          </div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render layout if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50">
      {/* Mobile Sidebar Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-72 border-r-0">
          <DashboardSidebar
            collapsed={false}
            onCollapse={() => {}}
            pathname={pathname}
            onNavigate={() => setMobileOpen(false)}
            isMobile
          />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <DashboardSidebar
          collapsed={sidebarCollapsed}
          onCollapse={setSidebarCollapsed}
          pathname={pathname}
        />
      </div>

      {/* Main Content Area */}
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'
        }`}
      >
        <DashboardHeader
          user={user}
          onMenuClick={() => setMobileOpen(true)}
          pathname={pathname}
        />

        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="p-4 sm:p-6 lg:p-8"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  )
}