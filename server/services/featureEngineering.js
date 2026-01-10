export function buildFeatures(transactions){
    return transactions.map((t) => ({
        transaction_id: t.id,
        amount: Number(t.amount),
        frequency: 1, // aise hi hai
        avg_amount: Number(t.amount), // aise hi hai
    }));
} // aise hi hai just a concept