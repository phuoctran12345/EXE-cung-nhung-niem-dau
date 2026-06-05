"use client";

import { useState, useEffect } from "react";
import { Wallet, CurrencyCircleDollar, ArrowDown, Receipt } from "@phosphor-icons/react";

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
  orderCode?: number;
  createdAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  owner_credit: "Nhận từ tour cá nhân",
  platform_fee: "Phí sàn",
  payment_received: "Nạp tiền",
  payment_debit: "Thanh toán",
  withdrawal: "Rút tiền",
};

export default function OwnerWalletPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = () => process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [wRes, tRes] = await Promise.all([
          fetch(`${apiUrl()}/wallets/me`, { headers }),
          fetch(`${apiUrl()}/wallets/me/transactions`, { headers }),
        ]);
        const wData = await wRes.json();
        const tData = await tRes.json();
        setWallet(wData);
        setTransactions(Array.isArray(tData) ? tData : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatVND = (n: number) => n.toLocaleString("vi-VN") + " VNĐ";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto">
      <h1 className="text-[32px] font-bold text-[#1E293B] mb-2">Ví của tôi</h1>
      <p className="text-gray-500 mb-8">
        Số dư từ các tour cá nhân đã thanh toán (90% sau phí sàn 10%).
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-gradient-to-br from-[#38BDF8] to-[#0EA5E9] rounded-3xl p-8 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <Wallet size={28} weight="fill" />
            <span className="font-bold text-[14px] uppercase tracking-wide opacity-90">Số dư khả dụng</span>
          </div>
          <p className="text-[36px] font-black">{formatVND(wallet?.balance || 0)}</p>
        </div>
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <CurrencyCircleDollar size={28} className="text-emerald-500" weight="fill" />
            <span className="font-bold text-[14px] text-gray-400 uppercase">Tổng đã nhận</span>
          </div>
          <p className="text-[36px] font-black text-[#1E293B]">{formatVND(wallet?.totalEarned || 0)}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-2">
          <Receipt size={22} className="text-[#38BDF8]" />
          <h2 className="font-bold text-lg">Lịch sử giao dịch</h2>
        </div>
        {transactions.length === 0 ? (
          <p className="p-8 text-center text-gray-400">Chưa có giao dịch nào.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {transactions.map((tx) => (
              <div key={tx._id} className="p-5 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="font-bold text-[#1E293B] text-[14px]">
                    {TYPE_LABELS[tx.type] || tx.type}
                  </p>
                  <p className="text-[12px] text-gray-400 mt-0.5">
                    {tx.description}
                    {tx.orderCode ? ` · #${tx.orderCode}` : ""}
                  </p>
                  <p className="text-[11px] text-gray-300 mt-1">
                    {new Date(tx.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-black flex items-center gap-1 ${
                    tx.type === "payment_debit" || tx.type === "withdrawal"
                      ? "text-red-500"
                      : "text-emerald-500"
                  }`}>
                    <ArrowDown size={14} className={tx.type === "payment_debit" ? "" : "rotate-180"} />
                    {tx.type === "payment_debit" || tx.type === "withdrawal" ? "-" : "+"}
                    {formatVND(tx.amount)}
                  </p>
                  <p className="text-[11px] text-gray-400">Số dư: {formatVND(tx.balanceAfter)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
