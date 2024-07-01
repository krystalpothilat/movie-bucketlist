import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import HomePage from './HomePage';
import AdminPage from './AdminPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from './AuthContext';

function App() {
  return (
    <AuthProvider>

    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} /> 
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
    </AuthProvider>

  );
}

export default App;
