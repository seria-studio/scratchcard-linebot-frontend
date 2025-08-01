'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import liff from '@line/liff';
import { ScratchCard } from '@/components/scratch-card';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Gift, Frown } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import { selectPrizeForUser } from '@/lib/prize-selection';
import type { ScratchCard as ScratchCardType, Prize, APIResponse } from '@/lib/types';

interface ScratchCardPageProps { }

function ScratchCardPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const scratchCardId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lineUserId, setLineUserId] = useState<string | null>(null);
  const [scratchCard, setScratchCard] = useState<ScratchCardType | null>(null);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [liffInitialized, setLiffInitialized] = useState(false);
  const [hasScratched, setHasScratched] = useState(false);
  const [resultSubmitted, setResultSubmitted] = useState(false);

  useEffect(() => {
    const initLiff = async () => {
      try {
        const isLiffLogin = searchParams.get('liff_login') === 'true';
        const code = searchParams.get('code');

        if (isLiffLogin && code) {
          await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! });

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
          await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! });
          setLiffInitialized(true);

          if (liff.isLoggedIn()) {
            const profile = await liff.getProfile();
            setLineUserId(profile.userId);
          } else {
            const currentPath = window.location.pathname;
            sessionStorage.setItem('liff-intended-path', currentPath);
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

    initLiff();
  }, [searchParams]);

  useEffect(() => {
    const loadScratchCard = async () => {
      if (!lineUserId || !scratchCardId) return;

      try {
        setLoading(true);

        const response: APIResponse<ScratchCardType> = await apiRequest(`/scratch_cards/${scratchCardId}`);
        const cardData = response.data;

        console.log('Results:', cardData.results);
        console.log('User ID:', lineUserId);

        const userAlreadyScratched = cardData.results.some(result => result.user.id === lineUserId);
        if (userAlreadyScratched) {
          setError('您已經刮過這張刮刮卡了！');
          setLoading(false);
          return;
        }

        setScratchCard(cardData);

        const prizeResult = selectPrizeForUser(cardData);
        if (!prizeResult.success) {
          setError(prizeResult.error?.message || '無法選擇獎品');
          setLoading(false);
          return;
        }

        setSelectedPrize(prizeResult.prize!);
        setError(null);
      } catch (error: any) {
        console.error('Failed to load scratch card:', error);
        if (error.message && error.message.includes('404')) {
          setError('找不到此刮刮卡');
        } else {
          setError('載入刮刮卡失敗，請稍後再試');
        }
      } finally {
        setLoading(false);
      }
    };

    loadScratchCard();
  }, [lineUserId, scratchCardId]);

  const handleScratchStart = async () => {
    if (hasScratched || resultSubmitted || !selectedPrize || !lineUserId) return;

    setHasScratched(true);


    try {
      await apiRequest('/results/', {
        method: 'POST',
        body: JSON.stringify({
          scratch_card_id: scratchCardId,
          prize_id: selectedPrize.id
        })
      });
      setResultSubmitted(true);
    } catch (error) {
      console.error('Failed to submit scratch result:', error);
    }
  };

  if (searchParams.get('code') && !searchParams.get('liff_login')) {
    useEffect(() => {
      const redirectUrl = new URL(window.location.href);
      redirectUrl.searchParams.set('liff_login', 'true');
      window.location.href = redirectUrl.toString();
    }, []);

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4">
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

  if (loading || !liffInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 space-y-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
              <Skeleton className="h-4 w-1/2 mx-auto" />
              <div className="text-sm text-white/80 mt-4">載入刮刮卡中...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>

            <div className="text-center space-y-4">
              <Frown className="h-12 w-12 text-gray-400 mx-auto" />
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">無法載入刮刮卡</h3>
                <p className="text-gray-600 text-sm">{error}</p>
              </div>

              <Button
                onClick={() => window.location.reload()}
                className="w-full"
              >
                重新載入
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!scratchCard || !selectedPrize) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 space-y-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <div className="text-sm text-white/80">準備刮刮卡中...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-4">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{scratchCard.name}</h1>
          <p className="text-white/80">刮開銀色塗層看看您的獎品！</p>
        </div>

        <ScratchCard
          prize={selectedPrize}
          onScratchStart={handleScratchStart}
          className="mx-auto"
        />

        <div className="mt-8 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-white/90 text-sm">
              💡 提示：用手指或滑鼠刮開銀色塗層，刮開 30% 即可看到完整獎品！
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ScratchCardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 space-y-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <div className="text-sm text-white/80">載入中...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <ScratchCardPageContent />
    </Suspense>
  );
}