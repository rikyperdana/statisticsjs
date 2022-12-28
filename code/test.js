var
withAs = (obj, cb) => cb(obj),
get = prop => obj => obj[prop],
sum = array => array.reduce((acc, inc) => acc + inc),
mul = array => array.reduce((acc, inc) => acc * inc),
pow = asc => num => Math.pow(num, asc),
powSum = (n, arr) => sum(arr.map(pow(n))),
range = array => Math.max(...array) - Math.min(...array),
between = (low, middle, high) =>
  (low <= middle) && (middle <= high),
classes = array => Math.round(1 + (3.3 * Math.log10(array.length))),
interval = array => Math.round(range(array) / classes(array)),
makeArray = num => [...Array(num).keys()], // generate [0, 1, 2, ...num]
sort = array => [...array].sort((a, b) => a - b),

last = arr => arr.slice(-1)[0],
chunk = (input, size) =>
  input.reduce((res, inc) =>
  last(res).length >= size ? [...res, [inc]]
  : [...res.slice(0, -1), [...last(res), inc]]
, [[]]),
assign = (a, b) => Object.assign({}, a, b),

/*---------------------------------------------------------------------------------------*/

mean = array => sum(array) / array.length,
ors = array => array.find(Boolean)

median = array => withAs(
  sort(array), sorted => ors([
    sorted.length === 1 && sorted[0],
    sorted.length === 2 && mean(sorted),
  ]) || median(sorted.slice(1, sorted.length - 1))
)

mean([1, 2, 3]) // get 2
median([2, 1, 2, 3]) // get 2

/*----------------------------------------------------------------*/

distFreq = array => withAs({
  m: Math.min(...array), i: interval(array)
}, ({m, i}) =>
  makeArray(classes(array))
  .map(j => withAs({
    bot: m + (i * j),
    top: m + (i * j) + i - 1,
  }, ({bot, top}) => ({
    bot, top, fre: array.reduce((acc, inc) =>
      between(bot, inc, top) ? acc + 1 : acc
    , 0)
  })))
),

data = [
  78, 72, 74, 79, 74, 71, 75, 74, 72, 68,
  72, 73, 72, 74, 75, 74, 73, 74, 65, 72,
  66, 75, 80, 69, 82, 73, 74, 72, 79, 71,
  70, 75, 71, 70, 70, 70, 75, 76, 77, 67
]

distFreq(data) /* get [
  {"bot": 65, "top": 67, "fre": 3  },
  {"bot": 68, "top": 70, "fre": 6  },
  {"bot": 71, "top": 73, "fre": 12 },
  {"bot": 74, "top": 76, "fre": 13 },
  {"bot": 77, "top": 79, "fre": 4  },
  {"bot": 80, "top": 82, "fre": 2  }
]  */

/*---------------------------------------------------------------------------------------*/

distLength = dist => sum(dist.map(get('fre')))

distLength(distFreq(data)) // get 40

/*---------------------------------------------------------------------------------------*/

distRelative = (dist, percent) => dist.map(
  i => Object.assign(i, {
    rel: i.fre / sum(dist.map(get('fre')))
    * (percent ? 100 : 1)
  })
)

distRelative(distFreq(data)) /* with decimal get [
  {"bot": 65, "top": 67, "fre": 3,  "rel": 0.075 },
  {"bot": 68, "top": 70, "fre": 6,  "rel": 0.15  },
  {"bot": 71, "top": 73, "fre": 12, "rel": 0.3   },
  {"bot": 74, "top": 76, "fre": 13, "rel": 0.325 },
  {"bot": 77, "top": 79, "fre": 4,  "rel": 0.1   },
  {"bot": 80, "top": 82, "fre": 2,  "rel": 0.05  }
]  */

distRelative(distFreq(data), true)/* with percentage get [
  {"bot": 65, "top": 67, "fre": 3,  "rel": 7.5  },
  {"bot": 68, "top": 70, "fre": 6,  "rel": 15   },
  {"bot": 71, "top": 73, "fre": 12, "rel": 30   },
  {"bot": 74, "top": 76, "fre": 13, "rel": 32.5 },
  {"bot": 77, "top": 79, "fre": 4,  "rel": 10   },
  {"bot": 80, "top": 82, "fre": 2,  "rel": 5    }
] */

/*---------------------------------------------------------------------------------------*/

distCumulative = dist => dist.reduce(
  (acc, inc) => [...acc, Object.assign(inc, {
    cumA: inc.fre + sum([0, ...acc.map(get('fre'))]),
    cumD:
      sum(dist.map(get('fre'))) -
      sum([0, ...acc.map(get('fre'))])
  })],
[])

