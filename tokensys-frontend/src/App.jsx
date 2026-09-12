import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import TicketList from './pages/TicketList';
import TicketDetail from './pages/TicketDetail';
import CreateTicket from './pages/CreateTicket';
import Dashboard from './pages/Dashboard';
import CompletedTickets from './pages/CompletedTickets';
import DeviceList from './pages/DeviceList';
import Contact from './pages/Contact';

function Layout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/tickets" element={<ProtectedRoute><Layout><TicketList /></Layout></ProtectedRoute>} />
          <Route path="/tickets/new" element={<ProtectedRoute><Layout><CreateTicket /></Layout></ProtectedRoute>} />
          <Route path="/tickets/:id" element={<ProtectedRoute><Layout><TicketDetail /></Layout></ProtectedRoute>} />
          <Route path="/completed" element={<ProtectedRoute><Layout><CompletedTickets /></Layout></ProtectedRoute>} />
          <Route path="/devices" element={<ProtectedRoute><Layout><DeviceList /></Layout></ProtectedRoute>} />
          <Route path="/contact" element={<ProtectedRoute><Layout><Contact /></Layout></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}