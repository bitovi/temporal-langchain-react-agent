import * as z from "zod";
import { StructuredTool, tool } from "langchain";
import { Config } from "./config";

function personSearch(): StructuredTool {
  return getRequestSearchTool(
    "person_by_name_search",
    "/search/person",
    "Use this tool to search for information about persons by name."
  );
}

function personDetailsByPersonId(): StructuredTool {
  return getRequestByIdTool(
    "person_details_by_id",
    "/person/{id}",
    "Use this tool to fetch details about a person by their Id."
  );
}

function personMovieCreditsByPersonId(): StructuredTool {
  return getRequestByIdTool(
    "person_movie_credits_by_id",
    "/person/{id}/movie_credits",
    "Use this tool to fetch for movie credits of persons by their ID."
  );
}

function movieSearch(): StructuredTool {
  return getRequestSearchTool(
    "movie_by_title_search",
    "/search/movie",
    "Search for movies by their original, translated and alternative titles."
  );
}

function movieDetailsByMovieId(): StructuredTool {
  return getRequestByIdTool(
    "movie_details_by_id",
    "/movie/{id}",
    "Use this tool to fetch for information about movies by ID."
  );
}

function movieCreditsByMovieId(): StructuredTool {
  return getRequestByIdTool(
    "movie_credits_by_id",
    "/movie/{id}/credits",
    "Use this tool to fetch for credits information about movies by ID."
  );
}

function tvSearch(): StructuredTool {
  return getRequestSearchTool(
    "tv_by_name_search",
    "/search/tv",
    "Search for TV shows by their original, translated and also known as names."
  );
}

function tvDetailsBySeriesId(): StructuredTool {
  return getRequestByIdTool(
    "tv_details_by_id",
    "/tv/{id}",
    "Use this tool to fetch for information about TV shows by ID."
  );
}

function tvCreditsBySeriesId(): StructuredTool {
  return getRequestByIdTool(
    "tv_credits_by_id",
    "/tv/{id}/credits",
    "Use this tool to fetch for credits information about TV shows by ID."
  );
}

export function fetchStructuredTools(): StructuredTool[] {
  return [
    personSearch(),
    personDetailsByPersonId(),
    personMovieCreditsByPersonId(),
    movieSearch(),
    movieDetailsByMovieId(),
    movieCreditsByMovieId(),
    tvSearch(),
    tvDetailsBySeriesId(),
    tvCreditsBySeriesId(),
  ];
}

export function fetchStructuredToolsAsString(): string {
  const tools = fetchStructuredTools().map((tool) => {
    return `<tool>
    <name>${tool.name}</name>
    <description>${tool.description}</description>
    <schema>${JSON.stringify(z.toJSONSchema(tool.schema as z.ZodTypeAny))}</schema>
</tool>`;
  });
  return tools.join("\n");
}

/**
 * Handles making the authenticated requests to TMDb API.
 *
 * @param url The full URL to make the request to.
 * @returns The JSON response as a string.
 */
async function tmdb(url: string): Promise<string> {
  console.log("Fetching URL:", url);

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: "Bearer " + Config.TMDB_API_KEY,
    },
  };

  const result = await fetch(`https://api.themoviedb.org/3${url}`, options);
  const data = await result.json();
  return JSON.stringify(data);
}

function getRequestSearchTool(
  name: string,
  url: string,
  description: string
): StructuredTool {
  return tool(
    async (input: Record<string, string>) => {
      const params = new URLSearchParams();
      for (const key in input) {
        params.append(key, input[key]);
      }

      return tmdb(url + "?" + params.toString());
    },
    {
      name: name,
      description: description,
      schema: z.object({
        query: z.string().describe("The search query string"),
        include_adult: z
          .boolean()
          .optional()
          .describe("Whether to include adult content. Defaults to false."),
        language: z
          .string()
          .optional()
          .describe("The language for the results. Defaults to 'en-US'."),
        page: z
          .number()
          .optional()
          .describe("The page of results to return. Defaults to 1."),
      }),
    }
  );
}

function getRequestByIdTool(
  name: string,
  url: string,
  description: string
): StructuredTool {
  return tool(
    async (input: Record<string, string>) => {
      return tmdb(url.replace("{id}", encodeURIComponent(input.id)));
    },
    {
      name: name,
      description: description,
      schema: z.object({
        id: z.string().describe("The ID of the item to fetch information for"),
      }),
    }
  );
}
