(function(){
	
	const width =500
	const height =500;

	const svg = d3.select('.bubble')
		.append('svg')
		.attr('width',width)
		.attr('height',height)
		.append('g')
		.attr('transform','translate(0,0)')

	const radiusScale = d3.scaleSqrt().domain([30,100]).range([10,80])

	const simulation = d3.forceSimulation()
		.force('x',d3.forceX(width/2).strength(0.05))
		.force('y',d3.forceY(height/2).strength(0.05))
		.force('collide', d3.forceCollide(function(d){
				return d.artists_popularity;
		}))


	d3.queue()
		.defer(d3.csv, 'artist.csv')
		.await('ready')

	function artist (error, artist){
		const nodes = svg.selectAll('.artists')
			.data(artist)
			.enter().append('circle')
			.attr('class', 'artist')
			.attr('r', function(d){
				return radiusScale(d.artists_popularity)
			})
			.attr('fill', 'black')
			.attr('cx',100)
			.attr('cy',300)

		simulation.nodes(artist)
			.on('tick', ticked)

		function ticked() {
			nodes 
			.attr('cx',d=>d.x)
			.attr('cy', d=>d.y)
		}
	}

}

})();
