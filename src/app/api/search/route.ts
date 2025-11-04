import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { convertHeightToStandardFormat, heightToDisplayFormat, formatMaritalStatus, formatMotherTongue } from '@/lib/utils';

type UserWithProfile = Prisma.UserGetPayload<{
  include: {
    profile: true;
    photos: true;
  }
}>;

interface SearchResponse {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  age: number;
  height: string | null;
  maritalStatus: string | null;
  religion: string | null;
  caste: string | null;
  motherTongue: string | null;
  education: string | null;
  occupation: string | null;
  annualIncome: string | null;
  workLocation: string | null;
  photos: {
    url: string;
    isProfile: boolean;
  }[];
}

interface ProfileFilter {
  height?: { gte?: string; lte?: string };
  maritalStatus?: { equals: string; mode: 'insensitive' };
  religion?: { equals: string; mode: 'insensitive' };
  caste?: { equals: string; mode: 'insensitive' };
  motherTongue?: { equals: string; mode: 'insensitive' };
  education?: { equals: string; mode: 'insensitive' };
  occupation?: { equals: string; mode: 'insensitive' };
  annualIncome?: { equals: string; mode: 'insensitive' };
  workLocation?: { equals: string; mode: 'insensitive' };
}

interface UserFilter {
  AND: Array<{
    dob?: { lte: Date; gte: Date };
    profile?: { AND?: ProfileFilter[]; isNot?: null };
  }>;
}

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Get search parameters
    const ageMin = parseInt(searchParams.get('ageMin') || '18');
    const ageMax = parseInt(searchParams.get('ageMax') || '65');
    const heightMin = searchParams.get('heightMin');
    const heightMax = searchParams.get('heightMax');
    const maritalStatus = searchParams.get('maritalStatus');
    const religion = searchParams.get('religion');
    const caste = searchParams.get('caste');
    const motherTongue = searchParams.get('motherTongue');
    const education = searchParams.get('education');
    const occupation = searchParams.get('occupation');
    const annualIncome = searchParams.get('annualIncome');
    const workLocation = searchParams.get('workLocation');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Calculate age range dates
    const today = new Date();
    const maxBirthDate = new Date(today.getFullYear() - ageMin, today.getMonth(), today.getDate());
    const minBirthDate = new Date(today.getFullYear() - ageMax, today.getMonth(), today.getDate());

    // Build where clause using Prisma types
    const whereConditions: Prisma.UserWhereInput[] = [
      // Basic user filters
      {
        dob: {
          lte: maxBirthDate,
          gte: minBirthDate
        }
      }
    ];

    // Add optional filters only if they are provided
    const profileFilters: Prisma.ProfileWhereInput[] = [];

    // Convert height values to standardized format (cm)
    const heightMinCm = heightMin ? convertHeightToStandardFormat(heightMin).toString() : null;
    const heightMaxCm = heightMax ? convertHeightToStandardFormat(heightMax).toString() : null;

    // Add height range filters using standardized values
    if (heightMinCm) {
      profileFilters.push({
        height: {
          not: {
            equals: ""
          }
        },
        OR: [
          // For values stored in cm format
          {
            height: {
              gte: heightMinCm,
              not: {
                contains: "'"
              }
            }
          },
          // For values stored in feet/inches format
          {
            height: {
              contains: "'",
              not: {
                equals: ""
              }
            },
            AND: [
              {
                height: {
                  not: null
                }
              }
            ]
          }
        ]
      });
    }

    if (heightMaxCm) {
      profileFilters.push({
        height: {
          not: {
            equals: ""
          }
        },
        OR: [
          // For values stored in cm format
          {
            height: {
              lte: heightMaxCm,
              not: {
                contains: "'"
              }
            }
          },
          // For values stored in feet/inches format
          {
            height: {
              contains: "'",
              not: {
                equals: ""
              }
            },
            AND: [
              {
                height: {
                  not: null
                }
              }
            ]
          }
        ]
      });
    }

    // Add exact match filters with case insensitivity
    if (maritalStatus) {
      profileFilters.push({
        maritalStatus: {
          equals: maritalStatus.toLowerCase(),
          mode: 'insensitive'
        }
      });
    }
    if (religion) {
      profileFilters.push({
        religion: {
          equals: religion,
          mode: 'insensitive'
        }
      });
    }
    if (caste) {
      profileFilters.push({
        caste: {
          equals: caste,
          mode: 'insensitive'
        }
      });
    }
    if (motherTongue) {
      profileFilters.push({
        motherTongue: {
          equals: motherTongue.toLowerCase(),
          mode: 'insensitive'
        }
      });
    }
    if (education) {
      profileFilters.push({
        education: {
          equals: education,
          mode: 'insensitive'
        }
      });
    }
    if (occupation) {
      profileFilters.push({
        occupation: {
          equals: occupation,
          mode: 'insensitive'
        }
      });
    }
    if (annualIncome) {
      profileFilters.push({
        annualIncome: {
          equals: annualIncome,
          mode: 'insensitive'
        }
      });
    }
    if (workLocation) {
      profileFilters.push({
        workLocation: {
          contains: workLocation,
          mode: 'insensitive'
        }
      });
    }

    // Add profile filters if any exist
    if (profileFilters.length > 0) {
      whereConditions.push({
        profile: {
          AND: profileFilters
        }
      });
    } else {
      // If no profile filters, just ensure profile exists
      whereConditions.push({
        profile: {
          isNot: null
        }
      });
    }

    const where: Prisma.UserWhereInput = {
      AND: whereConditions
    };

    // Get total count for pagination
    const total = await prisma.user.count({ where });

    // Get paginated results
    const users = await prisma.user.findMany({
      where,
      include: {
        profile: true,
        photos: {
          select: {
            url: true,
            isProfile: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    // Transform users to response format with formatted values
    const transformedUsers: SearchResponse[] = users.map(user => ({
      id: user.id,
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      age: calculateAge(user.dob),
      height: user.profile?.height ? heightToDisplayFormat(user.profile.height) : null,
      maritalStatus: user.profile?.maritalStatus ? formatMaritalStatus(user.profile.maritalStatus) : null,
      religion: user.profile?.religion || null,
      caste: user.profile?.caste || null,
      motherTongue: user.profile?.motherTongue ? formatMotherTongue(user.profile.motherTongue) : null,
      education: user.profile?.education || null,
      occupation: user.profile?.occupation || null,
      annualIncome: user.profile?.annualIncome || null,
      workLocation: user.profile?.workLocation || null,
      photos: user.photos.map(photo => ({
        url: photo.url,
        isProfile: photo.isProfile
      }))
    }));

    return NextResponse.json({
      users: transformedUsers,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        perPage: limit
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search profiles' },
      { status: 500 }
    );
  }
}

function calculateAge(dob: Date): number {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
