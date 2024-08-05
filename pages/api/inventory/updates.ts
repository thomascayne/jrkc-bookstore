// pages/api/inventory/update.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../utils/supabase/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id, quantity, price } = req.body;
  const { data, error } = await supabase
    .from('inventory')
    .update({ quantity, price })
    .eq('id', id);
  if (error) {
    res.status(500).json({ error: error.message });
  } else {
    res.status(200).json(data);
  }
}
