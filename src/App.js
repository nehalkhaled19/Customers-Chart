import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import './App.css';

// Register components in Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const App = () => {
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dataUrl = 'https://raw.githubusercontent.com/nehalkhaled19/Customers-Transactions-Data/main/db.json';
        const response = await axios.get(dataUrl);
        setCustomers(response.data.customers);
        setTransactions(response.data.transactions);
        setFilteredTransactions(response.data.transactions);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error);
      }
    };
    fetchData();
  }, []);

  const handleCustomerChange = (event) => {
    const customerId = parseInt(event.target.value);
    setSelectedCustomer(customerId);
    setFilteredTransactions(transactions.filter(t => t.customer_id === customerId));
  };

  const handleAmountFilter = (event) => {
    const amount = parseFloat(event.target.value);
    setFilteredTransactions(transactions.filter(t => t.amount >= amount));
  };

  const getTotalTransactionsPerDay = () => {
    if (!selectedCustomer) return [];
    const customerTransactions = transactions.filter(t => t.customer_id === selectedCustomer);
    const totals = customerTransactions.reduce((acc, transaction) => {
      acc[transaction.date] = (acc[transaction.date] || 0) + transaction.amount;
      return acc;
    }, {});
    return Object.keys(totals).map(date => ({ date, amount: totals[date] }));
  };

  const transactionData = {
    labels: getTotalTransactionsPerDay().map(t => t.date),
    datasets: [
      {
        label: 'Total Transaction Amount',
        data: getTotalTransactionsPerDay().map(t => t.amount),
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 1,
      },
    ],
  };

  const getCustomerNameById = (x) => {
    let customerName;
    customers.forEach(e => e.id == x ? customerName = e.name : ' ')
    return customerName;
  }

  if (error) {
    return <div>Error fetching data: {error.message}</div>;
  }

  return (
    <div className='container'>
      <h1>Customer Transactions</h1>
      <div className='my-3'>
        <label>Filter by customer: </label>
        <select className="form-select" aria-label="Default select example" onChange={handleCustomerChange}>
          <option value="">All</option>
          {customers.map(customer => (
            <option key={customer.id} value={customer.id}>{customer.name}</option>
          ))}
        </select>
      </div>
      <div className='my-3'>
        <label>Filter by amount: </label>
        <input type="number" className="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default" onChange={handleAmountFilter}></input>
      </div>
      <table className='table table-striped table-hover my-3'>
        <thead>
          <tr>
            <th scope="col">Customer ID</th>
            <th scope="col">Customer Name</th>
            <th scope="col">Transaction Date</th>
            <th scope="col">Amount</th>
          </tr>
        </thead>
        <tbody>
          {filteredTransactions.map(transaction => (
            <tr key={transaction.id}>
              <td>{transaction.customer_id}</td>
              <td>{getCustomerNameById(transaction.customer_id)}</td>
              <td>{transaction.date}</td>
              <td>{transaction.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Transactions Graph</h2>
      <Bar data={transactionData} />
    </div>
  );
};

export default App;
