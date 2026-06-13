"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  Envelope,
  Wallet,
  Receipt,
  MapPin,
  ShieldCheck,
  ArrowDown,
  ArrowUp,
} from "@phosphor-icons/react";

interface WalletData {
  balance: number;
  totalEarned: number;
}

interface Transaction {
  _id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

const TX_LABELS: Record<string, string> = {
  payment_received: "Nạp tiền",
  payment_debit: "Thanh toán",
  owner_credit: "Nhận từ tour",
  platform_fee: "Phí sàn",
  withdrawal: "Rút tiền",
};

export default function ProfilePage() {
  const [user, setUser] = useState<{
    name: string;
    email: string;
    role?: string;
    avatarUrl?: string;
  } | null>(null);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = () => process.env.NEXT_PUBLIC_API_URL || "/api";

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    if (!token || !userStr) {
      setLoading(false);
      return;
    }

    setUser(JSON.parse(userStr));

    const fetchWallet = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [wRes, tRes] = await Promise.all([
          fetch(`${apiUrl()}/wallets/me`, { headers }),
          fetch(`${apiUrl()}/wallets/me/transactions`, { headers }),
        ]);
        if (wRes.ok) setWallet(await wRes.json());
        if (tRes.ok) {
          const tData = await tRes.json();
          setTransactions(Array.isArray(tData) ? tData : []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
  }, []);

  const formatVND = (n: number) => n.toLocaleString("vi-VN") + " VNĐ";

  const roleLabel =
    user?.role === "tour_owner"
      ? "Chủ tour"
      : user?.role === "admin"
        ? "Quản trị viên"
        : "Khách hàng";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="w-12 h-12 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] px-6">
        <User size={48} className="text-gray-300 mb-4" />
        <p className="text-gray-500 mb-4">Vui lòng đăng nhập để xem hồ sơ.</p>
        <button
          onClick={() => window.dispatchEvent(new Event("open-login-modal"))}
          className="bg-[#38BDF8] text-white px-6 py-3 rounded-full font-bold"
        >
          Đăng nhập
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-10 px-6 pb-20">
      <div className="max-w-[900px] mx-auto">
        <h1 className="text-[32px] font-bold text-[#1E293B] mb-8">
          Hồ sơ <span className="text-[#38BDF8]">cá nhân</span>
        </h1>

        {/* Thông tin tài khoản */}
        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm mb-6">
          <div className="flex items-center gap-6">
            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-[#38BDF8] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {user.avatarUrl ? (
                <Image src={user.avatarUrl} alt={user.name} fill className="object-cover" />
              ) : (
                user.name?.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1E293B]">{user.name}</h2>
              <p className="text-gray-500 flex items-center gap-1.5 mt-1 text-sm">
                <Envelope size={14} /> {user.email}
              </p>
              <span className="inline-flex items-center gap-1 mt-2 text-[12px] font-bold uppercase tracking-wide text-[#38BDF8] bg-sky-50 px-3 py-1 rounded-full">
                <ShieldCheck size={14} /> {roleLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Ví */}
        <div className="bg-gradient-to-br from-[#1A2434] to-[#2d3a4f] rounded-3xl p-8 text-white shadow-xl mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Wallet size={24} weight="fill" className="text-[#38BDF8]" />
            <span className="font-bold text-[14px] uppercase tracking-wide opacity-80">
              Số dư ví
            </span>
          </div>
          <p className="text-[40px] font-black mb-2">
            {formatVND(wallet?.balance ?? 0)}
          </p>
          <p className="text-[13px] text-gray-400">
            Tổng đã ghi nhận: {formatVND(wallet?.totalEarned ?? 0)}
          </p>
          <p className="text-[12px] text-gray-500 mt-4 leading-relaxed">
            Khi thanh toán tour cá nhân, hệ thống ưu tiên trừ từ ví trước. Phần thiếu sẽ chuyển sang PayOS.
          </p>
        </div>

        {/* Liên kết nhanh */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Link
            href="/my-trips"
            className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-[#38BDF8] transition-colors flex items-center gap-3"
          >
            <MapPin size={22} className="text-[#38BDF8]" />
            <span className="font-bold text-[#1E293B]">Chuyến đi của tôi</span>
          </Link>
          <Link
            href="/my-private-tours"
            className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-[#38BDF8] transition-colors flex items-center gap-3"
          >
            <Receipt size={22} className="text-[#38BDF8]" />
            <span className="font-bold text-[#1E293B]">Tour cá nhân</span>
          </Link>
        </div>

        {/* Lịch sử ví */}
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-bold text-lg text-[#1E293B]">Lịch sử ví</h3>
          </div>
          {transactions.length === 0 ? (
            <p className="p-8 text-center text-gray-400 text-sm">Chưa có giao dịch nào.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {transactions.map((tx) => {
                const isDebit = tx.type === "payment_debit" || tx.type === "withdrawal";
                return (
                  <div
                    key={tx._id}
                    className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-semibold text-[14px] text-[#1E293B]">
                        {TX_LABELS[tx.type] || tx.type}
                      </p>
                      <p className="text-[12px] text-gray-400 mt-0.5">{tx.description}</p>
                      <p className="text-[11px] text-gray-300 mt-1">
                        {new Date(tx.createdAt).toLocaleString("vi-VN")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold flex items-center gap-1 ${
                          isDebit ? "text-red-500" : "text-emerald-500"
                        }`}
                      >
                        {isDebit ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                        {isDebit ? "-" : "+"}
                        {formatVND(tx.amount)}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Còn lại: {formatVND(tx.balanceAfter)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
