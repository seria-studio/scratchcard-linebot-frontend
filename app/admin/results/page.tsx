"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationEllipsis } from "@/components/ui/pagination"
import { Search, Calendar, Trophy, User as UserIcon, Gift, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { apiRequest } from "@/lib/api"
import { ScratchResult, PaginatedResponse } from "@/lib/types"

export default function ResultsPage() {
  const [results, setResults] = useState<ScratchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [totalResults, setTotalResults] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [filters, setFilters] = useState({
    user_id: "",
    scratch_card_id: "",
    scratch_card_name: "",
    prize_name: "",
  })

  const fetchResults = useCallback(async (page: number = currentPage, size: number = pageSize) => {
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
      params.append('page', page.toString())
      params.append('page_size', size.toString())

      const response = await apiRequest(`/results?${params.toString()}`)
      const paginatedData = response.data as PaginatedResponse<ScratchResult>

      setResults(paginatedData.items || [])
      setTotalResults(paginatedData.total)
      setTotalPages(paginatedData.total_pages)
      setCurrentPage(paginatedData.page)
      setPageSize(paginatedData.page_size)
    } catch (error) {
      console.error("Failed to fetch results:", error)
    } finally {
      setLoading(false)
    }
  }, [filters, currentPage, pageSize])

  useEffect(() => {
    fetchResults(1, 20)
  }, [])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSearch = () => {
    setCurrentPage(1)
    fetchResults(1, pageSize)
  }

  const handleClearFilters = () => {
    setFilters({ user_id: "", scratch_card_id: "", scratch_card_name: "", prize_name: "" })
    setCurrentPage(1)
    setTimeout(() => {
      fetchResults(1, pageSize)
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

      fetchResults(currentPage, pageSize)
    } catch (error) {
      console.error("Failed to delete result:", error)
      alert('刪除失敗，請稍後再試。')
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchResults(page, pageSize)
  }

  const handlePageSizeChange = (newPageSize: string) => {
    const size = parseInt(newPageSize)
    setPageSize(size)
    setCurrentPage(1)
    fetchResults(1, size)
  }

  const renderPaginationItems = () => {
    const items = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    if (startPage > 1) {
      items.push(
        <PaginationItem key="1">
          <PaginationLink
            href="#"
            onClick={(e) => { e.preventDefault(); handlePageChange(1) }}
            isActive={currentPage === 1}
            className="cursor-pointer"
          >
            1
          </PaginationLink>
        </PaginationItem>
      )
      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        )
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            href="#"
            onClick={(e) => { e.preventDefault(); handlePageChange(i) }}
            isActive={currentPage === i}
            className="cursor-pointer"
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      )
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>
        )
      }
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            href="#"
            onClick={(e) => { e.preventDefault(); handlePageChange(totalPages) }}
            isActive={currentPage === totalPages}
            className="cursor-pointer"
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      )
    }

    return items
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
            刮卡記錄
          </CardTitle>
          <CardDescription className="text-sm">
            顯示第 {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalResults)} 項，共 {totalResults} 筆記錄
          </CardDescription>
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-4 sm:px-6 py-4 border-t">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>每頁顯示</span>
                <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className="w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span>項目</span>
              </div>

              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) handlePageChange(currentPage - 1)
                      }}
                      className={cn(
                        "gap-1 pl-2.5",
                        currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
                      )}
                      size="default"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>上一頁</span>
                    </PaginationLink>
                  </PaginationItem>

                  {renderPaginationItems()}

                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) handlePageChange(currentPage + 1)
                      }}
                      className={cn(
                        "gap-1 pr-2.5",
                        currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"
                      )}
                      size="default"
                    >
                      <span>下一頁</span>
                      <ChevronRight className="h-4 w-4" />
                    </PaginationLink>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}
      </Card>
    </>
  )
}