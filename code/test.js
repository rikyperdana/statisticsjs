var
_ = require('lodash'), // hanya jika pakai nodejs
withThis = (obj, cb) => cb(obj),
get = prop => obj => obj[prop],
add = array => array.reduce((acc, inc) => acc + inc),
sub = array => array.reduce((acc, inc) => acc - inc),
mul = array => array.reduce((acc, inc) => acc * inc),
pow = asc => num => Math.pow(num, asc),
range = array => Math.max(...array) - Math.min(...array),
between = (low, middle, high) =>
  (low <= middle) && (middle <= high),
classes = array => Math.round(1 + (3.3 * Math.log10(array.length))),
interval = array => Math.round(range(array) / classes(array)),
makeArray = num => [...Array(num).keys()], // generate [0, 1, 2, ...num]
sort = array => array.sort((a, b) => a - b),

/*---------------------------------------------------------------------------------------*/

mean = array => add(array) / array.length,
ors = array => array.find(Boolean)

median = array => withThis(
  array.sort((a, b) => a - b),
  sorted => ors([
    sorted.length === 1 && sorted[0],
    sorted.length === 2 && add(sorted) / 2,
  ]) || median(sorted.slice(1, sorted.length - 1))
)

median([2, 1, 2, 3]) // result: 2

/*----------------------------------------------------------------*/

