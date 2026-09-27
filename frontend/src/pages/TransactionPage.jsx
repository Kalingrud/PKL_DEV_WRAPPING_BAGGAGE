import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { wrapService } from '../services/wrapService';
import { shiftService } from '../services/shiftService';
import AlertBox from '../components/AlertBox';
import BigButton from '../components/BigButton';
import LoadingSpinner from '../components/LoadingSpinner';

export default function TransactionPage({ currentUser }) {
  const navigate = useNavigate();
  const activeShift = shiftService.getActiveShift();

  const [priceList, setPriceList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [selectedPack, setSelectedPack] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [paymentType, setPaymentType] = useState('CASH'); // CASH, EDC, QRIS
  const [paymentReff, setPaymentReff] = useState('-');
  const [qrCode, setQrCode] = useState('TRX' + Date.now());
  const [message, setMessage] = useState({ text: '', type: 'info' });
  const [lastSavedTrx, setLastSavedTrx] = useState(null);

  // Load harga wrapping dari backend
  useEffect(() => {
    async function loadPrices() {
      try {
        setIsLoading(true);
        const terminal = currentUser?.cabang || 'T1';
        const prices = await wrapService.getPrices(terminal);
        setPriceList(prices);
        if (prices && prices.length > 0) {
          setSelectedPack(prices[0]);
        }
      } catch (err) {
        console.error('Error load prices:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadPrices();
  }, [currentUser]);

  // Hitung Total
  const calculateTotal = () => {
    if (!selectedPack) return 0;
    const cleanPrice = String(selectedPack.price || '0').replace(/[.,]/g, '');
    const numPrice = parseInt(cleanPrice, 10) || 0;
    return numPrice * quantity;
  };

  // Format Rupiah
  const formatRupiah = (val) => {
    return 'Rp ' + Number(val).toLocaleString('id-ID');
  };

  // Submit Transaksi ke Backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPack) {
      setMessage({ text: 'Mohon pilih paket wrapping terlebih dahulu.', type: 'warning' });
      return;
    }

    const termCode = currentUser?.cabang || 'T1';
    const shiftCode = activeShift ? activeShift.shiftCode : 'shift 01';
    const loginCode = currentUser?.username || 'admin';
    const now = new Date();
    const endTrx = now.toISOString().slice(0, 19).replace('T', ' ');

    const payload = {
      TrxType: 'Penjualan',
      Termcode: termCode,
      ShiftCode: shiftCode,
      LoginCode: loginCode,
      EngineCode: '1',
      qty: String(quantity),
      QRCode: qrCode || ('TRX' + Date.now()),
      pack_type: selectedPack.pack_type || 'WRAP_STD',
      payment_type: paymentType,
      payment_reff: paymentReff || '-',
      parent_code: '-',
      end_trx: endTrx,
    };

    try {
      setIsSubmitting(true);
      setMessage({ text: '', type: 'info' });

      const res = await wrapService.submitTransaction(payload);
      
      const successData = {
        ...payload,
        name: selectedPack.name,
        totalAmount: calculateTotal(),
        time: new Date().toLocaleTimeString('id-ID'),
      };

      setLastSavedTrx(successData);
      setMessage({
        text: `✅ Transaksi ${selectedPack.name} (${quantity}x) Berhasil Disimpan! Total: ${formatRupiah(calculateTotal())}`,
        type: 'success',
      });

      // Reset transaksi untuk input berikutnya
      setQuantity(1);
      setQrCode('TRX' + Date.now());
      setPaymentReff('-');
    } catch (err) {
      console.error('Submit trx error:', err);
      setMessage({
        text: err.friendlyMessage || 'Gagal menyimpan transaksi ke database.',
        type: 'danger',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Memuat daftar paket harga wrapping..." />;
  }

  return (
    <div className="container py-4">
      
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="h3 fw-bold text-dark mb-1">📦 Input Transaksi Wrapping</h2>
          <p className="text-secondary mb-0">Catat transaksi pembungkusan barang dan jenis pembayaran.</p>
        </div>
        <button onClick={() => navigate('/')} className="btn btn-outline-secondary btn-lg">
          <i className="bi bi-arrow-left"></i> Menu Utama
        </button>
      </div>

      {/* Alert */}
      <AlertBox
        type={message.type}
        message={message.text}
        onClose={() => setMessage({ text: '', type: 'info' })}
      />

      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          
          {/* Kolom Kiri: Pilih Paket & Jumlah */}
          <div className="col-12 col-lg-7">
            <div className="card shadow-sm border-0 rounded-4 mb-4">
              <div className="card-header bg-primary text-white p-3">
                <h3 className="h5 fw-bold mb-0">1. PILIH PAKET WRAPPING</h3>
              </div>
              <div className="card-body p-4">
                
                <div className="row g-3">
                  {priceList.map((item) => {
                    const isSelected = selectedPack?.id === item.id || selectedPack?.pack_type === item.pack_type;
                    return (
                      <div className="col-12 col-sm-6" key={item.id || item.pack_type}>
                        <div
                          onClick={() => setSelectedPack(item)}
                          className={`p-3 rounded-3 border-2 ${
                            isSelected
                              ? 'border-primary bg-primary-subtle text-primary'
                              : 'border-secondary-subtle bg-white text-dark'
                          } shadow-sm h-100 d-flex flex-column justify-content-between`}
                          style={{ cursor: 'pointer', borderStyle: 'solid', minHeight: '110px' }}
                        >
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <span className="fw-bold fs-5">{item.name || item.pack_type}</span>
                            {isSelected && <i className="bi bi-check-circle-fill fs-4 text-primary"></i>}
                          </div>
                          <div className="fs-4 fw-bold text-success">
                            {formatRupiah(item.price)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Jumlah / Qty */}
                <div className="mt-4 pt-3 border-top">
                  <label className="form-label fs-5 fw-bold text-dark d-block">
                    2. JUMLAH KOPER / BARANG (QTY):
                  </label>
                  <div className="d-flex align-items-center gap-3">
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-xl px-4"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <i className="bi bi-dash-lg fs-2"></i>
                    </button>

                    <div
                      className="form-control text-center fs-2 fw-bold bg-white text-dark py-2"
                      style={{ maxWidth: '140px', minHeight: '64px' }}
                    >
                      {quantity}
                    </div>

                    <button
                      type="button"
                      className="btn btn-outline-success btn-xl px-4"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <i className="bi bi-plus-lg fs-2"></i>
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Metode Pembayaran */}
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-header bg-primary text-white p-3">
                <h3 className="h5 fw-bold mb-0">3. METODE PEMBAYARAN</h3>
              </div>
              <div className="card-body p-4">
                <div className="row g-3">
                  {[
                    { id: 'CASH', label: '💵 TUNAI / CASH', desc: 'Uang fisik dari pelanggan' },
                    { id: 'EDC', label: '💳 EDC / KARTU', desc: 'Debit / Kredit mesin EDC' },
                    { id: 'QRIS', label: '📱 QRIS / E-WALLET', desc: 'Scan barcode QRIS' },
                  ].map((pay) => (
                    <div className="col-12 col-md-4" key={pay.id}>
                      <div
                        onClick={() => setPaymentType(pay.id)}
                        className={`p-3 rounded-3 border-2 ${
                          paymentType === pay.id
                            ? 'border-success bg-success-subtle text-dark'
                            : 'border-secondary-subtle bg-white text-secondary'
                        } shadow-sm text-center h-100`}
                        style={{ cursor: 'pointer', borderStyle: 'solid' }}
                      >
                        <div className="fw-bold fs-5 text-dark mb-1">{pay.label}</div>
                        <small className="text-muted">{pay.desc}</small>
                      </div>
                    </div>
                  ))}
                </div>

                {paymentType !== 'CASH' && (
                  <div className="mt-3">
                    <label htmlFor="inputReff" className="form-label">
                      Nomor Referensi / Approval EDC (Opsional):
                    </label>
                    <input
                      id="inputReff"
                      type="text"
                      className="form-control form-control-lg"
                      placeholder="Masukkan No. Reff / Kode Transaksi..."
                      value={paymentReff}
                      onChange={(e) => setPaymentReff(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Ringkasan & Tombol Simpan */}
          <div className="col-12 col-lg-5">
            <div className="card shadow border-2 border-primary rounded-4 sticky-top" style={{ top: '90px' }}>
              <div className="card-header bg-primary text-white text-center p-3">
                <h3 className="h4 fw-bold mb-0">🧾 RINGKASAN TRANSAKSI</h3>
              </div>

              <div className="card-body p-4">
                <div className="mb-3 d-flex justify-content-between pb-2 border-bottom fs-6">
                  <span className="text-muted">Cabang / Terminal:</span>
                  <span className="fw-bold">{currentUser?.cabang || 'T1'}</span>
                </div>

                <div className="mb-3 d-flex justify-content-between pb-2 border-bottom fs-6">
                  <span className="text-muted">Petugas Kasir:</span>
                  <span className="fw-bold">{currentUser?.userdesc || currentUser?.username}</span>
                </div>

                <div className="mb-3 d-flex justify-content-between pb-2 border-bottom fs-6">
                  <span className="text-muted">Shift Kerja:</span>
                  <span className="badge bg-info text-dark fs-6">{activeShift?.shiftCode || 'Shift Standar'}</span>
                </div>

                <div className="mb-3 d-flex justify-content-between pb-2 border-bottom fs-6">
                  <span className="text-muted">Paket Dipilih:</span>
                  <span className="fw-bold text-primary">{selectedPack?.name || '-'}</span>
                </div>

                <div className="mb-3 d-flex justify-content-between pb-2 border-bottom fs-6">
                  <span className="text-muted">Harga Satuan x Jumlah:</span>
                  <span className="fw-bold">
                    {formatRupiah(selectedPack?.price || 0)} x {quantity}
                  </span>
                </div>

                <div className="mb-4 d-flex justify-content-between pb-2 border-bottom fs-6">
                  <span className="text-muted">Pembayaran:</span>
                  <span className="badge bg-success fs-6">{paymentType}</span>
                </div>

                {/* Total Bayar Besar */}
                <div className="bg-light p-3 rounded-3 text-center mb-4 border">
                  <span className="fs-6 text-secondary d-block fw-bold mb-1">TOTAL YANG HARUS DIBAYAR:</span>
                  <div className="display-6 fw-bold text-success">
                    {formatRupiah(calculateTotal())}
                  </div>
                </div>

                {/* Tombol Simpan Besar */}
                <BigButton
                  type="submit"
                  variant="success"
                  size="xl"
                  fullWidth
                  disabled={isSubmitting || !selectedPack}
                  icon={isSubmitting ? 'bi-hourglass-split' : 'bi-printer-fill'}
                >
                  {isSubmitting ? 'Sedang Menyimpan...' : 'SIMPAN & SELESAI'}
                </BigButton>
              </div>

              {/* Bukti Transaksi Terakhir */}
              {lastSavedTrx && (
                <div className="card-footer bg-success-subtle text-dark p-3 text-center border-top">
                  <div className="fw-bold text-success">
                    <i className="bi bi-check-circle-fill me-1"></i> Transaksi Terakhir Berhasil
                  </div>
                  <small className="d-block text-muted">
                    {lastSavedTrx.name} ({lastSavedTrx.qty}x) - Jam {lastSavedTrx.time}
                  </small>
                </div>
              )}

            </div>
          </div>

        </div>
      </form>

    </div>
  );
}
