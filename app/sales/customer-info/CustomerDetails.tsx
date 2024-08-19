// app/sales/customer-info/CustomerDetails.tsx

import React from 'react';
import { UserProfile } from '@/interfaces/UserProfile'; // Import the UserProfile interface

interface CustomerDetailsProps {
    customer: UserProfile;
}

const CustomerDetails = ({ customer }: CustomerDetailsProps) => {
    return (
        <div>
            <h2>Customer Details</h2>
            <p><strong>Customer ID:</strong> {customer.id}</p>
            <p><strong>First Name:</strong> {customer.first_name}</p>
            <p><strong>Last Name:</strong> {customer.last_name}</p>
            <p><strong>Email:</strong> {customer.email}</p>
            <p><strong>Phone:</strong> {customer.phone}</p>
            <p><strong>City:</strong> {customer.city}</p>
            <p><strong>Country:</strong> {customer.country}</p>
        </div>
    );
};

export default CustomerDetails;
