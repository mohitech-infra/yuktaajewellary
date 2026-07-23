import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function AdminView({
  products,
  setProducts,
  occasionsMeta,
  setOccasionsMeta,
  bookings,
  dbMode,
  isSyncing = false,
  leads = [],
  setLeads,
  settings,
  setSettings,
  orders = [],
  setOrders
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('yuktaa_admin_auth') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [adminPassword, setAdminPassword] = useState(localStorage.getItem('yuktaa_admin_password') || '1234');
  const [isFetchingPassword, setIsFetchingPassword] = useState(false);

  // Local state for Offer settings
  const [localVoucherCode, setLocalVoucherCode] = useState(settings?.welcome_voucher_code || 'YUKTAA2000');
  const [localVoucherAmount, setLocalVoucherAmount] = useState(settings?.welcome_voucher_amount || 2000);
  const [localMinBill, setLocalMinBill] = useState(settings?.welcome_voucher_min_bill || 6000);
  const [localRedeemLimit, setLocalRedeemLimit] = useState(settings?.wallet_redeem_limit_pct || 50);
  const [localTerms, setLocalTerms] = useState(settings?.wallet_terms || []);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Keep local inputs in sync with parent settings prop when it resolves
  useEffect(() => {
    if (settings) {
      setLocalVoucherCode(settings.welcome_voucher_code || 'YUKTAA2000');
      setLocalVoucherAmount(settings.welcome_voucher_amount || 2000);
      setLocalMinBill(settings.welcome_voucher_min_bill || 6000);
      setLocalRedeemLimit(settings.wallet_redeem_limit_pct || 50);
      setLocalTerms(settings.wallet_terms || []);
    }
  }, [settings]);

  const handleSaveOfferSettings = async (e) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const updates = [
        { key: 'welcome_voucher_code', value: localVoucherCode },
        { key: 'welcome_voucher_amount', value: String(localVoucherAmount) },
        { key: 'welcome_voucher_min_bill', value: String(localMinBill) },
        { key: 'wallet_redeem_limit_pct', value: String(localRedeemLimit) },
        { key: 'wallet_terms', value: JSON.stringify(localTerms) }
      ];

      const { error } = await supabase
        .from('admin_settings')
        .upsert(updates);

      if (error) throw error;

      // Update parent state
      setSettings({
        welcome_voucher_code: localVoucherCode,
        welcome_voucher_amount: Number(localVoucherAmount),
        welcome_voucher_min_bill: Number(localMinBill),
        wallet_redeem_limit_pct: Number(localRedeemLimit),
        wallet_terms: localTerms
      });

      triggerNotification('Offer settings and terms updated successfully!', 'success');
    } catch (err) {
      console.error('Failed to save settings:', err);
      triggerNotification('Failed to save settings to Supabase.', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleAddTerm = () => {
    setLocalTerms((prev) => [...prev, '']);
  };

  const handleUpdateTerm = (index, value) => {
    setLocalTerms((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const handleDeleteTerm = (index) => {
    setLocalTerms((prev) => prev.filter((_, i) => i !== index));
  };

  // Fetch password from Supabase on mount
  useState(() => {
    const fetchPassword = async () => {
      setIsFetchingPassword(true);
      try {
        const { data, error } = await supabase
          .from('admin_settings')
          .select('value')
          .eq('key', 'admin_password')
          .single();
        if (!error && data) {
          setAdminPassword(data.value);
          localStorage.setItem('yuktaa_admin_password', data.value);
        }
      } catch (err) {
        console.warn('Could not fetch admin password from Supabase, using local fallback.', err);
      }
      setIsFetchingPassword(false);
    };
    fetchPassword();
  }, []);

  // Change Password State
  const [changePasswordForm, setChangePasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changePasswordError, setChangePasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangePasswordError('');
    if (changePasswordForm.currentPassword !== adminPassword) {
      setChangePasswordError('Current password is incorrect.');
      return;
    }
    if (changePasswordForm.newPassword.length < 4) {
      setChangePasswordError('New password must be at least 4 characters.');
      return;
    }
    if (changePasswordForm.newPassword !== changePasswordForm.confirmPassword) {
      setChangePasswordError('New passwords do not match.');
      return;
    }
    setIsChangingPassword(true);
    try {
      const { error } = await supabase
        .from('admin_settings')
        .upsert({ key: 'admin_password', value: changePasswordForm.newPassword });
      if (error) throw error;
      setAdminPassword(changePasswordForm.newPassword);
      localStorage.setItem('yuktaa_admin_password', changePasswordForm.newPassword);
      setChangePasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      triggerNotification('Password updated in Supabase successfully!', 'success');
    } catch (err) {
      console.warn('Supabase password update failed, saving locally.', err);
      setAdminPassword(changePasswordForm.newPassword);
      localStorage.setItem('yuktaa_admin_password', changePasswordForm.newPassword);
      setChangePasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      triggerNotification('Password saved locally (Supabase offline).', 'info');
    }
    setIsChangingPassword(false);
  };

  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // Custom Alert / Notification State
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const triggerNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 4000);
  };

  // Custom Confirm Modal State
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null });
  const triggerConfirm = (title, message, onConfirm) => {
    setConfirmModal({ show: true, title, message, onConfirm });
  };

  // Adding / Editing Product Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [productForm, setProductForm] = useState({
    id: '',
    name: '',
    category: '',
    categoryTag: '',
    price: 1000,
    buy_price: '',
    color: 'gold',
    occasions: [],
    description: '',
    materials: '',
    includes: '',
    img: '',
    bookedDates: []
  });

  // Occasions Editor State
  const [editingOccasionKey, setEditingOccasionKey] = useState(null);
  const [occasionForm, setOccasionForm] = useState({
    title: '',
    desc: '',
    bg: ''
  });

  // Date blocking state
  const [selectedProductForDates, setSelectedProductForDates] = useState('');
  const [newBlockedDate, setNewBlockedDate] = useState('');

  // Backup import text
  const [importText, setImportText] = useState('');

  // Image Uploads State and Handler
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const handleImageUploads = async (files) => {
    setIsUploadingImages(true);
    const newImageUrls = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        // Try uploading to Supabase storage first
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (error) {
          throw error;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        newImageUrls.push(publicUrl);
      } catch (err) {
        console.warn('Supabase storage upload failed. Converting to Base64.', err);
        // Fallback: Read file as Base64 data URL
        const reader = new FileReader();
        const base64Promise = new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
        const base64Url = await base64Promise;
        newImageUrls.push(base64Url);
      }
    }

    if (newImageUrls.length > 0) {
      setProductForm((prev) => {
        const updatedImages = [...(prev.images || []), ...newImageUrls];
        const updatedPrimary = prev.img || newImageUrls[0];
        return {
          ...prev,
          images: updatedImages,
          img: updatedPrimary
        };
      });
      triggerNotification(`Successfully added ${newImageUrls.length} image(s)!`);
    }
    
    setIsUploadingImages(false);
  };

  // Authentication Check
  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === adminPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem('yuktaa_admin_auth', 'true');
      setLoginError('');
      triggerNotification('Welcome back, Varsha Jain!', 'success');
    } else {
      setLoginError('Invalid password. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('yuktaa_admin_auth');
    triggerNotification('Logged out successfully.', 'info');
  };

  // Filter products
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Open Form Modals
  const handleOpenAddForm = () => {
    setFormMode('add');
    setProductForm({
      id: '',
      name: '',
      category: '',
      categoryTag: '',
      price: 1000,
      buy_price: '',
      color: 'gold',
      occasions: [],
      description: '',
      materials: '',
      includes: '',
      img: '',
      images: [],
      bookedDates: []
    });
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (product) => {
    setFormMode('edit');
    setProductForm({
      id: product.id,
      name: product.name,
      category: product.category,
      categoryTag: product.categoryTag || '',
      price: product.price,
      buy_price: product.buy_price || '',
      color: product.color || 'gold',
      occasions: product.occasions || [],
      description: product.description || '',
      materials: product.materials || '',
      includes: product.includes || '',
      img: product.img || '',
      images: product.images || (product.img ? [product.img] : []),
      bookedDates: product.bookedDates || []
    });
    setIsFormOpen(true);
  };

  const handleProductInputChange = (e) => {
    const { name, value } = e.target;
    setProductForm((prev) => {
      const updates = { [name]: name === 'price' ? Number(value) : value };
      if (name === 'name' && formMode === 'add') {
        updates.id = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      return { ...prev, ...updates };
    });
  };

  const handleOccasionCheckboxChange = (occasionKey) => {
    setProductForm((prev) => {
      const alreadyChecked = prev.occasions.includes(occasionKey);
      const updatedOccasions = alreadyChecked
        ? prev.occasions.filter((o) => o !== occasionKey)
        : [...prev.occasions, occasionKey];
      return { ...prev, occasions: updatedOccasions };
    });
  };

  const handleProductFormSubmit = async (e) => {
    e.preventDefault();

    if (formMode === 'add') {
      const idExists = products.some((p) => p.id === productForm.id);
      if (idExists) {
        triggerNotification('Product ID must be unique!', 'error');
        return;
      }
      if (!productForm.id.trim()) {
        triggerNotification('Product ID is required.', 'error');
        return;
      }
    }

    if (!productForm.name.trim() || !productForm.category.trim()) {
      triggerNotification('Name and Category are required.', 'error');
      return;
    }

    if (!productForm.img || !productForm.images || productForm.images.length === 0) {
      triggerNotification('Please upload at least one image for the product.', 'error');
      return;
    }

    if (formMode === 'add') {
      const payload = {
        id: productForm.id,
        name: productForm.name,
        category: productForm.category,
        categoryTag: productForm.categoryTag,
        price: Number(productForm.price),
        buy_price: productForm.buy_price !== '' ? Number(productForm.buy_price) : null,
        color: productForm.color,
        occasions: productForm.occasions,
        description: productForm.description,
        materials: productForm.materials,
        includes: productForm.includes,
        rating: productForm.rating || 5,
        img: productForm.img,
        images: productForm.images || [],
        bookedDates: productForm.bookedDates || []
      };
      const { error } = await supabase.from('products').insert(payload);
      if (error) {
        console.error('Supabase insert failed:', error);
        triggerNotification(`Failed to add product: ${error.message}`, 'error');
        return;
      }
      setProducts((prev) => [...prev, payload]);
      triggerNotification('Product added successfully to database!');
    } else {
      const payload = {
        name: productForm.name,
        category: productForm.category,
        categoryTag: productForm.categoryTag,
        price: Number(productForm.price),
        buy_price: productForm.buy_price !== '' ? Number(productForm.buy_price) : null,
        color: productForm.color,
        occasions: productForm.occasions,
        description: productForm.description,
        materials: productForm.materials,
        includes: productForm.includes,
        rating: productForm.rating || 5,
        img: productForm.img,
        images: productForm.images || [],
        bookedDates: productForm.bookedDates || []
      };
      const { error } = await supabase.from('products').update(payload).eq('id', productForm.id);
      if (error) {
        console.error('Supabase update failed:', error);
        triggerNotification(`Failed to update product: ${error.message}`, 'error');
        return;
      }
      setProducts((prev) =>
        prev.map((p) => (p.id === productForm.id ? { ...productForm, ...payload } : p))
      );
      triggerNotification('Product updated successfully in database!');
    }

    setIsFormOpen(false);
  };

  const handleDeleteProduct = (productId) => {
    triggerConfirm(
      'Delete Product',
      `Are you sure you want to delete product "${productId}"? This cannot be undone.`,
      async () => {
        const { error } = await supabase.from('products').delete().eq('id', productId);
        if (error) {
          console.error('Supabase delete failed:', error);
          triggerNotification(`Failed to delete product: ${error.message}`, 'error');
          return;
        }
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        triggerNotification('Product deleted successfully from database.', 'info');
      }
    );
  };

  // Occasions
  const handleOpenEditOccasion = (key, occasion) => {
    setEditingOccasionKey(key);
    setOccasionForm({ ...occasion });
  };

  const handleOccasionSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('occasions').update({
        title: occasionForm.title,
        desc: occasionForm.desc,
        bg: occasionForm.bg
      }).eq('key', editingOccasionKey);
      if (error) throw error;
      setOccasionsMeta((prev) => ({
        ...prev,
        [editingOccasionKey]: { ...occasionForm }
      }));
      setEditingOccasionKey(null);
      triggerNotification('Occasion banner details updated in Supabase!');
    } catch (err) {
      console.warn('Supabase occasion update failed. Updating local cache only.', err);
      setOccasionsMeta((prev) => ({
        ...prev,
        [editingOccasionKey]: { ...occasionForm }
      }));
      setEditingOccasionKey(null);
      triggerNotification('Occasion updated locally (Offline Mode)!');
    }
  };

  // Booked Dates
  const handleAddBlockedDate = async (e) => {
    e.preventDefault();
    if (!selectedProductForDates || !newBlockedDate) {
      triggerNotification('Please select a product and select a date.', 'error');
      return;
    }

    let targetProduct = products.find((p) => p.id === selectedProductForDates);
    if (!targetProduct) return;

    if (targetProduct.bookedDates && targetProduct.bookedDates.includes(newBlockedDate)) {
      triggerNotification('Date is already blocked for this product.', 'error');
      return;
    }

    const updatedDates = [...(targetProduct.bookedDates || []), newBlockedDate].sort();

    try {
      const { error } = await supabase.from('products').update({
        bookedDates: updatedDates
      }).eq('id', selectedProductForDates);
      if (error) throw error;
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === selectedProductForDates) {
            return { ...p, bookedDates: updatedDates };
          }
          return p;
        })
      );
      setNewBlockedDate('');
      triggerNotification('Date blocked successfully in Supabase!');
    } catch (err) {
      console.warn('Supabase date block failed. Saving to local cache only.', err);
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === selectedProductForDates) {
            return { ...p, bookedDates: updatedDates };
          }
          return p;
        })
      );
      setNewBlockedDate('');
      triggerNotification('Date blocked locally (Offline Mode)!');
    }
  };

  const handleRemoveBookedDate = (productId, dateToRemove) => {
    triggerConfirm(
      'Unblock Date',
      `Unblock date ${dateToRemove} for this product?`,
      async () => {
        let targetProduct = products.find((p) => p.id === productId);
        if (!targetProduct) return;

        const updatedDates = (targetProduct.bookedDates || []).filter((d) => d !== dateToRemove);

        try {
          const { error } = await supabase.from('products').update({
            bookedDates: updatedDates
          }).eq('id', productId);
          if (error) throw error;
          setProducts((prev) =>
            prev.map((p) => {
              if (p.id === productId) {
                return { ...p, bookedDates: updatedDates };
              }
              return p;
            })
          );
          triggerNotification('Date unblocked successfully in Supabase.', 'info');
        } catch (err) {
          console.warn('Supabase date unblock failed. Saving to local cache only.', err);
          setProducts((prev) =>
            prev.map((p) => {
              if (p.id === productId) {
                return { ...p, bookedDates: updatedDates };
              }
              return p;
            })
          );
          triggerNotification('Date unblocked locally (Offline Mode).', 'info');
        }
      }
    );
  };

  // Backup & Restore
  const handleBackupExport = () => {
    const dataStr = JSON.stringify({ products, occasionsMeta }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'yuktaa_database_backup.json');
    linkElement.click();
    triggerNotification('Database backup downloaded!');
  };

  const handleBackupImport = (e) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(importText);
      if (!parsed.products || !parsed.occasionsMeta) {
        throw new Error('Missing "products" or "occasionsMeta" fields.');
      }
      
      triggerConfirm(
        'Import Database',
        'This will overwrite all active boutique data. Are you sure you want to proceed?',
        async () => {
          setProducts(parsed.products);
          setOccasionsMeta(parsed.occasionsMeta);
          setImportText('');
          triggerNotification('Database imported successfully!');

          try {
            // Upsert all products
            for (const prod of parsed.products) {
              await supabase.from('products').upsert({
                id: prod.id,
                name: prod.name,
                category: prod.category,
                categoryTag: prod.categoryTag,
                price: prod.price,
                color: prod.color,
                occasions: prod.occasions,
                description: prod.description,
                materials: prod.materials,
                includes: prod.includes,
                rating: prod.rating || 5,
                img: prod.img,
                bookedDates: prod.bookedDates || []
              });
            }
            // Upsert all occasions
            for (const key of Object.keys(parsed.occasionsMeta)) {
              const occ = parsed.occasionsMeta[key];
              await supabase.from('occasions').upsert({
                key,
                title: occ.title,
                desc: occ.desc,
                bg: occ.bg
              });
            }
            triggerNotification('All imported data synced to Supabase!', 'success');
          } catch (upsertErr) {
            console.warn('Error syncing imported backup to Supabase:', upsertErr);
            triggerNotification('Imported locally, but failed to sync to Supabase.', 'warning');
          }
        }
      );
    } catch (err) {
      triggerNotification('Import failed: ' + err.message, 'error');
    }
  };

  // Calculate metrics
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.depositAmount || 0), 0);
  const totalBlockedDatesCount = products.reduce((sum, p) => sum + (p.bookedDates ? p.bookedDates.length : 0), 0);
  const ordersRevenue = orders.filter(o => o.order_status !== 'Cancelled').reduce((sum, o) => sum + (o.buy_price || 0), 0);
  const pendingOrdersCount = orders.filter(o => o.order_status === 'Pending').length;

  const handleDeleteOrder = async (orderId) => {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);
      if (error) throw error;
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      triggerNotification('Order deleted successfully!', 'success');
    } catch (err) {
      console.error('Delete order error:', err);
      triggerNotification('Failed to delete order.', 'error');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ order_status: newStatus })
        .eq('id', orderId);
      if (error) throw error;
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, order_status: newStatus } : o))
      );
      triggerNotification(`Order status updated to ${newStatus}!`, 'success');
    } catch (err) {
      console.error('Update order status error:', err);
      triggerNotification('Failed to update order status.', 'error');
    }
  };

  // Auth Screen
  if (!isAuthenticated) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        backgroundColor: 'var(--color-bg)',
        padding: '2rem'
      }}>
        <div className="admin-auth-container">
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-accent-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto',
            color: 'var(--color-primary)',
            fontSize: '1.6rem'
          }}>
            <i className="fa-solid fa-lock" style={{ marginLeft: '1.2rem', marginTop: '1.1rem' }}></i>
          </div>
          
          <h2 className="brand-font" style={{ fontSize: '2.2rem', color: 'var(--color-primary)', marginBottom: '0.2rem' }}>
            YUKTAA
          </h2>
          <span style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: 'var(--color-accent)',
            fontWeight: 700,
            display: 'block',
            marginBottom: '2rem'
          }}>
            Designer Jewellery Portal
          </span>

          <form onSubmit={handleLogin}>
            <div className="form-group" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
              <label className="form-label">Admin Security Code</label>
              <input
                type="password"
                className="form-input"
                required
                placeholder="Enter password..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                style={{
                  height: '45px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  fontSize: '1rem',
                  letterSpacing: '3px',
                  textAlign: 'center'
                }}
              />
              {loginError && (
                <div style={{ color: '#c0392b', fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 600, textAlign: 'center' }}>
                  <i className="fa-solid fa-triangle-exclamation"></i> {loginError}
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-accent btn-shimmer" style={{ width: '100%', borderRadius: '6px', height: '45px' }}>
              Verify & Sign In
            </button>
          </form>
          
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      {/* Dynamic Notifications */}
      {notification.show && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 3000,
          padding: '1rem 1.5rem',
          borderRadius: '8px',
          backgroundColor: notification.type === 'error' ? '#fde8e8' : notification.type === 'info' ? '#eef2ff' : '#ecfdf5',
          color: notification.type === 'error' ? '#9b1c1c' : notification.type === 'info' ? '#3730a3' : '#03543f',
          borderLeft: `5px solid ${notification.type === 'error' ? '#f05252' : notification.type === 'info' ? '#6366f1' : '#059669'}`,
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem',
          fontWeight: 600,
          animation: 'fadeUp 0.3s ease'
        }}>
          <i className={`fa-solid ${notification.type === 'error' ? 'fa-circle-xmark' : notification.type === 'info' ? 'fa-circle-info' : 'fa-circle-check'}`}></i>
          <span>{notification.message}</span>
        </div>
      )}

      {/* Custom Confirm Modal */}
      {confirmModal.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 3500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}>
          <div style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: '10px',
            width: '100%',
            maxWidth: '440px',
            padding: '2rem',
            boxShadow: 'var(--shadow-premium)'
          }}>
            <h4 className="brand-font" style={{ fontSize: '1.6rem', color: 'var(--color-primary)', marginBottom: '0.8rem' }}>
              {confirmModal.title}
            </h4>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.4 }}>
              {confirmModal.message}
            </p>
            <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setConfirmModal({ show: false, title: '', message: '', onConfirm: null })} style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}>
                Cancel
              </button>
              <button className="btn btn-accent" onClick={() => {
                confirmModal.onConfirm();
                setConfirmModal({ show: false, title: '', message: '', onConfirm: null });
              }} style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', backgroundColor: '#c0392b', borderColor: '#c0392b' }}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Top Header (Hidden on Desktop) */}
      <div className="admin-mobile-header">
        <h2 className="brand-font" style={{ color: 'var(--color-white)', fontSize: '1.5rem', margin: 0, letterSpacing: '1px' }}>
          YUKTAA
        </h2>
        <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: '#ff9b9b', fontSize: '1.2rem', cursor: 'pointer' }}>
          <i className="fa-solid fa-arrow-right-from-bracket"></i>
        </button>
      </div>

      {/* Sidebar Navigation */}
      <div className="admin-sidebar">
        {/* Sidebar Header Logo */}
        <div className="admin-sidebar-header" style={{
          padding: '2rem 1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center'
        }}>
          <h2 className="brand-font" style={{ color: 'var(--color-white)', fontSize: '2.1rem', letterSpacing: '2px', lineHeight: 1 }}>
            YUKTAA
          </h2>
          <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '2.5px', color: 'var(--color-accent)', fontWeight: 700, display: 'block', marginTop: '3px' }}>
            Boutique Dashboard
          </span>
        </div>

        {/* Sidebar Links */}
        <div className="admin-sidebar-menu" style={{ flexGrow: 1, padding: '1.5rem 0' }}>
          {[
            { id: 'dashboard', label: 'Overview Metrics', icon: 'fa-gauge-high' },
            { id: 'products', label: 'Jewellery Inventory', icon: 'fa-gem' },
            { id: 'occasions', label: 'Occasions Banner', icon: 'fa-calendar-days' },
            { id: 'bookings', label: 'Bookings & Logs', icon: 'fa-book-bookmark' },
            { id: 'orders', label: 'Buy Orders', icon: 'fa-bag-shopping' },
            { id: 'leads', label: 'Sign-ups / Leads', icon: 'fa-users' },
            { id: 'backup', label: 'Database Backup', icon: 'fa-database' },
            { id: 'offer_settings', label: 'Offer & Terms Settings', icon: 'fa-tags' },
            { id: 'settings', label: 'Security Settings', icon: 'fa-shield-halved' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                width: '100%',
                padding: '1.1rem 1.8rem',
                border: 'none',
                background: activeTab === item.id ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                color: activeTab === item.id ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.75)',
                textAlign: 'left',
                fontSize: '0.9rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                borderLeft: activeTab === item.id ? '4px solid var(--color-accent)' : '4px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <i className={`fa-solid ${item.icon}`} style={{ width: '20px', fontSize: '1rem' }}></i>
              {item.label}
            </button>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="admin-sidebar-footer" style={{
          padding: '1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.8rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--color-primary)' }}>
              VJ
            </div>
            <div style={{ fontSize: '0.75rem' }}>
              <div style={{ fontWeight: 600, color: '#fff' }}>Varsha Jain</div>
              <div style={{ color: 'var(--color-accent-light)', opacity: 0.7 }}>Boutique Owner</div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn" style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#ff9b9b',
            borderRadius: '4px',
            fontSize: '0.8rem',
            padding: '0.5rem',
            width: '100%',
            textTransform: 'none',
            letterSpacing: 0
          }}>
            <i className="fa-solid fa-right-from-bracket" style={{ marginRight: '0.4rem' }}></i> Log Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="admin-content-area">
        {/* Tab 1: Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 className="brand-font" style={{ fontSize: '2.4rem', color: 'var(--color-primary)', margin: 0 }}>
                Boutique Overview
              </h2>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.4rem 0.8rem',
                borderRadius: '50px',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                backgroundColor: dbMode === 'Live Database' ? '#e6f4ea' : '#fef7e0',
                color: dbMode === 'Live Database' ? '#137333' : '#b06000',
                border: `1px solid ${dbMode === 'Live Database' ? '#ceead6' : '#feebc8'}`
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: dbMode === 'Live Database' ? '#1e8e3e' : '#f9ab00',
                  display: 'inline-block'
                }}></span>
                {dbMode} Mode
              </div>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '2rem' }}>
              Visual indicators and analytics of the boutique's current active catalog and customer scheduling.
            </p>

            {/* Stat Cards */}
            <div className="responsive-auto-grid" style={{ marginBottom: '2.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
              {[
                { title: 'Active Inventory', count: isSyncing ? 'Syncing...' : `${products.length} Sets`, desc: 'Total jewelry items', icon: 'fa-gem', bg: '#fdfcf7' },
                { title: 'Appointments Booked', count: isSyncing ? 'Syncing...' : `${bookings.length} Slots`, desc: 'Through web scheduler', icon: 'fa-book-bookmark', bg: '#fbf8fa' },
                { title: 'Blocked Calendar Dates', count: isSyncing ? 'Syncing...' : `${totalBlockedDatesCount} Days`, desc: 'Dates blocked out', icon: 'fa-calendar-xmark', bg: '#f7fbf9' },
                { title: 'Est. Booking Deposits', count: isSyncing ? 'Syncing...' : `₹${totalRevenue.toLocaleString('en-IN')}`, desc: '30% security deposit logs', icon: 'fa-indian-rupee-sign', bg: '#fdf9f7' },
                { title: 'Pending Buy Orders', count: isSyncing ? 'Syncing...' : `${pendingOrdersCount} Orders`, desc: 'Requires confirmation', icon: 'fa-bag-shopping', bg: '#fffaf0' },
                { title: 'Outright Buy Sales', count: isSyncing ? 'Syncing...' : `₹${ordersRevenue.toLocaleString('en-IN')}`, desc: 'Excluding cancelled orders', icon: 'fa-coins', bg: '#f0f9ff' }
              ].map((card, idx) => (
                <div key={idx} style={{
                  backgroundColor: 'var(--color-white)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '10px',
                  padding: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.2rem',
                  boxShadow: 'var(--shadow-subtle)',
                  background: card.bg
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--color-white)',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-primary)',
                    fontSize: '1.4rem',
                    flexShrink: 0
                  }}>
                    <i className={`fa-solid ${card.icon}`}></i>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{card.title}</span>
                    <span style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-primary)', display: 'block', margin: '0.1rem 0' }}>{card.count}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{card.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions & Recent Bookings */}
            <div className="responsive-auto-grid">
              {/* Quick Actions */}
              <div className="admin-card" style={{
                backgroundColor: 'var(--color-white)',
                border: '1px solid var(--color-border)',
                borderRadius: '10px',
                padding: '2rem',
                boxShadow: 'var(--shadow-subtle)'
              }}>
                <h3 className="brand-font" style={{ fontSize: '1.6rem', color: 'var(--color-primary)', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                  Quick Shortcuts
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                  <button className="btn btn-accent btn-shimmer" onClick={handleOpenAddForm} style={{ justifyContent: 'flex-start', padding: '1rem 1.5rem', gap: '0.8rem' }}>
                    <i className="fa-solid fa-circle-plus"></i> Add New Product Set
                  </button>
                  <button className="btn btn-primary" onClick={() => setActiveTab('bookings')} style={{ justifyContent: 'flex-start', padding: '1rem 1.5rem', gap: '0.8rem' }}>
                    <i className="fa-solid fa-lock"></i> Block Dates in Calendar
                  </button>
                  <button className="btn btn-secondary" onClick={handleBackupExport} style={{ justifyContent: 'flex-start', padding: '1rem 1.5rem', gap: '0.8rem', color: 'var(--color-primary)' }}>
                    <i className="fa-solid fa-file-arrow-download"></i> Download Inventory Backup
                  </button>
                </div>
              </div>

              {/* Recent Bookings Feed */}
              <div className="admin-card" style={{
                backgroundColor: 'var(--color-white)',
                border: '1px solid var(--color-border)',
                borderRadius: '10px',
                padding: '2rem',
                boxShadow: 'var(--shadow-subtle)'
              }}>
                <h3 className="brand-font" style={{ fontSize: '1.6rem', color: 'var(--color-primary)', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                  Recent Web Bookings
                </h3>
                {bookings.length === 0 ? (
                  <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    <i className="fa-solid fa-calendar-minus" style={{ fontSize: '2.2rem', color: 'var(--color-border)', marginBottom: '0.8rem' }}></i>
                    <p style={{ fontSize: '0.9rem' }}>No bookings received yet.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {bookings.slice(0, 3).map((b, idx) => (
                      <div key={idx} style={{
                        padding: '1rem',
                        border: '1px solid var(--color-border)',
                        borderRadius: '6px',
                        backgroundColor: '#FAF8FA',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{b.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.1rem' }}>
                            {b.productName} · {b.eventType}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', color: 'var(--color-primary)' }}>
                            {new Date(b.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-accent)', fontWeight: 600 }}>
                            ₹{b.depositAmount}
                          </span>
                        </div>
                      </div>
                    ))}
                    <button className="btn" onClick={() => setActiveTab('bookings')} style={{
                      backgroundColor: 'transparent',
                      color: 'var(--color-primary)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      alignSelf: 'center',
                      marginTop: '0.5rem',
                      padding: 0
                    }}>
                      View All Bookings <i className="fa-solid fa-arrow-right" style={{ marginLeft: '0.3rem' }}></i>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Products Inventory */}
        {activeTab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <h2 className="brand-font" style={{ fontSize: '2.4rem', color: 'var(--color-primary)', marginBottom: '0.3rem' }}>
                  Jewellery Catalog
                </h2>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                  Create, edit, search, and delete sets inside the active inventory database.
                </p>
              </div>
              <button className="btn btn-accent btn-shimmer" onClick={handleOpenAddForm}>
                <i className="fa-solid fa-plus" style={{ marginRight: '0.5rem' }}></i> Add New Product
              </button>
            </div>

            {/* Filter Bar */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '450px', marginBottom: '1.5rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search inventory by name, category, or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.5rem', height: '45px', margin: 0, borderRadius: '6px' }}
              />
              <i className="fa-solid fa-magnifying-glass" style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)'
              }}></i>
            </div>

            {/* Product Edit / Add Modal */}
            {isFormOpen && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(5px)',
                zIndex: 2500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.5rem'
              }}>
                <div style={{
                  backgroundColor: 'var(--color-white)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                  padding: '2.5rem',
                  width: '100%',
                  maxWidth: '750px',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  boxShadow: 'var(--shadow-premium)',
                  position: 'relative'
                }}>
                  <span onClick={() => setIsFormOpen(false)} style={{
                    position: 'absolute',
                    top: '1.5rem',
                    right: '1.5rem',
                    cursor: 'pointer',
                    fontSize: '1.4rem',
                    color: 'var(--color-text-muted)'
                  }}>
                    <i className="fa-solid fa-xmark"></i>
                  </span>

                  <h3 className="brand-font" style={{ fontSize: '1.9rem', marginBottom: '1.8rem', color: 'var(--color-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.6rem' }}>
                    {formMode === 'add' ? 'Add New Jewellery Set' : `Edit Product Details`}
                  </h3>
                  
                  <form onSubmit={handleProductFormSubmit}>
                    <div className="admin-form-grid" style={{ marginBottom: '1.5rem' }}>
                      <div className="form-group">
                        <label className="form-label">Unique Item Code *</label>
                        <input
                          type="text"
                          className="form-input"
                          name="id"
                          required
                          disabled={formMode === 'edit'}
                          placeholder="e.g. ruby-necklace-royal"
                          value={productForm.id}
                          onChange={handleProductInputChange}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Jewellery Set Name *</label>
                        <input
                          type="text"
                          className="form-input"
                          name="name"
                          required
                          placeholder="e.g. Royal Ruby Choker Set"
                          value={productForm.name}
                          onChange={handleProductInputChange}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Category Title *</label>
                        <input
                          type="text"
                          className="form-input"
                          name="category"
                          required
                          placeholder="e.g. Choker Set, Earrings"
                          value={productForm.category}
                          onChange={handleProductInputChange}
                        />
                      </div>
                    </div>

                    <div className="admin-form-grid" style={{ marginBottom: '1.5rem' }}>
                      <div className="form-group">
                        <label className="form-label">Rental Price (₹ Per Event) *</label>
                        <input
                          type="number"
                          className="form-input"
                          name="price"
                          required
                          min="0"
                          value={productForm.price}
                          onChange={handleProductInputChange}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Buy Price (₹ Outright Purchase)</label>
                        <input
                          type="number"
                          className="form-input"
                          name="buy_price"
                          placeholder="Leave empty if not for sale"
                          min="0"
                          value={productForm.buy_price || ''}
                          onChange={handleProductInputChange}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Color Code Tag</label>
                        <select
                          className="form-input"
                          name="color"
                          value={productForm.color}
                          onChange={handleProductInputChange}
                        >
                          <option value="gold">Gold / Polki</option>
                          <option value="ruby">Ruby Red</option>
                          <option value="emerald">Emerald Green</option>
                          <option value="mint">Mint Green / Doublet</option>
                          <option value="pearl">Pearl White</option>
                          <option value="yellow">Yellow / Enamel</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Showcase Tag Subheading</label>
                        <input
                          type="text"
                          className="form-input"
                          name="categoryTag"
                          placeholder="e.g. Bridal · Heritage Jadau"
                          value={productForm.categoryTag}
                          onChange={handleProductInputChange}
                        />
                      </div>
                    </div>

                     <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                      <label className="form-label">Jewellery Photos (Drag & Drop or Click to select) *</label>
                      <label
                        htmlFor="product-images-upload-input"
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.style.borderColor = 'var(--color-primary)';
                          e.currentTarget.style.backgroundColor = 'rgba(107, 70, 193, 0.05)';
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          e.currentTarget.style.borderColor = 'var(--color-accent)';
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        onDrop={async (e) => {
                          e.preventDefault();
                          e.currentTarget.style.borderColor = 'var(--color-accent)';
                          e.currentTarget.style.backgroundColor = 'transparent';
                          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                            await handleImageUploads(e.dataTransfer.files);
                          }
                        }}
                        style={{
                          border: '2px dashed var(--color-accent)',
                          borderRadius: '8px',
                          padding: '2rem',
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.8rem',
                          backgroundColor: 'rgba(107, 70, 193, 0.02)',
                          width: '100%'
                        }}
                      >
                        <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '2.2rem', color: 'var(--color-accent)' }}></i>
                        <div>
                          <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>Click to upload</span> or drag and drop
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                            Supports PNG, JPG, JPEG (multiple images allowed)
                          </div>
                        </div>
                        <input
                          type="file"
                          id="product-images-upload-input"
                          multiple
                          accept="image/*"
                          onChange={async (e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              await handleImageUploads(e.target.files);
                            }
                          }}
                          style={{ display: 'none' }}
                        />
                        </label>

                      {/* Upload Status */}
                      {isUploadingImages && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.8rem', color: 'var(--color-accent)', fontSize: '0.85rem', fontWeight: 600 }}>
                          <i className="fa-solid fa-spinner fa-spin"></i>
                          <span>Processing and uploading image files...</span>
                        </div>
                      )}

                      {/* Image Preview List */}
                      {productForm.images && productForm.images.length > 0 && (
                        <div style={{ marginTop: '1rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary)', display: 'block', marginBottom: '0.5rem' }}>
                            Uploaded Photos ({productForm.images.length}) · Click to set as Primary (Main Display)
                          </span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                            {productForm.images.map((imgUrl, index) => {
                              const isPrimary = productForm.img === imgUrl || (!productForm.img && index === 0);
                              return (
                                <div
                                  key={index}
                                  style={{
                                    position: 'relative',
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '6px',
                                    border: isPrimary ? '3px solid var(--color-accent)' : '1px solid var(--color-border)',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    boxShadow: isPrimary ? '0 0 10px rgba(107, 70, 193, 0.3)' : 'none',
                                    transition: 'transform 0.2s'
                                  }}
                                  onClick={() => {
                                    setProductForm(prev => ({ ...prev, img: imgUrl }));
                                    triggerNotification('Primary preview image updated!');
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                  <img src={imgUrl} alt={`Product ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  {isPrimary && (
                                    <div style={{
                                      position: 'absolute',
                                      bottom: 0,
                                      left: 0,
                                      width: '100%',
                                      backgroundColor: 'var(--color-accent)',
                                      color: 'white',
                                      fontSize: '0.6rem',
                                      fontWeight: 700,
                                      textAlign: 'center',
                                      padding: '2px 0',
                                      textTransform: 'uppercase'
                                    }}>
                                      Primary
                                    </div>
                                  )}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const updatedImages = productForm.images.filter((_, idx) => idx !== index);
                                      let nextPrimary = productForm.img;
                                      if (isPrimary) {
                                        nextPrimary = updatedImages[0] || '';
                                      }
                                      setProductForm(prev => ({
                                        ...prev,
                                        images: updatedImages,
                                        img: nextPrimary
                                      }));
                                      triggerNotification('Photo removed.', 'info');
                                    }}
                                    style={{
                                      position: 'absolute',
                                      top: '2px',
                                      right: '2px',
                                      width: '20px',
                                      height: '20px',
                                      borderRadius: '50%',
                                      backgroundColor: 'rgba(0,0,0,0.6)',
                                      color: 'white',
                                      border: 'none',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      cursor: 'pointer',
                                      fontSize: '0.7rem'
                                    }}
                                  >
                                    <i className="fa-solid fa-xmark"></i>
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                      <label className="form-label">Assign to Celebration Occasions *</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.2rem', marginTop: '0.4rem' }}>
                        {['bridal', 'haldi', 'mehendi', 'sangeet', 'reception', 'party'].map((occ) => (
                          <label key={occ} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textTransform: 'capitalize', cursor: 'pointer', fontWeight: 600 }}>
                            <input
                              type="checkbox"
                              checked={productForm.occasions.includes(occ)}
                              onChange={() => handleOccasionCheckboxChange(occ)}
                              style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
                            />
                            {occ}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                      <label className="form-label">Boutique Catalog Description</label>
                      <textarea
                        className="form-input"
                        name="description"
                        rows="3"
                        style={{ height: 'auto' }}
                        placeholder="Detail materials, styling recommendations..."
                        value={productForm.description}
                        onChange={handleProductInputChange}
                      />
                    </div>

                    <div className="admin-form-grid" style={{ marginBottom: '2rem' }}>
                      <div className="form-group">
                        <label className="form-label">Materials List</label>
                        <input
                          type="text"
                          className="form-input"
                          name="materials"
                          placeholder="e.g. Kundan, Pearls, 22k Gold Foil"
                          value={productForm.materials}
                          onChange={handleProductInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Set Includes Accessories</label>
                        <input
                          type="text"
                          className="form-input"
                          name="includes"
                          placeholder="e.g. Necklace, Earrings, Tikka"
                          value={productForm.includes}
                          onChange={handleProductInputChange}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
                      <button type="button" className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-accent btn-shimmer">
                        {formMode === 'add' ? 'Create Product' : 'Save Inventory'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Inventory Grid */}
            <div className="table-scroll-container" style={{ backgroundColor: 'var(--color-white)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-subtle)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--color-border)', backgroundColor: '#FAF8FA' }}>
                    <th style={{ padding: '1.2rem', fontWeight: 700, color: 'var(--color-primary)' }}>Preview</th>
                    <th style={{ padding: '1.2rem', fontWeight: 700, color: 'var(--color-primary)' }}>Item Description</th>
                    <th style={{ padding: '1.2rem', fontWeight: 700, color: 'var(--color-primary)' }}>Category</th>
                    <th style={{ padding: '1.2rem', fontWeight: 700, color: 'var(--color-primary)' }}>Price (₹)</th>
                    <th style={{ padding: '1.2rem', fontWeight: 700, color: 'var(--color-primary)' }}>Occasions</th>
                    <th style={{ padding: '1.2rem', fontWeight: 700, color: 'var(--color-primary)', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        No items found in active inventory matching query.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background-color 0.2s ease' }} className="table-row-hover">
                        <td style={{ padding: '1.2rem' }}>
                          <img src={p.img} alt={p.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--color-border)' }} />
                        </td>
                        <td style={{ padding: '1.2rem' }}>
                          <div style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '0.95rem' }}>{p.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'monospace', marginTop: '0.2rem' }}>ID: {p.id}</div>
                        </td>
                        <td style={{ padding: '1.2rem' }}>
                          <span style={{ fontSize: '0.75rem', backgroundColor: 'var(--color-accent-light)', color: 'var(--color-primary)', padding: '0.25rem 0.6rem', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {p.category}
                          </span>
                        </td>
                        <td style={{ padding: '1.2rem', fontWeight: 700, color: 'var(--color-primary)', fontSize: '1rem' }}>
                          ₹{p.price.toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '1.2rem' }}>
                          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                            {p.occasions.map((occ) => (
                              <span key={occ} style={{ fontSize: '0.75rem', border: '1px solid var(--color-border)', padding: '0.15rem 0.45rem', borderRadius: '4px', textTransform: 'capitalize', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                                {occ}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td style={{ padding: '1.2rem', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                            <button
                              onClick={() => handleOpenEditForm(p)}
                              style={{
                                padding: '0.45rem 0.9rem',
                                fontSize: '0.8rem',
                                border: '1px solid var(--color-primary)',
                                color: 'var(--color-primary)',
                                backgroundColor: 'transparent',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 700,
                                transition: 'all 0.2s ease'
                              }}
                              className="btn-edit-action"
                            >
                              <i className="fa-solid fa-pen-to-square"></i> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              style={{
                                padding: '0.45rem 0.9rem',
                                fontSize: '0.8rem',
                                border: '1px solid #e74c3c',
                                color: '#e74c3c',
                                backgroundColor: 'transparent',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 700,
                                transition: 'all 0.2s ease'
                              }}
                              className="btn-delete-action"
                            >
                              <i className="fa-solid fa-trash"></i> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Occasion Categories Editor */}
        {activeTab === 'occasions' && (
          <div>
            <h2 className="brand-font" style={{ fontSize: '2.4rem', color: 'var(--color-primary)', marginBottom: '0.3rem' }}>
              Homepage Showcase Banners
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '2.5rem' }}>
              Edit headers, visual description writeups, and background cover banners on occasion landing collection pages.
            </p>

            <div className="responsive-auto-grid">
              {/* Editor Column */}
              {editingOccasionKey ? (
                <div className="admin-card" style={{
                  backgroundColor: 'var(--color-white)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '10px',
                  padding: '2rem',
                  boxShadow: 'var(--shadow-medium)',
                  height: 'fit-content'
                }}>
                  <h3 className="brand-font" style={{ fontSize: '1.7rem', color: 'var(--color-primary)', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', textTransform: 'capitalize' }}>
                    Edit Page Banner: {editingOccasionKey}
                  </h3>
                  <form onSubmit={handleOccasionSubmit}>
                    <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                      <label className="form-label">Occasion Collection Title *</label>
                      <input
                        type="text"
                        className="form-input"
                        required
                        value={occasionForm.title}
                        onChange={(e) => setOccasionForm({ ...occasionForm, title: e.target.value })}
                      />
                    </div>
                    
                    <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                      <label className="form-label">Banner Description Paragraph *</label>
                      <textarea
                        className="form-input"
                        required
                        rows="3"
                        style={{ height: 'auto' }}
                        value={occasionForm.desc}
                        onChange={(e) => setOccasionForm({ ...occasionForm, desc: e.target.value })}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.8rem' }}>
                      <label className="form-label">Cover Backdrop Image URL *</label>
                      <input
                        type="url"
                        className="form-input"
                        required
                        value={occasionForm.bg}
                        onChange={(e) => setOccasionForm({ ...occasionForm, bg: e.target.value })}
                      />
                      {occasionForm.bg && (
                        <div style={{ marginTop: '0.8rem', border: '1px solid var(--color-border)', borderRadius: '6px', overflow: 'hidden' }}>
                          <img src={occasionForm.bg} alt="Preview" style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                      <button type="button" className="btn btn-secondary" onClick={() => setEditingOccasionKey(null)}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-accent btn-shimmer">
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="admin-card" style={{
                  backgroundColor: 'var(--color-white)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '10px',
                  padding: '2.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  height: '350px',
                  boxShadow: 'var(--shadow-subtle)'
                }}>
                  <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: 'var(--color-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'var(--color-primary)', marginBottom: '1.2rem' }}>
                    <i className="fa-solid fa-pen-to-square" style={{ marginLeft: '0.4rem' }}></i>
                  </div>
                  <h3 className="brand-font" style={{ fontSize: '1.7rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>Showcase Customizer</h3>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', maxWidth: '300px', lineHeight: 1.4 }}>
                    Select any occasion template from the right panel to customize banners, title text, and header images on the live user storefront.
                  </p>
                </div>
              )}

              {/* Grid List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {Object.keys(occasionsMeta).map((key) => {
                  const occ = occasionsMeta[key];
                  return (
                    <div key={key} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.2rem',
                      padding: '1.2rem',
                      backgroundColor: 'var(--color-white)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      boxShadow: 'var(--shadow-subtle)'
                    }}>
                      <img src={occ.bg} alt={occ.title} style={{ width: '85px', height: '65px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--color-border)' }} />
                      <div style={{ flexGrow: 1, minWidth: 0 }}>
                        <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-accent)', fontWeight: 700, display: 'block' }}>
                          {key} route path
                        </span>
                        <h4 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--color-primary)', margin: '0.1rem 0' }}>{occ.title}</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                          {occ.desc}
                        </p>
                      </div>
                      <button
                        onClick={() => handleOpenEditOccasion(key, occ)}
                        style={{
                          padding: '0.5rem 1rem',
                          fontSize: '0.8rem',
                          border: '1px solid var(--color-primary)',
                          color: 'var(--color-primary)',
                          backgroundColor: 'transparent',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                          transition: 'all 0.2s ease'
                        }}
                        className="btn-edit-action"
                      >
                        Customize
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Bookings & Calendar */}
        {activeTab === 'bookings' && (
          <div>
            <h2 className="brand-font" style={{ fontSize: '2.4rem', color: 'var(--color-primary)', marginBottom: '0.3rem' }}>
              Reservations & Calendar Blocking
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '2.5rem' }}>
              Block unavailable dates for custom items, manage availability, and access client contact information.
            </p>

            <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
              {/* Bookings Feed */}
              <div className="admin-card" style={{
                backgroundColor: 'var(--color-white)',
                border: '1px solid var(--color-border)',
                borderRadius: '10px',
                padding: '2rem',
                boxShadow: 'var(--shadow-subtle)'
              }}>
                <h3 className="brand-font" style={{ fontSize: '1.8rem', color: 'var(--color-primary)', marginBottom: '0.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                  Web Bookings Log
                </h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.4 }}>
                  List of slots reserved by customers. Click the WhatsApp button to immediately open a chat with the client to finalize coordinates.
                </p>

                <div style={{ maxHeight: '550px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '5px' }}>
                  {bookings.length === 0 ? (
                    <div style={{ padding: '5rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                      <i className="fa-regular fa-folder-open" style={{ fontSize: '3rem', marginBottom: '0.8rem', color: 'var(--color-border)' }}></i>
                      <p style={{ fontSize: '0.9rem' }}>No bookings received yet.</p>
                      <small style={{ fontSize: '0.75rem', display: 'block', marginTop: '0.3rem', lineHeight: 1.4 }}>
                        Verify system flow by booking a set from the showcase catalog using the customer checkout modal.
                      </small>
                    </div>
                  ) : (
                    bookings.map((b, index) => (
                      <div key={index} style={{
                        padding: '1.2rem',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                        backgroundColor: '#FAF8FA',
                        boxShadow: 'var(--shadow-subtle)',
                        borderLeft: '4px solid var(--color-accent)',
                        position: 'relative'
                      }}>
                        {/* WhatsApp Contact Action */}
                        <a
                          href={`https://wa.me/91${b.phone}?text=${encodeURIComponent(`Hi ${b.name}! This is Varsha Jain from Yuktaa Designer Jewellery. I received your booking slot request for the set "${b.productName}" on ${b.date}. Let's coordinate your boutique visit.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Contact Client on WhatsApp"
                          style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: '#25D366',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.1rem',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                          }}
                        >
                          <i className="fa-brands fa-whatsapp"></i>
                        </a>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingRight: '2rem' }}>
                          <span style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '1.05rem' }}>{b.name}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                            Logged: {new Date(b.timestamp).toLocaleString()}
                          </span>

                          <div style={{ fontSize: '0.85rem', display: 'grid', gridTemplateColumns: '80px 1fr', gap: '0.3rem', marginTop: '0.5rem' }}>
                            <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Phone:</span>
                            <span style={{ fontWeight: 600 }}>{b.phone}</span>

                            <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Set Name:</span>
                            <span style={{ fontWeight: 600 }}>{b.productName}</span>

                            <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Event Date:</span>
                            <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                              {new Date(b.date).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </span>

                            <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Occasion:</span>
                            <span>{b.eventType}</span>

                            <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Deposit:</span>
                            <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
                              ₹{b.depositAmount.toLocaleString()} ({b.paymentMethod})
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab X: Sign-ups / Leads */}
        {activeTab === 'leads' && (
          <div className="admin-tab-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h3 className="brand-font" style={{ fontSize: '1.8rem', color: 'var(--color-primary)' }}>Wallet Sign-ups</h3>
                <p style={{ color: 'var(--color-text-muted)' }}>Leads collected from the Welcome Voucher Shagun envelope.</p>
              </div>
            </div>

            <div className="admin-card" style={{ padding: '0', overflow: 'hidden' }}>
              {!leads || leads.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  <i className="fa-solid fa-users-slash" style={{ fontSize: '2rem', marginBottom: '1rem', color: '#cbd5e1' }}></i>
                  <p>No leads captured yet.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                        <th style={{ padding: '1.2rem', color: 'var(--color-primary)', fontWeight: 600 }}>Date</th>
                        <th style={{ padding: '1.2rem', color: 'var(--color-primary)', fontWeight: 600 }}>Name</th>
                        <th style={{ padding: '1.2rem', color: 'var(--color-primary)', fontWeight: 600 }}>Phone</th>
                        <th style={{ padding: '1.2rem', color: 'var(--color-primary)', fontWeight: 600 }}>Source</th>
                        <th style={{ padding: '1.2rem', color: 'var(--color-primary)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map((lead, idx) => (
                        <tr key={lead.id || idx} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.2s' }}>
                          <td style={{ padding: '1.2rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                            {new Date(lead.created_at).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '1.2rem', fontWeight: 500, color: 'var(--color-primary)' }}>
                            {lead.name}
                          </td>
                          <td style={{ padding: '1.2rem', fontSize: '0.95rem' }}>
                            {lead.phone}
                          </td>
                          <td style={{ padding: '1.2rem' }}>
                            <span style={{ backgroundColor: 'var(--color-accent-light)', color: 'var(--color-primary)', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                              {lead.source || 'Unknown'}
                            </span>
                          </td>
                          <td style={{ padding: '1.2rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <a 
                              href={`https://wa.me/${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${lead.name.split(' ')[0]}, I saw you claimed your ₹${(settings?.welcome_voucher_amount || 2000).toLocaleString('en-IN')} welcome voucher! Let me know if you need help browsing our collection.`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn"
                              style={{ backgroundColor: '#25D366', borderColor: '#25D366', color: '#fff', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                            >
                              <i className="fa-brands fa-whatsapp"></i> Chat
                            </a>
                            <a 
                              href={`tel:${lead.phone.replace(/\D/g, '')}`}
                              className="btn btn-secondary"
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                            >
                              <i className="fa-solid fa-phone"></i> Call
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Buy Orders */}
        {activeTab === 'orders' && (
          <div className="admin-tab-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h3 className="brand-font" style={{ fontSize: '1.8rem', color: 'var(--color-primary)' }}>Buy Orders Management</h3>
                <p style={{ color: 'var(--color-text-muted)' }}>Orders submitted by customers to purchase jewellery sets outright.</p>
              </div>
            </div>

            <div className="admin-card" style={{ padding: '0', overflow: 'hidden' }}>
              {!orders || orders.length === 0 ? (
                <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  <i className="fa-solid fa-bag-shopping" style={{ fontSize: '3.5rem', marginBottom: '1rem', color: '#cbd5e1', display: 'block' }}></i>
                  <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-primary)' }}>No buy orders received yet.</p>
                  <p style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>Place a test order from the website product pages to verify.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                        <th style={{ padding: '1.2rem', color: 'var(--color-primary)', fontWeight: 600 }}>Date</th>
                        <th style={{ padding: '1.2rem', color: 'var(--color-primary)', fontWeight: 600 }}>Customer Details</th>
                        <th style={{ padding: '1.2rem', color: 'var(--color-primary)', fontWeight: 600 }}>Jewellery Set</th>
                        <th style={{ padding: '1.2rem', color: 'var(--color-primary)', fontWeight: 600 }}>Amount</th>
                        <th style={{ padding: '1.2rem', color: 'var(--color-primary)', fontWeight: 600 }}>Shipping Address</th>
                        <th style={{ padding: '1.2rem', color: 'var(--color-primary)', fontWeight: 600 }}>Status</th>
                        <th style={{ padding: '1.2rem', color: 'var(--color-primary)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order, idx) => {
                        const dateFormatted = order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        }) : 'N/A';
                        
                        return (
                          <tr key={order.id || idx} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background 0.2s' }}>
                            <td style={{ padding: '1.2rem', fontSize: '0.9rem', color: 'var(--color-text-muted)', verticalAlign: 'top' }}>
                              {dateFormatted}
                            </td>
                            <td style={{ padding: '1.2rem', verticalAlign: 'top' }}>
                              <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{order.customer_name}</div>
                              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>{order.customer_phone}</div>
                            </td>
                            <td style={{ padding: '1.2rem', verticalAlign: 'top' }}>
                              <div style={{ fontWeight: 500 }}>{order.product_name}</div>
                              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>ID: {order.product_id || 'Deleted'}</span>
                            </td>
                            <td style={{ padding: '1.2rem', fontWeight: 700, color: 'var(--color-primary)', verticalAlign: 'top' }}>
                              ₹{order.buy_price?.toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '1.2rem', fontSize: '0.85rem', maxWidth: '250px', whiteSpace: 'normal', wordBreak: 'break-word', verticalAlign: 'top' }}>
                              <div>{order.delivery_address}</div>
                              <div style={{ fontWeight: 600, color: 'var(--color-text-muted)', marginTop: '2px' }}>{order.city} - {order.pincode}</div>
                              {order.notes && (
                                <div style={{ fontSize: '0.75rem', color: '#9c27b0', fontStyle: 'italic', marginTop: '5px', backgroundColor: '#f3e5f5', padding: '0.2rem 0.5rem', borderRadius: '4px', display: 'inline-block' }}>
                                  Note: {order.notes}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '1.2rem', verticalAlign: 'top' }}>
                              <select
                                value={order.order_status || 'Pending'}
                                onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                style={{
                                  padding: '0.35rem 0.6rem',
                                  borderRadius: '50px',
                                  fontSize: '0.8rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  border: 'none',
                                  outline: 'none',
                                  backgroundColor: 
                                    order.order_status === 'Confirmed' ? '#e1f5fe' :
                                    order.order_status === 'Shipped' ? '#efebe9' :
                                    order.order_status === 'Delivered' ? '#e8f5e9' :
                                    order.order_status === 'Cancelled' ? '#ffebee' : '#fff8e1',
                                  color:
                                    order.order_status === 'Confirmed' ? '#0288d1' :
                                    order.order_status === 'Shipped' ? '#5d4037' :
                                    order.order_status === 'Delivered' ? '#2e7d32' :
                                    order.order_status === 'Cancelled' ? '#c62828' : '#f57f17'
                                }}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td style={{ padding: '1.2rem', textAlign: 'right', verticalAlign: 'top' }}>
                              <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                                <a 
                                  href={`https://wa.me/91${order.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                    `Hi ${order.customer_name}! This is Varsha Jain from Yuktaa Designer Jewellery. I received your order to buy the "${order.product_name}" (₹${order.buy_price?.toLocaleString('en-IN')}). Let's confirm your delivery address and payment details.`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn"
                                  style={{ backgroundColor: '#25D366', borderColor: '#25D366', color: '#fff', padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                                >
                                  <i className="fa-brands fa-whatsapp"></i> Chat
                                </a>
                                <button 
                                  onClick={() => triggerConfirm('Delete Order', `Are you sure you want to permanently delete the order from ${order.customer_name}?`, () => handleDeleteOrder(order.id))}
                                  className="btn btn-secondary"
                                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: '#c0392b' }}
                                >
                                  <i className="fa-solid fa-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Database Backup & Restore */}
        {activeTab === 'backup' && (
          <div>
            <h2 className="brand-font" style={{ fontSize: '2.4rem', color: 'var(--color-primary)', marginBottom: '0.3rem' }}>
              Database Export & Import
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '2.5rem' }}>
              Backup catalog data files or load custom backups into the boutique browser database.
            </p>

            <div className="responsive-auto-grid">
              {/* Export panel */}
              <div className="admin-card" style={{
                backgroundColor: 'var(--color-white)',
                border: '1px solid var(--color-border)',
                borderRadius: '10px',
                padding: '2rem',
                boxShadow: 'var(--shadow-subtle)',
                height: 'fit-content'
              }}>
                <h3 className="brand-font" style={{ fontSize: '1.7rem', color: 'var(--color-primary)', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                  Database Backup Export
                </h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  Generate and download a full snapshot of your current jewelry catalog and settings. You can copy the code block to share with the site administrator or developer.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <button onClick={handleBackupExport} className="btn btn-accent btn-shimmer" style={{ width: '100%', gap: '0.6rem' }}>
                    <i className="fa-solid fa-file-arrow-download"></i> Download Backup JSON File
                  </button>
                  
                  <button onClick={() => {
                    const dataStr = JSON.stringify({ products, occasionsMeta }, null, 2);
                    navigator.clipboard.writeText(dataStr);
                    triggerNotification('Database JSON copied to clipboard!');
                  }} className="btn btn-primary" style={{ width: '100%', gap: '0.6rem' }}>
                    <i className="fa-solid fa-copy"></i> Copy JSON to Clipboard
                  </button>
                </div>

                <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '0.8rem' }}>Database Diagnostics</span>
                  <div className="admin-form-grid" style={{ gap: '1rem' }}>
                    <div style={{ padding: '0.8rem', border: '1px solid var(--color-border)', borderRadius: '6px', backgroundColor: '#FAF8FA' }}>
                      <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-primary)', display: 'block' }}>{products.length}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Products Listed</span>
                    </div>
                    <div style={{ padding: '0.8rem', border: '1px solid var(--color-border)', borderRadius: '6px', backgroundColor: '#FAF8FA' }}>
                      <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-primary)', display: 'block' }}>{bookings.length}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Customer Bookings</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Import panel */}
              <div className="admin-card" style={{
                backgroundColor: 'var(--color-white)',
                border: '1px solid var(--color-border)',
                borderRadius: '10px',
                padding: '2rem',
                boxShadow: 'var(--shadow-subtle)',
                height: 'fit-content'
              }}>
                <h3 className="brand-font" style={{ fontSize: '1.7rem', color: 'var(--color-primary)', marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                  Import & Restore Inventory
                </h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  Paste a JSON backup block below and click restore to load products and showcase banners. <strong style={{ color: '#c0392b' }}>This completely replaces all active browser configurations.</strong>
                </p>

                <form onSubmit={handleBackupImport}>
                  <textarea
                    className="form-input"
                    required
                    rows="8"
                    style={{ height: 'auto', fontFamily: 'monospace', fontSize: '0.75rem', borderRadius: '4px', marginBottom: '1rem' }}
                    placeholder='Paste backup JSON code block here (containing "products" and "occasionsMeta" keys)...'
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                  />

                  <button type="submit" className="btn btn-accent btn-shimmer" style={{ width: '100%', gap: '0.5rem' }}>
                    <i className="fa-solid fa-file-arrow-up"></i> Load & Import JSON Data
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5.5: Offer & Terms Settings */}
        {activeTab === 'offer_settings' && (
          <div>
            <div style={{ marginBottom: '2rem' }}>
              <h2 className="brand-font" style={{ fontSize: '2.4rem', color: 'var(--color-primary)', marginBottom: '0.3rem' }}>
                Offer & Terms Settings
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                Manage the welcome voucher rules, credit amounts, and general terms & conditions.
              </p>
            </div>

            <form onSubmit={handleSaveOfferSettings}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '2rem',
                alignItems: 'start'
              }}>
                {/* Left Column: Basic Parameters */}
                <div style={{
                  backgroundColor: 'var(--color-white)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '10px',
                  padding: '2rem',
                  boxShadow: 'var(--shadow-subtle)'
                }}>
                  <h3 className="brand-font" style={{ fontSize: '1.7rem', color: 'var(--color-primary)', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                    Welcome Offer Parameters
                  </h3>

                  <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                    <label className="form-label">Voucher Code</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      placeholder="e.g. YUKTAA2000"
                      value={localVoucherCode}
                      onChange={(e) => setLocalVoucherCode(e.target.value)}
                      style={{ height: '45px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                    <label className="form-label">Welcome Voucher Amount (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      required
                      placeholder="e.g. 2000"
                      value={localVoucherAmount}
                      onChange={(e) => setLocalVoucherAmount(Number(e.target.value))}
                      style={{ height: '45px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                    <label className="form-label">Minimum Bill for Offer (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      required
                      placeholder="e.g. 6000"
                      value={localMinBill}
                      onChange={(e) => setLocalMinBill(Number(e.target.value))}
                      style={{ height: '45px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label">Redemption Percentage Limit (%)</label>
                    <input
                      type="number"
                      className="form-input"
                      required
                      min="1"
                      max="100"
                      placeholder="e.g. 50"
                      value={localRedeemLimit}
                      onChange={(e) => setLocalRedeemLimit(Number(e.target.value))}
                      style={{ height: '45px', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                    />
                    <small style={{ display: 'block', marginTop: '0.4rem', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                      Maximum percentage of the total bill that can be paid using wallet credits.
                    </small>
                  </div>

                  <button type="submit" className="btn btn-accent btn-shimmer" disabled={isSavingSettings} style={{ width: '100%', height: '45px', borderRadius: '6px', gap: '0.5rem' }}>
                    <i className={`fa-solid ${isSavingSettings ? 'fa-spinner fa-spin' : 'fa-floppy-disk'}`}></i>
                    {isSavingSettings ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>

                {/* Right Column: Terms List Builder */}
                <div style={{
                  backgroundColor: 'var(--color-white)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '10px',
                  padding: '2rem',
                  boxShadow: 'var(--shadow-subtle)'
                }}>
                  <h3 className="brand-font" style={{ fontSize: '1.7rem', color: 'var(--color-primary)', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                    Terms & Conditions List
                  </h3>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                    Manage the terms shown to customers on the wallet page. Update the text below or delete items as needed.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                    {localTerms.map((term, index) => (
                      <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-muted)', minWidth: '20px' }}>
                          {index + 1}.
                        </span>
                        <input
                          type="text"
                          className="form-input"
                          required
                          value={term}
                          onChange={(e) => handleUpdateTerm(index, e.target.value)}
                          placeholder="Enter term and condition..."
                          style={{ flexGrow: 1, height: '40px', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteTerm(index)}
                          style={{
                            backgroundColor: 'transparent',
                            border: '1px solid #e74c3c',
                            borderRadius: '4px',
                            color: '#e74c3c',
                            width: '40px',
                            height: '40px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                            flexShrink: 0
                          }}
                          className="delete-term-btn"
                          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#e74c3c'; e.currentTarget.style.color = '#fff'; }}
                          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#e74c3c'; }}
                          title="Delete term"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    ))}

                    {localTerms.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '1.5rem', border: '1px dashed var(--color-border)', borderRadius: '6px', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                        No terms added yet. Click 'Add New Term' to start.
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddTerm}
                    className="btn btn-secondary"
                    style={{ width: '100%', height: '40px', borderRadius: '6px', gap: '0.5rem', justifyContent: 'center' }}
                  >
                    <i className="fa-solid fa-plus"></i> Add New Term
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Tab 6: Security Settings */}
        {activeTab === 'settings' && (
          <div>
            <div style={{ marginBottom: '2rem' }}>
              <h2 className="brand-font" style={{ fontSize: '2.4rem', color: 'var(--color-primary)', marginBottom: '0.3rem' }}>
                Security Settings
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                Manage your admin panel access credentials.
              </p>
            </div>

            <div style={{ maxWidth: '480px' }}>
              <div style={{
                backgroundColor: 'var(--color-white)',
                border: '1px solid var(--color-border)',
                borderRadius: '10px',
                padding: '2rem',
                boxShadow: 'var(--shadow-subtle)'
              }}>
                <h3 className="brand-font" style={{ fontSize: '1.7rem', color: 'var(--color-primary)', marginBottom: '0.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                  Change Admin Password
                </h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  Update your admin panel password. You will need to enter your current password to confirm the change.
                </p>

                <form onSubmit={handleChangePassword}>
                  <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                    <label className="form-label">Current Password</label>
                    <input
                      type="password"
                      className="form-input"
                      required
                      placeholder="Enter current password"
                      value={changePasswordForm.currentPassword}
                      onChange={(e) => setChangePasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      style={{ height: '45px', borderRadius: '6px', border: '1px solid var(--color-border)', letterSpacing: '2px' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.2rem' }}>
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-input"
                      required
                      placeholder="Enter new password"
                      value={changePasswordForm.newPassword}
                      onChange={(e) => setChangePasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      style={{ height: '45px', borderRadius: '6px', border: '1px solid var(--color-border)', letterSpacing: '2px' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-input"
                      required
                      placeholder="Re-enter new password"
                      value={changePasswordForm.confirmPassword}
                      onChange={(e) => setChangePasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      style={{ height: '45px', borderRadius: '6px', border: '1px solid var(--color-border)', letterSpacing: '2px' }}
                    />
                  </div>

                  {changePasswordError && (
                    <div style={{ color: '#c0392b', fontSize: '0.82rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <i className="fa-solid fa-triangle-exclamation"></i> {changePasswordError}
                    </div>
                  )}

                  <button type="submit" className="btn btn-accent btn-shimmer" disabled={isChangingPassword} style={{ width: '100%', height: '45px', borderRadius: '6px', gap: '0.5rem' }}>
                    <i className={`fa-solid ${isChangingPassword ? 'fa-spinner fa-spin' : 'fa-key'}`}></i>
                    {isChangingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </form>

                <div style={{ marginTop: '1.5rem', padding: '0.8rem 1rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', fontSize: '0.8rem', color: '#166534', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <i className="fa-solid fa-circle-check" style={{ marginTop: '0.1rem', flexShrink: 0 }}></i>
                  <span>Password is <strong>stored in Supabase</strong> and synced across all devices. Browser localStorage is used as an offline fallback. If you never ran the SQL setup, the default password is <strong>1234</strong>.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
