import {
	parseData
} from './utl.js';

import {csv} from 'd3';

const musicPromise = csv('./data/music_2018', parseData);

console.log(musicPromise);

export{
	musicPromise
}