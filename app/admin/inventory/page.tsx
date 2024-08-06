import React, { useEffect, useState } from 'react';
import { fetchInventory, addBookToInventory, updateInventoryQuantity, updateBookPrice } from '../../../utils/supabase/inventoryApi';
import { InventoryItem } from '../../../interfaces/InventoryItem';

// Inventory management page component
const InventoryPage = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [newBook, setNewBook] = useState({ book_id: '', quantity: 0, price: 0 });

  // Fetch inventory data on component mount
  useEffect(() => {
    const loadInventory = async () => {
      const data = await fetchInventory();
      setInventory(data);
    };
    loadInventory();
  }, []);

  // Handle adding a new book to the inventory
  const handleAddBook = async () => {
    const { book_id, quantity, price } = newBook;
    await addBookToInventory(book_id, quantity, price);
    const updatedInventory = await fetchInventory();
    setInventory(updatedInventory);
  };

  // Handle updating the quantity of an existing book in the inventory
  const handleUpdateQuantity = async (id: string, quantity: number) => {
    await updateInventoryQuantity(id, quantity);
    const updatedInventory = await fetchInventory();
    setInventory(updatedInventory);
  };

  // Handle updating the price of an existing book in the inventory
  const handleUpdatePrice = async (id: string, price: number) => {
    await updateBookPrice(id, price);
    const updatedInventory = await fetchInventory();
    setInventory(updatedInventory);
  };

  return (
    <div>
      <h1>Inventory Management</h1>
      <div>
        <input 
          type="text" 
          placeholder="Book ID" 
          value={newBook.book_id} 
          onChange={(e) => setNewBook({ ...newBook, book_id: e.target.value })} 
        />
        <input 
          type="number" 
          placeholder="Quantity" 
          value={newBook.quantity} 
          onChange={(e) => setNewBook({ ...newBook, quantity: +e.target.value })} 
        />
        <input 
          type="number" 
          placeholder="Price" 
          value={newBook.price} 
          onChange={(e) => setNewBook({ ...newBook, price: +e.target.value })} 
        />
        <button onClick={handleAddBook}>Add Book</button>
      </div>
      <ul>
        {inventory.map((item) => (
          <li key={item.id}>
            <p>Book ID: {item.book_id}</p>
            <p>Quantity: {item.quantity}</p>
            <p>Available Quantity: {item.available_quantity}</p>
            <p>Price: {item.price}</p>
            <input 
              type="number" 
              placeholder="Update Quantity" 
              onChange={(e) => handleUpdateQuantity(item.id, +e.target.value)} 
            />
            <input 
              type="number" 
              placeholder="Update Price" 
              onChange={(e) => handleUpdatePrice(item.id, +e.target.value)} 
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InventoryPage;
