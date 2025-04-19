'use client';

import React, {useState, useRef, useEffect} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {cn} from '@/lib/utils';
import {Confetti} from '@/components/ui/confetti';

const steps = [
  {id: 1, label: 'Price in Euro', type: 'number', suffix: '€'},
  {id: 2, label: 'Distance in Meter', type: 'number', suffix: 'm'},
  {id: 3, label: 'Number of Items', type: 'number', suffix: 'items'},
  {id: 4, label: 'Delivery Time and Date', type: 'date', type2: 'time'},
];

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [inputValues, setInputValues] = useState({});
  const [total, setTotal] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState('slide-in-right');
  const [showForm, setShowForm] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const stepRef = useRef(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (currentStep !== 3) {
      // For price and distance, allow only positive numbers
      if (/^\d*\.?\d*$/.test(value)) {
        setInputValues({...inputValues, [currentStep]: value});
      }
    } else {
      // For number of items, allow only positive integers
      if (/^\d+$/.test(value)) {
        setInputValues({...inputValues, [currentStep]: value});
      }
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setTransitionDirection('slide-in-right');
      setCurrentStep(prevStep => prevStep + 1);
    } else {
      // Simulate total calculation with animation
      let calculatedTotal = 0;
      Object.values(inputValues).forEach(value => {
        calculatedTotal += parseFloat(value as string || '0');
      });
      setShowConfetti(true);
      animateTotal(calculatedTotal);
      setShowForm(false); // Hide the form
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setTransitionDirection('slide-out-left');
      setCurrentStep(prevStep => prevStep - 1);
    }
  };

  const animateTotal = (finalTotal: number) => {
    let start = 0;
    const duration = 2000; // Animation duration in milliseconds
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setTotal(Math.floor(progress * finalTotal));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  };

  useEffect(() => {
    if (transitionDirection) {
      const timer = setTimeout(() => {
        setTransitionDirection('');
      }, 500); // Match the animation duration
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000); // Update every second

    return () => clearInterval(intervalId); // Clean up on unmount
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl text-center">
      <h1 className="text-h1 font-bold mb-4 text-primary">Pathfare</h1>
      <h3 className="text-h3 opacity-70">
        Unlock seamless shipping with Pathfare. Optimize your routes and packaging for cost-effective and timely
        deliveries.
      </h3>

      {showForm && (
        <div className="mt-12">
          <div className="mb-4 text-text">
            {currentStep < steps.length ? (
              <text className="text-h4">
                Step {currentStep}/{steps.length}
              </text>
            ) : (
              <text className="text-h4">Final Step</text>
            )}
          </div>

          <div
            ref={stepRef}
            className={cn("transition-transform duration-500", transitionDirection)}
          >
            {currentStep <= steps.length && (
              <div key={currentStep} className="mb-6 p-4 border border-border rounded-xl">
                <div className="mb-2 text-text">
                  <h4 className="text-h4">{steps[currentStep - 1].label}</h4>
                </div>
                {currentStep !== 4 ? (
                  <Input
                    type={steps[currentStep - 1].type}
                    placeholder={steps[currentStep - 1].label}
                    onChange={handleInputChange}
                    value={inputValues[currentStep] || ''}
                    className="rounded-full bg-secondary/50 text-center mx-auto w-64"
                  />
                ) : (
                  <div className="text-center">
                    <h4 className="text-h4">{formatDate(currentDate)}</h4>
                    <h4 className="text-h4">{formatTime(currentDate)}</h4>
                  </div>
                )}
              </div>
            )}
          </div>

          {currentStep > 1 && (
            <Button variant="outline" onClick={handlePrevious} className="mr-2">
              Previous
            </Button>
          )}
          {currentStep <= steps.length ? (
            <Button onClick={handleNext}>
              {currentStep === steps.length ? 'Calculate Total' : 'Next'}
              &gt;&gt;
            </Button>
          ) : null}
        </div>
      )}

      {!showForm && total !== null && (
        <div className="mt-12">
          <Confetti
            active={showConfetti}
            config={{
              angle: 90,
              spread: 45,
              startVelocity: 45,
              elementCount: 180,
              dragFriction: 0.1,
              duration: 3000,
              stagger: 0,
            }}
          />
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
