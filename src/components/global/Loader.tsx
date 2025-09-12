import React from 'react'
import { BiLoaderCircle } from "react-icons/bi";


export default function Loader({text}: any) {
  return (
    <div className='flex flex-col items-center justify-center gap-2 w-full min-h-screen bg-primary text-white text-lg'>
        <BiLoaderCircle className='animate-spin' size={40} />
        {text}
    </div>
  )
}
