function buildFeatures(transactions) {
    const vendorStats = {};

    transactions.forEach(t => {
        if (!vendorStats[t.vendor_id]) {
            vendorStats[t.vendor_id] = {
                count: 0,
                total: 0
            };
        }
        vendorStats[t.vendor_id].count += 1;
        vendorStats[t.vendor_id].total += Number(t.amount);
    });

    return transactions.map(t => {
        const stats = vendorStats[t.vendor_id];
        return {
            transaction_id: t.id,
            amount: Number(t.amount),
            frequency: stats.count,
            avg_amount: stats.total / stats.count,
            estimated_cost: t.estimated_cost ? Number(t.estimated_cost) : null,
            num_bidders: t.num_bidders ? Number(t.num_bidders) : null
        };
    });
}

module.exports = { buildFeatures };