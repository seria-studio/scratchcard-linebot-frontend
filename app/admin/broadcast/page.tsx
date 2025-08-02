'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { apiRequest } from '@/lib/api';
import { Send, Users } from 'lucide-react';

export default function BroadcastPage() {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendBroadcast = async () => {
    if (!message.trim()) {
      toast({
        title: '錯誤',
        description: '請輸入訊息內容',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      await apiRequest('/broadcast', {
        method: 'POST',
        body: JSON.stringify({
          message: message.trim(),
        }),
      });

      setMessage('');

      toast({
        title: '發送成功',
        description: '廣播訊息已成功發送給所有用戶',
      });
    } catch (error) {
      console.error('Broadcast error:', error);

      toast({
        title: '發送失敗',
        description: error instanceof Error ? error.message : '發送廣播訊息時發生錯誤',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">廣播訊息</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">發送訊息給所有 LINE 官方帳號用戶</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Broadcast Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              發送廣播訊息
            </CardTitle>
            <CardDescription>
              輸入要發送給所有用戶的文字訊息
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">訊息內容</Label>
              <Textarea
                id="message"
                placeholder="輸入要廣播的訊息..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <div className="text-sm text-gray-500">
                字數: {message.length}/1000
              </div>
            </div>

            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>
                此訊息將發送給所有曾經使用過 LINE 官方帳號的用戶。請確認訊息內容無誤後再發送。
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleSendBroadcast}
              disabled={isLoading || !message.trim() || message.length > 1000}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  發送中...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  發送廣播訊息
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Usage Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle>使用說明</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• 廣播訊息將發送給所有曾經使用過 LINE 官方帳號的用戶</p>
              <p>• 訊息長度限制為 1000 個字元</p>
              <p>• 目前僅支援純文字訊息</p>
              <p>• 發送前請仔細檢查訊息內容，避免發送錯誤訊息</p>
              <p>• 建議在非尖峰時段發送大量廣播訊息</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}