'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import liff from '@line/liff';
import { Navigation } from '@/components/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/api';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';

interface User {
  id: string;
  is_admin: boolean;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

function AdminLayoutContent({ children }: AdminLayoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lineUserId, setLineUserId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [liffInitialized, setLiffInitialized] = useState(false);

  // Initialize LIFF and authenticate user
  useEffect(() => {
    const initLiffAndAuth = async () => {
      try {
        // Check if this is a redirect from LINE login
        const isLiffLogin = searchParams.get('liff_login') === 'true';
        const code = searchParams.get('code');

        if (isLiffLogin && code) {
          // This is a redirect from LINE login
          await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! });

          // Clear the URL parameters
          const url = new URL(window.location.href);
          url.searchParams.delete('code');
          url.searchParams.delete('state');
          url.searchParams.delete('liffClientId');
          url.searchParams.delete('liffRedirectUri');
          url.searchParams.delete('liff_login');
          window.history.replaceState({}, '', url.toString());

          setLiffInitialized(true);

          if (liff.isLoggedIn()) {
            const profile = await liff.getProfile();
            setLineUserId(profile.userId);
          } else {
            throw new Error('Login verification failed');
          }
        } else {
          // Normal LIFF initialization
          await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! });
          setLiffInitialized(true);

          if (liff.isLoggedIn()) {
            const profile = await liff.getProfile();
            setLineUserId(profile.userId);
          } else {
            // Store the intended path before redirecting to login
            const currentPath = window.location.pathname;
            sessionStorage.setItem('liff-intended-path', currentPath);

            // Trigger login if not logged in
            liff.login();
            return;
          }
        }
      } catch (error) {
        console.error('LIFF initialization failed:', error);
        setError('LINE 登入初始化失敗');
        setLoading(false);
      }
    };

    initLiffAndAuth();
  }, [searchParams]);

  // Fetch user data and check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!lineUserId) return;

      try {
        setLoading(true);

        let userData;
        try {
          const response = await apiRequest(`/me`);
          userData = response.data;
        } catch (error: any) {
          console.error('Failed to fetch user data:', error);
        }

        if (!userData) {
          setError('無法取得用戶資料');
          return;
        }

        if (!userData.is_admin) {
          setError('您沒有管理員權限，無法存取此頁面');
          return;
        }

        setUser(userData);
        setError(null);
      } catch (error) {
        console.error('Failed to check admin status:', error);
        setError('無法驗證管理員權限，請稍後再試');
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [lineUserId]);

  // Create redirect handler for LINE login (similar to scratch cards)
  if (searchParams.get('code') && !searchParams.get('liff_login')) {
    // This means we're at /admin?code=... from LINE login redirect
    // We need to redirect to /admin?code=...&liff_login=true
    useEffect(() => {
      const redirectUrl = new URL(window.location.href);
      redirectUrl.searchParams.set('liff_login', 'true');
      window.location.href = redirectUrl.toString();
    }, []);

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 space-y-4">
            <div className="text-center">
              <Skeleton className="h-6 w-3/4 mx-auto mb-4" />
              <div className="text-sm text-gray-600">正在處理 LINE 登入...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (loading || !liffInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 space-y-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
              <Skeleton className="h-4 w-1/2 mx-auto" />
              <div className="text-sm text-gray-600 mt-4">驗證管理員權限中...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>

            <div className="text-center space-y-4">
              <Shield className="h-12 w-12 text-gray-400 mx-auto" />
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">無法存取管理面板</h3>
                <p className="text-gray-600 text-sm">請確認您具有管理員權限</p>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={() => window.location.reload()}
                  className="w-full"
                >
                  重新驗證
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle logout
  const handleLogout = () => {
    if (liff.isLoggedIn()) {
      liff.logout();
    }
    // Clear any stored data
    sessionStorage.removeItem('liff-intended-path');
    // Redirect to admin scratch cards page
    router.push('/admin/scratch-cards');
  };

  // Success state - render admin panel
  return (
    <SidebarProvider>
      <Navigation onLogout={handleLogout} />
      <SidebarInset className="w-full max-w-full overflow-x-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 px-4 bg-white border-b border-gray-200">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1 flex justify-between items-center">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">管理面板</h1>
              <p className="text-sm text-gray-600">歡迎，{user?.display_name || user?.id}</p>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600 font-medium">管理員</span>
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-2 sm:p-4 pt-0">
          <main className="p-1 sm:p-2">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 space-y-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-sm text-gray-600">載入中...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  );
}