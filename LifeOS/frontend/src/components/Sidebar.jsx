import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Target, 
  Lightbulb, 
  CheckSquare, 
  Apple, 
  Heart, 
  DollarSign,
  TrendingUp
} from 'lucide-react'

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/life-score', icon: TrendingUp, label: 'Life Score' },
  { path: '/insights', icon: Lightbulb, label: 'AI Insights' },
  { path: '/habits', icon: CheckSquare, label: 'Habits' },
  { path: '/nutrition', icon: Apple, label: 'Nutrition' },
  { path: '/mood', icon: Heart, label: 'Mood' },
  { path: '/finance', icon: DollarSign, label: 'Finance' },
]

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 p-4">
      <nav className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <div className="p-4 bg-primary-50 rounded-lg">
          <p className="text-sm text-primary-700 font-medium">SDG-3 Aligned</p>
          <p className="text-xs text-primary-600 mt-1">Good Health & Well-Being</p>
        </div>
      </div>
    </aside>
  )
}
