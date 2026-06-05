"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  PaperPlaneTilt,
  Eye,
} from "@phosphor-icons/react";
import PrivateTourDetailModal, {
  type PrivateTourRequestDetail,
} from "@/app/components/PrivateTourDetailModal";

export default function OwnerPrivateToursPage() {
  const [requests, setRequests] = useState<PrivateTourRequestDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailRequest, setDetailRequest] = useState<PrivateTourRequestDetail | null>(null);
  const [quoteForms, setQuoteForms] = useState<Record<string, { price: string; message: string }>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [myUserId, setMyUserId] = useState<string>("");

  const apiUrl = () => process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api";

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setMyUserId(user.id || user._id || "");
    }
  }, []);

  const fetchRequests = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`${apiUrl()}/private-tour-requests/owner/all`, {
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

  useEffect(() => {
    fetchRequests();
  }, []);

  const formatVND = (n: number) => n.toLocaleString("vi-VN") + " VNĐ";

  const handleSubmitQuote = async (requestId: string) => {
    const token = localStorage.getItem("token");
    const form = quoteForms[requestId];
    if (!token || !form?.price) {
      alert("Vui lòng nhập giá báo.");
      return;
    }

    setSubmitting(requestId);
    try {
      const res = await fetch(`${apiUrl()}/private-tour-requests/${requestId}/quotes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          offeredPrice: Number(form.price.replace(/\D/g, "")),
          message: form.message || undefined,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        alert(result.message || "Không thể gửi báo giá.");
        return;
      }
      alert("Đã gửi báo giá cho khách hàng!");
      await fetchRequests();
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const openRequests = requests.filter((r) => r.status === "open");

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="mb-10">
        <h1 className="text-[32px] font-bold text-[#1E293B] mb-2">Tour Cá Nhân</h1>
        <p className="text-gray-500 font-medium">
          Xem yêu cầu từ khách hàng và gửi báo giá. Khách sẽ chọn báo giá phù hợp trước khi thanh toán.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <p className="text-[12px] text-gray-400 font-bold uppercase">Chờ báo giá</p>
          <p className="text-2xl font-black text-amber-500">{openRequests.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <p className="text-[12px] text-gray-400 font-bold uppercase">Tổng yêu cầu</p>
          <p className="text-2xl font-black text-[#1E293B]">{requests.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <p className="text-[12px] text-gray-400 font-bold uppercase">Phí sàn</p>
          <p className="text-2xl font-black text-[#38BDF8]">10%</p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-[32px] p-12 text-center border border-gray-100">
          <MapPin size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Chưa có yêu cầu tour cá nhân</h3>
          <p className="text-gray-500">Khi khách gửi yêu cầu, bạn sẽ thấy tại đây.</p>
        </div>
      ) : (
        <div className="grid gap-5">
          {requests.map((req) => {
            const details = req.privateTourDetails;
            const destNames = details?.destinations?.map((d) => d.name).join(" → ") || "—";
            const myQuote = req.quotes?.find((q) => {
              const oid = typeof q.ownerId === "object" ? (q.ownerId as { _id?: string })?._id : q.ownerId;
              return oid?.toString() === myUserId;
            });

            return (
              <div key={req._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase ${
                        req.status === "open" ? "bg-amber-50 text-amber-600" :
                        req.status === "paid" ? "bg-emerald-50 text-emerald-600" :
                        "bg-gray-100 text-gray-500"
                      }`}>
                        {req.status === "open" ? "Chờ báo giá" : req.status === "paid" ? "Đã thanh toán" : req.status}
                      </span>

                      <h3 className="font-bold text-lg mt-2 mb-1">{destNames}</h3>
                      <p className="text-sm text-gray-500">
                        Khách: {req.customerId?.name || "—"} · {req.numberOfParticipants} người
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Giá gợi ý khách: <span className="font-bold text-[#38BDF8]">{formatVND(req.estimatedPrice)}</span>
                      </p>
                      {myQuote && (
                        <p className="text-sm text-emerald-600 font-medium mt-2">
                          Báo giá của bạn: {formatVND(myQuote.offeredPrice)} ({myQuote.status})
                        </p>
                      )}
                    </div>

                    {req.status === "open" && (
                      <div className="w-full lg:w-[320px] bg-sky-50 rounded-xl p-4 border border-sky-100">
                        <h4 className="font-bold text-[13px] text-[#1E293B] mb-3">Gửi báo giá</h4>
                        <input
                          type="text"
                          placeholder="Giá báo (VNĐ)"
                          value={quoteForms[req._id]?.price || ""}
                          onChange={(e) =>
                            setQuoteForms((prev) => ({
                              ...prev,
                              [req._id]: { ...prev[req._id], price: e.target.value, message: prev[req._id]?.message || "" },
                            }))
                          }
                          className="w-full mb-2 px-3 py-2 rounded-lg border border-sky-200 text-sm"
                        />
                        <textarea
                          placeholder="Lời nhắn (tuỳ chọn)"
                          rows={2}
                          value={quoteForms[req._id]?.message || ""}
                          onChange={(e) =>
                            setQuoteForms((prev) => ({
                              ...prev,
                              [req._id]: { price: prev[req._id]?.price || "", message: e.target.value },
                            }))
                          }
                          className="w-full mb-3 px-3 py-2 rounded-lg border border-sky-200 text-sm resize-none"
                        />
                        <button
                          onClick={() => handleSubmitQuote(req._id)}
                          disabled={submitting === req._id}
                          className="w-full flex items-center justify-center gap-2 bg-[#38BDF8] hover:bg-[#32AADB] text-white font-bold py-2.5 rounded-lg text-[13px] disabled:opacity-50"
                        >
                          <PaperPlaneTilt size={16} weight="fill" />
                          Gửi báo giá
                        </button>
                        <p className="text-[10px] text-gray-400 mt-2 text-center">
                          Bạn nhận 90% vào ví sau khi khách thanh toán
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setDetailRequest(req)}
                    className="mt-4 flex items-center gap-2 text-[#38BDF8] hover:text-[#32AADB] text-[13px] font-bold transition-colors"
                  >
                    <Eye size={16} weight="fill" />
                    Xem chi tiết tour khách mong muốn
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <PrivateTourDetailModal
        request={detailRequest}
        myUserId={myUserId}
        onClose={() => setDetailRequest(null)}
      />
    </div>
  );
}
