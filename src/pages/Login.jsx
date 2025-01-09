import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../authStore.js";
import { Button, Form, Input, Typography, Row, Col, message } from "antd";

const { Title } = Typography;

const Login = () => {
  const [code, setCode] = useState(["", "", "", ""]);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const { error, isLoading, login } = useAuthStore();

  const handleChange = (index, value) => {
    const newCode = [...code];

    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) {
        newCode[i] = pastedCode[i] || "";
      }
      setCode(newCode);

      const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "");
      const focusIndex = lastFilledIndex < 3 ? lastFilledIndex + 1 : 3;
      inputRefs.current[focusIndex].focus();
    } else {
      newCode[index] = value;
      setCode(newCode);

      if (value && index < 3) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async () => {
    const verificationCode = code.join("");
    try {
      await login(verificationCode);
      navigate("/");
      message.success("Login successful");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (code.every((digit) => digit !== "")) {
      handleSubmit();
    }
  }, [code]);

  return (
    <Row
      justify="center"
      align="middle"
      style={{ minHeight: "100vh", background: "#f5f5f5" }}
    >
      <Col xs={18} sm={18} md={12} lg={8}>
        <div
          style={{ padding: "24px", background: "#fff", borderRadius: "8px" }}
        >
          <Title
            level={3}
            style={{ textAlign: "center", marginBottom: "16px" }}
          >
            Login
          </Title>
          <Form layout="vertical" onFinish={handleSubmit}>
            <div
              style={{ display: "flex", justifyContent: "center", gap: "8px" }}
            >
              {code.map((digit, index) => (
                <Input
                  key={index}
                  type="number"
                  controls={false}
                  ref={(el) => (inputRefs.current[index] = el)}
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  style={{
                    width: "48px",
                    height: "48px",
                    textAlign: "center",
                    fontSize: "18px",
                  }}
                />
              ))}
            </div>
            {error && (
              <div
                style={{
                  color: "#ff4d4f",
                  marginTop: "8px",
                  textAlign: "center",
                }}
              >
                {error}
              </div>
            )}
            <Form.Item style={{ marginTop: "24px" }}>
              <Button
                type="primary"
                block
                htmlType="submit"
                loading={isLoading}
                className=" bg-primary/10 shadow-none text-primary"
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Col>
    </Row>
  );
};

export default Login;
