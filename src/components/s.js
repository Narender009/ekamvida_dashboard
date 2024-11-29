import React, { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, Calendar, Clock, User, Mail, Phone, Book } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "./ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/buttons";
import { Input } from "./ui/inputs";
import { Label } from "./ui/label";

const CreateDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);

  // Fetch bookings
  const fetchBookings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/book-class');
      const data = await response.json();
      setBookings(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setLoading(false);
    }
  };

  // Search bookings
  const searchBookings = async () => {
    if (!searchTerm.trim()) {
      fetchBookings();
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/book-class/search?name=${encodeURIComponent(searchTerm.trim())}`);
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Error searching bookings:', error);
    }
  };

  // Handle search on enter key
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchBookings();
    }
  };

  // Delete booking
  const deleteBooking = async (id) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await fetch(`http://localhost:5000/api/book-class/${id}`, { 
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        fetchBookings();
      } catch (error) {
        console.error('Error deleting booking:', error);
      }
    }
  };

  // Update booking
  const updateBooking = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/book-class/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update booking');
      }
      
      setIsEditDialogOpen(false);
      fetchBookings();
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    if (selectedBooking && isEditDialogOpen) {
      setEditForm({
        clientDetails: { ...selectedBooking.clientDetails },
        schedule: { ...selectedBooking.schedule }
      });
    }
  }, [selectedBooking, isEditDialogOpen]);

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const BookingDetails = ({ booking }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-medium">Client Details</h3>
          <div className="space-y-2 mt-2">
            <div className="flex items-center gap-2">
              <User size={16} />
              <span>{booking.clientDetails.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={16} />
              <span>{booking.clientDetails.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={16} />
              <span>{booking.clientDetails.phone}</span>
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-medium">Schedule Details</h3>
          <div className="space-y-2 mt-2">
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{formatDate(booking.schedule.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>{booking.schedule.start_time} - {booking.schedule.end_time} {booking.schedule.timezone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Book size={16} />
              <span>{booking.schedule.service.service_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <User size={16} />
              <span>{booking.schedule.instructor.name}</span>
            </div>
          </div>
        </div>
      </div>
      {booking.clientDetails.message && (
        <div>
          <h3 className="font-medium">Message</h3>
          <p className="mt-1">{booking.clientDetails.message}</p>
        </div>
      )}
    </div>
  );

  const EditBookingForm = ({ booking }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-medium">Client Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={editForm.clientDetails.name}
              onChange={(e) => setEditForm({
                ...editForm,
                clientDetails: { ...editForm.clientDetails, name: e.target.value }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={editForm.clientDetails.email}
              onChange={(e) => setEditForm({
                ...editForm,
                clientDetails: { ...editForm.clientDetails, email: e.target.value }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={editForm.clientDetails.phone}
              onChange={(e) => setEditForm({
                ...editForm,
                clientDetails: { ...editForm.clientDetails, phone: e.target.value }
              })}
            />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="font-medium">Schedule Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={new Date(editForm.schedule.date).toISOString().split('T')[0]}
              onChange={(e) => setEditForm({
                ...editForm,
                schedule: { ...editForm.schedule, date: e.target.value }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="start_time">Start Time</Label>
            <Input
              id="start_time"
              value={editForm.schedule.start_time}
              onChange={(e) => setEditForm({
                ...editForm,
                schedule: { ...editForm.schedule, start_time: e.target.value }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_time">End Time</Label>
            <Input
              id="end_time"
              value={editForm.schedule.end_time}
              onChange={(e) => setEditForm({
                ...editForm,
                schedule: { ...editForm.schedule, end_time: e.target.value }
              })}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Booking Management</CardTitle>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search by client name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="w-64"
                />
                <Button onClick={searchBookings} variant="outline" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading bookings...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking._id}>
                    <TableCell>{booking.clientDetails.name}</TableCell>
                    <TableCell>{booking.schedule.service.service_name}</TableCell>
                    <TableCell>{formatDate(booking.schedule.date)}</TableCell>
                    <TableCell>{`${booking.schedule.start_time} - ${booking.schedule.end_time} ${booking.schedule.timezone}`}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {/* View Dialog */}
                        <Dialog open={isViewDialogOpen && selectedBooking?._id === booking._id}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setIsViewDialogOpen(true);
                              }}
                            >
                              <User className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Booking Details</DialogTitle>
                            </DialogHeader>
                            {selectedBooking && <BookingDetails booking={selectedBooking} />}
                            <DialogFooter>
                              <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        {/* Edit Dialog */}
                        <Dialog open={isEditDialogOpen && selectedBooking?._id === booking._id}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Booking</DialogTitle>
                            </DialogHeader>
                            {editForm && <EditBookingForm booking={selectedBooking} />}
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={() => updateBooking(selectedBooking._id)}>
                                Save Changes
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => deleteBooking(booking._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateDashboard;