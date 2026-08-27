// Advanced Sales Management System
class SalesManager {
    constructor() {
        this.sales = this.loadFromLocalStorage();
        this.setupEventListeners();
        this.setTodayDate();
        this.updateDashboard();
    }

    setupEventListeners() {
        const form = document.getElementById('salesForm');
        form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Real-time summary update
        ['quantity', 'unitPrice'].forEach(id => {
            document.getElementById(id).addEventListener('input', () => this.updateSummary());
        });

        document.getElementById('productName').addEventListener('input', () => this.updateSummary());
    }

    setTodayDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('saleDate').value = today;
    }

    handleSubmit(e) {
        e.preventDefault();

        const sale = {
            id: Date.now(),
            productName: document.getElementById('productName').value.trim(),
            quantity: parseInt(document.getElementById('quantity').value),
            unitPrice: parseFloat(document.getElementById('unitPrice').value),
            category: document.getElementById('category').value,
            saleDate: document.getElementById('saleDate').value,
            notes: document.getElementById('notes').value.trim(),
            timestamp: new Date().toISOString()
        };

        if (this.validateSale(sale)) {
            this.sales.unshift(sale);
            this.saveToLocalStorage();
            this.showAlert('Sale registered successfully!', 'success');
            document.getElementById('salesForm').reset();
            this.setTodayDate();
            this.updateDashboard();
            this.renderTable();
        }
    }

    validateSale(sale) {
        if (!sale.productName) {
            this.showAlert('Product name is required', 'error');
            return false;
        }
        if (sale.quantity <= 0) {
            this.showAlert('Quantity must be greater than 0', 'error');
            return false;
        }
        if (sale.unitPrice < 0) {
            this.showAlert('Price must be valid', 'error');
            return false;
        }
        return true;
    }

    updateSummary() {
        const productName = document.getElementById('productName').value;
        const quantity = parseInt(document.getElementById('quantity').value) || 0;
        const unitPrice = parseFloat(document.getElementById('unitPrice').value) || 0;
        const total = quantity * unitPrice;

        if (productName && quantity > 0 && unitPrice > 0) {
            document.getElementById('summary').innerHTML = `
                        <div style="text-align: left; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                            <p><strong>Product:</strong> ${productName}</p>
                            <p><strong>Quantity:</strong> ${quantity}</p>
                            <p><strong>Unit Price:</strong> $${unitPrice.toFixed(2)}</p>
                            <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
                            <p style="font-size: 20px; color: var(--accent);"><strong>Total: $${total.toFixed(2)}</strong></p>
                        </div>
                    `;
        } else {
            document.getElementById('summary').innerHTML = '<p>Fill the form to see transaction summary</p>';
        }
    }

    renderTable() {
        const tbody = document.getElementById('tableBody');

        if (this.sales.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No sales registered yet</td></tr>';
            return;
        }

        tbody.innerHTML = this.sales.map(sale => `
                    <tr>
                        <td>${new Date(sale.saleDate).toLocaleDateString()}</td>
                        <td><strong>${sale.productName}</strong></td>
                        <td><span style="background: var(--light); padding: 5px 10px; border-radius: 4px;">${sale.category}</span></td>
                        <td>${sale.quantity}</td>
                        <td>$${sale.unitPrice.toFixed(2)}</td>
                        <td><strong style="color: var(--accent);">$${(sale.quantity * sale.unitPrice).toFixed(2)}</strong></td>
                        <td><button class="btn-danger" onclick="manager.deleteSale(${sale.id})">Delete</button></td>
                    </tr>
                `).join('');
    }

    deleteSale(id) {
        if (confirm('Are you sure you want to delete this sale?')) {
            this.sales = this.sales.filter(sale => sale.id !== id);
            this.saveToLocalStorage();
            this.showAlert('Sale deleted successfully', 'success');
            this.updateDashboard();
            this.renderTable();
        }
    }

    updateDashboard() {
        const totalSales = this.sales.reduce((sum, sale) => sum + (sale.quantity * sale.unitPrice), 0);
        const totalItems = this.sales.reduce((sum, sale) => sum + sale.quantity, 0);
        const totalTransactions = this.sales.length;

        document.getElementById('totalSales').textContent = `$${totalSales.toFixed(2)}`;
        document.getElementById('totalItems').textContent = totalItems;
        document.getElementById('totalTransactions').textContent = totalTransactions;

        this.renderTable();
    }

    showAlert(message, type) {
        const alert = document.getElementById('alert');
        alert.textContent = message;
        alert.className = `alert alert-${type}`;
        alert.style.display = 'block';
        setTimeout(() => alert.style.display = 'none', 3500);
    }

    saveToLocalStorage() {
        localStorage.setItem('salesData', JSON.stringify(this.sales));
    }

    loadFromLocalStorage() {
        const data = localStorage.getItem('salesData');
        return data ? JSON.parse(data) : [];
    }
}

// Initialize
const manager = new SalesManager();