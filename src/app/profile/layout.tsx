import React from 'react';

export const metadata = {
  title: 'Profile | Subvivah',
  description: 'Manage your profile on Subvivah',
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 