import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import './ProductManager.css';

const ProductManager = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price_retail: '',
        price_wholesale: '',
        cost_price: '',
        category: 'Beauty',
        images: [],
        variants: [] // Array of { name: 'Size', value: '100ml', stock: 10 }
    });

    const [newVariant, setNewVariant] = useState({
        name: 'Color',
        value: '',
        stock: 0
    });

    const categories = ['Beauty', 'Jewelry', 'Perfumes', 'Lotions', 'Rings'];

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select(`
        *,
        variants (*)
      `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching products:', error);
        } else {
            setProducts(data || []);
        }
        setLoading(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        setLoading(true);

        const uploadedUrls = [];
        try {
            for (const file of files) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

                const { data, error } = await supabase.storage
                    .from('product-images')
                    .upload(fileName, file);

                if (error) throw error;

                if (data) {
                    const { data: { publicUrl } } = supabase.storage
                        .from('product-images')
                        .getPublicUrl(fileName);
                    uploadedUrls.push(publicUrl);
                }
            }

            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...uploadedUrls]
            }));

        } catch (error) {
            console.error('Upload Error:', error);
            alert('Upload failed: ' + error.message + '. Please ensure "product-images" bucket exists and has public policies.');
        } finally {
            setLoading(false);
        }
    };

    const addVariant = () => {
        if (newVariant.value && newVariant.stock >= 0) {
            setFormData(prev => ({
                ...prev,
                variants: [...prev.variants, newVariant]
            }));
            setNewVariant({ name: 'Color', value: '', stock: 0 });
        }
    };

    const removeVariant = (index) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index)
        }));
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            title: product.title,
            description: product.description || '',
            price_retail: product.price_retail,
            price_wholesale: product.price_wholesale || '',
            cost_price: product.cost_price || '',
            category: product.category,
            images: product.images || [],
            variants: product.variants || []
        });
        setShowAddModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let productId;

            if (editingProduct) {
                // UPDATE Existing Product
                const { error: updateError } = await supabase
                    .from('products')
                    .update({
                        title: formData.title,
                        description: formData.description,
                        price_retail: formData.price_retail,
                        price_wholesale: formData.price_wholesale,
                        cost_price: formData.cost_price,
                        category: formData.category,
                        images: formData.images
                    })
                    .eq('id', editingProduct.id);

                if (updateError) throw updateError;
                productId = editingProduct.id;
                alert('Product updated successfully!');

                // For variants: Delete all existing and re-insert (Simpler approach)
                const { error: deleteVariantsError } = await supabase
                    .from('variants')
                    .delete()
                    .eq('product_id', productId);

                if (deleteVariantsError) throw deleteVariantsError;

            } else {
                // INSERT New Product
                const { data: productData, error: productError } = await supabase
                    .from('products')
                    .insert([{
                        title: formData.title,
                        description: formData.description,
                        price_retail: formData.price_retail,
                        price_wholesale: formData.price_wholesale,
                        cost_price: formData.cost_price,
                        category: formData.category,
                        images: formData.images
                    }])
                    .select()
                    .single();

                if (productError) throw productError;
                productId = productData.id;
                alert('Product created successfully!');
            }

            // 2. Insert Variants (Common for both Add and Edit)
            if (formData.variants.length > 0) {
                const variantsToInsert = formData.variants.map(v => ({
                    product_id: productId,
                    name: v.name,
                    value: v.value,
                    stock: v.stock
                }));

                const { error: variantError } = await supabase
                    .from('variants')
                    .insert(variantsToInsert);

                if (variantError) throw variantError;
            }

            setShowAddModal(false);
            resetForm();
            fetchProducts();

        } catch (error) {
            console.error('Error saving product:', error);
            alert('Failed to save product: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEditingProduct(null);
        setFormData({
            title: '',
            description: '',
            price_retail: '',
            price_wholesale: '',
            cost_price: '',
            category: 'Beauty',
            images: [],
            variants: []
        });
    };

    const deleteProduct = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) {
                alert('Error deleting product');
            } else {
                fetchProducts();
            }
        }
    };

    return (
        <div className="product-manager">
            <div className="pm-header">
                <h2>Product Management</h2>
                <button className="btn-add" onClick={() => setShowAddModal(true)}>
                    <i className="bi bi-plus-lg"></i> Add New Product
                </button>
            </div>

            <div className="products-table-container">
                <table className="products-table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Price (Retail)</th>
                            <th>Stock (Total)</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id}>
                                <td>
                                    <div className="product-thumb">
                                        {product.images?.[0] ? (
                                            <img src={product.images[0]} alt={product.title} />
                                        ) : (
                                            <div className="no-image"><i className="bi bi-image"></i></div>
                                        )}
                                    </div>
                                </td>
                                <td>{product.title}</td>
                                <td><span className="badge">{product.category}</span></td>
                                <td>KSh {product.price_retail}</td>
                                <td>
                                    {product.variants?.reduce((acc, v) => acc + (v.stock || 0), 0) || 0}
                                </td>
                                <td>
                                    <button className="btn-icon edit me-2" onClick={() => handleEdit(product)}>
                                        <i className="bi bi-pencil"></i>
                                    </button>
                                    <button className="btn-icon delete" onClick={() => deleteProduct(product.id)}>
                                        <i className="bi bi-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {products.length === 0 && (
                            <tr>
                                <td colSpan="6" className="text-center">No products found. Add your first beauty product!</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                            <button className="btn-close" onClick={() => { setShowAddModal(false); resetForm(); }}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Product Title *</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            required
                                            placeholder="e.g. Gold Plated Ring"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Category *</label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                        >
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows="3"
                                        placeholder="Product details..."
                                    ></textarea>
                                </div>

                                <div className="form-row three-col">
                                    <div className="form-group">
                                        <label>Retail Price (KSh) *</label>
                                        <input
                                            type="number"
                                            name="price_retail"
                                            value={formData.price_retail}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Wholesale Price (KSh)</label>
                                        <input
                                            type="number"
                                            name="price_wholesale"
                                            value={formData.price_wholesale}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Cost Price (KSh)</label>
                                        <input
                                            type="number"
                                            name="cost_price"
                                            value={formData.cost_price}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <div className="variants-section">
                                    <h4>Product Variants & Stock</h4>
                                    <div className="variant-inputs">
                                        <select
                                            value={newVariant.name}
                                            onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                                        >
                                            <option value="Color">Color</option>
                                            <option value="Size">Size</option>
                                            <option value="Scent">Scent</option>
                                            <option value="Material">Material</option>
                                        </select>
                                        <input
                                            type="text"
                                            placeholder="Value (e.g. Red, 100ml)"
                                            value={newVariant.value}
                                            onChange={(e) => setNewVariant({ ...newVariant, value: e.target.value })}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Stock Qty"
                                            className="stock-input"
                                            value={newVariant.stock}
                                            onChange={(e) => setNewVariant({ ...newVariant, stock: parseInt(e.target.value) || 0 })}
                                        />
                                        <button type="button" className="btn-add-variant" onClick={addVariant}>
                                            Add
                                        </button>
                                    </div>

                                    {formData.variants.length > 0 && (
                                        <div className="variants-list">
                                            {formData.variants.map((v, idx) => (
                                                <span key={idx} className="variant-tag">
                                                    {v.name}: {v.value} ({v.stock})
                                                    <i className="bi bi-x" onClick={() => removeVariant(idx)}></i>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>Images</label>
                                    <div className="upload-area" onClick={() => document.getElementById('prod-img-input').click()}>
                                        <i className="bi bi-cloud-arrow-up"></i>
                                        <p>Click to upload images</p>
                                        <small>Supported: JPG, PNG, WEBP</small>
                                    </div>
                                    <input
                                        id="prod-img-input"
                                        type="file"
                                        multiple
                                        onChange={handleImageUpload}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />

                                    {formData.images.length > 0 && (
                                        <div className="image-previews">
                                            {formData.images.map((url, idx) => (
                                                <div key={idx} className="preview-thumb">
                                                    <img src={url} alt={`Upload ${idx}`} />
                                                    <button type="button" onClick={() => setFormData(p => ({ ...p, images: p.images.filter((_, i) => i !== idx) }))}>
                                                        <i className="bi bi-x"></i>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => { setShowAddModal(false); resetForm(); }}>Cancel</button>
                                <button type="submit" className="btn-save" disabled={loading}>
                                    {loading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Save Product')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductManager;
