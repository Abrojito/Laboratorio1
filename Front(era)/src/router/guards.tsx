import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const hasToken = () => Boolean(localStorage.getItem('token'));

/* 1) Solo entra si está logueado */
export const ProtectedRoute: React.FC = () =>
    hasToken() ? <Outlet /> : <Navigate to="/start" replace />;

/* 2) Solo entra si NO está logueado */
export const GuestOnlyRoute: React.FC = () =>
    hasToken() ? <Navigate to="/home" replace /> : <Outlet />;
