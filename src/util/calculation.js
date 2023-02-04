export const MainCalculation = (total_price, total_items,
    delivery_distance, order_time) => {
    /**
     * This function handle the main calculations and will delivery the delivery costs
     */
    if (total_price >= 100) {
        return 0;
    }
    // price surcharge
    let surcharge = 0;
    let delivery_charge = 2;

    if (total_price < 10.0) {
        surcharge = 10.0 - total_price;
    }

    if (total_items > 4) {
        // 50 cent for higher than 4 items.
        surcharge += (total_items - 4) * 0.50;
        if (total_items > 12) {
            // bulk fee
            surcharge += 1.20;
        }
    }

    if (delivery_distance > 1000) {
        delivery_distance -= 1000;
        delivery_charge += (Math.ceil(delivery_distance / 500) * 1);
    }

    console.log("delivery charge ", delivery_charge, " surcharge ", surcharge);
    delivery_charge += surcharge

    if (order_time.getDay() === 5) {
        console.log(order_time.getDay());
        if (15 <= order_time.getUTCHours() <= 19) {
            delivery_charge = delivery_charge * 1.2;
            console.log("Friday Rush! ", delivery_charge);
        }
    }

    if (delivery_charge > 15) {
        delivery_charge = 15;
    }
    return delivery_charge;

}