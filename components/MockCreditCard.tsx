import { IStripTestCardNumber } from '@/interfaces/IStripTestCardNumber';
import { stripeTestCards } from '@/utils/stripe-test-cards';
import { useState } from 'react';

interface MockCreditCardProps {
  onCardAdded: (card: any) => void;
}

const MockCreditCard = ({ onCardAdded }: MockCreditCardProps) => {
  const [selectedCard, setSelectedCard] = useState<IStripTestCardNumber>();
  const [name, setName] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvc, setCvc] = useState('');
  const [error, setError] = useState("");

  const handleSelectCard = () => {
    const randomCard = stripeTestCards[Math.floor(Math.random() * stripeTestCards.length)] as IStripTestCardNumber;
    setSelectedCard(randomCard);
  };

  const handleAddCard = () => {
    if (!selectedCard) {
      setError('Please select a card');
      return;
    }

    if (!name || !expMonth || !expYear || !cvc) {
      setError('Please fill in all fields');
      return;
    }

    const card = {
      ...selectedCard,
      name,
      expMonth,
      expYear,
      cvc,
    };

    onCardAdded(card);
  };

  return (
    <div>
      <button onClick={handleSelectCard}>Mock Credit Card</button>
      {selectedCard && (
        <form>
          <label>
            Name:
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            Expiration Month:
            <input type="text" value={expMonth} onChange={(e) => setExpMonth(e.target.value)} />
          </label>
          <label>
            Expiration Year:
            <input type="text" value={expYear} onChange={(e) => setExpYear(e.target.value)} />
          </label>
          <label>
            CVC:
            <input type="text" value={cvc} onChange={(e) => setCvc(e.target.value)} />
          </label>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button onClick={handleAddCard}>Add Card</button>
        </form>
      )}
    </div>
  );
};

export default MockCreditCard;