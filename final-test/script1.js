const trackPromise = d3.csv('trackinfo.csv', parseTrack)
	// .then(data => new Map(data));
const artistPromise = d3.csv('artist.csv', parseArtist);

Promise.all([
		trackPromise,
		artistPromise,
	])
	
	.then(([trackinfo, artist]) => {

		const menu = d3.select(".nav")
                       .append("select");

        menu.selectAll("option")
            .data(artist)
            .enter()
            .append("option")
            .attr("value", d => d.key)
            .html(d=> d.key);

        menu.on("change", function(){

            const year = this.value;

            const data = transform(year,artist);
            
            render(data)

         })

		});
		console.log(musicAugmented);




		//Migration from the US (840) to any other place in the world
		//filter the larger migration dataset to only the subset coming from the US

		//group by subregion
		const yearData = d3.nest()
			.key(d => d.year)
			// .rollup(values => d3.sum(values, d => d.value))
			.entries(musicAugmented);

		console.log(yearData);

		d3.select('.main')
			.selectAll('.chart') //0 
			.data(yearData)
			.enter()
			.append('div')
			.attr('class','chart')
			.each(function(d){

				scatterPlot(
					d.values, //array of 9
					this
				);
			})


//Drawing line chart based on serial x-y data
//Function "signature": what arguments are expected, how many, and what they should look like
function scatterPlot(data, rootDOM){

	//data
	//[{}, {}, {}...]x9

	const margin = {top: 60, right: 60, bottom: 60, left: 60},
	    width = 960 - margin.left - margin.right,
	    height = 500 - margin.top - margin.bottom;
	
	const xScale = d3.scaleLinear().range([0, width]).domain([0,100]);

  	const yScale = d3.scaleLinear().range([height, 0]);

	const xAxis = d3.axisBottom().scale(xScale);

	const yAxis = d3.axisLeft().scale(yScale);

	const xValue = function(d) { return d.ranking;}; // data -> value
      // xScale = d3.scaleLinear().range([0, width]), // value -> display
    // const xMap = function(d) { return xScale(xValue(d));};

  	const yValue = function(d) { return d.ranking;}; // data -> value
      // yScale = d3.scaleLinear().range([height, 0]), // value -> display
    // const yMap = function(d) { return yScale(yValue(d));};

	const svg = d3.select(rootDOM)
		.append('svg')
		  .attr('width', width + margin.left + margin.right)
		  .attr('height', height + margin.top + margin.bottom)
		.append('g')
		  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
	const plot = svg.append('g')
		.attr('class','plot')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

		svg.append('g')
		  .attr('transform', 'translate(0,' + height + ')')
		  .attr('class', 'x axis')
		  .call(xAxis);

		// y-axis is translated to (0,0)
		svg.append('g')
		  .attr('transform', 'translate(0,0)')
		  .attr('class', 'y axis')
		  .attr('opacity', 0)
		  .call(yAxis);

	const tooltip = d3.select(rootDOM).append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

	const bubble = plot.append('circle')
		.attr('class','bubble')
		.datum(data)
		//some visual shape i.e. geometry, "d"
		.attr('cx', xValue)
		.attr('cy', yValue)
		.attr('r', 0)
		.attr('fill-opacity', 0.8);

		bubble
		.transition()

		.duration(500)
		.attr('cx', xValue)
		.attr('cy', yValue)
		// .attr('r', function(d){return d.appearance*5})
		.attr('r', 5)
		.attr('fill-opacity', 0.8)
		.attr('fill', 'white')
		.style('stroke','black')
		.style('stroke-width',2);

		bubble  
		.on("mouseover", function(d){
		    tooltip.transition()
		          .duration(200)
		          .style('opacity',0.9);
		    tooltip
		          .html(d.track_name + " - " + d.artist + "<br/>" + "ranking:" + d.ranking
		            +"<br/>" + "<img src='"+d.track_image+"'/>")
		          .style("left", d3.select(this).attr("cx") + "px")
		          .style("top", d3.select(this).attr("cy") + "px");      
		})

		.on("mouseout", function(d){
		    tooltip.transition()
		         .duration(500)
		         .style("opacity", 0);
		});

		plot.append('text')
		  .attr('x', 10)
		  .attr('y', 10)
		  .attr('class', 'label');

		plot.append('text')
		  .attr('x', width)
		  .attr('y', height)
		  .attr('text-anchor', 'end')
		  .attr('class', 'label');

}


//Utility functions for parsing metadata, migration data, and country code
function parseTrack(d){
	return {
		year: +d.Year,
		artists_id: d.artists_id,
		artist: d.artists,
		track_name: d.track_name,
		year: +d.year,
		album: d.Album,
		track_id: d.track_id,
		ranking: +d.ranking,
		danceability: +d.danceability,
		energy: +d.energy,
		loudness: +d.loudness,
		speechiness: +d.speechiness,
		acousticness: +d.acousticness,
		instrumentalness: +d.instrumentalness,
		liveness: +d.liveness,
		valence: +d.valence,
		tempo: +d.tempo,
		Preview: d.Preview_url,
		track_image: d.track_image

	}
}

function parseArtist(d){

	return {
		followers_total: +d.followers_total,
		genres: d.artists_genres,
		artists_id: d.artists_id,
		artist_image: d.image_url,
		artists_name: d.artists_name,
		artists_popularity: +d.artists_popularity

	}
	}
