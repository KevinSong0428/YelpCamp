// controller files have the code that would be in route
// MVC - models. views. controllers.
// models for application
// views for template
// controllers for code in routes

const { cloudinary } = require("../cloudinary");
const campground = require("../models/campground");
const Campground = require("../models/campground");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

// instantiate mapbox with token
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res) => {
    // geocode takes two parameters: location and amount of results
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    // server side, checking if there exists ANY campground data
    const campground = new Campground(req.body.campground);

    // add geometry from geocode to schema
    campground.geometry = geoData.body.features[0].geometry;
    campground.location = geoData.body.features[0].place_name;
    // map every filename to images
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    // keep track of author when creating new campground
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    // flash meessage AFTER successfully saving to database
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground = async (req, res) => {
    // destructure id from parameters to isolate
    // can also just pass it in as req.params.id
    const { id } = req.params;
    // nested populate
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            // in reviews, also populate author of the review
            path: 'author'
        }
    }).populate('author');
    // utilizing flash to show error
    if (!campground) {
        req.flash('error', 'Campground cannot be found!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}

module.exports.renderEditForm = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash('error', 'Campground cannot be found!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params
    console.log(req.body);
    // ... <-- spread operator
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { new: true });
    if (req.files.length > 0) {
        const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
        campground.images.push(...imgs);
    }
    await campground.save()
    if (req.body.deleteImages) {
        // $pull - pull operator - pull out of images array here - and get filenames - if filename in the array of deleteImages
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        //  pull will remove those images
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated campground!'); // flash updated message
    // need to redirect to a ROUTE <-- include slash!
    res.redirect(`/campgrounds/${id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id); // <-- triggers "findOneAndDelete()" middleware, can handle in campground model
    // delete images from cloudinary after deleting campground
    for (let image of campground.images) {
        await cloudinary.uploader.destroy(image.filename);
    }
    req.flash('success', 'Successfully deleted campground.');
    res.redirect('/campgrounds');
}