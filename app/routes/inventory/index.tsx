import type { Hog } from "@prisma/client";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";

type LoaderData = {
  hogListItems: Array<Hog>;
};

export const loader: LoaderFunction = async () => {
  const data: LoaderData = {
    hogListItems: await db.hog.findMany(),
  };

  return json(data);
};

export default function InventoryPage() {
  const data = useLoaderData<LoaderData>();
  return (
    <>
      <h1>Inventory</h1>
      <h2>
        <Link to="../">Go back</Link>
      </h2>

      <ul>
        {data.hogListItems.map((hog) => {
          return (
            <li key={hog.id}>
              {hog.eartag} - {hog.weight}KG
            </li>
          );
        })}
      </ul>
    </>
  );
}
