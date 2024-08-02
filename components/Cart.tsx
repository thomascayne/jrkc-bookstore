// components/Cart.tsx
import React from "react";
import { useCart } from "../contexts/CartContext";

const Cart: React.FC = () => {
  const { cartItems, updateItemQuantity, removeItem, totalPrice } = useCart();

  return (
    <div className="cart">
      <h2>Shopping Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <ul>
            {cartItems.map((item) => (
              <li key={item.id}>
                <span>{item.title}</span>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItemQuantity(item.id, parseInt(e.target.value))
                  }
                />
                <span>{item.retail_price * item.quantity}</span>
                <button onClick={() => removeItem(item.id)}>Remove</button>
              </li>
            ))}
          </ul>
          <p>Total: {totalPrice}</p>
        </>
      )}
      <button>Checkout</button>
      <input type="text" placeholder="Promo Code" />
    </div>
  );
};

export default Cart;
