const redSquare = d3.select('.main')
	.append('div')
	.attr('class','square')
	.style('background', 'red')

	.datum({key:4}); //ACCESS TO THE DATA THAT CAN BE BONDED TO THE EVENT

redSquare
	.on('click',function(d){

		console.log('red is clicked!');
		console.log(this); //THIS IS THE CONTEXT OF THE FUNCTION, THE OWNER OF THE FUNCTION
		console.log(d);

	// d3.select(this).transition().style('background','blue')
	});

const blueSquare = d3.select('.main')
	.append('div')
	.attr('class','square')
	.style('background', 'blue')
	.on('click',function(){ 
		   					//d=> ARROW FUNCTION --> THIS CONTENT MEANS THE WHOLE WINDOW
		console.log('blue is clicked!');
		console.log(this);
	});

const yellowSquare = redSquare
	.append('div', 'square')
	.attr('class','square')
	.style('background','yellow')

	.on('click',function(){
		d3.event.stopPropagation();
		console.log('yellow is clicked!');
		console.log(this);
		console.log(d3.event);
	});

// CREATE A DISPACH OBJECT, HANDLES COLOR CHANGING OBJECT 
 const dispatch = d3.dispatch('changecolor') //NAME IS A STRING 



for(let i = 0; i < 10; i++) {
  const randomColor = `rgb(${256*Math.random()},${256*Math.random()},${256*Math.random()}`

  const square = d3.select('.main')
  	.append('div')
  	.attr('class', 'square')
  	.style('background', randomColor)
  	.on('click', function(){
  		dispatch.call('changecolor',null, randomColor) //DISPATCH EVENT, NULL, ANY OTHER MESSAGE YOU WANT TO BROADCAST/GO OUT 
  	});
  	dispatch.on('changecolor.'+i, function(color){ 
  		square.style('background', color);
  	});
}

dispatch.on('changecolor', function(color){ //DISPATCH WILL ONLY RUN AND CALL BACK ONCE
	console.log(color);

})




