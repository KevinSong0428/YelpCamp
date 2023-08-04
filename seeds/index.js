// this is a seed file
// will populate database with data

const mongoose = require('mongoose');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelpers');
const Campground = require("../models/campground");

mongoose.connect('mongodb://localhost:27017/yelp-camp')

// used to check if mongoose connected to database 
const db = mongoose.connection;
db.on("Error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})


// returning a random index value of an array
const sample = (array) => array[Math.floor(Math.random() * array.length)];

// async function to delete and seed db
const seedDB = async () => {
    await Campground.deleteMany({}); // <-- deletes everything in db
    for (let i = 0; i < 200; i++) {
        const price = Math.floor(Math.random() * 20) + 10;
        const random1000 = Math.floor(Math.random() * 1000);
        // will randomly choose one of the thousand city from cities.js
        const camp = new Campground({
            // set author of every campground to kevin
            author: '641cadb90a016f8f3759efdc',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Necessitatibus recusandae iusto perspiciatis numquam, id beatae assumenda natus. Enim repellat exercitationem cum eum quasi beatae sequi veniam! Sequi laboriosam assumenda fuga!",
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dus1nxwa7/image/upload/v1688758260/YelpCamp/cduiutyoq8kvawd4m1na.png',
                    filename: 'YelpCamp/cduiutyoq8kvawd4m1na',
                },
                {
                    url: 'https://res.cloudinary.com/dus1nxwa7/image/upload/v1688758260/YelpCamp/r7mvmvo6w7zixfc0zbv2.png',
                    filename: 'YelpCamp/r7mvmvo6w7zixfc0zbv2',
                }
            ]
        })
        await camp.save()
    }
}

// after promise is fulfilled, close mongoose connection
seedDB()
    .then(() => {
        mongoose.connection.close();
    })