import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { 
  Home as HomeIcon, 
  Play as PlayIcon, 
  Settings as CogIcon, 
  BarChart3 as ChartBarIcon, 
  FileText as DocumentReportIcon,
  Menu as MenuIcon,
  X as XIcon
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Run Tests', href: '/test-runner', icon: PlayIcon },
  { name: 'Configuration', href: '/configuration', icon: CogIcon },
  { name: 'Reports', href: '/reports', icon: DocumentReportIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
]

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <XIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          <SidebarContent />
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <SidebarContent />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top bar */}
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon className="h-6 w-6" />
          </button>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  )

  function SidebarContent() {
    return (
      <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
        {/* Logo */}
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🧪</span>
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-semibold text-gray-900">Test Framework</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-8 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = router.pathname === item.href
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-900 border-r-2 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="w-full">
            <div className="text-xs text-gray-500">
              Universal Test Automation Framework v2.0
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Web Interface
            </div>
          </div>
        </div>
      </div>
    )
  }
} 