import '../App.css';
import React from "react";

class CalculatorView extends React.Component {

    componentDidMount() {
        let currentDate = new Date().toISOString().slice(0, -8); //yyyy-MM-ddThh:mm
        document.querySelector("#datetimepicker").value = currentDate;
    }

    handleSubmit(event) {
        event.preventDefault();
        const total_price = event.target.total_price.value;
        const delivery_distance = event.target.delivery_distance.value;
        const total_items = event.target.total_items.value;
        const delivery_time = event.target.delivery_time.value;
        console.log(total_price);
        console.log(delivery_distance);
        console.log(total_items);
        console.log(delivery_time);
        // TODO -> uncomment the next line
        // event.target.reset(); 
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit.bind(this)}>
                <div className="form-group wolt_calc">
                    <label>Cart Value</label>
                    <input type="number" className="form-control"
                        placeholder="Enter the cart price here (Euro)"
                        name="total_price"
                        required />
                </div>
                <div className="form-group wolt_calc">
                    <label>Delivery Distance</label>
                    <input type="number" className="form-control"
                        placeholder="delivery distance (m)"
                        name="delivery_distance"
                        required />
                </div>

                <div className="form-group wolt_calc">
                    <label>Amount of Items</label>
                    <input type="number" className="form-control"
                        placeholder="number of items in the cart"
                        name="total_items"
                        required />
                </div>
                <div className="form-group wolt_calc">
                    <label className='label_time'>Time : </label>
                    <input type="datetime-local"
                        id="datetimepicker"
                        name="delivery_time"
                        required
                    />
                </div>
                <button type="submit" class="btn btn-success wolt_calc">
                    Calculate Delivery Price
                </button>
            </form>
        )
    }
}

export default CalculatorView;