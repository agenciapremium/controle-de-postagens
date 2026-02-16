
import React, { type ReactNode } from 'react';
import Sidebar from '../components/Sidebar';
import './MainLayout.css';

interface MainLayoutProps {
    children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    return (
        <div className="layout-container">
            <Sidebar />
            <main className="main-content">
                <div className="content-wrapper glass-panel">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default MainLayout;
