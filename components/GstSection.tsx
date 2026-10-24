'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  Building2, 
  Download, 
  Check, 
  Sparkles, 
  Calculator, 
  ArrowRight,
  QrCode,
  X,
  Printer
} from 'lucide-react';

export default function GstSection() {
  const [gstinInput, setGstinInput] = useState('07AAAAA0000A1Z5');
  const [amountInput, setAmountInput] = useState(150000);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    businessName: string;
    state: string;
    gstAmount: number;
    netClaimable: number;
    message: string;
  } | null>({
    valid: true,
    businessName: 'Verified Enterprise (Delhi NCR)',
    state: 'Delhi NCR',
    gstAmount: 22881,
    netClaimable: 22881,
    message: 'Valid GSTIN. 100% Input Tax Credit claimable in GSTR-2B.'
  });
  const [showSampleInvoice, setShowSampleInvoice] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    try {
      const res = await fetch('/api/gst/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gstin: gstinInput,
          amount: Number(amountInput) || 50000,
        })
      });
      if (res.ok) {
        const data = await res.json();
        setVerificationResult({
          valid: data.valid,
          businessName: data.business_name || 'Enterprise Client',
          state: data.state || 'India',
          gstAmount: data.gst_amount,
          netClaimable: data.net_tax_credit_claimable,
          message: data.message
        });
      }
    } catch (err) {
      console.warn('GST verify API error:', err);
    }
    setIsVerifying(false);
  };

  return (
    <section className="space-y-6 tab-content-enter select-none">
      <div className="space-y-2">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200 shadow-xs">
          <Building2 className="w-4 h-4 text-purple-600" />
          <span>Introducing myBiz: Corporate &amp; Business Travel Engine</span>
          <span className="text-slate-300">•</span>
          <span className="text-emerald-700 font-extrabold">100% GSTR-2B ITC Synced</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
          GST on Business Travel: Rates &amp; Input Tax Credit (ITC)
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
          Following GST Council rate updates, every hotel room and flight booked through myBiz on Orbit is billed directly to your company GSTIN, ensuring you never lose Input Tax Credit.
        </p>
      </div>

      {/* Interactive GSTIN & ITC Calculator Tool */}
      <div className="bg-gradient-to-br from-[#0F1A33] to-[#1A2C5B] rounded-3xl p-6 text-white shadow-xl border border-white/10 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-400/20 text-cyan-300 flex items-center justify-center font-bold">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Live GSTIN &amp; ITC Tax Savings Calculator</h3>
              <p className="text-xs text-slate-300">Direct integration with official GSTIN pattern verification</p>
            </div>
          </div>
          <button
            onClick={() => setShowSampleInvoice(true)}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-cyan-300 border border-cyan-400/30 text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>View Sample Tax Invoice</span>
          </button>
        </div>

        <form onSubmit={handleVerify} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-5 space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400">Company 15-Digit GSTIN</label>
            <input
              type="text"
              value={gstinInput}
              onChange={(e) => setGstinInput(e.target.value)}
              placeholder="e.g. 07AAAAA0000A1Z5"
              className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="sm:col-span-4 space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400">Annual Business Travel Spend (₹)</label>
            <input
              type="number"
              value={amountInput}
              onChange={(e) => setAmountInput(Number(e.target.value))}
              placeholder="150000"
              className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-95 text-white text-xs font-black shadow-lg shadow-cyan-500/25 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isVerifying ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Calculate ITC</span>
                </>
              )}
            </button>
          </div>
        </form>

        {verificationResult && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-bold text-emerald-300">{verificationResult.message}</span>
              </div>
              <div className="text-xs text-slate-300">
                Registered Jurisdiction: <strong className="text-white">{verificationResult.state}</strong> · Trade: {verificationResult.businessName}
              </div>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-400/30 px-5 py-2.5 rounded-xl text-center shrink-0">
              <div className="text-[10px] text-emerald-300 uppercase tracking-wider font-bold">Total Claimable ITC (18%)</div>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                ₹{verificationResult.netClaimable.toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Clean MakeMyTrip myBiz Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-mono font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-4 px-5">Service Category</th>
                <th className="py-4 px-5">GST Rate</th>
                <th className="py-4 px-5">Input Tax Credit (ITC) for Business</th>
                <th className="py-4 px-5">myBiz Guarantee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr className="hover:bg-slate-50/80 transition-colors duration-150">
                <td className="py-4 px-5 font-bold text-slate-900 text-sm">
                  Hotel room up to ₹7,500/night
                </td>
                <td className="py-4 px-5 font-mono font-black text-[#0084FF] text-sm">5%</td>
                <td className="py-4 px-5 text-slate-500">Standard rate (Non-ITC eligible)</td>
                <td className="py-4 px-5 text-emerald-700 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Billed to GSTIN
                </td>
              </tr>
              <tr className="hover:bg-slate-50/80 transition-colors duration-150 bg-blue-50/20">
                <td className="py-4 px-5 font-bold text-slate-900 text-sm">
                  Hotel room above ₹7,500/night
                </td>
                <td className="py-4 px-5 font-mono font-black text-[#0084FF] text-sm">18%</td>
                <td className="py-4 px-5 text-emerald-700 font-bold">
                  Available &amp; claimable in GSTR-2B
                </td>
                <td className="py-4 px-5 text-emerald-700 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Full 18% ITC Invoice
                </td>
              </tr>
              <tr className="hover:bg-slate-50/80 transition-colors duration-150">
                <td className="py-4 px-5 font-bold text-slate-900 text-sm">
                  Air travel, economy class
                </td>
                <td className="py-4 px-5 font-mono font-black text-[#0084FF] text-sm">5%</td>
                <td className="py-4 px-5 text-slate-600">Claimable for business / corporate entity</td>
                <td className="py-4 px-5 text-emerald-700 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Direct airline GST bill
                </td>
              </tr>
              <tr className="hover:bg-slate-50/80 transition-colors duration-150 bg-blue-50/20">
                <td className="py-4 px-5 font-bold text-slate-900 text-sm">
                  Air travel, business / first class
                </td>
                <td className="py-4 px-5 font-mono font-black text-[#0084FF] text-sm">18%</td>
                <td className="py-4 px-5 text-emerald-700 font-bold">
                  Fully claimable ITC under business rules
                </td>
                <td className="py-4 px-5 text-emerald-700 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Tax shown separately
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature Cards in Clean White */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md hover:shadow-lg transition-all duration-200 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold">
              <Check className="w-5 h-5" />
            </div>
            <h4 className="font-black text-slate-900 text-base">Billed Directly to Company GSTIN</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every booking made through myBiz carries your company GSTIN with CGST, SGST, and IGST itemized separately for seamless automated GSTR-2B matching by your CA or finance team.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md hover:shadow-lg transition-all duration-200 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0084FF] border border-blue-200 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <h4 className="font-black text-slate-900 text-base">Central Digital Invoice Desk</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            No more paper receipts lost in wallets. Verified tax invoices land automatically on WhatsApp and inside your myBiz finance dashboard within 30 seconds of booking completion.
          </p>
        </div>
      </div>

      {/* Sample Tax Invoice Modal */}
      {showSampleInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 modal-backdrop-enter">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 text-slate-900 shadow-2xl border border-slate-200 space-y-4 modal-panel-enter">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                  Official GST Tax Invoice
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">Invoice #ORB-INV-2026-881</h3>
                <div className="text-xs text-slate-500">IRN: 8a4f912c40ef9012bce7891234</div>
              </div>
              <button
                onClick={() => setShowSampleInvoice(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-90 flex items-center justify-center text-slate-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Billed To:</span>
                <span className="font-bold text-slate-900">TechCorp India Pvt Ltd</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Client GSTIN:</span>
                <span className="font-bold text-slate-900">07AAAAA0000A1Z5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Service:</span>
                <span className="font-bold text-slate-900">Executive Villa &amp; Business Flight</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between">
                <span className="text-slate-500">Taxable Base:</span>
                <span>₹1,27,119</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>IGST (18% ITC Eligible):</span>
                <span>₹22,881</span>
              </div>
              <div className="border-t border-slate-300 pt-2 flex justify-between font-black text-sm text-slate-900">
                <span>Total Amount Paid:</span>
                <span>₹1,50,000</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1 text-emerald-600 font-bold">
                <CheckCircle2 className="w-4 h-4" /> 100% GSTR-2B Synced
              </span>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 rounded-xl bg-[#0E1A3A] text-white hover:bg-[#1F5EFF] font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
