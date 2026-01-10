export function genearteReasons(t){
    const reasons = [];

    if (t.amount > t.avg_amount * 2){
        reasons.push("Amount significantly higher than vendor average");
    }

    if (t.freaquency > 5){
        reasons.push("High transaction frequency in short time");
    }

    if (reasons.length == 0){
        reasons.push("Unsual pattern detected by the model");
    }

    return reasons;
}