distFreq = array => withThis({
  m: Math.min(...array), i: interval(array)
}, ({m, i}) =>
  makeArray(classes(array))
  .map(j => withThis({
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

distFreq(data) // call the function

/* // get the result
[
  {"bot": 65, "top": 67, "fre": 3  },
  {"bot": 68, "top": 70, "fre": 6  },
  {"bot": 71, "top": 73, "fre": 12 },
  {"bot": 74, "top": 76, "fre": 13 },
  {"bot": 77, "top": 79, "fre": 4  },
  {"bot": 80, "top": 82, "fre": 2  }
]  */

/*---------------------------------------------------------------------------------------*/

distLength = dist => add(dist.map(get('fre')))

/*---------------------------------------------------------------------------------------*/

distRelative = (dist, percent) => dist.map(
  i => Object.assign(i, {
    rel: i.fre / add(dist.map(get('fre')))
    * (percent ? 100 : 1)
  })
)

distRelative(distFreq(data)) // with decimal
/*  // get the result
[
  {"bot": 65, "top": 67, "fre": 3,  "rel": 0.075 },
  {"bot": 68, "top": 70, "fre": 6,  "rel": 0.15  },
  {"bot": 71, "top": 73, "fre": 12, "rel": 0.3   },
  {"bot": 74, "top": 76, "fre": 13, "rel": 0.325 },
  {"bot": 77, "top": 79, "fre": 4,  "rel": 0.1   },
  {"bot": 80, "top": 82, "fre": 2,  "rel": 0.05  }
]  */

distRelative(distFreq(data), true) // with percentage
/*  // get the result
[
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
    cumA: inc.fre + add([0, ...acc.map(get('fre'))]),
    cumD: sub([
      add(dist.map(get('fre'))),
      add([0, ...acc.map(get('fre'))]),
    ])
  })],
[])

distCumulative(distFreq(data)) // call the function
/* // get the result
[
  {"bot": 65, "top": 67, "fre": 3,  "cumA": 3,  "cumD": 40 },
  {"bot": 68, "top": 70, "fre": 6,  "cumA": 9,  "cumD": 37 },
  {"bot": 71, "top": 73, "fre": 12, "cumA": 21, "cumD": 31 },
  {"bot": 74, "top": 76, "fre": 13, "cumA": 34, "cumD": 19 },
  {"bot": 77, "top": 79, "fre": 4,  "cumA": 38, "cumD": 6  },
  {"bot": 80, "top": 82, "fre": 2,  "cumA": 40, "cumD": 2  }
] */

/*---------------------------------------------------------------------------------------*/

distMean = dist => add(dist.map(
  i => (i.bot + (
    (i.top - i.bot) / 2
  )) * i.fre
)) / add(dist.map(get('fre')))

distMean(distFreq(data)) // result 73.125

/*---------------------------------------------------------------------------------------*/

distMedian = dist => withThis(
  distCumulative(dist), cumul => withThis(
    dist[dist.length - 1].cumA, length => withThis(
      dist.find(i => i.cumA >= length / 2),
      medClass => (medClass.bot - 0.5) + (
        (length/2 - cumul.find(
          i => i.top === medClass.bot - 1
        ).cumA) / medClass.fre
      ) * (medClass.top - medClass.bot + 1)
    )
  )
)

distMedian(distFreq(data)) // result 73.25

/*---------------------------------------------------------------------------------------*/

mode = array => +_.toPairs(array.reduce(
  (acc, inc) => _.assign(acc, {
    [inc]: acc[inc]+1 || 1
  })
, {}))
.sort((a, b) => b[1] - a[1])
[0][0],

distMode = dist => withThis(
  dist.reduce((acc, inc) =>
    inc.fre > acc.fre ? inc : acc
  ), mostFre => withThis({
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

mode(data) // result 74
distMode(distFreq(data)) // 73.8

/*---------------------------------------------------------------------------------------*/

randomize = digits => x => Math.round(
  Math.random() * Math.pow(10, digits)
)

randomize(5)() // get 92836

distFreq(makeArray(100).map(randomize(2))) // call this
/*  // get the result
[   // shall be abnormally distributed with utmost certainty
  {"bot": 1,  "top": 12, "fre": 10 },
  {"bot": 13, "top": 24, "fre": 5  },
  {"bot": 25, "top": 36, "fre": 17 },
  {"bot": 37, "top": 48, "fre": 12 },
  {"bot": 49, "top": 60, "fre": 17 },
  {"bot": 61, "top": 72, "fre": 13 },
  {"bot": 73, "top": 84, "fre": 15 },
  {"bot": 85, "top": 96, "fre": 7  }
] */

/*---------------------------------------------------------------------------------------*/

fractile = (parts, nth, array) => withThis(
  (nth * (array.length + 1) / parts),
  decimal => withThis(Math.floor(decimal),
    even => withThis(sort(array),
      sorted => sorted[even - 1] + (
        (decimal - even) * (
          sorted[even] - sorted[even - 1]
        )
      )
    )
  )
)

fractile(4, 1, data) // 1st le is 71
fractile(10, 3, data) // 3rd Decile is 71.3
fractile(100, 82, data) // 82nd Percentile is 75.62

/*---------------------------------------------------------------------------------------*/

distFractile = (parts, num, dist) => withThis(
  distCumulative(dist).reduce(
    (acc, inc) => inc.cumA > acc.cumA ? inc : acc
  ), tail => withThis(
    distCumulative(dist).find(
      i => i.cumA >= (num / parts * tail.cumA)
    ), qClass =>
      (qClass.bot - 0.5) + (
        (
          (num / parts * tail.cumA) -
          (qClass.cumA - qClass.fre)
        ) / qClass.fre
      ) * (qClass.top - qClass.bot + 1)
  )
)

distFractile(4, 1, distFreq(data)) // 1st Quartile is 70.75
distFractile(4, 2, distFreq(data)) // 2nd Quartile is 73.25
distFractile(10, 5, distFreq(data)) // 5th Decile is 73.25
distFractile(100, 50, distFreq(data)) // 50th Percentile is 73.25

/*---------------------------------------------------------------------------------------*/

meanGeometric = array =>
  pow(1 / array.length)(mul(array))

meanGeometric([2, 4, 8, 16, 32]) // 8

/*---------------------------------------------------------------------------------------*/

meanGrowth = (pt, po, t) =>
  (Math.pow((pt / po), 1 / t) - 1) * 100

predictGrowth = (xbar, po, t) =>
  po * Math.pow((1 + (xbar / 100)), t)

/*----------------------------------------------------------------*/

distRange = dist =>
  (dist[dist.length - 1].top + 0.5) -
  (dist[0].bot - 0.5)

/*---------------------------------------------------------------------------------------*/

devMean = array => withThis(
  mean(array), meanVal => add(
    array.map(i => i - meanVal)
         .map(Math.abs)
  ) / array.length
)

/*----------------------------------------------------------------*/

distDevMean = dist => withThis(
  distMean(dist), meanVal => add(
    dist.map(i => i.fre * Math.abs(
      (i.bot + ((i.top - i.bot) / 2)) - meanVal
    ))
  ) / add(dist.map(get('fre')))
)

distDevMean(distFreq(data)) // get 2.98125

/*---------------------------------------------------------------------------------------*/

variance = array => withThis(
  mean(array), meanVal => add(
    array.map(i => i - meanVal)
         .map(pow(2))
  ) / (array.length - (
    array.length > 30 ? 0 : 1
  ))
)

variance(data) // get 13.069375

/*---------------------------------------------------------------------------------------*/

distVariance = dist => withThis(
  distMean(dist), meanVal => add(
    dist.map(i => i.fre * pow(2)(
      (i.bot + ((i.top - i.bot) / 2)) - meanVal
    ))
  ) / distLength(dist) - (
    distLength(dist) > 30 ? 0 : 1
  )
)

distVariance(distFreq(data)) // get 13.359375

/*---------------------------------------------------------------------------------------*/

stanDev = pow(1/2)

stanDev(variance(data)) // get 3.6151
stanDev(distVariance(distFreq(data))) // get 3.6550

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
  stanDev(variance(array)),

distSkewMod = dist =>
  (distMean(dist) - distMode(dist)) /
  stanDev(distVariance(dist))

skewMod(data) // get -0.2558
distSkewMod(distFreq(data)) // get -0.1846

/*---------------------------------------------------------------------------------------*/

skewMed = array =>
  (mean(array) - median(array))
  * 3 / stanDev(variance(array))

distSkewMed = dist =>
  (distMean(dist) - distMedian(dist))
  * 3 / stanDev(distVariance(dist))

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

skewMom = array => withThis(
  mean(array), meanVal => add(
    array.map(i => i - meanVal)
    .map(Math.abs).map(pow(3))
  ) / array.length
  / pow(3)(stanDev(variance(array)))
)

distSkewMom = dist => withThis(
  {
    meanVal: distMean(dist),
    midVal: i => i.bot + ((i.top - i.bot) / 2)
  }, ({meanVal, midVal}) => add(
    dist.map(i => i.fre * pow(3)(
      midVal(i) - meanVal
    ))
  ) / distLength(dist)
  / pow(3)(stanDev(distVariance(dist)))
)

skewMom(data) // get 1.6715
distSkewMom(distFreq(data)) // get 0.0013

/*---------------------------------------------------------------------------------------*/

kurtMom = array => withThis(
  mean(array), meanVal => add(
    array.map(i => i - meanVal)
    .map(Math.abs).map(pow(4))
  ) / array.length
  / pow(4)(stanDev(variance(array)))
)

distKurtMom = dist => withThis(
  {
    meanVal: distMean(dist),
    midVal: i => i.bot + ((i.top - i.bot) / 2)
  }, ({meanVal, midVal}) => add(
    dist.map(i => i.fre * pow(4)(
      midVal(i) - meanVal
    ))
  ) / distLength(dist)
  / pow(4)(stanDev(distVariance(dist)))
)

kurtMom(data) // get 3.1558
distKurtMom(distFreq(data)) // get 2.7454

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

zConvert = array => withThis(
  {m: mean(array), sd: stanDev(variance(array))},
  ({m, sd}) => array.map(i => (i - m) / sd)
)

zConvert([5, 4, 8, 7, 1]) // get [0, -0.365, 1.095, 0.73, -1.46]

/*---------------------------------------------------------------------------------------*/

variation = (a, b) => a / b * 100

variation(
  stanDev(variance(data)), mean(data)
) // result 4.9471899
variation(
  stanDev(distVariance(distFreq(data))),
  distMean(distFreq(data))
) // result 4.9983
variation(range(data), mean(data)) // result 23.263
variation(
  distRange(distFreq(data)),
  distMean(distFreq(data))
) // result 24.61538
variation(iQR(data), median(data)) // result 5.4794
variation(
  distIQR(distFreq(data)),
  distMedian(distFreq(data))
) // result 6.58965

/*---------------------------------------------------------------------------------------*/
