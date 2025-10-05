import { createRoot } from "react-dom/client";
import App from "./App";
import { ConfigProvider, message } from "antd";
import { NotifyProvider } from "./contexts/NotifycationContext";

message.config({
  top: 80,          // vị trí từ trên xuống
  duration: 5,      // tự ẩn sau 3s
  maxCount: 3,      // tối đa 3 message cùng lúc
});

createRoot(document.getElementById("root")!).render(
  <ConfigProvider>
    <NotifyProvider>
      <App />
    </NotifyProvider>
  </ConfigProvider>
);
