import React from 'react'
import { Link } from 'react-router-dom'
const Footer = () => {
    return (
        <footer className="p-4 text-center text-white text-sm mt-6">
            <div className="mb-2 space-x-4">
                <Link to="/" className="hover:underline">Landing</Link>
                <Link to="/about" className="hover:underline">About</Link>
                <Link to="/search" className="hover:underline">Search</Link>
            </div>
            <p>
                Disclaimer: We do not store any personal information in our database.
                All content is fetched from trusted 3rd-party services.
            </p>
        </footer>
    )
}

export default Footer