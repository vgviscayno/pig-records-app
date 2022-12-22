import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function seed() {
  await Promise.all(
    getHogs().map((hog) => {
      return db.hog.create({ data: hog });
    })
  );
  await Promise.all(
    getCustomers().map((customer) => {
      return db.customer.create({ data: customer });
    })
  );
}

seed();

function getCustomers() {
  return [
    {
      name: "Dodong Coling",
    },
    {
      name: "Bestseller Meatshop",
    },
    {
      name: "Nanay",
    },
    {
      name: "SLERS",
    },
    {
      name: "Sivako Foods",
    },
  ];
}

function getHogs() {
  return [
    {
      eartag: "5931",
      weight: 110,
    },
    {
      eartag: "5744",
      weight: 121,
    },
    {
      eartag: "6142",
      weight: 107,
    },
    {
      eartag: "4131",
      weight: 116,
    },
    {
      eartag: "4862",
      weight: 106,
    },
  ];
}
