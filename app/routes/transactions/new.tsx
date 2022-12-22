import type { Customer, Hog } from "@prisma/client";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { db } from "~/utils/db.server";

type LoaderData = {
  availableHogsList: Array<Hog>;
  customersList: Array<Customer>;
};

export const loader: LoaderFunction = async () => {
  const data: LoaderData = {
    availableHogsList: await db.hog.findMany({
      where: {
        transactionId: null,
      },
    }),
    customersList: await db.customer.findMany(),
  };

  return json(data);
};

const formSchema = z.object({
  customer: z.string({ required_error: "Please select a customer" }),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Please enter a date",
  }),
  hogs: z.string().array().min(1, "Please select at least one hog"),
});

type Schema = z.infer<typeof formSchema>;

type ActionData = {
  formError?: string;
  fieldErrors?: {
    date: string | undefined;
    hogs: string | undefined;
  };
  fields?: Schema;
};

const badRequest = (data: ActionData) => {
  console.log({ data });
  return json(data, { status: 400 });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const customerInputValue = formData.get("customer");
  const dateInputValue = formData.get("date");
  const hogsInputValue = formData.getAll("hogs");

  const result = formSchema.safeParse({
    customer: customerInputValue,
    date: dateInputValue,
    hogs: hogsInputValue,
  });

  if (!result.success) {
    const formatted = result.error.format();

    const fieldErrors = {
      date: formatted.date?._errors[0],
      hogs: formatted.hogs?._errors[0],
    };

    if (
      typeof dateInputValue !== "string" ||
      typeof customerInputValue !== "string"
    ) {
      return badRequest({
        formError: "Something went wrong during form submission",
      });
    }

    let hogsInputValueIsArrayString = true,
      hogs: string[] = [];
    for (let index = 0; index < hogsInputValue.length; index++) {
      const element = hogsInputValue[index];
      if (typeof element !== "string") {
        hogsInputValueIsArrayString = false;
      } else {
        hogs = hogs.concat(element);
      }
    }

    if (!Array.isArray(hogsInputValue) || !hogsInputValueIsArrayString) {
      return badRequest({
        formError: "Something went wrong during form submission",
      });
    }

    return badRequest({
      fieldErrors,
      fields: {
        customer: customerInputValue,
        date: dateInputValue,
        hogs,
      },
    });
  }

  // perform backend ops
  const { customer: customerId, date, hogs: hogsIds } = result.data;

  await db.transaction.create({
    data: {
      customerId,
      hogs: {
        connect: hogsIds.map((id) => ({ id })),
      },
      transactionDate: new Date(date),
    },
  });

  return json({ date, hogsIds });
};

export default function NewTransactionPage() {
  const loaderData = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();

  return (
    <Form method="post" className="w-1/3 border-solid border-2 p-2 space-y-2">
      <div className="w-full border-solid border-2 p-2 flex-col">
        <label htmlFor="customer" className="w-full">
          Customer:
        </label>
        <select id="customer" name="customer" className="w-full">
          {loaderData.customersList.map((customer) => {
            return (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            );
          })}
        </select>
        {actionData?.fieldErrors?.date ? (
          <p className="text-red-500" role="alert">
            {actionData?.fieldErrors?.date}
          </p>
        ) : null}
      </div>
      <div className="w-full border-solid border-2 p-2 flex-col">
        <label htmlFor="date" className="w-full">
          Transaction date:
        </label>
        <input type={"date"} id="date" name="date" className="w-full" />
        {actionData?.fieldErrors?.date ? (
          <p className="text-red-500" role="alert">
            {actionData?.fieldErrors?.date}
          </p>
        ) : null}
      </div>

      <fieldset className=" w-full border-solid border-2 p-2">
        <label>Available hogs:</label>
        {loaderData.availableHogsList.length > 0 ? (
          <ul>
            {loaderData.availableHogsList.map((hog) => {
              return (
                <li key={hog.id}>
                  <label>
                    <input
                      className="mr-1"
                      type="checkbox"
                      id="hogs"
                      name="hogs"
                      value={hog.id}
                      // defaultChecked={
                      //   actionData?.fields?.hogs.includes(hog.id) ?? false
                      // }
                    />
                    Eartag#: {hog.eartag} ({hog.weight}kg)
                  </label>
                </li>
              );
            })}
          </ul>
        ) : (
          <p>No available hogs</p>
        )}
        {actionData?.fieldErrors?.hogs ? (
          <p className="text-red-500" role="alert">
            {actionData?.fieldErrors?.hogs}
          </p>
        ) : null}
      </fieldset>
      {actionData?.formError ? (
        <p className="text-red-500" role="alert">
          {actionData.formError}
        </p>
      ) : null}
      <button type="submit">Create transaction</button>
    </Form>
  );
}
