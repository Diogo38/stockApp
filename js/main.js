var fileName;
var fileContent;
var fileLines;
var fileHeader;

const totalByMonth = {};
const myStocksTotal = {};
const yearsMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const previousYear = yearToAnalyse - 1;

function getMonthFromDate(dateToParse){
	const result1 = dateToParse.split(' ');
	const result2 = result1[0].split('-');
	return parseInt(result2[1]);
}

function stockAdding(ticker, value, name, numbShares, lastDate){
    if(myStocksTotal.hasOwnProperty(ticker)){
		
		//console.log('Ticker :' + ticker + ' the date to be set: ' + myStocksTotal[ticker]['Last date']);
		//console.log('New Date: ' + lastDate);
		
        myStocksTotal[ticker]['Total'] += parseFloat(value);
		if(getMonthFromDate(myStocksTotal[ticker]['Last date']) < getMonthFromDate(lastDate)){
			myStocksTotal[ticker]['Last date'] = lastDate;
			myStocksTotal[ticker]['Last payment'] = parseFloat(value);
			myStocksTotal[ticker]['Number of Shares'] = numbShares;
		}
		
		myStocksTotal[ticker]['Number of payments'] += 1;
    }
    else {
        let newObject = {
            'Total': parseFloat(value),
            'Name': name,
            'Number of Shares': numbShares,
			'Last date': lastDate,
			'Last payment': parseFloat(value),
			'Number of payments': 1
        }
        myStocksTotal[ticker] = newObject;
    }
}

function findDividendAction(fileHeader, fileLines, allTextLines){
    const dividendAction = "dividend";
    let totalIndexInData = fileHeader.findIndex(function(x){return x.toLowerCase().includes('total')});
    let actionIndexInData = fileHeader.findIndex(function(x){return x.toLowerCase().includes('action')});
    let nameIndexInData = fileHeader.findIndex(function(x){return x.toLowerCase().includes('name')});
    let timeIndexInData = fileHeader.findIndex(function(x){return x.toLowerCase().includes('time')});
    let tickerIndexInData = fileHeader.findIndex(function(x){return x.toLowerCase().includes('ticker')});
    let numberOfSharesIndexInData = fileHeader.findIndex(function(x){return x.toLowerCase().includes('no. of shares')}); 

    // Process file for object
    for (var i=1; i<allTextLines.length; i++) {
        var data = allTextLines[i].split(',');
        if (data.length == fileHeader.length) {    
            if(data[actionIndexInData].toLowerCase().includes(dividendAction)){
                const tarr = [data[tickerIndexInData],data[nameIndexInData],data[timeIndexInData],data[totalIndexInData]];
                fileLines.push(tarr);
                stockAdding(data[tickerIndexInData], data[totalIndexInData], data[nameIndexInData], data[numberOfSharesIndexInData],
				data[timeIndexInData]);
            }
        }
    }
}

function extractMonthAndYear(theDate){
    // 19/04/2022 08:39
    let theMonthAndYearPre = theDate.split(' ')[0].split('-');
    return theMonthAndYearPre[1] + "-" + theMonthAndYearPre[0];
}

function processDividendByMonth(fileLines){
    // filter by date
    fileLines.forEach(function(line){
        if(totalByMonth.hasOwnProperty(extractMonthAndYear(line[2]))){
            totalByMonth[extractMonthAndYear(line[2])] += parseFloat(line[3]);
        }
        else {
            totalByMonth[extractMonthAndYear(line[2])] = parseFloat(line[3]);
        }
    });
}

function createColumn(row, columnName, sort) {
	let newColumn;
	if(sort >= 0) {
		newColumn = $('<th onclick="sortTable(' + sort + ')"></th>').text(columnName);
	} else {
		newColumn = $('<th></th>').text(columnName);
	}
	
	return row.append(newColumn);
}
function initializeTable(id){
	const table = $('<table id="'+id+'"></table>');
	return table;
}
function createLine(){
	const row = $('<tr></tr>');
	for(let i = 0; i < arguments.length; i++){
		const keyToTable = $('<td></td>').text(("" + arguments[i]));
		row.append(keyToTable);
	}
	return row;
}

