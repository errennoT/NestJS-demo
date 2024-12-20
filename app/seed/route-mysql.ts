import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client'; // Importer PrismaClient
import { invoices, customers, revenue, users } from '../lib/placeholder-data';

const prisma = new PrismaClient(); // Créer une instance de PrismaClient

// Fonction pour créer les utilisateurs dans la base de données
async function seedUsers() {
  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return prisma.user.upsert({
        where: { id: user.id },
        update: {}, // Pas besoin de mettre à jour, seulement l'insert
        create: {
          id: user.id,
          name: user.name,
          email: user.email,
          password: hashedPassword,
        },
      });
    })
  );
  return insertedUsers;
}

//Fonction pour créer les factures dans la base de données
async function seedInvoices() {
  const insertedInvoices = await Promise.all(
    invoices.map((invoice) =>
      prisma.invoice.create({
        data: {
          customer_id: invoice.customer_id, // Clé étrangère vers Customer
          amount: invoice.amount,
          status: invoice.status,
          date: new Date(invoice.date), // Conversion en objet Date
        },
      })
    )
  );
  return insertedInvoices;
}

// Fonction pour créer les clients dans la base de données
async function seedCustomers() {
  const insertedCustomers = await Promise.all(
    customers.map((customer) =>
      prisma.customer.upsert({
        where: { id: customer.id },
        update: {},
        create: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          image_url: customer.image_url,
        },
      })
    )
  );
  return insertedCustomers;
}

// Fonction pour créer les revenus dans la base de données
async function seedRevenue() {
  const insertedRevenue = await Promise.all(
    revenue.map((rev) =>
      prisma.revenue.upsert({
        where: { month: rev.month },
        update: {},
        create: {
          month: rev.month,
          revenue: rev.revenue,
        },
      })
    )
  );
  return insertedRevenue;
}

// Fonction principale pour exécuter tout le seeding
export async function GET() {
  try {
    await prisma.$transaction(async () => {
      await seedUsers();
      await seedCustomers();
      await seedInvoices();
      await seedRevenue();
    });

    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Failed to seed the database' }, { status: 500 });
  } finally {
    await prisma.$disconnect(); // Assure-toi de bien fermer la connexion Prisma
  }
}
