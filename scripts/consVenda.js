class SalesConsultant {
    constructor() {
        this.allSales = this.loadFromLocalStorage();
        this.filteredSales = [...this.allSales];
        this.setupEventListeners();
        this.populateCategories();
        this.updateDashboard();
        this.renderTable();
    }

    setupEventListeners() {
        document.getElementById('filterStartDate').addEventListener('change', () => this.applyFilters());
        document.getElementById('filterEndDate').addEventListener('change', () => this.applyFilters());
        document.getElementById('filterCategory').addEventListener('change', () => this.applyFilters());
    }

    loadFromLocalStorage() {
        const data = localStorage.getItem('salesData');
        return data ? JSON.parse(data) : [];
    }

    populateCategories() {
        const categories = [...new Set(this.allSales.map(sale => sale.category))];
        const select = document.getElementById('filterCategory');

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            select.appendChild(option);
        });
    }

    applyFilters() {
        const startDate = document.getElementById('filterStartDate').value;
        const endDate = document.getElementById('filterEndDate').value;
        const category = document.getElementById('filterCategory').value;

        this.filteredSales = this.allSales.filter(sale => {
            const saleDate = sale.saleDate;

            if (startDate && saleDate < startDate) return false;
            if (endDate && saleDate > endDate) return false;
            if (category && sale.category !== category) return false;

            return true;
        });

        this.updateDashboard();
        this.renderTable();
    }

    resetFilters() {
        document.getElementById('filterStartDate').value = '';
        document.getElementById('filterEndDate').value = '';
        document.getElementById('filterCategory').value = '';
        this.filteredSales = [...this.allSales];
        this.updateDashboard();
        this.renderTable();
    }

    updateDashboard() {
        const totalEarnings = this.filteredSales.reduce((sum, sale) => sum + (sale.quantity * sale.unitPrice), 0);
        const totalItems = this.filteredSales.reduce((sum, sale) => sum + sale.quantity, 0);
        const totalTransactions = this.filteredSales.length;
        const avgTransaction = totalTransactions > 0 ? totalEarnings / totalTransactions : 0;

        document.getElementById('totalEarnings').textContent = `$${totalEarnings.toFixed(2)}`;
        document.getElementById('totalItemsSold').textContent = totalItems;
        document.getElementById('totalTransactionCount').textContent = totalTransactions;
        document.getElementById('averageTransaction').textContent = `$${avgTransaction.toFixed(2)}`;

        this.updateCategorySummary();
    }

    updateCategorySummary() {
        const categoryMap = {};

        this.filteredSales.forEach(sale => {
            if (!categoryMap[sale.category]) {
                categoryMap[sale.category] = 0;
            }
            categoryMap[sale.category] += sale.quantity * sale.unitPrice;
        });

        const summary = document.getElementById('categorySummary');
        summary.innerHTML = Object.entries(categoryMap).map(([category, amount]) => `
                    <div class="category-card">
                        <h4>${category}</h4>
                        <div class="amount">$${amount.toFixed(2)}</div>
                    </div>
                `).join('');
    }

    renderTable() {
        const tbody = document.getElementById('tableBody');

        if (this.filteredSales.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No sales found with current filters</td></tr>';
            return;
        }

        tbody.innerHTML = this.filteredSales.map(sale => `
                    <tr>
                        <td>${new Date(sale.saleDate).toLocaleDateString()}</td>
                        <td><strong>${sale.productName}</strong></td>
                        <td><span style="background: var(--light); padding: 5px 10px; border-radius: 4px;">${sale.category}</span></td>
                        <td>${sale.quantity}</td>
                        <td>$${sale.unitPrice.toFixed(2)}</td>
                        <td><strong style="color: var(--accent);">$${(sale.quantity * sale.unitPrice).toFixed(2)}</strong></td>
                    </tr>
                `).join('');
    }

    exportToCSV() {
        if (this.filteredSales.length === 0) {
            this.showAlert('No data to export', 'error');
            return;
        }

        let csv = 'Date,Product,Category,Quantity,Unit Price,Total\n';

        this.filteredSales.forEach(sale => {
            const total = sale.quantity * sale.unitPrice;
            csv += `${sale.saleDate},"${sale.productName}",${sale.category},${sale.quantity},$${sale.unitPrice.toFixed(2)},$${total.toFixed(2)}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sales_report_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        this.showAlert('Report exported successfully!', 'success');
    }

    showAlert(message, type) {
        const alert = document.getElementById('alert');
        alert.textContent = message;
        alert.className = `alert alert-${type}`;
        alert.style.display = 'block';
        setTimeout(() => alert.style.display = 'none', 3500);
    }
}

const consultManager = new SalesConsultant();