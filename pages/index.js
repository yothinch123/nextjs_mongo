// pages/index.js
import { useEffect, useState } from 'react';
import { parseCookies } from 'nookies';

export default function Home() {
  const [data, setData] = useState([]);

  useEffect(() => {  
    const fetchData = async () => {
    const { token } = parseCookies(); // Retrieve JWT token from cookies
    const res = await fetch(`/api/products?name=`,{
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`, // Send token in the Authorization header
      },
    });

    if (res.ok) {
      const fetchedData = await res.json();
      setData(fetchedData);
    } else {
      console.error('Failed to fetch data');
    }
  };

  fetchData();
}, []);

  return (
    <div>
      <h1>Data</h1>
      <ul>
        {data.map((item) => (
          <li key={item._id}>{item.name} / ราคา {item.price} / {item.size} </li>
        ))}
      </ul>
    </div>
  );
}
