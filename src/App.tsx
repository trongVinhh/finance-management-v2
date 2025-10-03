import { ConfigProvider } from "antd";
import { AuthProvider } from "./contexts/AuthContext";
import AppRoutes from "./components/AppRoutes";
import './index.css'

function App() {
  return (
    <ConfigProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
