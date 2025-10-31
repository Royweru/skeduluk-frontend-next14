'use client'
import { useTestEmail } from '@/hooks/api/use-auth'
import React from 'react'
import toast from 'react-hot-toast'

 const TestMailPage = () => {
  const [email,setEmail] = React.useState('')
  const {mutateAsync,isPending:sendingEmail} = useTestEmail()
  const onSendTestEmail = async (e:React.FormEvent) => {
    e.preventDefault()
    try {
    const res = await mutateAsync(email)
    console.log("Test email data",res)
    } catch (error) {
        //Handled by hook 
    }
 
  }
  return (
    <div className=' p-24 '>
        <form action="" className=' flex flex-col space-y-2' onSubmit={onSendTestEmail}>
          <h1 className=' text-3xl font-bold'>Test Mail Page</h1>
        <p>This is a test mail page for testing email functionalities.</p>
        <label>
            Enter your email:
        </label>
        <input 
        type="text" className=' font-semibold p-4 border border-slate-950'
         value={email}
         onChange={(e)=>setEmail (e.target.value)}
        />
        <button
        className={` bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors w-40
            ${sendingEmail ? 'opacity-50 cursor-not-allowed' : ''}`}
        type="submit"
        disabled={sendingEmail}
        >
            Send Test Mail
        </button>
        </form>
       
    </div>
  )
}

export default TestMailPage