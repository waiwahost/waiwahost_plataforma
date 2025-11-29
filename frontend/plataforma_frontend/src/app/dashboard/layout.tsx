import ProtectedRoute from '../../auth/ProtectedRoute';
import BaseLayout from '../../components/organisms/BaseLayout';

export default function DashboardLayout() {
  return (
    <ProtectedRoute>
      <BaseLayout />
    </ProtectedRoute>
  );
}
