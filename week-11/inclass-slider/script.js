console.log('in class slider');

//create d3 axis generator 

// const axixX = d3.axisBottom() //-->function 
// 	.scale()
// 	.tickValues()
// 	.tickSize()
// 	.tickFormat();

// d3.select(...).call(axisX);

function RangeSlider(){

	//default values per factory, and then make it configurable by customerize each one of them

	let color = '#ccc';
	let sliderValues = [];
	let W = 600;
	let H = 200;
	let margin = {l:20, r:20};

	const internalDispatch = d3.dispatch('slide')

	function exports(container){
	//building the DOM element corresponding to the slider 

	const dragBehavior = d3.drag()
		.on('start', function(d){
			handle
			.attr('fill','red')
			.attr('r',12)
		})
		.on('end',)
		.on('drag', function(d){
			let currentX = d3.event.x;
			if(currentX < 0){
				currentX = 0;
			}else if(currentX > w){
				currentX = w;
			}
			handle.attr('cx', currentX);

			const sliderValue = scaleX.invert(currentX); // convert pixel data into point data
			internalDispatch.call('slide',null,sliderValue);

		});
	
	container.style('height',`${H}px`);
	container.style('width', `${W}px`);

	const w = W - margin.l - margin.r;

	//axis scale 
	const scaleX = d3.scaleLinear().domain(d3.extent(sliderValue)).range([0,w]);
	const axisX = d3.axisBottom()
		.scale(scaleX)
		.tickValues(sliderValue)
		.tickFormat(d3.format('0'));

	let svg = container.selectAll('svg')
		.data([1])

	let svgEnter = svg.enter()
		.append('svg');
	let sliderInner = svgEnter.append('g')
		.attr('class','range-slider-inner')
	sliderInner.append('line').attr('class','track-outer')
	sliderInner.append('line').attr('class', 'track-inner')
	sliderInner.append('circle').attr('class', 'drag-handle')
	sliderInner.append('g').attr('class', 'ticks')

	//Update 

	svg.merge(svgEnter)
		.attr('width',W)
		.attr('height',H);

	sliderInner = svg.merge(svgEnter) //both entering and update senarioes 
		.select('range-slider-inner')
		.attr('transform', `transform(${margin.l},${H/2})`);
	sliderInner.select('track-outer')
		.attr('x1',w)
		.attr('stroke',color)
		.attr('stroke-width','10px');
	sliderInner.select('track-inner')
		.attr('x1',w)
		.attr('stroke','white')
		.attr('stroke-width','5px')
		.attr('stroke-linecap', 'round');
	const handle = sliderInner.select('drag-handle')
		.attr('r', 5)
		.attr('stroke', 'white')
		.attr('stroke-width', '3px')
		.attr('fill', '#666')
		.style('cursor', 'pointer')
		.call(dragBehavior);
	sliderInner.select('ticks')
		.call(axixX)
		.select('.domain')
		.style('display','none');

	}

	//"_" means input, where we can overwrite with any color 
	//getter setter function 
	exports.color = function(_){
		if(!_){
			return color; //'get'
		}
		color = _; //'set'
		return this; // this --> exports --> slider1
	}

	exports.values = function(_){
		if(!_){
			return sliderValues;
		}
		sliderValues = _;
		return this;

	}
	exports.on = function(event, callback){
		internalDispatch.on(event,callback);
		return this;

	}

	return exports;
}

// const slider1 = RangeSlider();
// slider1.color('#333') 
//= function exports and we can overwrite by any color 

const slider1 = RangeSlider()
	.color('#333')
	.values([1,2,3,4,5])
	.on('slide', 
		value=>console.log(value)
		);

const slider2 = RangeSlider(); //= function exports 
slider2.color('#222') //no relation to slider1 at all as a new scope

// slider1 =?? slider2 //slider1 not equal to slider2. every time when we call the function
//it creates a copy of the function result and a new scope 

//selection(function)
//function.select(DOm)