const migrationDataPromise = d3.csv('../data/un-migration/Table 1-Table 1.csv', parseMigrationData)
	.then(data => data.reduce((acc,v) => acc.concat(v), []));
const countryCodePromise = d3.csv('../data/un-migration/ANNEX-Table 1.csv', parseCountryCode)
	.then(data => new Map(data));
const metadataPromise = d3.csv('../data/country-metadata.csv', parseMetadata);

Promise.all([
		migrationDataPromise,
		countryCodePromise,
		metadataPromise
	])
	.then(([migration, countryCode, metadata]) => {

		console.log(migration);
		console.log(countryCode);
		console.log(metadata);
		//Convert metadata to a map
		const metadata_tmp = metadata.map(a => {
			return [a.iso_num, a]
		});
		const metadataMap = new Map(metadata_tmp);

		const migrationAugmented = migration.map(d => {

			const origin_code = countryCode.get(d.origin_name);
			const dest_code = countryCode.get(d.dest_name);

			d.origin_code = origin_code;
			d.dest_code = dest_code;

			//Take the 3-digit code, get metadata record
			const origin_metadata = metadataMap.get(origin_code);
			const dest_metadata = metadataMap.get(dest_code);

			// if(!origin_metadata){
			// 	console.log(`lookup failed for ` + d.origin_name + ' ' + d.origin_code);
			// }
			// if(!dest_metadata){
			// 	console.log(`lookup failed for ${d.origin_name} ${d.origin_code}`)
			// }
			if(origin_metadata){
				d.origin_subregion = origin_metadata.subregion;
			}
			if(dest_metadata){
				d.dest_subregion = dest_metadata.subregion;
			}

			return d;

		});
		
		console.log(migrationAugmented);
		
		// //migration filtered to get all the data coming out of USA with code of 840
		// const migrationFiltered = migrationAugmented
		// 	.filter(function(d){
		// 		return d.origin_code == '840'
		// 	});
		// //grouping the filtered data by year using d3.nest
		// const data = d3.nest()
		// 	.key(d=>d.year)
		// 	.entries(migrationFiltered)

		// 	.map(group=>{
		// 		return {
		// 			year: +group.key,
		// 			total:d3.sum(group.values, d=>d.value),
		// 			max:d3.max(group.values, d=>d.value),
		// 			min:d3.min(group.values, d=>d.value) //the arrary of roughly 200 of inidividual country 
		// 		}
		// 	console.log(data);
		// 	})

		// us to any country in the world countrycode 840 
		const usData = d3.nest()
			.key(d=>d.year)
			.entries(migrationAugmented.filter(function(d){return d.origin_code == '840'}))//filtering USA
			.map(group => {
				return {
					year: +group.key, //converting into numbers
					total: d3.sum(group.values, d=>d.value),

				}
			});
			console.log(usData);

			// lineChart(
			// 	data,//This is the US migration data 
			// 	d3.select('.module').node()//<div> element with class "module" in the index.html 
			// )	

			const subregionData = d3.nest()
				.key(d => d.dest_subregion)
				.key(d => d.year)
				.rollup(values => d3.sum(values, d=>d.value))//rollup is designed to add all values at the lowest level
				.entries(migrationAugmented)

			d3.select('.main')
				.selectAll('.chart')//zero 
				.data(subregionData)
				.enter()
				.append('div')
				.attr('class','chart')
				.each(function(d){
					// console.group();
					// console.log(this); //dom
					// console.log(d); //data 
					// console.groupEnd();

				lineChart(d.values, this)
				});

		})

//draw line chart based on a serial xy data
//function signature: waht argument are expected, how many and what they should look like 
//DOM elements and data are the inputs of the chart 
function lineChart(data,rootDOM){
	console.log('Line chart');
	   console.log(data);
	   console.log(rootDOM);

	   data.pop();

	   const W = rootDOM.clientWidth;
	   const H = rootDOM.clientHeight;
	   const margin = {t:32, r:32, b:64, l:64};
	   const innerWidth = W - margin.l - margin.r;
	   const innerHeight = H - margin.t - margin.b;

	   const scaleX = d3.scaleLinear().domain([1985,2020]).range([0, innerWidth]);
	   const scaleY = d3.scaleLinear().domain([0, 25000000]).range([innerHeight, 0]);

	   //take array of xy values, and produce a shape attribute for <path> element
	   const lineGenerator = d3.line()
	       .x(d => scaleX(+d.key))
	       .y(d => scaleY(d.value)); //function
	   const areaGenerator = d3.area()
	       .x(d => scaleX(+d.key))
	       .y0(innerHeight)
	       .y1(d => scaleY(d.value));

	   const axisX = d3.axisBottom()
	       .scale(scaleX)
	       .tickFormat(function(value){ return "'"+String(value).slice(-2)})

	   const axisY = d3.axisLeft()
	       .scale(scaleY)
	       .tickSize(-innerWidth)
	       .ticks(3)

	   const svg = d3.select(rootDOM)
	       .append('svg')
	       .attr('width', W)
	       .attr('height', H);
	   const plot = svg.append('g') //group 
	       .attr('class','plot')
	       .attr('transform', `translate(${margin.l}, ${margin.t})`); //${} - replace the whole thing within the symbol into numbers

	   plot.append('path')
	       .attr('class','line')
	       .datum(data)//join the data 
	       //some visual shape i.e. geometry, "d"
	       .attr('d', data => lineGenerator(data))
	       .style('fill','none')
	       .style('stroke','#333')
	       .style('stroke-width','2px')

	   plot.append('path')
	       .attr('class','area')
	       .datum(data)
	       .attr('d', data => areaGenerator(data))
	       .style('fill-opacity',0.03)

	   plot.append('g')
	       .attr('class','axis axis-x')
	       .attr('transform',`translate(0, ${innerHeight})`)
	       .call(axisX)

	   plot.append('g')
	       .attr('class','axis axis-y')
	       .call(axisY);

}

//Utility functions for parsing metadata, migration data, and country code
function parseMetadata(d){
	return {
		iso_a3: d.ISO_A3,
		iso_num: d.ISO_num,
		developed_or_developing: d.developed_or_developing,
		region: d.region,
		subregion: d.subregion,
		name_formal: d.name_formal,
		name_display: d.name_display,
		lngLat: [+d.lng, +d.lat]
	}
}

function parseCountryCode(d){
	return [
		d['Region, subregion, country or area'],
		d.Code.padStart(3, '0')
	]
}

function parseMigrationData(d){
	if(+d.Code >= 900) return;

	const migrationFlows = [];
	const dest_name = d['Major area, region, country or area of destination'];
	const year = +d.Year
	
	delete d.Year;
	delete d['Sort order'];
	delete d['Major area, region, country or area of destination'];
	delete d.Notes;
	delete d.Code;
	delete d['Type of data (a)'];
	delete d.Total;

	for(let key in d){
		const origin_name = key;
		const value = d[key];

		if(value !== '..'){
			migrationFlows.push({
				origin_name,
				dest_name,
				year,
				value: +value.replace(/,/g, '')
			})
		}
	}

	return migrationFlows;
}