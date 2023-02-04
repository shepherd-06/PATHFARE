import '../App.css';
import React from "react";
import { validation } from '../util/validation';
import { MainCalculation } from '../util/calculation';

class CalculatorView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            is_error: false,
            error_message: null,
            delivery_price: null,
            currentDate: new Date().toISOString().slice(0, -8) //yyyy-MM-ddThh:mm
        };
    }

    handleSubmit(event) {
        event.preventDefault();
        let total_price = event.target.total_price.value;
        let delivery_distance = event.target.delivery_distance.value;
        let total_items = event.target.total_items.value;
        let order_time = event.target.order_time.value;

        total_price = parseInt(total_price);
        delivery_distance = parseInt(delivery_distance);
        total_items = parseInt(total_items);

        if (validation(total_price) === false) {
            // validation error
            this.setState({
                is_error: true,
                error_message: "Cart price has to be a non-zero number.",
            });
            return;
        }

        if (!validation(delivery_distance)) {
            // validation error
            this.setState({
                is_error: true,
                error_message: "Delivery distance has to be a non-zero number",
            });
            return;
        }

        if (!validation(total_items)) {
            // validation error
            this.setState({
                is_error: true,
                error_message: "Number of items has to be a non-zero number",
            });
            return;
        }

        if ((total_items - Math.floor(total_items)) !== 0) {
            // validation error; safety
            this.setState({
                is_error: true,
                error_message: "Number of items cannot be a fraction",
            });
            return;
        }

        // date validator
        // converts ISO String to date obj
        order_time = new Date(order_time);
        if (!(order_time instanceof Date) && !isNaN(order_time)) {
            this.setState({
                is_error: true,
                error_message: "Order Time is invalid!",
            });
            return;
        }

        this.setState({
            delivery_price: MainCalculation(total_price, total_items,
                delivery_distance, order_time),
        });

        if (!this.state.is_error) {
            event.target.reset();
        }
    }

    render() {
        return (
            <div>
                <div className={'row error-control' + (this.state.is_error ? ' in' : '')}>
                    <p className='h4'>
                        Validation Error occurred!
                    </p>
                    <p>
                        <b>Message </b>: {this.state.error_message}
                    </p>
                </div>
                <form onSubmit={this.handleSubmit.bind(this)}>
                    <div className="form-group wolt_calc">
                        <label>Cart Value</label>
                        <input type="number" className="form-control"
                            placeholder="Enter the cart price here (Euro)"
                            name="total_price"
                            step="any"
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
                        <label className='label_time'>Order Time : </label>
                        <input type="datetime-local"
                            id="datetimepicker"
                            name="order_time"
                            value={this.state.currentDate}
                            onChange={(date) => {
                                console.log(date.target.value);
                                this.setState({
                                    currentDate: date.target.value,
                                });
                            }}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-success wolt_calc">
                        Calculate Delivery Price
                    </button>
                </form>

                <div className={'row success' + (this.state.delivery_price === null ? '' : ' in')}>
                    <p className='display-4'>
                        Delivery Price: {this.state.delivery_price}
                    </p>
                </div>

            </div>
        )
    }
}

export default CalculatorView;