// Import the Express package from node_modules
// This was installed using `npm install` and is listed as a dependency in package.json
import express from 'express'

// Import the Liquid template engine 
import { Liquid } from 'liquidjs';

// Some useful API endpoints you can use:
// - https://fdnd.directus.app/items/tribe
// - https://fdnd.directus.app/items/squad
// - https://fdnd.directus.app/items/person
// You can mix these with filters, sorting, and search queries
// Check out the docs here: https://directus.io/docs/guides/connect/query-parameters
// And some example exercises here: https://github.com/fdnd-task/connect-your-tribe-squad-page/blob/main/docs/squad-page-ontwerpen.md

// Grab all first-year squads from the WHOIS API for this year (2024–2025)
const squadResponse = await fetch('https://fdnd.directus.app/items/squad?filter={"_and":[{"cohort":"2425"},{"tribe":{"name":"FDND Jaar 1"}}]}')

// Convert the response to JSON so we can use it
const squadResponseJSON = await squadResponse.json()

// Check the data in the console (not the browser console, but your terminal in NodeJS)
// console.log(squadResponseJSON)

// Set up an Express app
const app = express()

// Serve static files (CSS, images, fonts, etc.) from the 'public' folder
// This makes them accessible in the browser
app.use(express.static('public'))

// Use Liquid as the template engine
const engine = new Liquid();
app.engine('liquid', engine.express()); 

// Set the folder where Liquid templates are stored
// These templates aren’t loaded directly in the browser like regular HTML
app.set('views', './views')

// Make working with form data easier
app.use(express.urlencoded({extended: true}))

// Routes determine which page gets shown when a user visits a URL
// This one handles the homepage
app.get('/', async function (request, response) {
  // Fetch all students from the WHOIS API for this year
  const personResponse = await fetch('https://fdnd.directus.app/items/person/?sort=name&fields=*,squads.squad_id.name,squads.squad_id.cohort&filter={"_and":[{"squads":{"squad_id":{"tribe":{"name":"FDND Jaar 1"}}}},{"squads":{"squad_id":{"cohort":"2425"}}}]}')

  // Convert the response to JSON
  const personResponseJSON = await personResponse.json()
  
  // The JSON contains all students from all squads this year
  // You can filter, sort, or modify this data here before passing it to the template

  // Render index.liquid and pass the data to the template
  response.render('index.liquid', {persons: personResponseJSON.data, squads: squadResponseJSON.data})
})

// This route handles form submissions (POST requests) on the homepage
app.post('/', async function (request, response) {
  // You could store or update data here if needed
  // For now, just redirect back to the homepage
  response.redirect(303, '/')
})

// This route handles individual student detail pages using their ID
// More info on route parameters: https://expressjs.com/en/guide/routing.html#route-parameters
app.get('/student/:id', async function (request, response) {
  // Use the ID from the URL to fetch the right student from the WHOIS API
  const personDetailResponse = await fetch('https://fdnd.directus.app/items/person/' + request.params.id)
  // Convert response to JSON
  const personDetailResponseJSON = await personDetailResponse.json()
  
  // Render student.liquid and pass the data to the template
  response.render('student.liquid', {person: personDetailResponseJSON.data, squads: squadResponseJSON.data})
})

// Set the port number the server should listen on
app.set('port', process.env.PORT || 8000)

// Start the Express server
app.listen(app.get('port'), function () {
  // Log a message so you know the server is running
  console.log(`App is live at http://localhost:${app.get('port')}`)
})
