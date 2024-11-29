import React, { useState } from 'react';
import { UserIcon, LockIcon, AlertCircle } from 'lucide-react';

// You would typically get these from an environment variable
const ADMIN_CREDENTIALS = {
  email: 'admin@example.com',
  password: 'admin123'
};

const LoginPage = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check credentials
      if (formData.email === ADMIN_CREDENTIALS.email && 
          formData.password === ADMIN_CREDENTIALS.password) {
        // Store auth token
        localStorage.setItem('adminToken', 'dummy-jwt-token');
        // Call success callback
        onLogin(true);
      } else {
        setError('Invalid email or password');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-purple-400 to-emerald-400 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Company logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center space-x-2 mb-2">
            <div className="w-4 h-4 rounded-full bg-red-400"></div>
            <div className="w-4 h-4 rounded-full bg-teal-400"></div>
            <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
            <div className="w-4 h-4 rounded-full bg-purple-400"></div>
          </div>
          <div className="text-gray-600 font-medium">COMPANY LOGO</div>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Left side with illustration */}
            <div className="w-full md:w-1/2 p-12 flex items-center justify-center bg-gray-50">
              <div className="relative w-full max-w-sm">
                <div className="absolute inset-0 bg-yellow-50 rounded-full opacity-30"></div>
                <div className="relative">
                  {/* Monitor illustration */}
                  <div className="relative w-64 mx-auto">
                    <div className="w-full h-48 bg-white rounded-lg shadow-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-red-400"></div>
                        <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                        <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      </div>
                      <div className="flex items-center justify-center h-32">
                        <div className="relative">
                          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                            <UserIcon className="h-8 w-8 text-purple-600" />
                          </div>
                          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                            <LockIcon className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Shield decoration */}
                    <div className="absolute -right-4 bottom-4">
                      <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center relative">
                        <div className="absolute -right-1 -top-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                          <div className="text-purple-600 text-sm">✓</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-3 h-3 bg-blue-400 rounded-full"></div>
                  <div className="absolute bottom-0 left-0 w-3 h-3 bg-red-400 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Right side with login form */}
            <div className="w-full md:w-1/2 p-12">
              <div className="mb-8">
                <h2 className="text-xl text-gray-700 font-medium flex items-center">
                  <span className="w-6 h-1 bg-purple-500 mr-3"></span>
                  Login as a Admin User
                </h2>
              </div>

              {error && (
                <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-lg flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    placeholder="Username/Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-12 py-4 rounded-full bg-gray-50 border-transparent focus:border-purple-500 focus:ring-0 focus:bg-white"
                  />
                  <UserIcon className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                </div>

                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-12 py-4 rounded-full bg-gray-50 border-transparent focus:border-purple-500 focus:ring-0 focus:bg-white"
                  />
                  <LockIcon className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-full bg-purple-600 text-white font-medium transition-colors hover:bg-purple-700 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? 'Logging in...' : 'LOGIN'}
                </button>

                <div className="text-center space-y-2">
                  <a href="#" className="block text-sm text-gray-500 hover:text-purple-600">
                    Forgot your password?
                  </a>
                  <a href="#" className="block text-sm text-purple-600 hover:text-purple-700">
                    Get help Signed in
                  </a>
                </div>
              </form>

              <div className="mt-8 text-center text-sm text-gray-400">
                <a href="#" className="hover:text-gray-600">Terms of use</a>
                <span className="mx-2">·</span>
                <a href="#" className="hover:text-gray-600">Privacy policy</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;








// import React, { useState } from 'react';
// import { Lock, User, BarChart, Users, FileText, Settings } from 'lucide-react';

// const LoginDashboard = () => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');

//   // Mock authentication function
//   const handleLogin = (e) => {
//     e.preventDefault();
//     // In a real app, you would validate against a backend
//     if (email === 'admin@example.com' && password === 'password') {
//       setIsAuthenticated(true);
//       setError('');
//     } else {
//       setError('Invalid credentials');
//     }
//   };

//   const handleLogout = () => {
//     setIsAuthenticated(false);
//     setEmail('');
//     setPassword('');
//   };

//   // Mock dashboard data
//   const dashboardData = {
//     totalUsers: 1234,
//     activeUsers: 892,
//     documentsProcessed: 456,
//     pendingTasks: 27
//   };

//   if (!isAuthenticated) {
//     return (
//       <div className="min-h-screen bg-gray-100 flex items-center justify-center">
//         <div className="bg-white p-8 rounded-lg shadow-md w-96">
//           <div className="text-center mb-8">
//             <Lock className="mx-auto text-blue-500 h-12 w-12" />
//             <h2 className="mt-4 text-2xl font-bold text-gray-900">Login to Dashboard</h2>
//           </div>
          
//           {error && (
//             <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleLogin}>
//             <div className="mb-4">
//               <label className="block text-gray-700 text-sm font-bold mb-2">
//                 Email
//               </label>
//               <div className="relative">
//                 <span className="absolute left-3 top-3 text-gray-400">
//                   <User size={18} />
//                 </span>
//                 <input
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
//                   placeholder="Enter your email"
//                   required
//                 />
//               </div>
//             </div>

//             <div className="mb-6">
//               <label className="block text-gray-700 text-sm font-bold mb-2">
//                 Password
//               </label>
//               <div className="relative">
//                 <span className="absolute left-3 top-3 text-gray-400">
//                   <Lock size={18} />
//                 </span>
//                 <input
//                   type="password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
//                   placeholder="Enter your password"
//                   required
//                 />
//               </div>
//             </div>

//             <button
//               type="submit"
//               className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//             >
//               Sign In
//             </button>
//           </form>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <nav className="bg-white shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between h-16">
//             <div className="flex items-center">
//               <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
//             </div>
//             <div className="flex items-center">
//               <button
//                 onClick={handleLogout}
//                 className="ml-4 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
//               >
//                 Logout
//               </button>
//             </div>
//           </div>
//         </div>
//       </nav>

//       <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
//         <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
//           {/* Dashboard Cards */}
//           <div className="bg-white overflow-hidden shadow rounded-lg">
//             <div className="p-5">
//               <div className="flex items-center">
//                 <div className="flex-shrink-0">
//                   <Users className="h-6 w-6 text-gray-400" />
//                 </div>
//                 <div className="ml-5">
//                   <div className="text-sm font-medium text-gray-500">Total Users</div>
//                   <div className="text-2xl font-semibold text-gray-900">{dashboardData.totalUsers}</div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white overflow-hidden shadow rounded-lg">
//             <div className="p-5">
//               <div className="flex items-center">
//                 <div className="flex-shrink-0">
//                   <BarChart className="h-6 w-6 text-gray-400" />
//                 </div>
//                 <div className="ml-5">
//                   <div className="text-sm font-medium text-gray-500">Active Users</div>
//                   <div className="text-2xl font-semibold text-gray-900">{dashboardData.activeUsers}</div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white overflow-hidden shadow rounded-lg">
//             <div className="p-5">
//               <div className="flex items-center">
//                 <div className="flex-shrink-0">
//                   <FileText className="h-6 w-6 text-gray-400" />
//                 </div>
//                 <div className="ml-5">
//                   <div className="text-sm font-medium text-gray-500">Documents Processed</div>
//                   <div className="text-2xl font-semibold text-gray-900">{dashboardData.documentsProcessed}</div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white overflow-hidden shadow rounded-lg">
//             <div className="p-5">
//               <div className="flex items-center">
//                 <div className="flex-shrink-0">
//                   <Settings className="h-6 w-6 text-gray-400" />
//                 </div>
//                 <div className="ml-5">
//                   <div className="text-sm font-medium text-gray-500">Pending Tasks</div>
//                   <div className="text-2xl font-semibold text-gray-900">{dashboardData.pendingTasks}</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default LoginDashboard;