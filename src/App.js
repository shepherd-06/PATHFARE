import React, { Component, createRef } from "react";
import "./App.css";
import Input from "./components/input";

const steps = [
  {
    id: 1,
    label: "How much is your order worth?",
    type: "number",
    placeholder: "Cart Value",
  },
  {
    id: 2,
    label: "How far is the delivery destination?",
    type: "number",
    placeholder: "Delivery Distance",
  },
  {
    id: 3,
    label: "How many items are you ordering?",
    type: "number",
    placeholder: "Number of Items",
  },
  {
    id: 4,
    label: "When would you like your delivery to arrive?",
    type: "date",
  },
];

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentStep: 1,
      inputValues: {},
      total: null,
      showForm: true,
      currentDate: this.getNextHourDate(),
      errors: {},
      showModal: false,
    };
    this.stepRef = createRef();
  }

  getNextHourDate = () => {
    const now = new Date();
    now.setTime(now.getTime() + 60 * 60 * 1000);
    return now;
  };

  componentDidMount() {
    const nextHour = this.getNextHourDate();
    this.setState({
      currentDate: nextHour,
      inputValues: {
        4: `${nextHour.toISOString().split("T")[0]} ${nextHour
          .toTimeString()
          .slice(0, 5)}`,
      },
    });
    this.intervalId = setInterval(() => {
      this.setState({ currentDate: new Date() });
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  handleInputChange = (e) => {
    const { currentStep, inputValues, errors } = this.state;
    const value = e.target.value;
    const valid =
      currentStep !== 3 ? /^\d*\.?\d*$/.test(value) : /^\d+$/.test(value);

    if (valid) {
      this.setState({
        inputValues: { ...inputValues, [currentStep]: value },
        errors: { ...errors, [currentStep]: "" },
      });
    }
  };

  validateStep = () => {
    const { currentStep, inputValues, errors } = this.state;
    if (currentStep === 4) {
      const [dateStr, timeStr] = (inputValues[4] || "").split(" ");
      if (!dateStr || !timeStr) {
        this.setState({
          errors: { ...errors, 4: "Please select both date and time." },
        });
        return false;
      }
      const selected = new Date(`${dateStr}T${timeStr}`);
      if (isNaN(selected.getTime()) || selected < new Date()) {
        this.setState({
          errors: { ...errors, 4: "Delivery time cannot be in the past." },
        });
        return false;
      }
      return true;
    }
    if (!inputValues[currentStep] || inputValues[currentStep].trim() === "") {
      this.setState({
        errors: { ...errors, [currentStep]: "This field is required." },
      });
      return false;
    }
    return true;
  };

  handleNext = () => {
    if (!this.validateStep()) return;
    const { currentStep } = this.state;
    if (currentStep < steps.length) {
      this.setState({ currentStep: currentStep + 1 });
    } else {
      const calculatedTotal = this.calculateDeliveryFee();
      this.setState({ showForm: false }, () =>
        this.animateTotal(calculatedTotal)
      );
    }
  };

  handlePrevious = () => {
    const { currentStep } = this.state;
    if (currentStep > 1) {
      this.setState({ currentStep: currentStep - 1 });
    }
  };

  animateTotal = (finalTotal) => {
    let start = 0;
    const duration = 2000;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      this.setState({ total: Math.floor(progress * finalTotal) });
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  calculateDeliveryFee = () => {
    const cartValue = parseFloat(this.state.inputValues[1] || "0");
    const distance = parseInt(this.state.inputValues[2] || "0");
    const items = parseInt(this.state.inputValues[3] || "0");
    const [dateStr, timeStr] = (this.state.inputValues[4] || "").split(" ");
    const deliveryDate = new Date(`${dateStr}T${timeStr}`);

    if (cartValue >= 100) return 0;
    let total = cartValue < 10 ? 10 - cartValue : 0;
    total += 2;
    if (distance > 1000) total += Math.ceil((distance - 1000) / 500);
    if (items >= 5) total += (items - 4) * 0.5;
    if (items > 12) total += 1.2;
    if (
      deliveryDate.getUTCDay() === 5 &&
      deliveryDate.getUTCHours() >= 15 &&
      deliveryDate.getUTCHours() < 19
    ) {
      total *= 1.2;
    }
    return Math.min(15, parseFloat(total.toFixed(2)));
  };

  formatDate = (date) =>
    date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  render() {
    const {
      currentStep,
      inputValues,
      total,
      showModal,
      showForm,
      currentDate,
      errors,
    } = this.state;
    return (
      <div className="container py-5">
        <h1
          className="text-display mb-4 justify-content-center text-center"
          style={{ fontFamily: "Bona Nova SC" }}
        >
          PATHFARE
        </h1>
        <p className="mb-4 justify-content-center text-center text-small">
          Unlock seamless shipping with Pathfare. Optimize your routes and
          packaging for cost-effective and timely deliveries.
        </p>

        <div className="col-md-3 mx-auto"></div>
        <div className="col-md-6 mx-auto">
          {showForm ? (
            <div
              className="card p-4 justify-content-center text-center"
              style={{ border: "1px groove #1e91d6" }}
            >
              <div className="mb-3">
                <p className="text-h4 mb-4">
                  Step <span className="text-h1">{currentStep}</span> /{" "}
                  {steps.length}
                </p>
              </div>
              <div>
                <label className="form-label mb-3">
                  {steps[currentStep - 1].label}
                </label>
                {currentStep === 4 ? (
                  <>
                    <input
                      type="date"
                      className="form-control mb-2"
                      min={currentDate.toISOString().split("T")[0]}
                      defaultValue={currentDate.toISOString().split("T")[0]}
                      onChange={(e) =>
                        this.setState({
                          inputValues: {
                            ...inputValues,
                            4: `${e.target.value} ${
                              inputValues[4]?.split(" ")[1]
                            }`,
                          },
                          errors: { ...errors, 4: "" },
                        })
                      }
                    />
                    <input
                      type="time"
                      className="form-control"
                      min={currentDate.toTimeString().slice(0, 5)}
                      onChange={(e) =>
                        this.setState({
                          inputValues: {
                            ...inputValues,
                            4: `${inputValues[4]?.split(" ")[0]} ${
                              e.target.value
                            }`,
                          },
                          errors: { ...errors, 4: "" },
                        })
                      }
                    />
                  </>
                ) : (
                  <Input
                    type={steps[currentStep - 1].type}
                    placeholder={steps[currentStep - 1].placeholder}
                    className="form-control justify-content-center text-center"
                    onChange={this.handleInputChange}
                    value={inputValues[currentStep] || ""}
                  />
                )}
                {errors[currentStep] && (
                  <div
                    className="text-danger mt-1"
                    style={{
                      color: "#ED2A1D",
                    }}
                  >
                    {errors[currentStep]}
                  </div>
                )}
              </div>

              <div className="row mt-4">
                <div className="col-4">
                  {currentStep > 1 && (
                    <button
                      className="btn"
                      style={{
                        backgroundColor: "transparent",
                        color: "#003b36",
                        padding: "10px 70px",
                        border: "1px solid #1e91d6",
                      }}
                      onClick={this.handlePrevious}
                    >
                      Previous
                    </button>
                  )}
                </div>

                <div className="col-4"></div>

                <div className="col-4">
                  <button
                    className="btn"
                    style={{
                      backgroundColor: "#1e91d6",
                      color: "#eff8e2",
                      padding: "10px 70px",
                    }}
                    onClick={this.handleNext}
                  >
                    {currentStep === steps.length ? "Calculate" : "Next"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="card p-4 justify-content-center text-center"
              style={{ border: "1px groove #1e91d6" }}
            >
              <h3 className="text-h3">
                Your Total is{" "}
                <span
                  className="text-h1"
                  style={{
                    fontWeight: "bold",
                  }}
                >
                  €{total?.toFixed(2)}
                </span>
              </h3>
              <p>
                You have{" "}
                <span
                  style={{
                    color: "#9D44B5",
                    fontWeight: "bold",
                  }}
                >
                  {inputValues[3]}
                </span>{" "}
                items totaling{" "}
                <span
                  style={{
                    color: "#9D44B5",
                    fontWeight: "bold",
                  }}
                >
                  €{inputValues[1]}
                </span>
                .
              </p>
              <p>
                Delivery at{" "}
                <span
                  style={{
                    color: "#9D44B5",
                    fontWeight: "bold",
                  }}
                >
                  {" "}
                  {inputValues[4]?.split(" ")[1]}
                </span>{" "}
                on{" "}
                <span
                  style={{
                    color: "#9D44B5",
                    fontWeight: "bold",
                  }}
                >
                  {this.formatDate(new Date(inputValues[4]?.split(" ")[0]))}
                </span>
              </p>
              <p>
                Distance:{" "}
                <span
                  style={{
                    color: "#9D44B5",
                    fontWeight: "bold",
                  }}
                >
                  {inputValues[2]}
                </span>{" "}
                meters
              </p>
              <button
                className="btn mt-3"
                style={{
                  backgroundColor: "#1e91d6",
                  color: "#eff8e2",
                  padding: "10px 70px",
                }}
                onClick={() => window.location.reload()}
              >
                Start Again
              </button>
            </div>
          )}
        </div>

        <div className="col-md-3 mx-auto"> </div>

        {showModal && (
          <div className="modal d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    How We Calculate Your Delivery Fee
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => this.setState({ showModal: false })}
                  ></button>
                </div>
                <div className="modal-body">
                  <ul>
                    <li>If your cart is less than €10, we top it up to €10.</li>
                    <li>First 1 km costs €2. Then €1 per 500m more.</li>
                    <li>5+ items? €0.50 per extra item.</li>
                    <li>More than 12 items? Add €1.20.</li>
                    <li>€100+ orders get free delivery.</li>
                    <li>Friday 3–7 PM UTC? Fees x1.2.</li>
                    <li>Fees never go over €15.</li>
                  </ul>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => this.setState({ showModal: false })}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          className="btn btn-info position-fixed top-0 end-0 m-3"
          onClick={() => this.setState({ showModal: true })}
        >
          How is it calculated?
        </button>
        <footer className="text-center mt-5 text-muted text-small">
          Originally built with Gemini in Firebase Studio and finalized by
          ChatGPT (GPT-4o). <br /> This app was later refined and migrated to
          React by me—after approximately 3 hours of debugging and deployment to
          Firebase.
        </footer>
      </div>
    );
  }
}
