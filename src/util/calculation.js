export const MainCalculation = (total_price, total_items,
    delivery_distance, order_time) => {
    /**
     * This function handle the main calculations and will delivery the delivery costs
     */
    if (total_price >= 100.0) {
        console.log("delivery price is 0 because total price is 100");
        return 0;
    }
    // price surcharge
    let surcharge = 0;
    let delivery_charge = 2;

    if (total_price < 10.0) {
        surcharge = 10.0 - total_price;
        console.log("cart price " + total_price)
        console.log("surcharge added because of price difference " + surcharge);
    }

    if (total_items > 4) {
        // 50 cent for higher than 4 items.
        surcharge += (total_items - 4) * 0.50;
        console.log("surcharge added because more than 4 items " + surcharge);
        if (total_items > 12) {
            // bulk fee
            surcharge += 1.20;
            console.log("bulk fee added because of more than 12 items");
        }
    }

    if (delivery_distance > 1000) {
        delivery_distance -= 1000;
        delivery_charge += (Math.ceil(delivery_distance / 500) * 1);
        console.log("distance > 1000 m " + (Math.ceil(delivery_distance / 500) * 1));
    }

    console.log("delivery charge ", delivery_charge, " surcharge ", surcharge);
    delivery_charge += surcharge

    if (order_time.getDay() === 5) {
        if (15 <= order_time.getUTCHours() <= 19) {
            delivery_charge = delivery_charge * 1.2;
            console.log("Friday Rush! Extra charge added ", delivery_charge);
        }
    }

    if (delivery_charge > 15) {
        console.log("delivery charge is more than 15. It cannot be!!!! " + delivery_charge);
        delivery_charge = 15;
    }
    return delivery_charge.toFixed(2);

}