distCumulative(distFreq(data)) /* get [
  {"bot": 65, "top": 67, "fre": 3,  "cumA": 3,  "cumD": 40 },
  {"bot": 68, "top": 70, "fre": 6,  "cumA": 9,  "cumD": 37 },
  {"bot": 71, "top": 73, "fre": 12, "cumA": 21, "cumD": 31 },
  {"bot": 74, "top": 76, "fre": 13, "cumA": 34, "cumD": 19 },
  {"bot": 77, "top": 79, "fre": 4,  "cumA": 38, "cumD": 6  },
  {"bot": 80, "top": 82, "fre": 2,  "cumA": 40, "cumD": 2  }
] */

/*---------------------------------------------------------------------------------------*/

distMean = dist => sum(dist.map(
  i => (i.bot + (
    (i.top - i.bot) / 2
  )) * i.fre
)) / sum(dist.map(get('fre')))

distMean(distFreq(data)) // get 73.125
mean(data) // get 73.075

/*---------------------------------------------------------------------------------------*/

distMedian = dist => withAs(
  distCumulative(dist), cumul => withAs(
    dist[dist.length - 1].cumA, length => withAs(
      dist.find(i => i.cumA >= length / 2),
      medClass => (medClass.bot - 0.5) + (
        (length/2 - cumul.find(
          i => i.top === medClass.bot - 1
        ).cumA) / medClass.fre
      ) * (medClass.top - medClass.bot + 1)
    )
  )
)

distMedian(distFreq(data)) // get 73.25
median(data) // get 73

/*---------------------------------------------------------------------------------------*/

mode = array => +Object.entries(array.reduce(
  (acc, inc) => assign(acc, {
    [inc]: acc[inc]+1 || 1
  })
, {}))
.sort((a, b) => b[1] - a[1])
[0][0],

distMode = dist => withAs(
  dist.reduce((acc, inc) =>
    inc.fre > acc.fre ? inc : acc
  ), mostFre => withAs({
    prev: dist.find(i => i.top === mostFre.bot - 1),
    next: dist.find(i => i.bot === mostFre.top + 1)
  }, ({prev, next}) => (
    (mostFre.bot - 0.5) + (
      (mostFre.fre - prev.fre) / (
        (mostFre.fre - prev.fre) +
        (mostFre.fre - next.fre)
      )
    ) * (mostFre.top - mostFre.bot + 1)
  ))
)

mode(data) // get 74
distMode(distFreq(data)) // 73.8

/*---------------------------------------------------------------------------------------*/

randomize = digits => x => Math.round(
  Math.random() * Math.pow(10, digits)
)

randomize(2)() // get 17
randomize(5)() // get 92836

distFreq(makeArray(100).map(randomize(2))) /* get [
  {"bot": 1,  "top": 12, "fre": 10 },
  {"bot": 13, "top": 24, "fre": 5  },
  {"bot": 25, "top": 36, "fre": 17 },
  {"bot": 37, "top": 48, "fre": 12 },
  {"bot": 49, "top": 60, "fre": 17 },
  {"bot": 61, "top": 72, "fre": 13 },
  {"bot": 73, "top": 84, "fre": 15 },
  {"bot": 85, "top": 96, "fre": 7  }
] shall be abnormally distributed with utmost certainty */

/*---------------------------------------------------------------------------------------*/

fractile = (parts, nth, array) => withAs(
  (nth * (array.length + 1) / parts),
  decimal => withAs(Math.floor(decimal),
    even => withAs(sort(array),
      sorted => sorted[even - 1] + (
        (decimal - even) * (
          sorted[even] - sorted[even - 1]
        )
      )
    )
  )
)

fractile(4, 1, data) // 1st Quartile is 71
fractile(4, 2, data) // 2nd Quartile is 73
fractile(4, 3, data) // 3rd Quartile is 75

fractile(10, 3, data) // 3rd Decile is 71.3
fractile(100, 82, data) // 82nd Percentile is 75.62

/*---------------------------------------------------------------------------------------*/

distFractile = (parts, num, dist) => withAs(
  distCumulative(dist), distCum => withAs(
    last(distCum), tail => withAs(
      distCum.find(i => i.cumA >= num / parts * tail.cumA)
      , qClass => (qClass.bot - 0.5) + (
        (
          (num / parts * tail.cumA) -
          (qClass.cumA - qClass.fre)
        ) / qClass.fre
      ) * (qClass.top - qClass.bot + 1)
    )
  )
)

distFractile(4, 1, distFreq(data)) // 1st Quartile is 70.75
distFractile(4, 2, distFreq(data)) // 2nd Quartile is 73.25
distFractile(10, 5, distFreq(data)) // 5th Decile is 73.25
distFractile(100, 50, distFreq(data)) // 50th Percentile is 73.25

/*---------------------------------------------------------------------------------------*/
geoMean = array =>
  pow(1 / array.length)(mul(array))

