"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Infinity } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { apiRequest } from "@/lib/api"
import { Prize, ScratchCard } from "@/lib/types"

interface EditScratchCardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  cardToEdit: ScratchCard | null
}

export function EditScratchCardDialog({ open, onOpenChange, onSuccess, cardToEdit }: EditScratchCardDialogProps) {
  const [name, setName] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [newPrize, setNewPrize] = useState<Prize>({
    text: "",
    image: "",
    quantity: 0,
    probability: 0,
  })
  const [isUnlimitedQuantity, setIsUnlimitedQuantity] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (cardToEdit) {
      setName(cardToEdit.name)
      setPrizes(cardToEdit.prizes)
      
      // Convert ISO strings to datetime-local format in user's timezone
      if (cardToEdit.start_time) {
        const startDate = new Date(cardToEdit.start_time)
        const localStartTime = new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60000)
        setStartTime(localStartTime.toISOString().slice(0, 16))
      } else {
        setStartTime("")
      }
      
      if (cardToEdit.end_time) {
        const endDate = new Date(cardToEdit.end_time)
        const localEndTime = new Date(endDate.getTime() - endDate.getTimezoneOffset() * 60000)
        setEndTime(localEndTime.toISOString().slice(0, 16))
      } else {
        setEndTime("")
      }
    } else {
      // Reset form when dialog is closed or no card is being edited
      setName("")
      setStartTime("")
      setEndTime("")
      setPrizes([])
    }
  }, [cardToEdit])

  const addPrize = () => {
    const prizeQuantity = isUnlimitedQuantity ? null : newPrize.quantity
    if (newPrize.text && (isUnlimitedQuantity || newPrize.quantity > 0) && newPrize.probability >= 0 && newPrize.probability <= 1) {
      setPrizes([...prizes, { ...newPrize, quantity: prizeQuantity }])
      setNewPrize({ text: "", image: "", quantity: 0, probability: 0 })
      setIsUnlimitedQuantity(false)
    }
  }

  const removePrize = (index: number) => {
    setPrizes(prizes.filter((_, i) => i !== index))
  }

  const getTotalProbability = () => {
    return prizes.reduce((sum, prize) => sum + prize.probability, 0)
  }

  const handleSubmit = async () => {
    if (!name || prizes.length === 0 || !cardToEdit) return

    setLoading(true)
    try {
      const requestBody: any = {
        name,
        prizes,
      }
      
      if (startTime) {
        requestBody.start_time = new Date(startTime).toISOString()
      } else {
        requestBody.start_time = null
      }
      
      if (endTime) {
        requestBody.end_time = new Date(endTime).toISOString()
      } else {
        requestBody.end_time = null
      }
      
      await apiRequest(`/scratch_cards/${cardToEdit.id}`, {
        method: "PUT",
        body: JSON.stringify(requestBody),
      })

      onSuccess()
      onOpenChange(false)
      toast({
        title: "更新成功",
        description: "刮刮卡已成功更新"
      })
    } catch (error: any) {
      console.error("Failed to update scratch card:", error)
      toast({
        variant: "destructive",
        title: "更新失敗",
        description: error?.message || "更新刮刮卡失敗，請稍後再試"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle>編輯刮刮卡</DialogTitle>
          <DialogDescription>編輯刮刮卡名稱、獎品和中獎機率</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Card Name */}
          <div className="space-y-2">
            <Label htmlFor="name">刮刮卡名稱</Label>
            <Input id="name" placeholder="請輸入刮刮卡名稱..." value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          {/* Timing Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-time">開始時間 (選填)</Label>
              <Input
                id="start-time"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-time">結束時間 (選填)</Label>
              <Input
                id="end-time"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                min={startTime || undefined}
              />
            </div>
          </div>

          {/* Add Prize */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">新增獎品</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="prize-text">獎品名稱</Label>
                  <Input
                    id="prize-text"
                    placeholder="例如：免費咖啡"
                    value={newPrize.text}
                    onChange={(e) => setNewPrize({ ...newPrize, text: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prize-image">獎品圖片網址</Label>
                  <Input
                    id="prize-image"
                    placeholder="https://example.com/image.jpg (選填)"
                    value={newPrize.image || ""}
                    onChange={(e) => setNewPrize({ ...newPrize, image: e.target.value || null })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prize-quantity">數量</Label>
                  <div className="space-y-2">
                    <Input
                      id="prize-quantity"
                      type="number"
                      placeholder="0"
                      value={isUnlimitedQuantity ? "" : (newPrize.quantity || "")}
                      onChange={(e) => setNewPrize({ ...newPrize, quantity: Number(e.target.value) })}
                      disabled={isUnlimitedQuantity}
                    />
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="unlimited-quantity"
                        checked={isUnlimitedQuantity}
                        onCheckedChange={(checked) => {
                          setIsUnlimitedQuantity(checked as boolean)
                          if (checked) {
                            setNewPrize({ ...newPrize, quantity: 0 })
                          }
                        }}
                      />
                      <Label htmlFor="unlimited-quantity" className="text-sm flex items-center gap-1">
                        <Infinity className="h-3 w-3" />
                        無限數量
                      </Label>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prize-probability">中獎機率 (0-1)</Label>
                  <Input
                    id="prize-probability"
                    type="number"
                    step="0.001"
                    min="0"
                    max="1"
                    placeholder="0.1"
                    value={newPrize.probability || ""}
                    onChange={(e) => {
                      const value = Number(e.target.value)
                      if (value >= 0 && value <= 1) {
                        setNewPrize({ ...newPrize, probability: value })
                      }
                    }}
                  />
                </div>
              </div>
              <Button onClick={addPrize} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                新增獎品
              </Button>
            </CardContent>
          </Card>

          {/* Prizes List */}
          {prizes.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">獎品列表 ({prizes.length})</CardTitle>
                  <Badge variant={getTotalProbability() === 1 ? "default" : "destructive"}>
                    總機率: {(getTotalProbability() * 100).toFixed(2)}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto mobile-table-scroll">
                  <Table className="min-w-[500px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">序號</TableHead>
                        <TableHead>獎品名稱</TableHead>
                        <TableHead className="text-right">數量</TableHead>
                        <TableHead className="text-right">機率</TableHead>
                        <TableHead className="w-[80px]">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {prizes.map((prize, index) => (
                        <TableRow key={prize.id || index}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell className="font-medium">{prize.text}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="secondary">
                              {prize.quantity === null ? (
                                <span className="flex items-center gap-1">
                                  <Infinity className="h-3 w-3" />
                                  無限
                                </span>
                              ) : (
                                prize.quantity
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline">{(prize.probability * 100).toFixed(2)}%</Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removePrize(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {getTotalProbability() !== 1 && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ 建議總中獎機率為100% (1.0)，目前為 {(getTotalProbability() * 100).toFixed(2)}%
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={!name || prizes.length === 0 || loading} className="w-full sm:w-auto">
            {loading ? "儲存中..." : "儲存變更"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
