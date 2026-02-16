
import React, { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { fetchPosts, updatePost, type Post } from '../services/api'; // fetchPosts needs update to support all clients
import { CheckCircle, Clock } from 'lucide-react';
import './ClientDetails.css'; // Reusing styles for now

// Helper (duplicated for now, could be shared)
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

const Posts: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    const loadPosts = async () => {
        try {
            setLoading(true);
            const data = await fetchPosts(); // Fetches all posts
            setPosts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPosts();
    }, []);

    const handleToggleStatus = async (post: Post) => {
        try {
            const newStatus = post.status === 'posted' ? 'pending' : 'posted';
            await updatePost({ id: post.id, status: newStatus });
            setPosts(posts.map(p => p.id === post.id ? { ...p, status: newStatus } : p));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <MainLayout>
            <header style={{ marginBottom: '32px' }}>
                <h1 className="text-gradient" style={{ margin: 0 }}>Mural de Postagens</h1>
                <p style={{ color: 'var(--color-text-muted)', marginTop: '8px' }}>Todas as postagens de todos os clientes</p>
            </header>

            <div className="glass-panel" style={{ padding: '24px' }}>
                {loading ? <p>Carregando...</p> : (
                    <div className="posts-list">
                        {posts.length === 0 ? <p>Nenhuma postagem encontrada.</p> : posts.map(post => {
                            const status = getPostStatus(post);
                            return (
                                <div key={post.id} className="post-item" style={{ borderLeft: `4px solid ${status.color}` }}>
                                    <div className="post-date">
                                        <Clock size={14} style={{ marginRight: 4 }} />
                                        {new Date(post.date).toLocaleDateString()}
                                    </div>
                                    <div className="post-info">
                                        {/* We should ideally show Client Name here too, but we need to fetch it or join in backend */}
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
                                        >
                                            <CheckCircle size={20} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default Posts;
