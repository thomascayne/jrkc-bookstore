// pages/api/inventory/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../utils/supabase/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { data, error } = await supabase.from('inventory').select('*');
  if (error) {
    res.status(500).json({ error: error.message });
  } else {
    res.status(200).json(data);
  }
}
