// src/components/ui/input.js

import React from 'react';

export const Input = ({ type = 'text', value, onChange, placeholder, ...props }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="border border-gray-300 rounded px-3 py-2"
    {...props}
  />
);
