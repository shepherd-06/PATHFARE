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
    };
    this.stepRef = createRef();
  }

  componentDidMount() {
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
    const { currentStep, inputValues } = this.state;
    const value = e.target.value;

    if (currentStep !== 3) {
      if (/^\d*\.?\d*$/.test(value)) {
        this.setState({ inputValues: { ...inputValues, [currentStep]: value } });
      }
    } else {
      if (/^\d+$/.test(value)) {
        this.setState({ inputValues: { ...inputValues, [currentStep]: value } });
      }
    }
  };

  handleNext = () => {
    const { currentStep, inputValues } = this.state;
    if (currentStep < steps.length) {
      this.setState({
        transitionDirection: 'slide-in-right',
        currentStep: currentStep + 1,
      });
    } else {
      let calculatedTotal = 0;
      Object.values(inputValues).forEach(value => {
        calculatedTotal += parseFloat(value || '0');
      });
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

  render() {
    const { currentStep, inputValues, total, showConfetti, transitionDirection, showForm, currentDate } = this.state;

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
                          defaultValue={this.state.currentDate.toISOString().split('T')[0]} // 'YYYY-MM-DD'
                          onChange={(e) =>
                            this.setState({
                              inputValues: {
                                ...inputValues,
                                [4]: `${e.target.value} ${inputValues[4]?.split(' ')[1] || this.formatTime(currentDate)}`
                              }
                            })
                          }
                          className="rounded-md p-2 border mt-1 text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Select Time</label>
                        <input
                          type="time"
                          defaultValue={this.state.currentDate.toTimeString().slice(0, 5)} // 'HH:MM'
                          onChange={(e) =>
                            this.setState({
                              inputValues: {
                                ...inputValues,
                                [4]: `${inputValues[4]?.split(' ')[0] || this.state.currentDate.toISOString().split('T')[0]} ${e.target.value}`
                              }
                            })
                          }
                          className="rounded-md p-2 border mt-1 text-center"
                        />
                      </div>
                    </div>
                  ) : (
                    <Input
                      type={steps[currentStep - 1].type}
                      placeholder={steps[currentStep - 1].label}
                      onChange={this.handleInputChange}
                      value={inputValues[currentStep] || ''}
                      className="rounded-full bg-secondary/50 text-center mx-auto w-64"
                      required
                    />
                  )}


                  <div className="flex justify-center gap-8 mt-4">
                    {currentStep > 1 && (
                      <Button onClick={this.handlePrevious} style={{
                        borderRadius: "10px",
                        color: "#003B36",
                        border: "1px dashed #1E91D6",
                        paddingLeft: "10px",
                        paddingRight: "10px"
                      }}>
                        Previous
                      </Button>
                    )}
                    {currentStep <= steps.length && (
                      <Button onClick={this.handleNext} style={{
                        background: "#1E91D6",
                        borderRadius: "10px",
                        color: "#ECE5F0",
                        paddingLeft: "10px",
                        paddingRight: "10px"
                      }}>
                        {currentStep === steps.length ? 'Calculate Total' : 'Next >>'}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {!showForm && total !== null && (
          <div className="mt-12">
            <div className="text-4xl font-bold mt-6 text-primary">Total: €{total.toFixed(2)}</div>
            {Object.entries(inputValues).map(([step, value]) => (
              <div key={step} className="mt-2">
                Step {step}: {value}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}
