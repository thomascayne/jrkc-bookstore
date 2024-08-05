import React, { useEffect, useState } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { GetServerSidePropsContext } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { InventoryItem } from '../../../interfaces/inventoryItem';

const InventoryPage: React.FC = () => {
  const session = useSession();
  const supabaseClient = useSupabaseClient();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  useEffect(() => {
    if (session) {
      fetchInventory();
    }
  }, [session]);

  const fetchInventory = async () => {
    const { data, error } = await supabaseClient.from('inventory').select('*');
    if (error) console.error('Error fetching inventory:', error);
    else setInventory(data);
  };

  const updateQuantity = async (id: number, quantity: number) => {
    const { error } = await supabaseClient
      .from('inventory')
      .update({ quantity })
      .eq('id', id);
    if (error) console.error('Error updating quantity:', error);
    else
      setInventory(
        inventory.map((item) =>
          item.id === id ? { ...item, quantity } : item,
        ),
      );
  };

  const adjustPrice = async (id: number) => {
    const price = parseFloat(prompt('Enter new price:') || '0');
    const { error } = await supabaseClient
      .from('inventory')
      .update({ price })
      .eq('id', id);
    if (error) console.error('Error updating price:', error);
    else
      setInventory(
        inventory.map((item) => (item.id === id ? { ...item, price } : item)),
      );
  };

  if (!session) {
    return <div>You must be logged in to view this page.</div>;
  }

  if (!session.user?.app_metadata?.isAdmin) {
    return <div>You do not have permission to view this page.</div>;
  }

  return (
    <div>
      <h1>Inventory Management</h1>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Quantity</th>
            <th>Available Quantity</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((item) => (
            <tr key={item.id}>
              <td>{item.title}</td>
              <td>{item.quantity}</td>
              <td>{item.available_quantity}</td>
              <td>{item.price}</td>
              <td>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  +
                </button>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  -
                </button>
                <button onClick={() => adjustPrice(item.id)}>
                  Adjust Price
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabaseClient = createServerSupabaseClient(context);
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  if (!session.user?.app_metadata?.isAdmin) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      initialSession: session,
    },
  };
}

export default InventoryPage;
