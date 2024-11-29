import React, { useState, useEffect } from 'react';
import { AlertCircle, Edit, Trash2, Plus } from 'lucide-react';
// Instead of @/components/ui/alert
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

const ServiceForm = () => {
  const [services, setServices] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [showAlert, setShowAlert] = useState({ show: false, message: '', isError: false });
  const [formData, setFormData] = useState({
    service_name: '',
    description: '',
    image: '',
    what_to_expect: [''],
    benefits: [''],
    suitable_for: ['']
  });

  // Fetch services
  useEffect(() => {
    fetchServices();
  }, []);

    const fetchServices = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/services');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setServices(data);
      } catch (error) {
        console.error('Error fetching services:', error);
        showNotification('Error fetching services: ' + error.message, true);
      }
    };
    

  const showNotification = (message, isError = false) => {
    setShowAlert({ show: true, message, isError });
    setTimeout(() => setShowAlert({ show: false, message: '', isError: false }), 3000);
  };

  // Handle form input changes
  const handleInputChange = (e, field, index = null, arrayField = null) => {
    if (arrayField) {
      const newArray = [...formData[arrayField]];
      newArray[index] = e.target.value;
      setFormData({ ...formData, [arrayField]: newArray });
    } else {
      setFormData({ ...formData, [field]: e.target.value });
    }
  };

  // Add/remove array fields
  const handleArrayField = (action, field, index = null) => {
    const array = [...formData[field]];
    if (action === 'add') {
      array.push('');
    } else {
      array.splice(index, 1);
    }
    setFormData({ ...formData, [field]: array });
  };


  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  // Submit form
// Modify the handleSubmit function to use FormData
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('service_name', formData.service_name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('image', formData.image);
      
      // Convert arrays to string format that backend can parse
      formDataToSend.append('what_to_expect', JSON.stringify(formData.what_to_expect || []));
      formDataToSend.append('benefits', JSON.stringify(formData.benefits || []));
      formDataToSend.append('suitable_for', JSON.stringify(formData.suitable_for || []));

      const url = isEditing
        ? `http://localhost:5000/api/services/${currentService._id}`
        : 'http://localhost:5000/api/services';

      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        body: formDataToSend
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      showNotification(`Service ${isEditing ? 'updated' : 'created'} successfully`);
      fetchServices();
      resetForm();
    } catch (error) {
      console.error('Error:', error);
      showNotification(`Error ${isEditing ? 'updating' : 'creating'} service: ${error.message}`, true);
    }
  };


  // Delete service
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/services/${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          showNotification('Service deleted successfully');
          fetchServices();
        } else {
          throw new Error('Something went wrong');
        }
      } catch (error) {
        showNotification('Error deleting service', true);
      }
    }
  };

  // Edit service
  const handleEdit = (service) => {
    setIsEditing(true);
    setCurrentService(service);
    setFormData({
      service_name: service.service_name,
      description: service.description,
      image: service.image,
      what_to_expect: service.what_to_expect,
      benefits: service.benefits,
      suitable_for: service.suitable_for
    });
  };

  // Reset form
  const resetForm = () => {
    setIsEditing(false);
    setCurrentService(null);
    setFormData({
      service_name: '',
      description: '',
      image: '',
      what_to_expect: [''],
      benefits: [''],
      suitable_for: ['']
    });
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Yoga Services Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          {showAlert.show && (
            <Alert className={`mb-4 ${showAlert.isError ? 'bg-red-100' : 'bg-green-100'}`}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{showAlert.message}</AlertDescription>
            </Alert>
          )}

          <Dialog>
            <DialogTrigger className="mb-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" /> Add New Service
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{isEditing ? 'Edit Service' : 'Add New Service'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">Service Name</label>
                  <input
                    type="text"
                    value={formData.service_name}
                    onChange={(e) => handleInputChange(e, 'service_name')}
                    className="mt-1 block w-full rounded-md border p-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange(e, 'description')}
                    className="mt-1 block w-full rounded-md border p-2"
                    required
                  />
                </div>

                <div>
                <label className="block text-sm font-medium">Image</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="mt-1 block w-full rounded-md border p-2"
                  required
                />
              </div>

                {/* Dynamic array fields */}
                {['what_to_expect', 'benefits', 'suitable_for'].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium">
                      {field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </label>
                    {formData[field].map((item, index) => (
                      <div key={index} className="flex gap-2 mt-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleInputChange(e, null, index, field)}
                          className="flex-1 rounded-md border p-2"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => handleArrayField('remove', field, index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleArrayField('add', field)}
                      className="mt-2 text-sm text-blue-500 hover:text-blue-700"
                    >
                      + Add more
                    </button>
                  </div>
                ))}

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-md border px-4 py-2 text-sm"
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
                  >
                    {isEditing ? 'Update' : 'Create'} Service
                  </button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Card key={service._id}>
                <CardContent className="p-4">
                  <img
                    src={service.image}
                    alt={service.service_name}
                    className="mb-4 h-48 w-full object-cover rounded-md"
                  />
                  <h3 className="text-lg font-semibold">{service.service_name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{service.description}</p>
                  
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(service)}
                      className="p-2 text-blue-500 hover:text-blue-700"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(service._id)}
                      className="p-2 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceForm;