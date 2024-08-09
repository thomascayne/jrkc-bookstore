// components/AddPaymentMethodForm.tsx
import React, { useState } from 'react';
import { generateRandomTestCardFromStripe } from '@/utils/getRandomTestCardsFromStripe';
import { userStore } from '@/stores/userStore';

interface AddPaymentMethodFormProps {
  onAddSuccess: () => void;
}

export function AddPaymentMethodForm({ onAddSuccess }: AddPaymentMethodFormProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvc, setCvc] = useState('');

  const handleMockCardClick = () => {
    const testCard = generateRandomTestCardFromStripe();
    setCardNumber(testCard.number);
    setCvc(testCard.cvc);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate expiration date 
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    if (Number(expYear) < currentYear || (Number(expYear) === currentYear && Number(expMonth) <= currentMonth)) {
      alert('Expiration date must be in the future');
      return;
    }

    // Add payment method logic
    const success = await userStore.addPaymentMethod({
      name_on_card: nameOnCard,
      card_exp_month: Number(expMonth),
      card_exp_year: Number(expYear),
        
    });

    if (success) {
      onAddSuccess();
    }
  };

  return (
    <form className='replace-this-with-form-from-add-credit-card-form-container' onSubmit={handleSubmit}>
      <input
        type="text"
        value={cardNumber}
        onChange={(e) => setCardNumber(e.target.value)}
        placeholder="Card Number"
        required
      />
      <input
        type="text"
        value={nameOnCard}
        onChange={(e) => setNameOnCard(e.target.value)}
        placeholder="Name on Card"
        required
      />
      <input
        type="text"
        value={expMonth}
        onChange={(e) => setExpMonth(e.target.value)}
        placeholder="Exp Month (MM)"
        required
      />
      <input
        type="text"
        value={expYear}
        onChange={(e) => setExpYear(e.target.value)}
        placeholder="Exp Year (YYYY)"
        required
      />
      <input
        type="text"
        value={cvc}
        onChange={(e) => setCvc(e.target.value)}
        placeholder="CVC"
        required
      />
      <button type="button" onClick={handleMockCardClick}>Use Mock Card</button>
      <button type="submit">Add Payment Method</button>
    </form>
  );
}