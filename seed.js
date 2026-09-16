const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Employee = require('./models/Employee');
const Department = require('./models/Department');
const Product = require('./models/Product');
const Supplier = require('./models/Supplier');
const Customer = require('./models/Customer');
const Purchase = require('./models/Purchase');
const Sale = require('./models/Sale');
const Invoice = require('./models/Invoice');
const Attendance = require('./models/Attendance');
const Leave = require('./models/Leave');
const Expense = require('./models/Expense');
const Payroll = require('./models/Payroll');
const AuditLog = require('./models/AuditLog');
const Notification = require('./models/Notification');

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing database collections...');
    await User.deleteMany();
    await Employee.deleteMany();
    await Department.deleteMany();
    await Product.deleteMany();
    await Supplier.deleteMany();
    await Customer.deleteMany();
    await Purchase.deleteMany();
    await Sale.deleteMany();
    await Invoice.deleteMany();
    await Attendance.deleteMany();
    await Leave.deleteMany();
    await Expense.deleteMany();
    await Payroll.deleteMany();
    await AuditLog.deleteMany();
    await Notification.deleteMany();

    console.log('Seeding Users & Roles...');
    // Seed Admin User
    const adminUser = await User.create({
      name: 'Happy',
      email: 'hv0563163@gmail.com',
      password: 'Happy@2003',
      role: 'admin',
      status: 'active',
      phone: '+91 9876543210'
    });

    const managerUser = await User.create({
      name: 'Sarah Jenkins',
      email: 'manager@secureerp.com',
      password: 'Manager@12345',
      role: 'manager',
      status: 'active',
      phone: '+91 9876543211'
    });

    const hrUser = await User.create({
      name: 'Robert Vance',
      email: 'hr@secureerp.com',
      password: 'Hr@123456789',
      role: 'hr',
      status: 'active',
      phone: '+91 9876543212'
    });

    const accountantUser = await User.create({
      name: 'Michael Scott',
      email: 'accountant@secureerp.com',
      password: 'Accountant@123',
      role: 'accountant',
      status: 'active',
      phone: '+91 9876543213'
    });

    const employeeUser = await User.create({
      name: 'Jim Halpert',
      email: 'employee@secureerp.com',
      password: 'Employee@123',
      role: 'employee',
      status: 'active',
      phone: '+91 9876543214'
    });

    console.log('Seeding Departments...');
    const deptSales = await Department.create({ name: 'Sales & Marketing', description: 'Handles client sales & outreach', status: 'active' });
    const deptEng = await Department.create({ name: 'Engineering & IT', description: 'Product development and tech stack', status: 'active' });
    const deptHR = await Department.create({ name: 'Human Resources', description: 'Talent recruitment and workforce management', status: 'active' });
    const deptFin = await Department.create({ name: 'Finance & Accounting', description: 'Financial bookkeeping and payroll', status: 'active' });

    console.log('Seeding Employees...');
    const emp1 = await Employee.create({
      user: managerUser._id,
      employeeId: 'EMP-1001',
      name: 'Sarah Jenkins',
      email: 'manager@secureerp.com',
      phone: '+91 9876543211',
      department: deptSales._id,
      designation: 'Sales Operations Manager',
      salary: 85000,
      status: 'active'
    });

    const emp2 = await Employee.create({
      user: hrUser._id,
      employeeId: 'EMP-1002',
      name: 'Robert Vance',
      email: 'hr@secureerp.com',
      phone: '+91 9876543212',
      department: deptHR._id,
      designation: 'HR Lead Specialist',
      salary: 75000,
      status: 'active'
    });

    const emp3 = await Employee.create({
      user: accountantUser._id,
      employeeId: 'EMP-1003',
      name: 'Michael Scott',
      email: 'accountant@secureerp.com',
      phone: '+91 9876543213',
      department: deptFin._id,
      designation: 'Senior Accountant',
      salary: 80000,
      status: 'active'
    });

    const emp4 = await Employee.create({
      user: employeeUser._id,
      employeeId: 'EMP-1004',
      name: 'Jim Halpert',
      email: 'employee@secureerp.com',
      phone: '+91 9876543214',
      department: deptEng._id,
      designation: 'Software Engineer',
      salary: 65000,
      status: 'active'
    });

    // Update department manager references
    deptSales.manager = emp1._id;
    await deptSales.save();
    deptHR.manager = emp2._id;
    await deptHR.save();
    deptFin.manager = emp3._id;
    await deptFin.save();

    console.log('Seeding Suppliers...');
    const sup1 = await Supplier.create({
      supplierName: 'Alex Mercer',
      companyName: 'TechNova Logistics & Hardware',
      email: 'contact@technova.com',
      phone: '+91 9123456780',
      address: '101 Industrial Tech Park, Bengaluru, India',
      gstNumber: '29ABCDE1234F1Z5',
      status: 'active'
    });

    const sup2 = await Supplier.create({
      supplierName: 'David Miller',
      companyName: 'Global Paper & Supplies Ltd',
      email: 'sales@globalpaper.com',
      phone: '+91 9123456781',
      address: '42 Commercial Plaza, Mumbai, India',
      gstNumber: '27FGHIJ5678K1Z2',
      status: 'active'
    });

    console.log('Seeding Customers...');
    const cust1 = await Customer.create({
      customerName: 'Acme Corporation',
      email: 'procurement@acme.com',
      phone: '+91 9988776655',
      address: '7th Floor, Cyber Towers',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      gstNumber: '36KLMNO9012P1Z8',
      status: 'active'
    });

    const cust2 = await Customer.create({
      customerName: 'Starlight Enterprises',
      email: 'billing@starlight.io',
      phone: '+91 9988776644',
      address: 'Unit 402, Trade Center',
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      gstNumber: '27PQRST3456U1Z9',
      status: 'active'
    });

    console.log('Seeding Products...');
    const prod1 = await Product.create({
      productName: 'Enterprise Laptop Pro 15"',
      SKU: 'PROD-LAP-01',
      category: 'Electronics',
      description: 'High performance core i7 laptop with 32GB RAM',
      purchasePrice: 65000,
      sellingPrice: 85000,
      quantity: 25,
      minimumStock: 5,
      supplier: sup1._id,
      status: 'active'
    });

    const prod2 = await Product.create({
      productName: 'Ergonomic Mesh Executive Chair',
      SKU: 'PROD-FUR-02',
      category: 'Furniture',
      description: 'Lumbar support office desk chair',
      purchasePrice: 8000,
      sellingPrice: 13500,
      quantity: 40,
      minimumStock: 8,
      supplier: sup2._id,
      status: 'active'
    });

    const prod3 = await Product.create({
      productName: 'UltraWide 34" Monitor 4K',
      SKU: 'PROD-MON-03',
      category: 'Electronics',
      description: 'IPS Curved display with USB-C hub',
      purchasePrice: 32000,
      sellingPrice: 44000,
      quantity: 4, // Low stock intentionally!
      minimumStock: 6,
      supplier: sup1._id,
      status: 'active'
    });

    console.log('Seeding Sales & Invoices...');
    const sale1 = await Sale.create({
      invoiceNumber: 'INV-2026-001',
      customer: cust1._id,
      items: [
        { product: prod1._id, quantity: 2, sellingPrice: 85000, total: 170000 },
        { product: prod2._id, quantity: 4, sellingPrice: 13500, total: 54000 }
      ],
      subTotal: 224000,
      tax: 40320, // 18% tax
      discount: 4320,
      totalAmount: 260000,
      paymentStatus: 'paid',
      paymentMethod: 'bank_transfer',
      status: 'completed',
      createdBy: managerUser._id
    });

    await Invoice.create({
      invoiceNumber: 'INV-2026-001',
      sale: sale1._id,
      customer: cust1._id,
      items: [
        { productName: prod1.productName, quantity: 2, price: 85000, total: 170000 },
        { productName: prod2.productName, quantity: 4, price: 13500, total: 54000 }
      ],
      subTotal: 224000,
      tax: 40320,
      discount: 4320,
      totalAmount: 260000,
      paymentStatus: 'paid'
    });

    console.log('Seeding Purchases...');
    await Purchase.create({
      purchaseNumber: 'PO-2026-001',
      supplier: sup1._id,
      items: [
        { product: prod1._id, quantity: 10, purchasePrice: 65000, total: 650000 }
      ],
      subTotal: 650000,
      tax: 117000,
      discount: 0,
      totalAmount: 767000,
      status: 'completed',
      createdBy: adminUser._id
    });

    console.log('Seeding Expenses...');
    await Expense.create({
      title: 'Cloud Infrastructure AWS Hosting',
      category: 'Utilities',
      amount: 45000,
      date: new Date(),
      description: 'Monthly server hosting and backup services',
      createdBy: adminUser._id
    });

    await Expense.create({
      title: 'Office Stationary & Printing Paper',
      category: 'Office Supplies',
      amount: 12500,
      date: new Date(),
      description: 'Paper reams and toner cartridges',
      createdBy: accountantUser._id
    });

    console.log('Seeding Leaves & Attendance...');
    await Leave.create({
      employee: emp4._id,
      leaveType: 'Casual Leave',
      startDate: new Date(Date.now() + 86400000 * 2),
      endDate: new Date(Date.now() + 86400000 * 4),
      reason: 'Personal family event',
      status: 'pending'
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await Attendance.create({ employee: emp1._id, date: today, status: 'Present', checkIn: '09:05 AM', checkOut: '06:15 PM' });
    await Attendance.create({ employee: emp2._id, date: today, status: 'Present', checkIn: '08:55 AM', checkOut: '06:00 PM' });
    await Attendance.create({ employee: emp3._id, date: today, status: 'Present', checkIn: '09:15 AM', checkOut: '06:30 PM' });
    await Attendance.create({ employee: emp4._id, date: today, status: 'Present', checkIn: '09:00 AM', checkOut: '06:00 PM' });

    console.log('Seeding Audit Logs & Notifications...');
    await AuditLog.create({
      user: adminUser._id,
      userEmail: adminUser.email,
      userRole: adminUser.role,
      action: 'SYSTEM_INITIALIZE',
      module: 'SYSTEM',
      description: 'Database seeded with default initial records and admin account.'
    });

    await Notification.create({
      recipientRole: 'admin',
      title: 'Welcome to SecureERP',
      message: 'System database successfully initialized. Please review default passwords.',
      type: 'info'
    });

    await Notification.create({
      recipientRole: 'manager',
      title: 'Low Stock Alert',
      message: `Product '${prod3.productName}' is low in stock (4 units remaining).`,
      type: 'warning',
      link: '/products'
    });

    console.log('\n======================================================');
    console.log(' DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log(' DEFAULT LOGIN CREDENTIALS FOR TESTING:');
    console.log('------------------------------------------------------');
    console.log(' ADMIN     : hv0563163@gmail.com   / Happy@2003');
    console.log(' MANAGER   : manager@secureerp.com    / Manager@12345');
    console.log(' HR        : hr@secureerp.com         / Hr@123456789');
    console.log(' ACCOUNTANT: accountant@secureerp.com / Accountant@123');
    console.log(' EMPLOYEE  : employee@secureerp.com   / Employee@123');
    console.log('======================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('Seeding Error:', err);
    process.exit(1);
  }
};

seedData();
