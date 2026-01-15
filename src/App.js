import { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import RawData from "./data/data.json";
import Presentation from "./components/presentation/presentation";
import Fnav from "./components/navbars/fristNavbar/fristNavbar";
import GustNavbar from "./components/navbars/gustNavbar/guestNabar";
import UserNavbar from "./components/navbars/userNavbar/userNavbar";
import Footer from "./components/footer/footer";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Checkout from "./pages/checkout/Checkout";
import OrderSuccess from "./pages/checkout/OrderSuccess";

import {
  Home,
  Error,
  LogIn,
  SignUp,
  Contact,
  About,
  Cart,
  Account,
} from "./pages/pages";

function App() {
  const [Data, setData] = useState(RawData);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Admin Routes - No header/footer */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Public Routes - With header/footer */}
          <Route
            path="/*"
            element={
              <>
                <Presentation />
                <Fnav />
                {Data.Access ? (
                  <UserNavbar Data={Data.Cart} />
                ) : (
                  <GustNavbar Data={Data.Cart} />
                )}
                <Routes>
                  <Route path="/" element={<Home Data={Data} SetData={setData} />} />
                  <Route path="/home" element={<Home Data={Data} SetData={setData} />} />
                  <Route
                    path="/contact"
                    element={<Contact Data={Data} SetData={setData} />}
                  />
                  <Route
                    path="/login"
                    element={
                      Data.Access ? (
                        <Account Data={Data} SetData={setData} />
                      ) : (
                        <LogIn Data={Data} SetData={setData} />
                      )
                    }
                  />
                  <Route
                    path="/signup"
                    element={
                      Data.Access ? (
                        <Account Data={Data} SetData={setData} />
                      ) : (
                        <SignUp Data={Data} SetData={setData} />
                      )
                    }
                  />
                  <Route
                    path="/account"
                    element={
                      Data.Access ? (
                        <Account Data={Data} SetData={setData} />
                      ) : (
                        <LogIn Data={Data} SetData={setData} />
                      )
                    }
                  />
                  <Route path="/cart" element={<Cart Data={Data} SetData={setData} />} />
                  <Route path="/checkout" element={<Checkout Data={Data} SetData={setData} />} />
                  <Route path="/order-success" element={<OrderSuccess />} />
                  <Route path="/about" element={<About Data={Data} />} />
                  <Route path="*" element={<Error />} />
                </Routes>
                <Footer />
              </>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
