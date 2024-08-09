// components/RandomCreditCardGenerator.tsx
import React, { useState } from 'react';
import { IStripTestCardNumber } from '@/interfaces/IStripTestCardNumber';
import { Card, Button, Input } from '@nextui-org/react';
import CreditCardIcons from '@/components/CreditCardIcons';
import { generateRandomTestCardFromStripe } from '@/utils/getRandomTestCardsFromStripe';

export const RandomCreditCardGenerator: React.FC = () => {
  const [cardDetails, setCardDetails] = useState<IStripTestCardNumber | null>(null);

  const generateNewCard = () => {
    setCardDetails(generateRandomTestCardFromStripe());
  };

  const copyToClipboard = () => {
    if (cardDetails) {
      const cardInfo = `${cardDetails.number},${cardDetails.expMonth},${cardDetails.expYear},${cardDetails.cvc}`;
      navigator.clipboard.writeText(cardInfo).then(() => {
        alert('Card details copied to clipboard!');
      });
    }
  };

  const formatCardNumber = (number: string) => {
    return number.replace(/(\d{4})/g, '$1 ').trim();
  };

  return (
    <div className="random-credit-card-generator flex flex-col md:max-w-[400px]">
      <h3 className="text-lg font-bold mb-2 mr-2">
        <span className="mr-4">Random Credit Card</span>
        <a href="#" onClick={generateNewCard} className="hover:underline text-green-500 hover:text-green-900 font-normal text-sm">
          Generate New
        </a>
      </h3>
      <Card className="mb-2 p-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-full h-14">
            <Input
              placeholder="Card Number"
              radius="none"
              readOnly
              size="lg"
              endContent={
                <div className="pointer-events-none flex-shrink-0">
                  {cardDetails && <CreditCardIcons cardType={cardDetails.brand} />}
                </div>
              }
              type="text"
              value={cardDetails ? formatCardNumber(cardDetails.number) : ''}
              variant="bordered"
              style={{ height: "100%" }}
            />
          </div>
          <div className="flex flex-grow w-full mb-4">
            <Input
              className="mr-2"
              label="Month"
              value={cardDetails ? cardDetails.expMonth.toString() : ''}
              readOnly
              radius="none"
            />
            <Input
              label="Year"
              value={cardDetails ? cardDetails.expYear.toString() : ''}
              readOnly
              radius="none"
            />
          </div>
          <div className="flex justify-end w-full gap-4">
            <Button
              onClick={copyToClipboard}
              color="primary"
              radius="none"
              isDisabled={!cardDetails}
            >
              Copy to Clipboard
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};