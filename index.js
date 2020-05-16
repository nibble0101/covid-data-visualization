/*
   There is no  data for Somaliland, Greenland, Antarctica, North Korea and  Turkmenistan
*/

const urlMapData = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
const urlConfirmed = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv';
const urlDeaths = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv';
const urlRecovered = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv';
const urlCountryCodes = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/UID_ISO_FIPS_LookUp_Table.csv';



const graphParams = {
        width: 900,
        height: 400,
        padTop: 50,
        padBottom: 50,
        padLeft: 50,
        padRight: 50,
     };
const {
    width,
    height, 
    padTop,
    padBottom,
    padLeft,
    padRight
   } = graphParams;
const legendParams = {
                   width: 200,
                   height: 20
               }
const formatDate = d3.timeFormat("%B %d, %Y")
const formatDateTime = d3.timeFormat("%B %d, %Y  %H:%M:%S %p")
const dateToday = new Date();
const body = d3.select('body')
             body.append('h1')
                 .attr('class', 'main-header')
                 .text('Covid-19 World Statistics')
             body.append('h2')
                 .attr('class', 'sub-header')
                 .text('Confirmed Cases')  
const toolTip = body.append('div')
                    .attr('class', 'tooltip')
const svg = body.append('svg')
                .attr('width', width + padLeft + padRight)
                .attr('height', height + padTop + padBottom)
                
const colorScale = d3.scaleSequential()
                    
const projection = d3.geoNaturalEarth1()
                     .scale(150)
                     
                     
const pathGenerator = d3.geoPath().projection(projection);
svg.append('path')
   .attr('class', 'sphere')
   .attr('d', pathGenerator({type: 'Sphere'}))


