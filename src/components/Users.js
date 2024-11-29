import React, { useState, useEffect } from 'react';
import { Table, Spin, Empty } from 'antd';
import axios from 'axios';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users');
        setUsers(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const columns = [
    {
      title: 'Name',
      key: 'name',
      render: ({ firstName, lastName }) => `${firstName} ${lastName}`,
    },
    { title: 'Email', dataIndex: 'email', key: 'email' },
  ];

  return (
    <div>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : users.length > 0 ? (
        <Table dataSource={users} columns={columns} rowKey="_id" />
      ) : (
        <Empty description="No users available" />
      )}
    </div>
  );
};

export default Users;
