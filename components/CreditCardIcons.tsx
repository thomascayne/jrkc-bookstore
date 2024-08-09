// components/GetCardIcon.tsx
import React from "react";
import { PaymentIcon } from "react-svg-credit-card-payment-icons";

interface GetCardIconProps {
  cardType: string;
}

/**
 * type = "Alipay" | "Amex" | "Code" | "CodeFront" | "Diners" | "Discover" | "Elo" | "Generic" | "Hiper" | "Hipercard" | "Jcb" | "Maestro" | "Mastercard" | "Mir" | "Paypal" | "Unionpay" | "Visa"
 * @param cardType
 * @returns
 */

export default function GetCardIcon({ cardType }: GetCardIconProps) {
  const getCardIcon = (cardType: string) => {
    switch (cardType.toLowerCase()) {
      case "visa":
        return <PaymentIcon type="Visa" />;
      case "mastercard":
        return <PaymentIcon type="Mastercard" />;
      case "amex":
        return <PaymentIcon type="Amex" />;
      case "discover":
        return <PaymentIcon type="Discover" />;
      case "hipercard":
        return <PaymentIcon type="Hipercard" />;
      case "diners":
        return <PaymentIcon type="Diners" />;
      case "jcb":
        return <PaymentIcon type="Jcb" />;
      case "maestro":
        return <PaymentIcon type="Maestro" />;
      case "mir":
        return <PaymentIcon type="Mir" />;
      case "unionpay":
        return <PaymentIcon type="Unionpay" />;
      case "paypal":
        return <PaymentIcon type="Paypal" />;
      case "generic":
        return <PaymentIcon type="Generic" />;
      case "elo":
        return <PaymentIcon type="Elo" />;
      case "alipay":
        return <PaymentIcon type="Alipay" />;
      case "code":
        return <PaymentIcon type="Code" />;
      case "codefront":
        return <PaymentIcon type="CodeFront" />;
      case "hiper":
        return <PaymentIcon type="Hiper" />;
      default:
        return null;
    }
  };

  return <div>{getCardIcon(cardType)}</div>;
}
