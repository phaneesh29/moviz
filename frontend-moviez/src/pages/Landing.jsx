import React from 'react'
import { Navigate } from 'react-router-dom'

const Landing = () => {
  return (
    <div>
      <div>
        search <Navigate to="/search" />
      </div>
    </div>
  )
}

export default Landing