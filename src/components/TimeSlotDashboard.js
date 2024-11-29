import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Filter } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/react-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/react-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/react-select";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";

const TimeSlotDashboard = () => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimezone, setSelectedTimezone] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [newTimeSlot, setNewTimeSlot] = useState({
    date: '',
    time: '',
    timezone: 'IST',
    isAvailable: true
  });

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchTimeSlots = async () => {
    try {
      setLoading(true);
      let url = 'http://localhost:5000/api/timeslots';
      const queryParams = [];
      
      if (selectedDate) queryParams.push(`date=${selectedDate}`);
      if (selectedTimezone !== 'ALL') queryParams.push(`timezone=${selectedTimezone}`);
      
      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch time slots');
      const data = await response.json();
      setTimeSlots(data);
    } catch (err) {
      setError('Failed to fetch time slots');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTimeSlot = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/timeslots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTimeSlot),
      });

      if (!response.ok) throw new Error('Failed to create time slot');

      await fetchTimeSlots();
      setIsAddModalOpen(false);
      setNewTimeSlot({
        date: '',
        time: '',
        timezone: 'IST',
        isAvailable: true
      });
    } catch (err) {
      setError('Failed to create time slot');
      console.error(err);
    }
  };

  const handleEditTimeSlot = async () => {
    if (!editingSlot) return;

    try {
      const response = await fetch(`http://localhost:5000/api/timeslots/${editingSlot._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingSlot),
      });

      if (!response.ok) throw new Error('Failed to update time slot');

      await fetchTimeSlots();
      setIsEditModalOpen(false);
      setEditingSlot(null);
    } catch (err) {
      setError('Failed to update time slot');
      console.error(err);
    }
  };

  const toggleAvailability = async (id, currentStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/timeslots/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isAvailable: !currentStatus }),
      });

      if (!response.ok) throw new Error('Failed to update time slot');

      await fetchTimeSlots();
    } catch (err) {
      setError('Failed to update time slot');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      // Show confirmation before deleting
      if (!window.confirm('Are you sure you want to delete this time slot?')) {
        return;
      }

      const response = await fetch(`http://localhost:5000/api/timeslots/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete time slot');
      }

      // Optimistically update UI
      setTimeSlots(prevTimeSlots => prevTimeSlots.filter(slot => slot._id !== id));
      
      // Show success message
      setError('Time slot deleted successfully');
      setTimeout(() => setError(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete time slot');
      console.error('Delete error:', err);
    }
  };


  

  const openEditModal = (slot) => {
    setEditingSlot({
      ...slot,
      date: new Date(slot.date).toISOString().split('T')[0]
    });
    setIsEditModalOpen(true);
  };

  useEffect(() => {
    fetchTimeSlots();
  }, [selectedDate, selectedTimezone]);

  return (
    <div className="p-6">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Time Slot Management
          </CardTitle>
          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-40"
              />
            </div>
            <Select
              value={selectedTimezone}
              onValueChange={setSelectedTimezone}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Timezones</SelectItem>
                <SelectItem value="IST">IST</SelectItem>
                <SelectItem value="BST">BST</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button>Add Time Slot</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Time Slot</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex flex-col gap-2">
                    <label>Date</label>
                    <Input
                      type="date"
                      value={newTimeSlot.date}
                      onChange={(e) => setNewTimeSlot({...newTimeSlot, date: e.target.value})}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label>Time</label>
                    <Input
                      type="time"
                      value={newTimeSlot.time}
                      onChange={(e) => setNewTimeSlot({...newTimeSlot, time: e.target.value})}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label>Timezone</label>
                    <Select
                      value={newTimeSlot.timezone}
                      onValueChange={(value) => setNewTimeSlot({...newTimeSlot, timezone: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IST">IST</SelectItem>
                        <SelectItem value="BST">BST</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleCreateTimeSlot}>Create Time Slot</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : timeSlots.length === 0 ? (
            <div className="text-center py-4">No time slots found</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {timeSlots.map((slot) => (
                <Card key={slot._id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">
                        {new Date(slot.date).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="text-sm font-medium">{slot.timezone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{slot.time}</span>
                    <div className="flex gap-2">
                      <Button
                        variant={slot.isAvailable ? "default" : "secondary"}
                        size="sm"
                        onClick={() => toggleAvailability(slot._id, slot.isAvailable)}
                      >
                        {slot.isAvailable ? 'Available' : 'Unavailable'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(slot)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(slot._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Time Slot</DialogTitle>
          </DialogHeader>
          {editingSlot && (
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2">
                <label>Date</label>
                <Input
                  type="date"
                  value={editingSlot.date}
                  onChange={(e) => setEditingSlot({...editingSlot, date: e.target.value})}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label>Time</label>
                <Input
                  type="time"
                  value={editingSlot.time}
                  onChange={(e) => setEditingSlot({...editingSlot, time: e.target.value})}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label>Timezone</label>
                <Select
                  value={editingSlot.timezone}
                  onValueChange={(value) => setEditingSlot({...editingSlot, timezone: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IST">IST</SelectItem>
                    <SelectItem value="BST">BST</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleEditTimeSlot}>Save Changes</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TimeSlotDashboard;