geoMean([2, 4, 8, 16, 32]) // 8

logMean = arr => pow(
  sum(arr.map(Math.log10)) / arr.length
)(10)

logMean([2, 4, 8, 16, 32]) // 8
/*---------------------------------------------------------------------------------------*/

meanGrowth = (pt, po, t) =>
  (Math.pow((pt / po), 1 / t) - 1) * 100

meanGrowth(78, 60, 10) // get 2.6583

predictGrowth = (xbar, po, t) =>
  po * Math.pow((1 + (xbar / 100)), t)

predictGrowth(2.6583, 60, 10) // get 77.9995

/*----------------------------------------------------------------*/

harmonicMean = arr => arr.length / sum(arr.map(i => 1 / i))

harmonicMean([2, 5, 7, 9, 12]) // get 4.82

/*----------------------------------------------------------------*/

distRange = dist =>
  (dist[dist.length - 1].top + 0.5) -
  (dist[0].bot - 0.5)

distRange(distFreq(data)) // get 18

/*---------------------------------------------------------------------------------------*/

devMean = array => withAs(
  mean(array), meanVal => sum(
    array.map(i => i - meanVal)
         .map(Math.abs)
  ) / array.length
)

devMean([2, 3, 6, 8, 11]) // get 2.8

/*----------------------------------------------------------------*/

distDevMean = dist => withAs(
  distMean(dist), meanVal => sum(
    dist.map(i => i.fre * Math.abs(
      (i.bot + ((i.top - i.bot) / 2)) - meanVal
    ))
  ) / sum(dist.map(get('fre')))
)

distDevMean(distFreq(data)) // get 2.98125

/*---------------------------------------------------------------------------------------*/

variance = array => withAs(
  mean(array), meanVal => sum(
    array.map(i => i - meanVal)
         .map(pow(2))
  ) / (array.length - (
    array.length > 30 ? 0 : 1
  ))
)

variance(data) // get 13.069375

/*---------------------------------------------------------------------------------------*/

distVariance = dist => withAs(
  distMean(dist), meanVal => sum(
    dist.map(i => i.fre * pow(2)(
      (i.bot + ((i.top - i.bot) / 2)) - meanVal
    ))
  ) / distLength(dist) - (
    distLength(dist) > 30 ? 0 : 1
  )
)

distVariance(distFreq(data)) // get 13.359375

/*---------------------------------------------------------------------------------------*/

stanDev = arr => pow(1/2)(variance(arr))
distStanDev = dist => pow(1/2)(distVariance(dist))

stanDev(data) // get 3.6151
distStanDev(distFreq(data)) // get 3.6550

/*---------------------------------------------------------------------------------------*/

iQR = array => fractile(4, 3, array) - fractile(4, 1, array),

distIQR = dist =>
  distFractile(4, 3, distCumulative(dist)) -
  distFractile(4, 1, distCumulative(dist))

iQR(data) // get 4
distIQR(distFreq(data)) // get 4.8269

/*---------------------------------------------------------------------------------------*/

skewMod = array =>
  (mean(array) - mode(array)) /
  stanDev(array)

distSkewMod = dist =>
  (distMean(dist) - distMode(dist)) /
  distStanDev(dist)

skewMod(data) // get -0.2558
distSkewMod(distFreq(data)) // get -0.1846

/*---------------------------------------------------------------------------------------*/

skewMed = array =>
  (mean(array) - median(array))
  * 3 / stanDev(array)

distSkewMed = dist =>
  (distMean(dist) - distMedian(dist))
  * 3 / distStanDev(dist)

skewMed(data) // get 0.0622
distSkewMed(distFreq(data)) // get -0.1025

/*---------------------------------------------------------------------------------------*/

skewBow = (first, second, third) =>
  ((third - second) - (second - first)) /
  ((third - second) + (second - first)),

skewBow(
  fractile(4, 1, data),
  fractile(4, 2, data),
  fractile(4, 3, data)
) // get 0

skewBow(
  distFractile(4, 1, distFreq(data)),
  distFractile(4, 2, distFreq(data)),
  distFractile(4, 3, distFreq(data)),
) // get -0.0358

/*---------------------------------------------------------------------------------------*/

skewMom = array =>
  sum(array.map(i => pow(3)(i - mean(array)))) /
  ((array.length - 1) * pow(3)(stanDev(array)))

distSkewMom = dist => withAs(
  {
    meanVal: distMean(dist),
    midVal: i => i.bot + ((i.top - i.bot) / 2)
  }, ({meanVal, midVal}) => sum(
    dist.map(i => i.fre * pow(3)(
      midVal(i) - meanVal
    ))
  ) / distLength(dist)
  / pow(3)(distStanDev(dist))
)

