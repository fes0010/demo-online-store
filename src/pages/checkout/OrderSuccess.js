import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './OrderSuccess.css';

const OrderSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const orderId = location.state?.orderId;

    if (!orderId) {
        navigate('/');
        return null;
    }

    return (
        <>
            <Helmet>
                <title>Order Successful | Shanga Beauty</title>
            </Helmet>
            <section id="order-success">
                <div className="container">
                    <div className="success-card">
                        <div className="success-icon">
                            <i className="bi bi-check-circle"></i>
                        </div>
                        <h1>Order Placed Successfully!</h1>
                        <p>Thank you for your order. We've received your request and will contact you shortly to confirm delivery details.</p>

                        <div className="order-info">
                            <p><strong>Order ID:</strong> {orderId.substring(0, 8).toUpperCase()}</p>
                        </div>

                        <div className="next-steps">
                            <h3>What's Next?</h3>
                            <ul>
                                <li>We'll call you on the provided phone number to confirm your order</li>
                                <li>Payment will be collected upon delivery</li>
                                <li>Delivery typically takes 1-3 business days within Nairobi</li>
                            </ul>
                        </div>

                        <div className="action-buttons">
                            <a href="/home" className="btn-primary">Continue Shopping</a>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default OrderSuccess;
