import React, { useState, useEffect } from 'react';
import { PlusCircle, Pencil, Trash2, X } from 'lucide-react';
import { Alert, AlertDescription } from "./ui/alert";
import { Card, CardHeader, CardTitle, CardContent } from './ui/react-card'
// In your Dashboard.jsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";  // Adjust the path based on your file structure

const API_BASE_URL = 'http://localhost:5000';

const InstructorDashboard = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentInstructor, setCurrentInstructor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    experienceLevel: 'Intermediate',
    specialties: '',
    contactEmail: '',
    contactPhone: '',
    photo: null
  });
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/instructors');
      if (!response.ok) throw new Error('Failed to fetch instructors');
      const data = await response.json();
      setInstructors(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'specialties') {
      setFormData(prev => ({
        ...prev,
        [name]: value.split(',').map(item => item.trim())
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      photo: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    
    Object.keys(formData).forEach(key => {
      if (key === 'specialties') {
        formDataToSend.append(key, JSON.stringify(formData[key]));
      } else if (key === 'photo' && formData[key]) {
        formDataToSend.append(key, formData[key]);
      } else {
        formDataToSend.append(key, formData[key]);
      }
    });

    try {
      const url = currentInstructor
        ? `http://localhost:5000/api/instructors/${currentInstructor._id}`
        : 'http://localhost:5000/api/instructors';
      
      const method = currentInstructor ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        body: formDataToSend
      });

      if (!response.ok) throw new Error('Failed to save instructor');
      
      fetchInstructors();
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this instructor?')) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/instructors/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete instructor');
      
      fetchInstructors();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (instructor) => {
    setCurrentInstructor(instructor);
    setFormData({
      name: instructor.name,
      bio: instructor.bio,
      experienceLevel: instructor.experienceLevel,
      specialties: instructor.specialties.join(', '),
      contactEmail: instructor.contactEmail,
      contactPhone: instructor.contactPhone || '',
      photo: null
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      bio: '',
      experienceLevel: 'Intermediate',
      specialties: '',
      contactEmail: '',
      contactPhone: '',
      photo: null
    });
    
    setCurrentInstructor(null);
  };

  const getImageUrl = (photoPath) => {
    if (!photoPath) return '/api/placeholder/400/300';
    return photoPath.startsWith('http') ? photoPath : `${API_BASE_URL}${photoPath}`;
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Instructor Management</h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <button 
              onClick={resetForm}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              <PlusCircle className="w-4 h-4" />
              Add Instructor
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {currentInstructor ? 'Edit Instructor' : 'Add New Instructor'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  rows="3"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Experience Level</label>
                <select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Specialties (comma-separated)</label>
                <input
                  type="text"
                  name="specialties"
                  value={formData.specialties}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full p-2 border rounded"
                />
                {(previewUrl || currentInstructor?.photo) && (
                  <div className="mt-2 relative w-full h-48">
                    <img
                      src={previewUrl || getImageUrl(currentInstructor.photo)}
                      alt="Preview"
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  {currentInstructor ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {instructors.map((instructor) => (
          <Card key={instructor._id} className="overflow-hidden">
            <CardHeader className="relative">
              <img
                src={getImageUrl(instructor.photo)}
                alt={instructor.name}
                className="w-full h-48 object-cover"
              />
              <CardTitle className="mt-2">{instructor.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-2">{instructor.bio}</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {instructor.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
              <div className="text-sm text-gray-600">
                <p>Experience: {instructor.experienceLevel}</p>
                <p>Email: {instructor.contactEmail}</p>
                {instructor.contactPhone && <p>Phone: {instructor.contactPhone}</p>}
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => handleEdit(instructor)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(instructor._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default InstructorDashboard;