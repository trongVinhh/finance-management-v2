// src/utils/notify.ts
import { message } from "antd";

export const notify = {
  success: (content: string) => {
    message.open({ type: "success", content });
  },
  error: (content: string) => {
    message.open({ type: "error", content });
  },
  warning: (content: string) => {
    message.open({ type: "warning", content });
  },
  info: (content: string) => {
    message.open({ type: "info", content });
  },
};
