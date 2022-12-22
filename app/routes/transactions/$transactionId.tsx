import type { Prisma } from "@prisma/client";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { displayFormattedDate } from "~/utils/date";
import { db } from "~/utils/db.server";

type TransactionWithCustomer = Prisma.TransactionGetPayload<{
  include: { customer: true; hogs: true };
}>;

type LoaderData = {
  transaction: TransactionWithCustomer;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const transaction = await db.transaction.findUnique({
    where: {
      id: params.transactionId,
    },
    include: {
      customer: true,
      hogs: true,
    },
  });

  if (!transaction) {
    throw new Response("Transaction not found.", {
      status: 404,
    });
  }

  const data: LoaderData = {
    transaction,
  };

  return json(data);
};

export default function TransactionRoute() {
  const data = useLoaderData<LoaderData>();

  return (
    <section>
      <p>Customer: {data.transaction.customer.name}</p>
      <p>
        Date:
        {displayFormattedDate(data.transaction.transactionDate)}
      </p>
      <p>Purchased hogs:</p>
      <ul>
        {data.transaction.hogs.map((hog) => (
          <li key={hog.id}>
            Eartag #:{hog.eartag} - {hog.weight}kg
          </li>
        ))}
      </ul>
    </section>
  );
}
