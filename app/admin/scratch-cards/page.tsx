"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Edit, Trash2, Gift, Copy, MoreVertical } from "lucide-react"
import { CreateScratchCardDialog } from "@/components/create-scratch-card-dialog"
import { EditScratchCardDialog } from "@/components/edit-scratch-card-dialog"
import { useToast } from "@/components/ui/use-toast"
import { apiRequest } from "@/lib/api"
import { Prize, ScratchCard } from "@/lib/types"

export default function ScratchCardsPage() {
  const [scratchCards, setScratchCards] = useState<ScratchCard[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [cardToEdit, setCardToEdit] = useState<ScratchCard | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchScratchCards()
  }, [])

  const fetchScratchCards = async () => {
    try {
      const data = await apiRequest("/scratch_cards")
      setScratchCards(data.data || [])
    } catch (error) {
      console.error("Failed to fetch scratch cards:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteScratchCard = async (cardId: string) => {
    if (!confirm("確定要刪除這張刮刮卡嗎？")) return

    try {
      await apiRequest(`/scratch_cards/${cardId}`, {
        method: "DELETE",
      })
      setScratchCards((cards) => cards.filter((card) => card.id !== cardId))
    } catch (error) {
      console.error("Failed to delete scratch card:", error)
    }
  }

  const getTotalProbability = (prizes: Prize[]) => {
    return prizes.reduce((sum, prize) => sum + prize.probability, 0)
  }

  const handleEditClick = (card: ScratchCard) => {
    setCardToEdit(card)
    setShowEditDialog(true)
  }

  const handleCopyUrl = (cardId: string) => {
    const url = `${window.location.origin}/scratch-cards/${cardId}`
    navigator.clipboard.writeText(url)
    toast({
      title: "連結已複製",
      description: "刮刮卡連結已成功複製到剪貼簿。",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入刮刮卡中...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center mb-6 sm:mb-8">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">刮刮卡管理</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">管理您的刮刮卡和獎品設定</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          新增刮刮卡
        </Button>
      </div>

      <div className="space-y-6">
        {scratchCards.map((card) => (
          <Card key={card.id} className="hover:shadow-lg transition-shadow relative">
            <div className="absolute top-4 right-4 z-10">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">開啟選單</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleCopyUrl(card.id)}>
                    <Copy className="h-4 w-4 mr-2" />
                    複製連結
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleEditClick(card)}>
                    <Edit className="h-4 w-4 mr-2" />
                    編輯
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => deleteScratchCard(card.id)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    刪除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <CardHeader>
              <div className="pr-8">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl break-words">
                  <Gift className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
                  <span className="break-all">{card.name}</span>
                </CardTitle>
                <CardDescription className="mt-2 text-sm break-words">
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                    <span>建立時間：{new Date(card.created_at).toLocaleDateString("zh-TW")}</span>
                    <span className="hidden sm:inline">|</span>
                    <span>獎品數量：{card.prizes.length}</span>
                    <span className="hidden sm:inline">|</span>
                    <span className="flex items-center gap-1">
                      總中獎率：
                      <Badge
                        variant={getTotalProbability(card.prizes) === 1 ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {(getTotalProbability(card.prizes) * 100).toFixed(1)}%
                      </Badge>
                    </span>
                  </div>
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-2 sm:p-4">
                <h4 className="font-medium mb-4 text-base sm:text-lg">獎品列表</h4>
                <div className="overflow-x-auto mobile-table-scroll">
                  <Table className="min-w-[600px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px] text-xs sm:text-sm">序號</TableHead>
                        <TableHead className="min-w-[120px] text-xs sm:text-sm">獎品名稱</TableHead>
                        <TableHead className="text-right min-w-[80px] text-xs sm:text-sm">獎品數量</TableHead>
                        <TableHead className="text-right min-w-[80px] text-xs sm:text-sm">中獎機率</TableHead>
                        <TableHead className="text-right min-w-[100px] text-xs sm:text-sm">預期中獎數</TableHead>
                      </TableRow>
                    </TableHeader>
                  <TableBody>
                    {card.prizes.map((prize, index) => (
                      <TableRow key={prize.id}>
                        <TableCell className="font-medium text-xs sm:text-sm">{index + 1}</TableCell>
                        <TableCell className="font-medium text-xs sm:text-sm">
                          <div className="truncate max-w-[120px] sm:max-w-none" title={prize.text}>
                            {prize.text}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary" className="text-xs">{prize.quantity}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="text-xs">{(prize.probability * 100).toFixed(2)}%</Badge>
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          <span className="hidden sm:inline">每1000次約{Math.round(prize.probability * 1000)}次</span>
                          <span className="sm:hidden">{Math.round(prize.probability * 1000)}/1k</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  </Table>
                </div>

                <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row sm:justify-between gap-2 sm:items-center">
                  <div className="text-xs sm:text-sm text-muted-foreground">總獎品數：{card.prizes.length} 個</div>
                  <div className="text-xs sm:text-sm">
                    <span className="text-muted-foreground">總中獎率：</span>
                    <Badge variant={getTotalProbability(card.prizes) === 1 ? "default" : "destructive"} className="text-xs">
                      {(getTotalProbability(card.prizes) * 100).toFixed(2)}%
                    </Badge>
                    {getTotalProbability(card.prizes) !== 1 && (
                      <span className="text-red-600 text-xs ml-2">⚠️ 建議總機率為100%</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {scratchCards.length === 0 && (
        <div className="text-center py-8 sm:py-12 px-4">
          <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">尚未建立任何刮刮卡</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4">建立您的第一張刮刮卡開始使用</p>
          <Button onClick={() => setShowCreateDialog(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            建立第一張刮刮卡
          </Button>
        </div>
      )}

      <CreateScratchCardDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={fetchScratchCards}
      />

      <EditScratchCardDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSuccess={fetchScratchCards}
        cardToEdit={cardToEdit}
      />
    </>
  )
}
