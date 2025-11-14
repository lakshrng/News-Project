import { NextResponse } from 'next/server';
import { getTokenFromRequest, verifyToken } from '../lib/auth';
import connectDB from '../lib/mongodb';
import User from '../models/User';

export async function verifyAuth(request) {
  const token = getTokenFromRequest(request);
  
  if (!token) {
    return { error: 'Access denied. No token provided.', status: 401 };
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return { error: 'Invalid token.', status: 401 };
  }

  await connectDB();
  const user = await User.findById(decoded.userId);
  
  if (!user || !user.isActive) {
    return { error: 'User not found or inactive.', status: 401 };
  }

  return { userId: decoded.userId, user };
}

export async function requireAdmin(request) {
  const authResult = await verifyAuth(request);
  
  if (authResult.error) {
    return authResult;
  }

  if (authResult.user.role !== 'admin') {
    return { error: 'Access denied. Admin privileges required.', status: 403 };
  }

  return authResult;
}

