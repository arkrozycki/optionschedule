
let monthlyVestPercent = 0.02083999
let optCounter = 1

// ////////////////////////////////////////////////////////
function createResultsTable (myOpts, year) {
  let html = '<table>'
  html += getTableHeaders(year)

  for (let x = 0; x < myOpts.length; x++) {
    html += getTableRows((x+1), year, myOpts[x])
  }

  html += getTableMonthlyTotalVested(myOpts, year)
  html += getTableRowTotalIncrease(myOpts, year)
  html += getTableRowTotals(myOpts, year)
  
  html += getTableRowTotalValues(myOpts, year)
  html += getTableRowPercentageIncrease(myOpts, year)
  html += '</table>'

  document.getElementById('results').innerHTML += html
}

// ////////////////////////////////////////////////////////
function getTableHeaders (startingYear) {
  let counter = 0
  let html = '<tr>'
  html += '<th>Grant(s)</th>'
  while (counter < 12) {
    html += '<th>' + (++counter) + '/' + startingYear + '</th>'
  }
  html += '</tr>'
  return html
}

// ////////////////////////////////////////////////////////
function getTableRows (num, year, optData) {
  let counter = 0
  let html = '<tr><td>'+num+'</td>'
  let tableRowTotal = 0
  while (counter < 12) {
    counter++
    let val = computeMonthlyVested(year, counter, optData)
    if (val) {
      tableRowTotal += parseInt(val)
    } else {
      val = '&nbsp;'
    }
    html += '<td align="right">' + val + '</td>'
  }
  html += '</tr>'
  return html
}

// ////////////////////////////////////////////////////////
function getTableMonthlyTotalVested(myOpts, year){
  let counter = 0
  let html = '<tr><td>Total Monthly</td>'

  while (counter < 12) {
    counter++
    let monthTotal = 0
    for(x = 0; x < myOpts.length; x++){
      monthTotal += computeMonthlyVested(year, counter, myOpts[x])
      
    }
    html += '<td align="right" style="background: #e1e1e1;">' + monthTotal + '</td>'
  }
  html += '</tr>'
  return html
}

// ////////////////////////////////////////////////////////
function computeMonthlyVested (year, month, optData) {
  let vestingStartDate = getVestingStartDate(optData.start)
  let vestingEndDate = getVestingEndDate(optData.start)
  let thisDate = new Date(year, month, optData.start.split('/')[1])

  // not vested yet
  if (thisDate < vestingStartDate) return null
  if (thisDate > vestingEndDate) return null

  // options cliff vestment here
  if (thisDate.getYear() == vestingStartDate.getYear() &&
    thisDate.getMonth() == vestingStartDate.getMonth()) {
    return optData.num * 0.25
  }

  return parseInt(optData.num * monthlyVestPercent)
}

// ////////////////////////////////////////////////////////
function computeMonthlyTotalVested (myOpts, year, month) {
  let grandTotal = 0

  for (let x = 0; x < myOpts.length; x++) {
    let vestingStartDate = getVestingStartDate(myOpts[x].start)
    let numOptions = parseInt(myOpts[x].num)
    let vestingEndDate = getVestingEndDate(myOpts[x].start)
    let thisDate = new Date(year, month, myOpts[x].start.split('/')[1])

    if (thisDate.getTime() === vestingStartDate.getTime()) {
      grandTotal += (numOptions * 0.25)
      continue
    }
    // // vesting hasnt started, return 0
    if (thisDate < vestingStartDate) {
      continue
    }

    // subtract anything sold
    if (myOpts[x].sellDate) {
      let dt = myOpts[x].sellDate.split('/')
      let sellDate = new Date(parseInt(dt[2]), dt[0], dt[1])
      if (thisDate >= sellDate) {
        grandTotal = grandTotal - parseInt(myOpts[x].sellAmt)
      }
    }

    if (thisDate > vestingEndDate) {
      grandTotal += numOptions
      continue
    }

    let numberOfMonths = monthDiff(vestingStartDate, thisDate)
    // the 0.35 is for rounding
    let monthlyVestAmt = parseInt(numOptions * monthlyVestPercent)// + 0.35
    let totalMontlyVested = (numberOfMonths * monthlyVestAmt)
    let thisGrantsTotal = parseInt(totalMontlyVested + (numOptions * 0.25))

    grandTotal += thisGrantsTotal
  }

  return grandTotal
}

