import '../App.css';
import React from "react";

class CalculatorView extends React.Component {

    render() {
        return (
            <form>
                <div className="form-group wolt_calc">
                    <label>Cart Value</label>
                    <input type="number" className="form-control"
                        placeholder="Enter the cart price here (Euro)"
                        required />
                </div>
                <div className="form-group wolt_calc">
                    <label>Delivery Distance</label>
                    <input type="number" className="form-control"
                        placeholder="delivery distance (m)"
                        required />
                </div>

                <div className="form-group wolt_calc">
                    <label>Amount of Items</label>
                    <input type="number" className="form-control"
                        placeholder="number of items in the cart"
                        required />
                </div>
                <div className="form-group wolt_calc">
                    <label className='label_time'>Time : </label>
                    <input type="datetime-local"
                        id="datetimepicker" required />
                </div>
                <button type="submit" class="btn btn-success wolt_calc">
                    Calculate Delivery Price
                </button>
            </form>
        )
    }
}

export default CalculatorView;