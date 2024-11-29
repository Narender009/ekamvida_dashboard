import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/buttons';
import { Input } from './ui/inputs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/react-select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from './ui/dialog';
import { 
  Search,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Download, Printer
} from 'lucide-react';

const RegistrationDashboard = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    title: '',
    date: '',
    time: '',
    location: '',
    event: ''
  });

  // Fetch registrations
  const fetchRegistrations = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/registrations');
      const data = await response.json();
      setRegistrations(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const url = selectedRegistration 
      ? `http://127.0.0.1:5000/api/registrations/${selectedRegistration._id}`
      : 'http://127.0.0.1:5000/api/registrations';
      
    const method = selectedRegistration ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchRegistrations();
        setShowForm(false);
        setSelectedRegistration(null);
        setFormData({
          name: '',
          email: '',
          phone: '',
          title: '',
          date: '',
          time: '',
          location: '',
          event: ''
        });
      }
    } catch (error) {
      console.error('Error saving registration:', error);
    }
  };

  // Handle deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this registration?')) {
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/registrations/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchRegistrations();
        }
      } catch (error) {
        console.error('Error deleting registration:', error);
      }
    }
  };

  // Filter registrations based on type and search term
  const getFilteredRegistrations = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return registrations.filter(reg => {
      const regDate = new Date(reg.date);
      regDate.setHours(0, 0, 0, 0);
      
      // First apply date filter
      const dateFilterPass = (() => {
        switch(filterType) {
          case 'today':
            return regDate.getTime() === today.getTime();
          case 'past':
            return regDate < today;
          case 'upcoming':
            return regDate > today;
          default:
            return true;
        }
      })();

      // Then apply search filter
      const searchFilterPass = 
        reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.title.toLowerCase().includes(searchTerm.toLowerCase());

      return dateFilterPass && searchFilterPass;
    });
  };

  // Download registrations as CSV
  const downloadCSV = () => {
    const filtered = getFilteredRegistrations();
    const headers = ['Name', 'Email', 'Phone', 'Event', 'Date', 'Time', 'Location'];
    const csvData = filtered.map(reg => [
      reg.name,
      reg.email,
      reg.phone,
      reg.title,
      new Date(reg.date).toLocaleDateString(),
      reg.time,
      reg.location
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `registrations-${filterType}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print registrations
  const printRegistrations = () => {
    const filtered = getFilteredRegistrations();
    const printContent = document.createElement('div');
    printContent.innerHTML = `
      <h1>Registrations - ${filterType.charAt(0).toUpperCase() + filterType.slice(1)}</h1>
      <p>Generated on: ${new Date().toLocaleString()}</p>
      <table border="1" style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th>Name</th>
            <th>Event</th>
            <th>Date & Time</th>
            <th>Contact</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map(reg => `
            <tr>
              <td>${reg.name}</td>
              <td>${reg.title}</td>
              <td>${new Date(reg.date).toLocaleDateString()} ${reg.time}</td>
              <td>
                Email: ${reg.email}<br>
                Phone: ${reg.phone}
              </td>
              <td>${reg.location}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Registrations</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 8px; border: 1px solid #ddd; }
            th { background-color: #f4f4f4; }
            @media print {
              h1 { margin-bottom: 10px; }
              p { margin-bottom: 20px; color: #666; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Registration Dashboard</CardTitle>
          <div className="flex space-x-4">
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => {
                    setSelectedRegistration(null);
                    setFormData({
                      name: '',
                      email: '',
                      phone: '',
                      title: '',
                      date: '',
                      time: '',
                      location: '',
                      event: ''
                    });
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Registration
                </Button>
              </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {selectedRegistration ? 'Edit Registration' : 'New Registration'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
                <Input
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                />
                <Input
                  placeholder="Event Title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  required
                />
                <Input
                  placeholder="Location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  required
                />
                <Button type="submit" className="w-full">
                  {selectedRegistration ? 'Update' : 'Create'} Registration
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4 space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search registrations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter registrations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Registrations</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="past">Past</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={downloadCSV}
              className="flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
            <Button
              variant="outline"
              onClick={printRegistrations}
              className="flex items-center"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>
          
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredRegistrations().map((registration) => (
                    <TableRow key={registration._id}>
                      <TableCell className="font-medium">{registration.name}</TableCell>
                      <TableCell>{registration.title}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(registration.date).toLocaleDateString()}
                          <br />
                          {registration.time}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-2" />
                            {registration.email}
                          </div>
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-2" />
                            {registration.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          {registration.location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRegistration(registration);
                              setFormData(registration);
                              setShowForm(true);
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(registration._id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationDashboard;