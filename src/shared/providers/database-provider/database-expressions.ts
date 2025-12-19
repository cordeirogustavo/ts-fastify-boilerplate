import {
  and,
  arrayContains,
  arrayOverlaps,
  avg,
  count,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  isNotNull,
  isNull,
  like,
  lt,
  lte,
  max,
  min,
  ne,
  not,
  notInArray,
  or,
  sql,
  sum,
} from 'drizzle-orm'

export class DatabaseExpressions {
  and = and
  or = or
  not = not
  eq = eq
  ne = ne
  gt = gt
  gte = gte
  lt = lt
  lte = lte
  isNull = isNull
  isNotNull = isNotNull
  inArray = inArray
  notInArray = notInArray
  arrayContains = arrayContains
  arrayOverlaps = arrayOverlaps
  like = like
  ilike = ilike
  count = count
  sum = sum
  avg = avg
  min = min
  max = max
  sql = sql
}
