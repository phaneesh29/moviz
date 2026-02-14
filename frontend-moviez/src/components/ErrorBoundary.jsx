import React from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo)
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null })
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
                    <div className="max-w-md w-full text-center space-y-6">
                        <div className="flex justify-center">
                            <div className="p-4 bg-red-600/10 rounded-full border border-red-500/20">
                                <AlertTriangle size={48} className="text-red-400" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white mb-2">Something went wrong</h1>
                            <p className="text-gray-400 text-sm">
                                An unexpected error occurred. Don't worry, you can try again or go back home.
                            </p>
                        </div>
                        {this.state.error?.message && (
                            <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                                <p className="text-xs text-gray-500 font-mono break-all">{this.state.error.message}</p>
                            </div>
                        )}
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={() => { this.handleReset(); window.location.reload() }}
                                className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-md text-sm font-semibold transition text-white"
                            >
                                <RefreshCw size={16} /> Try Again
                            </button>
                            <a
                                href="/"
                                className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-md text-sm font-medium transition border border-white/10 text-white"
                            >
                                <Home size={16} /> Go Home
                            </a>
                        </div>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
