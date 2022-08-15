var fileName;
var fileContent;
var fileLines;
var fileHeader;

const totalByMonth = {};
const myStocksTotal = {};

function stockAdding(ticker, value, name, numbShares){
    if(myStocksTotal.hasOwnProperty(ticker)){
        myStocksTotal[ticker]['Total'] += parseFloat(value);
        myStocksTotal[ticker]['Number of Shares'] = numbShares;
    }
    else {
        let newObject = {
            'Total': parseFloat(value),
            'Name': name,
            'Number of Shares': numbShares
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
                stockAdding(data[tickerIndexInData], data[totalIndexInData], data[nameIndexInData], data[numberOfSharesIndexInData]);
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

function createHtmlTableDividensByMonth(totalByMonth){
    var table = $('<table></table>');
    const row = $('<tr></tr>');
    const monthColumn = $('<td></td>').text("Month");
    row.append(monthColumn);
    const valueColumn = $('<td></td>').text("Total Value");
    row.append(valueColumn);
    table.append(row);

    Object.entries(totalByMonth).forEach(function(elementKey){
        const row = $('<tr></tr>');
        const keyToTable = $('<td></td>').text(("" + elementKey[0]));
        row.append(keyToTable);
        const valueToTable = $('<td></td>').text(("" + elementKey[1].toFixed(2)));
        row.append(valueToTable);
        table.append(row);
    });
    $('#tableContainerDividends').append(table);
}

function createStockTable(myStocksTotal){
    var table = $('<table></table>');
    const row = $('<tr></tr>');
    const monthColumn = $('<td></td>').text("Stock");
    row.append(monthColumn);
    const valueColumn = $('<td></td>').text("Total Value");
    row.append(valueColumn);
    const nameColumn = $('<td></td>').text("Name");
    row.append(nameColumn);
    const numbSharesColumn = $('<td></td>').text("Number of shares");
    row.append(numbSharesColumn);
    table.append(row);

    Object.entries(myStocksTotal).forEach(function(elementKey){
        const row = $('<tr></tr>');
        const keyToTable = $('<td></td>').text(("" + elementKey[0]));
        row.append(keyToTable);
        const valueToTable = $('<td></td>').text(("" + elementKey[1]['Total'].toFixed(2)));
        row.append(valueToTable);
        const nameToTable = $('<td></td>').text(("" + elementKey[1]['Name']));
        row.append(nameToTable);
        const numbOfSharesToTable = $('<td></td>').text(("" + elementKey[1]['Number of Shares']));
        row.append(numbOfSharesToTable);
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

function createBarChart(totalByMonth){
    let barChartLocation = document.getElementById('barChartContainer');
    let year2022 = createYearSum(totalByMonth, '2022');
    

    var trace1 = {
        x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        y: year2022,
        type: 'bar',
        name: 'Year 2022',
        marker: {
          color: 'rgb(49,130,189)',
          opacity: 0.7,
        }
      };
      0.46,1.01,0.61,0.55,2.44,0.85,2.54,2.79,1.87,3.84

      // Hard code values for year 2021
      var trace2 = {
        x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        y: [0, 0, 0.46,1.01,0.61,0.55,2.44,0.85,2.54,2.79,1.87,3.84],
        type: 'bar',
        name: 'Year 2021',
        marker: {
          color: 'rgb(255,128,0)',
          opacity: 0.5
        }
      };
    
      var data = [trace1, trace2];

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

function checkFutureEarnings(totalByMonth){
    let year2022 = createYearSum(totalByMonth, '2022');

    let x = [1,2,3,4,5,6,7];
    year2022.pop();
    let y = year2022.map(parseFloat);

    let lr = linearRegression(y,x);

    let newValues = [];
    newValues.push(lr['slope']*32 + lr['intercept']);

    console.log(newValues);
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
            createBarChart(totalByMonth);

            checkFutureEarnings(totalByMonth);

            createStockTable(myStocksTotal);
            
            console.log("The file: " + fileHeader);
            console.log(totalByMonth);
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