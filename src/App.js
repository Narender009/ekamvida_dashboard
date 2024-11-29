import React, { useEffect } from "react";
import { Layout, Menu, Input, Switch, Avatar, Tooltip, Typography, Dropdown, message } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  SearchOutlined,
  BulbOutlined,
  BulbFilled,
  LogoutOutlined,
} from "@ant-design/icons";
import Dashboard from "./components/Dashboard";
import Users from "./components/Users";
import Settings from "./components/Settings";
import ServiceForm from "./components/ServiceForm";
import InstructorDashboard from "./components/InstructorDashboard";
import ScheduleDashboard from "./components/ScheduleDashboard";
import TimeSlotDashboard from "./components/TimeSlotDashboard";
import LoginPage from "./components/LoginPage";
import ContactDashboard from "./components/ContactDashboard";
import EventDashboard from "./components/EventDashboard";
import PostDashboard from "./components/PostDashboard";
import BookingDashboard from "./components/BookingDashboard";
import CreateDashboard from "./components/CreateDashboard";
import Registration from "./components/Registration";

const { Header, Sider, Content } = Layout;

const App = () => {
  const [selectedMenu, setSelectedMenu] = React.useState("dashboard");
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const { SubMenu } = Menu;
  const [isAuthenticated, setIsAuthenticated] = React.useState(localStorage.getItem("isAuthenticated") === "true");

  useEffect(() => {
    // Retrieve last selected menu item
    const lastMenu = localStorage.getItem("selectedMenu");
    if (lastMenu) {
      setSelectedMenu(lastMenu);
    }
  }, []);

  const handleMenuSelect = ({ key }) => {
    setSelectedMenu(key);
    localStorage.setItem("selectedMenu", key);
  };

  const handleLogin = (status) => {
    setIsAuthenticated(status);
    localStorage.setItem("isAuthenticated", status);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
    message.info("You have been logged out.");
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  
  const renderContent = () => {
    switch (selectedMenu) {
      case "dashboard":
        return <Dashboard />;
      case "users":
        return <Users />;
      case "settings":
        return <Settings />;
      case "service":
        return <ServiceForm />;
      case "yoga-instructors":
        return <InstructorDashboard />;
      case "yoga-schedule":
        return <ScheduleDashboard />;
      case "Time-Slot":
        return <TimeSlotDashboard />;
      case "Contact":
        return <ContactDashboard />;
      case "Events":
        return <EventDashboard />;
      case "Post":
        return <PostDashboard />;
      case "BookingDashboard":
        return <BookingDashboard />;
      case "CreateDashboard":
        return <CreateDashboard />;
      case "Registration":
        return <Registration />;
      default:
        return <Dashboard />;
    }
  };

  const toggleTheme = (checked) => {
    setIsDarkMode(checked);
  };


  // const handleLogout = () => {
  //   setIsAuthenticated(false);
  //   message.info("You have been logged out.");
  // };

  const avatarMenu = (
    <Menu>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ background: isDarkMode ? "#1f1f1f" : "#f5f7fa", height: "100vh"}}>
      <Sider
        collapsible
        theme={isDarkMode ? "dark" : "light"}
        style={{
          background: isDarkMode ? "#2f3136" : "#ffffff",
          boxShadow: "2px 0 5px rgba(0, 0, 0, 0.1)",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div
          style={{
            color: isDarkMode ? "#fff" : "#000",
            textAlign: "center",
            padding: "16px",
            background: isDarkMode ? "#2f3136" : "#ffffff",
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          
        >
          <img src="logo192 copy.png" />
          {/* <img 
            src=""
            alt="Logo"
            style={{
              width: "40px",
              height: "40px",
              objectFit: "contain"
            }}
          /> */}
        </div>
        <div 
          className="flex flex-col h-full"
          style={{
            height: "calc(100vh - 70px)", // Accounts for the "Admin Panel" header
          }}
        >
          <style>
            {`
              .menu-container {
                height: 100%;
                overflow-y: auto;
                -ms-overflow-style: none;  /* IE and Edge */
                scrollbar-width: none;  /* Firefox */
              }
              
              .menu-container::-webkit-scrollbar {
                display: none;  /* Chrome, Safari and Opera */
              }

              /* Ensure submenus don't get cut off */
              .ant-menu-inline .ant-menu-sub {
                max-height: none !important;
              }
            `}
          </style>
          
          <div className="menu-container">
            <Menu
              theme={isDarkMode ? "dark" : "light"}
              mode="inline"
              selectedKeys={[selectedMenu]}
              onSelect={({key}) => setSelectedMenu(key)}
              style={{
                border: 'none',
                background: 'transparent'
              }}
            >
              <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
                Dashboard
              </Menu.Item>
              <SubMenu key="users" icon={<UserOutlined />} title="Users">
                <Menu.Item key="users">All Users</Menu.Item>
                {/* <Menu.Item key="add-user">Add User</Menu.Item>
                <Menu.Item key="user-roles">User Roles</Menu.Item> */}
              </SubMenu>
              <SubMenu key="yoga" icon={<UserOutlined />} title="Yoga Class">
                <Menu.Item key="service">Add Group Classes</Menu.Item>
                {/* <Menu.Item key="yoga-schedule">Schedule</Menu.Item> */}
                <Menu.Item key="yoga-instructors">Instructors</Menu.Item>
                <Menu.Item key="Time-Slot">TimeSlot</Menu.Item>
              </SubMenu>
              <SubMenu key="client" icon={<UserOutlined />} title="Schedule">
                <Menu.Item key="yoga-schedule"> Add Schedule</Menu.Item>
                <Menu.Item key="CreateDashboard">Schedule Booking</Menu.Item>
                {/* <Menu.Item key="client-history">Client History</Menu.Item> */}
              </SubMenu>
              <SubMenu key="booking" icon={<UserOutlined />} title="Booking">
                <Menu.Item key="BookingDashboard">All Bookings</Menu.Item>
                {/* <Menu.Item key="CreateDashboard">New Booking</Menu.Item> */}
                <Menu.Item key="">Booking History</Menu.Item>
              </SubMenu>
              <SubMenu key="client" icon={<UserOutlined />} title="Client">
                <Menu.Item key="">All Clients</Menu.Item>
                {/* <Menu.Item key="new-client">New Client</Menu.Item>
                <Menu.Item key="client-history">Client History</Menu.Item> */}
              </SubMenu>
              <SubMenu key="event" icon={<UserOutlined />} title="Event">
                <Menu.Item key="Events">Add Event</Menu.Item>
                <Menu.Item key="Registration">Registration</Menu.Item>
              </SubMenu>
              <SubMenu key="blog" icon={<UserOutlined />} title="Blog">
                <Menu.Item key="Post">Add Blog</Menu.Item>
              </SubMenu>
              <SubMenu key="contact" icon={<UserOutlined />} title="Contact">
                <Menu.Item key="Contact">All Contact</Menu.Item>
              </SubMenu>
              <Menu.Item key="settings" icon={<SettingOutlined />}>
                Settings
              </Menu.Item>
            </Menu>
          </div>
        </div>
      </Sider>
      <Layout style={{ marginLeft: 200 }}>
        <Header
          style={{
            position: "sticky",
            top: 0,
            background: isDarkMode ? "#333" : "#fff",
            padding: "0 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            zIndex: 2,
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <Input
              placeholder="Search"
              prefix={<SearchOutlined />}
              style={{
                width: 220,
                marginRight: 16,
                borderRadius: 20,
                padding: "6px 12px",
              }}
            />
            <Tooltip title="Toggle Dark/Bright Mode">
              <Switch
                checkedChildren={<BulbFilled />}
                unCheckedChildren={<BulbOutlined />}
                onChange={toggleTheme}
                checked={isDarkMode}
              />
            </Tooltip>
          </div>
          <Dropdown overlay={avatarMenu} placement="bottomRight" trigger={['click']}>
            <Avatar icon={<UserOutlined />} style={{ cursor: "pointer" }} />
          </Dropdown>
        </Header>
        <Content style={{ 
          margin: "24px 16px",
         
        
        }}>
          <div
            style={{
              padding: 24,
              background: isDarkMode ? "#292b2f" : "#ffffff",
              boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
              borderRadius: "8px",
            }}
          >
            <Typography.Title
              level={3}
              style={{ marginBottom: 16, color: isDarkMode ? "#ffffff" : "#000000" }}
            >
              Dashboard
            </Typography.Title>
            {renderContent()}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;