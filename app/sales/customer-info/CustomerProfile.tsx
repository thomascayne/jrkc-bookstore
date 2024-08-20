// Directory: /components/crm/CustomerInfo.tsx

interface CustomerInfoProps {
  name: string;
  email: string;
  phone: string;
  address: string;
}

const CustomerInfo: React.FC<CustomerInfoProps> = ({ name, email, phone, address }) => {
  return (
    <div>
      <h3>{name}</h3>
      <p>Email: {email}</p>
      <p>Phone: {phone}</p>
      <p>Address: {address}</p>
    </div>
  );
};

export default CustomerInfo;
