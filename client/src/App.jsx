import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Analyze from './pages/Analyze';
import Anomalies from './pages/Anomalies';
import AnomalyDetail from './pages/AnomalyDetail';
import Heatmap from './pages/Heatmap';
import Vendors from './pages/Vendors';
import VendorDetail from './pages/VendorDetail';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/analyze" element={<Analyze />} />
        <Route path="/anomalies" element={<Anomalies />} />
        <Route path="/anomalies/:id" element={<AnomalyDetail />} />
        <Route path="/heatmap" element={<Heatmap />} />
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/vendors/:id" element={<VendorDetail />} />
      </Route>
    </Routes>
  );
}

export default App;
