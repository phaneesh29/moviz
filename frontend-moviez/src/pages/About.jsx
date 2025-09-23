import React from 'react'

const About = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-3xl text-center">
        <h1 className="text-3xl font-bold mb-6">About Moviz-Black</h1>
        
        <p className="mb-4 text-lg">
          Moviz-Black is a simple site that makes API calls to third-party services 
          to stream movies and TV series.
        </p>

        <p className="mb-4 text-lg">
          We are <span className="font-semibold">not responsible</span> for any 
          piracy of movies or series. None of the content is hosted or stored on our servers. 
        </p>

        <p className="mb-4 text-lg">
          We neither maintain a database nor keep any user data. Moviz-Black is only an interface 
          that connects you with external streaming sources.
        </p>

        <p className="mb-4 text-lg">
          The site is completely <span className="font-semibold">ad-free</span>. 
          We don’t track you, we don’t sell your data, and we don’t bombard you with spam. 
        </p>

        <p className="text-lg">
          Your <span className="font-semibold">privacy is ensured</span> — we do not collect, 
          store, or misuse any personal information. What you watch here stays with you.
        </p>
      </div>
    </div>
  )
}

export default About
