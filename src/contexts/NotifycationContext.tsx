import React, { createContext, useContext } from "react";
import { notification } from "antd";

type NotificationType = "success" | "info" | "warning" | "error";

type NotifyContextType = {
  notify: (type: NotificationType, message: string, description?: string) => void;
};

const NotifyContext = createContext<NotifyContextType | null>(null);

export const NotifyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [api, contextHolder] = notification.useNotification();

  const notify = (type: NotificationType, messageText: string, description?: string) => {
    api[type]({
      message: messageText,
      description,
      placement: "topRight",
    });
  };

  return (
    <NotifyContext.Provider value={{ notify }}>
      {contextHolder}
      {children}
    </NotifyContext.Provider>
  );
};

export const useNotify = () => {
  const context = useContext(NotifyContext);
  if (!context) {
    throw new Error("useNotify must be used within a NotifyProvider");
  }
  return context.notify;
};
