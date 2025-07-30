'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleRedirect = () => {
      // Check if this is a LINE login callback
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const liffClientId = searchParams.get('liffClientId');
      const liffRedirectUri = searchParams.get('liffRedirectUri');

      if (code && state && liffClientId) {
        // This is a LINE login callback
        // Try to get the intended destination from sessionStorage
        const intendedPath = sessionStorage.getItem('liff-intended-path');
        
        if (intendedPath) {
          if (intendedPath.startsWith('/admin')) {
            // Admin path - redirect to admin with LIFF parameters
            const redirectUrl = new URL(intendedPath, window.location.origin);
            redirectUrl.searchParams.set('code', code);
            redirectUrl.searchParams.set('state', state);
            redirectUrl.searchParams.set('liffClientId', liffClientId);
            redirectUrl.searchParams.set('liffRedirectUri', liffRedirectUri || '');
            redirectUrl.searchParams.set('liff_login', 'true');
            
            // Clean up session storage
            sessionStorage.removeItem('liff-intended-path');
            
            // Redirect with LIFF parameters
            window.location.href = redirectUrl.toString();
            return;
          } else if (intendedPath.startsWith('/scratch-cards/')) {
            // Scratch card path - redirect to scratch card with LIFF parameters
            const redirectUrl = new URL(intendedPath, window.location.origin);
            redirectUrl.searchParams.set('code', code);
            redirectUrl.searchParams.set('state', state);
            redirectUrl.searchParams.set('liffClientId', liffClientId);
            redirectUrl.searchParams.set('liffRedirectUri', liffRedirectUri || '');
            redirectUrl.searchParams.set('liff_login', 'true');
            
            // Clean up session storage
            sessionStorage.removeItem('liff-intended-path');
            
            // Redirect with LIFF parameters
            window.location.href = redirectUrl.toString();
            return;
          }
        }
        
        // No specific intended path or unrecognized path - default to scratch cards management
        const redirectUrl = new URL('/admin/scratch-cards', window.location.origin);
        redirectUrl.searchParams.set('code', code);
        redirectUrl.searchParams.set('state', state);
        redirectUrl.searchParams.set('liffClientId', liffClientId);
        redirectUrl.searchParams.set('liffRedirectUri', liffRedirectUri || '');
        redirectUrl.searchParams.set('liff_login', 'true');
        
        // Clean up session storage
        sessionStorage.removeItem('liff-intended-path');
        
        // Redirect with LIFF parameters
        window.location.href = redirectUrl.toString();
        return;
      }
      
      // If this is not a LINE login callback, redirect to default page
      // Default to admin scratch cards page
      router.replace('/admin/scratch-cards');
    };

    handleRedirect();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 space-y-4">
          <div className="text-center">
            <Skeleton className="h-6 w-3/4 mx-auto mb-4" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
          </div>
          <div className="text-center text-sm text-gray-600">
            正在處理重新導向...
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
