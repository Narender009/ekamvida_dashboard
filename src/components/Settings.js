// src/components/Settings.js
import React from "react";
import { Form, Input, Button } from "antd";

const Settings = () => {
  const onFinish = (values) => {
    console.log("Success:", values);
  };

  return (
    <Form layout="vertical" onFinish={onFinish}>
      <Form.Item label="Site Name" name="siteName" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="Email" name="email" rules={[{ required: true, type: "email" }]}>
        <Input />
      </Form.Item>
      <Button type="primary" htmlType="submit">
        Save
      </Button>
    </Form>
  );
};

export default Settings;