function createHtmlTableDividensByMonth(totalByMonth){
    let tableArray = initializeTable();
	let row = $('<tr></tr>');
	createColumn(row, "Month", -1);
	createColumn(row, "Total Value", -1);
	tableArray.append(row);
	let totalOfTheYear = 0;

    Object.entries(totalByMonth).forEach(function(elementKey){
        const row = createLine(elementKey[0], elementKey[1].toFixed(2))
        tableArray.append(row);
		totalOfTheYear +=  parseFloat(elementKey[1].toFixed(2));
    });
	
	row = createLine("Total of the year", ("" + totalOfTheYear));
	tableArray.append(row);
    $('#tableContainerDividends').append(tableArray[0]);
}

function createStockTable(myStocksTotal){
    let table = initializeTable("createStockTable");
	let row = $('<tr></tr>');
	
	createColumn(row, "Stock" , 0);
	createColumn(row, "Total Value", 1);
	createColumn(row, "Name", 2);
	createColumn(row, "Number of shares", 3);
	createColumn(row, "Last Dividend Payment Date", 4);
	createColumn(row, "Number of payments", 5);
	createColumn(row, "Last payment", 6);
	table.append(row);

    Object.entries(myStocksTotal).forEach(function(elementKey){
        const row = createLine(("" + elementKey[0]),("" + elementKey[1]['Total'].toFixed(2)),
		("" + elementKey[1]['Name']),("" + elementKey[1]['Number of Shares']),("" + elementKey[1]['Last date'])
		, "" + elementKey[1]['Number of payments'], "" + elementKey[1]['Last payment'])
		table.append(row);
	});
    $('#tableContainerStocks').append(table);
}

function createYearSum(totalByMonth, yearToCheck){
    let yearArray = [];
    Object.entries(totalByMonth).forEach(function(elementKey){
        if(elementKey[0].toLowerCase().includes(yearToCheck)){
            yearArray.push(elementKey[1].toFixed(2));
        }
    });
    return yearArray;
}

function createBarChart(totalByMonth, projection){
    let barChartLocation = document.getElementById('barChartContainer');
    let year2023 = createYearSum(totalByMonth, '' + yearToAnalyse);
    
    var trace1 = {
        x: yearsMonths,
        y: year2023,
        type: 'bar',
        name: 'Year ' + yearToAnalyse,
        marker: {
          color: 'rgb(49,130,189)',
          opacity: 0.7,
        }
      };

      var trace2 = {
        x: yearsMonths,
        y: previousYearValueByMonth,
        type: 'bar',
        name: 'Year ' + previousYear,
        marker: {
          color: 'rgb(255,128,0)',
          opacity: 0.5
        }
      };
	  
	  var trace3 = {
        x: yearsMonths,
        y: projection,
        type: 'bar',
        name: 'Projection ' + yearToAnalyse,
        marker: {
          color: 'rgb(144, 238, 144)',
          opacity: 0.5
        }
      };
	
	
      var data = [trace1, trace2, trace3];

      var layout = {
        title: 'Dividend Evolution',
        xaxis: {
          tickangle: -45
        },
        barmode: 'group'
      };
      Plotly.newPlot(barChartLocation, data, layout);
}

function linearRegression(y,x){
    var lr = {};
    var n = y.length;
    var sum_x = 0;
    var sum_y = 0;
    var sum_xy = 0;
    var sum_xx = 0;
    var sum_yy = 0;

    for (var i = 0; i < y.length; i++) {

        sum_x += x[i];
        sum_y += y[i];
        sum_xy += (x[i]*y[i]);
        sum_xx += (x[i]*x[i]);
        sum_yy += (y[i]*y[i]);
    } 

    lr['slope'] = (n * sum_xy - sum_x * sum_y) / (n*sum_xx - sum_x * sum_x);
    lr['intercept'] = (sum_y - lr.slope * sum_x)/n;
    lr['r2'] = Math.pow((n*sum_xy - sum_x*sum_y)/Math.sqrt((n*sum_xx-sum_x*sum_x)*(n*sum_yy-sum_y*sum_y)),2);

    return lr;
}

