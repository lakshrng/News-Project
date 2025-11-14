import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';
import { generateToken } from '../../../../lib/auth';

export async function POST(request) {
  try {
    const { username, email, password } = await request.json();

    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin user already exists' },
        { status: 400 }
      );
    }

    const admin = new User({
      username,
      email,
      password,
      role: 'admin'
    });

    await admin.save();

    const token = generateToken(admin._id);

    return NextResponse.json({
      message: 'Admin user created successfully',
      token,
      user: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Admin creation error:', error);
    return NextResponse.json(
      { error: 'Server error during admin creation' },
      { status: 500 }
    );
  }
}

