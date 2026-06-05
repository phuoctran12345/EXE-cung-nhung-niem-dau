"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Plus,
  PencilSimple,
  Trash,
  MapPin,
  Clock,
  Tag,
  CloudArrowUp,
  X,
  MagnifyingGlass,
} from "@phosphor-icons/react";

interface Destination {
  _id: string;
  name: string;
  slug: string;
  toursCount: string;
  img: string;
  stayPricePerNight?: number;
}

interface Activity {
  _id: string;
  destinationId: string;
  name: string;
  address: string;
  price: number;
  image: string;
  durationHours: number;
  category: string;
}

const CATEGORIES = ["Sightseeing", "Dining", "Entertainment", "Shopping", "Relax"];

const emptyDestination = { name: "", slug: "", toursCount: "0 Tours", img: "", stayPricePerNight: 750_000 };
const emptyActivity = {
  name: "",
  address: "",
  price: 0,
  image: "",
  durationHours: 1,
  category: "Sightseeing",
};

function formatVND(amount: number) {
  return new Intl.NumberFormat("vi-VN").format(amount) + " đ";
}

async function parseApiError(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const data = JSON.parse(text);
    if (Array.isArray(data.message)) return data.message.join(", ");
    return data.message || text || `Lỗi ${res.status}`;
  } catch {
    return text || `Lỗi ${res.status}`;
  }
}

