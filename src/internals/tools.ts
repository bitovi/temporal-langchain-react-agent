import * as z from "zod";
import { StructuredTool } from "langchain";
import { entityByIdTool, searchEntityTool } from "./tmdb";

function personSearch(): StructuredTool {
  return searchEntityTool(
    "person_by_name_search",
    "/search/person",
    "Use this tool to search for information about persons by name.",
  );
}

function personDetailsByPersonId(): StructuredTool {
  return entityByIdTool(
    "person_details_by_id",
    "/person/{id}",
    "Use this tool to fetch details about a person by their Id.",
  );
}

function personMovieCreditsByPersonId(): StructuredTool {
  return entityByIdTool(
    "person_movie_credits_by_id",
    "/person/{id}/movie_credits",
    "Use this tool to fetch for movie credits of persons by their ID.",
  );
}

function movieSearch(): StructuredTool {
  return searchEntityTool(
    "movie_by_title_search",
    "/search/movie",
    "Search for movies by their original, translated and alternative titles.",
  );
}

function movieDetailsByMovieId(): StructuredTool {
  return entityByIdTool(
    "movie_details_by_id",
    "/movie/{id}",
    "Use this tool to fetch for information about movies by ID.",
  );
}

function movieCreditsByMovieId(): StructuredTool {
  return entityByIdTool(
    "movie_credits_by_id",
    "/movie/{id}/credits",
    "Use this tool to fetch for credits information about movies by ID.",
  );
}

function tvSearch(): StructuredTool {
  return searchEntityTool(
    "tv_by_name_search",
    "/search/tv",
    "Search for TV shows by their original, translated and also known as names.",
  );
}

function tvDetailsBySeriesId(): StructuredTool {
  return entityByIdTool(
    "tv_details_by_id",
    "/tv/{id}",
    "Use this tool to fetch for information about TV shows by ID.",
  );
}

function tvCreditsBySeriesId(): StructuredTool {
  return entityByIdTool(
    "tv_credits_by_id",
    "/tv/{id}/credits",
    "Use this tool to fetch for credits information about TV shows by ID.",
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
