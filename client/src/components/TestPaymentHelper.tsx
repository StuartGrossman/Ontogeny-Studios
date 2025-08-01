import React, { useState } from 'react';
import { CreditCard, Info, Copy, CheckCircle } from 'lucide-react';
import './TestPaymentHelper.css';

const TestPaymentHelper: React.FC = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const testCards = [
    {
      number: '4242 4242 4242 4242',
      description: 'Successful payment',
      type: 'Visa'
    },
    {
      number: '4000 0000 0000 0002',
      description: 'Payment declined',
      type: 'Visa'
    },
    {
      number: '4000 0025 0000 3155',
      description: 'Requires authentication',
      type: 'Visa'
    },
    {
      number: '5555 5555 5555 4444',
      description: 'Successful payment',
      type: 'Mastercard'
    },
    {
      number: '2223 0031 2200 3222',
      description: 'Successful payment',
      type: 'Mastercard'
    }
  ];

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="test-payment-helper">
      <div className="helper-header">
        <Info size={20} />
        <h3>Test Payment Cards</h3>
        <p>Use these test card numbers to test the payment flow</p>
      </div>

      <div className="test-cards">
        {testCards.map((card, index) => (
          <div key={index} className="test-card">
            <div className="card-info">
              <CreditCard size={16} />
              <span className="card-type">{card.type}</span>
            </div>
            <div className="card-number">
              {card.number}
              <button 
                className="copy-btn"
                onClick={() => copyToClipboard(card.number, `card-${index}`)}
              >
                {copied === `card-${index}` ? <CheckCircle size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <div className="card-description">{card.description}</div>
          </div>
        ))}
      </div>

      <div className="test-instructions">
        <h4>How to Test:</h4>
        <ol>
          <li>Click on any payment button in the app</li>
          <li>You'll be redirected to Stripe Checkout</li>
          <li>Use one of the test card numbers above</li>
          <li>For the expiry date, use any future date (e.g., 12/25)</li>
          <li>For CVC, use any 3 digits (e.g., 123)</li>
          <li>For postal code, use any valid format (e.g., 12345)</li>
        </ol>
      </div>

      <div className="test-notes">
        <h4>Important Notes:</h4>
        <ul>
          <li>These are test cards that only work in test mode</li>
          <li>No real charges will be made</li>
          <li>Use <strong>4242 4242 4242 4242</strong> for successful payments</li>
          <li>Use <strong>4000 0000 0000 0002</strong> to test declined payments</li>
          <li>Use <strong>4000 0025 0000 3155</strong> to test 3D Secure authentication</li>
        </ul>
      </div>
    </div>
  );
};

export default TestPaymentHelper; 