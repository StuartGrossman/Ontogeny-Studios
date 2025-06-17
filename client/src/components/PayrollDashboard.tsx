import React, { useState } from 'react';
import '../styles/PayrollDashboard.css';

interface PayrollDashboardProps {
  view?: 'desktop' | 'mobile';
}

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  employeeId: string;
  salary: number;
  payType: 'salary' | 'hourly';
  status: 'active' | 'inactive' | 'pending';
  hireDate: string;
  location: string;
  hoursWorked?: number;
  overtime?: number;
}

interface PayrollRun {
  id: string;
  period: string;
  status: 'draft' | 'processing' | 'approved' | 'paid';
  employees: number;
  grossPay: number;
  netPay: number;
  taxes: number;
  deductions: number;
  dueDate: string;
}

interface TaxCompliance {
  state: string;
  status: 'compliant' | 'pending' | 'overdue';
  lastFiling: string;
  nextDue: string;
  amount: number;
}

const PayrollDashboard: React.FC<PayrollDashboardProps> = ({ view = 'desktop' }) => {
  const [selectedView, setSelectedView] = useState<'employees' | 'payroll' | 'reports' | 'compliance'>('payroll');
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedPayrollRun, setSelectedPayrollRun] = useState<string | null>('current');

  // Mock data
  const employees: Employee[] = [
    { id: '1', name: 'Sarah Johnson', position: 'Senior Developer', department: 'Engineering', employeeId: 'EMP001', salary: 95000, payType: 'salary', status: 'active', hireDate: '2021-03-15', location: 'NYC', hoursWorked: 80, overtime: 5 },
    { id: '2', name: 'Mike Chen', position: 'Product Manager', department: 'Product', employeeId: 'EMP002', salary: 105000, payType: 'salary', status: 'active', hireDate: '2020-08-22', location: 'SF', hoursWorked: 80, overtime: 0 },
    { id: '3', name: 'Emily Davis', position: 'Marketing Specialist', department: 'Marketing', employeeId: 'EMP003', salary: 28.50, payType: 'hourly', status: 'active', hireDate: '2022-01-10', location: 'Remote', hoursWorked: 75, overtime: 2 },
    { id: '4', name: 'David Wilson', position: 'Finance Manager', department: 'Finance', employeeId: 'EMP004', salary: 89000, payType: 'salary', status: 'active', hireDate: '2019-11-05', location: 'NYC', hoursWorked: 80, overtime: 3 },
    { id: '5', name: 'Lisa Brown', position: 'HR Coordinator', department: 'Human Resources', employeeId: 'EMP005', salary: 22.75, payType: 'hourly', status: 'pending', hireDate: '2023-12-01', location: 'LA', hoursWorked: 72, overtime: 0 },
  ];

  const payrollRuns: PayrollRun[] = [
    { id: 'current', period: 'December 1-15, 2023', status: 'processing', employees: 45, grossPay: 185430, netPay: 142850, taxes: 32580, deductions: 10000, dueDate: '2023-12-20' },
    { id: 'prev1', period: 'November 16-30, 2023', status: 'paid', employees: 44, grossPay: 178920, netPay: 138450, taxes: 30470, deductions: 10000, dueDate: '2023-12-05' },
    { id: 'prev2', period: 'November 1-15, 2023', status: 'paid', employees: 43, grossPay: 176540, netPay: 136890, taxes: 29650, deductions: 10000, dueDate: '2023-11-20' },
  ];

  const taxCompliance: TaxCompliance[] = [
    { state: 'New York', status: 'compliant', lastFiling: '2023-11-15', nextDue: '2023-12-15', amount: 12450 },
    { state: 'California', status: 'pending', lastFiling: '2023-10-15', nextDue: '2023-12-10', amount: 8920 },
    { state: 'Texas', status: 'compliant', lastFiling: '2023-11-20', nextDue: '2024-01-15', amount: 5670 },
    { state: 'Florida', status: 'overdue', lastFiling: '2023-09-15', nextDue: '2023-11-30', amount: 3240 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'compliant': case 'paid': case 'approved': return '#10b981';
      case 'pending': case 'processing': case 'draft': return '#f59e0b';
      case 'inactive': case 'overdue': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const EmployeesView = () => (
    <div className="employees-section">
      <div className="employees-header">
        <h3>Employee Management</h3>
        <div className="header-actions">
          <button className="filter-btn">🔍 Filter</button>
          <button className="add-btn">+ Add Employee</button>
        </div>
      </div>
      
      <div className="employees-stats">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">45</div>
            <div className="stat-label">Active Employees</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-value">{formatCurrency(4250000)}</div>
            <div className="stat-label">Annual Payroll</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-value">{formatCurrency(85400)}</div>
            <div className="stat-label">Avg. Salary</div>
          </div>
        </div>
      </div>

      <div className="employees-table">
        <div className="table-header">
          <div className="header-cell">Employee</div>
          <div className="header-cell">Department</div>
          <div className="header-cell">Pay Type</div>
          <div className="header-cell">Rate/Salary</div>
          <div className="header-cell">Status</div>
          <div className="header-cell">Actions</div>
        </div>
        
        {employees.map(employee => (
          <div key={employee.id} className={`table-row ${selectedEmployee === employee.id ? 'selected' : ''}`}
               onClick={() => setSelectedEmployee(employee.id)}>
            <div className="cell employee-cell">
              <div className="employee-info">
                <div className="employee-avatar">{employee.name.charAt(0)}</div>
                <div>
                  <div className="employee-name">{employee.name}</div>
                  <div className="employee-id">{employee.employeeId}</div>
                </div>
              </div>
            </div>
            <div className="cell">{employee.department}</div>
            <div className="cell">
              <span className={`pay-type ${employee.payType}`}>
                {employee.payType === 'salary' ? 'Salary' : 'Hourly'}
              </span>
            </div>
            <div className="cell">
              {employee.payType === 'salary' 
                ? formatCurrency(employee.salary / 26) 
                : `$${employee.salary.toFixed(2)}/hr`}
            </div>
            <div className="cell">
              <span className="status-badge" style={{ backgroundColor: getStatusColor(employee.status) }}>
                {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
              </span>
            </div>
            <div className="cell actions-cell">
              <button className="action-btn">✏️</button>
              <button className="action-btn">💰</button>
              <button className="action-btn">📊</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const PayrollView = () => {
    const run = payrollRuns.find(r => r.id === selectedPayrollRun);
    if (!run) return null;

    return (
      <div className="payroll-section">
        <div className="payroll-header">
          <h3>Payroll Processing</h3>
          <div className="header-actions">
            <select value={selectedPayrollRun || ''} onChange={(e) => setSelectedPayrollRun(e.target.value)}>
              {payrollRuns.map(run => (
                <option key={run.id} value={run.id}>{run.period}</option>
              ))}
            </select>
            <button className="process-btn">▶️ Process Payroll</button>
          </div>
        </div>

        <div className="payroll-summary">
          <div className="summary-card primary">
            <div className="summary-header">
              <h4>Payroll Summary</h4>
              <span className={`status-badge ${run.status}`} style={{ backgroundColor: getStatusColor(run.status) }}>
                {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
              </span>
            </div>
            <div className="summary-content">
              <div className="summary-row">
                <span>Pay Period:</span>
                <span>{run.period}</span>
              </div>
              <div className="summary-row">
                <span>Employees:</span>
                <span>{run.employees}</span>
              </div>
              <div className="summary-row">
                <span>Due Date:</span>
                <span>{new Date(run.dueDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="summary-card">
            <h4>Gross Pay</h4>
            <div className="amount">{formatCurrency(run.grossPay)}</div>
            <div className="breakdown">
              <div>Regular: {formatCurrency(run.grossPay * 0.85)}</div>
              <div>Overtime: {formatCurrency(run.grossPay * 0.15)}</div>
            </div>
          </div>

          <div className="summary-card">
            <h4>Deductions</h4>
            <div className="amount">{formatCurrency(run.taxes + run.deductions)}</div>
            <div className="breakdown">
              <div>Taxes: {formatCurrency(run.taxes)}</div>
              <div>Benefits: {formatCurrency(run.deductions)}</div>
            </div>
          </div>

          <div className="summary-card success">
            <h4>Net Pay</h4>
            <div className="amount">{formatCurrency(run.netPay)}</div>
            <div className="change">Ready for distribution</div>
          </div>
        </div>

        <div className="payroll-details">
          <div className="payroll-breakdown">
            <h4>Tax Breakdown</h4>
            <div className="breakdown-grid">
              <div className="breakdown-item">
                <span>Federal Income Tax</span>
                <span>{formatCurrency(run.taxes * 0.6)}</span>
              </div>
              <div className="breakdown-item">
                <span>State Income Tax</span>
                <span>{formatCurrency(run.taxes * 0.25)}</span>
              </div>
              <div className="breakdown-item">
                <span>Social Security</span>
                <span>{formatCurrency(run.taxes * 0.1)}</span>
              </div>
              <div className="breakdown-item">
                <span>Medicare</span>
                <span>{formatCurrency(run.taxes * 0.05)}</span>
              </div>
            </div>
          </div>

          <div className="payroll-actions">
            <h4>Actions Required</h4>
            <div className="actions-list">
              <div className="action-item">
                <span className="action-icon">✅</span>
                <span>Calculate gross pay</span>
                <span className="action-status completed">Completed</span>
              </div>
              <div className="action-item">
                <span className="action-icon">✅</span>
                <span>Apply tax withholdings</span>
                <span className="action-status completed">Completed</span>
              </div>
              <div className="action-item">
                <span className="action-icon">⏳</span>
                <span>Generate pay stubs</span>
                <span className="action-status pending">In Progress</span>
              </div>
              <div className="action-item">
                <span className="action-icon">⏸️</span>
                <span>Direct deposit transfer</span>
                <span className="action-status waiting">Waiting</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ReportsView = () => (
    <div className="reports-section">
      <div className="reports-header">
        <h3>Reports & Analytics</h3>
        <div className="header-actions">
          <select className="period-select">
            <option>Current Quarter</option>
            <option>Year to Date</option>
            <option>Last 12 Months</option>
          </select>
          <button className="export-btn">📊 Export</button>
        </div>
      </div>

      <div className="reports-grid">
        <div className="report-card">
          <h4>Payroll Costs Trend</h4>
          <div className="chart-container">
            <div className="trend-chart">
              <div className="chart-bars">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, index) => (
                  <div key={month} className="trend-bar" style={{ height: `${60 + index * 10}%` }}>
                    <span className="bar-label">{month}</span>
                    <span className="bar-value">${(150 + index * 15)}K</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="report-card">
          <h4>Department Costs</h4>
          <div className="department-breakdown">
            <div className="dept-item">
              <span className="dept-name">Engineering</span>
              <div className="dept-bar">
                <div className="dept-fill" style={{ width: '45%' }}></div>
              </div>
              <span className="dept-amount">{formatCurrency(95000)}</span>
            </div>
            <div className="dept-item">
              <span className="dept-name">Sales</span>
              <div className="dept-bar">
                <div className="dept-fill" style={{ width: '30%' }}></div>
              </div>
              <span className="dept-amount">{formatCurrency(65000)}</span>
            </div>
            <div className="dept-item">
              <span className="dept-name">Marketing</span>
              <div className="dept-bar">
                <div className="dept-fill" style={{ width: '15%' }}></div>
              </div>
              <span className="dept-amount">{formatCurrency(32000)}</span>
            </div>
            <div className="dept-item">
              <span className="dept-name">Operations</span>
              <div className="dept-bar">
                <div className="dept-fill" style={{ width: '10%' }}></div>
              </div>
              <span className="dept-amount">{formatCurrency(21000)}</span>
            </div>
          </div>
        </div>

        <div className="report-card">
          <h4>YTD Summary</h4>
          <div className="ytd-stats">
            <div className="ytd-item">
              <div className="ytd-label">Total Payroll</div>
              <div className="ytd-value">{formatCurrency(2450000)}</div>
              <div className="ytd-change positive">+8.5% vs last year</div>
            </div>
            <div className="ytd-item">
              <div className="ytd-label">Total Taxes</div>
              <div className="ytd-value">{formatCurrency(485000)}</div>
              <div className="ytd-change neutral">+2.1% vs last year</div>
            </div>
            <div className="ytd-item">
              <div className="ytd-label">Benefits Cost</div>
              <div className="ytd-value">{formatCurrency(145000)}</div>
              <div className="ytd-change positive">-1.2% vs last year</div>
            </div>
          </div>
        </div>

        <div className="report-card">
          <h4>Quick Reports</h4>
          <div className="quick-reports">
            <button className="report-btn">📄 Payroll Register</button>
            <button className="report-btn">🏦 Tax Liability</button>
            <button className="report-btn">📊 Employee Summary</button>
            <button className="report-btn">💰 Cost Center Report</button>
            <button className="report-btn">📈 Year-End Report</button>
            <button className="report-btn">🔍 Audit Trail</button>
          </div>
        </div>
      </div>
    </div>
  );

  const ComplianceView = () => (
    <div className="compliance-section">
      <div className="compliance-header">
        <h3>Tax Compliance & Settings</h3>
        <button className="settings-btn">⚙️ Settings</button>
      </div>

      <div className="compliance-overview">
        <div className="overview-card">
          <div className="overview-icon">✅</div>
          <div className="overview-content">
            <h4>Compliance Score</h4>
            <div className="score">95%</div>
            <div className="score-detail">2 items need attention</div>
          </div>
        </div>
        <div className="overview-card">
          <div className="overview-icon">📅</div>
          <div className="overview-content">
            <h4>Next Filing</h4>
            <div className="score">Dec 10</div>
            <div className="score-detail">California State Tax</div>
          </div>
        </div>
        <div className="overview-card">
          <div className="overview-icon">💳</div>
          <div className="overview-content">
            <h4>Direct Deposit</h4>
            <div className="score">98%</div>
            <div className="score-detail">42 of 43 employees</div>
          </div>
        </div>
      </div>

      <div className="compliance-content">
        <div className="tax-compliance">
          <h4>State Tax Compliance</h4>
          <div className="tax-list">
            {taxCompliance.map((tax, index) => (
              <div key={index} className="tax-item">
                <div className="tax-info">
                  <div className="tax-state">{tax.state}</div>
                  <div className="tax-details">
                    <span>Last Filed: {new Date(tax.lastFiling).toLocaleDateString()}</span>
                    <span>Next Due: {new Date(tax.nextDue).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="tax-amount">{formatCurrency(tax.amount)}</div>
                <div className={`tax-status ${tax.status}`} style={{ backgroundColor: getStatusColor(tax.status) }}>
                  {tax.status.charAt(0).toUpperCase() + tax.status.slice(1)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="integrations">
          <h4>System Integrations</h4>
          <div className="integration-list">
            <div className="integration-item">
              <div className="integration-icon">🏦</div>
              <div className="integration-info">
                <div className="integration-name">Chase Business Banking</div>
                <div className="integration-status">Connected</div>
              </div>
              <div className="integration-indicator connected"></div>
            </div>
            <div className="integration-item">
              <div className="integration-icon">📊</div>
              <div className="integration-info">
                <div className="integration-name">QuickBooks Online</div>
                <div className="integration-status">Syncing</div>
              </div>
              <div className="integration-indicator syncing"></div>
            </div>
            <div className="integration-item">
              <div className="integration-icon">📧</div>
              <div className="integration-info">
                <div className="integration-name">Employee Email System</div>
                <div className="integration-status">Connected</div>
              </div>
              <div className="integration-indicator connected"></div>
            </div>
            <div className="integration-item">
              <div className="integration-icon">🕐</div>
              <div className="integration-info">
                <div className="integration-name">Time Tracking System</div>
                <div className="integration-status">Setup Required</div>
              </div>
              <div className="integration-indicator pending"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`payroll-dashboard ${view}`}>
      <div className="dashboard-header">
        <h2>Payroll Automation System</h2>
        <div className="header-actions">
          <button className="action-button">📊 Generate Report</button>
          <button className="action-button primary">🚀 Run Payroll</button>
        </div>
      </div>
      
      <div className="dashboard-nav">
        <button 
          className={`nav-item ${selectedView === 'payroll' ? 'active' : ''}`}
          onClick={() => setSelectedView('payroll')}
        >
          💰 Payroll
        </button>
        <button 
          className={`nav-item ${selectedView === 'employees' ? 'active' : ''}`}
          onClick={() => setSelectedView('employees')}
        >
          👥 Employees
        </button>
        <button 
          className={`nav-item ${selectedView === 'reports' ? 'active' : ''}`}
          onClick={() => setSelectedView('reports')}
        >
          📊 Reports
        </button>
        <button 
          className={`nav-item ${selectedView === 'compliance' ? 'active' : ''}`}
          onClick={() => setSelectedView('compliance')}
        >
          ⚖️ Compliance
        </button>
      </div>
      
      <div className="dashboard-content">
        {selectedView === 'payroll' && <PayrollView />}
        {selectedView === 'employees' && <EmployeesView />}
        {selectedView === 'reports' && <ReportsView />}
        {selectedView === 'compliance' && <ComplianceView />}
      </div>
    </div>
  );
};

export default PayrollDashboard; 