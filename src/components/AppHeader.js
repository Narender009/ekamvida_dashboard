import { Layout, Button, Menu, Dropdown, message } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Header } = Layout;

export const AppHeader = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Clear axios default header
    delete axios.defaults.headers.common['Authorization'];

    // Show success message
    message.success('Logged out successfully');

    // Redirect to login
    navigate('/login');
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div className="logo" />
      <Dropdown overlay={userMenu} trigger={['click']}>
        <Button icon={<UserOutlined />} type="text" style={{ color: 'white' }}>
          {JSON.parse(localStorage.getItem('user'))?.username || 'User'}
        </Button>
      </Dropdown>
    </Header>
  );
};