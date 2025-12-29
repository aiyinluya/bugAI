import React, { useState } from 'react';
import { Modal, Tabs } from 'antd';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const { TabPane } = Tabs;

interface AuthModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ visible, onCancel, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('login');

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const handleLoginSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
    onCancel();
  };

  const handleRegisterSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
    onCancel();
  };

  return (
    <Modal
      title=""
      visible={visible}
      onCancel={onCancel}
      footer={null}
      width={400}
      className="auth-modal"
    >
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        tabBarStyle={{ marginBottom: 24 }}
      >
        <TabPane tab="登录" key="login">
          <LoginForm
            onRegisterClick={() => setActiveTab('register')}
            onSuccess={handleLoginSuccess}
          />
        </TabPane>
        <TabPane tab="注册" key="register">
          <RegisterForm
            onLoginClick={() => setActiveTab('login')}
            onSuccess={handleRegisterSuccess}
          />
        </TabPane>
      </Tabs>
    </Modal>
  );
};

export default AuthModal;