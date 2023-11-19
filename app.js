const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const axios = require("axios");
const axiosRetry = require("axios-retry");

const app = express();
const PORT = process.env.PORT || 3030;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

const axiosInstance = axios.create();
axiosRetry(axiosInstance, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
});

function toTitleCase(str) {
  return str.replace(/\b\w/g, (match) => match.toUpperCase());
}

app.get("/", async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    const searchTerm = req.query.search || "";

    const parsedPage = parseInt(page, 10);
    if (isNaN(parsedPage) || parsedPage <= 0 || parsedPage !== Number(page)) {
      return res.redirect("/error");
    }

    if (searchTerm) {
      try {
        const searchResponse = await axiosInstance.get(
          `https://pokeapi.co/api/v2/pokemon/${searchTerm}`
        );

        const detailsResponse = searchResponse.data;
        const pokemonList = [
          {
            name: toTitleCase(detailsResponse.name),
            order: detailsResponse.order,
            sprites: detailsResponse.sprites,
            stats: detailsResponse.stats,
          },
        ];

        return res.render("home", { pokemonList, currentPage: 1, searchTerm });
      } catch (searchError) {
        console.error(
          `Error searching for ${searchTerm}:`,
          searchError.message
        );
        return res.redirect("/error");
      }
    }

    const response = await axiosInstance.get(
      `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`
    );

    const totalCount = response.data.count;
    const maxPages = Math.ceil(totalCount / limit);

    const pokemonList = await Promise.all(
      response.data.results.map(async (pokemon) => {
        try {
          const detailsResponse = await axiosInstance.get(pokemon.url);
          return {
            name: toTitleCase(pokemon.name),
            order: detailsResponse.data.order,
            sprites: detailsResponse.data.sprites,
            stats: detailsResponse.data.stats,
          };
        } catch (detailsError) {
          console.error(
            `Error fetching details for ${pokemon.name}:`,
            detailsError.message
          );
          return null;
        }
      })
    );

    if (pokemonList.length === 0) {
      return res.redirect("/error");
    }

    const filteredPokemonList = pokemonList.filter(
      (pokemon) => pokemon !== null
    );

    res.render("home", {
      pokemonList: filteredPokemonList,
      currentPage: parsedPage,
      searchTerm,
      maxPages,
    });
  } catch (error) {
    console.error("Error fetching Pokémon list:", error.message);
    res.status(500).send(`Internal Server Error: ${error.message}`);
  }
});

// Error route
app.get("/error", (req, res) => {
  res.status(404).render("error", { limit: req.query.limit || 0 });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
