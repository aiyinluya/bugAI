import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Space, Divider } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { useUserStore } from '../store/userStore';

const { Title, Text } = Typography;

interface RegisterFormProps {
  onLoginClick: () => void;
  onSuccess?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onLoginClick, onSuccess }) => {
  const [form] = Form.useForm();
  const { register, loading, error } = useUserStore();
  const [registerError, setRegisterError] = useState<string | null>(null);

  const handleSubmit = async (values: any) => {
    setRegisterError(null);
    try {
      await register(values);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setRegisterError(error || '注册失败，请检查信息是否正确');
    }
  };

  return (
    <Card className="register-form-card">
      <div className="register-form-header">
        <Title level={2}>注册 BugAI</Title>
        <Text type="secondary">创建账号，提交AI错误案例并鞭打它们</Text>
      </div>

      {registerError && (
        <div className="register-form-error">
          <Text type="danger">{registerError}</Text>
        </div>
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="username"
          label="用户名"
          rules={[
            { required: true, message: '请输入用户名' },
            { min: 3, max: 20, message: '用户名长度为3-20个字符' }
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="请输入用户名"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="email"
          label="邮箱"
          rules={[
            { required: true, message: '请输入邮箱地址' },
            { type: 'email', message: '请输入有效的邮箱地址' }
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="请输入邮箱"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="密码"
          rules={[
            { required: true, message: '请输入密码' },
            { min: 6, message: '密码长度不能少于6个字符' }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="请输入密码"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="确认密码"
          dependencies={['password']}
          rules={[
            { required: true, message: '请确认密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="请确认密码"
            size="large"
          />
        </Form.Item>

        <Form.Item className="register-form-actions">
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              style={{ width: '100%' }}
            >
              注册
            </Button>

            <Divider>或</Divider>

            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="default"
                size="large"
                onClick={onLoginClick}
                style={{ width: '100%' }}
              >
                已有账号？立即登录
              </Button>
            </Space>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default RegisterForm;