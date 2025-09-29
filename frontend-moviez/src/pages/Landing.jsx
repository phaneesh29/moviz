import React from 'react'
import { Navigate } from 'react-router-dom'
import Footer from '../components/Footer'

const Landing = () => {
  return (
    <div className='flex bg-[#111111] flex-col min-h-screen justify-between'>
      <div>
        search <Navigate to="/search" />
      </div>
      <Footer />
    </div>
  )
}

export default Landing