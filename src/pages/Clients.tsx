
import React, { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { fetchClients, createClient, type Client } from '../services/api';
import { Plus, Search, X } from 'lucide-react';
import './Clients.css';

import { useNavigate } from 'react-router-dom';

const Clients: React.FC = () => {
    const navigate = useNavigate();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newClientName, setNewClientName] = useState('');
    const [newClientContact, setNewClientContact] = useState('');

    const loadClients = async () => {
        setLoading(true);
        try {
            const data = await fetchClients();
            setClients(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadClients();
    }, []);

    const handleCreateClient = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newClientName) return;

        try {
            await createClient({ name: newClientName, contact_info: newClientContact });
            setNewClientName('');
            setNewClientContact('');
            setIsModalOpen(false);
            loadClients();
        } catch (error) {
            console.error(error);
            alert('Erro ao criar cliente');
        }
    };

    return (
        <MainLayout>
            <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="text-gradient" style={{ margin: 0 }}>Clientes</h1>
                    <p style={{ color: 'var(--color-text-muted)', marginTop: '8px' }}>Gerenciar carteira de clientes</p>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} style={{ marginRight: '8px' }} />
                    Novo Cliente
                </button>
            </header>

            {/* Search Bar - Placeholder for future implementation */}
            <div className="search-bar glass-panel">
                <Search size={20} color="var(--color-text-muted)" />
                <input type="text" placeholder="Buscar clientes..." />
            </div>

            <div className="clients-grid">
                {loading ? (
                    <p>Carregando...</p>
                ) : clients.length === 0 ? (
                    <p>Nenhum cliente encontrado.</p>
                ) : (
                    clients.map(client => (
                        <div
                            key={client.id}
                            className="client-card glass-panel"
                            onClick={() => navigate(`/clients/${client.id}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="client-header">
                                <div className="client-avatar">{client.name.substring(0, 2).toUpperCase()}</div>
                                <div className="client-info">
                                    <h3>{client.name}</h3>
                                    <span>{client.contact_info || 'Sem contato'}</span>
                                </div>
                            </div>
                            <div className="client-status">
                                <span className={`status-badge ${client.status}`}>
                                    {client.status === 'active' ? 'Ativo' : 'Inativo'}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content glass-panel">
                        <div className="modal-header">
                            <h2>Novo Cliente</h2>
                            <button onClick={() => setIsModalOpen(false)} className="close-btn"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleCreateClient}>
                            <div className="form-group">
                                <label>Nome da Empresa/Cliente</label>
                                <input
                                    type="text"
                                    value={newClientName}
                                    onChange={(e) => setNewClientName(e.target.value)}
                                    required
                                    placeholder="Ex: StartUp Tech"
                                />
                            </div>
                            <div className="form-group">
                                <label>Contato (Email/Tel)</label>
                                <input
                                    type="text"
                                    value={newClientContact}
                                    onChange={(e) => setNewClientContact(e.target.value)}
                                    placeholder="Ex: contato@startup.com"
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancelar</button>
                                <button type="submit" className="btn-primary">Criar Cliente</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
};

export default Clients;
