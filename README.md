# YelpCamp

YelpCamp is a website for campsites inspired by Yelp, allowing owners to add camps, and users to add ratings and reviews.
<br/>
Tech Stack: Mongoose, Express.js, Node.js, Bootstrap
<br/>
The pushed version of YelpCamp is not a production-ready website, there are necessary changes that need to be made and set up such as:
- env file
  - CLOUDINARY_CLOUD_NAME=
  - CLOUDINARY_KEY=
  - CLOUDINARY_SECRET=
  - MAPBOX_TOKEN=
- app.js
  - secret token in the session configuration
  - cloudinary account name in image source
