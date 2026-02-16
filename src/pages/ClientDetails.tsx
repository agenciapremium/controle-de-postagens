import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { fetchClients, fetchScopes, createScope, deleteScope, fetchPosts, createPost, updatePost, type Client, type Scope, type Post } from '../services/api';
import { ArrowLeft, Trash2, Plus, CheckCircle, AlertTriangle, Clock, ExternalLink } from 'lucide-react';
import './ClientDetails.css';

// Helper function for status check
const getPostStatus = (post: Post) => {
    if (post.status === 'posted') return { label: 'EM DIA', color: 'var(--color-success)', bg: 'rgba(0, 210, 106, 0.15)' };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const postDate = new Date(post.date);
    postDate.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - postDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 3) return { label: 'ATRASADA', color: 'var(--color-danger)', bg: 'rgba(255, 80, 80, 0.15)' };
    if (diffDays >= 1) return { label: 'ATENÇÃO', color: 'var(--color-warning)', bg: 'rgba(255, 179, 0, 0.15)' };

    return { label: 'PENDENTE', color: 'var(--color-text-muted)', bg: 'rgba(255, 255, 255, 0.05)' };
};

const ClientDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'scope' | 'history'>('scope');

    const [client, setClient] = useState<Client | null>(null);
    const [scopes, setScopes] = useState<Scope[]>([]);
    const [posts, setPosts] = useState<Post[]>([]); // Posts state
    const [loading, setLoading] = useState(true);

    // Scope State
    const [materialType, setMaterialType] = useState('Static Post');
    const [quantity, setQuantity] = useState(1);
    const [selectedDays, setSelectedDays] = useState<string[]>([]);

    // Post State
    const [newPostDate, setNewPostDate] = useState('');
    const [newPostType, setNewPostType] = useState('Static Post');
    const [newPostNotes, setNewPostNotes] = useState('');

    const weekDays = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

    useEffect(() => {
        const loadData = async () => {
            if (!id) return;
            try {
                const allClients = await fetchClients();
                const found = allClients.find(c => c.id === id);
                setClient(found || null);

                const [scopesData, postsData] = await Promise.all([
                    fetchScopes(id),
                    fetchPosts(id)
                ]);
                setScopes(scopesData);
                setPosts(postsData);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    const toggleDay = (day: string) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter(d => d !== day));
        } else {
            setSelectedDays([...selectedDays, day]);
        }
    };

    const handleAddScope = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || selectedDays.length === 0) {
            alert('Selecione ao menos um dia.');
            return;
        }

        try {
            await createScope(id, {
                material_type: materialType,
                quantity_per_week: quantity,
                posting_days: selectedDays
            });
            const updatedScopes = await fetchScopes(id);
            setScopes(updatedScopes);
            setSelectedDays([]); // Reset
        } catch (err) {
            console.error(err);
            alert('Erro ao criar escopo');
        }
    };

    const handleDeleteScope = async (scopeId: string) => {
        if (!confirm('Deletar este escopo?')) return;
        try {
            await deleteScope(scopeId);
            setScopes(scopes.filter(s => s.id !== scopeId));
        } catch (err) {
            console.error(err);
        }
    }

    // Post Handlers
    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !newPostDate) return;

        try {
            await createPost({
                client_id: id,
                content_type: newPostType,
                date: newPostDate,
                notes: newPostNotes,
                status: 'pending'
            });
            const updatedPosts = await fetchPosts(id);
            setPosts(updatedPosts);
            setNewPostNotes('');
            setNewPostDate('');
        } catch (err) {
            console.error(err);
            alert('Erro ao criar post');
        }
    };

    const handleToggleStatus = async (post: Post) => {
        try {
            const newStatus = post.status === 'posted' ? 'pending' : 'posted';
            await updatePost({ id: post.id, status: newStatus });
            // Optimistic update
            setPosts(posts.map(p => p.id === post.id ? { ...p, status: newStatus } : p));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <MainLayout><p style={{ padding: '20px' }}>Carregando...</p></MainLayout>;
    if (!client) return <MainLayout><p style={{ padding: '20px' }}>Cliente não encontrado</p></MainLayout>;

    return (
        <MainLayout>
            <header style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button onClick={() => navigate('/clients')} className="btn-icon">
                    <ArrowLeft size={24} color="var(--color-text-main)" />
                </button>
                <div>
                    <h1 className="text-gradient" style={{ margin: 0 }}>{client.name}</h1>
                    <p style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>Gerenciamento de Escopo e Postagens</p>
                </div>
            </header>

            {/* Tabs */}
            <div className="tabs glass-panel">
                <button
                    className={`tab-btn ${activeTab === 'scope' ? 'active' : ''}`}
                    onClick={() => setActiveTab('scope')}
                >
                    Escopo
                </button>
                <button
                    className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    Histórico de Posts
                </button>
            </div>

            <div className="tab-content" style={{ marginTop: '24px' }}>
                {activeTab === 'scope' ? (
                    <div className="glass-panel" style={{ padding: '24px' }}>
                        <h3 style={{ marginTop: 0 }}>Definição de Escopo</h3>
                        <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>Adicione as demandas semanais deste cliente.</p>

                        {/* List Scopes */}
                        <div className="scopes-list">
                            {scopes.map(scope => (
                                <div key={scope.id} className="scope-item">
                                    <div className="scope-info">
                                        <strong>{scope.material_type}</strong>
                                        <span>{scope.quantity_per_week}x por semana</span>
                                        <div className="days-tags">
                                            {scope.posting_days.map(d => <span key={d} className="day-tag">{d}</span>)}
                                        </div>
                                    </div>
                                    <button className="btn-icon delete" onClick={() => handleDeleteScope(scope.id)}>
                                        <Trash2 size={18} color="var(--color-danger)" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <hr style={{ borderColor: 'var(--glass-border)', margin: '24px 0' }} />

                        {/* Add Scope Form */}
                        <h4>Adicionar Novo Item ao Escopo</h4>
                        <form onSubmit={handleAddScope} className="scope-form">
                            <div className="form-row">
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Tipo de Material</label>
                                    <select value={materialType} onChange={e => setMaterialType(e.target.value)}>
                                        <option value="Static Post">Post Estático</option>
                                        <option value="Reels">Reels</option>
                                        <option value="Story">Story</option>
                                        <option value="Carousel">Carrossel</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ width: '100px' }}>
                                    <label>Qtd/Semana</label>
                                    <input type="number" min="1" value={quantity} onChange={e => setQuantity(Number(e.target.value))} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Dias de Postagem</label>
                                <div className="weekdays-selector">
                                    {weekDays.map(day => (
                                        <button
                                            type="button"
                                            key={day}
                                            className={`day-btn ${selectedDays.includes(day) ? 'selected' : ''}`}
                                            onClick={() => toggleDay(day)}
                                        >
                                            {day.substring(0, 3)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" className="btn-primary" style={{ marginTop: '16px' }}>
                                <Plus size={18} style={{ marginRight: 8 }} /> Adicionar
                            </button>
                        </form>

                    </div>
                ) : (
                    <div className="glass-panel" style={{ padding: '24px' }}>
                        <h3 style={{ marginTop: 0 }}>Histórico de Postagens</h3>
                        <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>Lista de posts agendados e realizados.</p>

                        {/* Posts List */}
                        <div className="posts-list">
                            {posts.length === 0 ? <p>Nenhum post registrado.</p> : posts.map(post => {
                                const status = getPostStatus(post);
                                return (
                                    <div key={post.id} className="post-item" style={{ borderLeft: `4px solid ${status.color}` }}>
                                        <div className="post-date">
                                            <Clock size={14} style={{ marginRight: 4 }} />
                                            {new Date(post.date).toLocaleDateString()}
                                        </div>
                                        <div className="post-info">
                                            <strong>{post.content_type}</strong>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{post.notes}</span>
                                        </div>
                                        <div className="post-actions">
                                            <span className="status-tag" style={{ color: status.color, background: status.bg }}>
                                                {status.label}
                                            </span>
                                            <button
                                                className={`btn-check ${post.status === 'posted' ? 'active' : ''}`}
                                                onClick={() => handleToggleStatus(post)}
                                                title="Marcar como postado"
                                            >
                                                <CheckCircle size={20} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <hr style={{ borderColor: 'var(--glass-border)', margin: '24px 0' }} />

                        {/* Add Post Form */}
                        <h4>Agendar Postagem Manual</h4>
                        <form onSubmit={handleCreatePost} className="scope-form">
                            <div className="form-row">
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Data</label>
                                    <input type="date" value={newPostDate} onChange={e => setNewPostDate(e.target.value)} required />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Tipo</label>
                                    <select value={newPostType} onChange={e => setNewPostType(e.target.value)}>
                                        <option value="Static Post">Post Estático</option>
                                        <option value="Reels">Reels</option>
                                        <option value="Story">Story</option>
                                        <option value="Carousel">Carrossel</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Notas/Tema</label>
                                <input type="text" value={newPostNotes} onChange={e => setNewPostNotes(e.target.value)} placeholder="Ex: Promoção de Natal" />
                            </div>
                            <button type="submit" className="btn-primary" style={{ marginTop: '16px' }}>
                                <Plus size={18} style={{ marginRight: 8 }} /> Agendar
                            </button>
                        </form>

                    </div>
                )}
            </div>

        </MainLayout>
    );
};

export default ClientDetails;
