"use client";

import { useState, useEffect } from "react";
import {
  Ticket,
  Plus,
  Trash,
  ToggleLeft,
  ToggleRight,
  CalendarBlank,
  Percent,
  CurrencyCircleDollar,
  PencilSimple,
} from "@phosphor-icons/react";

interface Voucher {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  maxUsage: number;
  usedCount: number;
  isActive: boolean;
  tourIds: string[];
}

interface Tour {
  _id: string;
  title: string;
}

type FormState = {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: string;
  startDate: string;
  endDate: string;
  maxUsage: number;
  tourIds: string[];
};

const apiUrl = () => process.env.NEXT_PUBLIC_API_URL || "/api";

const emptyForm = (): FormState => ({
  code: "",
  discountType: "percentage",
  discountValue: 10,
  minOrderAmount: 0,
  maxDiscountAmount: "",
  startDate: "",
  endDate: "",
  maxUsage: 100,
  tourIds: [],
});

function getErrorMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== "object") return fallback;
  const msg = (data as { message?: string | string[] }).message;
  if (Array.isArray(msg)) return msg.join(", ");
  if (typeof msg === "string") return msg;
  return fallback;
}

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function OwnerVouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const token = () => localStorage.getItem("token");

  const authHeaders = (json = false): HeadersInit => {
    const h: Record<string, string> = { Authorization: `Bearer ${token()}` };
    if (json) h["Content-Type"] = "application/json";
    return h;
  };

  const fetchData = async () => {
    const t = token();
    if (!t) return;
    try {
      const [vRes, tRes] = await Promise.all([
        fetch(`${apiUrl()}/vouchers/owner/me`, { headers: authHeaders() }),
        fetch(`${apiUrl()}/tours/owner/me`, { headers: authHeaders() }),
      ]);
      const vData = await vRes.json();
      const tData = await tRes.json();
      if (!vRes.ok) {
        setError(getErrorMessage(vData, "Không thể tải danh sách voucher."));
        return;
      }
      setVouchers(Array.isArray(vData) ? vData : []);
      setTours(Array.isArray(tData) ? tData : []);
    } catch {
      setError("Không thể tải dữ liệu voucher.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setForm(emptyForm());
    setEditingId(null);
    setShowForm(false);
  };

  const openCreate = () => {
    setError(null);
    setSuccess(null);
    setForm(emptyForm());
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (v: Voucher) => {
    setError(null);
    setSuccess(null);
    setEditingId(v._id);
    setForm({
      code: v.code,
      discountType: v.discountType,
      discountValue: v.discountValue,
      minOrderAmount: v.minOrderAmount,
      maxDiscountAmount: v.maxDiscountAmount != null ? String(v.maxDiscountAmount) : "",
      startDate: toDatetimeLocal(v.startDate),
      endDate: toDatetimeLocal(v.endDate),
      maxUsage: v.maxUsage,
      tourIds: (v.tourIds ?? []).map((id) => (typeof id === "string" ? id : String(id))),
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const buildBody = () => ({
    code: form.code,
    discountType: form.discountType,
    discountValue: form.discountValue,
    minOrderAmount: form.minOrderAmount,
    maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : undefined,
    startDate: form.startDate,
    endDate: form.endDate,
    maxUsage: form.maxUsage,
    tourIds: form.tourIds,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const isEdit = !!editingId;
      const res = await fetch(
        isEdit ? `${apiUrl()}/vouchers/${editingId}` : `${apiUrl()}/vouchers`,
        {
          method: isEdit ? "PATCH" : "POST",
          headers: authHeaders(true),
          body: JSON.stringify(buildBody()),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(getErrorMessage(data, isEdit ? "Không thể cập nhật voucher." : "Không thể tạo voucher."));
        return;
      }
      setSuccess(isEdit ? "Đã cập nhật voucher thành công." : "Đã tạo voucher thành công.");
      resetForm();
      await fetchData();
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (voucher: Voucher) => {
    setActionLoading(voucher._id);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${apiUrl()}/vouchers/${voucher._id}`, {
        method: "PATCH",
        headers: authHeaders(true),
        body: JSON.stringify({ isActive: !voucher.isActive }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(getErrorMessage(data, "Không thể thay đổi trạng thái voucher."));
        return;
      }
      setSuccess(voucher.isActive ? "Đã vô hiệu hóa voucher." : "Đã kích hoạt voucher.");
      await fetchData();
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Xóa voucher "${code}"? Hành động này không thể hoàn tác.`)) return;
    setActionLoading(id);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${apiUrl()}/vouchers/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(getErrorMessage(data, "Không thể xóa voucher."));
        return;
      }
      if (editingId === id) resetForm();
      setSuccess("Đã xóa voucher.");
      await fetchData();
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setActionLoading(null);
    }
  };

  const toggleTour = (tourId: string) => {
    setForm((prev) => ({
      ...prev,
      tourIds: prev.tourIds.includes(tourId)
        ? prev.tourIds.filter((id) => id !== tourId)
        : [...prev.tourIds, tourId],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-[32px] font-bold text-[#1E293B] mb-2">Quản lý Voucher</h1>
          <p className="text-gray-500 font-medium">
            Phát hành, chỉnh sửa và quản lý mã giảm giá cho tour của bạn.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="bg-[#38BDF8] hover:bg-[#32AADB] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-[#38BDF8]/20 flex items-center gap-2"
        >
          <Plus size={20} weight="bold" /> Tạo voucher mới
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 font-bold text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-2xl text-green-600 font-bold text-sm">
          {success}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 mb-10"
        >
          <h2 className="text-xl font-bold text-[#1E293B] mb-6">
            {editingId ? "Chỉnh sửa mã giảm giá" : "Tạo mã giảm giá"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Mã voucher">
              <input
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="SUMMER2026"
                className="w-full px-4 py-3 bg-[#F8F9FA] rounded-xl border-none focus:ring-2 focus:ring-[#38BDF8] outline-none font-bold uppercase"
              />
            </FormField>
            <FormField label="Loại giảm giá">
              <select
                value={form.discountType}
                onChange={(e) =>
                  setForm({ ...form, discountType: e.target.value as "percentage" | "fixed" })
                }
                className="w-full px-4 py-3 bg-[#F8F9FA] rounded-xl border-none focus:ring-2 focus:ring-[#38BDF8] outline-none"
              >
                <option value="percentage">Theo phần trăm (%)</option>
                <option value="fixed">Số tiền cố định (VNĐ)</option>
              </select>
            </FormField>
            <FormField label={form.discountType === "percentage" ? "Giảm (%)" : "Giảm (VNĐ)"}>
              <input
                type="number"
                required
                min={1}
                max={form.discountType === "percentage" ? 100 : undefined}
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-[#F8F9FA] rounded-xl border-none focus:ring-2 focus:ring-[#38BDF8] outline-none"
              />
            </FormField>
            <FormField label="Đơn tối thiểu (VNĐ)">
              <input
                type="number"
                min={0}
                value={form.minOrderAmount}
                onChange={(e) => setForm({ ...form, minOrderAmount: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-[#F8F9FA] rounded-xl border-none focus:ring-2 focus:ring-[#38BDF8] outline-none"
              />
            </FormField>
            {form.discountType === "percentage" && (
              <FormField label="Giảm tối đa (VNĐ, tùy chọn)">
                <input
                  type="number"
                  min={0}
                  value={form.maxDiscountAmount}
                  onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })}
                  className="w-full px-4 py-3 bg-[#F8F9FA] rounded-xl border-none focus:ring-2 focus:ring-[#38BDF8] outline-none"
                />
              </FormField>
            )}
            <FormField label="Ngày bắt đầu">
              <input
                type="datetime-local"
                required
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-4 py-3 bg-[#F8F9FA] rounded-xl border-none focus:ring-2 focus:ring-[#38BDF8] outline-none"
              />
            </FormField>
            <FormField label="Ngày kết thúc">
              <input
                type="datetime-local"
                required
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-4 py-3 bg-[#F8F9FA] rounded-xl border-none focus:ring-2 focus:ring-[#38BDF8] outline-none"
              />
            </FormField>
            <FormField label="Số lượt dùng tối đa">
              <input
                type="number"
                required
                min={1}
                value={form.maxUsage}
                onChange={(e) => setForm({ ...form, maxUsage: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-[#F8F9FA] rounded-xl border-none focus:ring-2 focus:ring-[#38BDF8] outline-none"
              />
            </FormField>
          </div>
          {tours.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-bold text-gray-500 uppercase mb-3">
                Áp dụng cho tour cụ thể (không chọn = tất cả tour)
              </p>
              <div className="flex flex-wrap gap-2">
                {tours.map((t) => (
                  <button
                    key={t._id}
                    type="button"
                    onClick={() => toggleTour(t._id)}
                    className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                      form.tourIds.includes(t._id)
                        ? "bg-[#38BDF8] text-white border-[#38BDF8]"
                        : "bg-gray-50 text-gray-600 border-gray-200"
                    }`}
                  >
                    {t.title}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="mt-8 flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#38BDF8] text-white px-8 py-3 rounded-xl font-bold disabled:opacity-50"
            >
              {submitting ? "Đang lưu..." : editingId ? "Cập nhật voucher" : "Lưu voucher"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-8 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100"
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      {vouchers.length === 0 ? (
        <div className="bg-white rounded-[32px] p-12 text-center border border-gray-100">
          <Ticket size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#1E293B] mb-2">Chưa có voucher</h3>
          <p className="text-gray-500">Tạo mã giảm giá đầu tiên để thu hút khách hàng.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {vouchers.map((v) => (
            <div
              key={v._id}
              className="bg-white rounded-2xl p-6 border border-gray-100 flex flex-col md:flex-row md:items-center gap-4 justify-between"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#F0F9FF] rounded-xl flex items-center justify-center text-[#38BDF8]">
                  {v.discountType === "percentage" ? (
                    <Percent size={24} weight="bold" />
                  ) : (
                    <CurrencyCircleDollar size={24} weight="bold" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-black text-lg text-[#1E293B]">{v.code}</span>
                    <span
                      className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        v.isActive ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {v.isActive ? "Đang hoạt động" : "Đã vô hiệu"}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm font-medium">
                    {v.discountType === "percentage"
                      ? `Giảm ${v.discountValue}%`
                      : `Giảm ${v.discountValue.toLocaleString("vi-VN")} VNĐ`}
                    {v.minOrderAmount > 0 &&
                      ` · Đơn tối thiểu ${v.minOrderAmount.toLocaleString("vi-VN")} VNĐ`}
                  </p>
                  <p className="text-gray-400 text-xs mt-1 flex items-center gap-1">
                    <CalendarBlank size={14} />
                    {new Date(v.startDate).toLocaleDateString("vi-VN")} –{" "}
                    {new Date(v.endDate).toLocaleDateString("vi-VN")}
                    {" · "}
                    Đã dùng {v.usedCount}/{v.maxUsage}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(v)}
                  disabled={actionLoading === v._id}
                  className="p-3 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
                  title="Chỉnh sửa"
                >
                  <PencilSimple size={22} weight="bold" />
                </button>
                <button
                  onClick={() => toggleActive(v)}
                  disabled={actionLoading === v._id}
                  className="p-3 text-gray-400 hover:text-[#38BDF8] rounded-xl transition-all disabled:opacity-40"
                  title={v.isActive ? "Vô hiệu hóa" : "Kích hoạt lại"}
                >
                  {v.isActive ? (
                    <ToggleRight size={28} weight="fill" className="text-[#38BDF8]" />
                  ) : (
                    <ToggleLeft size={28} />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(v._id, v.code)}
                  disabled={actionLoading === v._id}
                  className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-40"
                  title="Xóa voucher"
                >
                  <Trash size={22} weight="bold" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-gray-500 font-bold text-sm uppercase mb-2 block">{label}</label>
      {children}
    </div>
  );
}
