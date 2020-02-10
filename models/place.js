var mongoose = require("mongoose");

var placeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: "Place name cannot be blank."
    },
    image: String,
    description: String,
    location: String,
    // lat: Number,
    // lng: Number,
    createdAt: {
        type: Date,
        default: Date.now
    },
    user: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    rating: {
        type: Number,
        default: 0
    },
    slug: {
        type: String,
        unique: true
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]
});

// add a slug before the place gets saved to the DB
placeSchema.pre("save", async function (next) {
    try {
        // check if new place is being saved, or if place is being modified
        if (this.isNew || this.isModified("name")) {
            this.slug = await generateUniqueSlug(this.id, this.name);
        }
        next();
    } catch (err) {
        next(err);
    }
});

var Place = mongoose.model("Place", placeSchema);

module.exports = Place;

async function generateUniqueSlug(id, placeName, slug) {
    try {
        // generate initial slug
        if (!slug) {
            slug = slugify(placeName);
        }

        // check if place with that slug already exists
        var place = await Place.findOne({slug: slug});
        // check if the place is found or if the found place is the current place
        if (!place || place.id.equal(id)) {
            return slug;
        }

        // if not unique generate a new slug
        var newSlug = slugify(placeName);

        // check again by calling the function recursively
        return await generateUniqueSlug(id, placeName, newSlug);
    } catch (err) {
        throw new Error(err);
    }
}

function slugify(text) {
    var slug = text.toString().toLowerCase()
        .replace(/\s+/g, '-')        // Replace spaces with -
        .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
        .replace(/\-\-+/g, '-')      // Replace multiple - with single -
        .replace(/^-+/, '')          // Trim - from start of text
        .replace(/-+$/, '')          // Trim - from end of text
        .substring(0, 75);           // Trim at 75 characters
    return slug + "-" + Math.floor(1000 + Math.random() * 9000);  // Add 4 random digits to improve uniqueness
}