import { useState } from "react";
import { Form, Input, Button, Typography, Card, message } from "antd";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const { Title, Text, Link } = Typography;

const Login = () => {
  const { login, signup, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");

  // 👇 tạo context cho message
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async (values: { email: string; password?: string }) => {
    setLoading(true);
    try {
      if (mode === "login") {
        await login(values.email, values.password!);
        messageApi.success("Đăng nhập thành công!");
        navigate("/");
      } else if (mode === "signup") {
        await signup(values.email, values.password!);
        messageApi.success("Tạo tài khoản thành công! Hãy đăng nhập.");
        setMode("login");
      } else if (mode === "reset") {
        await resetPassword(values.email);
        messageApi.success("Email khôi phục mật khẩu đã được gửi!");
        setMode("login");
      }
    } catch (err: any) {
      messageApi.error(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: "16px",
        background: "#f5f5f5",
      }}
    >
      {/* 👇 phải render contextHolder */}
      {contextHolder}

      <Card style={{ width: "100%", maxWidth: 400 }}>
        <Title level={3} style={{ textAlign: "center", marginBottom: 24 }}>
          {mode === "login"
            ? "Đăng nhập"
            : mode === "signup"
            ? "Đăng ký"
            : "Quên mật khẩu"}
        </Title>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="email"
            rules={[{ required: true, message: "Nhập email!" }]}
          >
            <Input placeholder="Email" size="large" />
          </Form.Item>

          {mode !== "reset" && (
            <Form.Item
              name="password"
              rules={[{ required: true, message: "Nhập mật khẩu!" }]}
            >
              <Input.Password placeholder="Mật khẩu" size="large" />
            </Form.Item>
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
            >
              {mode === "login"
                ? "Đăng nhập"
                : mode === "signup"
                ? "Đăng ký"
                : "Gửi email khôi phục"}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: "center" }}>
          {mode === "login" && (
            <>
              <Text>
                Chưa có tài khoản?{" "}
                <Link onClick={() => setMode("signup")}>Đăng ký</Link>
              </Text>
              <br />
              <Link onClick={() => setMode("reset")}>Quên mật khẩu?</Link>
            </>
          )}
          {mode === "signup" && (
            <Text>
              Đã có tài khoản?{" "}
              <Link onClick={() => setMode("login")}>Đăng nhập</Link>
            </Text>
          )}
          {mode === "reset" && (
            <Text>
              Quay lại{" "}
              <Link onClick={() => setMode("login")}>Đăng nhập</Link>
            </Text>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Login;
