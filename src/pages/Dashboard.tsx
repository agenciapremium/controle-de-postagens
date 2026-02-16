import React, { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { fetchDashboardStats, type DashboardStats } from '../services/api';

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats>({ critical: 0, attention: 0, onTime: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            const data = await fetchDashboardStats();
            setStats(data);
            setLoading(false);
        };
        loadStats();
    }, []);

    return (
        <MainLayout>
            <header style={{ marginBottom: '32px' }}>
                <h1 className="text-gradient" style={{ margin: 0 }}>Dashboard</h1>
                <p style={{ color: 'var(--color-text-muted)', marginTop: '8px' }}>Visão geral das postagens e pendências</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                {/* Critical Clients Card */}
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ margin: 0, color: 'var(--color-danger)' }}>Situação Crítica</h3>
                    <p style={{ color: 'var(--color-text-muted)' }}>Clientes com postagens atrasadas (+3 dias)</p>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>{loading ? '...' : stats.critical}</div>
                </div>

                {/* Good Standing Clients Card */}
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ margin: 0, color: 'var(--color-success)' }}>Em Dia</h3>
                    <p style={{ color: 'var(--color-text-muted)' }}>Clientes com postagens em dia</p>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>{loading ? '...' : stats.onTime}</div>
                </div>

                {/* Attention Clients Card */}
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ margin: 0, color: 'var(--color-warning)' }}>Atenção</h3>
                    <p style={{ color: 'var(--color-text-muted)' }}>Clientes com atraso leve (1-3 dias)</p>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>{loading ? '...' : stats.attention}</div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Dashboard;
