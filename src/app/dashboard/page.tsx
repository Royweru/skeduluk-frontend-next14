'use client'
import { redirect, RedirectType } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
const DashboardPage = () => {
    const {user} = useAuth()
    if (!user) {
        // If user is not authenticated, redirect to login page
        if (typeof window !== 'undefined') {
            window.location.href = '/auth/auth/login'
        } }
  return  redirect('/dashboard/overview', RedirectType.replace)
}

export default DashboardPage