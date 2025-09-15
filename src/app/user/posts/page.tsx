"use client"

import { useQuery } from 'convex/react'
import React from 'react'
import { api } from '../../../../convex/_generated/api'
import { PostCards } from '@/components/global/Post/PostCards'

export default function page() {

    const myItems = useQuery(api.item.getMine)

  return (
    <main className="flex flex-col w-1/2 items-center gap-2 p-6">
        <PostCards items={myItems} />
    </main>
  )
}
