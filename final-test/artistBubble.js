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

			// const artist_image = artistMap.get(d.artist_image);

			// d.artist_image = artist_image;

			// const artist_followers_total = artistMap.get(d.followers_total);
			// d.followers_total = artist_followers_total;

			// const artists_popularity = artistMap.get(d.artists_popularity);
			// d.artists_popularity = artists_popularity;

			// const artist_genre = artistMap.get(d.genres);
			// d.genres = artist_genre;

			// if (artist_genre){
			// 	d.artist_genre = artist_genre.genre
			// }

		
		return d;

		});
		console.log(musicAugmented);

		const artistsData = d3.nest()
			.key(d => d.artists_id)
			.entries(musicAugmented);

		console.log(artistsData);

		d3.select('.main')
			.selectAll('.plot-2') //0 
			.data(artistsData)
			.enter()
			.each(function(d){
				bubbleChart(
				d.values,
				this)
			});

	})

	function bubbleChart(data, rootDOM){

		const margin = {top: 60, right: 60, bottom: 60, left: 60},
		width = 940,
		height = 600;

		const forceStrength = 0.03;

		function charge(d) {
		    return -Math.pow(d.radius, 2.0) * forceStrength;
		  }
		const center = { x: width / 2, y: height / 2 };

		const simulation = d3.forceSimulation()
			.velocityDecay(0.2)
		    .force('x', d3.forceX().strength(forceStrength).x(center.x))
		    .force('y', d3.forceY().strength(forceStrength).y(center.y))
		    .force('charge', d3.forceManyBody().strength(charge))
		    .on('tick', ticked);
		simulation.stop();

		// color setting by YEAR OR GENRE
		// const dataExtent = d3.extent(artistsData, function(d){
		// 			return d.popularity;
		// 		})
		// console.log(dataExtent);

		// const fillColor = d3.scaleLinear()
		// 	.domain(d3.extent(d3.values(data,d=>d.popularity)))
		// 	.range(["#f9f9f9","#922B21"]);

		const radiusScale = d3.scalePow()
			.range([1,45])
			.exponent(0.5)
			.domain([0,50]);

		const plot2 = d3.select('.plot-2')
			// .append('svg')
			.attr('width', width)
			.attr('height',height);

		const bubbles = plot2.selectAll('.bubble')
			.data(data, d=>d.key);

		const bubblesEnter = bubbles.enter()
			.append('svg')
			.append('cicrle')
			.classed('bubble',true)
			.attr('r',0)
			// .attr('fill', fillColor)
			// .attr('stroke', fillColor)
			.attr('fill', 'black')
			.attr('stroke', 'red')
			.style('opacity',1)
			.attr('stroke-width',2);
			// .on('mouseover', showDetail)
			// .on('mouseout',hideDetail)

		// bubbles = bubbles.merge(bubblesEnter);

		bubblesEnter.transition()
			.duration(1000)
			.attr('transform', d=> `translate(${d.x}, ${d.y})`)
			.attr('r', 10);

		function ticked() {
		    bubbles
		      .attr('cx', function (d) { return d.x; })
		      .attr('cy', function (d) { return d.y; });
		  };



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
			x: Math.random() * 300,
        	y: Math.random() * 400

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