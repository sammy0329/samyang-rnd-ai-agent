'use client';

import { useState } from 'react';
import { AuthUser } from '@/lib/auth/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { ProfileInfoSection } from './ProfileInfoSection';
import { ProfileEditForm } from './ProfileEditForm';
import { PasswordChangeForm } from './PasswordChangeForm';

interface ProfileContentProps {
  user: AuthUser;
}

export function ProfileContent({ user: initialUser }: ProfileContentProps) {
  const [user, setUser] = useState<AuthUser>(initialUser);

  const handleProfileUpdate = (updatedUser: AuthUser) => {
    setUser(updatedUser);
  };

  return (
    <div className="space-y-6">
      {/* 프로필 정보 카드 */}
      <ProfileInfoSection user={user} />

      {/* 설정 탭 */}
      <Card className="p-6">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">프로필 수정</TabsTrigger>
            <TabsTrigger value="password">비밀번호 변경</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <ProfileEditForm user={user} onUpdate={handleProfileUpdate} />
          </TabsContent>

          <TabsContent value="password" className="mt-6">
            <PasswordChangeForm />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
