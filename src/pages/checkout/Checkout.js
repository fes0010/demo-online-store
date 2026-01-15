import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../../supabaseClient';
import Path from '../../components/path/path';
import './Checkout.css';

const Checkout = ({ Data, SetData }) => {
    const navigate = useNavigate();
    const cartItems = Data.Cart;
    const subtotal = cartItems.reduce(
        (acc, item) => acc + item.productQuantity * item.productPrice,
        0
    );

    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        notes: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Create order in Supabase
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert([
                    {
                        customer_name: formData.fullName,
                        customer_phone: formData.phone,
                        customer_email: formData.email || null,
                        items: {
                            products: cartItems,
                            delivery: {
                                address: formData.address,
                                city: formData.city,
                                notes: formData.notes
                            }
                        },
                        total_amount: subtotal,
                        status: 'pending'
                    }
                ])
                .select()
                .single();

            if (orderError) throw orderError;

            // Clear cart
            SetData(prev => ({
                ...prev,
                Cart: [],
                Home: {
                    ...prev.Home,
                    Component2: prev.Home.Component2?.map(item => ({ ...item, cardActive: '' })) || [],
                    Component4: prev.Home.Component4?.map(item => ({ ...item, cardActive: '' })) || [],
                    Component6: prev.Home.Component6?.map(item => ({ ...item, cardActive: '' })) || []
                }
            }));

            // Navigate to success page
            navigate('/order-success', { state: { orderId: order.id } });
        } catch (err) {
            setError(err.message || 'Failed to place order. Please try again.');
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <>
                <Helmet>
                    <title>Shanga Beauty | Checkout</title>
                </Helmet>
                <section id="checkout">
                    <div className="container my-5">
                        <Path pathName="Checkout" />
                        <div className="empty-cart">
                            <h2>Your cart is empty</h2>
                            <p>Add some beauty products to your cart before checking out!</p>
                            <a href="/home" className="btn-primary">Continue Shopping</a>
                        </div>
                    </div>
                </section>
            </>
        );
    }

    return (
        <>
            <Helmet>
                <title>Shanga Beauty | Checkout</title>
            </Helmet>
            <section id="checkout">
                <div className="container my-5">
                    <Path pathName="Checkout" />

                    <div className="checkout-container">
                        <div className="checkout-form">
                            <h2>Delivery Information</h2>

                            {error && <div className="error-alert">{error}</div>}

                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Full Name *</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Enter your full name"
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Phone Number *</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="0700 000 000"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Email (Optional)</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Delivery Address *</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Street address, building, apartment"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>City *</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Nairobi, Mombasa, etc."
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Delivery Notes (Optional)</label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        rows="3"
                                        placeholder="Any special instructions for delivery"
                                    ></textarea>
                                </div>

                                <button type="submit" className="btn-place-order" disabled={loading}>
                                    {loading ? 'Placing Order...' : `Place Order - KSh ${subtotal.toLocaleString()}`}
                                </button>
                            </form>
                        </div>

                        <div className="order-summary">
                            <h2>Order Summary</h2>

                            <div className="summary-items">
                                {cartItems.map((item, index) => (
                                    <div key={index} className="summary-item">
                                        <img src={item.productImg} alt={item.productName} />
                                        <div className="item-details">
                                            <h4>{item.productName}</h4>
                                            <p>Qty: {item.productQuantity}</p>
                                        </div>
                                        <span className="item-price">KSh {(item.productPrice * item.productQuantity).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="summary-totals">
                                <div className="summary-row">
                                    <span>Subtotal</span>
                                    <span>KSh {subtotal.toLocaleString()}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Delivery</span>
                                    <span>Free</span>
                                </div>
                                <div className="summary-row total">
                                    <span>Total</span>
                                    <span>KSh {subtotal.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Checkout;
