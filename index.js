const express = require('express');
const exphbs = require('express-handlebars');
const pg = require('pg');
const Pool = pg.Pool;

const app = express();
const PORT = process.env.PORT || 3018;

const ElectricityMeters = require('./electricity-meters');

const connectionString = process.env.DATABASE_URL || 'postgresql://coder:12345@localhost:5432/topup_db';

const pool = new Pool({
	connectionString
});

// enable the req.body object - to allow us to use HTML forms
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// enable the static folder...
app.use(express.static('public'));

// add more middleware to allow for templating support

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

const electricityMeters = ElectricityMeters(pool);

//Default home route
app.get('/', function (req, res) {
	res.redirect('/streets');
});

//Show appliance and rates
app.get('/appliance', async function (req, res) {
	const appliance = await electricityMeters.appliances()
	res.render('appliance', {
		appliance: appliance
	})
})
//Show all streets
app.get('/streets', async function (req, res) {
	const streets = await electricityMeters.streets();
	console.log(streets);
	res.render('streets', {
		streets
	});
});

// show the street number and name and the meter balance
app.get('/meter/:street_id', async function (req, res) {
	const streetid = req.params.street_id;
	const streetinfo = await electricityMeters.streetMeters(streetid)

	res.render('street_meters', {
		meters: streetinfo
	});
});
// show the current meter balance and select the appliance you are using electricity for
app.get('/meter/use/:meter_id', async function (req, res) {
	const meterId = req.params.meter_id;
	const selectAppliance = await electricityMeters.appliances(meterId)


	res.render('use_electicity', {
		meters: selectAppliance,
		meterId: meterId
	});
});
// update the meter balance with the usage of the appliance selected.
app.post('/meter/use/:meter_id', async function (req, res) {

	
	res.render(`/meter/user/${req.params.meter_id}`);

});

//List the lowest 
app.get('/', async function (req, res) {
	res.render('index', { lowBalance: await electricityMeters.lowestBalanceMeter() });
});

// start  the server and start listening for HTTP request on the PORT number specified...
app.listen(PORT, function () {
	console.log(`App started on port ${PORT}`)
});