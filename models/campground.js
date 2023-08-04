const mongoose = require('mongoose');
const { campgroundSchema } = require('../schema');
const Schema = mongoose.Schema;
const Review = require("./review");

// every schema will now include the virtual properties when using JSON stringify
const opts = { toJSON: {virtuals: true} };

const CampgroundSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    location: String,
    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    images: [
        {
            url: String,
            filename: String
        }
    ],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    // ONE TO MANY RELATIONSHIP
    reviews: [
        {
            type: Schema.Types.ObjectId,
            // reference to "Review" model
            ref: 'Review'
        }
    ]
}, opts)

// virtual propert of campground schema --> not actually part of the model needed when creating
CampgroundSchema.virtual("properties.popUpMarkup").get(function () {
    // return "I AM POP UP!"
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0, 20)}...</p>
    `
})

// this middleware is only triggered if called by "findByIdAndDelete"
// after deleting the campground, need to remove any reviews from the database
CampgroundSchema.post("findOneAndDelete", async function (data) {
    if (data.reviews.length) {
        // deletes all
        await Review.deleteMany({
            _id: {
                $in: data.reviews // remove by finding any id that exists in the array "reviews"
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema)