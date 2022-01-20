// this is our
module.exports = function(pool) {

	// list all the streets the we have on records
	async function streets() {
		const streets = await pool.query(`select * from street`);
		return streets.rows;
	}

	// for a given street show all the meters and their balances
	async function streetMeters(streetId) {
		const result = await pool.query(`select * from electricity_meter where street_id = $1`, [streetId]);
		return result.rows;
	}

	// return all the appliances
	async function appliances() {
		const appliance = await pool.query(`select * from appliance`);
		return appliance.rows;
	}

	// increase the meter balance for the meterId supplied
	async function topupElectricity(meterId, units) {
		await pool.query(`update electricity_meter set balance = balance + $1 where id = $2`, [units, meterId]);
	}
	
	// return the data for a given balance
	async function meterData(meterId) {
		const meterBalance = await pool.query(`select balance from electricity_meter where id =$1`, [meterId]);
		return meterBalance.rows[0];
	}

	// decrease the meter balance for the meterId supplied
	async function useElectricity(meterId, units) {
			await pool.query(`update electricity_meter set balance = balance - $1 where id = $2`, [units, meterId]);
	}

	// return the meter with lowest balance
	async function lowestBalanceMeter(){
		const lowestBalance = `select name as meter_name, street_number, street_name, balance, from electricity_meter 
		join street on street.id = electricity_meter.street.id 
		order by balance desc 
		limit 1`

		const result = await pool.query(lowestBalance);
		return result.rows;
	}

	return {
		streets,
		streetMeters,
		appliances,
		topupElectricity,
		meterData,
		useElectricity,
		lowestBalanceMeter
	}


}