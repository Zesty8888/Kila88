import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { StoreProvider } from '@/store'
import { ToastContainer } from '@/components/ui/toast'
import { UserLayout } from '@/components/layout/UserLayout'
import { HomePage } from '@/pages/user/HomePage'
import { SearchPage } from '@/pages/user/SearchPage'
import { ProductDetailPage } from '@/pages/user/ProductDetailPage'
import { CartPage } from '@/pages/user/CartPage'
import { ProfilePage } from '@/pages/user/ProfilePage'
import { LoginPage } from '@/pages/auth/LoginPage'

function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<UserLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          <Route path="/product/:id" element={<ProductDetailPage />} />
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </StoreProvider>
  )
}

export default App