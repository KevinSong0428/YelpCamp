// joi is a data validation library for JS
const BaseJoi = require('joi');
const sanitizeHTML = require("sanitize-html");

// defining an extension on joi.string --> can add .escapeHTML() on string properties below
const extension = (joi) => ({
    type: "string",
    base: joi.string(),
    messages: {
        "string.escapeHTML" : "{{#label}} must not include HTML!"
    },
    rules: {
        escapeHTML: {
            // function validate
            validate(value, helpers) {
                // will REMOVE all html tags
                const clean = sanitizeHTML(value, {
                    // provide options --> NOTHING is allowed
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error("string.escapeHTML", {value})
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension);

// creating a joi schema, NOT A MONGOOSE SCHEMA!
// export schema
module.exports.campgroundSchema = Joi.object({
    // should have a key named campground <-- we put it in an object wheen we post data
    // it is an object type, and it is required
    // Joi.type.param1.param2...
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        description: Joi.string().required().escapeHTML(),
        // images: Joi.string().required(),
        location: Joi.string().required().escapeHTML()
    }).required(),
    deleteImages: Joi.array()
})

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().max(5).min(0),
        body: Joi.string().required().escapeHTML()
    }).required() // <-- adding required() here is saying that the object itself is required
})