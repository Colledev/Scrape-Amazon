async function searchAmazon() {
  const keyword = document.getElementById("keywordInput").value.trim();
  const resultContainer = document.getElementById("results");

  if (!keyword) {
    alert("Please enter a keyword");
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:5000/api/scrape?keyword=${encodeURIComponent(keyword)}`
    );

    if (!response.ok) {
      throw new Error("Request failed");
    }

    const data = await response.json();

    resultContainer.innerHTML = "";

    if (data.length === 0) {
      resultContainer.textContent = "No results found.";
      return;
    }

    data.forEach((product) => {
      const div = document.createElement("div");
      div.classList.add("box");

      const boxContent = document.createElement("div");
      boxContent.classList.add("box-content");
      div.appendChild(boxContent);

      const img = document.createElement("img");
      img.classList.add("box-img");
      img.src = product.image;
      boxContent.appendChild(img);

      const title = document.createElement("h2");
      title.classList.add("box-title");
      title.textContent = truncateText(product.title, 50);
      title.title = product.title;
      title.addEventListener("mouseover", function () {
        this.textContent = this.title;
      });
      title.addEventListener("mouseleave", function () {
        this.textContent = truncateText(this.title, 50);
      });
      boxContent.appendChild(title);

      const ratingReviews = document.createElement("h2");
      ratingReviews.classList.add("box-RatingReviews");
      ratingReviews.textContent = `Rating: ${product.rating} - Reviews: ${product.numberReviews}`;
      boxContent.appendChild(ratingReviews);

      resultContainer.appendChild(div);
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    resultContainer.innerHTML = "An error occurred while fetching data.";
  }
}

function truncateText(text, maxLength) {
  if (text.length > maxLength) {
    return text.slice(0, maxLength) + "...";
  } else {
    return text;
  }
}
