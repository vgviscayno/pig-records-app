import type { Hog } from "@prisma/client";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import MainNavigation from "~/components/MainNavigation";
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
      {/* <MainNavigation /> */}
      <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
        Inventory
      </h2>

      <ul>
        {data.hogListItems.map((hog) => {
          return (
            <li key={hog.id}>
              {hog.eartag} - {hog.liveWeight}KG
            </li>
          );
        })}
      </ul>
    </>
  );
}
