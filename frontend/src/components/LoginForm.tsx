import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Space, Divider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useUserStore } from '../store/userStore';

const { Title, Text } = Typography;

interface LoginFormProps {
  onRegisterClick: () => void;
  onSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onRegisterClick, onSuccess }) => {
  const [form] = Form.useForm();
  const { login, loading, error } = useUserStore();
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleSubmit = async (values: any) => {
    setLoginError(null);
    try {
      await login(values);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setLoginError(error || '登录失败，请检查邮箱和密码');
    }
  };

  return (
    <Card className="login-form-card">
      <div className="login-form-header">
        <Title level={2}>登录 BugAI</Title>
        <Text type="secondary">登录后可以提交错误案例和鞭打AI</Text>
      </div>

      {loginError && (
        <div className="login-form-error">
          <Text type="danger">{loginError}</Text>
        </div>
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ remember: true }}
      >
        <Form.Item
          name="email"
          label="邮箱"
          rules={[
            { required: true, message: '请输入邮箱地址' },
            { type: 'email', message: '请输入有效的邮箱地址' }
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="请输入邮箱"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="密码"
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="请输入密码"
            size="large"
          />
        </Form.Item>

        <Form.Item className="login-form-actions">
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              style={{ width: '100%' }}
            >
              登录
            </Button>

            <Divider>或</Divider>

            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="default"
                size="large"
                onClick={onRegisterClick}
                style={{ width: '100%' }}
              >
                创建新账号
              </Button>
            </Space>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default LoginForm;