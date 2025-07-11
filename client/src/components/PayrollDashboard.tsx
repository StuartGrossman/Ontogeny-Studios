import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Play, 
  BarChart3, 
  FileText, 
  Calendar, 
  CreditCard, 
  Settings, 
  Mail,
  Rocket,
  UserPlus,
  Plus,
  X,
  Building,
  Clock,
  Award,
  MapPin,
  Phone,
  Star
} from 'lucide-react';
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
  const [selectedView, setSelectedView] = useState<'payroll' | 'statistics' | 'graphs'>('payroll');
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedPayrollRun, setSelectedPayrollRun] = useState<string | null>('current');
  
  // Modal states
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showAddPayrollRun, setShowAddPayrollRun] = useState(false);
  const [showEmployeeDetail, setShowEmployeeDetail] = useState<Employee | null>(null);
  const [showPayrollDetail, setShowPayrollDetail] = useState<PayrollRun | null>(null);
  
  // Data states
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
  const [taxCompliance, setTaxCompliance] = useState<TaxCompliance[]>([]);

  // Firebase simulation with comprehensive sample data
  useEffect(() => {
    console.log('💰 Sample data loaded for Payroll Automation Demo');
    
    const sampleEmployees: Employee[] = [
      { 
        id: '1', 
        name: 'Sarah Johnson', 
        position: 'Senior Developer', 
        department: 'Engineering', 
        employeeId: 'EMP001', 
        salary: 95000, 
        payType: 'salary', 
        status: 'active', 
        hireDate: '2021-03-15', 
        location: 'NYC', 
        hoursWorked: 80, 
        overtime: 5 
      },
      { 
        id: '2', 
        name: 'Mike Chen', 
        position: 'Product Manager', 
        department: 'Product', 
        employeeId: 'EMP002', 
        salary: 105000, 
        payType: 'salary', 
        status: 'active', 
        hireDate: '2020-08-22', 
        location: 'SF', 
        hoursWorked: 80, 
        overtime: 0 
      },
      { 
        id: '3', 
        name: 'Emily Davis', 
        position: 'Marketing Specialist', 
        department: 'Marketing', 
        employeeId: 'EMP003', 
        salary: 28.50, 
        payType: 'hourly', 
        status: 'active', 
        hireDate: '2022-01-10', 
        location: 'Remote', 
        hoursWorked: 75, 
        overtime: 2 
      },
      { 
        id: '4', 
        name: 'David Wilson', 
        position: 'Finance Manager', 
        department: 'Finance', 
        employeeId: 'EMP004', 
        salary: 89000, 
        payType: 'salary', 
        status: 'active', 
        hireDate: '2019-11-05', 
        location: 'NYC', 
        hoursWorked: 80, 
        overtime: 3 
      },
      { 
        id: '5', 
        name: 'Lisa Brown', 
        position: 'HR Coordinator', 
        department: 'Human Resources', 
        employeeId: 'EMP005', 
        salary: 22.75, 
        payType: 'hourly', 
        status: 'pending', 
        hireDate: '2023-12-01', 
        location: 'LA', 
        hoursWorked: 72, 
        overtime: 0 
      },
      { 
        id: '6', 
        name: 'Robert Martinez', 
        position: 'Sales Director', 
        department: 'Sales', 
        employeeId: 'EMP006', 
        salary: 125000, 
        payType: 'salary', 
        status: 'active', 
        hireDate: '2018-06-12', 
        location: 'Chicago', 
        hoursWorked: 85, 
        overtime: 8 
      }
    ];

    const samplePayrollRuns: PayrollRun[] = [
      { 
        id: 'current', 
        period: 'December 1-15, 2023', 
        status: 'processing', 
        employees: 45, 
        grossPay: 185430, 
        netPay: 142850, 
        taxes: 32580, 
        deductions: 10000, 
        dueDate: '2023-12-20' 
      },
      { 
        id: 'prev1', 
        period: 'November 16-30, 2023', 
        status: 'paid', 
        employees: 44, 
        grossPay: 178920, 
        netPay: 138450, 
        taxes: 30470, 
        deductions: 10000, 
        dueDate: '2023-12-05' 
      },
      { 
        id: 'prev2', 
        period: 'November 1-15, 2023', 
        status: 'paid', 
        employees: 43, 
        grossPay: 176540, 
        netPay: 136890, 
        taxes: 29650, 
        deductions: 10000, 
        dueDate: '2023-11-20' 
      }
    ];

    const sampleTaxCompliance: TaxCompliance[] = [
      { state: 'New York', status: 'compliant', lastFiling: '2023-11-15', nextDue: '2023-12-15', amount: 12450 },
      { state: 'California', status: 'pending', lastFiling: '2023-10-15', nextDue: '2023-12-10', amount: 8920 },
      { state: 'Texas', status: 'compliant', lastFiling: '2023-11-20', nextDue: '2024-01-15', amount: 5670 },
      { state: 'Florida', status: 'overdue', lastFiling: '2023-09-15', nextDue: '2023-11-30', amount: 3240 }
    ];

    setEmployees(sampleEmployees);
    setPayrollRuns(samplePayrollRuns);
    setTaxCompliance(sampleTaxCompliance);
  }, []);

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
    <div className="payroll-employees-section">
      <div className="payroll-employees-header">
        <h3>Employee Management</h3>
        <div className="payroll-header-actions">
                      <button className="payroll-filter-btn"><Search size={16} /> Filter</button>
          <button className="payroll-add-btn">+ Add Employee</button>
        </div>
      </div>
      
      <div className="payroll-employees-stats">
        <div className="payroll-stat-card">
                        <Users className="payroll-stat-icon" size={24} />
          <div className="payroll-stat-content">
            <div className="payroll-stat-value">45</div>
            <div className="payroll-stat-label">Active Employees</div>
          </div>
        </div>
        <div className="payroll-stat-card">
                        <DollarSign className="payroll-stat-icon" size={24} />
          <div className="payroll-stat-content">
            <div className="payroll-stat-value">{formatCurrency(4250000)}</div>
            <div className="payroll-stat-label">Annual Payroll</div>
          </div>
        </div>
        <div className="payroll-stat-card">
                        <TrendingUp className="payroll-stat-icon" size={24} />
          <div className="payroll-stat-content">
            <div className="payroll-stat-value">{formatCurrency(85400)}</div>
            <div className="payroll-stat-label">Avg. Salary</div>
          </div>
        </div>
      </div>

      <div className="payroll-employees-table">
        <div className="payroll-table-header">
          <div className="payroll-header-cell">Employee</div>
          <div className="payroll-header-cell">Department</div>
          <div className="payroll-header-cell">Pay Type</div>
          <div className="payroll-header-cell">Rate/Salary</div>
          <div className="payroll-header-cell">Status</div>
          <div className="payroll-header-cell">Actions</div>
        </div>
        
        {employees.map(employee => (
          <div key={employee.id} className={`table-row ${selectedEmployee === employee.id ? 'selected' : ''}`}
               onClick={() => setSelectedEmployee(employee.id)}>
            <div className="payroll-cell employee-cell">
              <div className="payroll-employee-info">
                <div className="payroll-employee-avatar">{employee.name.charAt(0)}</div>
                <div>
                  <div className="payroll-employee-name">{employee.name}</div>
                  <div className="payroll-employee-id">{employee.employeeId}</div>
                </div>
              </div>
            </div>
            <div className="payroll-cell">{employee.department}</div>
            <div className="payroll-cell">
              <span className={`pay-type ${employee.payType}`}>
                {employee.payType === 'salary' ? 'Salary' : 'Hourly'}
              </span>
            </div>
            <div className="payroll-cell">
              {employee.payType === 'salary' 
                ? formatCurrency(employee.salary / 26) 
                : `$${employee.salary.toFixed(2)}/hr`}
            </div>
            <div className="payroll-cell">
              <span className="payroll-status-badge" style={{ backgroundColor: getStatusColor(employee.status) }}>
                {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
              </span>
            </div>
            <div className="payroll-cell actions-cell">
              <button 
                className="payroll-action-btn" 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEmployeeDetail(employee);
                }}
                title="View Details"
              >
                👁️
              </button>
              <button 
                className="payroll-action-btn" 
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Edit employee:', employee.name);
                }}
                title="Edit Employee"
              >
                ✏️
              </button>
              <button 
                className="payroll-action-btn" 
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('View payroll for:', employee.name);
                }}
                title="View Payroll"
              >
                <DollarSign size={16} />
              </button>
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
      <div className="payroll-main-section">
        <div className="payroll-main-header">
          <h2>Payroll Processing Dashboard</h2>
          <p>Manage and process payroll runs with comprehensive tracking and analytics</p>
          <div className="payroll-header-actions">
            <select value={selectedPayrollRun || ''} onChange={(e) => setSelectedPayrollRun(e.target.value)}>
              {payrollRuns.map(run => (
                <option key={run.id} value={run.id}>{run.period}</option>
              ))}
            </select>
            <button className="payroll-process-btn">▶️ Process Payroll</button>
          </div>
        </div>

        <div className="payroll-main-summary">
          <div 
            className="payroll-summary-card primary clickable" 
            onClick={() => setShowPayrollDetail(run)}
            title="Click to view details"
          >
            <div className="payroll-summary-header">
              <h4>Payroll Summary</h4>
              <span className={`status-badge ${run.status}`} style={{ backgroundColor: getStatusColor(run.status) }}>
                {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
              </span>
            </div>
            <div className="payroll-summary-content">
              <div className="payroll-summary-row">
                <span>Pay Period:</span>
                <span>{run.period}</span>
              </div>
              <div className="payroll-summary-row">
                <span>Employees:</span>
                <span>{run.employees}</span>
              </div>
              <div className="payroll-summary-row">
                <span>Due Date:</span>
                <span>{new Date(run.dueDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="payroll-summary-card">
            <h4>Gross Pay</h4>
            <div className="payroll-amount">{formatCurrency(run.grossPay)}</div>
            <div className="payroll-main-breakdown">
              <div>Regular: {formatCurrency(run.grossPay * 0.85)}</div>
              <div>Overtime: {formatCurrency(run.grossPay * 0.15)}</div>
            </div>
          </div>

          <div className="payroll-summary-card">
            <h4>Deductions</h4>
            <div className="payroll-amount">{formatCurrency(run.taxes + run.deductions)}</div>
            <div className="payroll-main-breakdown">
              <div>Taxes: {formatCurrency(run.taxes)}</div>
              <div>Benefits: {formatCurrency(run.deductions)}</div>
            </div>
          </div>

          <div className="payroll-summary-card success">
            <h4>Net Pay</h4>
            <div className="payroll-amount">{formatCurrency(run.netPay)}</div>
            <div className="payroll-change">Ready for distribution</div>
          </div>
        </div>

        <div className="payroll-main-details">
          <div className="payroll-main-breakdown">
            <h4>Tax Breakdown</h4>
            <div className="payroll-breakdown-grid">
              <div className="payroll-breakdown-item">
                <span>Federal Income Tax</span>
                <span>{formatCurrency(run.taxes * 0.6)}</span>
              </div>
              <div className="payroll-breakdown-item">
                <span>State Income Tax</span>
                <span>{formatCurrency(run.taxes * 0.25)}</span>
              </div>
              <div className="payroll-breakdown-item">
                <span>Social Security</span>
                <span>{formatCurrency(run.taxes * 0.1)}</span>
              </div>
              <div className="payroll-breakdown-item">
                <span>Medicare</span>
                <span>{formatCurrency(run.taxes * 0.05)}</span>
              </div>
            </div>
          </div>

          <div className="payroll-main-actions">
            <h4>Actions Required</h4>
            <div className="payroll-actions-list">
              <div className="payroll-action-item">
                <span className="payroll-action-icon">✅</span>
                <span>Calculate gross pay</span>
                <span className="payroll-action-status completed">Completed</span>
              </div>
              <div className="payroll-action-item">
                <span className="payroll-action-icon">✅</span>
                <span>Apply tax withholdings</span>
                <span className="payroll-action-status completed">Completed</span>
              </div>
              <div className="payroll-action-item">
                <span className="payroll-action-icon">⏳</span>
                <span>Generate pay stubs</span>
                <span className="payroll-action-status pending">In Progress</span>
              </div>
              <div className="payroll-action-item">
                <span className="payroll-action-icon">⏸️</span>
                <span>Direct deposit transfer</span>
                <span className="payroll-action-status waiting">Waiting</span>
              </div>
            </div>
          </div>
        </div>

        <div className="payroll-employee-overview">
          <h3>Employee Overview</h3>
          <div className="payroll-employee-grid">
            {employees.slice(0, 6).map(employee => (
              <div 
                key={employee.id} 
                className="payroll-employee-card clickable"
                onClick={() => setShowEmployeeDetail(employee)}
                title="Click to view details"
              >
                <div className="payroll-employee-avatar">{employee.name.charAt(0)}</div>
                <div className="payroll-employee-info">
                  <div className="payroll-employee-name">{employee.name}</div>
                  <div className="payroll-employee-position">{employee.position}</div>
                  <div className="payroll-employee-department">{employee.department}</div>
                  <div className="payroll-employee-pay">
                    {employee.payType === 'salary' 
                      ? formatCurrency(employee.salary / 26) 
                      : `$${employee.salary.toFixed(2)}/hr`}
                  </div>
                </div>
                <div className={`employee-status ${employee.status}`}>
                  {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="payroll-main-insights">
          <h3>Payroll Insights</h3>
          <div className="payroll-insights-grid">
            <div className="payroll-insight-card">
              <div className="payroll-insight-icon">📈</div>
              <div className="payroll-insight-content">
                <h4>Cost Efficiency</h4>
                <p>Payroll costs are 12% below industry average</p>
                <div className="payroll-insight-value positive">-12%</div>
              </div>
            </div>
            <div className="payroll-insight-card">
              <div className="payroll-insight-icon">⏱️</div>
              <div className="payroll-insight-content">
                <h4>Processing Time</h4>
                <p>Average payroll processing takes 2.3 hours</p>
                <div className="payroll-insight-value neutral">2.3h</div>
              </div>
            </div>
            <div className="payroll-insight-card">
              <div className="payroll-insight-icon">✅</div>
              <div className="payroll-insight-content">
                <h4>Compliance Rate</h4>
                <p>Tax compliance maintained at 98.5%</p>
                <div className="payroll-insight-value positive">98.5%</div>
              </div>
            </div>
            <div className="payroll-insight-card">
              <div className="payroll-insight-icon">💰</div>
              <div className="payroll-insight-content">
                <h4>Cost Savings</h4>
                <p>Automated processing saves $15K annually</p>
                <div className="payroll-insight-value positive">$15K</div>
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
        <div className="payroll-header-actions">
          <select className="period-select">
            <option>Current Quarter</option>
            <option>Year to Date</option>
            <option>Last 12 Months</option>
          </select>
                      <button className="export-btn"><BarChart3 size={16} /> Export</button>
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
                    <span className="payroll-bar-label">{month}</span>
                    <span className="payroll-bar-value">${(150 + index * 15)}K</span>
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
            <button className="report-btn"><FileText size={16} /> Payroll Register</button>
            <button className="report-btn">🏦 Tax Liability</button>
                          <button className="report-btn"><BarChart3 size={16} /> Employee Summary</button>
                          <button className="report-btn"><DollarSign size={16} /> Cost Center Report</button>
                          <button className="report-btn"><TrendingUp size={16} /> Year-End Report</button>
                          <button className="report-btn"><Search size={16} /> Audit Trail</button>
          </div>
        </div>
      </div>
    </div>
  );

  const StatisticsView = () => (
    <div className="payroll-statistics-section">
      <div className="payroll-stats-header">
        <h2>Payroll Statistics Dashboard</h2>
        <p>Comprehensive analytics and insights for your payroll operations</p>
      </div>

      <div className="payroll-stats-content">
        <div className="payroll-stats-section">
          <h3>Employee Overview</h3>
          <div className="payroll-stats-grid">
            <div className="payroll-stat-card">
              <div className="payroll-stat-icon"><Users size={24} /></div>
              <div className="payroll-stat-info">
                <div className="payroll-stat-value">{employees.length}</div>
                <div className="payroll-stat-label">Total Employees</div>
              </div>
            </div>
            <div className="payroll-stat-card">
              <div className="payroll-stat-icon"><Building size={24} /></div>
              <div className="payroll-stat-info">
                <div className="payroll-stat-value">{employees.filter(e => e.status === 'active').length}</div>
                <div className="payroll-stat-label">Active Employees</div>
              </div>
            </div>
            <div className="payroll-stat-card">
              <div className="payroll-stat-icon"><Clock size={24} /></div>
              <div className="payroll-stat-info">
                <div className="payroll-stat-value">{employees.filter(e => e.status === 'pending').length}</div>
                <div className="payroll-stat-label">Pending Employees</div>
              </div>
            </div>
            <div className="payroll-stat-card">
              <div className="payroll-stat-icon"><DollarSign size={24} /></div>
              <div className="payroll-stat-info">
                <div className="payroll-stat-value">{formatCurrency(employees.reduce((sum, e) => sum + (e.payType === 'salary' ? e.salary : e.salary * 2080), 0) / employees.length)}</div>
                <div className="payroll-stat-label">Avg Annual Salary</div>
              </div>
            </div>
          </div>
        </div>

        <div className="payroll-stats-section">
          <h3>Payroll Summary</h3>
          <div className="payroll-stats-grid">
            <div className="payroll-stat-card">
              <div className="payroll-stat-icon"><BarChart3 size={24} /></div>
              <div className="payroll-stat-info">
                <div className="payroll-stat-value">{payrollRuns.length}</div>
                <div className="payroll-stat-label">Total Payroll Runs</div>
              </div>
            </div>
            <div className="payroll-stat-card">
              <div className="payroll-stat-icon"><TrendingUp size={24} /></div>
              <div className="payroll-stat-info">
                <div className="payroll-stat-value">{formatCurrency(payrollRuns.reduce((sum, pr) => sum + pr.grossPay, 0))}</div>
                <div className="payroll-stat-label">Total Gross Pay</div>
              </div>
            </div>
            <div className="payroll-stat-card">
              <div className="payroll-stat-icon"><FileText size={24} /></div>
              <div className="payroll-stat-info">
                <div className="payroll-stat-value">{formatCurrency(payrollRuns.reduce((sum, pr) => sum + pr.taxes, 0))}</div>
                <div className="payroll-stat-label">Total Taxes</div>
              </div>
            </div>
            <div className="payroll-stat-card">
              <div className="payroll-stat-icon"><Award size={24} /></div>
              <div className="payroll-stat-info">
                <div className="payroll-stat-value">{formatCurrency(payrollRuns.reduce((sum, pr) => sum + pr.netPay, 0))}</div>
                <div className="payroll-stat-label">Total Net Pay</div>
              </div>
            </div>
          </div>
        </div>

        <div className="payroll-stats-section">
          <h3>Department Breakdown</h3>
          <div className="payroll-stats-grid">
            {['Engineering', 'Product', 'Marketing', 'Sales', 'Finance', 'Human Resources'].map(dept => {
              const deptEmployees = employees.filter(e => e.department === dept);
              return (
                <div key={dept} className="payroll-stat-card">
                  <div className="payroll-stat-icon"><Building size={24} /></div>
                  <div className="payroll-stat-info">
                    <div className="payroll-stat-value">{deptEmployees.length}</div>
                    <div className="payroll-stat-label">{dept}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="payroll-stats-section">
          <h3>Financial Performance</h3>
          <div className="payroll-stats-grid">
            <div className="payroll-stat-card large">
              <div className="payroll-stat-icon"><DollarSign size={32} /></div>
              <div className="payroll-stat-info">
                <div className="payroll-stat-value">{formatCurrency(payrollRuns.reduce((sum, pr) => sum + pr.grossPay, 0) / payrollRuns.length)}</div>
                <div className="payroll-stat-label">Average Payroll Run</div>
                <div className="payroll-stat-trend positive">+8.2% from last quarter</div>
              </div>
            </div>
            <div className="payroll-stat-card large">
              <div className="payroll-stat-icon"><TrendingUp size={32} /></div>
              <div className="payroll-stat-info">
                <div className="payroll-stat-value">{((payrollRuns.reduce((sum, pr) => sum + pr.netPay, 0) / payrollRuns.reduce((sum, pr) => sum + pr.grossPay, 0)) * 100).toFixed(1)}%</div>
                <div className="payroll-stat-label">Net Pay Ratio</div>
                <div className="payroll-stat-trend neutral">Stable</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const GraphsView = () => (
    <div className="payroll-graphs-section">
      <div className="payroll-graphs-header">
        <h2>Payroll Analytics & Graphs</h2>
        <p>Visual data representations and trend analysis</p>
      </div>

      <div className="payroll-graphs-content">
        <div className="payroll-graph-section">
          <h3>Employee Status Distribution</h3>
          <div className="payroll-pie-chart">
            <div className="payroll-pie-slice active" style={{
              '--percentage': `${(employees.filter(e => e.status === 'active').length / employees.length) * 100}%`
            } as React.CSSProperties}>
              <span>Active: {employees.filter(e => e.status === 'active').length}</span>
            </div>
            <div className="payroll-pie-slice pending" style={{
              '--percentage': `${(employees.filter(e => e.status === 'pending').length / employees.length) * 100}%`
            } as React.CSSProperties}>
              <span>Pending: {employees.filter(e => e.status === 'pending').length}</span>
            </div>
            <div className="payroll-pie-slice inactive" style={{
              '--percentage': `${(employees.filter(e => e.status === 'inactive').length / employees.length) * 100}%`
            } as React.CSSProperties}>
              <span>Inactive: {employees.filter(e => e.status === 'inactive').length}</span>
            </div>
          </div>
        </div>

        <div className="payroll-graph-section">
          <h3>Department Salary Distribution</h3>
          <div className="payroll-bar-chart">
            {['Engineering', 'Product', 'Marketing', 'Sales', 'Finance', 'Human Resources'].map(dept => {
              const deptEmployees = employees.filter(e => e.department === dept);
              const avgSalary = deptEmployees.length > 0 ? 
                deptEmployees.reduce((sum, e) => sum + (e.payType === 'salary' ? e.salary : e.salary * 2080), 0) / deptEmployees.length : 0;
              const maxSalary = 125000;
              return (
                <div key={dept} className="payroll-bar-item">
                  <div className="payroll-bar-label">{dept}</div>
                  <div className="payroll-bar-container">
                    <div 
                      className="payroll-bar-fill" 
                      style={{ width: `${(avgSalary / maxSalary) * 100}%` }}
                    ></div>
                  </div>
                  <div className="payroll-bar-value">{formatCurrency(avgSalary)}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="payroll-graph-section">
          <h3>Payroll Trends</h3>
          <div className="payroll-timeline-chart">
            {payrollRuns.map((run, index) => (
              <div key={run.id} className="payroll-timeline-item">
                <div className="payroll-timeline-period">{run.period}</div>
                <div className="payroll-timeline-bar">
                  <div 
                    className="payroll-timeline-fill" 
                    style={{ width: `${(run.grossPay / 200000) * 100}%` }}
                  ></div>
                </div>
                <div className="payroll-timeline-value">{formatCurrency(run.grossPay)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="payroll-graph-section">
          <h3>Tax Compliance Status</h3>
          <div className="payroll-compliance-chart">
            {taxCompliance.map(tax => (
              <div key={tax.state} className="payroll-compliance-item">
                <div className="payroll-compliance-state">{tax.state}</div>
                <div className={`compliance-status ${tax.status}`}>
                  {tax.status.charAt(0).toUpperCase() + tax.status.slice(1)}
                </div>
                <div className="payroll-compliance-amount">{formatCurrency(tax.amount)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Add employee handler
  const handleAddEmployee = (employeeData: any) => {
    const newEmployee: Employee = {
      id: `emp_${Date.now()}`,
      name: employeeData.name,
      position: employeeData.position,
      department: employeeData.department,
      employeeId: `EMP${String(employees.length + 1).padStart(3, '0')}`,
      salary: parseFloat(employeeData.salary),
      payType: employeeData.payType,
      status: 'active',
      hireDate: new Date().toISOString().split('T')[0],
      location: employeeData.location,
      hoursWorked: 0,
      overtime: 0
    };
    setEmployees([...employees, newEmployee]);
    setShowAddEmployee(false);
  };

  // Add payroll run handler
  const handleAddPayrollRun = (payrollData: any) => {
    const newPayrollRun: PayrollRun = {
      id: `run_${Date.now()}`,
      period: payrollData.period,
      status: 'draft',
      employees: employees.length,
      grossPay: parseFloat(payrollData.grossPay),
      netPay: parseFloat(payrollData.netPay),
      taxes: parseFloat(payrollData.taxes),
      deductions: parseFloat(payrollData.deductions),
      dueDate: payrollData.dueDate
    };
    setPayrollRuns([newPayrollRun, ...payrollRuns]);
    setShowAddPayrollRun(false);
  };

  return (
    <div className={`payroll-dashboard ${view}`}>
      {/* Secondary Navigation Bar */}
      <div className="payroll-secondary-navbar">
        <div className="payroll-secondary-nav-content">
          <button 
            className="payroll-secondary-nav-btn add-employee"
            onClick={() => setShowAddEmployee(true)}
          >
            <UserPlus size={16} />
            <span>Add Employee</span>
          </button>
          <button 
            className="payroll-secondary-nav-btn add-payroll"
            onClick={() => setShowAddPayrollRun(true)}
          >
            <Plus size={16} />
            <span>Add Payroll Run</span>
          </button>
          <button 
            className="payroll-secondary-nav-btn statistics"
            onClick={() => setSelectedView('statistics')}
          >
            <BarChart3 size={16} />
            <span>Statistics</span>
          </button>
          <button 
            className="payroll-secondary-nav-btn graphs"
            onClick={() => setSelectedView('graphs')}
          >
            <TrendingUp size={16} />
            <span>Graphs</span>
          </button>
          <button 
            className="payroll-secondary-nav-btn payroll"
            onClick={() => setSelectedView('payroll')}
          >
            <DollarSign size={16} />
            <span>Payroll</span>
          </button>
          <button 
            className="payroll-secondary-nav-btn process-payroll"
            onClick={() => console.log('Processing payroll...')}
          >
            <Rocket size={16} />
            <span>Process Payroll</span>
          </button>
        </div>
      </div>
      
      <div className="payroll-dashboard-content">
        {selectedView === 'payroll' && <PayrollView />}
        {selectedView === 'statistics' && <StatisticsView />}
        {selectedView === 'graphs' && <GraphsView />}
      </div>

      {/* Modals */}
      {showAddEmployee && (
        <div className="payroll-modal-backdrop" onClick={() => setShowAddEmployee(false)}>
          <div className="payroll-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="payroll-modal-header">
              <h3>Add New Employee</h3>
              <button className="payroll-modal-close" onClick={() => setShowAddEmployee(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              handleAddEmployee(Object.fromEntries(formData));
            }}>
              <div className="payroll-form-grid">
                <div className="payroll-form-group">
                  <label>Full Name</label>
                  <input type="text" name="name" required />
                </div>
                <div className="payroll-form-group">
                  <label>Position</label>
                  <input type="text" name="position" required />
                </div>
                <div className="payroll-form-group">
                  <label>Department</label>
                  <select name="department" required>
                    <option value="">Select Department</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Product">Product</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Finance">Finance</option>
                    <option value="Human Resources">Human Resources</option>
                  </select>
                </div>
                <div className="payroll-form-group">
                  <label>Pay Type</label>
                  <select name="payType" required>
                    <option value="">Select Pay Type</option>
                    <option value="salary">Salary</option>
                    <option value="hourly">Hourly</option>
                  </select>
                </div>
                <div className="payroll-form-group">
                  <label>Salary/Rate</label>
                  <input type="number" name="salary" step="0.01" required />
                </div>
                <div className="payroll-form-group">
                  <label>Location</label>
                  <input type="text" name="location" required />
                </div>
              </div>
              <div className="payroll-modal-actions">
                <button type="button" onClick={() => setShowAddEmployee(false)}>Cancel</button>
                <button type="submit" className="primary">Add Employee</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddPayrollRun && (
        <div className="payroll-modal-backdrop" onClick={() => setShowAddPayrollRun(false)}>
          <div className="payroll-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="payroll-modal-header">
              <h3>Create New Payroll Run</h3>
              <button className="payroll-modal-close" onClick={() => setShowAddPayrollRun(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              handleAddPayrollRun(Object.fromEntries(formData));
            }}>
              <div className="payroll-form-grid">
                <div className="payroll-form-group">
                  <label>Pay Period</label>
                  <input type="text" name="period" placeholder="e.g., January 1-15, 2024" required />
                </div>
                <div className="payroll-form-group">
                  <label>Due Date</label>
                  <input type="date" name="dueDate" required />
                </div>
                <div className="payroll-form-group">
                  <label>Gross Pay</label>
                  <input type="number" name="grossPay" step="0.01" required />
                </div>
                <div className="payroll-form-group">
                  <label>Net Pay</label>
                  <input type="number" name="netPay" step="0.01" required />
                </div>
                <div className="payroll-form-group">
                  <label>Taxes</label>
                  <input type="number" name="taxes" step="0.01" required />
                </div>
                <div className="payroll-form-group">
                  <label>Deductions</label>
                  <input type="number" name="deductions" step="0.01" required />
                </div>
              </div>
              <div className="payroll-modal-actions">
                <button type="button" onClick={() => setShowAddPayrollRun(false)}>Cancel</button>
                <button type="submit" className="primary">Create Payroll Run</button>
              </div>
            </form>
          </div>
        </div>
      )}



      {showEmployeeDetail && (
        <div className="payroll-modal-backdrop" onClick={() => setShowEmployeeDetail(null)}>
          <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="payroll-modal-header">
              <h3>Employee Details</h3>
              <button className="payroll-modal-close" onClick={() => setShowEmployeeDetail(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="detail-content">
              <div className="detail-section">
                <h4>Personal Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Full Name:</span>
                    <span className="detail-value">{showEmployeeDetail.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Employee ID:</span>
                    <span className="detail-value">{showEmployeeDetail.employeeId}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Position:</span>
                    <span className="detail-value">{showEmployeeDetail.position}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Department:</span>
                    <span className="detail-value">{showEmployeeDetail.department}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Location:</span>
                    <span className="detail-value">{showEmployeeDetail.location}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Hire Date:</span>
                    <span className="detail-value">{new Date(showEmployeeDetail.hireDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Compensation</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Pay Type:</span>
                    <span className="detail-value">{showEmployeeDetail.payType === 'salary' ? 'Salary' : 'Hourly'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Rate/Salary:</span>
                    <span className="detail-value">
                      {showEmployeeDetail.payType === 'salary' 
                        ? formatCurrency(showEmployeeDetail.salary)
                        : `$${showEmployeeDetail.salary.toFixed(2)}/hr`}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className={`detail-value status ${showEmployeeDetail.status}`}>
                      {showEmployeeDetail.status.charAt(0).toUpperCase() + showEmployeeDetail.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Work Statistics</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Hours Worked:</span>
                    <span className="detail-value">{showEmployeeDetail.hoursWorked} hrs</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Overtime:</span>
                    <span className="detail-value">{showEmployeeDetail.overtime} hrs</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Total Hours:</span>
                    <span className="detail-value">{(showEmployeeDetail.hoursWorked || 0) + (showEmployeeDetail.overtime || 0)} hrs</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPayrollDetail && (
        <div className="payroll-modal-backdrop" onClick={() => setShowPayrollDetail(null)}>
          <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="payroll-modal-header">
              <h3>Payroll Run Details</h3>
              <button className="payroll-modal-close" onClick={() => setShowPayrollDetail(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="detail-content">
              <div className="detail-section">
                <h4>Payroll Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Pay Period:</span>
                    <span className="detail-value">{showPayrollDetail.period}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className={`detail-value status ${showPayrollDetail.status}`}>
                      {showPayrollDetail.status.charAt(0).toUpperCase() + showPayrollDetail.status.slice(1)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Employees:</span>
                    <span className="detail-value">{showPayrollDetail.employees}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Due Date:</span>
                    <span className="detail-value">{new Date(showPayrollDetail.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Financial Summary</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Gross Pay:</span>
                    <span className="detail-value">{formatCurrency(showPayrollDetail.grossPay)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Taxes:</span>
                    <span className="detail-value">{formatCurrency(showPayrollDetail.taxes)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Deductions:</span>
                    <span className="detail-value">{formatCurrency(showPayrollDetail.deductions)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Net Pay:</span>
                    <span className="detail-value">{formatCurrency(showPayrollDetail.netPay)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollDashboard; 