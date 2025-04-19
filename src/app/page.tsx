'use client';

import React, { Component, createRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const steps = [
  { id: 1, label: 'Price in Euro', type: 'number', suffix: '€' },
  { id: 2, label: 'Distance in Meter', type: 'number', suffix: 'm' },
  { id: 3, label: 'Number of Items', type: 'number', suffix: 'items' },
  { id: 4, label: 'Delivery Time and Date', type: 'date', type2: 'time' },
];

interface State {
  currentStep: number;
  inputValues: { [key: number]: string };
  total: number | null;
  showConfetti: boolean;
  transitionDirection: string;
  showForm: boolean;
  currentDate: Date;
  errors: { [key: number]: string };
  showModal: boolean;
}

export default class Home extends Component<{}, State> {
  stepRef: React.RefObject<HTMLDivElement>;
  intervalId: NodeJS.Timeout | null = null;

  constructor(props: {}) {
    super(props);
    this.state = {
      currentStep: 1,
      inputValues: {},
      total: null,
      showConfetti: false,
      transitionDirection: 'slide-in-right',
      showForm: true,
      currentDate: new Date(),
      errors: {},
      showModal: false,
    };
    this.stepRef = createRef();
  }

  getNextHourDate = () => {
    const now = new Date();
    now.setTime(now.getTime() + 60 * 60 * 1000); // add 60 minutes
    return now;
  };


  componentDidMount() {
    const nextHour = this.getNextHourDate();
    this.setState({
      currentDate: nextHour,
      inputValues: {
        4: `${nextHour.toISOString().split('T')[0]} ${nextHour.toTimeString().slice(0, 5)}`
      }
    });

    this.intervalId = setInterval(() => {
      this.setState({ currentDate: new Date() });
    }, 1000);
  }


  componentDidUpdate(_prevProps: {}, prevState: State) {
    if (this.state.transitionDirection !== '' && prevState.transitionDirection !== this.state.transitionDirection) {
      setTimeout(() => {
        this.setState({ transitionDirection: '' });
      }, 1000);
    }
  }

  componentWillUnmount() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { currentStep, inputValues, errors } = this.state;
    const value = e.target.value;

    let valid = false;
    if (currentStep !== 3) {
      valid = /^\d*\.?\d*$/.test(value);
    } else {
      valid = /^\d+$/.test(value);
    }

    if (valid) {
      this.setState({
        inputValues: { ...inputValues, [currentStep]: value },
        errors: { ...errors, [currentStep]: '' },
      });
    }
  };

  validateStep = () => {
    const { currentStep, inputValues, errors } = this.state;

    if (currentStep === 4) {
      const value = inputValues[4];
      const [dateStr, timeStr] = value?.split(' ') || [];

      if (!dateStr || !timeStr) {
        this.setState({ errors: { ...errors, [4]: 'Please select both date and time.' } });
        return false;
      }

      const selected = new Date(`${dateStr}T${timeStr}`);
      const now = new Date();

      if (isNaN(selected.getTime()) || selected < now) {
        this.setState({ errors: { ...errors, [4]: 'Delivery time cannot be in the past.' } });
        return false;
      }

      return true;
    }

    const currentValue = inputValues[currentStep];
    if (!currentValue || currentValue.trim() === '') {
      this.setState({ errors: { ...errors, [currentStep]: 'This field is required.' } });
      return false;
    }

    return true;
  };


  handleNext = () => {
    if (!this.validateStep()) return;

    const { currentStep, inputValues } = this.state;
    if (currentStep < steps.length) {
      this.setState({
        transitionDirection: 'slide-in-right',
        currentStep: currentStep + 1,
      });
    } else {
      let calculatedTotal = this.calculateDeliveryFee();
      this.setState({ showConfetti: true, showForm: false }, () => {
        this.animateTotal(calculatedTotal);
      });
    }
  };

  handlePrevious = () => {
    const { currentStep } = this.state;
    if (currentStep > 1) {
      this.setState({
        transitionDirection: 'slide-out-left',
        currentStep: currentStep - 1,
      });
    }
  };

  animateTotal = (finalTotal: number) => {
    let start = 0;
    const duration = 2000;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      this.setState({ total: Math.floor(progress * finalTotal) });
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  };

  formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  resetToNextHour = () => {
    const nextHour = this.getNextHourDate();
    this.setState({
      currentStep: 1,
      inputValues: {
        4: `${nextHour.toISOString().split('T')[0]} ${nextHour.toTimeString().slice(0, 5)}`
      },
      total: null,
      showConfetti: false,
      transitionDirection: 'slide-in-right',
      showForm: true,
      errors: {},
      currentDate: nextHour,
    });
  };

  calculateDeliveryFee = (): number => {
    const cartValue = parseFloat(this.state.inputValues[1] || '0');
    const distance = parseInt(this.state.inputValues[2] || '0');
    const items = parseInt(this.state.inputValues[3] || '0');
    const [dateStr, timeStr] = (this.state.inputValues[4] || '').split(' ');
    const deliveryDate = new Date(`${dateStr}T${timeStr}`);

    let total = 0;

    // Rule 1: Small order surcharge if cart value < 10€
    if (cartValue < 10) {
      total += 10 - cartValue;
    }

    // Rule 2: Distance fee
    total += 2; // base fee for first 1000m
    if (distance > 1000) {
      const extraDistance = distance - 1000;
      total += Math.ceil(extraDistance / 500); // 1€ per additional 500m
    }

    // Rule 3: Item-based surcharge
    if (items >= 5) {
      total += (items - 4) * 0.5; // 0.5€ per item from 5th onward
    }
    if (items > 12) {
      total += 1.2; // bulk fee
    }

    // Rule 4: Free delivery if cart value >= 100€
    if (cartValue >= 100) {
      return 0;
    }

    // Rule 5: Friday rush (3–7 PM UTC)
    const isFriday = deliveryDate.getUTCDay() === 5;
    const hourUTC = deliveryDate.getUTCHours();
    const isRushHour = hourUTC >= 15 && hourUTC < 19;
    if (isFriday && isRushHour) {
      total *= 1.2;
    }

    // Rule 6: Cap max delivery fee at 15€
    return Math.min(15, parseFloat(total.toFixed(2)));
  };


  render() {
    const { currentStep, inputValues, total, showModal, transitionDirection, showForm, currentDate, errors } = this.state;

    return (
      <div className="container mx-auto p-4 max-w-3xl text-center">
        <h1 className="text-h1 font-bold mb-4 text-primary" style={{ fontFamily: 'Bona Nova SC' }}>PATHFARE</h1>
        <h5 className="text-body opacity-70">
          Unlock seamless shipping with Pathfare. Optimize your routes and packaging for cost-effective and timely deliveries.
        </h5>

        {showForm && (
          <div className="mt-12 border border-border rounded-xl pt-5 pb-5">
            <div className="mb-4 text-text">
              {currentStep < steps.length ? (
                <span className="text-small">Step <span className="text-h2">{currentStep}</span> / {steps.length}</span>
              ) : (
                <span className="text-h4">Total</span>
              )}
            </div>

            <div ref={this.stepRef} className={cn("transition-transform duration-500", transitionDirection)}>
              {currentStep <= steps.length && (
                <div key={currentStep} className="mb-6 p-4">
                  <div className="mb-2 text-text">
                    <h4 className="text-h4">{steps[currentStep - 1].label}</h4>
                  </div>
                  {currentStep === 4 ? (
                    <div className="text-center">
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Select Date</label>
                        <input
                          type="date"
                          min={this.state.currentDate.toISOString().split('T')[0]}
                          defaultValue={this.state.currentDate.toISOString().split('T')[0]}
                          onChange={(e) =>
                            this.setState({
                              inputValues: {
                                ...inputValues,
                                [4]: `${e.target.value} ${inputValues[4]?.split(' ')[1] || this.formatTime(currentDate)}`
                              },
                              errors: { ...errors, [4]: '' }
                            })
                          }
                          className="rounded-md p-2 border mt-1 text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Select Time</label>
                        <input
                          type="time"
                          min={this.state.currentDate.toTimeString().slice(0, 5)}
                          onChange={(e) =>
                            this.setState({
                              inputValues: {
                                ...inputValues,
                                [4]: `${inputValues[4]?.split(' ')[0] || this.state.currentDate.toISOString().split('T')[0]} ${e.target.value}`
                              },
                              errors: { ...errors, [4]: '' }
                            })
                          }
                          className="rounded-md p-2 border mt-1 text-center"
                        />
                      </div>
                      {errors[4] && <p className="text-red-600 text-sm mt-2">{errors[4]}</p>}
                    </div>
                  ) : (
                    <div>
                      <Input
                        type={steps[currentStep - 1].type}
                        placeholder={steps[currentStep - 1].label}
                        onChange={this.handleInputChange}
                        value={inputValues[currentStep] || ''}
                        className="rounded-full bg-secondary/50 text-center mx-auto w-64"
                        required
                      />
                      {errors[currentStep] && <p className="text-red-600 text-sm mt-1">{errors[currentStep]}</p>}
                    </div>
                  )}

                  <div className="flex justify-center gap-8 mt-8">
                    {currentStep > 1 && (
                      <button
                        onClick={this.handlePrevious}
                        className="px-6 py-3 rounded-lg border border-blue-500 text-blue-900 hover:bg-blue-50 shadow-md"
                      >
                        Previous
                      </button>
                    )}
                    {currentStep <= steps.length && (
                      <button
                        onClick={this.handleNext}
                        className="px-6 py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 shadow-md"
                      >
                        {currentStep === steps.length ? 'Calculate' : 'Next >>'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>


          </div>
        )}

        {!showForm && total !== null && (
          <div className="mt-12 text-center">
            <div className="text-3xl font-semibold text-text mb-6">
              Your Total is <span className="text-primary text-5xl font-bold">€{total.toFixed(2)}</span>
            </div>
            <p className="text-lg text-text mb-2">
              You have <span className="text-primary font-medium">{inputValues[3]}</span> items in your cart,
              totaling <span className="text-primary font-medium">€{inputValues[1]}</span>.
            </p>
            <p className="text-lg text-text mb-2">
              It will be delivered at <span className="text-primary font-medium">{inputValues[4]?.split(' ')[1]}</span>
              {" "} on  <span className="text-primary font-medium">{this.formatDate(new Date(inputValues[4]?.split(' ')[0]))}</span>.
            </p>
            <p className="text-lg text-text mb-6">
              Delivery distance is <span className="text-primary font-medium">{inputValues[2]}</span> meters.
            </p>

            <button
              className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white text-xl rounded-xl shadow-md"
              onClick={this.resetToNextHour}
            >
              START AGAIN
            </button>
          </div>
        )}

        <div className="relative min-h-screen flex flex-col justify-between">
          <button
            onClick={() => this.setState({ showModal: true })}
            className="fixed top-4 right-4 bg-blue-100 text-blue-800 px-3 py-1 rounded-full shadow hover:bg-blue-200"
          >
            How will the delivery cost be calculated?
          </button>

          {showModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
              <div className="bg-white rounded-xl p-6 max-w-xl text-left shadow-lg">
                <h2 className="text-lg font-bold mb-4">How We Calculate Your Delivery Fee</h2>
                <ul className="text-sm space-y-2 list-disc pl-5">
                  <li>If your cart total is less than €10, we add just enough to bring it up to €10.</li>
                  <li>The first 1 km of delivery costs €2. After that, it’s €1 for every extra 500 meters.</li>
                  <li>Ordering 5 or more items? Each extra item adds €0.50.</li>
                  <li>If you order more than 12 items, we apply an extra bulk handling fee of €1.20.</li>
                  <li>Spend €100 or more, and your delivery is completely free!</li>
                  <li>On Fridays from 3 PM to 7 PM (UTC), delivery fees increase slightly due to high demand.</li>
                  <li>Don’t worry — your delivery fee will never exceed €15.</li>
                </ul>

                <div className="text-right mt-4">
                  <button onClick={() => this.setState({ showModal: false })} className="px-4 py-2 bg-blue-500 text-white rounded">
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          <footer className="text-center text-xs text-gray-500 mt-8 pb-4">
            This app is 99% made with Gemini in Firebase Studio and finalized by ChatGPT (GPT-4o).
          </footer>

        </div>

      </div>
    );
  }
}