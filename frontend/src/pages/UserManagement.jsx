import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import AlertBox from '../components/AlertBox';
import BigButton from '../components/BigButton';
import LoadingSpinner from '../components/LoadingSpinner';

export default function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: 'info' });

  // State Modal Tambah/Edit
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    username: '',
    userdesc: '',
    pass: '',
    usertype: 'operator',
    jenisuser: 'kasir',
    cabang: 'T1',
  });
  const [isSaving, setIsSaving] = useState(false);

  // Load Users
  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const res = await userService.getUsers();
      if (res && res.data) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error('Error load users:', err);
      setMessage({
        text: err.friendlyMessage || 'Gagal memuat daftar user dari database.',
        type: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Filter Search
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.userdesc && u.userdesc.toLowerCase().includes(q)) ||
      (u.cabang && u.cabang.toLowerCase().includes(q))
    );
  });

  // Buka Modal Tambah
  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({
      id: '',
      username: '',
      userdesc: '',
      pass: '',
      usertype: 'operator',
      jenisuser: 'kasir',
      cabang: 'T1',
    });
    setShowModal(true);
  };

  // Buka Modal Edit
  const handleOpenEdit = (user) => {
    setIsEditing(true);
    setFormData({
      id: user.id,
      username: user.username || '',
      userdesc: user.userdesc || '',
      pass: '', // Kosongkan password jika tidak ingin diubah
      usertype: user.usertype || 'operator',
      jenisuser: user.jenisuser || 'kasir',
      cabang: user.cabang || 'T1',
    });
    setShowModal(true);
  };

  // Hapus User
  const handleDeleteUser = async (user) => {
    const isConfirm = window.confirm(`Apakah Anda yakin ingin menghapus user "${user.username}" (${user.userdesc})?`);
    if (!isConfirm) return;

    try {
      await userService.deleteUser(user.id, user.username);
      setMessage({ text: `✅ User "${user.username}" berhasil dihapus.`, type: 'success' });
      loadUsers();
    } catch (err) {
      setMessage({ text: err.friendlyMessage || 'Gagal menghapus user.', type: 'danger' });
    }
  };

  // Simpan Form
  const handleSaveForm = async (e) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.userdesc.trim()) {
      alert('Username dan Nama Lengkap wajib diisi.');
      return;
    }

    if (!isEditing && !formData.pass.trim()) {
      alert('Kata sandi wajib diisi untuk user baru.');
      return;
    }

    try {
      setIsSaving(true);
      if (isEditing) {
        // Update user
        const payload = { ...formData };
        if (!payload.pass) delete payload.pass; // Jangan kirim pass kosong jika tidak diubah
        await userService.updateUser(payload);
        setMessage({ text: `✅ Data user "${formData.username}" berhasil diperbarui.`, type: 'success' });
      } else {
        // Create user
        await userService.createUser(formData);
        setMessage({ text: `✅ User baru "${formData.username}" berhasil ditambahkan.`, type: 'success' });
      }
      setShowModal(false);
      loadUsers();
    } catch (err) {
      setMessage({ text: err.friendlyMessage || 'Gagal menyimpan data user.', type: 'danger' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container py-4">
      
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="h3 fw-bold text-dark mb-1">👥 Kelola Data Karyawan / User</h2>
          <p className="text-secondary mb-0">Daftar staf operasional, kasir, dan teknisi.</p>
        </div>
        <div className="d-flex gap-2">
          <BigButton variant="success" size="lg" icon="bi-person-plus-fill" onClick={handleOpenAdd}>
            TAMBAH USER BARU
          </BigButton>
          <button onClick={() => navigate('/')} className="btn btn-outline-secondary btn-lg">
            <i className="bi bi-arrow-left"></i> Menu Utama
          </button>
        </div>
      </div>

      {/* Alert */}
      <AlertBox
        type={message.type}
        message={message.text}
        onClose={() => setMessage({ text: '', type: 'info' })}
      />

      {/* Pencarian */}
      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body p-3 p-md-4">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-8">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 fs-4 text-muted">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control form-control-lg border-start-0 ps-0"
                  placeholder="Cari berdasarkan nama, username, atau cabang..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="col-12 col-md-4 text-md-end">
              <span className="badge bg-light text-dark fs-6 p-2 border">
                Total: <strong>{filteredUsers.length}</strong> Karyawan
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabel Data User */}
      <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
        {isLoading ? (
          <LoadingSpinner text="Memuat daftar user..." />
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-people fs-1 d-block mb-2"></i>
            <p className="fs-5">Tidak ada data user yang sesuai.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover table-custom mb-0">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>No</th>
                  <th>Username</th>
                  <th>Nama Lengkap</th>
                  <th>Tipe / Peran</th>
                  <th>Jenis</th>
                  <th>Cabang</th>
                  <th className="text-center" style={{ width: '220px' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, index) => (
                  <tr key={u.id || index}>
                    <td className="text-muted fw-bold">{index + 1}</td>
                    <td className="fw-bold text-primary fs-6">{u.username}</td>
                    <td className="fw-bold">{u.userdesc || '-'}</td>
                    <td>
                      <span className="badge bg-primary-subtle text-primary border border-primary px-2 py-1">
                        {u.usertype || 'operator'}
                      </span>
                    </td>
                    <td>{u.jenisuser || 'kasir'}</td>
                    <td>
                      <span className="badge bg-secondary-subtle text-secondary border px-2 py-1">
                        {u.cabang || '-'}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-2">
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm px-3"
                          onClick={() => handleOpenEdit(u)}
                        >
                          <i className="bi bi-pencil-square"></i> Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm px-3"
                          onClick={() => handleDeleteUser(u)}
                        >
                          <i className="bi bi-trash-fill"></i> Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form Tambah / Edit */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow">
              
              <div className="modal-header bg-primary text-white p-3">
                <h3 className="modal-title fs-5 fw-bold">
                  {isEditing ? '✏️ Edit Data Karyawan' : '➕ Tambah Karyawan Baru'}
                </h3>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <form onSubmit={handleSaveForm}>
                <div className="modal-body p-4">
                  
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label htmlFor="modalUsername" className="form-label">
                        Username (Nama Login):
                      </label>
                      <input
                        id="modalUsername"
                        type="text"
                        className="form-control form-control-lg"
                        placeholder="Contoh: ricky, budi01"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label htmlFor="modalUserdesc" className="form-label">
                        Nama Lengkap Petugas:
                      </label>
                      <input
                        id="modalUserdesc"
                        type="text"
                        className="form-control form-control-lg"
                        placeholder="Contoh: Budi Santoso"
                        value={formData.userdesc}
                        onChange={(e) => setFormData({ ...formData, userdesc: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label htmlFor="modalPass" className="form-label">
                        Kata Sandi (Password):
                      </label>
                      <input
                        id="modalPass"
                        type="text"
                        className="form-control form-control-lg"
                        placeholder={isEditing ? 'Kosongkan jika tidak ingin mengganti password' : 'Ketik kata sandi user baru'}
                        value={formData.pass}
                        onChange={(e) => setFormData({ ...formData, pass: e.target.value })}
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label htmlFor="modalUsertype" className="form-label">
                        Tipe User:
                      </label>
                      <select
                        id="modalUsertype"
                        className="form-select form-select-lg"
                        value={formData.usertype}
                        onChange={(e) => setFormData({ ...formData, usertype: e.target.value })}
                      >
                        <option value="operator">Operator</option>
                        <option value="admin">Admin</option>
                        <option value="supervisor">Supervisor</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-4">
                      <label htmlFor="modalJenisuser" className="form-label">
                        Jenis User:
                      </label>
                      <select
                        id="modalJenisuser"
                        className="form-select form-select-lg"
                        value={formData.jenisuser}
                        onChange={(e) => setFormData({ ...formData, jenisuser: e.target.value })}
                      >
                        <option value="kasir">Kasir</option>
                        <option value="teknisi">Teknisi</option>
                        <option value="lapangan">Staf Lapangan</option>
                      </select>
                    </div>

                    <div className="col-12 col-md-4">
                      <label htmlFor="modalCabang" className="form-label">
                        Cabang / Terminal:
                      </label>
                      <select
                        id="modalCabang"
                        className="form-select form-select-lg"
                        value={formData.cabang}
                        onChange={(e) => setFormData({ ...formData, cabang: e.target.value })}
                      >
                        <option value="T1">Terminal 1 (T1)</option>
                        <option value="T2">Terminal 2 (T2)</option>
                        <option value="T3">Terminal 3 (T3)</option>
                        <option value="HO">Head Office (HO)</option>
                      </select>
                    </div>
                  </div>

                </div>

                <div className="modal-footer bg-light p-3">
                  <button
                    type="button"
                    className="btn btn-secondary btn-lg"
                    onClick={() => setShowModal(false)}
                  >
                    Batal
                  </button>
                  <BigButton
                    type="submit"
                    variant="success"
                    size="lg"
                    disabled={isSaving}
                    icon="bi-check-circle-fill"
                  >
                    {isSaving ? 'Menyimpan...' : 'SIMPAN DATA'}
                  </BigButton>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
