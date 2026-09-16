const Sale = require('../models/Sale');
const Purchase = require('../models/Purchase');
const Product = require('../models/Product');
const Employee = require('../models/Employee');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');
const Expense = require('../models/Expense');
const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');

// @desc    Get Dashboard Summary Metrics & Charts Data
// @route   GET /api/reports/dashboard
// @access  Private
exports.getDashboardData = async (req, res, next) => {
  try {
    const totalEmployees = await Employee.countDocuments({ status: 'active' });
    const totalProducts = await Product.countDocuments({ status: 'active' });
    const totalCustomers = await Customer.countDocuments({ status: 'active' });
    const totalSuppliers = await Supplier.countDocuments({ status: 'active' });
    const totalSalesCount = await Sale.countDocuments({ status: 'completed' });
    const totalPurchasesCount = await Purchase.countDocuments({ status: 'completed' });
    const pendingLeavesCount = await Leave.countDocuments({ status: 'pending' });

    // Aggregate Sales Revenue
    const salesAggregate = await Sale.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = salesAggregate.length > 0 ? salesAggregate[0].totalRevenue : 0;

    // Aggregate Purchases Expenses
    const purchasesAggregate = await Purchase.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, totalPurchasesCost: { $sum: '$totalAmount' } } }
    ]);
    const totalPurchasesCost = purchasesAggregate.length > 0 ? purchasesAggregate[0].totalPurchasesCost : 0;

    // Aggregate General Expenses
    const expenseAggregate = await Expense.aggregate([
      { $group: { _id: null, totalExpense: { $sum: '$amount' } } }
    ]);
    const totalGeneralExpense = expenseAggregate.length > 0 ? expenseAggregate[0].totalExpense : 0;
    const totalExpenses = totalPurchasesCost + totalGeneralExpense;

    // Low stock products query
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$quantity', '$minimumStock'] }
    }).select('productName SKU quantity minimumStock category').limit(5);

    // Pending Leave Requests
    const recentLeaveRequests = await Leave.find({ status: 'pending' })
      .populate('employee', 'name designation department')
      .limit(5);

    // Recent Sales
    const recentSales = await Sale.find()
      .populate('customer', 'customerName')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent Purchases
    const recentPurchases = await Purchase.find()
      .populate('supplier', 'companyName')
      .sort({ createdAt: -1 })
      .limit(5);

    // Monthly Sales & Revenue aggregate for charts (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlySalesChart = await Sale.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          sales: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedChartData = monthlySalesChart.map((item) => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      sales: item.sales,
      revenue: item.revenue
    }));

    res.status(200).json({
      success: true,
      data: {
        cards: {
          totalEmployees,
          totalProducts,
          totalCustomers,
          totalSuppliers,
          totalSalesCount,
          totalPurchasesCount,
          totalRevenue,
          totalExpenses,
          lowStockCount: lowStockProducts.length,
          pendingLeavesCount
        },
        lowStockProducts,
        recentLeaveRequests,
        recentSales,
        recentPurchases,
        chartData: formattedChartData
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Detailed Module Reports
// @route   GET /api/reports/detailed
// @access  Private (Admin, Manager, Accountant)
exports.getDetailedReports = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const salesList = await Sale.find({ ...dateFilter, status: 'completed' })
      .populate('customer', 'customerName')
      .sort({ createdAt: -1 });

    const purchasesList = await Purchase.find({ ...dateFilter, status: 'completed' })
      .populate('supplier', 'companyName')
      .sort({ createdAt: -1 });

    const expensesList = await Expense.find(dateFilter).sort({ date: -1 });

    const totalSalesRev = salesList.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalPurchasesCost = purchasesList.reduce((sum, p) => sum + p.totalAmount, 0);
    const totalExpensesCost = expensesList.reduce((sum, e) => sum + e.amount, 0);

    const netProfit = totalSalesRev - (totalPurchasesCost + totalExpensesCost);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalSalesRev,
          totalPurchasesCost,
          totalExpensesCost,
          netProfit
        },
        salesList,
        purchasesList,
        expensesList
      }
    });
  } catch (err) {
    next(err);
  }
};
