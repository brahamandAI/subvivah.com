import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { photoUrl } = await request.json();

    if (!photoUrl) {
      return NextResponse.json({ error: 'No photo URL provided' }, { status: 400 });
    }

    // Delete from Cloudinary
    const publicId = photoUrl.split('/').slice(-1)[0].split('.')[0];
    await cloudinary.uploader.destroy(publicId);

    // Delete from database
    await prisma.photo.deleteMany({
      where: {
        url: photoUrl,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting photo:', error);
    return NextResponse.json(
      { error: 'Error deleting photo' },
      { status: 500 }
    );
  }
} 