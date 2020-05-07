const urlCovidData = 'https://pomber.github.io/covid19/timeseries.json';
const graphParams = {
        width: 800,
        height: 500,
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

const body = d3.select('body');
const svg = body.append('svg')
                .attr('width', width + padLeft + padRight)
                .attr('height', height + padTop + padBottom)
                