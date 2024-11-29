import React, { useState, useEffect } from 'react';
import { Search, Calendar, Clock, Users, Filter, ChevronDown, Trash2, CheckCircle, XCircle, Edit, Eye, Download, Printer } from 'lucide-react';
import BookingModal from './BookingModal';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const BookingDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('all');

    // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/book-class');
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (booking) => {
    setSelectedBooking(booking);
    setEditFormData({
      clientDetails: { ...booking.clientDetails },
      schedule: { ...booking.schedule }
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/book-class/${selectedBooking._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) throw new Error('Failed to update booking');

      const updatedBooking = await response.json();
      setBookings(bookings.map(booking => 
        booking._id === selectedBooking._id ? updatedBooking.booking : booking
      ));
      setIsEditModalOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/book-class/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to update booking status');

      const updatedBooking = await response.json();
      setBookings(bookings.map(booking => 
        booking._id === id ? updatedBooking.booking : booking
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  const renderStatusBadge = (status) => {
    const statusColors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'approve': 'bg-green-100 text-green-800',
      'decline': 'bg-red-100 text-red-800',
      'complete': 'bg-blue-100 text-blue-800'
    };
  
    // If status is undefined or null, return a default badge
    if (!status) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          pending
        </span>
      );
    }
  
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };


  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setIsDetailsModalOpen(true);
  };

  const handleInputChange = (e, section, field) => {
    setEditFormData({
      ...editFormData,
      [section]: {
        ...editFormData[section],
        [field]: e.target.value
      }
    });
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/book-class/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete booking');
      
      setBookings(bookings.filter(booking => booking._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.clientDetails.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.clientDetails.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterDate === 'all') return matchesSearch;
    
    const today = new Date();
    const bookingDate = new Date(booking.schedule.date);
    
    switch (filterDate) {
      case 'today':
        return matchesSearch && 
          bookingDate.toDateString() === today.toDateString();
      case 'upcoming':
        return matchesSearch && bookingDate > today;
      case 'past':
        return matchesSearch && bookingDate < today;
      default:
        return matchesSearch;
    }
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            Loading bookings...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-red-500">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }


  const renderEditModal = () => (
    <BookingModal
      isOpen={isEditModalOpen}
      onClose={() => setIsEditModalOpen(false)}
      title="Edit Booking"
    >
      <form onSubmit={handleUpdate} className="space-y-4">
        <div className="space-y-4">
          <h3 className="font-medium">Client Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={editFormData?.clientDetails.name || ''}
                onChange={(e) => handleInputChange(e, 'clientDetails', 'name')}
                className="mt-1 block w-full rounded-md border p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={editFormData?.clientDetails.email || ''}
                onChange={(e) => handleInputChange(e, 'clientDetails', 'email')}
                className="mt-1 block w-full rounded-md border p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                value={editFormData?.clientDetails.phone || ''}
                onChange={(e) => handleInputChange(e, 'clientDetails', 'phone')}
                className="mt-1 block w-full rounded-md border p-2"
                required
              />
            </div>
            <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={editFormData?.status || 'pending'}
              onChange={(e) => setEditFormData(prev => ({
                ...prev,
                status: e.target.value
              }))}
              className="mt-1 block w-full rounded-md border p-2"
            >
              <option value="pending">Pending</option>
              <option value="approve">Approve</option>
              <option value="decline">Decline</option>
              <option value="complete">Complete</option>
            </select>
          </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Schedule Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                value={editFormData?.schedule.date.split('T')[0] || ''}
                onChange={(e) => handleInputChange(e, 'schedule', 'date')}
                className="mt-1 block w-full rounded-md border p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Time</label>
              <input
                type="time"
                value={editFormData?.schedule.start_time || ''}
                onChange={(e) => handleInputChange(e, 'schedule', 'start_time')}
                className="mt-1 block w-full rounded-md border p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Time</label>
              <input
                type="time"
                value={editFormData?.schedule.end_time || ''}
                onChange={(e) => handleInputChange(e, 'schedule', 'end_time')}
                className="mt-1 block w-full rounded-md border p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Service</label>
              <input
                type="text"
                value={editFormData?.schedule.service.service_name || ''}
                onChange={(e) => handleInputChange(e, 'schedule', 'service_name')}
                className="mt-1 block w-full rounded-md border p-2"
                required
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => setIsEditModalOpen(false)}
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </form>
    </BookingModal>
  );

  const renderDetailsModal = () => (
    <BookingModal
      isOpen={isDetailsModalOpen}
      onClose={() => setIsDetailsModalOpen(false)}
      title="Booking Details"
    >
      {selectedBooking && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Client Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="mt-1">{selectedBooking.clientDetails.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="mt-1">{selectedBooking.clientDetails.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="mt-1">{selectedBooking.clientDetails.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">SMS Reminder</p>
                <p className="mt-1">{selectedBooking.clientDetails.smsReminder ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Service</p>
                <p className="mt-1">{selectedBooking.schedule.service.service_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Instructor</p>
                <p className="mt-1">{selectedBooking.schedule.instructor.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Date</p>
                <p className="mt-1">{formatDate(selectedBooking.schedule.date)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Time</p>
                <p className="mt-1">
                  {selectedBooking.schedule.start_time} - {selectedBooking.schedule.end_time}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Timezone</p>
                <p className="mt-1">{selectedBooking.schedule.timezone}</p>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Status</h3>
            <div>
              <p className="text-sm font-medium text-gray-500">Current Status</p>
              {renderStatusBadge(selectedBooking.status)}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button
              onClick={() => setIsDetailsModalOpen(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </BookingModal>
  );

  // Update the table actions cell in the existing table
  const renderTableActions = (booking) => (
    <div className="flex items-center gap-2">
      <button
        className="p-2 hover:bg-gray-100 rounded-full"
        onClick={() => handleViewDetails(booking)}
      >
        <Eye className="h-4 w-4 text-gray-500" />
      </button>
      <button
        className="p-2 hover:bg-gray-100 rounded-full"
        onClick={() => handleEdit(booking)}
      >
        <Edit className="h-4 w-4 text-blue-500" />
      </button>
      <button 
            className="flex items-center gap-2"
            onClick={() => handleDelete(booking._id)}
          >
            <Trash2 className="h-4 w-4 text-red-500" /> Delete
          </button>
    </div>
  );

    // Add new function to format booking data for export
    const formatBookingForExport = (booking) => {
      return {
        'Client Name': booking.clientDetails.name,
        'Email': booking.clientDetails.email,
        'Phone': booking.clientDetails.phone,
        'Service': booking.schedule.service.service_name,
        'Instructor': booking.schedule.instructor.name,
        'Date': formatDate(booking.schedule.date),
        'Time': `${booking.schedule.start_time} - ${booking.schedule.end_time}`,
        'Timezone': booking.schedule.timezone,
        'Status': booking.status,
        'SMS Reminder': booking.clientDetails.smsReminder ? 'Yes' : 'No'
      };
    };
  
    // Function to download bookings as CSV
    const downloadAsCSV = (bookingsToExport) => {
      const bookingsData = bookingsToExport.map(formatBookingForExport);
      const headers = Object.keys(bookingsData[0]);
      const csvRows = [
        headers.join(','),
        ...bookingsData.map(booking =>
          headers.map(header => {
            const value = booking[header] || '';
            return `"${value.toString().replace(/"/g, '""')}"`;
          }).join(',')
        )
      ];
      
      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `bookings_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  
    // Function to print bookings
    const printBookings = (bookingsToprint) => {
      const printWindow = window.open('', '_blank');
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Bookings Report</title>
            <style>
              body { font-family: Arial, sans-serif; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f4f4f4; }
              .header { margin-bottom: 20px; }
              @media print {
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Bookings Report</h1>
              <p>Generated on: ${new Date().toLocaleString()}</p>
            </div>
            <button class="no-print" onclick="window.print()">Print Report</button>
            <table>
              <thead>
                <tr>
                  <th>Client Name</th>
                  <th>Service</th>
                  <th>Instructor</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${bookingsToprint.map(booking => `
                  <tr>
                    <td>
                      ${booking.clientDetails.name}<br/>
                      <small>${booking.clientDetails.email}</small>
                    </td>
                    <td>${booking.schedule.service.service_name}</td>
                    <td>${booking.schedule.instructor.name}</td>
                    <td>${formatDate(booking.schedule.date)}</td>
                    <td>${booking.schedule.start_time} - ${booking.schedule.end_time}</td>
                    <td>${booking.status}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    };
  
    // Add export controls to the dashboard
    const renderExportControls = () => (
      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 border rounded-md">
            <Download className="h-4 w-4" />
            Download
            <ChevronDown className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => downloadAsCSV(bookings)}>
              All Bookings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => downloadAsCSV(filteredBookings)}>
              Current Filter Results
            </DropdownMenuItem>
            {['pending', 'approve', 'decline', 'complete'].map(status => (
              <DropdownMenuItem 
                key={status}
                onClick={() => downloadAsCSV(bookings.filter(b => b.status === status))}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} Bookings
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
  
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 border rounded-md">
            <Printer className="h-4 w-4" />
            Print
            <ChevronDown className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => printBookings(bookings)}>
              All Bookings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => printBookings(filteredBookings)}>
              Current Filter Results
            </DropdownMenuItem>
            {['pending', 'approve', 'decline', 'complete'].map(status => (
              <DropdownMenuItem 
                key={status}
                onClick={() => printBookings(bookings.filter(b => b.status === status))}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} Bookings
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );


  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Booking Management</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search and Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="pl-10 p-2 w-full border rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 border rounded-md">
              <Filter className="h-4 w-4" />
              Filter Date
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterDate('all')}>
                All Bookings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterDate('today')}>
                Today
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterDate('upcoming')}>
                Upcoming
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterDate('past')}>
                Past
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {renderExportControls()}
        </div>


        {/* Bookings Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Instructor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                 status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium">{booking.clientDetails.name}</div>
                      <div className="text-sm text-gray-500">{booking.clientDetails.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {booking.schedule.service.service_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {booking.schedule.instructor.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatDate(booking.schedule.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {booking.schedule.start_time} - {booking.schedule.end_time} {booking.schedule.timezone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderStatusBadge(booking.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                  {renderTableActions(booking)}
                </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        className="p-2 hover:bg-gray-100 rounded-full"
                        onClick={() => handleDelete(booking._id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                      <button
                        className="p-2 hover:bg-gray-100 rounded-full"
                      >
                        <Edit className="h-4 w-4 text-blue-500" />
                      </button>
                    </div>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredBookings.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No bookings found
            </div>
          )}
        </div>
        {renderEditModal()}
        {renderDetailsModal()}
      </CardContent>
    </Card>
  );
};

export default BookingDashboard;