/*
   1. There is a challenge of extracting data for Somaliland 
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

const formatTime = d3.timeFormat("%B %d, %Y");
const body = d3.select('body');
             body.append('h1')
                 .text('Covid-19 World Statistics')
               
const toolTip = body.append('div')
                    .attr('class', 'tooltip')
const svg = body.append('svg')
                .attr('width', width + padLeft + padRight)
                .attr('height', height + padTop + padBottom)
                
 
const projection = d3.geoNaturalEarth1()
                     .scale(150)
                     
                     
const pathGenerator = d3.geoPath().projection(projection);
svg.append('path')
   .attr('class', 'sphere')
   .attr('d', pathGenerator({type: 'Sphere'}))


function mouseoverHandler(){
   d3.select(this).style('fill', '#303145')
   const name = d3.select(this).attr('name');
   const dateToday = new Date();
   const toolTip = d3.select('.tooltip');
   var data = d3.select(this).attr('data');
   data = JSON.parse(data);   
   if(data === null){
      toolTip.append('h2')
             .text(name)
      toolTip.append('div')
             .text('Date: ' + formatTime(dateToday))
      toolTip.append('div')
             .text('No data available')
   
      toolTip.style('opacity', '1')
      toolTip.style('top', d3.event.pageY + 'px')
      toolTip.style('left', d3.event.pageX - 200 + 'px')
      
   }else{
      toolTip.append('h2')
             .text(name)
            toolTip.append('div')
                  .text('Date: ' + formatTime(dateToday))
            toolTip.append('div')
                   .text('Cases: ' + d3.format(',')(data.data.cases))
            toolTip.append('div')
                  .text('Deaths: ' + d3.format(',')(data.data.deaths))
            toolTip.append('div')
                   .text( 'Recoveries: ' + d3.format(',')(data.data.recoveries))
            toolTip.style('opacity', '1')
            toolTip.style('top', d3.event.pageY + 'px')
            toolTip.style('left', d3.event.pageX - 200 + 'px')


   }
        

}
function mouseoutHandler(){
   d3.select(this).style('fill', '#947b3cb5');
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
                     cleanCode.forEach( value => {
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
                             
                           }
                         data.push(obj)
                     })
                    
                   const paths = svg.selectAll('path')
                                    .data(countries.features)
                                    .enter()
                                    .append('path')
                                    .attr('class', 'country')
                                    .attr('d', d => pathGenerator(d))
                                    .attr('map-id', d => d.id)
                                    .attr('name', d => d.properties.name)
                                    .attr('data', d => {
                                       const mydata = data.find(c => {
                                          return d.id === c.id;
                                       })
                                       if(mydata){
                                          return JSON.stringify(mydata);
                                       }
                                       return undefined;
                                    })
                                    .style('transition', 'fill 500ms linear')
                                    .on('mouseover', mouseoverHandler)
                                    .on('mouseout', mouseoutHandler)
                                   

                  })

body.append('div')
    .attr('class', 'footer')
    .append('span')
    .text('Data Source: ')
    .append('a')
    .attr('href', 'https://github.com/CSSEGISandData/COVID-19')
    .text('Johns Hopkins University(CSSE)')
