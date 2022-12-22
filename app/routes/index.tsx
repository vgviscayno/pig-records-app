import { Link } from "@remix-run/react";

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>Welcome to Piggery App</h1>
      <Link to="/inventory">Inventory</Link>
      <Link to="/customers">Customers</Link>
      <Link to="/transactions">Transactions</Link>
    </div>
  );
}
