import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { shiftService } from '../services/shiftService';
import AlertBox from '../components/AlertBox';
import BigButton from '../components/BigButton';

export default function ShiftPage({ currentUser }) {
  const navigate = useNavigate();
  const [activeShift, setActiveShift] = useState(shiftService.getActiveShift());
  const [shiftHistory, setShiftHistory] = useState(shiftService.getShiftHistory());
  
  const [selectedShiftCode, setSelectedShiftCode] = useState('shift 01');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState({ text: '', type: 'info' });

  // Handle Mulai Shift
  const handleStartShift = (e) => {
    e.preventDefault();
    if (activeShift) {
      setMessage({ text: 'Anda sudah memiliki shift yang sedang aktif.', type: 'warning' });
      return;
    }

    const shiftData = {
      shiftCode: selectedShiftCode,
      username: currentUser?.username || 'Operator',
      userdesc: currentUser?.userdesc || 'Petugas',
      cabang: currentUser?.cabang || 'T1',
      notes: notes.trim(),
    };

    const created = shiftService.startShift(shiftData);
    setActiveShift(created);
    setShiftHistory(shiftService.getShiftHistory());
    setMessage({
      text: `✅ Berhasil memulai ${selectedShiftCode.toUpperCase()}! Selamat bertugas.`,
      type: 'success',
    });
  };

  // Handle Selesai Shift
  const handleEndShift = () => {
    const isConfirm = window.confirm('Apakah Anda yakin ingin menyelesaikan shift ini dan menutup jam kerja?');
    if (!isConfirm) return;

    const finished = shiftService.endShift();
    setActiveShift(null);
    setShiftHistory(shiftService.getShiftHistory());
    setMessage({
      text: `✅ Shift ${finished?.shiftCode || ''} berhasil diselesaikan. Terima kasih atas kerja keras Anda!`,
      type: 'success',
    });
  };

  return (
    <div className="container py-4">
      
      {/* Header Halaman */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="h3 fw-bold text-dark mb-1">⏱️ Absen & Shift Kerja</h2>
          <p className="text-secondary mb-0">Kelola mulai dan selesai shift operasional harian Anda.</p>
        </div>
        <button onClick={() => navigate('/')} className="btn btn-outline-secondary btn-lg">
          <i className="bi bi-arrow-left"></i> Kembali
        </button>
      </div>

      {/* Alert Pesan */}
      <AlertBox
        type={message.type}
        message={message.text}
        onClose={() => setMessage({ text: '', type: 'info' })}
      />

      <div className="row g-4">
        {/* Kolom Kiri: Status & Aksi Shift */}
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm border-0 rounded-4 h-100">
            <div className="card-header bg-primary text-white p-3">
              <h3 className="h5 fw-bold mb-0 d-flex align-items-center gap-2">
                <i className="bi bi-person-badge"></i>
                Status Shift Anda
              </h3>
            </div>

            <div className="card-body p-4">
              {activeShift ? (
                <div className="text-center py-3">
                  <div className="display-4 text-success mb-2">🟢</div>
                  <h4 className="fw-bold text-success mb-2">SHIFT SEDANG AKTIF</h4>
                  <p className="fs-5 mb-1">
                    Kode Shift: <strong className="text-primary fs-4">{activeShift.shiftCode}</strong>
                  </p>
                  <p className="fs-6 text-muted mb-3">
                    Waktu Mulai: <strong>{new Date(activeShift.startTime).toLocaleTimeString('id-ID')} ({new Date(activeShift.startTime).toLocaleDateString('id-ID')})</strong>
                  </p>
                  <p className="fs-6 text-secondary mb-4">
                    Petugas: <strong>{activeShift.userdesc}</strong> | Cabang: <strong>{activeShift.cabang}</strong>
                  </p>

                  <BigButton
                    variant="danger"
                    size="xl"
                    fullWidth
                    onClick={handleEndShift}
                    icon="bi-stop-circle-fill"
                  >
                    SELESAIKAN SHIFT SEKARANG
                  </BigButton>
                </div>
              ) : (
                <form onSubmit={handleStartShift}>
                  <div className="alert alert-warning mb-4">
                    <i className="bi bi-info-circle-fill me-2"></i>
                    Pilih shift yang sesuai dengan jadwal Anda hari ini, lalu tekan tombol hijau di bawah.
                  </div>

                  <div className="mb-4">
                    <label htmlFor="shiftSelect" className="form-label">
                      Pilih Jam Shift:
                    </label>
                    <select
                      id="shiftSelect"
                      className="form-select form-select-lg"
                      value={selectedShiftCode}
                      onChange={(e) => setSelectedShiftCode(e.target.value)}
                    >
                      <option value="shift 01">Shift 01 (Pagi: 06:00 - 14:00)</option>
                      <option value="shift 02">Shift 02 (Siang: 14:00 - 22:00)</option>
                      <option value="shift 03">Shift 03 (Malam: 22:00 - 06:00)</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="inputNotes" className="form-label">
                      Catatan Tambahan (Opsional):
                    </label>
                    <input
                      id="inputNotes"
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="Contoh: Menggantikan shift rekan..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  <BigButton
                    type="submit"
                    variant="success"
                    size="xl"
                    fullWidth
                    icon="bi-play-circle-fill"
                  >
                    MULAI SHIFT KERJA
                  </BigButton>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Riwayat Shift Terakhir */}
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm border-0 rounded-4 h-100">
            <div className="card-header bg-light p-3 border-bottom">
              <h3 className="h5 fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <i className="bi bi-clock-history text-primary"></i>
                Riwayat Shift Terakhir
              </h3>
            </div>

            <div className="card-body p-3">
              {shiftHistory.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-journal-x fs-1 d-block mb-2"></i>
                  <p className="fs-5">Belum ada riwayat shift yang tersimpan di perangkat ini.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover table-custom mb-0">
                    <thead>
                      <tr>
                        <th>Shift</th>
                        <th>Mulai</th>
                        <th>Selesai</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shiftHistory.map((item, index) => (
                        <tr key={index}>
                          <td className="fw-bold text-primary">{item.shiftCode}</td>
                          <td>
                            {item.startTime
                              ? new Date(item.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                              : '-'}
                          </td>
                          <td>
                            {item.endTime
                              ? new Date(item.endTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                              : '-'}
                          </td>
                          <td>
                            <span className="badge bg-success">{item.status || 'SELESAI'}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
