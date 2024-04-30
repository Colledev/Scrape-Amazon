// Importing required libraries
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const { JSDOM } = require("jsdom");

// Initializing the Express app
const app = express();
app.use(cors());
const PORT = 5000;

// Function to remove unnecessary CSS styles
function removeCSS(html) {
  return html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
}

// GET route to access scraping data
app.get("/api/scrape", async (req, res) => {
  const { keyword } = req.query;

  // Checking if the keyword is present in the request
  if (!keyword) return res.status(400).json({ message: "Missing keyword" });

  // Fetching data from the Amazon website based on the keyword
  try {
    const { data } = await axios.get(
      `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`,
      {
        // Adding headers to avoid 503 errors
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
        },
      }
    );
    // Removing unnecessary CSS styles from the data
    const filteredHTML = removeCSS(data);
    // Creating a new JSDOM object for data manipulation
    const dom = new JSDOM(filteredHTML);
    const products = [];

    // Iterating over page elements to get product data
    dom.window.document.querySelectorAll(".s-result-item").forEach((item) => {
      const titleElement = item.querySelector(".a-text-normal");
      const image = item.querySelector("img")?.getAttribute("src");
      // Checking for available title and image
      if (!titleElement || !image) {
        return;
      }
      const title = titleElement.textContent;
      const rating =
        item.querySelector(".a-icon-star-small")?.textContent || "N/A";

      const numberReviewsElement = item.querySelector(
        ".a-size-base.s-underline-text"
      );
      const numberReviewsText = numberReviewsElement
        ? numberReviewsElement.textContent.trim()
        : "N/A";
      // Converting number of reviews to numeric format
      const numberReviews = parseInt(numberReviewsText, 10) || "N/A";
      const product = { title, rating, numberReviews, image };
      products.push(product);
    });

    // Returning product data in JSON format
    res.json(products);
  } catch (err) {
    // Handling errors during scraping process
    return res.status(500).json({ message: err.message });
  }
});

// Starting the server on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
