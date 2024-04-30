const express = require("express");
const axios = require("axios");
const cors = require("cors");
const { JSDOM } = require("jsdom");

const app = express();
app.use(cors());
const PORT = 5000;

function removeCSS(html) {
  return html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
}

app.get("/api/scrape", async (req, res) => {
  const { keyword } = req.query;

  if (!keyword) return res.status(400).json({ message: "Missing keyword" });

  try {
    const { data } = await axios.get(
      `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
        },
      }
    );
    const filteredHTML = removeCSS(data);

    const dom = new JSDOM(filteredHTML);
    const products = [];

    dom.window.document.querySelectorAll(".s-result-item").forEach((item) => {
      const titleElement = item.querySelector(".a-text-normal");
      const image = item.querySelector("img")?.getAttribute("src");
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
      const numberReviews = parseInt(numberReviewsText, 10) || "N/A";
      const product = { title, rating, numberReviews, image };
      products.push(product);
      console.log(product);
    });

    res.json(products);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
