import React, { useState } from 'react';
import { Layout, Menu, Button, Drawer } from 'antd';
import {
  BugOutlined,
  FireOutlined,
  FileTextOutlined,
  PlusOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import CaseDisplay from './components/CaseDisplay';
import CaseSubmitForm from './components/CaseSubmitForm';
import WhippingScene from './components/WhippingScene';
import Dashboard from './components/Dashboard';
import './style.css';

const { Header, Content, Sider } = Layout;

const App: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState('cases');
  const [submitDrawerVisible, setSubmitDrawerVisible] = useState(false);

  const handleMenuClick = (e: any) => {
    setActiveMenu(e.key);
  };

  const showSubmitDrawer = () => {
    // 不再检查登录状态，直接显示提交表单
    setSubmitDrawerVisible(true);
  };

  const closeSubmitDrawer = () => {
    setSubmitDrawerVisible(false);
  };

  const menuItems = [
    {
      key: 'cases',
      icon: <FileTextOutlined />,
      label: '错误案例库',
    },
    {
      key: 'practice',
      icon: <FireOutlined />,
      label: '练习鞭打',
    },
    {
      key: 'dashboard',
      icon: <BarChartOutlined />,
      label: '数据统计',
    },
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case 'cases':
        return <CaseDisplay />;
      case 'practice':
        return (
          <div className="app-content-fullscreen">
            <WhippingScene />
          </div>
        );
      case 'dashboard':
        return <Dashboard />;
      default:
        return <CaseDisplay />;
    }
  };

  return (
    <Layout className="app-layout">
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={false}
        className="app-sider"
      >
        <div className="app-logo">
          <BugOutlined />BugAI
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeMenu]}
          onClick={handleMenuClick}
          items={menuItems}
          className="app-menu"
        />
      </Sider>
      <Layout className="app-main-layout">
        <Header className="app-header">
          <div className="app-header-actions">
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={showSubmitDrawer}
              size="middle"
            >
              提交错误
            </Button>
            
            {/* 暂时隐藏所有登录相关的UI元素 */}
          </div>
        </Header>
        <Content className="app-content">
          {renderContent()}
        </Content>
      </Layout>
      
      {/* 提交错误抽屉 */}
      <Drawer
        title="提交AI错误案例"
        placement="right"
        onClose={closeSubmitDrawer}
        open={submitDrawerVisible}
        size="large"
        className="app-submit-drawer"
      >
        <CaseSubmitForm onSuccess={closeSubmitDrawer} />
      </Drawer>
    </Layout>
  );
};

export default App;