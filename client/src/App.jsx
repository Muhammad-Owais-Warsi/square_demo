import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const SQUARE_APP_ID = import.meta.env.VITE_APPLICATION_ID;
const SQUARE_LOCATION_ID = import.meta.env.VITE_LOCATION_ID;

const SquarePayment = () => {
  const cardRef = useRef(null);
  const [card, setCard] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    const initSquare = async () => {
      if (!window.Square) {
        setStatusMessage('Square SDK failed to load.');
        return;
      }

      try {
        const payments = window.Square.payments(SQUARE_APP_ID, SQUARE_LOCATION_ID);
        const card = await payments.card();
        await card.attach(cardRef.current);
        setCard(card);
      } catch (err) {
        console.error('Square initialization error:', err);
        setStatusMessage('Failed to initialize payment.');
      }
    };

    initSquare();
  }, []);

  const handlePayment = async () => {
    if (!card || !amount || !currency) {
      setStatusMessage('❌ Please fill out amount and currency.');
      return;
    }

    try {
      const result = await card.tokenize();

      if (result.status === 'OK') {
        const token = result.token;
        console.log('🔑 Token:', token);

        const response = await axios.post('/confirm', {
          sourceId: token,
          amount: amount, 
          currency: currency,
        });

        console.log('✅ Backend response:', response.data);
        setStatusMessage('✅ Payment token sent to server!');
      } else {
        let errorMessage = `❌ Tokenization failed: ${result.status}`;
        if (result.errors) {
          errorMessage += ` | Errors: ${JSON.stringify(result.errors)}`;
        }
        setStatusMessage(errorMessage);
      }
    } catch (err) {
      console.error('Error sending to backend:', err);
      setStatusMessage('❌ Payment failed to send to backend.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h2>Square Payment</h2>

      <div style={{ marginBottom: '16px' }}>
        <label>Amount (in USD): </label>
        <input
          type="number"
          placeholder="e.g. 20.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label>Currency: </label>
        <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
          <option value="USD">USD</option>
          <option value="INR">INR</option>
          <option value="EUR">EUR</option>
        </select>
      </div>

      <div id="card-container" ref={cardRef} style={{ marginBottom: '20px' }}></div>

      <button onClick={handlePayment}>Pay</button>

      <div style={{ marginTop: '20px', color: '#555' }}>{statusMessage}</div>
    </div>
  );
};

export default SquarePayment;
