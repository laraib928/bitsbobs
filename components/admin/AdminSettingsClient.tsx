'use client';

import React from 'react';

interface SettingsData {
  business: {
    name: string;
    companyNumber: string;
    vatNumber: string;
    registeredAddress: string;
    contactPhone: string;
    contactEmail: string;
  };
  adminUsers: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    joined: string;
  }>;
}

export function AdminSettingsClient({ initialData }: { initialData: SettingsData }) {
  return (
    <div className="p-5 sm:p-8 pb-16 flex flex-col gap-6 max-w-[1000px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="m-0 text-[30px] sm:text-[34px] font-extrabold font-stretch-110 text-navy-deep">
          Admin settings & team
        </h1>
        <p className="mt-1 mb-0 text-[14px] text-muted font-medium">
          Company legal registration, database infrastructure, and administrator accounts
        </p>
      </div>

      {/* Business Details Card */}
      <section className="bg-white border border-line rounded-[20px] p-6 sm:p-8 shadow-xs flex flex-col gap-5">
        <div className="border-b border-line pb-4">
          <h2 className="m-0 text-[18px] font-extrabold text-navy-deep">
            Business registration details
          </h2>
          <span className="text-[13px] text-muted">
            Printed on VAT invoices and credit notes
          </span>
        </div>

        <dl className="m-0 grid grid-cols-1 sm:grid-cols-2 gap-4 text-[14px]">
          <div>
            <dt className="text-muted text-[12px] font-bold uppercase">Company Name</dt>
            <dd className="m-0 text-ink font-bold text-[15px]">{initialData.business.name}</dd>
          </div>
          <div>
            <dt className="text-muted text-[12px] font-bold uppercase">Company Number</dt>
            <dd className="m-0 text-ink font-mono text-[14px]">{initialData.business.companyNumber}</dd>
          </div>
          <div>
            <dt className="text-muted text-[12px] font-bold uppercase">VAT Number</dt>
            <dd className="m-0 text-ink font-mono text-[14px]">{initialData.business.vatNumber}</dd>
          </div>
          <div>
            <dt className="text-muted text-[12px] font-bold uppercase">Customer Support Phone</dt>
            <dd className="m-0 text-ink font-semibold">{initialData.business.contactPhone}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted text-[12px] font-bold uppercase">Registered Address</dt>
            <dd className="m-0 text-text-2 font-medium">{initialData.business.registeredAddress}</dd>
          </div>
        </dl>
      </section>

      {/* Admin Users Card */}
      <section className="bg-white border border-line rounded-[20px] p-6 sm:p-8 shadow-xs flex flex-col gap-5">
        <div className="border-b border-line pb-4 flex flex-wrap justify-between items-baseline gap-2">
          <div>
            <h2 className="m-0 text-[18px] font-extrabold text-navy-deep">
              Administrator team
            </h2>
            <span className="text-[13px] text-muted">
              Users with privileged administrative access
            </span>
          </div>
          <span className="text-[12px] text-muted bg-surface px-2.5 py-1 rounded-md font-bold">
            Read-only
          </span>
        </div>

        <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 text-[13px] text-indigo-950 leading-relaxed">
          <strong>Security notice:</strong> For platform security, admin accounts cannot be created
          through public signups or this panel. Administrators are assigned directly in the database
          by updating <code className="bg-white px-1.5 py-0.5 rounded text-indigo-900 font-mono text-xs">profiles.role = &apos;admin&apos;</code>.
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[14px]">
            <thead>
              <tr className="border-b border-line bg-surface/50 text-left text-muted font-bold text-[13px]">
                <th scope="col" className="p-3 pl-4">Name</th>
                <th scope="col" className="p-3">Email</th>
                <th scope="col" className="p-3">Role</th>
                <th scope="col" className="p-3 text-right pr-4">Active since</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F2F6]">
              {initialData.adminUsers.map((user) => (
                <tr key={user.id} className="hover:bg-surface/50 transition-colors">
                  <td className="p-3 pl-4 font-bold text-navy-deep">{user.name}</td>
                  <td className="p-3 text-text-2">
                    <a href={`mailto:${user.email}`} className="text-brand-navy hover:underline">
                      {user.email}
                    </a>
                  </td>
                  <td className="p-3">
                    <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-yellow text-ink">
                      {user.role}
                    </span>
                  </td>
                  <td className="p-3 pr-4 text-right text-muted text-[13px]">
                    {user.joined}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

