// exports.getSummary = async (req, res) => {
//   try {
//     // temporary static data (replace later with DB queries)
//     const summary = {
//       totalSales: 328500,
//       stockValue: 210400,
//       outstandingPayment: 45800,
//       activeCustomers: 1245
//     };

//     res.json(summary);
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to load dashboard summary' });
//   }
// };