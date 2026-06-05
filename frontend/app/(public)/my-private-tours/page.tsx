"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  Users,
  Clock,
  CheckCircle,
  CurrencyCircleDollar,
  WarningCircle,
  Wallet,
} from "@phosphor-icons/react";

interface Quote {
  _id: string;
  offeredPrice: number;
  message?: string;
  status: string;
  ownerId?: { name?: string; email?: string };
}

interface PrivateRequest {
  _id: string;
  estimatedPrice: number;
  numberOfParticipants: number;
  customerNotes?: string;
  status: string;
  createdAt: string;
  privateTourDetails?: {
    destinations?: { name: string; days: number; nights: number }[];
    startDate?: string;
    endDate?: string;
  };
  quotes?: Quote[];
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  open: { label: "Đang chờ báo giá", color: "text-amber-600 bg-amber-50" },
  accepted: { label: "Đã chọn báo giá", color: "text-sky-600 bg-sky-50" },
  paid: { label: "Đã thanh toán", color: "text-emerald-600 bg-emerald-50" },
  cancelled: { label: "Đã hủy", color: "text-red-500 bg-red-50" },
};

export default function MyPrivateToursPage() {
  const [requests, setRequests] = useState<PrivateRequest[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const apiUrl = () => process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api";

  const fetchRequests = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl()}/private-tour-requests/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchWallet = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl()}/wallets/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setWalletBalance(data.balance ?? 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchWallet();
  }, []);

  const formatVND = (n: number) => n.toLocaleString("vi-VN") + " VNĐ";

  const handleAcceptQuote = async (quoteId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    if (!window.confirm("Chấp nhận báo giá này? Các báo giá khác sẽ bị từ chối.")) return;
    setActionId(quoteId);
    try {
      const res = await fetch(`${apiUrl()}/private-tour-requests/quotes/${quoteId}/accept`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok) {
        alert(result.message || "Không thể chấp nhận báo giá.");
        return;
      }
      await fetchRequests();
    } finally {
      setActionId(null);
    }
  };

  const handlePay = async (requestId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setActionId(requestId);
    try {
      const res = await fetch(`${apiUrl()}/private-tour-requests/${requestId}/pay`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        alert(result.message || "Không thể thanh toán.");
        return;
      }
      const d = result.data;
      if (d.paidFully && d.redirectUrl) {
        window.location.href = d.redirectUrl;
        return;
      }
      if (d.paymentUrl) {
        const msg =
          d.walletUsed > 0
            ? `Đã trừ ${d.walletUsed.toLocaleString("vi-VN")} VNĐ từ ví. ` +
              `Chuyển PayOS để thanh toán phần còn lại ${d.payosAmount.toLocaleString("vi-VN")} VNĐ.`
            : undefined;
        if (msg) alert(msg);
        window.location.href = d.paymentUrl;
        return;
      }
      alert("Không thể tạo link thanh toán.");
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-10 px-6">
      <div className="max-w-[900px] mx-auto">
        <h1 className="text-[32px] font-bold text-[#1E293B] mb-2">
          Tour Cá Nhân <span className="text-[#38BDF8]">Của Tôi</span>
        </h1>
        <p className="text-gray-500 mb-4">
          Theo dõi yêu cầu tour, xem báo giá từ chủ tour và thanh toán khi đã chọn.
        </p>
        <div className="flex items-center gap-2 mb-8 px-4 py-3 bg-white rounded-xl border border-gray-100 w-fit">
          <Wallet size={20} className="text-[#38BDF8]" weight="fill" />
          <span className="text-sm text-gray-500">Số dư ví:</span>
          <span className="font-bold text-[#1E293B]">{formatVND(walletBalance)}</span>
          <Link href="/profile" className="text-[12px] text-[#38BDF8] font-bold ml-2 hover:underline">
            Xem ví →
          </Link>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
            <MapPin size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Chưa có yêu cầu nào</h3>
            <p className="text-gray-500 mb-6">Thiết kế tour cá nhân và gửi yêu cầu để nhận báo giá.</p>
            <Link
              href="/privateTour"
              className="inline-flex bg-[#38BDF8] text-white px-6 py-3 rounded-full font-bold"
            >
              Thiết kế tour ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map((req) => {
              const status = STATUS_MAP[req.status] || STATUS_MAP.open;
              const destNames =
                req.privateTourDetails?.destinations?.map((d) => d.name).join(" → ") || "Tour cá nhân";
              const pendingQuotes = req.quotes?.filter((q) => q.status === "pending") || [];

              return (
                <div key={req._id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className={`text-[12px] font-bold px-3 py-1 rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                    <span className="text-[12px] text-gray-400">
                      {new Date(req.createdAt).toLocaleString("vi-VN")}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-[#1E293B] flex items-center gap-2 mb-2">
                    <MapPin size={18} className="text-[#38BDF8]" /> {destNames}
                  </h3>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Users size={14} /> {req.numberOfParticipants} khách
                    </span>
                    <span className="flex items-center gap-1">
                      <CurrencyCircleDollar size={14} /> Giá gợi ý: {formatVND(req.estimatedPrice)}
                    </span>
                  </div>

                  {req.status === "open" && (
                    <div className="mb-4">
                      <h4 className="text-[13px] font-bold text-gray-400 uppercase mb-3">
                        Báo giá từ chủ tour ({pendingQuotes.length})
                      </h4>
                      {pendingQuotes.length === 0 ? (
                        <p className="text-sm text-gray-400 italic flex items-center gap-2">
                          <Clock size={16} /> Đang chờ chủ tour báo giá...
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {pendingQuotes.map((q) => (
                            <div
                              key={q._id}
                              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-sky-50 rounded-xl border border-sky-100"
                            >
                              <div>
                                <p className="font-bold text-[#1E293B]">
                                  {q.ownerId?.name || "Chủ tour"}
                                </p>
                                <p className="text-[#38BDF8] font-extrabold text-lg">
                                  {formatVND(q.offeredPrice)}
                                </p>
                                {q.message && (
                                  <p className="text-sm text-gray-500 mt-1">{q.message}</p>
                                )}
                              </div>
                              <button
                                onClick={() => handleAcceptQuote(q._id)}
                                disabled={actionId === q._id}
                                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-[13px] disabled:opacity-50"
                              >
                                Chấp nhận báo giá
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {req.status === "accepted" && (() => {
                    const acceptedPrice =
                      req.quotes?.find((q) => q.status === "accepted")?.offeredPrice ?? 0;
                    const fromWallet = Math.min(walletBalance, acceptedPrice);
                    const viaPayos = Math.max(0, acceptedPrice - fromWallet);
                    return (
                      <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl space-y-3">
                        <div className="flex items-center gap-2 text-amber-800 text-sm font-medium">
                          <WarningCircle size={18} weight="fill" />
                          Bạn đã chọn báo giá. Thanh toán sẽ ưu tiên trừ từ ví trước.
                        </div>
                        {acceptedPrice > 0 && (
                          <div className="text-[13px] text-gray-600 space-y-1 pl-1">
                            <p>Tổng thanh toán: <strong>{formatVND(acceptedPrice)}</strong></p>
                            <p>Trừ từ ví: <strong className="text-emerald-600">{formatVND(fromWallet)}</strong></p>
                            {viaPayos > 0 && (
                              <p>Qua PayOS: <strong className="text-[#38BDF8]">{formatVND(viaPayos)}</strong></p>
                            )}
                            {viaPayos === 0 && (
                              <p className="text-emerald-600 font-medium">Đủ số dư ví — không cần PayOS</p>
                            )}
                          </div>
                        )}
                        <button
                          onClick={() => handlePay(req._id)}
                          disabled={actionId === req._id}
                          className="px-6 py-3 bg-[#38BDF8] hover:bg-[#32AADB] text-white font-bold rounded-xl disabled:opacity-50"
                        >
                          {viaPayos === 0 ? "Thanh toán bằng ví" : "Thanh toán"}
                        </button>
                      </div>
                    );
                  })()}

                  {req.status === "paid" && (
                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                      <CheckCircle size={18} weight="fill" /> Đã thanh toán thành công
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
