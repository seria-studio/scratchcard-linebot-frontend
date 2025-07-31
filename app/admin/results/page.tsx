"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Calendar, Trophy, User as UserIcon, Gift, Trash2 } from "lucide-react"
import { apiRequest } from "@/lib/api"
import { ScratchResult } from "@/lib/types"

export default function ResultsPage() {
  const [results, setResults] = useState<ScratchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    user_id: "",
    scratch_card_id: "",
    scratch_card_name: "",
    prize_name: "",
  })

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.user_id.trim()) {
        params.append('user_id', filters.user_id.trim())
      }
      if (filters.scratch_card_id.trim()) {
        params.append('scratch_card_id', filters.scratch_card_id.trim())
      }
      if (filters.scratch_card_name.trim()) {
        params.append('scratch_card_name', filters.scratch_card_name.trim())
      }
      if (filters.prize_name.trim()) {
        params.append('prize_name', filters.prize_name.trim())
      }

      const data = await apiRequest(`/results?${params.toString()}`)

      setResults(data.data || [])
    } catch (error) {
      console.error("Failed to fetch results:", error)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchResults()
  }, [fetchResults])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSearch = () => {
    fetchResults()
  }

  const handleClearFilters = () => {
    setFilters({ user_id: "", scratch_card_id: "", scratch_card_name: "", prize_name: "" })
    setTimeout(() => {
      fetchResults()
    }, 0)
  }

  const handleDelete = async (resultId: string) => {
    if (!confirm('確定要刪除這筆刮卡記錄嗎？此操作無法復原。')) {
      return
    }

    try {
      await apiRequest(`/results/${resultId}`, {
        method: 'DELETE'
      })

      setResults(prevResults => prevResults.filter(result => result.id !== resultId))
    } catch (error) {
      console.error("Failed to delete result:", error)
      alert('刪除失敗，請稍後再試。')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入刮卡結果中...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          刮卡結果
        </h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">查看所有用戶的刮卡歷史記錄</p>
      </div>

      {/* Filters */}
      <Card className="mb-4 sm:mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            篩選條件
          </CardTitle>
          <CardDescription className="text-sm">根據用戶ID、刮刮卡ID、刮刮卡名稱或獎品名稱篩選結果</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="user_id">用戶ID</Label>
              <Input
                id="user_id"
                placeholder="輸入用戶ID..."
                value={filters.user_id}
                onChange={(e) => handleFilterChange("user_id", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scratch_card_id">刮刮卡ID</Label>
              <Input
                id="scratch_card_id"
                placeholder="輸入刮刮卡ID..."
                value={filters.scratch_card_id}
                onChange={(e) => handleFilterChange("scratch_card_id", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scratch_card_name">刮刮卡名稱</Label>
              <Input
                id="scratch_card_name"
                placeholder="輸入刮刮卡名稱..."
                value={filters.scratch_card_name}
                onChange={(e) => handleFilterChange("scratch_card_name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prize_name">獎品名稱</Label>
              <Input
                id="prize_name"
                placeholder="輸入獎品名稱..."
                value={filters.prize_name}
                onChange={(e) => handleFilterChange("prize_name", e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
              <Search className="h-4 w-4" />
              搜尋
            </Button>
            <Button variant="outline" onClick={handleClearFilters} className="w-full sm:w-auto">
              清除篩選
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
            刮卡記錄 ({results.length} 筆)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 px-0 sm:px-6">
          {results.length === 0 ? (
            <div className="text-center py-12 px-4 sm:px-0">
              <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">沒有找到記錄</h3>
              <p className="text-gray-600">請調整篩選條件或確認資料是否存在</p>
            </div>
          ) : (
            <div className="overflow-x-auto mobile-table-scroll px-4 sm:px-0">
              <Table className="min-w-[700px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[140px] text-xs sm:text-sm">時間</TableHead>
                    <TableHead className="min-w-[120px] text-xs sm:text-sm">用戶</TableHead>
                    <TableHead className="min-w-[120px] text-xs sm:text-sm">刮刮卡</TableHead>
                    <TableHead className="min-w-[100px] text-xs sm:text-sm">獎品結果</TableHead>
                    <TableHead className="w-[60px] text-xs sm:text-sm">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell className="font-mono text-xs sm:text-sm">
                        {result.created_at ? new Date(result.created_at).toLocaleString("zh-TW", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        }) : "無效日期"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <UserIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-xs sm:text-sm truncate" title={result.user_id}>{result.user_id}</div>
                            <div className="text-xs text-gray-500 truncate" title={result.user.display_name || "未知用戶"}>{result.user.display_name || "未知"}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Gift className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-xs sm:text-sm truncate" title={result.scratch_card.name}>{result.scratch_card.name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {result.prize ? (
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 shrink-0" />
                            <span className="font-medium text-green-700 text-xs sm:text-sm truncate" title={result.prize.text}>{result.prize.text}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500 text-xs sm:text-sm">未中獎</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(result.id)}
                          className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}