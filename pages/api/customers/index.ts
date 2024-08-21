// Directory: /pages/api/customers/index.ts
// API endpoint for fetching customer data from the database

import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../utils/supabase/client';

// Handler function for the API endpoint
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Fetch all records from the 'customers' table
  const { data, error } = await supabase.from('customers').select('*');

  // Handle any errors that occur during the fetch
  if (error) {
    // Respond with a 500 status code and the error message
    return res.status(500).json({ error: error.message });
  }

  // Respond with a 200 status code and the fetched data
  return res.status(200).json(data);
}
