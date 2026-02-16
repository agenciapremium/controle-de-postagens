
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    CheckSquare,
    LogOut
} from 'lucide-react';
import './Sidebar.css';

const Sidebar: React.FC = () => {
    return (
        <aside className="sidebar glass-panel">
            <div className="sidebar-header">
                <div className="logo-container">
                    <div className="logo-icon">AG</div>
                    <span className="logo-text">Agência Premium</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </NavLink>
                <NavLink to="/clients" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Users size={20} />
                    <span>Clientes</span>
                </NavLink>
                <NavLink to="/posts" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <CheckSquare size={20} />
                    <span>Postagens</span>
                </NavLink>
            </nav>

            <div className="sidebar-footer">
                <button className="nav-item logout-btn">
                    <LogOut size={20} />
                    <span>Sair</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
