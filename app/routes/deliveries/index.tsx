/* eslint-disable react/jsx-key */
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { format } from "date-fns";

import { z } from "zod";
import { db } from "~/utils/db.server";

type SummarizedDelivery = {
  id: string;
  arrivalDate: Date;
  modeOfPayment: string;
  supplier: string;
  numberOfHogs: number;
  totalLiveWight: number;
  totalAmount: number;
  averageFarmgatePrice: number;
  averageWeight: number;
};

type LoaderData = SummarizedDelivery[];

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);

  const page = z.number().catch(1).parse(url.searchParams.get("page"));
  const per = z.number().catch(10).parse(url.searchParams.get("page"));

  const deliveries = await db.delivery.findMany({
    skip: per * (page - 1),
    take: per,
    include: {
      supplier: true,
      hogs: true,
    },
  });

  const summarizedDeliveries: LoaderData = deliveries.map(
    ({
      arrivalDate,
      modeOfPayment,
      supplier: { name: supplier },
      hogs,
      id,
    }) => {
      const numberOfHogs = hogs.length;

      const totalLiveWight = hogs
        .map(({ liveWeight }) => liveWeight)
        .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

      const totalAmount = hogs
        .map(({ farmgatePrice, liveWeight }) => farmgatePrice * liveWeight)
        .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

      const averageFarmgatePrice =
        hogs
          .map(({ farmgatePrice }) => farmgatePrice)
          .reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0
          ) / numberOfHogs;

      return {
        id,
        arrivalDate,
        modeOfPayment: modeOfPayment === "" ? "-" : modeOfPayment,
        supplier,
        numberOfHogs,
        totalLiveWight,
        totalAmount,
        averageWeight: totalLiveWight / numberOfHogs,
        averageFarmgatePrice,
      };
    }
  );

  return json<LoaderData>(summarizedDeliveries);
};

const columnHelper = createColumnHelper<
  Omit<SummarizedDelivery, "arrivalDate"> | { arrivalDate: string }
>();

const columns = [
  columnHelper.accessor("arrivalDate", {
    cell: (info) => {
      return (
        //@ts-ignore
        <Link to={`./${info.row.original.id}`}>
          {format(new Date(info.getValue() as string), "dd MMMM yyyy (EEEE)")}
        </Link>
      );
    },
    header: () => <>Arrival Date</>,
  }),
  columnHelper.accessor("supplier", {
    cell: (info) => info.getValue(),
    header: () => <>Supplier</>,
  }),
  columnHelper.accessor("modeOfPayment", {
    cell: (info) => (info.getValue() === "" ? "-" : info.getValue()),
    header: () => <>Mode of Payment</>,
  }),
  columnHelper.accessor("numberOfHogs", {
    cell: (info) => info.getValue(),
    header: () => <>Number of Hogs</>,
  }),
  columnHelper.accessor("totalLiveWight", {
    cell: (info) => Number(info.getValue()).toLocaleString("en"),
    header: () => <>Total Live Weight (kg)</>,
  }),
  columnHelper.accessor("averageWeight", {
    cell: (info) => Number(info.getValue()).toLocaleString("en"),
    header: () => <>Average Weight (kg)</>,
  }),
  columnHelper.accessor("totalAmount", {
    cell: (info) => Number(info.getValue()).toLocaleString("en"),
    header: () => <>Total Amount (PHP)</>,
  }),
  columnHelper.accessor("averageFarmgatePrice", {
    cell: (info) => Number(info.getValue()).toLocaleString("en"),
    header: () => <>Farmgate Price (PHP)</>,
  }),
];

export default function DeliveriesRoute() {
  const data = useLoaderData<LoaderData>();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full overflow-y-auto flex flex-col justify-center items-center align-middle">
      <h2 className="mb-4 scroll-m-20 text-2xl font-semibold tracking-tight">
        Deliveries
      </h2>

      <table className="w-3/4">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr
              className="m-0 border-t border-slate-300 p-0 even:bg-slate-100 dark:border-slate-700 dark:even:bg-slate-800"
              key={headerGroup.id}
            >
              {headerGroup.headers.map((header) => (
                <th
                  className="border border-slate-200 px-4 py-2 text-left font-bold dark:border-slate-700 [&[align=center]]:text-center [&[align=right]]:text-right"
                  key={header.id}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              className="m-0 border-t border-slate-200 p-0 even:bg-slate-100 dark:border-slate-700 dark:even:bg-slate-800"
              key={row.id}
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  className="border border-slate-200 px-4 py-2 text-left dark:border-slate-700 [&[align=center]]:text-center [&[align=right]]:text-right"
                  key={cell.id}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <table className="w-3/4 hidden">
        <thead>
          <tr className="m-0 border-t border-slate-300 p-0 even:bg-slate-100 dark:border-slate-700 dark:even:bg-slate-800">
            <th className="border border-slate-200 px-4 py-2 text-left font-bold dark:border-slate-700 [&[align=center]]:text-center [&[align=right]]:text-right">
              Arrival Date
            </th>
            <th className="border border-slate-200 px-4 py-2 text-left font-bold dark:border-slate-700 [&[align=center]]:text-center [&[align=right]]:text-right">
              Supplier
            </th>
            <th className="border border-slate-200 px-4 py-2 text-left font-bold dark:border-slate-700 [&[align=center]]:text-center [&[align=right]]:text-right">
              Mode of Payment
            </th>
            <th className="border border-slate-200 px-4 py-2 text-left font-bold dark:border-slate-700 [&[align=center]]:text-center [&[align=right]]:text-right">
              Number of Hogs
            </th>
            <th className="border border-slate-200 px-4 py-2 text-left font-bold dark:border-slate-700 [&[align=center]]:text-center [&[align=right]]:text-right">
              Total Amount
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="m-0 border-t border-slate-200 p-0 even:bg-slate-100 dark:border-slate-700 dark:even:bg-slate-800">
            <td className="border border-slate-200 px-4 py-2 text-left dark:border-slate-700 [&[align=center]]:text-center [&[align=right]]:text-right">
              Empty
            </td>
            <td className="border border-slate-200 px-4 py-2 text-left dark:border-slate-700 [&[align=center]]:text-center [&[align=right]]:text-right">
              Overflowing
            </td>
            <td className="border border-slate-200 px-4 py-2 text-left dark:border-slate-700 [&[align=center]]:text-center [&[align=right]]:text-right">
              Overflowing
            </td>
            <td className="border border-slate-200 px-4 py-2 text-left dark:border-slate-700 [&[align=center]]:text-center [&[align=right]]:text-right">
              Overflowing
            </td>
            <td className="border border-slate-200 px-4 py-2 text-left dark:border-slate-700 [&[align=center]]:text-center [&[align=right]]:text-right">
              Overflowing
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
