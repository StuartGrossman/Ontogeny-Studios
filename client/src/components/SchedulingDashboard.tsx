import React, { useState, useEffect } from 'react';
import { 
  Calendar,
  Users, 
  Plus,
  Edit3,
  Trash2,
  Clock,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  Save,
  X,
  BarChart3
} from 'lucide-react';
import '../styles/SchedulingDashboard.css';

interface Employee {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  color: string;
  hourlyRate: number;
  salaryType: 'hourly' | 'salary';
  annualSalary?: number;
}

interface ScheduleEvent {
  id: string;
  employeeId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description?: string;
}

interface ScheduleAssignment {
  id: string;
  employeeId: string;
  date: string;
  type: 'work-hours' | 'event-assignment';
  title: string;
  startTime: string;
  endTime: string;
  description?: string;
  eventId?: string;
}

const SchedulingDashboard: React.FC = () => {
  // Start calendar view at June 2024 where our sample data begins
  const [currentDate, setCurrentDate] = useState(new Date(2024, 5, 1)); // June 2024
  const [selectedDate, setSelectedDate] = useState('2024-06-03'); // Start with a weekday in June
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>([]);
  const [scheduleAssignments, setScheduleAssignments] = useState<ScheduleAssignment[]>([]);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showAddScheduling, setShowAddScheduling] = useState(false);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isEditingEmployee, setIsEditingEmployee] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee>({
    id: '',
    name: '',
    role: '',
    email: '',
    phone: '',
    color: '#3b82f6',
    hourlyRate: 50,
    salaryType: 'hourly'
  });
  const [showDayDetail, setShowDayDetail] = useState(false);
  const [selectedDayData, setSelectedDayData] = useState<{
    date: string;
    events: ScheduleEvent[];
    assignments: ScheduleAssignment[];
  } | null>(null);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showGraphs, setShowGraphs] = useState(false);
  
  // Form states
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    role: '',
    email: '',
    phone: '',
    color: '#3b82f6',
    hourlyRate: 50,
    salaryType: 'hourly' as 'hourly' | 'salary'
  });
  
  const [newEvent, setNewEvent] = useState({
    employeeId: '',
    title: '',
    date: '2024-06-03',
    startTime: '09:00',
    endTime: '17:00',
    description: ''
  });

  const [newScheduling, setNewScheduling] = useState({
    employeeId: '',
    date: '2024-06-03',
    type: 'work-hours' as 'work-hours' | 'event-assignment',
    title: '',
    startTime: '09:00',
    endTime: '17:00',
    description: '',
    eventId: ''
  });
  const [schedulingDates, setSchedulingDates] = useState<string[]>(['2024-06-03']);
  const [isMultiDay, setIsMultiDay] = useState(false);

  // Update scheduling dates when selected date changes
  useEffect(() => {
    setSchedulingDates([selectedDate]);
  }, [selectedDate]);

  // Initialize with sample data on component mount (simulates Firebase reload)
  useEffect(() => {
    const initializeSampleData = () => {
      // Sample employees for demo
      const sampleEmployees: Employee[] = [
        {
          id: '1',
          name: 'Sarah Johnson',
          role: 'Senior Manager',
          email: 'sarah.johnson@company.com',
          phone: '(555) 123-4567',
          color: '#3b82f6',
          salaryType: 'salary',
          hourlyRate: 75,
          annualSalary: 156000
        },
        {
          id: '2',
          name: 'Michael Chen',
          role: 'Project Lead',
          email: 'michael.chen@company.com',
          phone: '(555) 234-5678',
          color: '#ef4444',
          salaryType: 'salary',
          hourlyRate: 65,
          annualSalary: 135000
        },
        {
          id: '3',
          name: 'Emily Rodriguez',
          role: 'Designer',
          email: 'emily.rodriguez@company.com',
          phone: '(555) 345-6789',
          color: '#10b981',
          salaryType: 'hourly',
          hourlyRate: 58,
          annualSalary: 120640
        },
        {
          id: '4',
          name: 'David Kim',
          role: 'Developer',
          email: 'david.kim@company.com',
          phone: '(555) 456-7890',
          color: '#f59e0b',
          salaryType: 'hourly',
          hourlyRate: 72,
          annualSalary: 149760
        },
        {
          id: '5',
          name: 'Lisa Wang',
          role: 'Analyst',
          email: 'lisa.wang@company.com',
          phone: '(555) 567-8901',
          color: '#8b5cf6',
          salaryType: 'hourly',
          hourlyRate: 48,
          annualSalary: 99840
        }
      ];

      // Generate comprehensive schedule data for June, July, August 2024
      const generateScheduleData = () => {
        const events: ScheduleEvent[] = [];
        const assignments: ScheduleAssignment[] = [];
        let eventId = 1;
        let assignmentId = 1;

        // Helper function to generate date string
        const getDateString = (year: number, month: number, day: number) => {
          return new Date(year, month - 1, day).toISOString().split('T')[0];
        };

        // Get current date info
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        // Generate data for June, July, August 2024 AND current month
        const monthsToGenerate = [
          { year: 2024, month: 6 },  // June 2024
          { year: 2024, month: 7 },  // July 2024
          { year: 2024, month: 8 },  // August 2024
          { year: currentYear, month: currentMonth }  // Current month
        ];

        for (const { year, month } of monthsToGenerate) {
          const daysInMonth = new Date(year, month, 0).getDate();
          
          for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = getDateString(year, month, day);
            const dayOfWeek = new Date(year, month - 1, day).getDay();
            
            // Skip weekends for most regular work
            if (dayOfWeek === 0 || dayOfWeek === 6) continue;

            // SARAH JOHNSON - Senior Manager (Management meetings, strategic planning)
            if (day % 3 === 1) { // Every 3rd day
              events.push({
                id: (eventId++).toString(),
                employeeId: '1',
                title: dayOfWeek === 1 ? 'Weekly Team Meeting' : dayOfWeek === 3 ? 'Client Review' : 'Strategic Planning',
                date: dateStr,
                startTime: '09:00',
                endTime: dayOfWeek === 1 ? '10:00' : '10:30',
                description: dayOfWeek === 1 ? 'Weekly team sync and planning' : dayOfWeek === 3 ? 'Client project review' : 'Long-term strategic planning session'
              });
            }
            
            if (day % 5 === 0) { // Every 5th day
              events.push({
                id: (eventId++).toString(),
                employeeId: '1',
                title: 'Executive Meeting',
                date: dateStr,
                startTime: '14:00',
                endTime: '15:30',
                description: 'Executive leadership meeting'
              });
            }

            // Regular work hours for Sarah (Manager hours)
            assignments.push({
              id: (assignmentId++).toString(),
              employeeId: '1',
              date: dateStr,
              type: 'work-hours',
              title: 'Management Hours',
              startTime: '08:30',
              endTime: '17:30',
              description: 'Senior management responsibilities'
            });

            // MICHAEL CHEN - Project Lead (Sprint planning, team coordination)
            if (dayOfWeek === 1) { // Mondays
              events.push({
                id: (eventId++).toString(),
                employeeId: '2',
                title: 'Sprint Planning',
                date: dateStr,
                startTime: '10:00',
                endTime: '12:00',
                description: 'Weekly sprint planning session'
              });
            }
            
            if (dayOfWeek === 5) { // Fridays
              events.push({
                id: (eventId++).toString(),
                employeeId: '2',
                title: 'Sprint Retrospective',
                date: dateStr,
                startTime: '15:00',
                endTime: '16:00',
                description: 'Weekly sprint retrospective'
              });
            }

            if (day % 4 === 2) { // Every 4th day offset
              events.push({
                id: (eventId++).toString(),
                employeeId: '2',
                title: 'Stakeholder Update',
                date: dateStr,
                startTime: '13:30',
                endTime: '14:30',
                description: 'Project status update with stakeholders'
              });
            }

            // Regular work hours for Michael
            assignments.push({
              id: (assignmentId++).toString(),
              employeeId: '2',
              date: dateStr,
              type: 'work-hours',
              title: 'Project Leadership',
              startTime: '09:00',
              endTime: '17:00',
              description: 'Project management and team coordination'
            });

            // EMILY RODRIGUEZ - Designer (Design reviews, creative sessions)
            if (dayOfWeek === 2 || dayOfWeek === 4) { // Tuesdays and Thursdays
              events.push({
                id: (eventId++).toString(),
                employeeId: '3',
                title: 'Design Review',
                date: dateStr,
                startTime: '14:00',
                endTime: '15:30',
                description: 'UI/UX design review and feedback session'
              });
            }

            if (day % 6 === 3) { // Every 6th day offset
              events.push({
                id: (eventId++).toString(),
                employeeId: '3',
                title: 'Creative Workshop',
                date: dateStr,
                startTime: '10:00',
                endTime: '12:00',
                description: 'Creative brainstorming and ideation session'
              });
            }

            if (day % 7 === 1) { // Weekly
              events.push({
                id: (eventId++).toString(),
                employeeId: '3',
                title: 'User Research Session',
                date: dateStr,
                startTime: '09:30',
                endTime: '11:00',
                description: 'User research and usability testing'
              });
            }

            // Flexible design hours
            assignments.push({
              id: (assignmentId++).toString(),
              employeeId: '3',
              date: dateStr,
              type: 'work-hours',
              title: 'Design Work',
              startTime: '09:30',
              endTime: '17:30',
              description: 'Creative design and prototyping work'
            });

            // DAVID KIM - Developer (Code reviews, development sprints)
            if (dayOfWeek === 2) { // Tuesdays
              events.push({
                id: (eventId++).toString(),
                employeeId: '4',
                title: 'Code Review',
                date: dateStr,
                startTime: '10:30',
                endTime: '11:30',
                description: 'Peer code review session'
              });
            }

            if (dayOfWeek === 4) { // Thursdays
              events.push({
                id: (eventId++).toString(),
                employeeId: '4',
                title: 'Technical Architecture',
                date: dateStr,
                startTime: '15:00',
                endTime: '16:30',
                description: 'Technical architecture planning'
              });
            }

            if (day % 8 === 4) { // Every 8th day
              events.push({
                id: (eventId++).toString(),
                employeeId: '4',
                title: 'Deployment Planning',
                date: dateStr,
                startTime: '13:00',
                endTime: '14:00',
                description: 'Production deployment planning'
              });
            }

            // Developer work hours (slightly later start)
            assignments.push({
              id: (assignmentId++).toString(),
              employeeId: '4',
              date: dateStr,
              type: 'work-hours',
              title: 'Development Work',
              startTime: '10:00',
              endTime: '18:00',
              description: 'Software development and coding'
            });

            // LISA WANG - Analyst (Data analysis, reporting)
            if (dayOfWeek === 1 || dayOfWeek === 3) { // Mondays and Wednesdays
              events.push({
                id: (eventId++).toString(),
                employeeId: '5',
                title: 'Data Analysis Review',
                date: dateStr,
                startTime: '11:00',
                endTime: '12:00',
                description: 'Weekly data analysis and insights review'
              });
            }

            if (day % 5 === 2) { // Every 5th day offset
              events.push({
                id: (eventId++).toString(),
                employeeId: '5',
                title: 'Stakeholder Reporting',
                date: dateStr,
                startTime: '14:30',
                endTime: '15:30',
                description: 'Present analysis findings to stakeholders'
              });
            }

            if (day === 15 || day === 30) { // Mid-month and end-month
              events.push({
                id: (eventId++).toString(),
                employeeId: '5',
                title: 'Monthly Analytics Report',
                date: dateStr,
                startTime: '09:00',
                endTime: '11:00',
                description: 'Comprehensive monthly analytics report preparation'
              });
            }

            // Analyst work hours
            assignments.push({
              id: (assignmentId++).toString(),
              employeeId: '5',
              date: dateStr,
              type: 'work-hours',
              title: 'Analysis Work',
              startTime: '08:30',
              endTime: '16:30',
              description: 'Data analysis and reporting tasks'
            });

            // Add some cross-team meetings
            if (day % 10 === 5) { // Every 10th day
              events.push({
                id: (eventId++).toString(),
                employeeId: '1',
                title: 'All-Hands Meeting',
                date: dateStr,
                startTime: '16:00',
                endTime: '17:00',
                description: 'Company-wide all-hands meeting'
              });
              
              // Add event assignments for setup
              assignments.push({
                id: (assignmentId++).toString(),
                employeeId: '4',
                date: dateStr,
                type: 'event-assignment',
                title: 'All-Hands Setup',
                startTime: '15:30',
                endTime: '16:00',
                description: 'Setup AV equipment for all-hands meeting',
                eventId: (eventId - 1).toString()
              });
            }

            // Quarterly business reviews
            if ((month === 6 && day === 28) || (month === 8 && day === 30)) {
              events.push({
                id: (eventId++).toString(),
                employeeId: '1',
                title: 'Quarterly Business Review',
                date: dateStr,
                startTime: '13:00',
                endTime: '16:00',
                description: 'Quarterly business performance review'
              });

              // Multiple people involved in QBR prep
              assignments.push({
                id: (assignmentId++).toString(),
                employeeId: '5',
                date: dateStr,
                type: 'event-assignment',
                title: 'QBR Data Preparation',
                startTime: '09:00',
                endTime: '12:00',
                description: 'Prepare quarterly data and analytics for business review',
                eventId: (eventId - 1).toString()
              });

              assignments.push({
                id: (assignmentId++).toString(),
                employeeId: '3',
                date: dateStr,
                type: 'event-assignment',
                title: 'QBR Presentation Design',
                startTime: '10:00',
                endTime: '13:00',
                description: 'Design presentation materials for quarterly review',
                eventId: (eventId - 1).toString()
              });
            }
          }
        }

        return { events, assignments };
      };

      const { events: sampleEvents, assignments: sampleAssignments } = generateScheduleData();

      // Simulate Firebase data reload - clear and reset
      setEmployees(sampleEmployees);
      setScheduleEvents(sampleEvents);
      setScheduleAssignments(sampleAssignments);
      
      console.log(`📊 Comprehensive sample data loaded for Enterprise Scheduling Demo`);
      console.log(`   - ${sampleEvents.length} events scheduled across June-August 2024`);
      console.log(`   - ${sampleAssignments.length} work assignments created`);
      console.log(`   - 5 employees with role-specific schedules`);
    };

    // Initialize data immediately
    initializeSampleData();
  }, []); // Only run once on component mount

  // Calendar functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateStr = clickedDate.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    
    // Show day details if there are events or assignments
    const dayEvents = getEventsForDate(dateStr);
    const dayAssignments = getAssignmentsForDate(dateStr);
    
    if (dayEvents.length > 0 || dayAssignments.length > 0) {
      setSelectedDayData({
        date: dateStr,
        events: dayEvents,
        assignments: dayAssignments
      });
      setShowDayDetail(true);
    }
  };

  const handleDateDoubleClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateStr = clickedDate.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    setNewEvent({
      ...newEvent,
      date: dateStr
    });
    setShowAddEvent(true);
  };

  // Employee functions
  const addEmployee = () => {
    const employee: Employee = {
      id: Date.now().toString(),
      ...newEmployee,
      annualSalary: newEmployee.salaryType === 'salary' ? newEmployee.hourlyRate * 2080 : newEmployee.hourlyRate * 2080
    };
    setEmployees([...employees, employee]);
    setNewEmployee({ 
      name: '', 
      role: '', 
      email: '', 
      phone: '', 
      color: '#3b82f6',
      hourlyRate: 50,
      salaryType: 'hourly'
    });
    setShowAddEmployee(false);
  };

  const deleteEmployee = (id: string) => {
    setEmployees(employees.filter(emp => emp.id !== id));
    setScheduleEvents(scheduleEvents.filter(event => event.employeeId !== id));
    setScheduleAssignments(scheduleAssignments.filter(assignment => assignment.employeeId !== id));
    setShowUserDetail(false);
  };

  const startEditingEmployee = (employee: Employee) => {
    setEditEmployee(employee);
    setIsEditingEmployee(true);
  };

  const saveEmployeeEdit = () => {
    setEmployees(employees.map(emp => 
      emp.id === editEmployee.id ? editEmployee : emp
    ));
    setSelectedEmployee(editEmployee);
    setIsEditingEmployee(false);
  };

  const cancelEmployeeEdit = () => {
    setIsEditingEmployee(false);
    setEditEmployee({
      id: '',
      name: '',
      role: '',
      email: '',
      phone: '',
      color: '#3b82f6',
      hourlyRate: 50,
      salaryType: 'hourly'
    });
  };

  // Event functions
  const addEvent = () => {
    const event: ScheduleEvent = {
      id: Date.now().toString(),
      ...newEvent
    };
    setScheduleEvents([...scheduleEvents, event]);
    setNewEvent({
      employeeId: '',
      title: '',
      date: selectedDate,
      startTime: '09:00',
      endTime: '17:00',
      description: ''
    });
    setShowAddEvent(false);
  };

  const deleteEvent = (id: string) => {
    setScheduleEvents(scheduleEvents.filter(event => event.id !== id));
  };

  const getEventsForDate = (date: string) => {
    return scheduleEvents.filter(event => event.date === date);
  };

  const getEventsForEmployee = (employeeId: string, date: string) => {
    return scheduleEvents.filter(event => event.employeeId === employeeId && event.date === date);
  };

  // Scheduling functions
  const addScheduling = () => {
    const datesToSchedule = isMultiDay ? schedulingDates : [newScheduling.date];
    const newAssignments: ScheduleAssignment[] = datesToSchedule.map((date, index) => ({
      id: (Date.now() + index).toString(),
      ...newScheduling,
      date: date
    }));
    
    setScheduleAssignments([...scheduleAssignments, ...newAssignments]);
    setNewScheduling({
      employeeId: '',
      date: selectedDate,
      type: 'work-hours',
      title: '',
      startTime: '09:00',
      endTime: '17:00',
      description: '',
      eventId: ''
    });
    setSchedulingDates([selectedDate]);
    setIsMultiDay(false);
    setShowAddScheduling(false);
  };

  const deleteScheduling = (id: string) => {
    setScheduleAssignments(scheduleAssignments.filter(assignment => assignment.id !== id));
  };

  const getAssignmentsForDate = (date: string) => {
    return scheduleAssignments.filter(assignment => assignment.date === date);
  };

  // Statistics calculation functions
  const calculateEmployeeStats = (employee: Employee) => {
    const employeeAssignments = scheduleAssignments.filter(a => a.employeeId === employee.id);
    const employeeEvents = scheduleEvents.filter(e => e.employeeId === employee.id);
    
    // Calculate total hours worked
    const totalHours = employeeAssignments.reduce((total, assignment) => {
      const start = new Date(`2024-01-01T${assignment.startTime}:00`);
      const end = new Date(`2024-01-01T${assignment.endTime}:00`);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return total + hours;
    }, 0);

    // Calculate weekly and monthly averages
    const weeklyHours = totalHours / 12; // Approximate based on 3 months of data
    const monthlyHours = totalHours / 3;

    // Calculate earnings
    const weeklyEarnings = employee.salaryType === 'hourly' 
      ? weeklyHours * employee.hourlyRate 
      : (employee.annualSalary || 0) / 52;
    
    const monthlyEarnings = employee.salaryType === 'hourly'
      ? monthlyHours * employee.hourlyRate
      : (employee.annualSalary || 0) / 12;

    const annualEarnings = employee.salaryType === 'hourly'
      ? totalHours * 4 * employee.hourlyRate // Extrapolate to full year
      : employee.annualSalary || 0;

    return {
      totalHours: Math.round(totalHours * 10) / 10,
      weeklyHours: Math.round(weeklyHours * 10) / 10,
      monthlyHours: Math.round(monthlyHours * 10) / 10,
      totalEvents: employeeEvents.length,
      totalAssignments: employeeAssignments.length,
      weeklyEarnings: Math.round(weeklyEarnings * 100) / 100,
      monthlyEarnings: Math.round(monthlyEarnings * 100) / 100,
      annualEarnings: Math.round(annualEarnings * 100) / 100
    };
  };

  const calculateTeamStats = () => {
    const totalEmployees = employees.length;
    const totalEvents = scheduleEvents.length;
    const totalAssignments = scheduleAssignments.length;
    
    // Calculate total payroll costs
    const weeklyPayroll = employees.reduce((total, emp) => {
      const stats = calculateEmployeeStats(emp);
      return total + stats.weeklyEarnings;
    }, 0);

    const monthlyPayroll = employees.reduce((total, emp) => {
      const stats = calculateEmployeeStats(emp);
      return total + stats.monthlyEarnings;
    }, 0);

    const annualPayroll = employees.reduce((total, emp) => {
      const stats = calculateEmployeeStats(emp);
      return total + stats.annualEarnings;
    }, 0);

    // Calculate total hours
    const totalHours = employees.reduce((total, emp) => {
      const stats = calculateEmployeeStats(emp);
      return total + stats.totalHours;
    }, 0);

    // Calculate average hourly cost
    const avgHourlyCost = totalHours > 0 ? (monthlyPayroll * 3) / totalHours : 0;

    return {
      totalEmployees,
      totalEvents,
      totalAssignments,
      totalHours: Math.round(totalHours * 10) / 10,
      weeklyPayroll: Math.round(weeklyPayroll * 100) / 100,
      monthlyPayroll: Math.round(monthlyPayroll * 100) / 100,
      annualPayroll: Math.round(annualPayroll * 100) / 100,
      avgHourlyCost: Math.round(avgHourlyCost * 100) / 100
    };
  };

  // Graph data generation functions
  const generateTimeSeriesData = () => {
    const months = [
      { name: 'June 2024', key: '2024-06' },
      { name: 'July 2024', key: '2024-07' },
      { name: 'August 2024', key: '2024-08' }
    ];

    return months.map(month => {
      const monthAssignments = scheduleAssignments.filter(a => a.date.startsWith(month.key));
      const monthEvents = scheduleEvents.filter(e => e.date.startsWith(month.key));
      
      // Calculate total hours for the month
      const totalHours = monthAssignments.reduce((total, assignment) => {
        const start = new Date(`2024-01-01T${assignment.startTime}:00`);
        const end = new Date(`2024-01-01T${assignment.endTime}:00`);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        return total + hours;
      }, 0);

      // Calculate payroll for the month
      const monthlyPayroll = employees.reduce((total, emp) => {
        const empAssignments = monthAssignments.filter(a => a.employeeId === emp.id);
        const empHours = empAssignments.reduce((empTotal, assignment) => {
          const start = new Date(`2024-01-01T${assignment.startTime}:00`);
          const end = new Date(`2024-01-01T${assignment.endTime}:00`);
          const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          return empTotal + hours;
        }, 0);

        const empPayroll = emp.salaryType === 'hourly' 
          ? empHours * emp.hourlyRate 
          : (emp.annualSalary || 0) / 12;
        
        return total + empPayroll;
      }, 0);

      // Employee-specific data
      const employeeData = employees.map(emp => {
        const empAssignments = monthAssignments.filter(a => a.employeeId === emp.id);
        const empEvents = monthEvents.filter(e => e.employeeId === emp.id);
        
        const empHours = empAssignments.reduce((empTotal, assignment) => {
          const start = new Date(`2024-01-01T${assignment.startTime}:00`);
          const end = new Date(`2024-01-01T${assignment.endTime}:00`);
          const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          return empTotal + hours;
        }, 0);

        const empPayroll = emp.salaryType === 'hourly' 
          ? empHours * emp.hourlyRate 
          : (emp.annualSalary || 0) / 12;

        return {
          employeeId: emp.id,
          name: emp.name,
          hours: Math.round(empHours * 10) / 10,
          events: empEvents.length,
          assignments: empAssignments.length,
          payroll: Math.round(empPayroll * 100) / 100,
          color: emp.color
        };
      });

      return {
        month: month.name,
        monthKey: month.key,
        totalHours: Math.round(totalHours * 10) / 10,
        totalEvents: monthEvents.length,
        totalAssignments: monthAssignments.length,
        totalPayroll: Math.round(monthlyPayroll * 100) / 100,
        avgHourlyRate: totalHours > 0 ? Math.round((monthlyPayroll / totalHours) * 100) / 100 : 0,
        employeeData
      };
    });
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="scheduling-dashboard">
      {/* Secondary Navigation Bar */}
      <div className="secondary-nav">
        <div className="nav-actions">
          <button 
            className="btn btn-primary nav-action-btn"
            onClick={() => setShowAddEmployee(true)}
          >
            <Users size={18} />
            Add Team Member
          </button>
          <button 
            className="btn btn-primary nav-action-btn"
            onClick={() => {
              setNewEvent({...newEvent, date: selectedDate});
              setShowAddEvent(true);
            }}
          >
            <Calendar size={18} />
            Add Event
          </button>
          <button 
            className="btn btn-primary nav-action-btn"
            onClick={() => {
              setNewScheduling({...newScheduling, date: selectedDate});
              setShowAddScheduling(true);
            }}
          >
            <Clock size={18} />
            Add Scheduling
          </button>
          <button 
            className="btn btn-secondary nav-action-btn"
            onClick={() => setShowStatistics(true)}
          >
            <BarChart3 size={18} />
            Statistics
          </button>
          <button 
            className="btn btn-secondary nav-action-btn"
            onClick={() => setShowGraphs(true)}
          >
            <BarChart3 size={18} />
            Graphs
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Employee List Sidebar */}
        <div className="employees-sidebar">
          <div className="sidebar-header">
            <h3>Team Members</h3>
            <button 
              className="btn btn-sm btn-primary"
              onClick={() => setShowAddEmployee(true)}
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="employees-list">
            {employees.map(employee => (
              <div 
                key={employee.id} 
                className={`employee-card ${selectedEmployee?.id === employee.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedEmployee(employee);
                  setShowUserDetail(true);
                }}
              >
                <div className="employee-avatar" style={{ backgroundColor: employee.color }}>
                  {employee.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="employee-info">
                  <h4 className="employee-name">{employee.name}</h4>
                  <p className="employee-role">{employee.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar and Schedule */}
        <div className="calendar-section">
          {/* Calendar Navigation */}
          <div className="calendar-header">
            <div className="calendar-nav">
              <button className="nav-btn" onClick={() => navigateMonth('prev')}>
                <ChevronLeft />
              </button>
              <h2 className="calendar-title">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button className="nav-btn" onClick={() => navigateMonth('next')}>
                <ChevronRight />
              </button>
            </div>
            <div className="selected-date-info">
              Selected: {new Date(selectedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="calendar-grid">
            {dayNames.map(day => (
              <div key={day} className="calendar-day-header">
                {day}
              </div>
            ))}
            
            {/* Empty cells for days before the first day of the month */}
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`empty-${i}`} className="calendar-day empty"></div>
            ))}
            
            {/* Days of the month */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                .toISOString().split('T')[0];
              const isSelected = dateStr === selectedDate;
              const isToday = dateStr === new Date().toISOString().split('T')[0];
              const dayEvents = getEventsForDate(dateStr);
              const dayAssignments = getAssignmentsForDate(dateStr);
              const totalItems = dayEvents.length + dayAssignments.length;
              
              return (
                <div 
                  key={day} 
                  className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                  onClick={() => handleDateClick(day)}
                  onDoubleClick={() => handleDateDoubleClick(day)}
                >
                  <span className="day-number">{day}</span>
                  {totalItems > 0 && (
                    <div className="day-events">
                      {/* Show events first */}
                      {dayEvents.slice(0, 2).map(event => {
                        const employee = employees.find(emp => emp.id === event.employeeId);
                        return (
                          <div 
                            key={event.id} 
                            className="day-event event"
                            style={{ backgroundColor: employee?.color || '#gray' }}
                          >
                            {event.title}
                          </div>
                        );
                      })}
                      {/* Show assignments if there's space */}
                      {dayEvents.length < 2 && dayAssignments.slice(0, 2 - dayEvents.length).map(assignment => {
                        const employee = employees.find(emp => emp.id === assignment.employeeId);
                        return (
                          <div 
                            key={assignment.id} 
                            className="day-event assignment"
                            style={{ backgroundColor: employee?.color || '#gray' }}
                          >
                            {assignment.title}
                          </div>
                        );
                      })}
                      {totalItems > 2 && (
                        <div className="more-events">+{totalItems - 2} more</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>


        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddEmployee && (
        <div className="sched-modal-backdrop">
          <div className="sched-modal-container large-modal">
            <div className="sched-modal-head">
              <h3 className="sched-modal-title">Add New Employee</h3>
              <button 
                className="sched-close-button"
                onClick={() => setShowAddEmployee(false)}
              >
                <X />
              </button>
            </div>
            <div className="sched-modal-body">
              <div className="sched-form-field">
                <label className="sched-field-label">Name</label>
                <input 
                  className="sched-field-input"
                  type="text"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                  placeholder="Enter employee name"
                />
              </div>
              <div className="sched-form-field">
                <label className="sched-field-label">Role</label>
                <input 
                  className="sched-field-input"
                  type="text"
                  value={newEmployee.role}
                  onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})}
                  placeholder="Enter job role"
                />
              </div>
              <div className="sched-form-field">
                <label className="sched-field-label">Email</label>
                <input 
                  className="sched-field-input"
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
              <div className="sched-form-field">
                <label className="sched-field-label">Phone</label>
                <input 
                  className="sched-field-input"
                  type="tel"
                  value={newEmployee.phone}
                  onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="sched-form-field">
                <label className="sched-field-label">Color</label>
                <input 
                  className="sched-field-input"
                  type="color"
                  value={newEmployee.color}
                  onChange={(e) => setNewEmployee({...newEmployee, color: e.target.value})}
                />
              </div>
              <div className="sched-form-field">
                <label className="sched-field-label">Salary Type</label>
                <select 
                  className="sched-field-select"
                  value={newEmployee.salaryType}
                  onChange={(e) => setNewEmployee({...newEmployee, salaryType: e.target.value as 'hourly' | 'salary'})}
                >
                  <option value="hourly">Hourly</option>
                  <option value="salary">Salary</option>
                </select>
              </div>
              <div className="sched-form-field">
                <label className="sched-field-label">
                  {newEmployee.salaryType === 'hourly' ? 'Hourly Rate ($)' : 'Annual Salary ($)'}
                </label>
                <input 
                  className="sched-field-input"
                  type="number"
                  min="0"
                  step={newEmployee.salaryType === 'hourly' ? '0.01' : '1'}
                  value={newEmployee.salaryType === 'hourly' ? newEmployee.hourlyRate : (newEmployee.hourlyRate * 2080)}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    if (newEmployee.salaryType === 'hourly') {
                      setNewEmployee({...newEmployee, hourlyRate: value});
                    } else {
                      setNewEmployee({...newEmployee, hourlyRate: value / 2080}); // 2080 hours per year (40h/week * 52 weeks)
                    }
                  }}
                  placeholder={newEmployee.salaryType === 'hourly' ? 'Enter hourly rate' : 'Enter annual salary'}
                />
              </div>
            </div>
            <div className="sched-modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowAddEmployee(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={addEmployee}
                disabled={!newEmployee.name || !newEmployee.role || !newEmployee.email}
              >
                <Save className="icon" />
                Add Employee
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddEvent && (
        <div className="sched-modal-backdrop">
          <div className="sched-modal-container large-modal">
            <div className="sched-modal-head">
              <h3 className="sched-modal-title">Schedule New Event</h3>
              <button 
                className="sched-close-button"
                onClick={() => setShowAddEvent(false)}
              >
                <X />
              </button>
            </div>
            <div className="sched-modal-body">
              <div className="sched-form-field">
                <label className="sched-field-label">Employee</label>
                <select 
                  className="sched-field-select"
                  value={newEvent.employeeId}
                  onChange={(e) => setNewEvent({...newEvent, employeeId: e.target.value})}
                >
                  <option value="">Select an employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>
              <div className="sched-form-field">
                <label className="sched-field-label">Title</label>
                <input 
                  className="sched-field-input"
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  placeholder="Enter event title"
                />
              </div>
              <div className="sched-form-field">
                <label className="sched-field-label">Date</label>
                <input 
                  className="sched-field-input"
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                />
              </div>
              <div className="sched-form-row">
                <div className="sched-form-field">
                  <label className="sched-field-label">Start Time</label>
                  <input 
                    className="sched-field-input"
                    type="time"
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent({...newEvent, startTime: e.target.value})}
                  />
                </div>
                <div className="sched-form-field">
                  <label className="sched-field-label">End Time</label>
                  <input 
                    className="sched-field-input"
                    type="time"
                    value={newEvent.endTime}
                    onChange={(e) => setNewEvent({...newEvent, endTime: e.target.value})}
                  />
                </div>
              </div>
              <div className="sched-form-field">
                <label className="sched-field-label">Description</label>
                <textarea 
                  className="sched-field-textarea"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  placeholder="Enter event description (optional)"
                  rows={3}
                />
              </div>
            </div>
            <div className="sched-modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowAddEvent(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={addEvent}
                disabled={!newEvent.employeeId || !newEvent.title || !newEvent.date}
              >
                <Save className="icon" />
                Schedule Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Scheduling Modal */}
      {showAddScheduling && (
        <div className="sched-modal-backdrop">
          <div className="sched-modal-container extra-large-modal">
            <div className="sched-modal-head">
              <h3 className="sched-modal-title">Add Scheduling Assignment</h3>
              <button 
                className="sched-close-button"
                onClick={() => setShowAddScheduling(false)}
              >
                <X />
              </button>
            </div>
            <div className="sched-modal-body">
              <div className="scheduling-form-layout">
                {/* Left Column - Basic Info */}
                <div className="form-column">
                  <h4 className="section-title">Assignment Details</h4>
                  
                  <div className="sched-form-field">
                    <label className="sched-field-label">Employee</label>
                    <select 
                      className="sched-field-select"
                      value={newScheduling.employeeId}
                      onChange={(e) => setNewScheduling({...newScheduling, employeeId: e.target.value})}
                    >
                      <option value="">Select an employee</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sched-form-field">
                    <label className="sched-field-label">Assignment Type</label>
                    <select 
                      className="sched-field-select"
                      value={newScheduling.type}
                      onChange={(e) => setNewScheduling({...newScheduling, type: e.target.value as 'work-hours' | 'event-assignment'})}
                    >
                      <option value="work-hours">Work Hours</option>
                      <option value="event-assignment">Event Assignment</option>
                    </select>
                  </div>

                  {newScheduling.type === 'event-assignment' && (
                    <div className="sched-form-field">
                      <label className="sched-field-label">Related Event</label>
                      <select 
                        className="sched-field-select"
                        value={newScheduling.eventId}
                        onChange={(e) => setNewScheduling({...newScheduling, eventId: e.target.value})}
                      >
                        <option value="">Select an event</option>
                        {scheduleEvents.map(event => (
                          <option key={event.id} value={event.id}>
                            {event.title} - {event.date}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="sched-form-field">
                    <label className="sched-field-label">Title</label>
                    <input 
                      className="sched-field-input"
                      type="text"
                      value={newScheduling.title}
                      onChange={(e) => setNewScheduling({...newScheduling, title: e.target.value})}
                      placeholder={newScheduling.type === 'work-hours' ? 'e.g., Morning Shift' : 'e.g., Setup for Client Meeting'}
                    />
                  </div>

                  <div className="sched-form-row">
                    <div className="sched-form-field">
                      <label className="sched-field-label">Start Time</label>
                      <input 
                        className="sched-field-input"
                        type="time"
                        value={newScheduling.startTime}
                        onChange={(e) => setNewScheduling({...newScheduling, startTime: e.target.value})}
                      />
                    </div>
                    <div className="sched-form-field">
                      <label className="sched-field-label">End Time</label>
                      <input 
                        className="sched-field-input"
                        type="time"
                        value={newScheduling.endTime}
                        onChange={(e) => setNewScheduling({...newScheduling, endTime: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="sched-form-field">
                    <label className="sched-field-label">Description</label>
                    <textarea 
                      className="sched-field-textarea"
                      value={newScheduling.description}
                      onChange={(e) => setNewScheduling({...newScheduling, description: e.target.value})}
                      placeholder="Enter assignment description (optional)"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Right Column - Date Selection */}
                <div className="form-column">
                  <h4 className="section-title">Schedule Dates</h4>
                  
                  <div className="sched-form-field">
                    <label className="sched-field-label">Scheduling Type</label>
                    <select 
                      className="sched-field-select"
                      value={isMultiDay ? 'multi' : 'single'}
                      onChange={(e) => {
                        const isMulti = e.target.value === 'multi';
                        setIsMultiDay(isMulti);
                        if (!isMulti) {
                          setSchedulingDates([newScheduling.date]);
                        }
                      }}
                    >
                      <option value="single">Single Day</option>
                      <option value="multi">Multiple Days</option>
                    </select>
                  </div>
                  
                  {!isMultiDay ? (
                    <div className="sched-form-field">
                      <label className="sched-field-label">Date</label>
                      <input 
                        className="sched-field-input"
                        type="date"
                        value={newScheduling.date}
                        onChange={(e) => setNewScheduling({...newScheduling, date: e.target.value})}
                      />
                    </div>
                  ) : (
                    <div className="multi-day-selection">
                      <label className="sched-field-label">Select Multiple Dates</label>
                      
                      {/* Mini Calendar for Date Selection */}
                      <div className="mini-calendar">
                        <div className="mini-calendar-header">
                          <button 
                            type="button"
                            className="mini-nav-btn"
                            onClick={() => {
                              const newDate = new Date(currentDate);
                              newDate.setMonth(newDate.getMonth() - 1);
                              setCurrentDate(newDate);
                            }}
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <span className="mini-calendar-title">
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                          </span>
                          <button 
                            type="button"
                            className="mini-nav-btn"
                            onClick={() => {
                              const newDate = new Date(currentDate);
                              newDate.setMonth(newDate.getMonth() + 1);
                              setCurrentDate(newDate);
                            }}
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                        
                        <div className="mini-calendar-grid">
                          {dayNames.map(day => (
                            <div key={day} className="mini-day-header">
                              {day.slice(0, 2)}
                            </div>
                          ))}
                          
                          {Array.from({ length: firstDay }, (_, i) => (
                            <div key={`empty-${i}`} className="mini-day empty"></div>
                          ))}
                          
                          {Array.from({ length: daysInMonth }, (_, i) => {
                            const day = i + 1;
                            const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                              .toISOString().split('T')[0];
                            const isSelected = schedulingDates.includes(dateStr);
                            const isToday = dateStr === new Date().toISOString().split('T')[0];
                            
                            return (
                              <div 
                                key={day} 
                                className={`mini-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                                onClick={() => {
                                  if (isSelected) {
                                    setSchedulingDates(schedulingDates.filter(d => d !== dateStr));
                                  } else {
                                    setSchedulingDates([...schedulingDates, dateStr]);
                                  }
                                }}
                              >
                                {day}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Selected Dates Display */}
                      {schedulingDates.length > 0 && (
                        <div className="selected-dates-section">
                          <label className="sched-field-label">Selected Dates ({schedulingDates.length})</label>
                          <div className="selected-dates">
                            {schedulingDates.sort().map((date, index) => (
                              <div key={index} className="date-tag">
                                {new Date(date).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                                <button 
                                  type="button"
                                  onClick={() => setSchedulingDates(schedulingDates.filter((_, i) => i !== index))}
                                  className="remove-date"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                          <button 
                            type="button"
                            className="clear-dates-btn"
                            onClick={() => setSchedulingDates([])}
                          >
                            Clear All Dates
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="sched-modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowAddScheduling(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={addScheduling}
                disabled={!newScheduling.employeeId || !newScheduling.title || (!isMultiDay && !newScheduling.date) || (isMultiDay && schedulingDates.length === 0)}
              >
                <Save className="icon" />
                Add Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {showUserDetail && selectedEmployee && (
        <div className="sched-modal-backdrop">
          <div className="sched-modal-container large-modal">
            <div className="sched-modal-head">
              <h3 className="sched-modal-title">{selectedEmployee.name} - Schedule Details</h3>
              <button 
                className="sched-close-button"
                onClick={() => setShowUserDetail(false)}
              >
                <X />
              </button>
            </div>
            <div className="sched-modal-body">
              {/* Employee Info */}
              <div className="user-info-section">
                <div className="user-avatar-large" style={{ backgroundColor: selectedEmployee.color }}>
                  {selectedEmployee.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="user-details">
                  {!isEditingEmployee ? (
                    <>
                      <h4>{selectedEmployee.name}</h4>
                      <p className="user-role">{selectedEmployee.role}</p>
                      <div className="user-contact">
                        <div className="contact-item">
                          <Mail size={16} />
                          {selectedEmployee.email}
                        </div>
                        <div className="contact-item">
                          <Phone size={16} />
                          {selectedEmployee.phone}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="edit-employee-form">
                      <div className="sched-form-field">
                        <label className="sched-field-label">Name</label>
                        <input 
                          className="sched-field-input"
                          type="text"
                          value={editEmployee.name}
                          onChange={(e) => setEditEmployee({...editEmployee, name: e.target.value})}
                        />
                      </div>
                      <div className="sched-form-field">
                        <label className="sched-field-label">Role</label>
                        <input 
                          className="sched-field-input"
                          type="text"
                          value={editEmployee.role}
                          onChange={(e) => setEditEmployee({...editEmployee, role: e.target.value})}
                        />
                      </div>
                      <div className="sched-form-row">
                        <div className="sched-form-field">
                          <label className="sched-field-label">Email</label>
                          <input 
                            className="sched-field-input"
                            type="email"
                            value={editEmployee.email}
                            onChange={(e) => setEditEmployee({...editEmployee, email: e.target.value})}
                          />
                        </div>
                        <div className="sched-form-field">
                          <label className="sched-field-label">Phone</label>
                          <input 
                            className="sched-field-input"
                            type="tel"
                            value={editEmployee.phone}
                            onChange={(e) => setEditEmployee({...editEmployee, phone: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="sched-form-field">
                        <label className="sched-field-label">Color</label>
                        <input 
                          className="sched-field-input"
                          type="color"
                          value={editEmployee.color}
                          onChange={(e) => setEditEmployee({...editEmployee, color: e.target.value})}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Schedule Overview */}
              <div className="schedule-overview">
                <h4>Current Schedule</h4>
                <div className="schedule-stats">
                  <div className="stat-card">
                    <div className="stat-number">
                      {scheduleEvents.filter(event => event.employeeId === selectedEmployee.id).length}
                    </div>
                    <div className="stat-label">Total Events</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">
                      {scheduleAssignments.filter(assignment => assignment.employeeId === selectedEmployee.id).length}
                    </div>
                    <div className="stat-label">Total Assignments</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">
                      {[
                        ...scheduleEvents.filter(event => event.employeeId === selectedEmployee.id && event.date === selectedDate),
                        ...scheduleAssignments.filter(assignment => assignment.employeeId === selectedEmployee.id && assignment.date === selectedDate)
                      ].length}
                    </div>
                    <div className="stat-label">Today's Items</div>
                  </div>
                </div>
              </div>

              {/* Today's Schedule */}
              <div className="todays-schedule">
                <h4>Schedule for {new Date(selectedDate).toLocaleDateString()}</h4>
                <div className="schedule-items">
                  {[
                    ...scheduleEvents.filter(event => event.employeeId === selectedEmployee.id && event.date === selectedDate)
                      .map(item => ({...item, itemType: 'event' as const})),
                    ...scheduleAssignments.filter(assignment => assignment.employeeId === selectedEmployee.id && assignment.date === selectedDate)
                      .map(item => ({...item, itemType: 'assignment' as const}))
                  ].sort((a, b) => a.startTime.localeCompare(b.startTime)).map(item => (
                    <div key={item.id} className={`schedule-item ${item.itemType}`}>
                      <div className="item-time">
                        <Clock size={16} />
                        {item.startTime} - {item.endTime}
                      </div>
                      <div className="item-content">
                        <h5 className="item-title">
                          {item.title}
                          {item.itemType === 'assignment' && (
                            <span className="type-badge assignment">Assignment</span>
                          )}
                          {item.itemType === 'event' && (
                            <span className="type-badge event">Event</span>
                          )}
                        </h5>
                        {item.description && (
                          <p className="item-description">{item.description}</p>
                        )}
                      </div>
                      <div className="item-actions">
                        <button 
                          className="btn btn-sm btn-secondary"
                          onClick={() => {
                            if (item.itemType === 'event') {
                              deleteEvent(item.id);
                            } else {
                              deleteScheduling(item.id);
                            }
                          }}
                        >
                          <Trash2 size={14} />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {[
                    ...scheduleEvents.filter(event => event.employeeId === selectedEmployee.id && event.date === selectedDate),
                    ...scheduleAssignments.filter(assignment => assignment.employeeId === selectedEmployee.id && assignment.date === selectedDate)
                  ].length === 0 && (
                    <div className="no-schedule-items">
                      <Calendar size={32} />
                      <p>No events or assignments scheduled for this date</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="sched-modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setShowUserDetail(false);
                  setIsEditingEmployee(false);
                }}
              >
                Close
              </button>
              {!isEditingEmployee ? (
                <>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => startEditingEmployee(selectedEmployee)}
                  >
                    <Edit3 size={16} />
                    Edit Employee
                  </button>
                  <button 
                    className="btn btn-secondary"
                    style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' }}
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete ${selectedEmployee.name}?`)) {
                        deleteEmployee(selectedEmployee.id);
                      }
                    }}
                  >
                    <Trash2 size={16} />
                    Delete Employee
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      setNewEvent({...newEvent, employeeId: selectedEmployee.id, date: selectedDate});
                      setShowUserDetail(false);
                      setShowAddEvent(true);
                    }}
                  >
                    <Plus size={16} />
                    Add Event
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      setNewScheduling({...newScheduling, employeeId: selectedEmployee.id, date: selectedDate});
                      setShowUserDetail(false);
                      setShowAddScheduling(true);
                    }}
                  >
                    <Clock size={16} />
                    Add Assignment
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className="btn btn-secondary"
                    onClick={cancelEmployeeEdit}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={saveEmployeeEdit}
                  >
                    <Save size={16} />
                    Save Changes
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Day Detail Modal */}
      {showDayDetail && selectedDayData && (
        <div className="sched-modal-backdrop">
          <div className="sched-modal-container large-modal">
            <div className="sched-modal-head">
              <h3 className="sched-modal-title">
                Schedule for {new Date(selectedDayData.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              <button 
                className="sched-close-button"
                onClick={() => setShowDayDetail(false)}
              >
                <X />
              </button>
            </div>
            <div className="sched-modal-body">
              {/* Day Overview */}
              <div className="day-overview">
                <div className="day-stats">
                  <div className="stat-card">
                    <div className="stat-number">{selectedDayData.events.length}</div>
                    <div className="stat-label">Events</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{selectedDayData.assignments.length}</div>
                    <div className="stat-label">Assignments</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">
                      {selectedDayData.events.length + selectedDayData.assignments.length}
                    </div>
                    <div className="stat-label">Total Items</div>
                  </div>
                </div>
              </div>

              {/* Day Schedule */}
              <div className="day-schedule">
                <h4>Daily Schedule</h4>
                <div className="schedule-items">
                  {[
                    ...selectedDayData.events.map(item => ({...item, itemType: 'event' as const})),
                    ...selectedDayData.assignments.map(item => ({...item, itemType: 'assignment' as const}))
                  ].sort((a, b) => a.startTime.localeCompare(b.startTime)).map(item => {
                    const employee = employees.find(emp => emp.id === item.employeeId);
                    return (
                      <div key={`${item.itemType}-${item.id}`} className={`schedule-item ${item.itemType}`}>
                        <div className="item-time">
                          <Clock size={16} />
                          {item.startTime} - {item.endTime}
                        </div>
                        <div className="item-content">
                          <h5 className="item-title">
                            {item.title}
                            <span className={`type-badge ${item.itemType}`}>
                              {item.itemType === 'event' ? 'Event' : 'Assignment'}
                            </span>
                          </h5>
                          {employee && (
                            <div className="item-employee">
                              <div 
                                className="employee-badge" 
                                style={{ backgroundColor: employee.color }}
                              >
                                {employee.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <span>{employee.name}</span>
                            </div>
                          )}
                          {item.description && (
                            <p className="item-description">{item.description}</p>
                          )}
                        </div>
                        <div className="item-actions">
                          <button 
                            className="btn btn-sm btn-secondary"
                            onClick={() => {
                              if (item.itemType === 'event') {
                                deleteEvent(item.id);
                                // Update the day data
                                setSelectedDayData({
                                  ...selectedDayData,
                                  events: selectedDayData.events.filter(e => e.id !== item.id)
                                });
                              } else {
                                deleteScheduling(item.id);
                                // Update the day data
                                setSelectedDayData({
                                  ...selectedDayData,
                                  assignments: selectedDayData.assignments.filter(a => a.id !== item.id)
                                });
                              }
                            }}
                          >
                            <Trash2 size={14} />
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  
                  {selectedDayData.events.length === 0 && selectedDayData.assignments.length === 0 && (
                    <div className="no-schedule-items">
                      <Calendar size={32} />
                      <p>No events or assignments scheduled for this date</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="sched-modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowDayDetail(false)}
              >
                Close
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setNewEvent({...newEvent, date: selectedDayData.date});
                  setShowDayDetail(false);
                  setShowAddEvent(true);
                }}
              >
                <Plus size={16} />
                Add Event
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setNewScheduling({...newScheduling, date: selectedDayData.date});
                  setShowDayDetail(false);
                  setShowAddScheduling(true);
                }}
              >
                <Clock size={16} />
                Add Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Modal */}
      {showStatistics && (
        <div className="sched-modal-backdrop">
          <div className="sched-modal-container extra-large-modal">
            <div className="sched-modal-head">
              <h3 className="sched-modal-title">Team Statistics & Payroll Analytics</h3>
              <button 
                className="sched-close-button"
                onClick={() => setShowStatistics(false)}
              >
                <X />
              </button>
            </div>
            <div className="sched-modal-body">
              {/* Team Overview */}
              <div className="stats-overview">
                <h4>Team Overview</h4>
                <div className="stats-grid">
                  {(() => {
                    const teamStats = calculateTeamStats();
                    return (
                      <>
                        <div className="stat-card">
                          <div className="stat-number">{teamStats.totalEmployees}</div>
                          <div className="stat-label">Team Members</div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-number">{teamStats.totalHours}</div>
                          <div className="stat-label">Total Hours</div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-number">{teamStats.totalEvents}</div>
                          <div className="stat-label">Total Events</div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-number">{teamStats.totalAssignments}</div>
                          <div className="stat-label">Total Assignments</div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Payroll Summary */}
              <div className="payroll-summary">
                <h4>Payroll Summary</h4>
                <div className="payroll-grid">
                  {(() => {
                    const teamStats = calculateTeamStats();
                    return (
                      <>
                        <div className="payroll-card weekly">
                          <div className="payroll-header">
                            <h5>Weekly Payroll</h5>
                            <span className="payroll-period">Per Week</span>
                          </div>
                          <div className="payroll-amount">${teamStats.weeklyPayroll.toLocaleString()}</div>
                        </div>
                        <div className="payroll-card monthly">
                          <div className="payroll-header">
                            <h5>Monthly Payroll</h5>
                            <span className="payroll-period">Per Month</span>
                          </div>
                          <div className="payroll-amount">${teamStats.monthlyPayroll.toLocaleString()}</div>
                        </div>
                        <div className="payroll-card annual">
                          <div className="payroll-header">
                            <h5>Annual Payroll</h5>
                            <span className="payroll-period">Per Year</span>
                          </div>
                          <div className="payroll-amount">${teamStats.annualPayroll.toLocaleString()}</div>
                        </div>
                        <div className="payroll-card cost">
                          <div className="payroll-header">
                            <h5>Avg. Hourly Cost</h5>
                            <span className="payroll-period">Per Hour</span>
                          </div>
                          <div className="payroll-amount">${teamStats.avgHourlyCost}</div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Employee Breakdown */}
              <div className="employee-breakdown">
                <h4>Employee Breakdown</h4>
                <div className="employee-stats-list">
                  {employees.map(employee => {
                    const stats = calculateEmployeeStats(employee);
                    return (
                      <div key={employee.id} className="employee-stat-card">
                        <div className="employee-stat-header">
                          <div className="employee-avatar" style={{ backgroundColor: employee.color }}>
                            {employee.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="employee-info">
                            <h5>{employee.name}</h5>
                            <p>{employee.role}</p>
                            <div className="salary-info">
                              {employee.salaryType === 'salary' ? (
                                <span className="salary-badge salary">Salary: ${employee.annualSalary?.toLocaleString()}/year</span>
                              ) : (
                                <span className="salary-badge hourly">Hourly: ${employee.hourlyRate}/hr</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="employee-stats-grid">
                          <div className="stat-item">
                            <div className="stat-value">{stats.totalHours}h</div>
                            <div className="stat-desc">Total Hours</div>
                          </div>
                          <div className="stat-item">
                            <div className="stat-value">{stats.weeklyHours}h</div>
                            <div className="stat-desc">Weekly Avg</div>
                          </div>
                          <div className="stat-item">
                            <div className="stat-value">{stats.totalEvents}</div>
                            <div className="stat-desc">Events</div>
                          </div>
                          <div className="stat-item">
                            <div className="stat-value">{stats.totalAssignments}</div>
                            <div className="stat-desc">Assignments</div>
                          </div>
                          <div className="stat-item">
                            <div className="stat-value">${stats.weeklyEarnings.toLocaleString()}</div>
                            <div className="stat-desc">Weekly Pay</div>
                          </div>
                          <div className="stat-item">
                            <div className="stat-value">${stats.monthlyEarnings.toLocaleString()}</div>
                            <div className="stat-desc">Monthly Pay</div>
                          </div>
                          <div className="stat-item">
                            <div className="stat-value">${stats.annualEarnings.toLocaleString()}</div>
                            <div className="stat-desc">Annual Pay</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Business Insights */}
              <div className="business-insights">
                <h4>Business Insights</h4>
                <div className="insights-grid">
                  {(() => {
                    const teamStats = calculateTeamStats();
                    const avgSalary = teamStats.annualPayroll / teamStats.totalEmployees;
                    const hoursPerEmployee = teamStats.totalHours / teamStats.totalEmployees;
                    const costPerEvent = teamStats.totalEvents > 0 ? teamStats.monthlyPayroll / teamStats.totalEvents : 0;
                    
                    return (
                      <>
                        <div className="insight-card">
                          <div className="insight-icon">💰</div>
                          <div className="insight-content">
                            <h5>Average Salary</h5>
                            <div className="insight-value">${Math.round(avgSalary).toLocaleString()}</div>
                            <p>Per employee annually</p>
                          </div>
                        </div>
                        <div className="insight-card">
                          <div className="insight-icon">⏰</div>
                          <div className="insight-content">
                            <h5>Avg Hours/Employee</h5>
                            <div className="insight-value">{Math.round(hoursPerEmployee * 10) / 10}h</div>
                            <p>Per employee (3 months)</p>
                          </div>
                        </div>
                        <div className="insight-card">
                          <div className="insight-icon">📊</div>
                          <div className="insight-content">
                            <h5>Cost Per Event</h5>
                            <div className="insight-value">${Math.round(costPerEvent * 100) / 100}</div>
                            <p>Average cost per scheduled event</p>
                          </div>
                        </div>
                        <div className="insight-card">
                          <div className="insight-icon">🎯</div>
                          <div className="insight-content">
                            <h5>Utilization Rate</h5>
                            <div className="insight-value">{Math.round((teamStats.totalHours / (teamStats.totalEmployees * 40 * 12)) * 100)}%</div>
                            <p>Based on 40h/week standard</p>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
            <div className="sched-modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowStatistics(false)}
              >
                Close
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  // Export functionality could be added here
                  alert('Export functionality would be implemented here');
                }}
              >
                Export Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Graphs Modal */}
      {showGraphs && (
        <div className="sched-modal-backdrop">
          <div className="sched-modal-container extra-large-modal">
            <div className="sched-modal-head">
              <h3 className="sched-modal-title">Analytics & Trends</h3>
              <button 
                className="sched-close-button"
                onClick={() => setShowGraphs(false)}
              >
                <X />
              </button>
            </div>
            <div className="sched-modal-body">
              {(() => {
                const timeSeriesData = generateTimeSeriesData();
                const maxPayroll = Math.max(...timeSeriesData.map(d => d.totalPayroll));
                const maxHours = Math.max(...timeSeriesData.map(d => d.totalHours));
                const maxEvents = Math.max(...timeSeriesData.map(d => d.totalEvents));
                
                return (
                  <>
                    {/* Payroll Trends */}
                    <div className="graph-section">
                      <h4>Monthly Payroll Trends</h4>
                      <div className="chart-container">
                        <svg width="100%" height="300" viewBox="0 0 800 300">
                          {/* Grid lines */}
                          {[0, 1, 2, 3, 4].map(i => (
                            <line 
                              key={i}
                              x1="80" 
                              y1={50 + i * 50} 
                              x2="720" 
                              y2={50 + i * 50}
                              stroke="#f1f5f9" 
                              strokeWidth="1"
                            />
                          ))}
                          
                          {/* Y-axis labels */}
                          {[0, 1, 2, 3, 4].map(i => (
                            <text 
                              key={i}
                              x="70" 
                              y={55 + i * 50} 
                              textAnchor="end" 
                              fontSize="12" 
                              fill="#6b7280"
                            >
                              ${Math.round((maxPayroll * (4 - i)) / 4).toLocaleString()}
                            </text>
                          ))}
                          
                          {/* Payroll line */}
                          <polyline
                            points={timeSeriesData.map((d, i) => 
                              `${120 + i * 200},${250 - (d.totalPayroll / maxPayroll) * 200}`
                            ).join(' ')}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="3"
                          />
                          
                          {/* Data points */}
                          {timeSeriesData.map((d, i) => (
                            <g key={i}>
                              <circle
                                cx={120 + i * 200}
                                cy={250 - (d.totalPayroll / maxPayroll) * 200}
                                r="6"
                                fill="#3b82f6"
                              />
                              <text
                                x={120 + i * 200}
                                y={280}
                                textAnchor="middle"
                                fontSize="12"
                                fill="#374151"
                              >
                                {d.month.split(' ')[0]}
                              </text>
                              <text
                                x={120 + i * 200}
                                y={240 - (d.totalPayroll / maxPayroll) * 200}
                                textAnchor="middle"
                                fontSize="11"
                                fill="#1f2937"
                                fontWeight="600"
                              >
                                ${d.totalPayroll.toLocaleString()}
                              </text>
                            </g>
                          ))}
                          
                          {/* Chart title */}
                          <text x="400" y="25" textAnchor="middle" fontSize="16" fontWeight="600" fill="#1f2937">
                            Monthly Payroll ($)
                          </text>
                        </svg>
                      </div>
                    </div>

                    {/* Hours Worked Trends */}
                    <div className="graph-section">
                      <h4>Total Hours Worked</h4>
                      <div className="chart-container">
                        <svg width="100%" height="300" viewBox="0 0 800 300">
                          {/* Grid lines */}
                          {[0, 1, 2, 3, 4].map(i => (
                            <line 
                              key={i}
                              x1="80" 
                              y1={50 + i * 50} 
                              x2="720" 
                              y2={50 + i * 50}
                              stroke="#f1f5f9" 
                              strokeWidth="1"
                            />
                          ))}
                          
                          {/* Y-axis labels */}
                          {[0, 1, 2, 3, 4].map(i => (
                            <text 
                              key={i}
                              x="70" 
                              y={55 + i * 50} 
                              textAnchor="end" 
                              fontSize="12" 
                              fill="#6b7280"
                            >
                              {Math.round((maxHours * (4 - i)) / 4)}h
                            </text>
                          ))}
                          
                          {/* Hours line */}
                          <polyline
                            points={timeSeriesData.map((d, i) => 
                              `${120 + i * 200},${250 - (d.totalHours / maxHours) * 200}`
                            ).join(' ')}
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="3"
                          />
                          
                          {/* Data points */}
                          {timeSeriesData.map((d, i) => (
                            <g key={i}>
                              <circle
                                cx={120 + i * 200}
                                cy={250 - (d.totalHours / maxHours) * 200}
                                r="6"
                                fill="#10b981"
                              />
                              <text
                                x={120 + i * 200}
                                y={280}
                                textAnchor="middle"
                                fontSize="12"
                                fill="#374151"
                              >
                                {d.month.split(' ')[0]}
                              </text>
                              <text
                                x={120 + i * 200}
                                y={240 - (d.totalHours / maxHours) * 200}
                                textAnchor="middle"
                                fontSize="11"
                                fill="#1f2937"
                                fontWeight="600"
                              >
                                {d.totalHours}h
                              </text>
                            </g>
                          ))}
                          
                          {/* Chart title */}
                          <text x="400" y="25" textAnchor="middle" fontSize="16" fontWeight="600" fill="#1f2937">
                            Total Hours Worked
                          </text>
                        </svg>
                      </div>
                    </div>

                    {/* Employee Performance Comparison */}
                    <div className="graph-section">
                      <h4>Employee Hours by Month</h4>
                      <div className="chart-container">
                        <svg width="100%" height="400" viewBox="0 0 800 400">
                          {/* Grid lines */}
                          {[0, 1, 2, 3, 4, 5].map(i => (
                            <line 
                              key={i}
                              x1="80" 
                              y1={50 + i * 50} 
                              x2="720" 
                              y2={50 + i * 50}
                              stroke="#f1f5f9" 
                              strokeWidth="1"
                            />
                          ))}
                          
                          {/* Y-axis labels */}
                          {[0, 1, 2, 3, 4, 5].map(i => {
                            const maxEmployeeHours = Math.max(...timeSeriesData.flatMap(d => d.employeeData.map(e => e.hours)));
                            return (
                              <text 
                                key={i}
                                x="70" 
                                y={55 + i * 50} 
                                textAnchor="end" 
                                fontSize="12" 
                                fill="#6b7280"
                              >
                                {Math.round((maxEmployeeHours * (5 - i)) / 5)}h
                              </text>
                            );
                          })}
                          
                          {/* Employee lines */}
                          {employees.map((emp, empIndex) => {
                            const maxEmployeeHours = Math.max(...timeSeriesData.flatMap(d => d.employeeData.map(e => e.hours)));
                            return (
                              <g key={emp.id}>
                                <polyline
                                  points={timeSeriesData.map((d, i) => {
                                    const empData = d.employeeData.find(e => e.employeeId === emp.id);
                                    return `${120 + i * 200},${300 - (empData?.hours || 0) / maxEmployeeHours * 250}`;
                                  }).join(' ')}
                                  fill="none"
                                  stroke={emp.color}
                                  strokeWidth="2"
                                />
                                
                                {/* Data points */}
                                {timeSeriesData.map((d, i) => {
                                  const empData = d.employeeData.find(e => e.employeeId === emp.id);
                                  return (
                                    <circle
                                      key={i}
                                      cx={120 + i * 200}
                                      cy={300 - (empData?.hours || 0) / maxEmployeeHours * 250}
                                      r="4"
                                      fill={emp.color}
                                    />
                                  );
                                })}
                              </g>
                            );
                          })}
                          
                          {/* X-axis labels */}
                          {timeSeriesData.map((d, i) => (
                            <text
                              key={i}
                              x={120 + i * 200}
                              y={330}
                              textAnchor="middle"
                              fontSize="12"
                              fill="#374151"
                            >
                              {d.month.split(' ')[0]}
                            </text>
                          ))}
                          
                          {/* Chart title */}
                          <text x="400" y="25" textAnchor="middle" fontSize="16" fontWeight="600" fill="#1f2937">
                            Employee Hours Comparison
                          </text>
                          
                          {/* Legend */}
                          {employees.map((emp, i) => (
                            <g key={emp.id}>
                              <rect
                                x={50 + (i % 3) * 200}
                                y={360 + Math.floor(i / 3) * 20}
                                width="12"
                                height="12"
                                fill={emp.color}
                              />
                              <text
                                x={68 + (i % 3) * 200}
                                y={370 + Math.floor(i / 3) * 20}
                                fontSize="11"
                                fill="#374151"
                              >
                                {emp.name.split(' ')[0]}
                              </text>
                            </g>
                          ))}
                        </svg>
                      </div>
                    </div>

                    {/* Events vs Assignments */}
                    <div className="graph-section">
                      <h4>Events vs Assignments</h4>
                      <div className="chart-container">
                        <svg width="100%" height="300" viewBox="0 0 800 300">
                          {/* Grid lines */}
                          {[0, 1, 2, 3, 4].map(i => (
                            <line 
                              key={i}
                              x1="80" 
                              y1={50 + i * 50} 
                              x2="720" 
                              y2={50 + i * 50}
                              stroke="#f1f5f9" 
                              strokeWidth="1"
                            />
                          ))}
                          
                          {/* Y-axis labels */}
                          {[0, 1, 2, 3, 4].map(i => {
                            const maxCount = Math.max(...timeSeriesData.flatMap(d => [d.totalEvents, d.totalAssignments]));
                            return (
                              <text 
                                key={i}
                                x="70" 
                                y={55 + i * 50} 
                                textAnchor="end" 
                                fontSize="12" 
                                fill="#6b7280"
                              >
                                {Math.round((maxCount * (4 - i)) / 4)}
                              </text>
                            );
                          })}
                          
                          {/* Bar chart */}
                          {timeSeriesData.map((d, i) => {
                            const maxCount = Math.max(...timeSeriesData.flatMap(d => [d.totalEvents, d.totalAssignments]));
                            const barWidth = 60;
                            const groupWidth = 140;
                            const x = 120 + i * 200 - groupWidth / 2;
                            
                            return (
                              <g key={i}>
                                {/* Events bar */}
                                <rect
                                  x={x}
                                  y={250 - (d.totalEvents / maxCount) * 200}
                                  width={barWidth}
                                  height={(d.totalEvents / maxCount) * 200}
                                  fill="#8b5cf6"
                                />
                                <text
                                  x={x + barWidth / 2}
                                  y={245 - (d.totalEvents / maxCount) * 200}
                                  textAnchor="middle"
                                  fontSize="11"
                                  fill="#1f2937"
                                  fontWeight="600"
                                >
                                  {d.totalEvents}
                                </text>
                                
                                {/* Assignments bar */}
                                <rect
                                  x={x + barWidth + 20}
                                  y={250 - (d.totalAssignments / maxCount) * 200}
                                  width={barWidth}
                                  height={(d.totalAssignments / maxCount) * 200}
                                  fill="#f59e0b"
                                />
                                <text
                                  x={x + barWidth + 20 + barWidth / 2}
                                  y={245 - (d.totalAssignments / maxCount) * 200}
                                  textAnchor="middle"
                                  fontSize="11"
                                  fill="#1f2937"
                                  fontWeight="600"
                                >
                                  {d.totalAssignments}
                                </text>
                                
                                {/* Month label */}
                                <text
                                  x={120 + i * 200}
                                  y={280}
                                  textAnchor="middle"
                                  fontSize="12"
                                  fill="#374151"
                                >
                                  {d.month.split(' ')[0]}
                                </text>
                              </g>
                            );
                          })}
                          
                          {/* Chart title */}
                          <text x="400" y="25" textAnchor="middle" fontSize="16" fontWeight="600" fill="#1f2937">
                            Events vs Assignments by Month
                          </text>
                          
                          {/* Legend */}
                          <rect x="300" y="35" width="12" height="12" fill="#8b5cf6" />
                          <text x="318" y="45" fontSize="12" fill="#374151">Events</text>
                          <rect x="370" y="35" width="12" height="12" fill="#f59e0b" />
                          <text x="388" y="45" fontSize="12" fill="#374151">Assignments</text>
                        </svg>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="sched-modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowGraphs(false)}
              >
                Close
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  alert('Export graphs functionality would be implemented here');
                }}
              >
                Export Charts
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulingDashboard; 