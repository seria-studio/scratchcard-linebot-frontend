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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2 } from "lucide-react"
import { apiRequest } from "@/lib/api"

interface Prize {
  id?: string // Prize ID is optional for new prizes, but present for existing ones
  text: string
  image?: string
  quantity: number
  probability: number
}

interface ScratchCard {
  id: string
  name: string
  created_at: string
  updated_at: string
  prizes: Prize[]
  results: any[]
}

interface EditScratchCardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  cardToEdit: ScratchCard | null
}

export function EditScratchCardDialog({ open, onOpenChange, onSuccess, cardToEdit }: EditScratchCardDialogProps) {
  const [name, setName] = useState("")
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [newPrize, setNewPrize] = useState<Prize>({
    text: "",
    quantity: 0,
    probability: 0,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (cardToEdit) {
      setName(cardToEdit.name)
      setPrizes(cardToEdit.prizes)
    } else {
      // Reset form when dialog is closed or no card is being edited
      setName("")
      setPrizes([])
    }
  }, [cardToEdit])

  const addPrize = () => {
    if (newPrize.text && newPrize.quantity > 0 && newPrize.probability >= 0 && newPrize.probability <= 1) {
      setPrizes([...prizes, { ...newPrize }])
      setNewPrize({ text: "", quantity: 0, probability: 0 })
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
      await apiRequest(`/scratch_cards/${cardToEdit.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name,
          prizes,
        }),
      })

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to update scratch card:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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

          {/* Add Prize */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">新增獎品</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
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
                  <Label htmlFor="prize-quantity">數量</Label>
                  <Input
                    id="prize-quantity"
                    type="number"
                    placeholder="0"
                    value={newPrize.quantity || ""}
                    onChange={(e) => setNewPrize({ ...newPrize, quantity: Number(e.target.value) })}
                  />
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">序號</TableHead>
                      <TableHead>獎品名稱</TableHead>
                      <TableHead className="text-right">數量</TableHead>
                      <TableHead className="text-right">機率</TableHead>
                      <TableHead className="text-right">預期中獎</TableHead>
                      <TableHead className="w-[80px]">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prizes.map((prize, index) => (
                      <TableRow key={prize.id || index}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="font-medium">{prize.text}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary">{prize.quantity}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">{(prize.probability * 100).toFixed(2)}%</Badge>
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">
                          每1000次約{Math.round(prize.probability * 1000)}次
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

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={!name || prizes.length === 0 || loading}>
            {loading ? "儲存中..." : "儲存變更"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
