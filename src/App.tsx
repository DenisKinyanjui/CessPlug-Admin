import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AdminLayout from "./components/admin/AdminLayout";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";
import { AdminProvider } from "./contexts/AdminContext";

// Admin Pages
import AdminLogin from "./pages/admin/login";
import AdminDashboard from "./pages/admin/index";
import ProductsPage from "./pages/admin/products/index";
import CreateProductPage from "./pages/admin/products/create";
import ProductDetailPage from "./pages/admin/products/[id]";
import CategoriesPage from "./pages/admin/categories/index";
import CreateCategoryPage from "./pages/admin/categories/create";
import BrandsPage from "./pages/admin/brands/index";
import CreateBrandPage from "./pages/admin/brands/create";
import FlashDealsPage from "./pages/admin/flash-deals/index";
import CreateFlashDealPage from "./pages/admin/flash-deals/create";
import OrdersPage from "./pages/admin/orders/index";
import OrderDetailPage from "./pages/admin/orders/[id]";
import UsersPage from "./pages/admin/users/index";
import UserDetailPage from "./pages/admin/users/[id]";
import BannersPage from "./pages/admin/banners/index";
import CreateBannerPage from "./pages/admin/banners/create";
import ChamaManagement from "./pages/admin/chamas/index";
import CreateChama from "./pages/admin/chamas/create";
import ChamaDetailPage from "./pages/admin/chamas/[id]";
import EditChama from "./pages/admin/chamas/edit";
import ChamaMembersManagement from "./pages/admin/chamas/members";
import ChamaContributionsManagement from "./pages/admin/chamas/contributions";
import ChamaPayoutsManagement from "./pages/admin/chamas/payouts";
import AdminReviewsManagement from "./pages/admin/reviews/index";
import PayoutsManagement from "./pages/admin/payouts/PayoutsManagement";
import SettingsPage from "./pages/admin/settings";

function App() {
  return (
    <AdminProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/admin" replace />} />

          <Route path="/admin/login" element={<AdminLogin />} />

          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="/admin/products"
            element={
              <ProtectedAdminRoute>
                <AdminLayout>
                  <ProductsPage />
                </AdminLayout>
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="/admin/products/create"
            element={
              <ProtectedAdminRoute>
                <AdminLayout>
                  <CreateProductPage />
                </AdminLayout>
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="/admin/products/:id"
            element={
              <ProtectedAdminRoute>
                <AdminLayout>
                  <ProductDetailPage />
                </AdminLayout>
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="/admin/categories"
            element={
              <ProtectedAdminRoute>
                <AdminLayout>
                  <CategoriesPage />
                </AdminLayout>
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="/admin/categories/edit/:id"
            element={
              <ProtectedAdminRoute>
                <AdminLayout>
                  <CreateCategoryPage />
                </AdminLayout>
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="/admin/categories/create"
            element={
              <ProtectedAdminRoute>
                <AdminLayout>
                  <CreateCategoryPage />
                </AdminLayout>
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="/admin/brands"
            element={
              <ProtectedAdminRoute>
                <AdminLayout>
                  <BrandsPage />
                </AdminLayout>
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="/admin/brands/create"
            element={
              <ProtectedAdminRoute>
                <AdminLayout>
                  <CreateBrandPage />
                </AdminLayout>
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="/admin/flash-deals"
            element={
              <ProtectedAdminRoute>
                <AdminLayout>
                  <FlashDealsPage />
                </AdminLayout>
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="/admin/flash-deals/create"
            element={
              <ProtectedAdminRoute>
                <AdminLayout>
                  <CreateFlashDealPage />
                </AdminLayout>
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="/admin/orders"
            element={
              <ProtectedAdminRoute>
                <AdminLayout>
                  <OrdersPage />
                </AdminLayout>
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="/admin/orders/:id"
            element={
              <ProtectedAdminRoute>
                <AdminLayout>
                  <OrderDetailPage />
                </AdminLayout>
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedAdminRoute>
                <AdminLayout>
                  <UsersPage />
                </AdminLayout>
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="/admin/users/:id"
            element={
              <ProtectedAdminRoute>
                <AdminLayout>
                  <UserDetailPage />
                </AdminLayout>
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="/admin/banners"
            element={
              <ProtectedAdminRoute>
                <AdminLayout>
                  <BannersPage />
                </AdminLayout>
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="/admin/banners/create"
            element={
              <ProtectedAdminRoute>
                <AdminLayout>
                  <CreateBannerPage />
                </AdminLayout>
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="/admin/chamas"
            element={
              <ProtectedAdminRoute>
                <AdminLayout>
                  <ChamaManagement />
                </AdminLayout>
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="/admin/chamas/create"
            element={
              <ProtectedAdminRoute>
                <AdminLayout>
                  <CreateChama />
                </AdminLayout>
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="/admin/chamas/:id"
            element={
              <ProtectedAdminRoute>
                <AdminLayout>
                  <ChamaDetailPage />
                </AdminLayout>
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="/admin/chamas/:id/edit"
            element={
              <ProtectedAdminRoute>
                <AdminLayout>
                  <EditChama />
                </AdminLayout>
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="/admin/chamas/:id/members"
            element={
              <ProtectedAdminRoute>
                <AdminLayout>
                  <ChamaMembersManagement />
                </AdminLayout>
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="/admin/chamas/:id/contributions"
            element={
              <ProtectedAdminRoute>
                <AdminLayout>
                  <ChamaContributionsManagement />
                </AdminLayout>
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="/admin/chamas/:id/payouts"
            element={
              <ProtectedAdminRoute>
                <AdminLayout>
                  <ChamaPayoutsManagement />
                </AdminLayout>
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="/admin/payouts"
            element={
              <ProtectedAdminRoute>
                <AdminLayout>
                  <PayoutsManagement />
                </AdminLayout>
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="/admin/reviews"
            element={
              <ProtectedAdminRoute>
                <AdminLayout>
                  <AdminReviewsManagement />
                </AdminLayout>
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="/admin/settings"
            element={
              <ProtectedAdminRoute>
                <AdminLayout>
                  <SettingsPage />
                </AdminLayout>
              </ProtectedAdminRoute>
            }
          />

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Router>
    </AdminProvider>
  );
}

export default App;