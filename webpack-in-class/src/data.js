import {
	parseMigrationData,
	parseMetadata,
	parseCountryCode
} from './utils';

import {csv} from 'd3';

const migrationDataPromise = csv('./data/un-migration/Table 1-Table 1.csv', parseMigrationData)
	.then(data => data.reduce((acc,v) => acc.concat(v), []));

const countryCodePromise = csv('./data/un-migration/ANNEX-Table 1.csv', parseCountryCode)
	.then(data => new Map(data));

const metadataPromise = csv('./data/country-metadata.csv', parseMetadata)
	.then(metadata => {
		//Convert metadata to a map
		const metadata_tmp = metadata.map(a => {
			return [a.iso_num, a]
		});
		const metadataMap = new Map(metadata_tmp);

		return metadataMap;
	});

//migrationDataCombined combines migration data with associated metadata
const migrationDataCombined = Promise.all([
		migrationDataPromise,
		countryCodePromise,
		metadataPromise
	])
	.then(([migration, countryCode, metadataMap]) => {
		//combine migration, countryCode, and metadataMap
		const migrationAugmented = migration.map(d => {

			const origin_code = countryCode.get(d.origin_name);
			const dest_code = countryCode.get(d.dest_name);

			d.origin_code = origin_code;
			d.dest_code = dest_code;

			//Take the 3-digit code, get metadata record
			const origin_metadata = metadataMap.get(origin_code);
			const dest_metadata = metadataMap.get(dest_code);

			if(origin_metadata){
				d.origin_subregion = origin_metadata.subregion;
				d.origin_lngLat = origin_metadata.lngLat;
			}
			if(dest_metadata){
				d.dest_subregion = dest_metadata.subregion;
				d.dest_lngLat = dest_metadata.lngLat;
			}

			return d;
		});

		console.log(migrationAugmented);

		return migrationAugmented;
	});



export {
	migrationDataPromise,
	countryCodePromise,
	metadataPromise,
	migrationDataCombined
}