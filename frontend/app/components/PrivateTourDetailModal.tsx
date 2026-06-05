"use client";

import { useEffect } from "react";
import {
  X,
  MapPin,
  Users,
  CalendarBlank,
  CurrencyCircleDollar,
  NotePencil,
  Clock,
  Path,
  EnvelopeSimple,
  User,
} from "@phosphor-icons/react";

export interface PrivateTourActivity {
  name: string;
  address?: string;
  price?: number;
  day: number;
  time: string;
}

export interface PrivateTourDestination {
  id?: string;
  name: string;
  days: number;
  nights: number;
}

export interface PrivateTourRequestDetail {
  _id: string;
  estimatedPrice: number;
  numberOfParticipants: number;
  customerNotes?: string;
  status: string;
  createdAt: string;
  privateTourDetails?: {
    destinations?: PrivateTourDestination[];
    startDate?: string | null;
    endDate?: string | null;
    activities?: PrivateTourActivity[];
  };
  customerId?: { name?: string; email?: string };
  quotes?: { _id: string; ownerId: string | { _id?: string }; offeredPrice: number; status: string; message?: string }[];
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  open: { label: "Chờ báo giá", className: "bg-amber-50 text-amber-600" },
  accepted: { label: "Đã chọn báo giá", className: "bg-sky-50 text-sky-600" },
  paid: { label: "Đã thanh toán", className: "bg-emerald-50 text-emerald-600" },
  cancelled: { label: "Đã hủy", className: "bg-red-50 text-red-500" },
};

function formatVND(n: number) {
  return n.toLocaleString("vi-VN") + " VNĐ";
}

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface Props {
  request: PrivateTourRequestDetail | null;
  myUserId?: string;
  onClose: () => void;
}

