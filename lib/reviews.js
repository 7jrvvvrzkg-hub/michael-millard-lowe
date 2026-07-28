// Real Google reviews for the shop, pulled verbatim (name, date, rating,
// text) from the shop's public Google Business listing. Nothing here is
// invented - these are genuine, attributed customer reviews. There are
// more than these on Google (the shop has 46 reviews at 4.7 stars overall,
// as of when this was written); these six are simply the ones with full
// text available to quote. GOOGLE_RATING_SUMMARY below drives the
// aggregate "4.7 (46)" badge shown next to the carousel.

const GOOGLE_RATING_SUMMARY = {
  average: 4.7,
  count: 46,
  mapsUrl:
    "https://www.google.com/maps/place/@36.868494,-76.288133,17z/data=!4m10!3m9!1s0x89ba983bde5b4539:0xa9955aa3df5adbaf!5m2!4m1!1i2!8m2!3d36.868494!4d-76.288133!9m1!1b1",
};

const REVIEWS = [
  {
    name: "Steve B.",
    rating: 5,
    date: "2024-08-10",
    text: "While visiting Navy family in Norfolk, VA, my wife and I stopped by this antique shop. We were immediately impressed by both the quality of the antiques and the open, uncluttered displays. I was particularly pleased to acquire a brass fireplace fender for a set of nineteenth century French brass griffin andirons I had acquired some time ago. It's so refreshing to go antiquing at a shop like this versus the many packed-to-the-gills shops we see around the country.",
  },
  {
    name: "Susan C.",
    rating: 5,
    date: "2025-06-04",
    text: "Purchased an incredible hanging lamp and mirror. Michael shipped our purchases. Great customer service. So many more things I wanted to get. Going into his store is such an adventure. My son and I antique all the time, we loved this beautiful store.",
  },
  {
    name: "Patricia M.",
    rating: 5,
    date: "2023-09-05",
    text: "Every time I come in here I leave with something. I love the atmosphere and the owner and employees. It's the best shop in Tidewater, not like some of the other, smelly, overfilled ones in town.",
  },
  {
    name: "Alison M.",
    rating: 5,
    date: "2023-07-18",
    text: "One of my favorite antique stores to stop and visit. The items inside are beautiful, elegant, and classic - tons of French styled furniture, stunning in both style and quality. It's larger than it first appears, with a big room in back and more furniture in two smaller side rooms. I love this shop!",
  },
  {
    name: "J.C.",
    rating: 5,
    date: "2024-06-05",
    text: "Wonderful selection of French antiques and Michael is a wealth of knowledge with a great sense of humor. Highly recommend!",
  },
  {
    name: "Peter D.",
    rating: 5,
    date: "2023-05-02",
    text: "Michael, a proprietor with casual grace and elegance, demonstrates a level of customer rapport rarely experienced in today's modern retail world. Personally selected fine antiques from many time periods - from Louis XVI to Mid-Century Modern and beyond - you'll surely find something to create a unique statement in your home.",
  },
];

module.exports = { REVIEWS, GOOGLE_RATING_SUMMARY };