function mouseoverHandler(){
   d3.select(this).style('fill', '#303145')
   const name = d3.select(this).attr('name');
   const toolTip = d3.select('.tooltip');
   var data = d3.select(this).attr('data');
   data = JSON.parse(data);   
   if(data === null){
      toolTip.append('h2')
             .text(name)
      toolTip.append('div')
             .text('Date: ' + formatDate(dateToday))
      toolTip.append('div')
             .text('No data available')
   
      toolTip.style('opacity', '1')
      toolTip.style('top', d3.event.pageY + 'px')
      toolTip.style('left', d3.event.pageX - 200 + 'px')
      
   }else{
            toolTip.append('h2')
                   .text(name)
            toolTip.append('div')
                   .attr('class', 'wrapper-1')
            d3.select('.wrapper-1')
              .append('span')
              .text('Date: ')
              .style('color', '#6ed6ef')
            d3.select('.wrapper-1')
              .append('span')
              .text(formatDate(dateToday))
            toolTip.append('div')
                   .attr('class', 'wrapper-2')
            d3.select('.wrapper-2')
              .append('span')
              .text('Cases: ')
              .style('color', '#6ed6ef')
            d3.select('.wrapper-2')
              .append('span')
              .text(d3.format(',')(data.data.cases))
            toolTip.append('div')
                   .attr('class', 'wrapper-3')
            d3.select('.wrapper-3')
              .append('span')
              .text('Deaths: ')
              .style('color', '#6ed6ef')
            d3.select('.wrapper-3')
              .append('span')
              .text(d3.format(',')(data.data.deaths))
            toolTip.append('div')
                   .attr('class', 'wrapper-4')
            d3.select('.wrapper-4')
              .append('span')
              .text('Recoveries: ')
              .style('color', '#6ed6ef')
            d3.select('.wrapper-4')
              .append('span')
              .text(d3.format(',')(data.data.recoveries))
            toolTip.style('opacity', '1')
            toolTip.style('top', d3.event.pageY + 'px')
            toolTip.style('left', d3.event.pageX - 200 + 'px')


   }
        

}
function mouseoutHandler(){
   const data = JSON.parse(d3.select(this).attr('data'))
   var color;
   if(!data){
      color = '#947b3cb5';
   }else{
      color = colorScale(+data.data.cases)
   }
   d3.select(this).style('fill', color);
   const toolTip = d3.select('.tooltip');
   toolTip.style('opacity', '0')
   toolTip.select('h2').remove();
   toolTip.selectAll('div')
          .remove()
}


       
const promises = Promise.all(
                    [
                      d3.json(urlMapData),
                      d3.csv(urlConfirmed),
                      d3.csv(urlDeaths), 
                      d3.csv(urlRecovered),
                      d3.csv(urlCountryCodes)
                     
                     ]
                     ).then(
                  ([mapData, confirmed, death, recovered, codes]) => {
                     const countries = topojson.feature(mapData, mapData.objects.countries);
                     const confirm = confirmed.columns
                     const date = confirm[confirm.length - 1]
                    



                     function clean(arr, variableName){
                        const obj = {}
                        arr.forEach(val => {
                           const country = val['Country/Region']
                           if(obj[country] === undefined){
                              obj[country] = {[variableName]: +val[date]}
                              
                           }else{
                              obj[country][variableName] += (+val[date])
                              
                           }
                        })
                        return obj
                     }
                     const cleanCodes = (arr) => {
                        const obj = {};
                        arr.forEach(val => {
                           const country = val['Country_Region'];
                           if(!obj[country]){
                               obj[country] = {'country': country, 'id': val['code3']}
                           }
                        })
                        return Object.values(obj)
                     }
                     const confirmedCases = clean(confirmed, 'cases')
                     const confirmedDeaths = clean(death, 'deaths')
                     const confirmedRecoveries = clean(recovered, 'recoveries')
                     const cleanCode = cleanCodes(codes);
                     const data = [];
                     
                     const extremeConfirmedCases = {
                                              min: 0,
                                              max: 0
                                           }
                     cleanCode.forEach( (value, index) => {
                         const obj = {}
                         const country = value['country']
                         if( 
                            confirmedCases[country] && 
                            confirmedDeaths[country] && 
                            confirmedRecoveries[country]
                            ){
                              obj['country'] = country
                              obj['id'] = value['id'].padStart(3, '0')
                              obj['date'] = date
                              obj['data'] = {
                                              ...confirmedCases[country],
                                              ...confirmedRecoveries[country],
                                              ...confirmedDeaths[country]
                                           }
                              const {cases} = confirmedCases[country]
                              const  {min, max} = extremeConfirmedCases
                              if(!index){
                                 extremeConfirmedCases.min = min
                                 extremeConfirmedCases.max = max
                              }else{
                                 if(cases > max){
                                    extremeConfirmedCases.max = cases
                                 }
                                 if(cases < min){
                                    extremeConfirmedCases.min = cases
                                 }

                              }
                           }
                         data.push(obj)
                     })
                   
                     

                     // Defines Color Scale

                  
                    const{min, max} = extremeConfirmedCases
                    colorScale.domain([min, max])
                              .interpolator(d3.interpolatePiYG)
                       
                    //  Legend code
                     
                  //   const legend = svg.append('g')
                  //   const {width:legendWidth, height:legendHeight} = legendParams
                  //   const widthRect = legendWidth/countries.features.length 
                  //   const xScale = d3.scaleLinear()
                  //                    .domain([min, max])
                  //                    .range([0, legendWidth])
                  //   const xAxis = d3.axisBottom()
                  //                   .scale(xScale)
                  //                   .tickValues([min, max/4, max/2, 0.75 * max, max])
                  //          legend.append('g')
                  //                .attr('transform', `translate( 0, ${legendHeight})`)
                  //                .call(xAxis)
                    
                   const paths = svg.selectAll('path')
                                    .data(countries.features)
                                    .enter()
                                    .append('path')
                                    .attr('class', 'country')
                                    .attr('d', d => pathGenerator(d))
                                    .attr('map-id', d => d.id)
                                    .attr('name', d => d.properties.name)
                                    .attr('data', (d, i) => {
                                       const mydata = data.find(c => {
                                          return d.id === c.id;
                                       })
                                       if(mydata){

                                          return JSON.stringify(mydata);
                                       }
                                       return undefined;
                                    })
                                    .style('transition', 'fill 500ms linear')
                                    .attr('fill', function(d, i){
                                       const data = d3.select(this).attr('data')
                                       if(!data){
                                          return '#947b3cb5'
                                       }
                                       const cases = (JSON.parse(data)).data.cases
                                       return colorScale(+cases)

                                    })
                                    .on('mouseover', mouseoverHandler)
                                    .on('mouseout', mouseoutHandler)
                  
                        // legend.selectAll('rect')
                        //       .data(countries.features)
                        //       .enter()
                        //       .append('rect')
                        //       .attr('width', widthRect)
                        //       .attr('height', legendHeight)
                        //       .attr('fill', 'red')
                        //       .attr('x', (d, i) => i * widthRect)
                        //       .attr('y', 0)

                  })

body.append('div')
    .attr('class', 'source')
    .append('span')
    .text('Data Source: ')
    .append('a')
    .attr('href', 'https://github.com/CSSEGISandData/COVID-19')
    .text('Johns Hopkins University(CSSE)')

body.append('div')
    .attr('class', 'retrieval-time')
    .append('span')
    .text('Retrieved on: ')
d3.select('.retrieval-time')
  .append('span')
  .text(formatDateTime(dateToday))
    
