import './App.css';
import CalculatorView from './component/calculator';

function App() {
  return (
    <div className="container">
      <div className='row'>

        <div className='col-lg-2'>

        </div>

        <div className='col-lg-8'>
          <br />
          <p className='display-1' align="center">
            Wolt Delivery Calculator
          </p>
          <hr />
          <CalculatorView />

        </div>

        <div className='col-lg-2'> </div>
      </div>
    </div>
  );
}

export default App;
