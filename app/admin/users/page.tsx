"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Users, Shield, Activity, Trash2, UserCheck } from "lucide-react"
import { apiRequest } from "@/lib/api"

interface ScratchResult {
  id: string
  user_id: string
  scratch_card_id: string
  prize_id: string
  created_at: string
}

interface User {
  id: string
  is_admin: boolean
  created_at: string
  updated_at: string
  scratch_results: ScratchResult[]
  display_name: string | null
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [userIdSearch, setUserIdSearch] = useState("")
  const [displayNameSearch, setDisplayNameSearch] = useState("")

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
      // Refresh the user list
      fetchUsers(
        userIdSearch.trim() || undefined,
        displayNameSearch.trim() || undefined
      )
    } catch (error) {
      console.error("Failed to delete user:", error)
      alert("刪除用戶失敗，請稍後再試")
    }
  }

  const handleToggleAdmin = async (userId: string, currentAdminStatus: boolean) => {
    const action = currentAdminStatus ? "移除管理員權限" : "設為管理員"
    if (!confirm(`確定要${action}嗎？`)) {
      return
    }

    try {
      await apiRequest(`/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          is_admin: !currentAdminStatus
        })
      })
      // Refresh the user list
      fetchUsers(
        userIdSearch.trim() || undefined,
        displayNameSearch.trim() || undefined
      )
    } catch (error) {
      console.error("Failed to update user admin status:", error)
      alert("更新用戶權限失敗，請稍後再試")
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>搜尋用戶</CardTitle>
            <CardDescription>根據用戶ID或顯示名稱搜尋用戶</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
              <Button onClick={handleSearch} className="flex items-center gap-2 flex-1 sm:flex-none">
                <Search className="h-4 w-4" />
                搜尋
              </Button>
              <Button variant="outline" onClick={handleClearSearch} className="sm:w-auto">
                清除
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>所有用戶</CardTitle>
            <CardDescription>
              顯示 {users.length} 位用戶
            </CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 && !loading ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">找不到用戶</h3>
                <p className="text-gray-600">
                  {userIdSearch || displayNameSearch ? "請調整搜尋條件" : "尚未有用戶註冊"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[140px] text-xs sm:text-sm">用戶ID</TableHead>
                      <TableHead className="min-w-[120px] text-xs sm:text-sm">顯示名稱</TableHead>
                      <TableHead className="min-w-[80px] text-xs sm:text-sm">角色</TableHead>
                      <TableHead className="min-w-[80px] text-xs sm:text-sm">刮卡次數</TableHead>
                      <TableHead className="min-w-[100px] text-xs sm:text-sm">註冊時間</TableHead>
                      <TableHead className="min-w-[100px] text-xs sm:text-sm">最後活動</TableHead>
                      <TableHead className="min-w-[180px] text-xs sm:text-sm">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium text-xs sm:text-sm">
                          <div className="truncate" title={user.id}>
                            {user.id}
                          </div>
                        </TableCell>
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
                          <div className="flex gap-1 sm:gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleAdmin(user.id, user.is_admin)}
                              className="flex items-center gap-1 text-xs"
                            >
                              <UserCheck className="h-3 w-3" />
                              <span className="hidden sm:inline">{user.is_admin ? "移除管理員" : "設為管理員"}</span>
                              <span className="sm:hidden">{user.is_admin ? "移除" : "設管"}</span>
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                              className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
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
