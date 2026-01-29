// TPC Presale App - Mobile Only
class TPCPresaleApp {
    constructor() {
        this.currentLang = 'id';
        this.currentInvoice = null;
        this.currentUser = null;
        this.presaleData = {
            stage: 1,
            price: 0.001,
            supply: 100000000,
            remaining: 100000000,
            endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months from now
            usdToIdr: 16000
        };
        this.paymentMethods = [
            { id: 'usdc', name: 'USDC', network: 'Solana' },
            { id: 'sol', name: 'SOL', network: 'Solana' },
            { id: 'bca', name: 'BCA', type: 'bank' },
            { id: 'mandiri', name: 'Mandiri', type: 'bank' },
            { id: 'bni', name: 'BNI', type: 'bank' },
            { id: 'bri', name: 'BRI', type: 'bank' },
            { id: 'ovo', name: 'OVO', type: 'ewallet' },
            { id: 'dana', name: 'DANA', type: 'ewallet' },
            { id: 'gopay', name: 'GoPay', type: 'ewallet' }
        ];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.startCountdown();
        this.checkMobileDevice();
        this.loadLanguage();
        this.loadUserData();
    }

    setupEventListeners() {
        // Language toggle
        document.getElementById('lang-toggle').addEventListener('click', () => {
            this.toggleLanguage();
        });

        // Buy form
        document.getElementById('buy-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleBuyForm();
        });

        // TPC amount calculation
        document.getElementById('tpc-amount').addEventListener('input', (e) => {
            this.calculateTotals(e.target.value);
        });

