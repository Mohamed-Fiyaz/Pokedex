document.addEventListener("DOMContentLoaded", () => {
  const pokemonCards = document.querySelectorAll(".pokemon-card");

  pokemonCards.forEach((card) => {
    const details = card.querySelector(".pokemon-details");

    card.addEventListener("mouseenter", () => {
      showDetails(card, "<%= pokemon.name %>");
    });

    card.addEventListener("mouseleave", () => {
      hideDetails(card, "<%= pokemon.name %>");
    });
  });

  // Global functions to be called from HTML attributes
  window.showDetails = function (card, pokemonName) {
    const details = card.querySelector(".pokemon-details");
    if (details) {
      details.classList.add("active");
    }
  };

  window.hideDetails = function (card, pokemonName) {
    const details = card.querySelector(".pokemon-details");
    if (details) {
      details.addEventListener(
        "transitionend",
        () => {
          details.classList.remove("active");
        },
        { once: true }
      );
      details.classList.remove("active");
    }
  };

  function goToPage() {
    const pageNumber = document.getElementById("pageNumberInput").value;
    if (pageNumber.trim() !== "" && !isNaN(pageNumber)) {
      window.location.href = `?page=${pageNumber}`;
    }
  }

  // Event listener for the "Go" button
  const goButton = document.getElementById("goButton");
  if (goButton) {
    goButton.addEventListener("click", goToPage);
  }

  // Event listener for the enter key in the input field
  const pageNumberInput = document.getElementById("pageNumberInput");
  if (pageNumberInput) {
    pageNumberInput.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        goToPage();
      }
    });
  }

  // Event listener for the form submission
  const searchForm = document.getElementById("searchInput");
  if (searchForm) {
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      goToPage();
    });
  }
});
