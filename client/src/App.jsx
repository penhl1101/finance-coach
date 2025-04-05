import { ChakraProvider } from '@chakra-ui/react';
import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import AddExpense from './components/AddExpense';
import NetWorthDashboard from './components/NetWorthDashboard';
import Layout from './components/Layout';
import Auth from './components/Auth';

// Add this protected route wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('userToken');
  
  if (!token) {
    return <Navigate to="/auth" replace />;
  }
  
  return children;
};

const router = createBrowserRouter([
  {
    path: "/auth",
    element: <Auth />
  },
  {
    path: "/",
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    children: [
      {
        path: "/",
        element: <Dashboard />
      },
      {
        path: "/add-expense",
        element: <AddExpense />
      },
      {
        path: "/net-worth",
        element: <NetWorthDashboard />
      }
    ]
  }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
});

function App() {
  return (
    <ChakraProvider>
      <RouterProvider router={router} />
    </ChakraProvider>
  );
}

export default App;
