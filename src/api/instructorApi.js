// src/api/instructorApi.js

import axios from 'axios';

const API_URL = 'http://localhost:5000/api/instructors'; // Replace with your API base URL if different

export const getInstructors = () => axios.get(API_URL);
export const getInstructor = (id) => axios.get(`${API_URL}/${id}`);
export const createInstructor = (data) => axios.post(API_URL, data);
export const updateInstructor = (id, data) => axios.put(`${API_URL}/${id}`, data);
export const deleteInstructor = (id) => axios.delete(`${API_URL}/${id}`);
