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
			.key(d => d.artists_id)
			// .key(d => d.values.length)
			.entries(musicAugmented)
			.map(group => {
				return {
					artist: group.key, //converting into numbers
					appearance: group.values.length

				}
			});

		console.log(artistsData);

		d3.select('.main')
			.selectAll('.plot-2') //0 
			.data(artistsData)
			.enter()
			.each(function(d){
				bubbleChart(
				d.values,
				this,
				d.key)
			});

	})

	function bubbleChart(data, rootDOM){

		//data
		//[{}, {}, {}...]x9

			const margin = {top: 60, right: 60, bottom: 60, left: 60},
			    width = 800 - margin.left - margin.right,
			    height = 400 - margin.top - margin.bottom;

			const plot2 = d3.select('.plot-2')
				.append('svg')
				.attr('width', width)
				.attr('height', height + 100)
				.attr("transform","translate(" + margin.left + "," + margin.top + ")")

			const nodes = plot2.selectAll('.node')
				.data(data);

			const nodesEnter = nodes.enter()
				.append('g')
				.attr('class','node');

			nodesEnter
				.append('circle')
				.attr('r', d=>d.appearance)
				.style('fill-opacity',.1)
				.style('fill','#red')
				.style('stroke-width','2px');
			nodes.merge(nodesEnter)
					.attr('transform', d => `translate(${d.x}, ${d.y})`);

			//CREATE FORCE SIMULATION 

			const simulation = d3.forceSimulation();

			const forceX = d3.forceX().x(width/2);
			const forceY = d3.forceY().y(height/2)
			const forceCollide = d3.forceCollide().radius(10);

			simulation
				.force('x', forceX)
				.force('y', forceY)
				.force('collide', forceCollide)
				//.force('link', forceLink)
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
			x: Math.random() * 200,
        	y: Math.random() * 200

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