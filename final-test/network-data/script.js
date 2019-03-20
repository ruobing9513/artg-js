const trackPromise = d3.csv('trackinfo.csv', parseTrack)
	// .then(data => new Map(data));
const artistPromise = d3.csv('artist.csv', parseArtist);

Promise.all([
		trackPromise,
		artistPromise,
	])
	
	.then(([trackinfo, artist]) => {

		//Convert artistcsv to a map
		const artist_tmp = artist.map(d =>{
			return [d.artists_id, d]
		});

		// console.log(artist_tmp);
		const artistMap = new Map(artist_tmp);
		console.log(artistMap);

		const musicAugmented = trackinfo.map(d => {

			const artist_id = artistMap.get(d.artists_id);
			const artist_image = artistMap.get(d.artist_image);
			const artist_followers_total = artistMap.get(d.followers_total);
			const artists_popularity = artistMap.get(d.artists_popularity);
			const artist_genre = artistMap.get(d.genres);

			if (artist_id){
				d.artists_id = artist_id
			}
			if (artist_image){
				d.artists_image = artist_image
			}
			if (artist_followers_total){
				d.artist_followers_total = artist_followers_total
			}
			if (artists_popularity){
				d.artists_popularity = artists_popularity
			}
			if (artist_genre){
				d.artist_genre = artist_genre
			}

		
		return d;

		// 	// if(origin_metadata){
		// 	// 	d.origin_subregion = origin_metadata.subregion;
		// 	// }
		// 	// if(dest_metadata){
		// 	// 	d.dest_subregion = dest_metadata.subregion;
		// 	// }

		// 	return d;
		const menu = d3.select(".nav")
                       .append("select");

        menu.selectAll("option")
            .data(year)
            .enter()
            .append("option")
            .attr("value", d => d.year)
            .html(d=> d.year);

        menu.on("change", function(){

            const year = this.value;

            const data = transform(year,trackinfo);
            
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
			// .each(function(d){
			// 	console.group()
			// 	console.log(this);
			// 	console.log(d);
			// 	console.groupEnd();

			// 	lineChart(
			// 		d.values, //array of 7
			// 		this
			// 	);
			// })

	})

//Drawing line chart based on serial x-y data
//Function "signature": what arguments are expected, how many, and what they should look like
function scatterPlot(data, rootDOM){

	//data
	//[{}, {}, {}...]x7

	const margin = {top: 60, right: 60, bottom: 60, left: 60},
	    width = 960 - margin.left - margin.right,
	    height = 500 - margin.top - margin.bottom;
	
	const xScale = d3.scaleLinear()
	  .range([0, width]).domain(d3.extent(data, function(d){
      return d.ranking;})).nice();

	const yScale = d3.scaleLinear()
	  .range([height, 0]).domain(d3.extent(data, function(d){
      return d.appearance;})).nice();

	// square root scale.
	const radius = d3.scaleSqrt()
	  .range([5,20]);

	const xAxis = d3.axisBottom().scale(xScale);

	const yAxis = d3.axisLeft().scale(yScale);

	const xValue = function(d) { return d.ranking;}, // data -> value
	    // xScale = d3.scaleLinear().range([0, width]), // value -> display
	    xMap = function(d) { return xScale(xValue(d));};

	const yValue = function(d) { return d.appearance;}, // data -> value
	    // yScale = d3.scaleLinear().range([height, 0]), // value -> display
	    yMap = function(d) { return yScale(yValue(d));};


	//take array of xy values, and produce a shape attribute for <path> element

	const svg = d3.select(rootDOM)
		.append('svg')
		  .attr('width', width + margin.left + margin.right)
		  .attr('height', height + margin.top + margin.bottom)
		.append('g')
		  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
	const plot = svg.append('g')
		.attr('class','plot')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	plot.append('circle')
		.attr('class','bubbles')
		.datum(data)
		//some visual shape i.e. geometry, "d"
		.attr('cx', xMap)
		.attr('cy', yMap)
		.attr('r', 0)
		.attr('fill-opacity', 0.8);

		bubble
		.transition()

		.duration(500)
		.attr('cx', xMap)
		.attr('cy', yMap)
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
		          .html(d.name + " - " + d.artists + "<br/>" + "ranking:" + d.ranking
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
