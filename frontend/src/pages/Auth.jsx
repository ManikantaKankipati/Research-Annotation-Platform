import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, Mail, Lock, User } from 'lucide-react';

export const LoginPage = ({ onSwitch }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="glass max-w-sm md:max-w-md w-full p-6 md:p-8 rounded-3xl">
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg">
            <LogIn className="text-white w-8 h-8" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center mb-2">Welcome Back</h2>
        <p className="text-slate-500 text-center mb-8">Sign in to continue your research</p>

        {error && <div className="bg-red-50 text-red-500 p-3 rounded-xl mb-6 text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-100/50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="name@example.com"
                required
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-100/50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          <button className="w-full bg-indigo-600 text-white font-semibold py-4 rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-2">
            Sign In
          </button>
        </form>

        <p className="text-center mt-8 text-slate-500">
          Don't have an account? 
          <button onClick={onSwitch} className="text-indigo-600 font-semibold ml-1 hover:underline">Sign Up</button>
        </p>
      </div>
    </div>
  );
};

export const SignupPage = ({ onSwitch }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signup } = useAuth();
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(username, email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="glass max-w-sm md:max-w-md w-full p-6 md:p-8 rounded-3xl">
        <div className="flex justify-center mb-6">
          <div className="bg-emerald-600 p-3 rounded-2xl shadow-lg">
            <UserPlus className="text-white w-8 h-8" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center mb-2">Create Account</h2>
        <p className="text-slate-500 text-center mb-8">Join the academic annotator community</p>

        {error && <div className="bg-red-50 text-red-500 p-3 rounded-xl mb-6 text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 ml-1">Username</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-100/50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                placeholder="johndoe"
                required
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-100/50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                placeholder="name@example.com"
                required
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-100/50 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          <button className="w-full bg-emerald-600 text-white font-semibold py-4 rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-200 transition-all flex items-center justify-center gap-2">
            Get Started
          </button>
        </form>

        <p className="text-center mt-8 text-slate-500">
          Already have an account? 
          <button onClick={onSwitch} className="text-emerald-600 font-semibold ml-1 hover:underline">Sign In</button>
        </p>
      </div>
    </div>
  );
};
