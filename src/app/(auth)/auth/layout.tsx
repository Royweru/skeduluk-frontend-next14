'use client'
import { useAuthStore } from '@/store/auth-store'
import { redirect } from 'next/navigation'
import React from 'react'

const AuthLoginSignUpLayout = ({
    children
}:{
    children:React.ReactNode
}) => {
    const {user} = useAuthStore()
    if(user) redirect('/dashboard')
  return (
    <div>
        {children}
    </div>
  )
}

export default AuthLoginSignUpLayout