// ////////////////////////////////////////////////////////
function getTableRowTotalIncrease(myOpts, year){
  let month = 0
  let html = '<tr><td>Monthly x $'+document.getElementById('projectedValue').value+'</td>'

  while (month < 12) {
    month++
    let prevDate = new Date(year, month, 01)
    // console.log(prevDate)
    prevDate.setMonth(prevDate.getMonth() - 1)
    // console.log(year, month, prevDate.getFullYear(), prevDate.getMonth())
    let thisAmt = computeMonthlyTotalVested(myOpts, year, month) * (parseInt(document.getElementById('projectedValue').value)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    let lastAmt = computeMonthlyTotalVested(myOpts, prevDate.getFullYear(), prevDate.getMonth()) * (parseInt(document.getElementById('projectedValue').value)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    let precDiff = ((thisAmt - lastAmt))
    // console.log(thisAmt, lastAmt, precDiff)
    html += '<td align="right" style="background: #eee;">$' +
      precDiff.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') +
      '</td>'
  }

  html += '</tr>'
  return html
}

// ////////////////////////////////////////////////////////
function getTableRowPercentageIncrease(myOpts, year){
  let month = 0
  let html = '<tr><td>Monthly Change</td>'

  while (month < 12) {
    month++
    let prevDate = new Date(year, month, 01)
    // console.log(prevDate)
    prevDate.setMonth(prevDate.getMonth() - 1)
    // console.log(year, month, prevDate.getFullYear(), prevDate.getMonth())
    let thisAmt = computeMonthlyTotalVested(myOpts, year, month) * (parseInt(document.getElementById('projectedValue').value)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    let lastAmt = computeMonthlyTotalVested(myOpts, prevDate.getFullYear(), prevDate.getMonth()) * (parseInt(document.getElementById('projectedValue').value)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    let precDiff = ((thisAmt - lastAmt) / lastAmt) * 100
    // console.log(thisAmt, lastAmt, precDiff)
    html += '<td align="right" style="background: #eee;">' +
      precDiff.toFixed(2) +
      '%</td>'
  }

  html += '</tr>'
  return html
}

// ////////////////////////////////////////////////////////
function getTableRowTotalValues (myOpts, year) {
  let month = 0
  let html = '<tr><td>Vested x $'+document.getElementById('projectedValue').value+'</td>'

  while (month < 12) {
    month++
    html += '<td align="right" style="background: #eee;">$' +
      (computeMonthlyTotalVested(myOpts, year, month) * parseInt(document.getElementById('projectedValue').value)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') +
      '</td>'
  }

  html += '</tr>'
  return html
}

// ////////////////////////////////////////////////////////
function getTableRowTotals (myOpts, year) {
  let month = 0
  let html = '<tr><td>Vested Opts</td>'

  while (month < 12) {
    month++
    html += '<td align="right" style="background: #eee;">' + computeMonthlyTotalVested(myOpts, year, month).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '</td>'
  }

  html += '</tr>'
  return html
}

// ////////////////////////////////////////////////////////
function insertBlankGrant(removeGrantButton){
  let clone = document.getElementById('opt-0').cloneNode(true)
  clone.id = 'opt-' + (optCounter++)
  clone.childNodes[1].innerHTML = 'Grant '+ (optCounter - 1) + '.'
  clone.style.display = 'block'
  if(removeGrantButton){
    clone.removeChild(clone.childNodes[15])
  }
  document.getElementById('opt-outer-container').appendChild(clone)
}

// ////////////////////////////////////////////////////////
function loadExistingOpts(opts){
  for(x = 0; x < opts.length; x++){
    let clone = document.getElementById('opt-0').cloneNode(true)
    clone.id = 'opt-' + (optCounter++)
    clone.childNodes[1].innerHTML = 'Grant '+(optCounter - 1) + '.'
    clone.style.display = 'block'

    clone.childNodes[3].childNodes[2].childNodes[0].value = opts[x].start
    clone.childNodes[5].childNodes[2].childNodes[0].value = opts[x].num
    clone.childNodes[7].childNodes[2].childNodes[0].value = opts[x].strike
    clone.childNodes[11].childNodes[2].childNodes[0].value = opts[x].sellDate
    clone.childNodes[13].childNodes[2].childNodes[0].value = opts[x].sellAmt

    if(x > 0){
      clone.removeChild(clone.childNodes[15])  
    }
    
    document.getElementById('opt-outer-container').appendChild(clone)
  }
}

// ////////////////////////////////////////////////////////
function runSchedule(){
  // gather opts
  let opts = []
  for(let x = 1; x < optCounter; x++){
    let grant = document.getElementById('opt-' + x)
    let startDate = grant.childNodes[3].childNodes[2].childNodes[0].value
    let numOptions = grant.childNodes[5].childNodes[2].childNodes[0].value
    let strikePrice = grant.childNodes[7].childNodes[2].childNodes[0].value
    let sellDate = (grant.childNodes[11].childNodes[2].childNodes[0].value) ? grant.childNodes[11].childNodes[2].childNodes[0].value : null
    let sellAmt = (grant.childNodes[13].childNodes[2].childNodes[0].value) ? grant.childNodes[13].childNodes[2].childNodes[0].value : null
    opts.push({
      start: startDate,
      num: numOptions,
      strike: strikePrice,
      sellDate: sellDate,
      sellAmt: sellAmt
    })
  }

  // save opts to localStorage
  localStorage.setItem('opts', JSON.stringify(opts))

  // get years related to grants
  let year = getEarliestStartYear(opts)
  let lastStartYear = getLastStartYear(opts)

  // clear out any results that might already exist
  document.getElementById('results').innerHTML = ''

  // loop over the year ranges building tables
  while ((year + 1) <= (lastStartYear + 4)) {
    createResultsTable(opts, (year + 1))
    year++
  }
}

// ////////////////////////////////////////////////////////
function main () {
  document.getElementById('todayDate').innerHTML = today()
  document.getElementById('run-schedule').addEventListener('click', runSchedule)

  document.addEventListener('click',function(e){
    if(e.target.id== 'insertGrantButton'){
      insertBlankGrant(true)
    }
  })

  // check if localStorage has previous data
  let opts = localStorage.getItem('opts')
  if(opts){
    loadExistingOpts(JSON.parse(opts))
  } else {
    insertBlankGrant(false)
  }
}

// ////////////////////////////////////////////////////////
function getVestingStartDate (dateStr) {
  // let dt = document.getElementById('opt-1').childNodes[3].childNodes[2].childNodes[0].value.split('/')
  let dt = dateStr.split('/')
  return new Date(parseInt(dt[2]) + 1, dt[0], dt[1])
}

// ////////////////////////////////////////////////////////
function getVestingEndDate (dateStr) {
  // let dt = document.getElementById('opt-1').childNodes[3].childNodes[2].childNodes[0].value.split('/')
  let dt = dateStr.split('/')
  return new Date(parseInt(dt[2]) + 4, dt[0], dt[1])
}

// ////////////////////////////////////////////////////////
function daysInMonth (month, year) {
  return new Date(year, month, 0).getDate()
}

// ////////////////////////////////////////////////////////
function getLastStartYear (opts) {
  let yr = 2000
  for (let x = 0; x < opts.length; x++) {
    let cur = parseInt(opts[x].start.split('/')[2])
    if (cur > yr) {
      yr = cur
    }
  }
  return yr
}

// ////////////////////////////////////////////////////////
function getEarliestStartYear (opts) {
  let yr = 3000
  for (let x = 0; x < opts.length; x++) {
    let cur = parseInt(opts[x].start.split('/')[2])
    if (cur < yr) {
      yr = cur
    }
  }
  return yr
}

// ////////////////////////////////////////////////////////
function today () {
  var today = new Date()
  var dd = today.getDate()
  var mm = today.getMonth() + 1 // January is 0!
  var yyyy = today.getFullYear()

  if (dd < 10) {
    dd = '0' + dd
  }

  if (mm < 10) {
    mm = '0' + mm
  }

  return mm + '/' + dd + '/' + yyyy
}

// ////////////////////////////////////////////////////////
function monthDiff (d1, d2) {
  var months
  months = (d2.getFullYear() - d1.getFullYear()) * 12
  months -= d1.getMonth() + 1
  months += d2.getMonth() + 1
  return months <= 0 ? 0 : months
}


main()
