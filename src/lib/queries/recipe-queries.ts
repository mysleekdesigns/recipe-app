import { prisma } from '@/lib/prisma'
import type { Prisma } from '@/generated/prisma/client'
import type { SortOption } from '@/types'

export interface GetRecipesParams {
  search?: string
  category?: string
  cuisine?: string
  difficulty?: string
  maxCookTime?: number
  tags?: string[]
  sort?: SortOption
  page?: number
  pageSize?: number
}

const recipeIncludes = {
  ingredients: {
    include: { ingredient: true },
    orderBy: { order: 'asc' as const },
  },
  instructions: {
    orderBy: { step: 'asc' as const },
  },
  categories: {
    include: { category: true },
  },
  tags: {
    include: { tag: true },
  },
  nutrition: true,
}

const sortMap: Record<SortOption, Prisma.RecipeOrderByWithRelationInput> = {
  date: { createdAt: 'desc' },
  name: { title: 'asc' },
  cookTime: { cookTime: 'asc' },
  rating: { rating: 'desc' },
}

export async function getRecipes(params: GetRecipesParams = {}) {
  const {
    search,
    category,
    cuisine,
    difficulty,
    maxCookTime,
    tags,
    sort = 'date',
    page = 1,
    pageSize = 12,
  } = params

  const conditions: Prisma.RecipeWhereInput[] = []

  if (search) {
    conditions.push({
      OR: [
        { title: { contains: search } },
        { description: { contains: search } },
        {
          ingredients: {
            some: {
              ingredient: {
                name: { contains: search },
              },
            },
          },
        },
      ],
    })
  }

  if (category) {
    conditions.push({
      categories: { some: { category: { slug: category } } },
    })
  }

  if (cuisine) {
    conditions.push({ cuisine })
  }

  if (difficulty) {
    conditions.push({ difficulty })
  }

  if (maxCookTime !== undefined) {
    conditions.push({ cookTime: { lte: maxCookTime } })
  }

  if (tags && tags.length > 0) {
    conditions.push({
      tags: { some: { tag: { slug: { in: tags } } } },
    })
  }

  const where: Prisma.RecipeWhereInput =
    conditions.length > 0 ? { AND: conditions } : {}

  const orderBy = sortMap[sort] ?? sortMap.date

  const skip = (page - 1) * pageSize

  const [recipes, total] = await Promise.all([
    prisma.recipe.findMany({
      where,
      include: recipeIncludes,
      orderBy,
      skip,
      take: pageSize,
    }),
    prisma.recipe.count({ where }),
  ])

  return { recipes, total }
}

export async function getRecipeBySlug(slug: string) {
  return prisma.recipe.findUnique({
    where: { slug },
    include: recipeIncludes,
  })
}

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { recipes: true },
      },
    },
  })
}

export async function getTags() {
  return prisma.tag.findMany({
    orderBy: { name: 'asc' },
  })
}

export async function getCuisines() {
  const results = await prisma.recipe.findMany({
    where: { cuisine: { not: null } },
    distinct: ['cuisine'],
    select: { cuisine: true },
    orderBy: { cuisine: 'asc' },
  })

  return results
    .map((r) => r.cuisine)
    .filter((c): c is string => c !== null)
}
