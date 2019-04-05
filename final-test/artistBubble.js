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

		const artist_name = artistMap.get(d.artists_name)

		d.artists_name = artist_name;


		return d;

		});
		console.log(musicAugmented);

		const artistsData = d3.nest()
			.key(d => d.artist_data)
			// .key(d => d.genre)
			.entries(musicAugmented)
			.map(d => {
				return {
					artist: d.key, 
					appearance: d.values.length,
					values: d.values

				}
			});

		console.log(artistsData);

		bubbleChart(artistsData);
	})

	function bubbleChart(data, rootDOM){

			const margin = {top: 20, right: 20, bottom: 20, left: 20},
			    width = 960 - margin.left - margin.right,
			    height = 700 - margin.top - margin.bottom;

			data.forEach(d=>{
				d.x = Math.random()*width;
				d.y = Math.random()*height;
			});

			const plot2 = d3.select('.plot-2')
				.append('svg')
				.attr('width', width)
				.attr('height', height)
				.attr("transform","translate(" + margin.left + "," + margin.top + ")")

			//TOOLTIP 

			const tooltip = d3.select('.plot-2').append("div")
				.attr("class", "tooltip_bubble")
				.attr('width', 50)
				.style("opacity", 0);

			//COLOR SCALE 
			const colorScale = d3.scaleLinear()
				.domain([1,123])
				.range(['#FFFACD','#DC143C']);

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
				.attr('r', d=>d.appearance*3)
			
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

			// const forceX = d3.forceX().x(width/3);
			const forceY = d3.forceY().y(height/2);
			const forceCollide = d3.forceCollide().radius(d=>d.appearance*3.2);

			simulation
				// .force('x', forceX)
				// .force('y', forceY)
				.force('collide', forceCollide)
				.force('center', d3.forceCenter(width / 2.2, height/2.2))
				.force('charge', d3.forceManyBody().strength(7))
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
			artist_display: d.artists_display,
			artist_data: d.artist_data,
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