export default function PrivateTourDetailModal({ request, myUserId, onClose }: Props) {
  useEffect(() => {
    if (!request) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [request, onClose]);

  if (!request) return null;

  const details = request.privateTourDetails;
  const destinations = details?.destinations ?? [];
  const activities = [...(details?.activities ?? [])].sort((a, b) => {
    if (a.day !== b.day) return a.day - b.day;
    return a.time.localeCompare(b.time);
  });
  const activitiesByDay = activities.reduce<Record<number, PrivateTourActivity[]>>((acc, act) => {
    if (!acc[act.day]) acc[act.day] = [];
    acc[act.day].push(act);
    return acc;
  }, {});

  const routeTitle =
    destinations.map((d) => d.name).join(" → ") || "Tour cá nhân";

  const status = STATUS_LABELS[request.status] ?? {
    label: request.status,
    className: "bg-gray-100 text-gray-500",
  };

  const myQuote = request.quotes?.find((q) => {
    const oid = typeof q.ownerId === "object" ? q.ownerId?._id : q.ownerId;
    return oid?.toString() === myUserId;
  });

  const totalActivityPrice = activities.reduce((sum, a) => sum + (a.price ?? 0), 0);
  const totalDays = destinations.reduce((sum, d) => sum + d.days, 0);
  const totalNights = destinations.reduce((sum, d) => sum + d.nights, 0);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="private-tour-detail-title"
        className="relative w-full max-w-2xl max-h-[92vh] bg-white rounded-[28px] shadow-2xl flex flex-col overflow-hidden animate-fade-in"
      >
        {/* Header */}
        <div className="shrink-0 bg-gradient-to-r from-[#E0F2FE] to-white px-6 py-5 border-b border-sky-100">
          <div className="flex items-start justify-between gap-4 pr-8">
            <div className="min-w-0">
              <span className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full uppercase mb-2 ${status.className}`}>
                {status.label}
              </span>
              <h2 id="private-tour-detail-title" className="font-bold text-xl text-[#1E293B] leading-snug">
                {routeTitle}
              </h2>
              <p className="text-[13px] text-gray-500 mt-1 flex items-center gap-1.5">
                <Clock size={14} />
                Gửi lúc {formatDateTime(request.createdAt)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-md text-gray-500 hover:text-gray-800 transition-all"
            aria-label="Đóng"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Khách hàng */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoCard icon={<User size={18} className="text-[#38BDF8]" weight="fill" />} label="Khách hàng">
              {request.customerId?.name || "—"}
            </InfoCard>
            <InfoCard icon={<EnvelopeSimple size={18} className="text-[#38BDF8]" />} label="Email">
              <span className="break-all">{request.customerId?.email || "—"}</span>
            </InfoCard>
            <InfoCard icon={<Users size={18} className="text-[#38BDF8]" weight="fill" />} label="Số khách">
              {request.numberOfParticipants} người
            </InfoCard>
            <InfoCard icon={<CurrencyCircleDollar size={18} className="text-[#38BDF8]" weight="fill" />} label="Giá gợi ý">
              <span className="text-[#38BDF8] font-extrabold">{formatVND(request.estimatedPrice)}</span>
            </InfoCard>
          </section>

          {/* Thời gian */}
          <section className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
              <CalendarBlank size={16} className="text-[#38BDF8]" />
              Thời gian tour
            </h3>
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <p className="text-gray-400 text-[11px] font-bold uppercase">Bắt đầu</p>
                <p className="font-semibold text-[#1E293B]">{formatDate(details?.startDate)}</p>
              </div>
              <div className="hidden sm:block text-gray-300 self-end pb-1">→</div>
              <div>
                <p className="text-gray-400 text-[11px] font-bold uppercase">Kết thúc</p>
                <p className="font-semibold text-[#1E293B]">{formatDate(details?.endDate)}</p>
              </div>
              {(totalDays > 0 || totalNights > 0) && (
                <div className="sm:ml-auto">
                  <p className="text-gray-400 text-[11px] font-bold uppercase">Tổng thời lượng</p>
                  <p className="font-semibold text-[#1E293B]">
                    {totalDays} ngày · {totalNights} đêm
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Lộ trình */}
          {destinations.length > 0 && (
            <section>
              <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Path size={16} className="text-[#38BDF8]" weight="fill" />
                Lộ trình ({destinations.length} điểm đến)
              </h3>
              <div className="space-y-2">
                {destinations.map((dest, idx) => (
                  <div
                    key={dest.id ?? idx}
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#38BDF8]/10 text-[#38BDF8] font-black text-sm flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#1E293B] truncate">{dest.name}</p>
                      <p className="text-[12px] text-gray-400">
                        {dest.days} ngày · {dest.nights} đêm
                      </p>
                    </div>
                    {idx < destinations.length - 1 && (
                      <MapPin size={16} className="text-gray-300 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Hoạt động */}
          {activities.length > 0 && (
            <section>
              <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-wide mb-3">
                Lịch hoạt động ({activities.length})
              </h3>
              <div className="space-y-4">
                {Object.keys(activitiesByDay)
                  .map(Number)
                  .sort((a, b) => a - b)
                  .map((day) => (
                    <div key={day}>
                      <p className="text-[13px] font-bold text-[#38BDF8] mb-2">Ngày {day}</p>
                      <div className="space-y-2 pl-1">
                        {activitiesByDay[day].map((act, i) => (
                          <div
                            key={`${day}-${act.time}-${i}`}
                            className="flex gap-3 p-3 rounded-xl bg-sky-50/60 border border-sky-100"
                          >
                            <span className="text-[12px] font-bold text-gray-500 w-12 shrink-0 pt-0.5">
                              {act.time}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-[#1E293B] text-sm">{act.name}</p>
                              {act.address && (
                                <p className="text-[12px] text-gray-400 mt-0.5 truncate">{act.address}</p>
                              )}
                            </div>
                            {act.price != null && act.price > 0 && (
                              <span className="text-[12px] font-bold text-gray-500 shrink-0">
                                {formatVND(act.price)}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
              {totalActivityPrice > 0 && (
                <p className="text-[12px] text-gray-400 mt-3 text-right">
                  Tổng giá hoạt động tham khảo:{" "}
                  <span className="font-bold text-[#1E293B]">{formatVND(totalActivityPrice)}</span>
                </p>
              )}
            </section>
          )}

          {/* Ghi chú khách */}
          {request.customerNotes && (
            <section className="bg-amber-50/60 rounded-2xl p-4 border border-amber-100">
              <h3 className="text-[12px] font-bold text-amber-700 uppercase tracking-wide mb-2 flex items-center gap-2">
                <NotePencil size={16} />
                Yêu cầu / ghi chú từ khách
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {request.customerNotes}
              </p>
            </section>
          )}

          {/* Báo giá của owner */}
          {myQuote && (
            <section className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
              <h3 className="text-[12px] font-bold text-emerald-700 uppercase tracking-wide mb-2">
                Báo giá của bạn
              </h3>
              <p className="text-lg font-extrabold text-emerald-600">{formatVND(myQuote.offeredPrice)}</p>
              {myQuote.message && (
                <p className="text-sm text-gray-600 mt-2">{myQuote.message}</p>
              )}
              <p className="text-[11px] text-gray-400 mt-2">Trạng thái: {myQuote.status}</p>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-4 border-t border-gray-100 bg-gray-50/80">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-[#1E293B] hover:bg-slate-700 text-white font-bold text-[14px] transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl p-3.5 border border-gray-100">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-[11px] font-bold text-gray-400 uppercase">{label}</span>
      </div>
      <p className="text-sm font-semibold text-[#1E293B]">{children}</p>
    </div>
  );
}