        // Upload area
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('proof-file');
        
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--accent-gold)';
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = 'var(--border-color)';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--border-color)';
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileSelect(e.target.files[0]);
            }
        });

        // Remove file button
        document.getElementById('remove-file').addEventListener('click', () => {
            this.removeFile();
        });

        // Upload form
        document.getElementById('upload-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleProofUpload();
        });

        // Confirm payment button
        document.getElementById('confirm-payment-btn').addEventListener('click', () => {
            this.showPage('upload-page');
        });

        // Bottom navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const pageId = e.currentTarget.getAttribute('onclick').match(/'([^']+)'/)[1];
                this.showPage(pageId);
            });
        });
    }

    checkMobileDevice() {
        const isMobile = window.innerWidth <= 430;
        const desktopBlocker = document.getElementById('desktop-blocker');
        const app = document.getElementById('app');

        if (!isMobile) {
            desktopBlocker.style.display = 'flex';
            app.style.display = 'none';
        } else {
            desktopBlocker.style.display = 'none';
            app.style.display = 'block';
        }

        // Listen for resize events
        window.addEventListener('resize', () => {
            const isMobileResize = window.innerWidth <= 430;
            if (!isMobileResize) {
                desktopBlocker.style.display = 'flex';
                app.style.display = 'none';
            } else {
                desktopBlocker.style.display = 'none';
                app.style.display = 'block';
            }
        });
    }

    toggleLanguage() {
        this.currentLang = this.currentLang === 'id' ? 'en' : 'id';
        this.updateLanguage();
        this.saveLanguage();
        
        const langToggle = document.getElementById('lang-toggle');
        langToggle.textContent = this.currentLang.toUpperCase();
    }

    updateLanguage() {
        document.querySelectorAll('[data-id][data-en]').forEach(element => {
            const text = element.getAttribute(`data-${this.currentLang}`);
            if (element.tagName === 'INPUT' && element.type === 'submit') {
                element.value = text;
            } else {
                element.textContent = text;
            }
        });

        // Update time labels in countdown
        if (this.currentLang === 'en') {
            document.querySelector('.time-unit:nth-child(1) .time-label').textContent = 'Days';
            document.querySelector('.time-unit:nth-child(2) .time-label').textContent = 'Hours';
            document.querySelector('.time-unit:nth-child(3) .time-label').textContent = 'Minutes';
            document.querySelector('.time-unit:nth-child(4) .time-label').textContent = 'Seconds';
        } else {
            document.querySelector('.time-unit:nth-child(1) .time-label').textContent = 'Hari';
            document.querySelector('.time-unit:nth-child(2) .time-label').textContent = 'Jam';
            document.querySelector('.time-unit:nth-child(3) .time-label').textContent = 'Menit';
            document.querySelector('.time-unit:nth-child(4) .time-label').textContent = 'Detik';
        }
    }

    saveLanguage() {
        localStorage.setItem('tpc-language', this.currentLang);
    }

    loadLanguage() {
        const savedLang = localStorage.getItem('tpc-language');
        if (savedLang) {
            this.currentLang = savedLang;
            this.updateLanguage();
            document.getElementById('lang-toggle').textContent = this.currentLang.toUpperCase();
        }
    }

    startCountdown() {
        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = this.presaleData.endDate.getTime() - now;

            if (distance < 0) {
                document.getElementById('days').textContent = '00';
                document.getElementById('hours').textContent = '00';
                document.getElementById('minutes').textContent = '00';
                document.getElementById('seconds').textContent = '00';
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            document.getElementById('days').textContent = String(days).padStart(2, '0');
            document.getElementById('hours').textContent = String(hours).padStart(2, '0');
            document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
            document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
        };

        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    calculateTotals(tpcAmount) {
        const amount = parseFloat(tpcAmount) || 0;
        const totalUSD = amount * this.presaleData.price;
        const totalIDR = totalUSD * this.presaleData.usdToIdr;

        document.getElementById('total-usd').textContent = `$${totalUSD.toFixed(2)}`;
        document.getElementById('total-idr').textContent = `Rp ${totalIDR.toLocaleString('id-ID')}`;
    }

    async handleBuyForm() {
        const tpcAmount = document.getElementById('tpc-amount').value;
        const email = document.getElementById('email').value;
        const termsAccepted = document.getElementById('terms').checked;

        // Validation
        if (!tpcAmount || tpcAmount < 1000) {
            this.showToast('Minimal pembelian 1.000 TPC', 'error');
            return;
        }

        if (!email || !this.isValidEmail(email)) {
            this.showToast('Email tidak valid', 'error');
            return;
        }

        if (!termsAccepted) {
            this.showToast('Anda harus menyetujui syarat & ketentuan', 'error');
            return;
        }

        this.showLoading();

        try {
            // Simulate API call - in real app, this would be an actual API
            await this.simulateAPICall();

            // Check if email is verified
            const isEmailVerified = await this.checkEmailVerification(email);
            
            if (!isEmailVerified) {
                await this.sendVerificationEmail(email);
                this.showToast('Email verifikasi telah dikirim. Silakan cek email Anda.', 'success');
                this.hideLoading();
                return;
            }

            // Create invoice
            const invoice = await this.createInvoice(tpcAmount, email);
            this.currentInvoice = invoice;
            
            // Send invoice email
            await this.sendInvoiceEmail(invoice);
            
            this.hideLoading();
            this.showInvoicePage(invoice);
            this.showToast('Invoice berhasil dibuat!', 'success');

        } catch (error) {
            this.hideLoading();
            this.showToast('Terjadi kesalahan. Silakan coba lagi.', 'error');
        }
    }

    async checkEmailVerification(email) {
        // Simulate checking email verification
        const verifiedEmails = JSON.parse(localStorage.getItem('verified-emails') || '[]');
        return verifiedEmails.includes(email);
    }

    async sendVerificationEmail(email) {
        // Simulate sending verification email
        const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        // Store verification code
        const verifications = JSON.parse(localStorage.getItem('email-verifications') || '{}');
        verifications[email] = {
            code: verificationCode,
            timestamp: Date.now()
        };
        localStorage.setItem('email-verifications', JSON.stringify(verifications));

        // In real app, this would send actual email
        console.log(`Verification email sent to ${email} with code: ${verificationCode}`);
        
        // For demo, auto-verify after 3 seconds
        setTimeout(() => {
            const verifiedEmails = JSON.parse(localStorage.getItem('verified-emails') || '[]');
            if (!verifiedEmails.includes(email)) {
                verifiedEmails.push(email);
                localStorage.setItem('verified-emails', JSON.stringify(verifiedEmails));
                this.showToast('Email berhasil diverifikasi!', 'success');
            }
        }, 3000);
    }

    async createInvoice(tpcAmount, email) {
        const invoiceNumber = `INV${Date.now()}`;
        const totalUSD = tpcAmount * this.presaleData.price;
        const totalIDR = totalUSD * this.presaleData.usdToIdr;
        
        const invoice = {
            number: invoiceNumber,
            email: email,
            tpcAmount: tpcAmount,
            totalUSD: totalUSD,
            totalIDR: totalIDR,
            status: 'pending',
            createdAt: new Date().toISOString(),
            paymentMethod: null // Will be selected by user
        };

        // Store invoice
        const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
        invoices.push(invoice);
        localStorage.setItem('invoices', JSON.stringify(invoices));

        return invoice;
    }

    async sendInvoiceEmail(invoice) {
        // Simulate sending invoice email
        console.log(`Invoice email sent to ${invoice.email} for invoice ${invoice.number}`);
    }

    showInvoicePage(invoice) {
        // Update invoice page with data
        document.getElementById('invoice-number').textContent = invoice.number;
        document.getElementById('invoice-tpc').textContent = `${parseInt(invoice.tpcAmount).toLocaleString('id-ID')} TPC`;
        document.getElementById('invoice-usd').textContent = `$${invoice.totalUSD.toFixed(2)}`;
        document.getElementById('invoice-idr').textContent = `Rp ${invoice.totalIDR.toLocaleString('id-ID')}`;
        
        // Show payment method selection
        this.showPaymentMethodSelection();
        
        this.showPage('invoice-page');
    }

    showPaymentMethodSelection() {
        const paymentDetails = document.getElementById('payment-details');
        paymentDetails.innerHTML = `
            <div class="payment-method-selector">
                <p style="margin-bottom: 16px; color: var(--text-secondary);">
                    ${this.currentLang === 'id' ? 'Pilih metode pembayaran:' : 'Select payment method:'}
                </p>
                <div class="payment-methods-grid">
                    ${this.paymentMethods.map(method => `
                        <div class="payment-method-option" data-method="${method.id}">
                            <div class="method-icon">${this.getMethodIcon(method)}</div>
                            <div class="method-name">${method.name}</div>
                            ${method.network ? `<div class="method-network">${method.network}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Add click handlers for payment methods
        document.querySelectorAll('.payment-method-option').forEach(option => {
            option.addEventListener('click', () => {
                const methodId = option.getAttribute('data-method');
                this.selectPaymentMethod(methodId);
            });
        });
    }

    getMethodIcon(method) {
        const icons = {
            'usdc': '₮',
            'sol': '◎',
            'bca': '🏦',
            'mandiri': '🏦',
            'bni': '🏦',
            'bri': '🏦',
            'ovo': '📱',
            'dana': '📱',
            'gopay': '📱'
        };
        return icons[method.id] || '💳';
    }

    selectPaymentMethod(methodId) {
        const method = this.paymentMethods.find(m => m.id === methodId);
        if (!method) return;

        // Update UI
        document.querySelectorAll('.payment-method-option').forEach(option => {
            option.classList.remove('selected');
        });
        document.querySelector(`[data-method="${methodId}"]`).classList.add('selected');

        // Update invoice
        if (this.currentInvoice) {
            this.currentInvoice.paymentMethod = method;
            this.updateInvoiceDisplay(method);
        }
    }

    updateInvoiceDisplay(method) {
        const paymentDetails = document.getElementById('payment-details');
        const methodDetails = this.getPaymentMethodDetails(method);
        
        paymentDetails.innerHTML = `
            <div class="selected-payment-method">
                <h4>${method.name}</h4>
                ${methodDetails}
            </div>
        `;

        // Update invoice method display
        document.getElementById('invoice-method').textContent = method.name;
    }

    getPaymentMethodDetails(method) {
        if (method.network === 'Solana') {
            return `
                <div class="payment-info">
                    <p><strong>${this.currentLang === 'id' ? 'Alamat Wallet' : 'Wallet Address'}:</strong></p>
                    <p style="word-break: break-all; font-family: monospace; background: var(--bg-secondary); padding: 8px; border-radius: 4px; margin: 8px 0;">
                        TPCWallet${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}
                    </p>
                    <p style="color: var(--text-muted); font-size: 12px;">
                        ${this.currentLang === 'id' ? 'Hanya kirim ' : 'Only send '}${method.name}${this.currentLang === 'id' ? ' ke alamat ini' : ' to this address'}
                    </p>
                </div>
            `;
        } else if (method.type === 'bank') {
            return `
                <div class="payment-info">
                    <p><strong>${this.currentLang === 'id' ? 'Nomor Rekening' : 'Account Number'}:</strong></p>
                    <p style="font-family: monospace; background: var(--bg-secondary); padding: 8px; border-radius: 4px; margin: 8px 0;">
                        ${Math.floor(Math.random() * 9000000000) + 1000000000}
                    </p>
                    <p><strong>${this.currentLang === 'id' ? 'Atas Nama' : 'Account Name'}:</strong></p>
                    <p>PT TPC Indonesia</p>
                </div>
            `;
        } else if (method.type === 'ewallet') {
            return `
                <div class="payment-info">
                    <p><strong>${this.currentLang === 'id' ? 'Nomor' : 'Number'}:</strong></p>
                    <p style="font-family: monospace; background: var(--bg-secondary); padding: 8px; border-radius: 4px; margin: 8px 0;">
                        ${Math.floor(Math.random() * 9000000000) + 1000000000}
                    </p>
                    <p><strong>${this.currentLang === 'id' ? 'Atas Nama' : 'Name'}:</strong></p>
                    <p>TPC Official</p>
                </div>
            `;
        }
    }

    handleFileSelect(file) {
        // Validate file
        if (!file.type.match('image.*')) {
            this.showToast('Hanya file gambar yang diperbolehkan', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            this.showToast('Ukuran file maksimal 5MB', 'error');
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('preview-image').src = e.target.result;
            document.getElementById('file-preview').style.display = 'block';
            document.getElementById('upload-area').style.display = 'none';
        };
        reader.readAsDataURL(file);

        // Store file
        this.selectedFile = file;
    }

    removeFile() {
        this.selectedFile = null;
        document.getElementById('file-preview').style.display = 'none';
        document.getElementById('upload-area').style.display = 'block';
        document.getElementById('proof-file').value = '';
    }

    async handleProofUpload() {
        if (!this.selectedFile) {
            this.showToast('Silakan pilih file bukti transfer', 'error');
            return;
        }

        if (!this.currentInvoice) {
            this.showToast('Invoice tidak ditemukan', 'error');
            return;
        }

        this.showLoading();

        try {
            // Simulate upload
            await this.simulateAPICall();

            // Update invoice status
            this.currentInvoice.status = 'verification_pending';
            this.currentInvoice.proofUploaded = true;
            this.currentInvoice.proofUploadedAt = new Date().toISOString();

            // Save updated invoice
            const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
            const index = invoices.findIndex(inv => inv.number === this.currentInvoice.number);
            if (index !== -1) {
                invoices[index] = this.currentInvoice;
                localStorage.setItem('invoices', JSON.stringify(invoices));
            }

            this.hideLoading();
            this.showPage('success-page');
            this.showToast('Bukti transfer berhasil diupload!', 'success');

        } catch (error) {
            this.hideLoading();
            this.showToast('Gagal mengupload bukti transfer', 'error');
        }
    }

    showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show selected page
        document.getElementById(pageId).classList.add('active');

        // Update bottom navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Update nav items
        if (pageId === 'home-page') {
            document.querySelector('.nav-item:nth-child(1)').classList.add('active');
        } else if (pageId === 'dashboard-page') {
            document.querySelector('.nav-item:nth-child(2)').classList.add('active');
            this.loadPurchaseHistory();
        } else if (pageId === 'verified-page') {
            document.querySelector('.nav-item:nth-child(3)').classList.add('active');
        }
    }

    loadPurchaseHistory() {
        const email = this.currentUser?.email || document.getElementById('email')?.value;
        if (!email) return;

        const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
        const userInvoices = invoices.filter(inv => inv.email === email);

        const historyContainer = document.getElementById('purchase-history');
        
        if (userInvoices.length === 0) {
            historyContainer.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
                    <p>${this.currentLang === 'id' ? 'Belum ada pembelian' : 'No purchases yet'}</p>
                </div>
            `;
            return;
        }

        historyContainer.innerHTML = userInvoices.map(invoice => `
            <div class="purchase-item">
                <div class="purchase-header">
                    <span class="purchase-number">${invoice.number}</span>
                    <span class="purchase-status status-${invoice.status}">
                        ${this.getStatusText(invoice.status)}
                    </span>
                </div>
                <div class="purchase-details">
                    <div class="purchase-detail">
                        <div class="purchase-detail-label">${this.currentLang === 'id' ? 'Jumlah TPC' : 'TPC Amount'}</div>
                        <div class="purchase-detail-value">${parseInt(invoice.tpcAmount).toLocaleString('id-ID')} TPC</div>
                    </div>
                    <div class="purchase-detail">
                        <div class="purchase-detail-label">${this.currentLang === 'id' ? 'Total' : 'Total'}</div>
                        <div class="purchase-detail-value">$${invoice.totalUSD.toFixed(2)}</div>
                    </div>
                    <div class="purchase-detail">
                        <div class="purchase-detail-label">${this.currentLang === 'id' ? 'Tanggal' : 'Date'}</div>
                        <div class="purchase-detail-value">${new Date(invoice.createdAt).toLocaleDateString('id-ID')}</div>
                    </div>
                    <div class="purchase-detail">
                        <div class="purchase-detail-label">${this.currentLang === 'id' ? 'Status' : 'Status'}</div>
                        <div class="purchase-detail-value">${this.getStatusText(invoice.status)}</div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    getStatusText(status) {
        const statusTexts = {
            'id': {
                'pending': 'Menunggu Pembayaran',
                'verification_pending': 'Menunggu Verifikasi',
                'paid': 'Lunas',
                'rejected': 'Ditolak'
            },
            'en': {
                'pending': 'Waiting for Payment',
                'verification_pending': 'Verification Pending',
                'paid': 'Paid',
                'rejected': 'Rejected'
            }
        };
        return statusTexts[this.currentLang][status] || status;
    }

    loadUserData() {
        const userData = localStorage.getItem('tpc-user-data');
        if (userData) {
            this.currentUser = JSON.parse(userData);
        }
    }

    saveUserData() {
        if (this.currentUser) {
            localStorage.setItem('tpc-user-data', JSON.stringify(this.currentUser));
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showLoading() {
        document.getElementById('loading').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toast-message');
        
        toast.className = `toast ${type}`;
        toastMessage.textContent = message;
        toast.style.display = 'block';

        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }

    simulateAPICall() {
        return new Promise(resolve => setTimeout(resolve, 1500));
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TPCPresaleApp();
});

// Add CSS for payment method selection
const additionalStyles = `
    .payment-methods-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        margin-top: 16px;
    }

    .payment-method-option {
        background: var(--bg-secondary);
        border: 2px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: 16px 8px;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .payment-method-option:hover {
        border-color: var(--accent-gold);
        transform: translateY(-2px);
    }

    .payment-method-option.selected {
        border-color: var(--accent-gold);
        background: rgba(212, 175, 55, 0.1);
    }

    .method-icon {
        font-size: 24px;
        margin-bottom: 8px;
    }

    .method-name {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 4px;
    }

    .method-network {
        font-size: 12px;
        color: var(--text-muted);
    }

    .selected-payment-method {
        background: var(--bg-secondary);
        border-radius: var(--radius-md);
        padding: 16px;
    }

    .selected-payment-method h4 {
        margin-bottom: 12px;
        color: var(--accent-gold);
    }

    .payment-info p {
        margin-bottom: 8px;
    }

    .payment-info strong {
        color: var(--text-primary);
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);
