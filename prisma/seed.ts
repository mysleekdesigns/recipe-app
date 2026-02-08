import { PrismaClient } from '../src/generated/prisma/client.ts'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import path from 'node:path'

const dbPath = path.resolve(process.cwd(), 'prisma', 'dev.db')

const adapter = new PrismaLibSql({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  const categories = [
    { name: 'Main Course', slug: 'main-course' },
    { name: 'Dessert', slug: 'dessert' },
    { name: 'Salad', slug: 'salad' },
    { name: 'Soup', slug: 'soup' },
    { name: 'Breakfast', slug: 'breakfast' },
    { name: 'Side Dish', slug: 'side-dish' },
    { name: 'Appetizer', slug: 'appetizer' },
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    })
  }

  const tags = [
    { name: 'Quick Meal', slug: 'quick-meal' },
    { name: 'Vegetarian', slug: 'vegetarian' },
    { name: 'Gluten Free', slug: 'gluten-free' },
    { name: 'Meal Prep', slug: 'meal-prep' },
    { name: 'Comfort Food', slug: 'comfort-food' },
  ]

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    })
  }

  console.log('Seeding complete!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
