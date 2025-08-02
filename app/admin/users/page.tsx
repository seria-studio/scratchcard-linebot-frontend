"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { Search, Users, Shield, Activity, Trash2, UserCheck, MoreVertical, Copy } from "lucide-react"
import { apiRequest } from "@/lib/api"
import { User } from "@/lib/types"

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [userIdSearch, setUserIdSearch] = useState("")
  const [displayNameSearch, setDisplayNameSearch] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async (userId?: string, displayName?: string) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (userId) params.append("user_id", userId)
      if (displayName) params.append("display_name", displayName)
      
      const url = `/users${params.toString() ? `?${params.toString()}` : ""}`
      const data = await apiRequest(url)
      setUsers(data.data || [])
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchUsers(
      userIdSearch.trim() || undefined,
      displayNameSearch.trim() || undefined
    )
  }

  const handleClearSearch = () => {
    setUserIdSearch("")
    setDisplayNameSearch("")
    fetchUsers()
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("確定要刪除這個用戶嗎？此操作無法復原。")) {
      return
    }

    try {
      await apiRequest(`/users/${userId}`, {
        method: "DELETE"
      })
      toast({
        title: "成功",
        description: "用戶已刪除"
      })
      fetchUsers(
        userIdSearch.trim() || undefined,
        displayNameSearch.trim() || undefined
      )
    } catch (error) {
      console.error("Failed to delete user:", error)
      toast({
        title: "錯誤",
        description: "刪除用戶失敗，請稍後再試",
        variant: "destructive"
      })
    }
  }

  const handleRemoveAdmin = async (userId: string) => {
    if (!confirm("確定要移除管理員權限嗎？")) {
      return
    }

    try {
      await apiRequest(`/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          is_admin: false
        })
      })
      toast({
        title: "成功",
        description: "已移除管理員權限"
      })
      fetchUsers(
        userIdSearch.trim() || undefined,
        displayNameSearch.trim() || undefined
      )
    } catch (error) {
      console.error("Failed to remove admin status:", error)
      toast({
        title: "錯誤",
        description: "移除管理員權限失敗，請稍後再試",
        variant: "destructive"
      })
    }
  }

  const handleCopyUserId = async (userId: string) => {
    try {
      await navigator.clipboard.writeText(userId)
      toast({
        title: "成功",
        description: "用戶ID已複製到剪貼板"
      })
    } catch (error) {
      console.error("Failed to copy user ID:", error)
      toast({
        title: "錯誤",
        description: "複製失敗，請手動複製",
        variant: "destructive"
      })
    }
  }

  const totalUsers = users.length
  const adminUsers = users.filter((user) => user.is_admin).length
  const activeUsers = users.filter((user) => user.scratch_results.length > 0).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入用戶資料中...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">用戶管理</h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">管理用戶並查看他們的活動記錄</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總用戶數</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">管理員用戶</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活躍用戶</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers}</div>
          </CardContent>
        </Card>
      </div>

        {/* Search */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-base sm:text-lg">搜尋用戶</CardTitle>
            <CardDescription className="text-sm">根據用戶ID或顯示名稱搜尋用戶</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="user_id">用戶ID</Label>
                <Input
                  id="user_id"
                  placeholder="輸入用戶ID搜尋..."
                  value={userIdSearch}
                  onChange={(e) => setUserIdSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="display_name">顯示名稱</Label>
                <Input
                  id="display_name"
                  placeholder="輸入顯示名稱搜尋..."
                  value={displayNameSearch}
                  onChange={(e) => setDisplayNameSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
                <Search className="h-4 w-4" />
                搜尋
              </Button>
              <Button variant="outline" onClick={handleClearSearch} className="w-full sm:w-auto">
                清除
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base sm:text-lg">所有用戶</CardTitle>
            <CardDescription className="text-sm">
              顯示 {users.length} 位用戶
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0 px-0 sm:px-6">
            {users.length === 0 && !loading ? (
              <div className="text-center py-12 px-4 sm:px-0">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">找不到用戶</h3>
                <p className="text-gray-600">
                  {userIdSearch || displayNameSearch ? "請調整搜尋條件" : "尚未有用戶註冊"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto mobile-table-scroll px-4 sm:px-0">
                <Table className="min-w-[600px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[120px] text-xs sm:text-sm">顯示名稱</TableHead>
                      <TableHead className="min-w-[80px] text-xs sm:text-sm">角色</TableHead>
                      <TableHead className="min-w-[80px] text-xs sm:text-sm">刮卡次數</TableHead>
                      <TableHead className="min-w-[100px] text-xs sm:text-sm">註冊時間</TableHead>
                      <TableHead className="min-w-[100px] text-xs sm:text-sm">最後活動</TableHead>
                      <TableHead className="min-w-[80px] text-xs sm:text-sm">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="text-xs sm:text-sm">
                          <div className="truncate" title={user.display_name || "未設定"}>
                            {user.display_name || "未設定"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.is_admin ? "default" : "secondary"} className="text-xs">
                            {user.is_admin ? "管理員" : "一般用戶"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{user.scratch_results.length} 次</Badge>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {new Date(user.created_at).toLocaleDateString("zh-TW")}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {user.scratch_results.length > 0
                            ? new Date(user.scratch_results[0].created_at).toLocaleDateString("zh-TW")
                            : "無活動"}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {user.is_admin && (
                                <DropdownMenuItem
                                  onClick={() => handleRemoveAdmin(user.id)}
                                  className="text-orange-600"
                                >
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  移除管理員
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleCopyUserId(user.id)}>
                                <Copy className="mr-2 h-4 w-4" />
                                複製用戶ID
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                刪除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
