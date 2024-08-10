// app\admin\inventory\page.tsx
// Inventory management page component

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Input,
  Button,
  Select,
  SelectItem,
} from '@nextui-org/react';
import BookDetails from '@/components/BookDetails';
import { useFullScreenModal } from '@/contexts/FullScreenModalContext';
import { IBookInventory } from '@/interfaces/IBookInventory';
import {
  addBookToInventory,
  fetchCategories,
  fetchInventory,
  updateBookPrice,
  updateInventoryQuantity,
} from '@/utils/newInventoryApi';
import { BookCategory } from '@/interfaces/BookCategory';

type NewBookForm = Pick<
  BookWithCategory,
  'id' | 'category_name' | 'categoryId' | 'title' | 'quantity' | 'retail_price'
>;

interface BookWithCategory extends IBookInventory {
  category_name: string;
}

type EditedItem = {
  quantity?: number;
  price?: number;
};

type EditedValues = {
  [id: string]: EditedItem | undefined;
};

const InventoryPage = () => {
  const [inventory, setInventory] = useState<BookWithCategory[]>([]);
  const [newBook, setNewBook] = useState<NewBookForm>({
    id: '',
    title: '',
    quantity: 0,
    retail_price: 0,
    categoryId: 0,
    category_name: '',
  });
  const [page, setPage] = useState(1);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { openModal } = useFullScreenModal();
  const [editedValues, setEditedValues] = useState<EditedValues>({});
  const [editedQuantities, setEditedQuantities] = useState<EditedValues>(
    {},
  );
  const [categories, setCategories] = useState<BookCategory[]>([]);

  const rowsPerPage = 10;

  // Fetch inventory data on component mount
  useEffect(() => {
    const loadInventory = async () => {
      const data = await fetchInventory();
      setInventory(data);
      const categoriesData = await fetchCategories();
      setCategories(categoriesData);
    };
    loadInventory();
  }, []);

  // Handle adding a new book to the inventory
  const handleAddBook = async () => {
    if (
      newBook &&
      newBook.id &&
      newBook.quantity &&
      newBook.retail_price &&
      newBook.title &&
      newBook.category_name
    ) {
      await addBookToInventory(
        newBook.id,
        newBook.quantity,
        newBook.retail_price,
        newBook.title,
        newBook.category_name,
      );
      const updatedInventory = await fetchInventory();
      setInventory(updatedInventory);
      setNewBook({} as BookWithCategory);
    }
  };

  // Handle updating the quantity of an existing book in the inventory

  const handleRowClick = async (book: IBookInventory, e: React.MouseEvent) => {
    e.preventDefault();
    openModal(
      <BookDetails bookId={book.id} />,
      `${book?.categoryId} - ${book.title}`,
    );
  };

  const handleUpdate = async (id: string) => {
    const editedItem = editedValues[id];
    if (editedItem) {
      try {
        let quantityUpdated = true;
        let priceUpdated = true;

        if (editedItem.quantity !== undefined) {
          quantityUpdated = await updateInventoryQuantity(
            id,
            editedItem.quantity,
          );
        }
        if (editedItem.price !== undefined) {
          priceUpdated = await updateBookPrice(id, editedItem.price);
        }

        if (quantityUpdated && priceUpdated) {
          setInventory((prevInventory) =>
            prevInventory.map((item) =>
              item.id === id
                ? {
                    ...item,
                    quantity: editedItem.quantity ?? item.quantity,
                    available_quantity:
                      editedItem.quantity ?? item.available_quantity,
                    price: editedItem.price ?? item.price,
                    list_price: editedItem.price ?? item.list_price,
                  }
                : item,
            ),
          );

          // Clear edited values for this item
          setEditedValues((prev) => {
            const { [id]: _, ...rest } = prev;
            return rest;
          });
        } else {
          console.error('Error updating item');
          // Handle error (e.g., show an error message to the user)
        }
      } catch (error) {
        console.error('Error updating item:', error);
        // Handle error (e.g., show an error message to the user)
      }
    }
  };

  const sortInventory = useCallback((items: BookWithCategory[]) => {
    return [...items].sort((a, b) => a.title.localeCompare(b.title));
  }, []);

  const pages = Math.ceil(inventory.length / rowsPerPage);
  const items = inventory.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleInputChange = (
    id: string,
    field: 'quantity' | 'price',
    value: number,
    currentValue: number,
  ) => {
    setEditedValues((prev) => {
      const newValues: EditedItem = {
        ...prev[id],
        [field]: value >= 0 ? value : undefined,
      };

      // If the new value is the same as the current value, remove it from editedValues
      if (value === currentValue) {
        delete newValues[field];
      }

      const updatedValues: EditedValues = {
        ...prev,
        [id]:
          Object.keys(newValues).length > 0 ? newValues : ({} as EditedItem),
      };

      // Remove the item entirely if it has no edits
      if (updatedValues[id] === undefined) {
        delete updatedValues[id];
      }

      return updatedValues;
    });
  };

  const isUpdateButtonDisabled = (item: BookWithCategory) => {
    const values = editedValues[item.id];
    if (!values) return true;

    const isQuantityUnchanged =
      values.quantity === undefined || values.quantity === item.quantity;
    const isPriceUnchanged =
      values.price === undefined || values.price === item.list_price;

    return isQuantityUnchanged && isPriceUnchanged;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Inventory Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Input
          type="text"
          placeholder="Book ID"
          value={newBook?.id}
          onChange={(e) =>
            setNewBook((prev) => ({ ...prev, id: e.target.value }))
          }
        />
        <Input
          type="text"
          placeholder="Book Title"
          value={newBook?.title}
          onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
        />
        <Input
          type="number"
          placeholder="Quantity"
          value={newBook?.quantity.toString()}
          onChange={(e) =>
            setNewBook({ ...newBook, quantity: +e.target.value })
          }
        />
        <Input
          type="number"
          placeholder="Price"
          value={newBook?.retail_price.toString()}
          onChange={(e) =>
            setNewBook({ ...newBook, retail_price: +e.target.value })
          }
        />
        <Select
          placeholder="Select category"
          value={newBook.category_name}
          onChange={(e) =>
            setNewBook({ ...newBook, category_name: e.target.value })
          }
        >
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id.toString()}>
              {category.label}
            </SelectItem>
          ))}
        </Select>
      </div>
      <div className="flex justify-start mb-4">
        <Button color="primary" onClick={handleAddBook}>
          Add Book
        </Button>
      </div>

      <Table aria-label="Inventory table">
        <TableHeader>
          <TableColumn>BOOK ID</TableColumn>
          <TableColumn>TITLE</TableColumn>
          <TableColumn>QUANTITY</TableColumn>
          <TableColumn>AVAILABLE</TableColumn>
          <TableColumn>PRICE</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow
              key={`${item.id}-${item.title}-${index}`}
              onClick={(e) => handleRowClick(item, e as React.MouseEvent)}
              className="cursor-pointer hover:bg-gray-200 transition-colors duration-250"
            >
              <TableCell className="max-w-28">{item.id}</TableCell>
              <TableCell className="max-w-80 min-w-48 whitespace-pre-wrap">
                {item.title}
              </TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>{item.available_quantity}</TableCell>
              <TableCell>
                ${item.list_price && item.list_price.toFixed(2)}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Update Quantity"
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                    pattern="[0-9]*"
                    onChange={(e) =>
                      handleInputChange(
                        item.id,
                        'quantity',
                        Number(e.target.value),
                        item.quantity,
                      )
                    }
                    value={editedValues[item.id]?.quantity?.toString() || ''}
                  />
                  <Input
                    type="number"
                    placeholder="Update Price"
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      handleInputChange(
                        item.id,
                        'price',
                        Number(e.target.value),
                        item.list_price,
                      )
                    }
                    value={editedValues[item.id]?.price?.toString() || ''}
                  />
                  <Button
                    size="sm"
                    disabled={isUpdateButtonDisabled(item)}
                    color="primary"
                    className={`${
                      isUpdateButtonDisabled(item)
                        ? 'cursor-not-allowed bg-slate-400'
                        : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdate(item.id);
                    }}
                  >
                    Update
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-center mt-4">
        <Pagination total={pages} page={page} onChange={setPage} />
      </div>
    </div>
  );
};

export default InventoryPage;

function fetchBookById(book_id: string) {
  throw new Error('Function not implemented.');
}
