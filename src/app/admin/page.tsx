"use client"

import { UserButton, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

function Admin() {
  const { isSignedIn } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isSignedIn) {
      router.replace("/sign-in")
    }
  }, [])
  return (
    <div>
      Admin
      <UserButton />
    </div>
  )
}

export default Admin