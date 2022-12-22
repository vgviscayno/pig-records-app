import type { Customer } from "@prisma/client";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { Link } from "react-router-dom";
import { db } from "~/utils/db.server";

type LoaderData = {
  customerItems: Array<Customer>;
};

export const loader: LoaderFunction = async () => {
  const data: LoaderData = {
    customerItems: await db.customer.findMany(),
  };

  return json(data);
};

export default function CustomersPage() {
  const data = useLoaderData<LoaderData>();
  return (
    <>
      <h1>Customers</h1>
      <h2>
        <Link to="../">Go back</Link>
      </h2>
      <ul>
        {data.customerItems.map((customer) => {
          return <li key={customer.id}>{customer.name}</li>;
        })}
      </ul>
      <Outlet />
    </>
  );
}
