//Dispatch
const dispatch = d3.dispatch('update:force');

//dat.gui library for displaying UI
const gui = new dat.gui.GUI();
const obj = {
	useForceX: true,
	useForceY: true,
	useForceManyBody: true,
	forceManyBodyStrength: -1,
	useForceCollide: true,
	forceCollideRadius: 8,
	useForceLink: true
}
const f1 = gui.addFolder('Force X');
f1.add(obj, 'useForceX').onChange(() => dispatch.call('update:force', null, obj));
const f2 = gui.addFolder('Force Y');
f2.add(obj, 'useForceY').onChange(() => dispatch.call('update:force', null, obj));
const f3 = gui.addFolder('Force Many Body');
f3.add(obj, 'useForceManyBody').onChange(() => dispatch.call('update:force', null, obj));
f3.add(obj, 'forceManyBodyStrength').min(-30).max(5).onChange(() => dispatch.call('update:force', null, obj));
const f4 = gui.addFolder('Force Collide');
f4.add(obj, 'useForceCollide').onChange(() => dispatch.call('update:force', null, obj));
f4.add(obj, 'forceCollideRadius').min(0).max(20).onChange(() => dispatch.call('update:force', null, obj));
const f5 = gui.addFolder('Force Link');
f5.add(obj, 'useForceLink').onChange(() => dispatch.call('update:force', null, obj));

//Prepare DOM canvas
const w = d3.select('.plot').node().clientWidth;
const h = d3.select('.plot').node().clientHeight;
const plot1 = d3.select('#plot-1').append('svg').attr('width',w).attr('height',h);

//Import data
    const migrationDataPromise = d3.csv('../../data/un-migration/Table 1-Table 1.csv', parseMigrationData)
        .then(data => data.reduce((acc,v) => acc.concat(v), []));

    migrationDataPromise.then(data => {
        const networkData = generateNetwork(data,1990);
        const {nodesData,linksData} = networkData;

    nodesData.forEach(d => {
        d.x = Math.random()*w;
        d.y = Math.random()*h;
    });

    const nodes = plot1.selectAll('.node')
        .data(nodesData);
    const nodesEnter = nodes.enter()
        .append('g').attr('class','node');
    nodesEnter.append('circle').attr('r' ,5)
        .style('fill-opacity', .1)
        .style('stroke', '#333')
        .style('stroke-width','2px');
    nodes.merge(nodesEnter)
        .attr('transform', d=> `translate(${d.x}, ${d.y})`);

    const links = plot1.selectAll('.link')
        .data(linksData);
    const linksEnter = links.enter()
        .append('line').attr('class', 'link')
        .style('stroke-opacity', 0.05)
        .style('stroke-width', 1)
        .style('stroke', 'black');
    // links.merge(linksEnter)
    //     .attr('x1', d=>d.source.x)
    //     .attr('x2', d=>d.source.y)
    //     .attr('y1', d=>d.target.x)
    //     .attr('y2', d=>d.target.y)
    const simulation = d3.forceSimulation();

    //Define forces 
    //positioning forces
    const forceX = d3.forceX().x(d=>{
        if(d.outgoingTotal > d.incomingTotal){
            return w/4
        }else{
            return w*3/4
        }
    });
    const forceY = d3.forceY().y(h/2)
    const forceCollide = d3.forceCollide().radius(8); //a collide of 10 keeping each node from each other
    const forceLink = d3.forceLink().links(linksData);//the default is 30 


    simulation
        .force('x', forceX)
        .force('y', forceY)
        .force('collide',forceCollide)
        .force('link',forceLink)
        .nodes(nodesData) //start the simulation 
        .on('tick', ()=>{
            // console.log(simulation.alpha())
            nodes.merge(nodesEnter)
            .attr('transform', d=> `translate(${d.x}, ${d.y})`) //changing the DOM elements visually

            // links.merge(linksEnter)
            // .attr('x1', d=>d.source.x)
            // .attr('x2', d=>d.source.y)
            // .attr('y1', d=>d.target.x)
            // .attr('y2', d=>d.target.y);
        })
        .alpha(1); //the time the layout should be stablized 



    dispatch.on('update:force', params=>{
        // console.log(params);

        if(params.useForceX){
            simulation
            .force('x', forceX)
            .alpha(1)
            .restart()
        // console.log(simulation.alpha())
        }else{
            simulation
            .force('x', null)
            .alpha(1)
            .restart()
        }

    });



    });

//Converts origin destination flows to nodes and links
function generateNetwork(data, year){

    let filteredData = data.filter(d => d.year === year);

    const nodesData = new Map();
    const linksData = [];

    filteredData.forEach(od => {

        const newLink = {
            value: od.value,
            source: null,
            target: null
        };

        //check to see if node is already in the nodesData map
        if(!nodesData.get(od.origin_name)){
            //make a new node
            const newNode = {
                name: od.origin_name,
                incoming: [],
                outgoing: [newLink],
                incomingTotal: 0,
                outgoingTotal: newLink.value
            };

            nodesData.set(od.origin_name, newNode);
            newLink.source = newNode;
        }else{
            //if node is already present in the map
            const existingNode = nodesData.get(od.origin_name);

            existingNode.outgoing.push(newLink);
            existingNode.outgoingTotal += newLink.value;
            newLink.source = existingNode;
        }

        if(!nodesData.get(od.dest_name)){
            const newNode = {
                name: od.dest_name,
                incoming: [newLink],
                outgoing: [],
                incomingTotal: newLink.value,
                outgoingTotal: 0
            };

            nodesData.set(od.dest_name, newNode);
            newLink.target = newNode;
        }else{
            const existingNode = nodesData.get(od.dest_name);
            existingNode.incoming.push(newLink);
            existingNode.incomingTotal += newLink.value;
            newLink.target = existingNode;
        }

        linksData.push(newLink);

    });

    console.log(nodesData);

    // console.log(
    //     Array.from(nodesData.values())
    // );
    console.log(linksData);

    return {
    	nodesData: Array.from(nodesData.values()), //return value will be an array, otherwise it's a map
    	linksData: linksData
    }



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
