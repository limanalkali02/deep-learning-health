import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { SelectRolePage } from './pages/SelectRolePage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/DashboardLayout';
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { HealthProfilePage } from './pages/patient/HealthProfilePage';
import { CvdRiskPage } from './pages/patient/CvdRiskPage';
import { RecommendationsPage } from './pages/patient/RecommendationsPage';
import { ProviderDashboard } from './pages/provider/ProviderDashboard';
import { ProviderPatientsPage } from './pages/provider/ProviderPatientsPage';
import { ProviderConfigurePage } from './pages/provider/ProviderConfigurePage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminPerformancePage } from './pages/admin/AdminPerformancePage';
import { AdminRetrainPage } from './pages/admin/AdminRetrainPage';
import { LayoutDashboard, HeartPulse, Activity, Building2, Users, Settings, BarChart3, BrainCircuit } from 'lucide-react';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/select-role" element={<SelectRolePage />} />

          {/* Patient */}
          <Route path="/patient" element={<ProtectedRoute allowedRole="patient"><DashboardLayout role="patient" navItems={[
            { to: '/patient', label: 'Dashboard', icon: LayoutDashboard },
            { to: '/patient/profile', label: 'Health Profile', icon: HeartPulse },
            { to: '/patient/risk', label: 'CVD Risk', icon: Activity },
            { to: '/patient/recommendations', label: 'Recommendations', icon: Building2 },
          ]} title="Patient Portal" subtitle="Manage your health and recommendations"><PatientDashboard /></DashboardLayout></ProtectedRoute>} />
          <Route path="/patient/profile" element={<ProtectedRoute allowedRole="patient"><DashboardLayout role="patient" navItems={[
            { to: '/patient', label: 'Dashboard', icon: LayoutDashboard },
            { to: '/patient/profile', label: 'Health Profile', icon: HeartPulse },
            { to: '/patient/risk', label: 'CVD Risk', icon: Activity },
            { to: '/patient/recommendations', label: 'Recommendations', icon: Building2 },
          ]} title="Health Profile" subtitle="Your clinical and lifestyle data"><HealthProfilePage /></DashboardLayout></ProtectedRoute>} />
          <Route path="/patient/risk" element={<ProtectedRoute allowedRole="patient"><DashboardLayout role="patient" navItems={[
            { to: '/patient', label: 'Dashboard', icon: LayoutDashboard },
            { to: '/patient/profile', label: 'Health Profile', icon: HeartPulse },
            { to: '/patient/risk', label: 'CVD Risk', icon: Activity },
            { to: '/patient/recommendations', label: 'Recommendations', icon: Building2 },
          ]} title="CVD Risk Prediction" subtitle="Risk score with XAI explanation"><CvdRiskPage /></DashboardLayout></ProtectedRoute>} />
          <Route path="/patient/recommendations" element={<ProtectedRoute allowedRole="patient"><DashboardLayout role="patient" navItems={[
            { to: '/patient', label: 'Dashboard', icon: LayoutDashboard },
            { to: '/patient/profile', label: 'Health Profile', icon: HeartPulse },
            { to: '/patient/risk', label: 'CVD Risk', icon: Activity },
            { to: '/patient/recommendations', label: 'Recommendations', icon: Building2 },
          ]} title="Facility Recommendations" subtitle="Personalized healthcare facility matches"><RecommendationsPage /></DashboardLayout></ProtectedRoute>} />

          {/* Provider */}
          <Route path="/provider" element={<ProtectedRoute allowedRole="provider"><DashboardLayout role="provider" navItems={[
            { to: '/provider', label: 'Dashboard', icon: LayoutDashboard },
            { to: '/provider/patients', label: 'Patient Records', icon: Users },
            { to: '/provider/configure', label: 'Configure', icon: Settings },
          ]} title="Provider Portal" subtitle="Clinical decision support"><ProviderDashboard /></DashboardLayout></ProtectedRoute>} />
          <Route path="/provider/patients" element={<ProtectedRoute allowedRole="provider"><DashboardLayout role="provider" navItems={[
            { to: '/provider', label: 'Dashboard', icon: LayoutDashboard },
            { to: '/provider/patients', label: 'Patient Records', icon: Users },
            { to: '/provider/configure', label: 'Configure', icon: Settings },
          ]} title="Patient Records" subtitle="Clinical rationale and feedback"><ProviderPatientsPage /></DashboardLayout></ProtectedRoute>} />
          <Route path="/provider/configure" element={<ProtectedRoute allowedRole="provider"><DashboardLayout role="provider" navItems={[
            { to: '/provider', label: 'Dashboard', icon: LayoutDashboard },
            { to: '/provider/patients', label: 'Patient Records', icon: Users },
            { to: '/provider/configure', label: 'Configure', icon: Settings },
          ]} title="Configure Parameters" subtitle="System and model settings"><ProviderConfigurePage /></DashboardLayout></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><DashboardLayout role="admin" navItems={[
            { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
            { to: '/admin/users', label: 'User Accounts', icon: Users },
            { to: '/admin/performance', label: 'Performance', icon: BarChart3 },
            { to: '/admin/retrain', label: 'Retrain Model', icon: BrainCircuit },
          ]} title="Admin Portal" subtitle="System management"><AdminDashboard /></DashboardLayout></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRole="admin"><DashboardLayout role="admin" navItems={[
            { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
            { to: '/admin/users', label: 'User Accounts', icon: Users },
            { to: '/admin/performance', label: 'Performance', icon: BarChart3 },
            { to: '/admin/retrain', label: 'Retrain Model', icon: BrainCircuit },
          ]} title="User Accounts" subtitle="Manage roles and access"><AdminUsersPage /></DashboardLayout></ProtectedRoute>} />
          <Route path="/admin/performance" element={<ProtectedRoute allowedRole="admin"><DashboardLayout role="admin" navItems={[
            { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
            { to: '/admin/users', label: 'User Accounts', icon: Users },
            { to: '/admin/performance', label: 'Performance', icon: BarChart3 },
            { to: '/admin/retrain', label: 'Retrain Model', icon: BrainCircuit },
          ]} title="System Performance" subtitle="Benchmark metrics and charts"><AdminPerformancePage /></DashboardLayout></ProtectedRoute>} />
          <Route path="/admin/retrain" element={<ProtectedRoute allowedRole="admin"><DashboardLayout role="admin" navItems={[
            { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
            { to: '/admin/users', label: 'User Accounts', icon: Users },
            { to: '/admin/performance', label: 'Performance', icon: BarChart3 },
            { to: '/admin/retrain', label: 'Retrain Model', icon: BrainCircuit },
          ]} title="Model Retraining" subtitle="Train and monitor the RBM-CNN model"><AdminRetrainPage /></DashboardLayout></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
