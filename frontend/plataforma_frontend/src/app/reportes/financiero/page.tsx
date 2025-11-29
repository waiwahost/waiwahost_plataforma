'use client';

import React from 'react';
import NuevoReporteFinanciero from '../../../components/dashboard/Reports';
import TenantSwitcher from '../../../components/TenantSwitcher';

export default function FinancieroPage() {
    return (
        <div className="p-8">
            <TenantSwitcher />
            <div className="mt-6">
                <NuevoReporteFinanciero />
            </div>
        </div>
    );
}