function checkFutureEarnings(){
    // let presentYear = createYearSum(totalByMonth, '2022');
    
	  //presentYear.pop();
    
	  let w = 0;
    let x = previousYearValueByMonth.map(oink => w++);
    let y = previousYearValueByMonth.map(parseFloat);

    let lr = linearRegression(y,x);

    //let newValues = previousYearValueByMonth.map(oink => 0);
    let newValues = [];
	
	for(let index = 0; index < 12 ; index++){
		// calculating the secon month
		newValues.push(lr['slope']*(index + 13) + lr['intercept'])
	}
	//newValues.push(lr['slope']*13 + lr['intercept']);
	console.log("The slope = " + lr['slope']);
	console.log("The intercept = " + lr['intercept']);
  console.log(newValues);
	return newValues;
}

function isNumeric(str) {
  if (typeof str != "string") return false // we only process strings!  
  return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
         !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

function sortTable(n) {
  var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
  table = document.getElementById("createStockTable");
  switching = true;
  // Set the sorting direction to ascending:
  dir = "asc";
  /* Make a loop that will continue until
  no switching has been done: */
  while (switching) {
    // Start by saying: no switching is done:
    switching = false;
    rows = table.rows;
    /* Loop through all table rows (except the
    first, which contains table headers): */
    for (i = 1; i < (rows.length - 1); i++) {
      // Start by saying there should be no switching:
      shouldSwitch = false;
      /* Get the two elements you want to compare,
      one from current row and one from the next: */
      x = rows[i].getElementsByTagName("TD")[n];
      y = rows[i + 1].getElementsByTagName("TD")[n];
      /* Check if the two rows should switch place,
      based on the direction, asc or desc: */
      if (dir == "asc") {
        if ( !isNumeric(x.innerHTML) && x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
          // If so, mark as a switch and break the loop:
          shouldSwitch = true;
          break;
        }
        else if(parseFloat(x.innerHTML) > parseFloat(y.innerHTML)){
          shouldSwitch = true;
          break;
        }
      } else if (dir == "desc") {
        if ( !isNumeric(x.innerHTML) && x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
          // If so, mark as a switch and break the loop:
          shouldSwitch = true;
          break;
        }
        else if(parseFloat(x.innerHTML) < parseFloat(y.innerHTML)){
          shouldSwitch = true;
          break;
        }
      }
    }
    if (shouldSwitch) {
      /* If a switch has been marked, make the switch
      and mark that a switch has been done: */
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
      // Each time a switch is done, increase this count by 1:
      switchcount ++;
    } else {
      /* If no switching has been done AND the direction is "asc",
      set the direction to "desc" and run the while loop again. */
      if (switchcount == 0 && dir == "asc") {
        dir = "desc";
        switching = true;
      }
    }
  }
}

function readFile(fileToLoad){

    if (fileToLoad) {
        var reader = new FileReader();
        reader.onload = function(fileLoadedEvent) {
            let textFromFileLoaded = fileLoadedEvent.target.result;
            let allTextLines = textFromFileLoaded.split(/\r\n|\n/);
            fileHeader = allTextLines[0].split(',');
            fileLines = [];
            
            findDividendAction(fileHeader, fileLines, allTextLines);
            processDividendByMonth(fileLines);

            createHtmlTableDividensByMonth(totalByMonth);
            const projection = checkFutureEarnings();
			createBarChart(totalByMonth, projection);
            createStockTable(myStocksTotal);
            
            console.log("The file: " + fileHeader);
            console.log(totalByMonth);
			console.log(myStocksTotal);
        };
        reader.readAsText(fileToLoad, 'UTF-8');
      }
}

$(document).ready(function(){
    $('input[type="file"]').change(function(e){
        fileName = e.target.files[0].name;
        fileContent = e.target.files[0];
        alert('The file "' + fileName +  '" has been selected.');
    });

    $( "#fileSubmit" ).click(function() {
        readFile(fileContent);
    });
});