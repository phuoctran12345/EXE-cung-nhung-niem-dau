"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Buildings,
  Envelope,
  UserCircle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  X,
  MapPin,
  IdentificationCard,
} from "@phosphor-icons/react";

interface ApplicationUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

interface PartnerApplication {
  _id: string;
  companyName: string;
  taxCode: string;
  address: string;
  website?: string;
  licenseUrl?: string;
  representativeName: string;
  signatureDataUrl?: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  createdAt: string;
  reviewedAt?: string;
  userId: ApplicationUser | string;
}

type TabFilter = "pending" | "approved" | "rejected" | "all";

const LICENSE_DEBUG = "[AdminPartners:License]";

function LicensePreview({
  applicationId,
  apiUrl,
  licenseUrl,
}: {
  applicationId: string;
  apiUrl: string;
  licenseUrl?: string;
}) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;
    const token = localStorage.getItem("token");

    const licenseEndpoint = `${apiUrl}/partner-applications/${applicationId}/license`;

    console.log(`${LICENSE_DEBUG} LicensePreview mount`, {
      applicationId,
      licenseUrl,
      licenseEndpoint,
      hasToken: Boolean(token),
    });

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        console.log(`${LICENSE_DEBUG} Fetching license...`, { licenseEndpoint });
        const res = await fetch(licenseEndpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log(`${LICENSE_DEBUG} Response`, {
          ok: res.ok,
          status: res.status,
          statusText: res.statusText,
          contentType: res.headers.get("content-type"),
          contentLength: res.headers.get("content-length"),
          contentDisposition: res.headers.get("content-disposition"),
        });

        if (!res.ok) {
          const errText = await res.text().catch(() => "");
          console.error(`${LICENSE_DEBUG} Fetch failed`, {
            status: res.status,
            body: errText.slice(0, 500),
          });
          throw new Error(`HTTP ${res.status}: ${errText || res.statusText}`);
        }

        const blob = await res.blob();
        if (cancelled) return;

        const contentType =
          res.headers.get("content-type") || blob.type || "application/octet-stream";

        console.log(`${LICENSE_DEBUG} Blob received`, {
          size: blob.size,
          type: blob.type,
          contentType,
          isPdfMagic: contentType.includes("pdf"),
        });

        objectUrl = URL.createObjectURL(blob);
        setMimeType(contentType);
        setBlobUrl(objectUrl);
        console.log(`${LICENSE_DEBUG} Preview ready`, { blobUrl: objectUrl, mimeType: contentType });
      } catch (err) {
        console.error(`${LICENSE_DEBUG} Load error`, err);
        if (!cancelled) {
          setError("Không thể tải giấy phép kinh doanh. Vui lòng thử lại.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [applicationId, apiUrl, licenseUrl]);

  const handleViewDocument = () => {
    const licenseEndpoint = `${apiUrl}/partner-applications/${applicationId}/license`;
    console.log(`${LICENSE_DEBUG} Xem tài liệu đính kèm tại đây — click`, {
      applicationId,
      licenseUrl,
      licenseEndpoint,
      blobUrl,
      mimeType,
      loading,
      error,
    });
    if (blobUrl) {
      window.open(blobUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleDownload = async () => {
    const token = localStorage.getItem("token");
    const downloadUrl = `${apiUrl}/partner-applications/${applicationId}/license?download=1`;
    console.log(`${LICENSE_DEBUG} Download`, { downloadUrl });
    const res = await fetch(downloadUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`${LICENSE_DEBUG} Download response`, {
      ok: res.ok,
      status: res.status,
      contentType: res.headers.get("content-type"),
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = mimeType.includes("pdf")
      ? "giay-phep-kinh-doanh.pdf"
      : mimeType.includes("png")
        ? "giay-phep-kinh-doanh.png"
        : "giay-phep-kinh-doanh.jpg";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 bg-gray-50 rounded-2xl">
        <div className="w-8 h-8 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !blobUrl) {
    return <p className="text-sm text-red-500 font-medium">{error || "Lỗi tải tài liệu"}</p>;
  }

  const isPdf = mimeType.includes("pdf");

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleViewDocument}
        disabled={!blobUrl}
        className="text-sm font-bold text-[#38BDF8] underline hover:text-[#32AADB] disabled:text-gray-400 disabled:no-underline"
      >
        Xem tài liệu đính kèm tại đây
      </button>
      {isPdf ? (
        <iframe
          src={blobUrl}
          title="Giấy phép kinh doanh"
          className="w-full h-[420px] rounded-2xl border border-gray-200 bg-gray-50"
        />
      ) : (
        <img
          src={blobUrl}
          alt="Giấy phép kinh doanh"
          className="w-full max-h-[420px] object-contain rounded-2xl border border-gray-200 bg-gray-50"
        />
      )}
      <div className="flex flex-wrap gap-3">
        <a
          href={blobUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F0F9FF] text-[#38BDF8] font-bold text-sm hover:bg-[#38BDF8] hover:text-white transition-all"
        >
          Mở tab mới
        </a>
        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-all"
        >
          Tải xuống
        </button>
      </div>
    </div>
  );
}

export default function AdminPartnersPage() {
  const [applications, setApplications] = useState<PartnerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabFilter>("pending");
  const [selected, setSelected] = useState<PartnerApplication | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api";

  const fetchApplications = useCallback(async () => {
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const query = tab === "all" ? "" : `?status=${tab}`;
      const res = await fetch(`${apiUrl}/partner-applications${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      console.log(`${LICENSE_DEBUG} Danh sách hồ sơ`, {
        tab,
        ok: res.ok,
        status: res.status,
        count: result.data?.length ?? 0,
        licenses: result.data?.map((app: PartnerApplication) => ({
          id: app._id,
          companyName: app.companyName,
          licenseUrl: app.licenseUrl ?? null,
        })),
      });
      if (result.success) {
        setApplications(result.data);
      }
    } catch (error) {
      console.error("Lỗi khi tải hồ sơ đối tác:", error);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, tab]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleApprove = async (id: string) => {
    const token = localStorage.getItem("token");
    setActionLoading(true);
    try {
      const res = await fetch(`${apiUrl}/partner-applications/${id}/approve`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSelected(null);
        fetchApplications();
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) return;
    const token = localStorage.getItem("token");
    setActionLoading(true);
    try {
      const res = await fetch(`${apiUrl}/partner-applications/${id}/reject`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: rejectReason }),
      });
      if (res.ok) {
        setSelected(null);
        setRejectReason("");
        fetchApplications();
      }
    } finally {
      setActionLoading(false);
    }
  };

  const getUser = (app: PartnerApplication): ApplicationUser | null => {
    if (typeof app.userId === "object" && app.userId !== null) return app.userId;
    return null;
  };

  const statusBadge = (status: string) => {
    if (status === "pending") {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600">
          <Clock size={14} weight="fill" /> Chờ duyệt
        </span>
      );
    }
    if (status === "approved") {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600">
          <CheckCircle size={14} weight="fill" /> Đã duyệt
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600">
        <XCircle size={14} weight="fill" /> Từ chối
      </span>
    );
  };

  const tabs: { key: TabFilter; label: string }[] = [
    { key: "pending", label: "Chờ duyệt" },
    { key: "approved", label: "Đã duyệt" },
    { key: "rejected", label: "Từ chối" },
    { key: "all", label: "Tất cả" },
  ];

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="mb-10">
        <h1 className="text-[32px] font-bold text-[#1E293B] mb-2">Duyệt đối tác</h1>
        <p className="text-gray-500 font-medium">
          Xem chi tiết hồ sơ đăng ký tổ chức và phê duyệt trở thành Tour Owner.
        </p>
      </div>

      <div className="flex gap-2 mb-8 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              tab === t.key
                ? "bg-[#38BDF8] text-white shadow-lg shadow-[#38BDF8]/20"
                : "bg-white text-gray-500 border border-gray-100 hover:bg-gray-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-[32px] p-12 text-center border border-gray-100">
          <Buildings size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#1E293B] mb-2">Không có hồ sơ</h3>
          <p className="text-gray-500">Chưa có đơn đăng ký nào trong mục này.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => {
            const user = getUser(app);
            return (
              <div
                key={app._id}
                className="bg-white rounded-2xl p-6 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#F0F9FF] flex items-center justify-center text-[#38BDF8]">
                    <Buildings size={28} weight="fill" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1E293B]">{app.companyName}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Envelope size={14} /> {user?.email || "—"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      MST: {app.taxCode} · Gửi lúc{" "}
                      {new Date(app.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {statusBadge(app.status)}
                  <button
                    onClick={() => {
                      console.log(`${LICENSE_DEBUG} Mở chi tiết hồ sơ`, {
                        applicationId: app._id,
                        companyName: app.companyName,
                        licenseUrl: app.licenseUrl ?? null,
                        hasLicense: Boolean(app.licenseUrl),
                      });
                      setSelected(app);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F0F9FF] text-[#38BDF8] font-bold text-sm hover:bg-[#38BDF8] hover:text-white transition-all"
                  >
                    <Eye size={18} /> Chi tiết
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-8 py-6 flex items-center justify-between rounded-t-[32px]">
              <div>
                <h2 className="text-xl font-bold text-[#1E293B]">{selected.companyName}</h2>
                <p className="text-sm text-gray-500">Chi tiết hồ sơ đăng ký đối tác</p>
              </div>
              <button
                onClick={() => {
                  setSelected(null);
                  setRejectReason("");
                }}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem icon={<Buildings size={18} />} label="Tên công ty" value={selected.companyName} />
                <DetailItem icon={<IdentificationCard size={18} />} label="Mã số thuế" value={selected.taxCode} />
                <DetailItem icon={<MapPin size={18} />} label="Địa chỉ" value={selected.address} className="md:col-span-2" />
                {selected.website && (
                  <DetailItem icon={<Envelope size={18} />} label="Website" value={selected.website} />
                )}
                <DetailItem icon={<UserCircle size={18} />} label="Người đại diện" value={selected.representativeName} />
              </div>

              {getUser(selected) && (
                <div className="p-4 bg-gray-50 rounded-2xl">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">Tài khoản đăng ký</p>
                  <p className="font-bold text-[#1E293B]">{getUser(selected)?.name}</p>
                  <p className="text-sm text-gray-500">{getUser(selected)?.email}</p>
                </div>
              )}

              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Giấy phép kinh doanh</p>
                {selected.licenseUrl ? (
                  <>
                    <p className="text-xs text-gray-500 break-all font-mono">
                      URL lưu trữ: {selected.licenseUrl}
                    </p>
                    <LicensePreview
                      applicationId={selected._id}
                      apiUrl={apiUrl}
                      licenseUrl={selected.licenseUrl}
                    />
                  </>
                ) : (
                  <p className="text-sm text-amber-600 font-medium">
                    Hồ sơ không có licenseUrl — kiểm tra console [{LICENSE_DEBUG}]
                  </p>
                )}
              </div>

              {selected.signatureDataUrl && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">Chữ ký điện tử</p>
                  <img
                    src={selected.signatureDataUrl}
                    alt="Chữ ký"
                    className="h-24 border border-gray-200 rounded-xl bg-gray-50 p-2"
                  />
                </div>
              )}

              {selected.status === "rejected" && selected.rejectionReason && (
                <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                  <p className="text-xs font-bold text-red-400 uppercase mb-1">Lý do từ chối</p>
                  <p className="text-sm text-red-700 font-medium">{selected.rejectionReason}</p>
                </div>
              )}

              {selected.status === "pending" && (
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Lý do từ chối (bắt buộc nếu từ chối)..."
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-red-200 text-sm min-h-[80px]"
                  />
                  <div className="flex gap-3">
                    <button
                      disabled={actionLoading}
                      onClick={() => handleApprove(selected._id)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold transition-all disabled:opacity-50"
                    >
                      <CheckCircle size={20} weight="bold" />
                      {actionLoading ? "Đang xử lý..." : "Duyệt hồ sơ"}
                    </button>
                    <button
                      disabled={actionLoading || !rejectReason.trim()}
                      onClick={() => handleReject(selected._id)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all disabled:opacity-50"
                    >
                      <XCircle size={20} weight="bold" /> Từ chối
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`p-4 bg-gray-50 rounded-2xl ${className}`}>
      <p className="text-xs font-bold text-gray-400 uppercase mb-1 flex items-center gap-1">
        {icon} {label}
      </p>
      <p className="font-bold text-[#1E293B] text-sm">{value}</p>
    </div>
  );
}