skewMom(data) // get 0.1364
distSkewMom(distFreq(data)) // get 0.0013

/*---------------------------------------------------------------------------------------*/

kurtMom = array => sum(
  (array.map(i => Math.abs(pow(4)(i - mean(array)))))
) / array.length / pow(4)(stanDev(array))

distKurtMom = dist => withAs(
  {
    meanVal: distMean(dist),
    midVal: i => i.bot + ((i.top - i.bot) / 2)
  }, ({meanVal, midVal}) => sum(
    dist.map(i => i.fre * pow(4)(
      midVal(i) - meanVal
    ))
  ) / distLength(dist)
  / pow(4)(distStanDev(dist))
)

kurtMom(data) // get 3.1558
distKurtMom(distFreq(data)) // get 2.7454

/*---------------------------------------------------------------------------------------*/

// Moments Relations
// Variance(pow2) => Skewness(pow3) => Kurtosis(pow4)

moment = (nth, array) => withAs(
  mean(array), meanVal => sum(
    (array.map(i => Math.abs(pow(nth)(i - meanVal))))
  ) / array.length / pow(nth)(stanDev(array))
)

/*---------------------------------------------------------------------------------------*/

kurtPer = (q1, q3, p10, p90) =>
  ((q3 - q1) / 2) / (p90 - p10)

arr1 = [
  fractile(4, 1, data),
  fractile(4, 3, data),
  fractile(100, 10, data),
  fractile(100, 90, data)
] // get [71, 75, 68.1, 78.9]

arr2 = [
  distFractile(4, 1, distFreq(data)),
  distFractile(4, 3, distFreq(data)),
  distFractile(100, 10, distFreq(data)),
  distFractile(100, 90, distFreq(data))
] // get [70.75, 75.57, 68, 78]

kurtPer(...arr1) // get 0.1852
kurtPer(...arr2) // get 0.2413

/*---------------------------------------------------------------------------------------*/

zConvert = array => withAs(
  {m: mean(array), sd: stanDev(array)},
  ({m, sd}) => array.map(i => (i - m) / sd)
)

zConvert([5, 4, 8, 7, 1]) // get [0, -0.365, 1.095, 0.73, -1.46]
zConvert([5000, 4000, 8000, 7000, 1000]) // get the same result as above

/*---------------------------------------------------------------------------------------*/

variation = (a, b) => a / b * 100

variation(
  stanDev(data), mean(data)
) // get 4.9471899
variation(
  distStanDev(distFreq(data)),
  distMean(distFreq(data))
) // get 4.9983
variation(range(data), mean(data)) // get 23.263
variation(
  distRange(distFreq(data)),
  distMean(distFreq(data))
) // get 24.61538
variation(iQR(data), median(data)) // get 5.4794
variation(
  distIQR(distFreq(data)),
  distMedian(distFreq(data))
) // get 6.58965

/*---------------------------------------------------------------------------------------*/

pivots = array => chunk(array, array.length/2).map(mean)
trend = array => (pivots(array)[1] - pivots(array)[0]) / (array.length/2)
semiAvg = array => withAs(
  pivots(array)[0], anchor => array.map(
    (i, j) => anchor + (trend(array) * j -
      array.findIndex(k => k === anchor)
    )
  )
)

