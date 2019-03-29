const audioPromise = d3.csv('trackinfo.csv', parseAudio)
    // .then(data => new Map(data));
const artistPromise = d3.csv('artist.csv', parseArtist);

Promise.all([
        audioPromise,
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

        const audioData = d3.nest()
            .key(d => d.track_name)
            .entries(musicAugmented)
            .map(group=>{
                return {
                    key: group.key,
                    values: group.values
                }
            });
        
        console.log(audioData);

        const menu = d3.select(".nav")
            .append("select");

        menu.selectAll("option")
            .data(audioData)
            .enter()
            .append("option")
            .attr("value", d => d.key)
            .html(d=> d.key);

        menu.on("change", function(){

            const audio = this.value;

            const data = transform(audio,audioData); //WHAT DOES IT MEAN 

            feature(data);

         })

        const charts = d3.select('.plot-1')
            .enter()
            .data(audioData)
            .attr('class','chart');

            // .append('div')
            // .attr('class','plot-1')

        const chartsEnter = charts.enter()
            .append('div')
            .attr('class','chart')
            .data(audioData);

        charts.exit().remove();

        charts.merge(chartsEnter)
            .each(function(d){
                feature(
                    d.values,
                    this,
                    d.key
                    )
            });


    })

const feature = function(audioFeature) {
    
    // Define dimensions of vis
    const margin = { top: 30, right: 50, bottom: 30, left: 50 },
        width  = 550 - margin.left - margin.right,
        height = 250 - margin.top  - margin.bottom;

    // Make x scale 
    // Make y scale, the domain will be defined on bar update
    const xScale = d3.scaleLinear().range([0, width]).domain([0,100]).rangeRoundBands([0, width], 0.1);;
    const yScale = d3.scaleLinear().range([height, 0]).domain([0,130]);
    // Create canvas
    const plot3 = d3.select(".plot-3")
      .append("svg")
        .attr("width",  width  + margin.left + margin.right)
        .attr("height", height + margin.top  + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Make x-axis and add to canvas
    const xAxis = plot1.append("g")
       .attr('transform', 'translate(0,' + height + ')') 
       .attr("class", "xAxis")
       .call(d3.axisBottom()
        .ticks(10)
        // .tickSize(-width)
        .scale(xScale));

    // Add the Y Axis
    const yAxis = plot1.append("g")
       .attr("class", "y axis")
       .call(d3.axisLeft().scale(yScale));

    plot3.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    const yAxisHandleForUpdate = plot3.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    yAxisHandleForUpdate.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Value");

    const updateBars = function(data) {
        // First update the y-axis domain to match data
        yScale.domain( d3.extent(data) );
        yAxisHandleForUpdate.call(yAxis);

        const bars = plot3.selectAll(".bar").data(data);

        // Add bars for new data
        bars.enter()
          .append("rect")
            .attr("class", "bar")
            .attr("x", function(d,i) { return xScale( nutritionFields[i] ); })
            .attr("width", xScale.rangeBand())
            .attr("y", function(d,i) { return yScale(d); })
            .attr("height", function(d,i) { return height - yScale(d); });

        // Update old ones, already have x / width from before
        bars
            .transition().duration(250)
            .attr("y", function(d,i) { return yScale(d); })
            .attr("height", function(d,i) { return height - yScale(d); });

        // Remove old ones
        bars.exit().remove();
    };

    // Handler for dropdown value change
    var dropdownChange = function() {
        var newCereal = d3.select(this).property('value'),
            newData   = cerealMap[newCereal];

        updateBars(newData);
    };

    // Get names of cereals, for dropdown
    var cereals = Object.keys(cerealMap).sort();

    var dropdown = d3.select("#vis-container")
        .insert("select", "svg")
        .on("change", dropdownChange);

    dropdown.selectAll("option")
        .data(cereals)
      .enter().append("option")
        .attr("value", function (d) { return d; })
        .text(function (d) {
            return d[0].toUpperCase() + d.slice(1,d.length); // capitalize 1st letter
        });

    var initialData = cerealMap[ cereals[0] ];
    updateBars(initialData);
};

function parseAudio(d){
    return {                                                   
        artist: d.artists,
        track_name: d.track_name,
        track_id: d.track_id,
        danceability: +d.danceability,
        energy: +d.energy,
        speechiness: +d.speechiness,
        acousticness: +d.acousticness,
        liveness: +d.liveness,
        valence: +d.valence,
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