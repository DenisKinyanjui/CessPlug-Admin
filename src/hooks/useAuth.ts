import { useState, useEffect } from 'react';
import { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate auth check
    const token = localStorage.getItem('adminToken');
    const userData = localStorage.getItem('adminUser');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate login
    if (email === 'admin@cessplug.com' && password === 'admin123') {
      const userData: User = {
        id: '1',
        name: 'Admin User',
        email: 'admin@cessplug.com',
        role: 'admin',
        avatar: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=400',
        createdAt: new Date().toISOString(),
        status: 'active'
      };
      
      localStorage.setItem('adminToken', 'fake-token');
      localStorage.setItem('adminUser', JSON.stringify(userData));
      setUser(userData);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setUser(null);
  };

  return { user, login, logout, loading };
};