
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Accounts from "../pages/Account";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import Settings from "../pages/Setting";
import Transactions from "../pages/Transaction";
import AppLayout from "./AppLayout";
import ProtectedRoute from "./ProtectedRoute";
import Category from "../pages/Category";
import Income from "../pages/Income";
import Expense from "../pages/Expense";
import Debts from "../pages/Debt";
import Loans from "../pages/Loans";
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
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Transactions />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/accounts"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Accounts />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Category />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/income"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Income />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/expense"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Expense />
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

        <Route
          path="/loans"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Loans />
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
          path="/settings"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Settings />
              </AppLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
