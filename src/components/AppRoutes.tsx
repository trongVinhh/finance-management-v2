import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import AppLayout from "./AppLayout";
import ProtectedRoute from "./ProtectedRoute";
import Debts from "../pages/Debt";
import PersonalAccount from "../pages/PersonalAccount";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PersonalAccount />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/personal-accounts"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PersonalAccount />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/debts"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Debts />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
