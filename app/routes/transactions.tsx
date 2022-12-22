import type { Prisma } from "@prisma/client";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { displayFormattedDate } from "~/utils/date";
import { db } from "~/utils/db.server";

type TransactionWithCustomer = Prisma.TransactionGetPayload<{
  include: { customer: true };
}>;

type LoaderData = {
  transactionItems: Array<TransactionWithCustomer>;
};

export const loader: LoaderFunction = async () => {
  const data: LoaderData = {
    transactionItems: await db.transaction.findMany({
      include: { customer: true },
    }),
  };

  return json(data);
};

export default function TransactionsPage() {
  const data = useLoaderData<LoaderData>();
  return (
    <section className="flex space-x-2">
      <div>
        <h1>Transactions</h1>
        <h2>
          <Link to="../">Go back</Link>
        </h2>
        <ul>
          {data.transactionItems.map((transaction) => {
            return (
              <li key={transaction.id}>
                <Link to={`./${transaction.id}`}>
                  {displayFormattedDate(transaction.transactionDate)} -{" "}
                  {transaction.customer.name}
                </Link>
              </li>
            );
          })}
        </ul>
        <h2>
          <Link to="new">Add Transaction</Link>
        </h2>
      </div>
      <Outlet />
    </section>
  );
}
