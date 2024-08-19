import React from 'react';
import { UserProfile } from '@/interfaces/UserProfile'; // Import the existing UserProfile interface

interface CustomerDetailsProps {
    customer: UserProfile; // Use the existing UserProfile interface for customer
}

const CustomerDetails: React.FC<CustomerDetailsProps> = ({ customer }) => {
    return (
        <div>
            <h3>Customer Details</h3>
            <p>Name: {customer.first_name} {customer.last_name}</p>
            <p>Email: {customer.email || 'N/A'}</p>
            <p>Phone: {customer.phone || 'N/A'}</p>

            <h4>Address</h4>
            <p>{customer.street_address1}</p>
            <p>{customer.street_address2}</p>
            <p>{customer.city}, {customer.state} {customer.zipcode}</p>
            
            <h4>Shipping Address</h4>
            <p>{customer.shipping_first_name} {customer.shipping_last_name}</p>
            <p>{customer.shipping_street_address1}</p>
            <p>{customer.shipping_street_address2}</p>
            <p>{customer.shipping_city}, {customer.shipping_state} {customer.shipping_zipcode}</p>

            {/* Additional fields can be rendered as needed */}
        </div>
    );
};

export default CustomerDetails;
