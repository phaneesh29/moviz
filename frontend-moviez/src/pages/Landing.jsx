import React from 'react'
import { Navigate } from 'react-router-dom'
import Footer from '../components/Footer'

const Landing = () => {
  return (
    <div>
      <div>
        search <Navigate to="/search" />
      </div>
          <Footer />
    </div>
  )
}

export default Landing