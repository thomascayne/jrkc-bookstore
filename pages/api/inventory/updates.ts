// pages/api/inventory/update.ts
// API endpoint for updating inventory items in the database

import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../utils/supabase/client';

// Handler function for the API endpoint
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Extract id, quantity, and price from the request body
  const { id, quantity, price } = req.body;

  // Update the specified inventory item in the 'inventory' table
  const { data, error } = await supabase
    .from('inventory')
    .update({ quantity, price }) // Update the quantity and price fields
    .eq('id', id); // Match the record by id

  // Handle any errors that occur during the update
  if (error) {
    // Respond with a 500 status code and the error message
    res.status(500).json({ error: error.message });
  } else {
    // Respond with a 200 status code and the updated data
    res.status(200).json(data);
  }
}
