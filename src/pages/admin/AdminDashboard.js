import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import ProductManager from './ProductManager';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        pendingOrders: 0,
    });
    const [recentOrders, setRecentOrders] = useState([]);

    useEffect(() => {
        fetchStats();
        fetchRecentOrders();
    }, []);

    const fetchStats = async () => {
        const { count: productCount } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true });

        const { count: orderCount } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true });

        const { count: pendingCount } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');

        setStats({
            totalProducts: productCount || 0,
            totalOrders: orderCount || 0,
            pendingOrders: pendingCount || 0,
        });
    };

    const fetchRecentOrders = async () => {
        const { data } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        setRecentOrders(data || []);
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/admin/login');
    };

    return (
        <div className="admin-dashboard">
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <h3>Admin Panel</h3>
                    <p>Welcome, Owner</p>
                </div>

                <nav className="sidebar-nav">
                    <button
                        className={activeTab === 'dashboard' ? 'active' : ''}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        <i className="bi bi-grid-1x2-fill"></i> Dashboard
                    </button>
                    <button
                        className={activeTab === 'products' ? 'active' : ''}
                        onClick={() => setActiveTab('products')}
                    >
                        <i className="bi bi-box-seam"></i> Products
                    </button>
                    <button
                        className={activeTab === 'orders' ? 'active' : ''}
                        onClick={() => setActiveTab('orders')}
                    >
                        <i className="bi bi-bag-check"></i> Orders
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleSignOut} className="btn-signout">
                        <i className="bi bi-box-arrow-right"></i> Sign Out
                    </button>
                </div>
            </aside>

            <main className="admin-content">
                {activeTab === 'dashboard' && (
                    <>
                        <div className="dashboard-header">
                            <h2>Dashboard Overview</h2>
                            <div className="admin-user-info">
                                <span>{user?.email}</span>
                            </div>
                        </div>

                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon products">
                                    <i className="bi bi-box-seam"></i>
                                </div>
                                <div className="stat-info">
                                    <h3>{stats.totalProducts}</h3>
                                    <p>Total Products</p>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon orders">
                                    <i className="bi bi-bag-check"></i>
                                </div>
                                <div className="stat-info">
                                    <h3>{stats.totalOrders}</h3>
                                    <p>Total Orders</p>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon pending">
                                    <i className="bi bi-clock-history"></i>
                                </div>
                                <div className="stat-info">
                                    <h3>{stats.pendingOrders}</h3>
                                    <p>Pending Orders</p>
                                </div>
                            </div>
                        </div>

                        <div className="recent-orders">
                            <h3>Recent Orders</h3>
                            <div className="table-responsive">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Customer</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentOrders.map(order => (
                                            <tr key={order.id}>
                                                <td>#{order.id.substring(0, 8)}</td>
                                                <td>{order.customer_name}</td>
                                                <td>KSh {order.total_amount.toLocaleString()}</td>
                                                <td><span className={`status-badge ${order.status}`}>{order.status}</span></td>
                                                <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                        {recentOrders.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="text-center">No orders found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'products' && <ProductManager />}

                {activeTab === 'orders' && (
                    <div className="orders-placeholder">
                        <h2>Order Management</h2>
                        <div className="table-responsive">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Items</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map(order => (
                                        <tr key={order.id}>
                                            <td>#{order.id.substring(0, 8)}</td>
                                            <td>
                                                {order.customer_name}<br />
                                                <small>{order.customer_phone}</small>
                                            </td>
                                            <td>
                                                {order.items?.products?.length || 0} items
                                            </td>
                                            <td>KSh {order.total_amount.toLocaleString()}</td>
                                            <td><span className={`status-badge ${order.status}`}>{order.status}</span></td>
                                            <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                    {recentOrders.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="text-center">No orders found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
