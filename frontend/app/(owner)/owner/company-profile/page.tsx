"use client";

import { useEffect, useRef, useState } from "react";
import {
  Buildings,
  CheckCircle,
  MapPin,
  Lock,
  Globe,
  UploadSimple,
  Clock,
  WarningCircle,
  Eye,
} from "@phosphor-icons/react";

interface PartnerApplication {
  _id: string;
  companyName: string;
  taxCode: string;
  address: string;
  website?: string;
  description?: string;
  representativeName: string;
  status: string;
  rejectionReason?: string;
}

interface FormState {
  address: string;
  website: string;
  description: string;
  representativeName: string;
}

export default function CompanyProfilePage() {
  const [application, setApplication] = useState<PartnerApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [userName, setUserName] = useState("");
  const [form, setForm] = useState<FormState>({
    address: "",
    website: "",
    description: "",
    representativeName: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const apiUrl = () => process.env.NEXT_PUBLIC_API_URL || "/api";

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setAvatarUrl(user.avatarUrl || "");
      setUserName(user.name || "");
    }

    const fetchApplication = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(`${apiUrl()}/partner-applications/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        const app: PartnerApplication | null = result?.data ?? null;
        setApplication(app);
        if (app) {
          setForm({
            address: app.address || "",
            website: app.website || "",
            description: app.description || "",
            representativeName: app.representativeName || "",
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchApplication();
  }, []);

  const handleUploadLogo = async (file: File) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("files", file);
      const res = await fetch(`${apiUrl()}/uploads/images`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const result = await res.json();
      const url = result?.data?.[0];
      if (url) setAvatarUrl(url);
      else alert("Upload ảnh thất bại.");
    } catch (e) {
      console.error(e);
      alert("Upload ảnh thất bại.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    if (!form.address.trim()) {
      alert("Địa chỉ không được để trống.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${apiUrl()}/partner-applications/my`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          address: form.address,
          website: form.website,
          description: form.description,
          representativeName: form.representativeName,
          avatarUrl,
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        alert(result.message || "Không thể cập nhật hồ sơ.");
        return;
      }
      setApplication(result.data);
      // Đồng bộ avatar mới vào localStorage để các trang khác hiển thị đúng
      const userStr = localStorage.getItem("user");
      if (userStr && avatarUrl) {
        const user = JSON.parse(userStr);
        user.avatarUrl = avatarUrl;
        localStorage.setItem("user", JSON.stringify(user));
      }
      alert("Đã cập nhật hồ sơ công ty.");
    } catch (e) {
      console.error(e);
      alert("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-12 h-12 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="max-w-[700px] bg-white rounded-3xl p-12 text-center border border-gray-100">
        <Buildings size={48} className="text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">Chưa có hồ sơ đối tác</h3>
        <p className="text-gray-500">
          Tài khoản của bạn chưa có hồ sơ đăng ký đối tác trong hệ thống.
        </p>
      </div>
    );
  }

  if (application.status !== "approved") {
    return (
      <div className="max-w-[700px] bg-white rounded-3xl p-10 border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          {application.status === "pending" ? (
            <Clock size={28} className="text-amber-500" weight="fill" />
          ) : (
            <WarningCircle size={28} className="text-red-500" weight="fill" />
          )}
          <h3 className="text-xl font-bold">
            {application.status === "pending"
              ? "Hồ sơ đang chờ duyệt"
              : "Hồ sơ đã bị từ chối"}
          </h3>
        </div>
        <p className="text-gray-500">
          {application.status === "pending"
            ? "Bạn có thể chỉnh sửa hồ sơ công ty sau khi được Admin phê duyệt."
            : application.rejectionReason
              ? `Lý do: ${application.rejectionReason}`
              : "Vui lòng liên hệ Admin để biết thêm chi tiết."}
        </p>
      </div>
    );
  }

  const displayName = application.companyName || userName;

  return (
    <div className="max-w-[1100px]">
      <h1 className="text-[28px] font-bold text-[#1E293B] mb-1">
        Hồ sơ <span className="text-[#38BDF8]">công ty</span>
      </h1>
      <p className="text-gray-500 mb-8">
        Thông tin này được hiển thị công khai cho khách hàng khi bạn gửi báo giá tour cá nhân.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Form chỉnh sửa */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-gray-100 p-8 space-y-6">
          {/* Logo */}
          <div>
            <label className="block text-[13px] font-bold text-gray-400 uppercase mb-2">
              Logo / Ảnh đại diện
            </label>
            <div className="flex items-center gap-4">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-20 h-20 rounded-2xl object-cover border border-gray-100 shadow-sm"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-[#38BDF8]/10 text-[#38BDF8] font-black text-2xl flex items-center justify-center">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 hover:border-[#38BDF8] hover:text-[#38BDF8] font-bold text-[13px] transition-colors disabled:opacity-50"
                >
                  <UploadSimple size={16} weight="bold" />
                  {uploading ? "Đang tải lên..." : "Đổi ảnh"}
                </button>
                <p className="text-[12px] text-gray-400 mt-1.5">PNG/JPG, nên dùng ảnh vuông.</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUploadLogo(f);
                  e.target.value = "";
                }}
              />
            </div>
          </div>

          {/* Trường khóa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LockedField label="Tên công ty" value={application.companyName} />
            <LockedField label="Mã số thuế" value={application.taxCode} />
          </div>
          <p className="text-[12px] text-gray-400 -mt-3 flex items-center gap-1.5">
            <Lock size={13} />
            Thông tin đã xác minh theo giấy phép kinh doanh. Liên hệ Admin nếu cần thay đổi.
          </p>

          <Field
            label="Người đại diện"
            value={form.representativeName}
            onChange={(v) => setForm((s) => ({ ...s, representativeName: v }))}
            placeholder="Họ tên người đại diện"
          />
          <Field
            label="Địa chỉ / Khu vực hoạt động"
            value={form.address}
            onChange={(v) => setForm((s) => ({ ...s, address: v }))}
            placeholder="VD: 123 Bạch Đằng, Hải Châu, Đà Nẵng"
          />
          <Field
            label="Website"
            value={form.website}
            onChange={(v) => setForm((s) => ({ ...s, website: v }))}
            placeholder="https://..."
          />

          <div>
            <label className="block text-[13px] font-bold text-gray-400 uppercase mb-2">
              Giới thiệu công ty
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
              rows={4}
              maxLength={500}
              placeholder="Giới thiệu ngắn gọn về công ty, kinh nghiệm, thế mạnh... (tối đa 500 ký tự)"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#38BDF8] focus:ring-2 focus:ring-[#38BDF8]/20 outline-none text-sm resize-none"
            />
            <p className="text-[12px] text-gray-400 text-right mt-1">
              {form.description.length}/500
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className="w-full py-3.5 rounded-xl bg-[#38BDF8] hover:bg-[#32AADB] text-white font-bold disabled:opacity-50 transition-colors"
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>

        {/* Preview phía khách hàng */}
        <div className="lg:col-span-2 lg:sticky lg:top-28">
          <h3 className="text-[13px] font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
            <Eye size={16} /> Khách hàng sẽ thấy
          </h3>
          <div className="bg-sky-50 rounded-2xl border border-sky-100 p-4">
            <div className="flex gap-3">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-[#38BDF8]/15 text-[#38BDF8] font-black flex items-center justify-center shrink-0">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="font-bold text-[#1E293B]">{displayName}</p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                    <CheckCircle size={12} weight="fill" />
                    Đối tác đã xác minh
                  </span>
                </div>
                <p className="text-[12px] text-gray-400 mt-0.5">
                  Đại diện: {form.representativeName || "—"}
                </p>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[12px] text-gray-500 mt-1">
                  {form.address && (
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {form.address}
                    </span>
                  )}
                </div>
                {form.description && (
                  <p className="text-[13px] text-gray-600 mt-1.5 line-clamp-3">
                    {form.description}
                  </p>
                )}
                <p className="text-[#38BDF8] font-extrabold text-lg mt-1">*.***.*** VNĐ</p>
                <p className="text-[11px] text-gray-400 italic">(Giá báo minh họa)</p>
              </div>
            </div>
          </div>
          <p className="text-[12px] text-gray-400 mt-3 leading-relaxed">
            Khách hàng không nhìn thấy email, số điện thoại hay mã số thuế của bạn.
            {form.website && (
              <span className="flex items-center gap-1 mt-1">
                <Globe size={13} /> Website hiển thị trong hồ sơ chi tiết.
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[13px] font-bold text-gray-400 uppercase mb-2">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#38BDF8] focus:ring-2 focus:ring-[#38BDF8]/20 outline-none text-sm"
      />
    </div>
  );
}

function LockedField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-[13px] font-bold text-gray-400 uppercase mb-2 flex items-center gap-1.5">
        {label} <Lock size={12} />
      </label>
      <input
        type="text"
        value={value}
        disabled
        className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
      />
    </div>
  );
}
