union = (a, b) => [...a, ...b]
union([1, 2, 3], [2, 3, 4])
// get [1, 2, 3, 2, 3, 4]

intersect = (a, b) => a.reduce(
  (acc, inc) => b.includes(inc) ?
    [...acc, inc] : []
, [])
intersect([1, 2, 3], [2, 3, 4]) // get [2, 3]

differ = (a, b) => a.filter(
  i => !b.includes(i)
)
differ([1, 2, 3], [2, 3, 4]) // get [1]

differ(
  [1, 2, 3, 4, 5, 6],
  union([2, 3], [4, 5])
) // get [1, 6]

/*--------------------------------------------------------------------------------*/

factorial = n => n === 1 ? 1 : n * factorial(n - 1)
factorial(3) // get 6
factorial(6) // get 720

permutation = (n, r) =>
  factorial(n) / factorial(n - r)

permutation(6, 4) // get 360

combination = (n, r) => factorial(n) / (
  factorial(r) * factorial(n - r)
)
combination(6, 4) // get 15
