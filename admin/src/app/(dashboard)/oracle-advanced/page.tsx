"use client";

import React, { useState } from "react";
import api from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Database, LineChart, TableProperties, Zap, Activity } from "lucide-react";

export default function OracleAdvancedPage() {
  const [viewData, setViewData] = useState<any[]>([]);
  const [funcId, setFuncId] = useState("");
  const [funcResult, setFuncResult] = useState<any>(null);
  const [procDate, setProcDate] = useState("");
  const [procData, setProcData] = useState<any[]>([]);
  const [triggerRes, setTriggerRes] = useState<any>(null);
  const [pkgLimit, setPkgLimit] = useState("5");
  const [pkgData, setPkgData] = useState<any[]>([]);
  const [logData, setLogData] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  const fetchView = async () => {
    try {
      setLoading(true);
      const res = await api.get("/oracle-advanced/ticket-details-view");
      setViewData(res.data || []);
    } catch (e) {
      console.error(e);
      alert("Lỗi khi gọi View");
    } finally {
      setLoading(false);
    }
  };

  const fetchFunc = async () => {
    if (!funcId) return;
    try {
      setLoading(true);
      const res = await api.get(`/oracle-advanced/revenue-by-user/${funcId}`);
      setFuncResult(res.data);
    } catch (e) {
      console.error(e);
      alert("Lỗi khi gọi Function");
    } finally {
      setLoading(false);
    }
  };

  const fetchProc = async () => {
    if (!procDate) return;
    try {
      setLoading(true);
      const res = await api.get(`/oracle-advanced/tickets-by-date?date=${procDate}`);
      setProcData(res.data || []);
    } catch (e) {
      console.error(e);
      alert("Lỗi khi gọi Procedure");
    } finally {
      setLoading(false);
    }
  };

  const testTrigger = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/oracle-advanced/trigger-simulate`);
      setTriggerRes(res.data);
    } catch (e: any) {
      setTriggerRes({ error: e.response?.data?.message || e.message });
    } finally {
      setLoading(false);
    }
  };

  const fetchPackage = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/oracle-advanced/recent-bookings?limit=${pkgLimit}`);
      setPkgData(res.data || []);
      // Sau khi gọi lấy vé, gọi luôn xem action log
      const resLogs = await api.get(`/oracle-advanced/action-logs`);
      setLogData(resLogs.data || []);
    } catch (e) {
      console.error(e);
      alert("Lỗi khi gọi Package");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Database className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Oracle DB Nâng Cao</h1>
      </div>
      <p className="text-muted-foreground">
        Trang này dùng để showcase các tính năng kỹ thuật nâng cao của Oracle DB (View, Function,
        Procedure, Trigger, Package, Sequence).
      </p>

      <Tabs defaultValue="view" className="w-full">
        <TabsList className="grid grid-cols-5 h-auto">
          <TabsTrigger value="view" className="py-3 px-2 flex-col gap-2">
            <TableProperties className="w-5 h-5" />
            <span>1. View (Chi Tiết)</span>
          </TabsTrigger>
          <TabsTrigger value="func" className="py-3 px-2 flex-col gap-2">
            <LineChart className="w-5 h-5" />
            <span>2. Function (Doanh Thu)</span>
          </TabsTrigger>
          <TabsTrigger value="proc" className="py-3 px-2 flex-col gap-2">
            <Activity className="w-5 h-5" />
            <span>3. Procedure (Theo Ngày)</span>
          </TabsTrigger>
          <TabsTrigger value="trigger" className="py-3 px-2 flex-col gap-2">
            <Zap className="w-5 h-5" />
            <span>4. Trigger (Lỗi 20001)</span>
          </TabsTrigger>
          <TabsTrigger value="package" className="py-3 px-2 flex-col gap-2">
            <Database className="w-5 h-5" />
            <span>5. Package & Ngầm định</span>
          </TabsTrigger>
        </TabsList>

        {/* 1. VIEW */}
        <TabsContent value="view" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>V_TICKET_DETAILS</CardTitle>
              <CardDescription>View làm ẩn đi sự phức tạp của 5 bảng join (Ticket, User, Seat, Schedule, Route).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={fetchView} disabled={loading}>Thực thi gọi View</Button>
              {viewData.length > 0 && (
                <div className="rounded-md border p-1 overflow-x-auto max-h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mã Vé</TableHead>
                        <TableHead>Tên KH</TableHead>
                        <TableHead>Điện Thoại</TableHead>
                        <TableHead>Điểm Đi</TableHead>
                        <TableHead>Điểm Đến</TableHead>
                        <TableHead>Số Ghế</TableHead>
                        <TableHead>Giờ KH</TableHead>
                        <TableHead>Tổng Tiền</TableHead>
                        <TableHead>Trạng Thái</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewData.map((r, i) => (
                        <TableRow key={i}>
                          <TableCell>{r.MAVE}</TableCell>
                          <TableCell>{r.TENKH}</TableCell>
                          <TableCell>{r.DIENTHOAI}</TableCell>
                          <TableCell>{r.DIEMDI}</TableCell>
                          <TableCell>{r.DIEMDEN}</TableCell>
                          <TableCell>{r.SOGHE}</TableCell>
                          <TableCell>{String(r.THOIGIANKHOIHANH)}</TableCell>
                          <TableCell>{r.TONGTIEN?.toLocaleString()} đ</TableCell>
                          <TableCell>{r.TRANGTHAI}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. FUNCTION */}
        <TabsContent value="func" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>F_REVENUE_BY_USER(id)</CardTitle>
              <CardDescription>Trả về một giá trị duy nhất: Tổng tiền một hành khách đã tiêu.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-center max-w-md">
                <Input placeholder="Nhập ID khách hàng (VD: 1, 2)" value={funcId} onChange={e => setFuncId(e.target.value)} type="number" />
                <Button onClick={fetchFunc} disabled={loading}>Tính Doanh Thu</Button>
              </div>
              {funcResult && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900 border border-green-200 rounded-lg">
                  Kết quả cho Khách hàng ID [{funcResult.userId}]: <strong className="text-xl ml-2">{funcResult.totalRevenue?.toLocaleString()} VNĐ</strong>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. PROCEDURE */}
        <TabsContent value="proc" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>P_TICKETS_BY_DATE(ds OUT SYS_REFCURSOR, date IN)</CardTitle>
              <CardDescription>Trả về danh sách dữ liệu qua con trỏ Cursor, sử dụng PL/SQL ẩn danh để gọi từ ORM.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-center max-w-md">
                <Input placeholder="YYYY-MM-DD" value={procDate} onChange={e => setProcDate(e.target.value)} type="date" />
                <Button onClick={fetchProc} disabled={loading}>Truy vấn</Button>
              </div>
              {procData.length > 0 && (
                <div className="rounded-md border p-1 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên KH</TableHead>
                        <TableHead>Điện Thoại</TableHead>
                        <TableHead>Số Ghế</TableHead>
                        <TableHead>Ngày Đi</TableHead>
                        <TableHead>Tổng Tiền</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {procData.map((r, i) => (
                        <TableRow key={i}>
                          <TableCell>{r.TENKH}</TableCell>
                          <TableCell>{r.DIENTHOAI}</TableCell>
                          <TableCell>{r.SOGHE}</TableCell>
                          <TableCell>{String(r.NGAYDI)}</TableCell>
                          <TableCell>{r.TONGTIEN?.toLocaleString()} đ</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              {procData.length === 0 && procDate !== "" && !loading && (
                 <p className="text-sm text-gray-500">Chưa có dữ liệu hoặc chọn sai định dạng, thử bấm truy vấn với ngày phù hợp.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. TRIGGER */}
        <TabsContent value="trigger" className="mt-6">
          <Card border-destructive>
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2"><Zap /> TRG_CHECK_SEAT_CONCURRENCY</CardTitle>
              <CardDescription>Xử lý giao dịch chặn Mutating Table, bung lỗi ORA-20001 nếu cùng lúc 2 yêu cầu Insert Ticket chung 1 ID Ghế/Lịch Trình.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <p className="text-sm">
                 Tính năng này hoạt động TỰ ĐỘNG ở lớp Database. Bất kỳ lúc nào logic web đẩy Insert Ticket xuống, 
                 Database tự check count và reject ngay tức thì nếu ghế đã sở hữu bởi ai đó.
               </p>
               <Button variant="outline" onClick={testTrigger} disabled={loading}>Xem Thông điệp Hệ thống</Button>
               {triggerRes && (
                 <pre className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-md text-sm whitespace-pre-wrap text-red-500 font-mono">
                   {JSON.stringify(triggerRes, null, 2)}
                 </pre>
               )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. PACKAGE & SEQUENCE */}
        <TabsContent value="package" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>PKG_BUSTICKET_UTILS & SEQ_LOG_ID & ACTION_LOG</CardTitle>
              <CardDescription>Dùng Package đóng gói Procedure, dùng Sequence để đếm ID tự động (Row Generator).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-center max-w-md">
                <Input placeholder="Giới hạn số vé (VD: 5)" value={pkgLimit} onChange={e => setPkgLimit(e.target.value)} type="number" />
                <Button onClick={fetchPackage} disabled={loading}>Lấy Vé Sát Sườn (ROWNUM)</Button>
              </div>
              
              {pkgData.length > 0 && (
                <div className="mt-4 space-y-2">
                   <h3 className="font-semibold text-lg flex items-center gap-2 mt-4 text-blue-600">
                     Top {pkgLimit} Vé Mới Đặt Nhất:
                   </h3>
                  <div className="rounded-md border p-1 overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mã Vé</TableHead>
                          <TableHead>Tên KH</TableHead>
                          <TableHead>Tổng Tiền</TableHead>
                          <TableHead>Trạng Thái</TableHead>
                          <TableHead>Ngày Đặt</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pkgData.map((r, i) => (
                          <TableRow key={i}>
                            <TableCell>{r.MAVE}</TableCell>
                            <TableCell>{r.TENKH}</TableCell>
                            <TableCell>{r.TONGTIEN?.toLocaleString()} đ</TableCell>
                            <TableCell>{r.TRANGTHAI}</TableCell>
                            <TableCell>{String(r.NGAYDAT)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {logData.length > 0 && (
                 <div className="mt-8 space-y-2">
                   <h3 className="font-semibold text-lg flex items-center gap-2 mt-4 text-purple-600">
                     Nhật ký hệ thống ngầm định sinh bởi DB (ActionLog):
                   </h3>
                   <div className="rounded-md border p-1 overflow-y-auto max-h-[300px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID (Từ SEQ_LOG_ID)</TableHead>
                          <TableHead>Hành Động</TableHead>
                          <TableHead>User ID</TableHead>
                          <TableHead>Thời Gian</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {logData.map((r, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-bold">{r.id}</TableCell>
                            <TableCell>{r.action_name}</TableCell>
                            <TableCell className="font-mono text-gray-600">{r.user_id ? `ID: ${r.user_id}` : 'N/A'}</TableCell>
                            <TableCell>{String(r.log_time)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                   </div>
                 </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
