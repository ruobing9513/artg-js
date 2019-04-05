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

		});
		console.log(musicAugmented);

		const yearData = d3.nest()
			.key(d => d.year)
			.entries(musicAugmented);

		console.log(yearData);

		//DROPDOWN MENU
		const menu = d3.select(".nav")
            .append("select");

        menu.selectAll("option")
            .data(yearData)
            .enter()
            .append("option")
            .attr("value", d => d.key)
            .html(d=> d.key);

        menu.on("change", function(){

            const year = this.value;

            const data = transform(year,yearData); //WHAT DOES IT MEAN 

            scatterPlot(data);

         })

		const charts = d3.select('.plot-1')
			.selectAll('.chart')
			.enter()
			.data(yearData);


		const chartsEnter = charts.enter()
			.append('div')
			.attr('class','chart')
			.data(yearData);

		charts.merge(chartsEnter)
			.each(function(d){
				scatterPlot(
					d.values,
					this,
					d.key
					)
			});
		charts.exit().remove();


	})

//Function "signature": what arguments are expected, how many, and what they should look like
function scatterPlot(data, rootDOM){

	//data
	//[{}, {}, {}...]x9
		const margin = {top: 20, right: 20, bottom: 20, left: 20},
		    width = 900 - margin.left - margin.right,
		    height = 400 - margin.top - margin.bottom;

		const xScale = d3.scaleLinear().range([10, width+150]).domain([0,100]);
		const yScale = d3.scaleLinear().range([height, 0]).domain([20,110]);

		data.forEach(d=>{
			d.x = xScale(d.ranking);
			d.y = yScale(d.popularity);
		});

		const plot2 = d3.select('.plot-2')
			.append('svg')
			.attr('width', width)
			.attr('height', height)
			.attr("transform","translate(" + margin.left + "," + margin.top + ")")

		//TOOLTIP 

		const tooltip = d3.select('.plot-1').append("div")
			.attr("class", "tooltip")
			.attr('width', 50)
			.style("opacity", 0);

		//UPDATE SELECTION 
		const nodes = plot2.selectAll('.node')
			.data(data);

		nodes.select('circle')
			.style('fill','black')
			.attr('r',2);

		//ENTERING SELECTION 
		const nodesEnter = nodes.enter()
			.append('g')
			.attr('class','node');

		nodesEnter.append('circle')
			.attr('r', d=>d.appearance)
			.style('fill-opacity',0.9)
			.style('fill','#FF6347');

		//ENTERING AND UPDATE
		nodes.merge(nodesEnter)
			.attr('transform', d => `translate(${d.x}, ${d.y})`);

		nodes.merge(nodesEnter)
			.select('circle')

			.transition()
			.duration(200)
			.attr('r', 7)
		
		nodes.merge(nodesEnter)
			.on("mouseenter", function(d){
				d3.select(this)
				.style('fill','#FF6347')
				.attr('fill-opacity', 1)
				
			    tooltip.transition()
			          .duration(200)
			          .style('opacity',1)
			    tooltip
			    	//TRACK IMAGE AND RANKING DOESNT MATCH WITH THE TRACK AND ARTIST 
			          .html("<h1>" + d.artist + "</h1>" ); 
			})

			.on("mouseout", function(d){
				d3.select(this)
				.attr('r', 7)
				.style('fill','black')
				.attr('fill-opacity', 1);
				// .style('stroke-width',1);

			    tooltip.transition()
			         .duration(500)
			         .style("opacity", 0);
			})


		//CREATE FORCE SIMULATION 

		const simulation = d3.forceSimulation();

		const forceX = d3.forceX().x(width/2);
		const forceY = d3.forceY().y(height/2);
		const forceCollide = d3.forceCollide().radius(8);

		simulation
			// .force('x', forceX)
			.force('y', forceY)
			.force('collide', forceCollide)
			// .force('center', d3.forceCenter(width / 2.2, height/2.2))
			.force('charge', d3.forceManyBody().strength(5))
			// .force('link', forceLink)
			.nodes(data) //start the simulation
			.on('tick', () => {
				nodes.merge(nodesEnter)
					.attr('transform', d => `translate(${d.x}, ${d.y})`);
			})
			.alpha(1);

		

}



//Utility functions for parsing metadata, migration data, and country code
function parseTrack(d){
	return {
		year: +d.Year,
		artists_id: d.artists_id,
		artist: d.artists,
		track_name: d.track_name,
		follower: +d.follower,
		genre: d.genre,
		popularity: +d.popularity,
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
		track_image: d.track_image,
		artist_url: d.artist_image,
		x: Math.random() * 900,
    	y: Math.random() * 800
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

function transform(year, data){
	const musicFiltered = data.filter(d => d.year === year);

	return musicFiltered

}

