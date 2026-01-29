import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import PublicLayout from './layouts/PublicLayout'
import HomePage from './pages/HomePage'
import ComingSoonPage from './pages/ComingSoonPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/id" replace />
  },
  {
    path: '/:lang',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'about',
        element: <ComingSoonPage />
      },
      {
        path: 'buy',
        element: <ComingSoonPage />
      },
      {
        path: 'transparency',
        element: <ComingSoonPage />
      },
      {
        path: 'login',
        element: <ComingSoonPage />
      }
    ]
  },
  {
    path: '/about',
    element: <ComingSoonPage />
  },
  {
    path: '/buy',
    element: <ComingSoonPage />
  },
  {
    path: '/transparency',
    element: <ComingSoonPage />
  },
  {
    path: '/login',
    element: <ComingSoonPage />
  }
])

export default function App() {
  return <RouterProvider router={router} />
}
