import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verify } from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(request: Request) {
  try {
    // Get the token from the cookie
    const cookie = request.headers.get('cookie') || '';
    const match = cookie.match(/token=([^;]+)/);
    const token = match ? match[1] : null;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    let decoded: any;
    try {
      decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const isProfile = formData.get('isProfile') === 'true';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Get the user's profile first
    const profile = await prisma.profile.findUnique({
      where: { userId: decoded.userId }
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    try {
      // Convert file to base64
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64String = buffer.toString('base64');
      const dataURI = `data:${file.type};base64,${base64String}`;

      // Upload to Cloudinary
      const uploadResponse = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
          dataURI,
          {
            folder: 'subvivah/profiles',
            resource_type: 'auto',
            transformation: [
              { width: 1000, height: 1000, crop: 'limit' },
              { quality: 'auto' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
      });

      const { secure_url: url } = uploadResponse as { secure_url: string };

      // Create photo record in database
      const photo = await prisma.photo.create({
        data: {
          url,
          isProfile,
          isVerified: false,
          userId: decoded.userId
        }
      });

      // If this is a profile photo, unset isProfile for other photos
      if (isProfile) {
        await prisma.photo.updateMany({
          where: {
            userId: decoded.userId,
            id: { not: photo.id }
          },
          data: {
            isProfile: false
          }
        });
      }

      return NextResponse.json(photo);
    } catch (uploadError) {
      console.error('Error during upload process:', uploadError);
      return NextResponse.json(
        { 
          error: 'Failed to upload photo',
          details: uploadError instanceof Error ? uploadError.message : 'Unknown upload error'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in photo upload API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process photo upload',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 