import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, Clock, Phone, Mail, Edit, Trash2, Download, Printer } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/inputs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/react-select";

const BookingDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState(null);

  const statusOptions = [
    'pending',
    'approve',
    'complete',
    'decline'
  ];

  const downloadBookings = (bookingsToDownload = filteredBookings) => {
    // Prepare CSV header
    const headers = [
      'Client Name', 
      'Client Email', 
      'Client Phone', 
      'Date', 
      'Time', 
      'Status', 
      'Service'
    ];

    // Convert bookings to CSV rows
    const csvRows = bookingsToDownload.map(booking => [
      booking.client_name,
      booking.client_email,
      booking.client_phone,
      new Date(booking.date).toLocaleDateString(),
      booking.time,
      booking.status,
      booking.service.service_name
    ]);

    // Create CSV string
    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.map(value => 
        `"${value.toString().replace(/"/g, '""')}"`
      ).join(','))
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bookings_${filter}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // New function to print bookings
  const printBookings = (bookingsToPrint = filteredBookings) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Bookings - ${filter} - ${new Date().toLocaleDateString()}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 20px; 
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left; 
            }
            th { 
              background-color: #f2f2f2; 
              font-weight: bold; 
            }
            .status { 
              font-weight: bold; 
              text-transform: capitalize; 
            }
            .pending { color: orange; }
            .approve { color: blue; }
            .complete { color: green; }
            .decline { color: red; }
          </style>
        </head>
        <body>
          <h1>Bookings (${filter})</h1>
          <p>Generated: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Service</th>
              </tr>
            </thead>
            <tbody>
              ${bookingsToPrint.map(booking => `
                <tr>
                  <td>${booking.client_name}</td>
                  <td>${booking.client_email}</td>
                  <td>${booking.client_phone}</td>
                  <td>${new Date(booking.date).toLocaleDateString()}</td>
                  <td>${booking.time}</td>
                  <td>
                    <span class="status ${booking.status}">${booking.status}</span>
                  </td>
                  <td>${booking.service.service_name}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };


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
    fetchBookings();
    fetchServices();
  }, []);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter(booking => booking.status === filter));
    }
  }, [filter, bookings]);

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

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/bookings');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await parseResponse(response);
      setBookings(data);
      setFilteredBookings(data);
    } catch (err) {
      setError('Failed to load bookings');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (id, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        const errorData = await parseResponse(response);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      await parseResponse(response);
      await fetchBookings();
    } catch (err) {
      setError('Failed to update booking status');
      console.error('Error updating status:', err);
    }
  };

  const handleEditClick = (booking) => {
    setEditingBooking({
      ...booking,
      date: new Date(booking.date).toISOString().split('T')[0],
      service: booking.service._id || booking.service
    });
    setIsEditDialogOpen(true);
  };


  // Function to update a booking in the state after editing
  const handleEditBookingUpdate = (updatedBooking) => {
    setBookings((prevBookings) =>
      prevBookings.map((booking) =>
        booking._id === updatedBooking._id ? updatedBooking : booking
      )
    );
    setFilteredBookings((prevFilteredBookings) =>
      prevFilteredBookings.map((booking) =>
        booking._id === updatedBooking._id ? updatedBooking : booking
      )
    );
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const submissionData = {
        client_name: editingBooking.client_name,
        client_email: editingBooking.client_email,
        client_phone: editingBooking.client_phone,
        date: editingBooking.date,
        time: editingBooking.time,
        status: editingBooking.status,
        service: typeof editingBooking.service === 'object' ? editingBooking.service._id : editingBooking.service,
      };

      const response = await fetch(`http://localhost:5000/api/bookings/${editingBooking._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await parseResponse(response);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const updatedBooking = await parseResponse(response); // Ensure response is valid JSON

      // Update the booking in the state
      handleEditBookingUpdate(updatedBooking);

      setIsEditDialogOpen(false);
      setEditingBooking(null);
    } catch (err) {
      console.error('Update booking error:', err);
      setError(err.message || 'Failed to update booking. Please try again.');
    }
  };
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingBooking(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setEditingBooking(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await parseResponse(response);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      setDeleteConfirmId(null);
      await fetchBookings();
    } catch (err) {
      setError('Failed to delete booking');
      console.error('Error deleting booking:', err);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-200 text-yellow-800',
      complete: 'bg-green-200 text-green-800',
      approve: 'bg-blue-200 text-blue-800',
      decline: 'bg-red-200 text-red-800'
    };
    return colors[status] || 'bg-gray-200 text-gray-800';
  };

  const getServiceName = (serviceId) => {
    const service = services.find(s => s._id === serviceId);
    return service ? service.service_name : 'Unknown Service';
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-lg">Loading bookings...</p>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-lg text-red-600">{error}</p>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Booking Dashboard</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => downloadBookings()}
            >
              <Download className="mr-2 h-4 w-4" /> Download CSV
            </Button>
            <Button 
              variant="outline" 
              onClick={() => printBookings()}
            >
              <Printer className="mr-2 h-4 w-4" /> Print Bookings
            </Button>
          </div>
        </div>
        
        {/* Filter Controls */}
        {/* Filter Controls with Download/Print for Each Status */}
        <div className="flex gap-2 mb-6">
          {['all', 'pending', 'approve', 'complete', 'decline'].map((status) => (
            <div key={status} className="flex items-center gap-2">
              <button
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg capitalize ${
                  filter === status 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
              <div className="flex gap-1">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => downloadBookings(
                    status === 'all' 
                      ? bookings 
                      : bookings.filter(b => b.status === status)
                  )}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => printBookings(
                    status === 'all' 
                      ? bookings 
                      : bookings.filter(b => b.status === status)
                  )}
                >
                  <Printer className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Bookings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBookings.map((booking) => (
            <Card key={booking._id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="flex justify-between items-center">
                  <span className="font-bold">{booking.client_name}</span>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                    <button
                      onClick={() => handleEditClick(booking)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(booking._id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(booking.date).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{booking.time}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{booking.client_phone}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{booking.client_email}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-medium">Service:</span>
                    <span>{booking.service.service_name}</span>
                  </div>
                  
                  {/* Status Update Buttons */}
                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    {['approve', 'decline', 'complete'].map((status) => (
                      <button
                        key={status}
                        onClick={() => updateBookingStatus(booking._id, status)}
                        className={`px-3 py-1 rounded-md capitalize text-sm
                          ${booking.status === status 
                            ? 'bg-gray-200 cursor-not-allowed' 
                            : 'bg-blue-100 hover:bg-blue-200'
                          }`}
                        disabled={booking.status === status}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>

              {/* Delete Confirmation Dialog */}
              {deleteConfirmId === booking._id && (
                <Dialog open={true} onOpenChange={() => setDeleteConfirmId(null)}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Deletion</DialogTitle>
                    </DialogHeader>
                    <p>Are you sure you want to delete this booking?</p>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={() => handleDelete(booking._id)}>
                        Delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Edit Booking Dialog */}
      {editingBooking && (
        <Dialog 
          open={isEditDialogOpen} 
          onOpenChange={(open) => {
            if (!open) {
              setEditingBooking(null);
              setError(null);
            }
            setIsEditDialogOpen(open);
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Booking</DialogTitle>
            </DialogHeader>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="client_name">Name</Label>
                <Input
                  id="client_name"
                  name="client_name"
                  value={editingBooking.client_name || ''}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_email">Email</Label>
                <Input
                  id="client_email"
                  name="client_email"
                  type="email"
                  value={editingBooking.client_email || ''}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_phone">Phone</Label>
                <Input
                  id="client_phone"
                  name="client_phone"
                  value={editingBooking.client_phone || ''}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={editingBooking.date || ''}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  name="time"
                  value={editingBooking.time || ''}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={editingBooking.status}
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="service">Service</Label>
                <Select
                  value={typeof editingBooking.service === 'object' ? 
                    editingBooking.service._id : editingBooking.service}
                  onValueChange={(value) => handleSelectChange('service', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {servicesLoading ? (
                      <SelectItem value="" disabled>Loading services...</SelectItem>
                    ) : servicesError ? (
                      <SelectItem value="" disabled>Error loading services</SelectItem>
                    ) : (
                      services.map((service) => (
                        <SelectItem key={service._id} value={service._id}>
                          {service.service_name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingBooking(null);
                    setError(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default BookingDashboard;