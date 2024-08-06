// Interface representing an inventory item
export interface InventoryItem {
  id: string; // Unique identifier for the inventory item
  book_id: string; // ID of the book
  quantity: number; // Total quantity of the book in inventory
  available_quantity: number; // Available quantity of the book for sale
  price: number; // Price of the book
}
