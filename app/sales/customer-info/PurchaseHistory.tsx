// app/sales/customer-info/PurchaseHistory.tsx

import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/client';

interface PurchaseHistoryProps {
    customerId: string;
}

interface Purchase {
    id: string;
    product_name: string;
    purchase_date: string;
}

const PurchaseHistory = ({ customerId }: PurchaseHistoryProps) => {
    const [purchases, setPurchases] = useState<Purchase[]>([]);

    useEffect(() => {
        const fetchPurchaseHistory = async () => {
            const { data, error } = await supabase
                .from('purchases')
                .select('*')
                .eq('customer_id', customerId);

            if (error) {
                console.error('Error fetching purchase history:', error);
            } else {
                setPurchases(data || []);
            }
        };

        fetchPurchaseHistory();
    }, [customerId]);

    if (purchases.length === 0) {
        return <p>No purchase history found for this customer</p>;
    }

    return (
        <div>
            <h2>Purchase History</h2>
            <table>
                <thead>
                    <tr>
                        <th>Product Name</th>
                        <th>Purchase Date</th>
                    </tr>
                </thead>
                <tbody>
                    {purchases.map((purchase) => (
                        <tr key={purchase.id}>
                            <td>{purchase.product_name}</td>
                            <td>{new Date(purchase.purchase_date).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PurchaseHistory;
