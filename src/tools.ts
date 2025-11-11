import * as z from "zod";
import { StructuredTool, tool } from "langchain";
import { Config } from "./config";

function actorSearch(): StructuredTool {
  return tool(
    async (input) => {
      const url =
        "https://api.themoviedb.org/3/search/person?include_adult=false&language=en-US&page=1&query=" +
        encodeURIComponent(input.name);
      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: "Bearer " + Config.TMDB_API_KEY,
        },
      };

      const result = await fetch(url, options);
      const data = await result.json();
      return JSON.stringify(data);
    },
    {
      name: "actor_by_name_search",
      description:
        "Use this tool to search for information about actors by name.",
      schema: z.object({
        name: z.string().describe("The name of the actor to search for"),
      }),
    }
  );
}

function actorByActorId(): StructuredTool {
  return tool(
    async (input) => {
      const url =
        "https://api.themoviedb.org/3/person/" +
        encodeURIComponent(input.id) +
        "?language=en-US";
      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: "Bearer " + Config.TMDB_API_KEY,
        },
      };

      const result = await fetch(url, options);
      const data = await result.json();
      return JSON.stringify(data);
    },
    {
      name: "actor_by_id",
      description: "Use this tool to fetch for information about actors by ID.",
      schema: z.object({
        id: z.string().describe("The ID of the actor to fetch information for"),
      }),
    }
  );
}

function actorMovieCreditsByActorId(): StructuredTool {
  return tool(
    async (input) => {
      const url =
        "https://api.themoviedb.org/3/person/" +
        encodeURIComponent(input.id) +
        "/movie_credits?language=en-US";
      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: "Bearer " + Config.TMDB_API_KEY,
        },
      };

      const result = await fetch(url, options);
      const data = await result.json();
      return JSON.stringify(data);
    },
    {
      name: "actor_movie_credits_by_id",
      description:
        "Use this tool to fetch for movie credits of actors by their ID.",
      schema: z.object({
        id: z
          .string()
          .describe("The ID of the actor to fetch movie credits for"),
      }),
    }
  );
}

function movieSearch(): StructuredTool {
  return tool(
    async (input) => {
      const url =
        "https://api.themoviedb.org/3/search/movie?query=test&include_adult=false&language=en-US&page=1&query=" +
        encodeURIComponent(input.title);
      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: "Bearer " + Config.TMDB_API_KEY,
        },
      };

      const result = await fetch(url, options);
      const data = await result.json();
      return JSON.stringify(data);
    },
    {
      name: "movie_by_title_search",
      description:
        "Use this tool to search for information about movies by title",
      schema: z.object({
        title: z.string().describe("The title of the movie to search for"),
      }),
    }
  );
}

function movieDetailsByMovieId(): StructuredTool {
  return tool(
    async (input) => {
      const url =
        "https://api.themoviedb.org/3/movie/" +
        encodeURIComponent(input.id) +
        "?language=en-US";
      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: "Bearer " + Config.TMDB_API_KEY,
        },
      };

      const result = await fetch(url, options);
      const data = await result.json();
      return JSON.stringify(data);
    },
    {
      name: "movie_details_by_id",
      description: "Use this tool to fetch for information about movies by ID",
      schema: z.object({
        id: z.string().describe("The ID of the movie to fetch information for"),
      }),
    }
  );
}

export function fetchStructuredTools(): StructuredTool[] {
  return [
    actorSearch(),
    movieSearch(),
    actorByActorId(),
    actorMovieCreditsByActorId(),
    movieDetailsByMovieId(),
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