function normalizeDuration(value: number | string): number {
  const n = Number(String(value).replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export default function AdminDestinationsPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api";

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploading, setUploading] = useState(false);

  const [showDestForm, setShowDestForm] = useState(false);
  const [editingDest, setEditingDest] = useState<Destination | null>(null);
  const [destForm, setDestForm] = useState(emptyDestination);

  const [showActForm, setShowActForm] = useState(false);
  const [editingAct, setEditingAct] = useState<Activity | null>(null);
  const [actForm, setActForm] = useState(emptyActivity);

  const getToken = () => localStorage.getItem("token");

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  });

  const fetchDestinations = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/tours/destinations`);
      const data = await res.json();
      setDestinations(data);
      return data as Destination[];
    } catch (err) {
      console.error("Lỗi tải thành phố:", err);
      console.error("API URL:", apiUrl, "— Đảm bảo backend chạy tại cổng 4001");
      return [];
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  const fetchActivities = useCallback(
    async (destId: string) => {
      setLoadingActivities(true);
      try {
        const res = await fetch(`${apiUrl}/tours/destinations/${destId}/activities`);
        const data = await res.json();
        setActivities(data);
      } catch (err) {
        console.error("Lỗi tải dịch vụ:", err);
      } finally {
        setLoadingActivities(false);
      }
    },
    [apiUrl],
  );

  useEffect(() => {
    fetchDestinations().then((data) => {
      if (data.length > 0) {
        setSelectedId((prev) => prev ?? data[0]._id);
      }
    });
  }, [fetchDestinations]);

  useEffect(() => {
    if (selectedId) fetchActivities(selectedId);
  }, [selectedId, fetchActivities]);

  const selectedDest = destinations.find((d) => d._id === selectedId);

  const filteredDestinations = destinations.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "dest" | "act",
  ) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    const formData = new FormData();
    Array.from(e.target.files).forEach((f) => formData.append("files", f));
    try {
      const res = await fetch(`${apiUrl}/uploads/images`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });
      const result = await res.json();
      if (result.success && result.data?.[0]) {
        if (target === "dest") {
          setDestForm((prev) => ({ ...prev, img: result.data[0] }));
        } else {
          setActForm((prev) => ({ ...prev, image: result.data[0] }));
        }
      }
    } catch {
      alert("Không thể upload ảnh. Vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
  };

  const openCreateDest = () => {
    setEditingDest(null);
    setDestForm(emptyDestination);
    setShowDestForm(true);
  };

  const openEditDest = (dest: Destination) => {
    setEditingDest(dest);
    setDestForm({
      name: dest.name,
      slug: dest.slug,
      toursCount: dest.toursCount,
      img: dest.img,
      stayPricePerNight: dest.stayPricePerNight ?? 650_000,
    });
    setShowDestForm(true);
  };

  const saveDestination = async () => {
    if (!destForm.name.trim()) {
      alert("Vui lòng nhập tên thành phố.");
      return;
    }
    try {
      const url = editingDest
        ? `${apiUrl}/tours/admin/destinations/${editingDest._id}`
        : `${apiUrl}/tours/admin/destinations`;
      const res = await fetch(url, {
        method: editingDest ? "PATCH" : "POST",
        headers: authHeaders(),
        body: JSON.stringify(destForm),
      });
      if (!res.ok) {
        alert(await parseApiError(res));
        return;
      }
      const data = await res.json();
      setShowDestForm(false);
      await fetchDestinations();
      if (!editingDest) setSelectedId(data._id);
    } catch {
      alert("Không kết nối được backend. Kiểm tra server đang chạy tại cổng 4001.");
    }
  };

  const deleteDestination = async (id: string) => {
    if (!confirm("Xóa thành phố này sẽ xóa luôn tất cả dịch vụ. Bạn chắc chắn?")) return;
    try {
      const res = await fetch(`${apiUrl}/tours/admin/destinations/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Không thể xóa.");
        return;
      }
      if (selectedId === id) {
        setSelectedId(null);
        setActivities([]);
      }
      await fetchDestinations();
    } catch {
      alert("Lỗi kết nối.");
    }
  };

  const openCreateAct = () => {
    setEditingAct(null);
    setActForm(emptyActivity);
    setShowActForm(true);
  };

  const openEditAct = (act: Activity) => {
    setEditingAct(act);
    setActForm({
      name: act.name,
      address: act.address,
      price: act.price,
      image: act.image,
      durationHours: act.durationHours,
      category: act.category,
    });
    setShowActForm(true);
  };

  const saveActivity = async () => {
    if (!selectedId) return;
    if (!getToken()) {
      alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại tài khoản admin.");
      return;
    }
    if (!actForm.name.trim()) {
      alert("Vui lòng nhập tên dịch vụ.");
      return;
    }
    try {
      const url = editingAct
        ? `${apiUrl}/tours/admin/activities/${editingAct._id}`
        : `${apiUrl}/tours/admin/destinations/${selectedId}/activities`;
      const payload = {
        ...actForm,
        durationHours: normalizeDuration(actForm.durationHours),
      };
      const res = await fetch(url, {
        method: editingAct ? "PATCH" : "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        alert(await parseApiError(res));
        return;
      }
      setShowActForm(false);
      fetchActivities(selectedId);
    } catch {
      alert("Không kết nối được backend. Kiểm tra server đang chạy tại cổng 4001.");
    }
  };

  const deleteActivity = async (id: string) => {
    if (!confirm("Xóa dịch vụ này?")) return;
    try {
      const res = await fetch(`${apiUrl}/tours/admin/activities/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) {
        alert("Không thể xóa dịch vụ.");
        return;
      }
      if (selectedId) fetchActivities(selectedId);
    } catch {
      alert("Lỗi kết nối.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="mb-10">
        <h1 className="text-[32px] font-bold text-[#1E293B] mb-2">Quản lý Tour Cá nhân</h1>
        <p className="text-gray-500 font-medium">
          Thêm và chỉnh sửa thành phố cùng các dịch vụ mà khách hàng có thể chọn khi thiết kế tour.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-[340px] flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-[#1E293B] text-lg">Thành phố</h2>
                <button
                  onClick={openCreateDest}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#38BDF8] text-white rounded-xl text-[13px] font-bold hover:bg-sky-500 transition-colors"
                >
                  <Plus size={16} weight="bold" /> Thêm
                </button>
              </div>
              <div className="relative">
                <MagnifyingGlass
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Tìm thành phố..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F8F9FA] rounded-xl border-none focus:ring-2 focus:ring-[#38BDF8] outline-none text-[14px]"
                />
              </div>
            </div>

            <div className="max-h-[520px] overflow-y-auto">
              {filteredDestinations.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-10">Chưa có thành phố nào.</p>
              ) : (
                filteredDestinations.map((dest) => (
                  <button
                    key={dest._id}
                    onClick={() => setSelectedId(dest._id)}
                    className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-colors border-b border-gray-50 ${
                      selectedId === dest._id
                        ? "bg-sky-50 border-l-4 border-l-[#38BDF8]"
                        : "hover:bg-gray-50 border-l-4 border-l-transparent"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden relative flex-shrink-0 bg-gray-100">
                      {dest.img ? (
                        <Image src={dest.img} alt={dest.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <MapPin size={20} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#1E293B] text-[14px] truncate">{dest.name}</p>
                      <p className="text-gray-400 text-[12px]">{dest.toursCount}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {!selectedDest ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
              <MapPin size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-400 font-medium">Chọn một thành phố để quản lý dịch vụ</p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="w-full sm:w-40 h-28 rounded-2xl overflow-hidden relative bg-gray-100 flex-shrink-0">
                    {selectedDest.img ? (
                      <Image
                        src={selectedDest.img}
                        alt={selectedDest.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <MapPin size={32} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-bold text-[#1E293B]">{selectedDest.name}</h2>
                        <p className="text-gray-400 text-sm mt-1">Slug: {selectedDest.slug}</p>
                        <p className="text-gray-500 text-sm mt-0.5">{selectedDest.toursCount}</p>
                        <p className="text-[#38BDF8] text-sm font-bold mt-1">
                          Lưu trú: {formatVND(selectedDest.stayPricePerNight ?? 650_000)}/đêm (phòng đôi)
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditDest(selectedDest)}
                          className="p-2.5 rounded-xl bg-sky-50 text-[#38BDF8] hover:bg-sky-100 transition-colors"
                          title="Sửa thành phố"
                        >
                          <PencilSimple size={20} />
                        </button>
                        <button
                          onClick={() => deleteDestination(selectedDest._id)}
                          className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                          title="Xóa thành phố"
                        >
                          <Trash size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-[#1E293B] text-lg">Dịch vụ / Hoạt động</h3>
                    <p className="text-gray-400 text-[13px]">
                      {activities.length} dịch vụ trong {selectedDest.name}
                    </p>
                  </div>
                  <button
                    onClick={openCreateAct}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-[#38BDF8] text-white rounded-xl text-[13px] font-bold hover:bg-sky-500 transition-colors"
                  >
                    <Plus size={16} weight="bold" /> Thêm dịch vụ
                  </button>
                </div>

                {loadingActivities ? (
                  <div className="flex justify-center py-16">
                    <div className="w-10 h-10 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : activities.length === 0 ? (
                  <div className="py-16 text-center">
                    <Tag size={40} className="mx-auto text-gray-200 mb-3" />
                    <p className="text-gray-400 text-sm">Chưa có dịch vụ nào. Hãy thêm dịch vụ mới.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {activities.map((act) => (
                      <div
                        key={act._id}
                        className="flex flex-col sm:flex-row gap-4 p-5 hover:bg-gray-50/50 transition-colors"
                      >
                        <div className="w-full sm:w-28 h-20 rounded-xl overflow-hidden relative bg-gray-100 flex-shrink-0">
                          {act.image ? (
                            <Image src={act.image} alt={act.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                              No image
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-[#1E293B] text-[15px] mb-1">{act.name}</h4>
                          <p className="text-gray-400 text-[12px] mb-2 flex items-center gap-1">
                            <MapPin size={12} /> {act.address || "—"}
                          </p>
                          <div className="flex flex-wrap gap-3 text-[12px] text-gray-500">
                            <span className="flex items-center gap-1">
                              <Tag size={12} /> {act.category}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={12} /> {act.durationHours} giờ
                            </span>
                            <span className="font-bold text-[#38BDF8]">{formatVND(act.price)}</span>
                          </div>
                        </div>
                        <div className="flex sm:flex-col gap-2 justify-end">
                          <button
                            onClick={() => openEditAct(act)}
                            className="p-2 rounded-lg bg-sky-50 text-[#38BDF8] hover:bg-sky-100 transition-colors"
                          >
                            <PencilSimple size={18} />
                          </button>
                          <button
                            onClick={() => deleteActivity(act._id)}
                            className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                          >
                            <Trash size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {showDestForm && (
        <Modal title={editingDest ? "Sửa thành phố" : "Thêm thành phố mới"} onClose={() => setShowDestForm(false)}>
          <div className="space-y-4">
            <FormField label="Tên thành phố *">
              <input
                value={destForm.name}
                onChange={(e) => setDestForm({ ...destForm, name: e.target.value })}
                placeholder="VD: Đà Nẵng"
                className={inputClass}
              />
            </FormField>
            <FormField label="Slug (để trống sẽ tự tạo)">
              <input
                value={destForm.slug}
                onChange={(e) => setDestForm({ ...destForm, slug: e.target.value })}
                placeholder="da-nang"
                className={inputClass}
              />
            </FormField>
            <FormField label="Số tour hiển thị">
              <input
                value={destForm.toursCount}
                onChange={(e) => setDestForm({ ...destForm, toursCount: e.target.value })}
                placeholder="100+ Tours"
                className={inputClass}
              />
            </FormField>
            <FormField label="Giá lưu trú / đêm (VNĐ, phòng đôi)">
              <input
                type="number"
                min={0}
                step={50_000}
                value={destForm.stayPricePerNight}
                onChange={(e) =>
                  setDestForm({ ...destForm, stayPricePerNight: Number(e.target.value) })
                }
                placeholder="750000"
                className={inputClass}
              />
            </FormField>
            <FormField label="Ảnh đại diện">
              <div className="flex gap-3 items-center">
                {destForm.img && (
                  <div className="w-20 h-16 rounded-lg overflow-hidden relative">
                    <Image src={destForm.img} alt="" fill className="object-cover" />
                  </div>
                )}
                <label className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 rounded-xl cursor-pointer hover:bg-gray-200 transition-colors text-[13px] font-bold text-gray-600">
                  <CloudArrowUp size={18} />
                  {uploading ? "Đang upload..." : "Upload ảnh"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, "dest")}
                  />
                </label>
              </div>
              <input
                value={destForm.img}
                onChange={(e) => setDestForm({ ...destForm, img: e.target.value })}
                placeholder="Hoặc dán URL ảnh"
                className={`${inputClass} mt-2`}
              />
            </FormField>
          </div>
          <ModalActions onCancel={() => setShowDestForm(false)} onSave={saveDestination} />
        </Modal>
      )}

      {showActForm && (
        <Modal title={editingAct ? "Sửa dịch vụ" : "Thêm dịch vụ mới"} onClose={() => setShowActForm(false)}>
          <div className="space-y-4">
            <FormField label="Tên dịch vụ *">
              <input
                value={actForm.name}
                onChange={(e) => setActForm({ ...actForm, name: e.target.value })}
                placeholder="VD: Ăn sáng: Mì Quảng Bà Mua"
                className={inputClass}
              />
            </FormField>
            <FormField label="Địa chỉ">
              <input
                value={actForm.address}
                onChange={(e) => setActForm({ ...actForm, address: e.target.value })}
                placeholder="19 Trần Bình Trọng, Đà Nẵng"
                className={inputClass}
              />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Giá (VNĐ) *">
                <input
                  type="number"
                  min={0}
                  value={actForm.price}
                  onChange={(e) => setActForm({ ...actForm, price: Number(e.target.value) })}
                  className={inputClass}
                />
              </FormField>
              <FormField label="Thời lượng (giờ)">
                <input
                  type="number"
                  min={0.5}
                  step={0.5}
                  value={actForm.durationHours}
                  onChange={(e) =>
                    setActForm({ ...actForm, durationHours: Number(e.target.value) })
                  }
                  className={inputClass}
                />
              </FormField>
            </div>
            <FormField label="Loại dịch vụ">
              <select
                value={actForm.category}
                onChange={(e) => setActForm({ ...actForm, category: e.target.value })}
                className={inputClass}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Ảnh dịch vụ">
              <div className="flex gap-3 items-center">
                {actForm.image && (
                  <div className="w-20 h-16 rounded-lg overflow-hidden relative">
                    <Image src={actForm.image} alt="" fill className="object-cover" />
                  </div>
                )}
                <label className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 rounded-xl cursor-pointer hover:bg-gray-200 transition-colors text-[13px] font-bold text-gray-600">
                  <CloudArrowUp size={18} />
                  {uploading ? "Đang upload..." : "Upload ảnh"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, "act")}
                  />
                </label>
              </div>
              <input
                value={actForm.image}
                onChange={(e) => setActForm({ ...actForm, image: e.target.value })}
                placeholder="Hoặc dán URL ảnh"
                className={`${inputClass} mt-2`}
              />
            </FormField>
          </div>
          <ModalActions onCancel={() => setShowActForm(false)} onSave={saveActivity} />
        </Modal>
      )}
    </div>
  );
}

const inputClass =
  "w-full px-4 py-3 bg-[#F8F9FA] rounded-xl border border-transparent focus:ring-2 focus:ring-[#38BDF8] outline-none text-[14px]";

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[13px] font-bold text-gray-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
          <h3 className="font-bold text-[#1E293B] text-lg">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={20} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function ModalActions({ onCancel, onSave }: { onCancel: () => void; onSave: () => void }) {
  return (
    <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
      <button
        onClick={onCancel}
        className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-[14px] hover:bg-gray-50"
      >
        Hủy
      </button>
      <button
        onClick={onSave}
        className="flex-1 py-3 rounded-xl bg-[#38BDF8] text-white font-bold text-[14px] hover:bg-sky-500"
      >
        Lưu
      </button>
    </div>
  );
}
