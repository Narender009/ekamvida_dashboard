// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Card, Statistic, Row, Col, Table, Tag, Typography, List, message } from 'antd';
import { UserOutlined, CalendarOutlined, CheckCircleOutlined,CloseCircleOutlined } from '@ant-design/icons';

const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookClasses, setBookClasses] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    approved: 0
  });

  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState(null);


      // Helper function to safely parse JSON response
      const parseResponse = async (response) => {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return await response.json();
        }
        // If response is not JSON, throw error with text
        throw new Error(await response.text());
      };
  
    useEffect(() => {
      
      fetchServices();
    }, []);
  
  
    const fetchServices = async () => {
      setServicesLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/services');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await parseResponse(response);
        setServices(data);
      } catch (err) {
        setServicesError('Failed to load services');
        console.error('Error fetching services:', err);
      } finally {
        setServicesLoading(false);
      }
    };


    const getServiceName = (serviceId) => {
      const service = services.find(s => s._id === serviceId);
      return service ? service.service_name : 'Unknown Service';
    };
  
 


  


  // Fetch all bookings
  const fetchData = async () => {
    try {
      const [bookingsResponse, bookClassesResponse] = await Promise.all([
        fetch('http://localhost:5000/api/bookings'),
        fetch('http://localhost:5000/api/book-class')
      ]);

      const bookingsData = await bookingsResponse.json();
      const bookClassesData = await bookClassesResponse.json();

      // Combine and normalize data
      const combinedBookings = [
        ...bookingsData.map(booking => ({
          ...booking,
          type: 'booking',
          clientName: booking.client_name,
          clientEmail: booking.client_email,
          clientPhone: booking.client_phone,
          serviceName: booking.service?.service_name || 'No Service'
        })),
        ...bookClassesData.map(bookClass => ({
          ...bookClass,
          type: 'book-class',
          clientName: bookClass.clientDetails?.name,
          clientEmail: bookClass.clientDetails?.email,
          clientPhone: bookClass.clientDetails?.phone,
          serviceName: bookClass.schedule?.service?.service_name || 'No Service'
        }))
      ];

      setBookings(combinedBookings);
      setBookClasses(bookClassesData);
      
      // Calculate combined statistics
      const statistics = combinedBookings.reduce((acc, booking) => {
        acc.total++;
        acc[booking.status || 'pending']++;
        return acc;
      }, {
        total: 0,
        pending: 0,
        complete: 0,
        approve: 0,
        decline: 0
      });
      
      setStats(statistics);
      setLoading(false);
    } catch (error) {
      message.error('Failed to fetch bookings and classes');
      setLoading(false);
    }
  };

  // Update booking status
  const handleStatusUpdate = async (id, status, type) => {
    const endpoint = type === 'booking' 
      ? `http://localhost:5000/api/bookings/${id}/status`
      : `http://localhost:5000/api/book-class/${id}/status`;

    try {
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (response.ok) {
        message.success('Status updated successfully');
        fetchData(); // Refresh all data
      } else {
        message.error('Failed to update status');
      }
    } catch (error) {
      message.error('Error updating status');
    }
  };

  useEffect(() => {
    fetchData();
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchData, 30000); // Poll every 30 seconds
    
    return () => clearInterval(interval);
  }, []);


  const columns = [
    {
      title: "Name",
      dataIndex: "clientName",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "clientEmail",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "clientPhone",
      key: "phone",
    },
    {
      title: "Service",
      dataIndex: "serviceName",
      key: "service",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) => {
        const colorMap = {
          pending: 'orange',
          complete: 'blue',
          approve: 'green',
          decline: 'red'
        };
        
        return (
          <div className="flex items-center gap-2">
            <Tag color={colorMap[status]}>{status}</Tag>
            {status === 'pending' && (
              <>
                <button
                  onClick={() => handleStatusUpdate(record._id, 'approve', record.type)}
                  className="p-1 text-green-600 hover:text-green-800"
                >
                  <CheckCircleOutlined />
                </button>
                <button
                  onClick={() => handleStatusUpdate(record._id, 'decline', record.type)}
                  className="p-1 text-red-600 hover:text-red-800"
                >
                  <CloseCircleOutlined />
                </button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  const recentBookings = bookings.slice(0, 5).map(booking => ({
    name: booking.name,
    activity: `Booked ${booking.service?.service_name || 'Service'} - ${booking.status}`
  }));


  return (
    <>
    <Row gutter={[16, 16]}>
      {/* Active Users Card */}
      <Col span={6}>
        <Card 
          bordered={false}
          className="hover:scale-105 transition-transform duration-300"
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.2)',
          }}
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-white text-sm mb-2 opacity-90">Total Bookings</h3>
              <Statistic 
                value={stats.total} 
                loading={loading}
                valueStyle={{ 
                  color: '#ffffff',
                  fontSize: '28px',
                  fontWeight: '600'
                }}
              />
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20">
              <UserOutlined style={{ fontSize: '24px', color: '#ffffff' }} />
            </div>
          </div>
        </Card>
      </Col>

      {/* Events Registered Card */}
      <Col span={6}>
        <Card 
          bordered={false}
          className="hover:scale-105 transition-transform duration-300"
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.2)',
          }}
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-white text-sm mb-2 opacity-90">Pending</h3>
              <Statistic 
                value={stats.pending} 
                loading={loading}
                valueStyle={{ 
                  color: '#ffffff',
                  fontSize: '28px',
                  fontWeight: '600'
                }}
              />
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20">
              <CalendarOutlined style={{ fontSize: '24px', color: '#ffffff' }} />
            </div>
          </div>
        </Card>
      </Col>

      {/* Tasks Completed Card */}
      <Col span={6}>
        <Card 
          bordered={false}
          className="hover:scale-105 transition-transform duration-300"
          style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(245, 158, 11, 0.2)',
          }}
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-white text-sm mb-2 opacity-90">Completed</h3>
              <Statistic 
                value={stats.complete}
                loading={loading} 
                valueStyle={{ 
                  color: '#ffffff',
                  fontSize: '28px',
                  fontWeight: '600'
                }}
              />
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20">
              <CheckCircleOutlined style={{ fontSize: '24px', color: '#ffffff' }} />
            </div>
          </div>
        </Card>
      </Col>


            {/* Tasks Completed Card */}
            <Col span={6}>
        <Card 
          bordered={false}
          className="hover:scale-105 transition-transform duration-300"
          style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(245, 158, 11, 0.2)',
          }}
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-white text-sm mb-2 opacity-90">Approved</h3>
              <Statistic 
                value={stats.approve}
                loading={loading} 
                valueStyle={{ 
                  color: '#ffffff',
                  fontSize: '28px',
                  fontWeight: '600'
                }}
              />
            </div>
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20">
              <CheckCircleOutlined style={{ fontSize: '24px', color: '#ffffff' }} />
            </div>
          </div>
        </Card>
      </Col>
    </Row>


    

      <Row gutter={16} style={{ marginTop: 24 }}>
      <Col span={16} >
        <Card 
          title="Booking Details"
          bodyStyle={{ padding: 0 }}
        >
          <style>
            {`
              .hide-scrollbar .ant-table-body {
                overflow-y: auto !important;
                -ms-overflow-style: none !important;
                scrollbar-width: none !important;
              }
              
              .hide-scrollbar .ant-table-body::-webkit-scrollbar {
                display: none !important;
              }
              
              /* Optional: Hide scrollbar for the whole table wrapper */
              .table-wrapper {
                overflow: hidden !important;
              }
              
              /* Ensure header alignment stays correct */
              .ant-table-header {
                margin-right: 0 !important;
                padding-right: 0 !important;
              }
              
              /* Remove bottom padding from header row */
              .ant-table-header table {
                margin-bottom: 0 !important;
              }
            `}
          </style>
          
          <div className="table-wrapper">
            <Table
              columns={columns}
              dataSource={bookings}
              loading={loading}
              rowKey="_id"
              pagination={{ 
                pageSize: 4,
                style: { 
                  margin: '16px 20px'
                }
              }}
              scroll={{ 
                y: 240,
                scrollToFirstRowOnChange: true 
              }}
              bordered
              className="hide-scrollbar"
              style={{
                borderRadius: 0
              }}
            />
          </div>
        </Card>
      </Col>

      <Col span={8}>
        <Card title="Recent Bookings">
          <List
              loading={loading}
              itemLayout="horizontal"
              dataSource={recentBookings}
            renderItem={(booking) => (
              <List.Item>
                <List.Item.Meta
                  title={<Typography.Text>{booking.name}</Typography.Text>}
                  description={booking.activity}
                />
              </List.Item>
            )}
          />
        </Card>
      </Col>
    </Row>
    </>
  );
};

export default Dashboard;
