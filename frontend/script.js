// Function to perform Amazon product search
async function searchAmazon() {
  // Get keyword from input field and trim whitespace
  const keyword = document.getElementById("keywordInput").value.trim();
  // Get result container element
  const resultContainer = document.getElementById("results");

  // Check if keyword is empty
  if (!keyword) {
    alert("Please enter a keyword");
    return;
  }

  try {
    // Fetch data from API based on keyword
    const response = await fetch(
      `http://localhost:5000/api/scrape?keyword=${encodeURIComponent(keyword)}`
    );

    // Check if response is successful
    if (!response.ok) {
      throw new Error("Request failed");
    }

    // Parse response data as JSON
    const data = await response.json();

    // Clear previous content in result container
    resultContainer.innerHTML = "";

    // Display message if no results found
    if (data.length === 0) {
      resultContainer.textContent = "No results found.";
      return;
    }

    // Iterate through each product in the data
    data.forEach((product) => {
      // Create a new div element for each product
      const div = document.createElement("div");
      div.classList.add("box");

      // Create box content container
      const boxContent = document.createElement("div");
      boxContent.classList.add("box-content");
      div.appendChild(boxContent);

      // Create and append product image
      const img = document.createElement("img");
      img.classList.add("box-img");
      img.src = product.image;
      boxContent.appendChild(img);

      // Create and append product title with truncation and hover effect
      const title = document.createElement("h2");
      title.classList.add("box-title");
      title.textContent = truncateText(product.title, 50);
      title.title = product.title;
      // adding EventListener for hover effect on title (title is big)
      title.addEventListener("mouseover", function () {
        this.textContent = this.title;
      });
      title.addEventListener("mouseleave", function () {
        this.textContent = truncateText(this.title, 50);
      });
      boxContent.appendChild(title);

      // Create and append product rating and reviews information
      const ratingReviews = document.createElement("h2");
      ratingReviews.classList.add("box-RatingReviews");
      ratingReviews.textContent = `Rating: ${product.rating} - Reviews: ${product.numberReviews}`;
      boxContent.appendChild(ratingReviews);

      // Append the product div to the result container
      resultContainer.appendChild(div);
    });
  } catch (error) {
    // Log and display error if data fetching fails
    console.error("Error fetching data:", error);
    resultContainer.innerHTML = "An error occurred while fetching data.";
  }
}

// Function to truncate text based on maximum length
function truncateText(text, maxLength) {
  if (text.length > maxLength) {
    return text.slice(0, maxLength) + "...";
  } else {
    return text;
  }
}
