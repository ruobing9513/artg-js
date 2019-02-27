//Utility functions for parsing metadata, migration data, and country code
function parseData(d){

	return {
		ranking: d.ranking,
		danceability: d.danceability,
		energy: d.energy,
		key: d.key,
		loudness: d.loudness,
		mode: d.mode,
		speechiness: d.speechiness,
		acousticness: d.acousticness,
		instrumentalness: d.instrumentalness,
		liveness: d.liveness,
		valence: d.valence,
		tempo: d.tempo
	}
}

function parseCountryCode(d){
	return [
		d['Region, subregion, country or area'],
		d.Code.padStart(3, '0')
	]
}

function parseMigrationData(d){

	const migrationFlows = [];
	const dest_name = d['Major area, region, country or area of destination'];
	const year = +d.Year

	if(+d.Code >= 900 || dest_name === '') return;
	
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
export {parseMetadata, 
	parseMigrationData, 
	parseCountryCode
}