semiAvg([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
// get [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

semiAvgN = (array, next = 0) => withAs(
  pivots(array)[0], anchor =>
    makeArray(array.length + next).map(
      (i, j) => anchor + (trend(array) * j -
        array.findIndex(k => k === anchor)
      )
    )
)

semiAvgN([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 2)
// get [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

/*---------------------------------------------------------------------------------------*/

isOdd = num => num % 2

middleIndex = length => isOdd(length) ?
makeArray(length).map((i, j) => j + 1 - Math.round(length / 2)) : [
  ...makeArray(length/2).reduce((res, inc) => [-1 + (-2*inc), ...res], []),
  ...makeArray(length/2).reduce((res, inc) => [...res, 1 + (2 * inc)], [])
]

leastSquareEqu = array => withAs(
  middleIndex(array.length), index => ({
  a: mean(array),
  b: sum(array.map((i, j) => i * index[j]))
    / powSum(2, index)
}))

leastSquarePred = (array, next) => withAs({
  index: middleIndex(array.length),
  equation: leastSquareEqu(array)
}, ({index, equation}) => [
  ...index.map(i => equation.a + equation.b * i),
  ...makeArray(next).map(i =>
    equation.a + equation.b * (last(index)+i+1)
  )
])

leastSquareEqu([170, 190, 225, 250, 325])
// get {a: 232, b: 37}
leastSquarePred([170, 190, 225, 250, 325], 3)
// get [158, 195, 232, 269, 306, 343, 380, 417]

/*---------------------------------------------------------------------------------------*/

parabolicTrend = array => withAs(
  middleIndex(array.length), index => withAs({
    SY  : sum(array), length: array.length,
    SXY : sum(index.map((i, j) => array[j] * i)),
    SX2Y: sum(index.map((i, j) => array[j] * i * i)),
    SX2 : powSum(2, index),
    SX4 : powSum(4, index)
  }, ({length, SY, SXY, SX2Y, SX2, SX4}) => ({
    a: (length * SX2Y - SX2 * SY) /
       (length * SX4 - pow(2)(SX2)),
    b: SXY / SX2,
    c: (SY * SX4 - SX2Y * SX2) /
       (length * SX4 - pow(2)(SX2))
  }))
)

parabolicTrend([12, 16, 19, 21, 22])
// get {a: -0.5, b: 2.5, c: 19}
// equal to -0.5X^2 + 2.5X + 19

parabolicTrend([30, 25, 21, 18, 16])
// get {a: 0.5, b: -3.5, c: 21}
// equal to 0.5X^2 - 3.5X + 21

parabolicTrendPred = (array, next) => withAs({
  index: middleIndex(array.length),
  equation: parabolicTrend(array)
}, ({index, equation}) => [
  ...index.map(i =>
    equation.a * i * i +
    equation.b * i +
    equation.c
  ),
  ...makeArray(next).map(i =>
    equation.a * pow(2)(1 + i + last(index)) +
    equation.b * (1 + i + last(index)) +
    equation.c
  )
])

parabolicTrendPred([12, 16, 19, 21, 22], 5)
// get [12, 16, 19, 21, 22, 22, 21, 19, 16, 12]
//     [-----raw data-----|-----predicted-----]

parabolicTrendPred([30, 25, 21, 18, 16], 5)
// get [30, 25, 21, 18, 16, 15, 15, 16, 18, 21]
//     [-----raw data-----|-----predicted-----]

/*---------------------------------------------------------------------------------------*/

euler = 2.718281828459045
// the mysterius natural number

expoTrend = arr => withAs(middleIndex(arr.length), index => ({
  a: pow(sum(arr.map(Math.log)) / arr.length)(euler),
  b: pow((
    sum(index.map((i, j) => i * Math.log(arr[j]))) /
    powSum(2, index)
  ) - 1)(euler)
}))

expoTrend([59, 50, 44, 38, 33, 28, 23]) // get {a: 37.52, b: 0.8584}

expoTrendPred = (equ, idx) => equ.a * pow(idx)(equ.b)

middleIndex(7).map(
	i => expoTrendPred(
		{a: 37.52, b: 0.8584}, i
	)
) // get [59.31, 50.92, 43.7, 37.52, 32.2, 27.64, 23.73]
/*---------------------------------------------------------------------------------------*/

cycleTrend = arrays => withAs(
  makeArray(arrays[0].length)
  .map(i => sum(arrays.map(j => j[i]))),
  sums => sums.map(i => i / mean(sums))
)

cycleTrend([
  [2, 3, 3, 4],
  [3, 4, 4, 6],
  [4, 4, 3, 5],
  [4, 5, 5, 7]
]) // get [0.7878, 0.9696, 0.9090, 1.3333]

/*---------------------------------------------------------------------------------------*/

ratioTrend = arrays => withAs(
  middleIndex(arrays.length), index => ({
    a: sum(arrays.map(sum)) / arrays.length,
    b: sum(index.map((i, j) => i * sum(arrays[j]))) /
       powSum(2, index)
  })
)

ratioTrend([
  [2, 3, 3, 4],
  [3, 4, 4, 6],
  [4, 4, 3, 5],
  [4, 5, 5, 7]
]) // get ({a: 16.5, b: 1.3}) yearly prediction

ratioTrendPred = arrays => withAs(ratioTrend(arrays), trend =>
  chunk(middleIndex(arrays.length * arrays[0].length).map(i =>
    (trend.a / 4) + (trend.b / 16 * i) // split to quartile
  ), 4)
)

ratioTrendPred([
  [2, 3, 3, 4],
  [3, 4, 4, 6],
  [4, 4, 3, 5],
  [4, 5, 5, 7]
]) /* get quartile prediction result [
  [2.90625, 3.06874, 3.23125, 3.39375],
  [3.55625, 3.71875, 3.88125, 4.04375],
  [4.20625, 4.36875, 4.53125, 4.69375],
  [4.85625, 5.01875, 5.18125, 5.34375]
] */

ratioTrendDiff = arrays => withAs(
  ratioTrendPred(arrays).flat(), pred =>
    chunk(arrays.flatMap(
      (i, j) => i * 100 / pred[j]
    ), 4)
)

ratioTrendDiff([
  [2, 3, 3, 4],
  [3, 4, 4, 6],
  [4, 4, 3, 5],
  [4, 5, 5, 7]
]) /* get the result [
  [68.81, 97.75 , 92.84 , 117.86],
  [84.35, 107.56, 103.05, 148.37],
  [95.09, 91.55 , 66.20 , 106.52],
  [82.36, 99.62 , 96.50 , 130.99]
]*/

ratioTrendSeason = arrays => withAs(ratioTrendDiff(arrays), diff =>
  withAs(makeArray(4).map(i => mean(diff.map(j => j[i]))), averages =>
    averages.map(i => i * 100 * 4 / sum(averages))
  )
)

ratioTrendSeason([
  [2, 3, 3, 4],
  [3, 4, 4, 6],
  [4, 4, 3, 5],
  [4, 5, 5, 7]
]) // get [83.20, 99.78, 90.24, 126.77]

/*---------------------------------------------------------------------------------------*/

corelation = (x, y) => (
  x.length * sum(x.map((i, j) => i * y[j])) -
  sum(x) * sum(y)
) / pow(1/2)(
  (x.length * powSum(2, x) - pow(2)(sum(x))) *
  (x.length * powSum(2, y) - pow(2)(sum(y)))
)

corelation(
  [3, 6, 9, 10, 13],
  [12, 23, 24, 26, 28]
) // get 0.9149

determination = (x, y) => pow(2)(corelation(x, y))

determination(
  [3, 6, 9, 10, 13],
  [12, 23, 24, 26, 28]
) // get 0.8370

/*---------------------------------------------------------------------------------------*/

ranking = arr => withAs(sort([...arr]), sorted =>
  arr.map(i => 1 + sorted.findIndex(j => j == i))
)

ranking([82, 75, 85, 70, 77, 60, 63, 66, 80, 89])
// get [8, 5, 9, 4, 6, 1, 2, 3, 7, 10]

ranking([79, 80, 89, 65, 67, 62, 61, 68, 81, 84])
// get [6, 7, 10, 3, 4, 2, 1, 5, 8, 9]

corelationRank = (x, y) => withAs(
  makeArray(x.length).map(i =>
    ranking(x)[i] - ranking(y)[i]
  ), diff => 1 - (6 * powSum(2, diff)
    / (pow(3)(x.length) - x.length))
)

corelationRank(
  [82, 75, 85, 70, 77, 60, 63, 66, 80, 89],
  [79, 80, 89, 65, 67, 62, 61, 68, 81, 84]
) // get 0.866

/*---------------------------------------------------------------------------------------*/

distCorelation = arrays => withAs({
  n: sum(arrays.flat()),
  fy: arrays.map(sum),
  fx: arrays[0].map((i, j) => sum(arrays.map(k => k[j]))),
  uy: middleIndex(arrays.length).reverse(),
  ux: middleIndex(arrays[0].length)
}, ({n, fy, fx, uy, ux}) => withAs({
  fyuy: sum(fy.map((i, j) => i * uy[j])),
  fyuy2: sum(fy.map((i, j) => i * pow(2)(uy[j]))),
  fyuyux: sum(arrays.map((i, j) => sum(
    i.map((k, l) => k * uy[j] * ux[l])
  ))),
  fxux: sum(fx.map((i, j) => i * ux[j])),
  fxux2: sum(fx.map((i, j) => i * pow(2)(ux[j]))),
  fxuxuy: sum(arrays[0].map((i, j) => sum(
    arrays.map((k, l) => k[j] * ux[j] * uy[l])
  ))),
}, ({fyuy, fyuy2, fyuyux, fxux, fxux2, fxuxuy}) =>
  (n * fxuxuy - fxux * fyuy) / pow(1/2)(
    (n * fxux2 - pow(2)(fxux)) *
    (n * fyuy2 - pow(2)(fyuy))
  )
))

distCorelation([
  [3, 5, 4, 0, 0, 0],
  [3, 6, 6, 2, 0, 0],
  [1, 4, 9, 5, 2, 0],
  [0, 0, 5, 10, 8, 1],
  [0, 0, 1, 4, 6, 5],
  [0, 0, 0, 2, 4, 4]
]) // get -0.7685

/*---------------------------------------------------------------------------------------*/

chi2 = arrays => withAs(
  arrays.map(i => i.map((k, l) =>
    sum(i) * sum(arrays.map(m => m[l]))
    / sum(arrays.flat())
  )), pred => sum(pred.flat().map((n, o) =>
    pow(2)(arrays.flat()[o] - n) / n
  ))
)

chi2([
  [145, 58, 8],
  [77, 13, 27],
  [21, 32, 19]
]) // get 65.82

contingency = arrays => pow(1/2)(
  chi2(arrays) / (chi2(arrays) + sum(arrays.flat()))
)

contingency([
  [145, 58, 8],
  [77, 13, 27],
  [21, 32, 19]
]) // get 0.3759

/*---------------------------------------------------------------------------------------*/

multiLinCor = (y, x1, x2) => withAs(
  corelation, cor => pow(1/2)(
    (
      (pow(2)(cor(y, x1)) + pow(2)(cor(y, x2))) -
      (2 * cor(y, x1) * cor(y, x2) * cor(x1, x2))
    ) / (1 - pow(2)(cor(x1, x2)))
  )
)

multiLinCor(
  [3, 5, 6, 7, 4, 6, 9 ],
  [5, 8, 9,10, 7, 7 ,11],
  [4, 3, 2, 3, 2, 4, 5 ]
) // get 0.9735

/*---------------------------------------------------------------------------------------*/

partialCorelation = (a, b, c) =>
  withAs(corelation, cor =>
    (cor(a, b) - cor(a, c) * cor(b, c)) /
    pow(1/2)(
      (1 - pow(2)(cor(a, c))) *
      (1 - pow(2)(cor(b, c)))
    )
  )

corelation(
  [3, 5, 6, 7, 4, 6, 9 ], // a
  [5, 8, 9,10, 7, 7, 11], // b
) // get 0.9234

partialCorelation(
  [3, 5, 6, 7, 4, 6, 9 ], // a
  [5, 8, 9,10, 7, 7, 11], // b
  [0, 1, 1, 1, 0, 1, 1 ]  // c
) // get 0.8341

partialCorelation(
  [3, 5, 6, 7, 4, 6, 9 ], // a
  [5, 8, 9,10, 7, 7, 11], // b
  [4, 7, 6, 8, 4, 5, 6 ]  // c
) // get 0.8931

/*---------------------------------------------------------------------------------------*/

regression = (x, y) => withAs({
  x2: powSum(2, x),
  xy: sum(x.map((i, j) => i * y[j]))
}, ({x2, xy}) => ({
  a: (sum(y) * x2 - sum(x) * xy) /
     (x.length * x2 - pow(2)(sum(x))),
  b: (x.length * xy - sum(x) * sum(y)) /
     (x.length * x2 - pow(2)(sum(x)))
}))

regression(
  [2, 3, 2, 5, 6, 1, 4, 1],
  [5, 8, 8, 7, 11, 3, 10, 4]
) // get {a: 3.25, b: 1.25}

linearPred = (equ, num) =>
  equ.a + equ.b * num

linearPred(
  regression(
    [2, 3, 2, 5, 6, 1, 4, 1],
    [5, 8, 8, 7,11, 3,10, 4]
  ), 3.5
) // get 7.625

/*---------------------------------------------------------------------------------------*/

SEE = (x, y) => withAs({
  y2: powSum(2, y),
  xy: sum(x.map((i, j) => i * y[j])),
  reg: regression(x, y)
}, ({y2, xy, reg}) => pow(1/2)(
  (y2 - reg.a * sum(y) - reg.b * xy)
  / (x.length - 2)
))

SEE(
  [2, 3, 2, 5, 6, 1, 4, 1],
  [5, 8, 8, 7,11, 3,10, 4]
) // get 1.7559

SEE(
  [2, 3, 2, 5, 6, 1, 4, 1],
  [2, 3, 2, 5, 6, 1, 4, 1]
) // get 0

/*---------------------------------------------------------------------------------------*/

expoRegress = (x, y) => withAs(
  regression(x.map(Math.log10), y.map(Math.log10)),
  reg => ({a: pow(reg.a)(10), b: reg.b})
)

expoRegPred = (reg, num) =>
  reg.a * pow(reg.b)(num)

expoRegress(
  [1, 2, 3,  4,  5],
  [2, 4, 8, 16, 32]
) // get {a: 1.6036, b: 1.6785}
// equal to Y = a + X^b

expoRegPred({a: 1.6036, b: 1.6785}, 5) // get 23.9

/*---------------------------------------------------------------------------------------*/
populate = (seed, grow, gen) =>
  makeArray(gen).map(
    i => Math.pow(seed, (i+1))
  )

sumAlive = (max, gen) => sum(gens.slice(-max))

populate(2, 2, 2) // get [2, 4]
/*---------------------------------------------------------------------------------------*/

elim = (arr, n = 0) => arr.slice(-2-n)[0]
rest = (arr, n = 0) => arr.filter(
  (i, j) => j !== arr.length - 2 - n
)

gcf = (eq1, eq2) => elim(eq1) * elim(eq2)
multi = (eq1, eq2) => [
  eq1.map(i => i * gcf(eq1, eq2) / elim(eq1)),
  eq2.map(i => i * gcf(eq1, eq2) / elim(eq2))
]

diff = (eq1, eq2) => rest(
  makeArray(eq1.length).map(i =>
    multi(eq1, eq2)[0][i] -
    multi(eq1, eq2)[1][i]
  )
)

reduce = mat =>
  mat.length === 1 ? [] : [
    diff(mat[0], mat[1]),
    ...reduce(mat.slice(1-mat.length))
  ]

solve = mat =>
  mat[0].length === 2 ?
  Math.round(mat[0][1] / mat[0][0])
  : solve(reduce(mat))

swap = (arr, n) => [elim(arr, n), ...rest(arr, n)]

linPro = mat =>
  mat.length >= mat[0].length - 1 &&
  makeArray(mat[0].length - 1).map(
    i => mat.map(j => swap(j, i))
  ).map(solve).reverse()

linPro([
  [1, 1, 50],
  [0.1, 0.6, 15]
]) // get [30, 20]

linPro([
  [5,-2,-4, 3],
  [3, 3, 2,-3],
  [-2,5, 3, 3],
]) // get [-1, 2, -3]

linPro([
  [5, 7, 9, -1, 67],
  [1, 9, 6, -5, 3],
  [-5, -6, 1, -2, -33],
  [-7, -4, -5, -1, -64],
]) // get [3, 1, 6, 9]
/*---------------------------------------------------------------------------------------*/

probMaker = num => withAs(
  makeArray(num).map(randomize(1)),
  ranVar => makeArray(num).map(i => withAs(
    makeArray(num).map(i => Math.random()),
    coef => [...coef, sum(
      coef.map((j, k) => j * ranVar[k])
    )]
  ))
)

probMaker(3)
/* get random matrix [
  [5,-2,-4, 3],
  [3, 3, 2,-3],
  [-2,5, 3, 3],
] */

linPro(probMaker(3)) // get [-1, 2, -3]
// ^ now up to 10 variables
/*---------------------------------------------------------------------------------------*/

parabolRegress = (x, y) => withAs(linPro([
  [x.length, sum(x), powSum(2, x), sum(y)],
  [
    sum(x), powSum(2, x), powSum(3, x),
    sum(x.map((i, j) => i * y[j]))
  ], [
    powSum(2, x), powSum(2, x), powSum(2, x),
    sum(x.map((i, j) => i * i * y[j]))
  ]
]), res => ({a: res[0], b: res[1], c: res[2]}))

parabolRegress(
  [1, 2, 3, 5, 6, 7, 9, 10],
  [4, 6, 7, 9, 8, 7, 4, 3]
) // get {a: 1.89, b: 2.48, c: -0.24}

parabolRegPred = (equ, x) =>
  equ.a + equ.b * x + equ.c * x * x

parabolRegPred({a: 1.89, b: 2.48, c: -0.24}, 5) // get 8.29
/*---------------------------------------------------------------------------------------*/

descPack = (x, y) => ({
  basic: {
    length: {x: x.length, y: y.length},
    min: {x: Math.min(...x), y: Math.min(...y)},
    max: {x: Math.max(...x), y: Math.max(...y)}
  },
  central: {
    mean: {x: mean(x), y: mean(y)},
    median: {x: median(x), y: median(y)},
    mode: {x: mode(x), y: mode(y)},
  },
  distribution: {
    freqDist: {x: distFreq(x), y: distFreq(y)},
    distRelative: {
      x: distRelative(distFreq(x)),
      y: distRelative(distFreq(y))
    },
    distCumulative: {
      x: distCumulative(distFreq(x)),
      y: distCumulative(distFreq(y))
    }
  },
  dispersion: {
    devMean: {x: devMean(x), y: devMean(y)},
    variance: {x: variance(x), y: variance(y)},
    stanDev: {x: stanDev(x), y: stanDev(y)}
  },
  skewness: {
    skewMod: {x: skewMod(x), y: skewMod(y)},
    skewMed: {x: skewMed(x), y: skewMed(y)},
    skewMom: {x: skewMom(x), y: skewMom(y)},
    skewBow: {
      x: skewBow(fractile(4, 1, x), fractile(4, 2, x), fractile(4, 3, x)),
      y: skewBow(fractile(4, 1, y), fractile(4, 2, y), fractile(4, 3, y))
    }
  },
  kurtosis: {
    kurtMom: {x: kurtMom(x), y: kurtMom(y)},
    kurtPer: {
      x: kurtPer(fractile(4, 1, x), fractile(4, 3, x), fractile(100, 10, x), fractile(100, 90, x)),
      y: kurtPer(fractile(4, 1, y), fractile(4, 3, y), fractile(100, 10, y), fractile(100, 90, y))
    }
  },
  zScores: {x: zConvert(x), y: zConvert(y)} 
})

descPack(
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 11],
  [11, 12, 13, 14, 15, 16, 17, 18, 19, 19]
) // get all specified results
