import * as z from "zod";
import { StructuredTool, tool } from "langchain";
import { Config } from "./config";

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

export function searchEntityTool(
  name: string,
  url: string,
  description: string,
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
    },
  );
}

export function entityByIdTool(
  name: string,
  url: string,
  description: string,
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
    },
  );
}
