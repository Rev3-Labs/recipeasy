"use server"

import * as cheerio from "cheerio"
import type { Recipe } from "@/lib/types"
import { generateId } from "@/lib/utils"

// Utility function to clean and decode text
function cleanText(text: string): string {
  if (!text) return ""
  
  return text
    // Decode HTML entities
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&#x60;/g, "`")
    .replace(/&#x3D;/g, "=")
    .replace(/&#x3C;/g, "<")
    .replace(/&#x3E;/g, ">")
    .replace(/&#x3A;/g, ":")
    .replace(/&#x3B;/g, ";")
    .replace(/&#x21;/g, "!")
    .replace(/&#x40;/g, "@")
    .replace(/&#x23;/g, "#")
    .replace(/&#x24;/g, "$")
    .replace(/&#x25;/g, "%")
    .replace(/&#x5E;/g, "^")
    .replace(/&#x2B;/g, "+")
    .replace(/&#x7B;/g, "{")
    .replace(/&#x7D;/g, "}")
    .replace(/&#x7C;/g, "|")
    .replace(/&#x5C;/g, "\\")
    .replace(/&#x5B;/g, "[")
    .replace(/&#x5D;/g, "]")
    .replace(/&#x3F;/g, "?")
    .replace(/&#x2C;/g, ",")
    .replace(/&#x2E;/g, ".")
    .replace(/&#x2D;/g, "-")
    .replace(/&#x5F;/g, "_")
    .replace(/&#x28;/g, "(")
    .replace(/&#x29;/g, ")")
    .replace(/&#x3D;/g, "=")
    .replace(/&#x2A;/g, "*")
    .replace(/&#x26;/g, "&")
    // Handle numeric HTML entities (like &#x27; for apostrophe)
    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
    // Clean up extra whitespace
    .replace(/\s+/g, " ")
    .trim()
}

export async function fetchAndParseRecipe(url: string): Promise<Recipe> {
  try {
    // Fetch the HTML content from the URL
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`)
    }

    const html = await response.text()

    // Parse the HTML using cheerio
    const $ = cheerio.load(html)

    // First try to extract structured data (JSON-LD)
    const structuredData = extractStructuredData($)
    if (structuredData) {
      return {
        ...structuredData,
        url, // Ensure we use the original URL
      }
    }

    // Then try to extract microdata
    const microdata = extractMicrodata($)
    if (microdata) {
      return {
        ...microdata,
        url, // Ensure we use the original URL
      }
    }

    // Finally, fall back to HTML parsing
    return parseFromHTML($, url)
  } catch (error) {
    console.error("Error parsing recipe:", error)
    throw new Error("Failed to parse recipe from the provided URL. Please try another recipe site.")
  }
}

// Extract JSON-LD structured data
function extractStructuredData($: cheerio.CheerioAPI): Recipe | null {
  try {
    const jsonLdScripts = $('script[type="application/ld+json"]')

    for (let i = 0; i < jsonLdScripts.length; i++) {
      const scriptContent = $(jsonLdScripts[i]).html()
      if (!scriptContent) continue

      try {
        const data = JSON.parse(scriptContent)

        // Handle both single recipe and graph with multiple items
        const recipes = findRecipesInData(data)

        if (recipes && recipes.length > 0) {
          const recipeData = recipes[0]

          // Extract recipe information
          const title = cleanText(recipeData.name || "")

          // IMPROVED IMAGE EXTRACTION FROM STRUCTURED DATA
          let image = ""
          if (recipeData.image) {
            if (typeof recipeData.image === "string") {
              image = recipeData.image
            } else if (Array.isArray(recipeData.image)) {
              // Sometimes image is an array, take the first non-empty value
              for (const img of recipeData.image) {
                if (typeof img === "string" && img) {
                  image = img
                  break
                } else if (img && img.url) {
                  image = img.url
                  break
                }
              }
            } else if (recipeData.image.url) {
              image = recipeData.image.url
            } else if (recipeData.image["@id"]) {
              image = recipeData.image["@id"]
            }
          }

          // Extract description
          const description = cleanText(recipeData.description || "")

          // Handle ingredients (could be string or array)
          let ingredients: string[] = []
          if (Array.isArray(recipeData.recipeIngredient)) {
            ingredients = recipeData.recipeIngredient.map(cleanText)
          } else if (Array.isArray(recipeData.ingredients)) {
            ingredients = recipeData.ingredients.map(cleanText)
          }

          // Handle instructions (could be string or array of objects with text property)
          let directions: string[] = []
          if (typeof recipeData.recipeInstructions === "string") {
            directions = [cleanText(recipeData.recipeInstructions)]
          } else if (Array.isArray(recipeData.recipeInstructions)) {
            directions = recipeData.recipeInstructions
              .map((instruction: any) => {
                if (typeof instruction === "string") return cleanText(instruction)
                return cleanText(instruction.text || instruction.name || "")
              })
              .filter(Boolean)
          }

          // Extract categories
          const categories: string[] = []
          if (recipeData.recipeCategory) {
            if (Array.isArray(recipeData.recipeCategory)) {
              categories.push(...recipeData.recipeCategory.map(cleanText))
            } else if (typeof recipeData.recipeCategory === "string") {
              categories.push(cleanText(recipeData.recipeCategory))
            }
          }

          if (recipeData.keywords) {
            const keywords =
              typeof recipeData.keywords === "string"
                ? recipeData.keywords.split(",").map((k: string) => cleanText(k.trim()))
                : recipeData.keywords.map(cleanText)

            if (Array.isArray(keywords)) {
              categories.push(...keywords)
            }
          }

          // Extract yield/servings - improved handling
          let recipeYield = ""
          if (recipeData.recipeYield) {
            if (Array.isArray(recipeData.recipeYield)) {
              // Sometimes recipeYield is an array, take the first non-empty value
              for (const yield_ of recipeData.recipeYield) {
                if (yield_ && typeof yield_ === "string") {
                  recipeYield = yield_.trim()
                  break
                }
              }
            } else if (typeof recipeData.recipeYield === "string") {
              recipeYield = recipeData.recipeYield.trim()
            } else if (typeof recipeData.recipeYield === "number") {
              recipeYield = recipeData.recipeYield.toString()
            }
          }

          // Clean up the yield string
          recipeYield = cleanYieldString(recipeYield)

          // Ensure we have at least some content
          if (title && (ingredients.length > 0 || directions.length > 0)) {
            return {
              id: generateId(),
              url: recipeData.url || "",
              title,
              description,
              image,
              ingredients:
                ingredients.length > 0 ? ingredients : ["Ingredients not found. Please check the original recipe."],
              directions:
                directions.length > 0 ? directions : ["Directions not found. Please check the original recipe."],
              categories: categories.length > 0 ? [...new Set(categories)] : ["Recipe"],
              dateAdded: new Date().toISOString(),
              cookTime: recipeData.cookTime || "",
              prepTime: recipeData.prepTime || "",
              totalTime: recipeData.totalTime || "",
              yield: recipeYield,
            }
          }
        }
      } catch (e) {
        console.error("Error parsing JSON-LD:", e)
        // Continue to next script tag
      }
    }
  } catch (e) {
    console.error("Error extracting structured data:", e)
  }

  return null
}

// Helper function to find recipes in structured data
function findRecipesInData(data: any): any[] {
  if (!data) return []

  // Handle array of items
  if (Array.isArray(data)) {
    for (const item of data) {
      const recipes = findRecipesInData(item)
      if (recipes.length > 0) return recipes
    }
    return []
  }

  // Handle single recipe
  if (data["@type"] === "Recipe") {
    return [data]
  }

  // Handle graph with multiple items
  if (data["@graph"] && Array.isArray(data["@graph"])) {
    const recipes = data["@graph"].filter((item: any) => item["@type"] === "Recipe")
    if (recipes.length > 0) return recipes
  }

  // Handle nested objects
  for (const key in data) {
    if (typeof data[key] === "object" && data[key] !== null) {
      const recipes = findRecipesInData(data[key])
      if (recipes.length > 0) return recipes
    }
  }

  return []
}

// Extract microdata
function extractMicrodata($: cheerio.CheerioAPI): Recipe | null {
  try {
    // Look for elements with itemtype="http://schema.org/Recipe"
    const recipeElements = $('[itemtype="http://schema.org/Recipe"], [itemtype="https://schema.org/Recipe"]')

    if (recipeElements.length > 0) {
      const recipeEl = $(recipeElements[0])

      // Extract title
      const title = cleanText(
        recipeEl.find('[itemprop="name"]').first().text().trim() ||
        $("h1").first().text().trim() ||
        $("title").text().trim()
      )

      // Extract description
      const description = cleanText(recipeEl.find('[itemprop="description"]').first().text().trim() || "")

      // IMPROVED IMAGE EXTRACTION FROM MICRODATA
      let image = ""
      const imageElement = recipeEl.find('[itemprop="image"]')
      if (imageElement.length > 0) {
        // Try multiple attributes where the image URL might be stored
        image =
          imageElement.attr("src") ||
          imageElement.attr("content") ||
          imageElement.attr("href") ||
          imageElement.find("img").attr("src") ||
          ""
      }

      // Extract ingredients
      const ingredients: string[] = []
      recipeEl.find('[itemprop="recipeIngredient"], [itemprop="ingredients"]').each((_, el) => {
        const text = cleanText($(el).text().trim())
        if (text) ingredients.push(text)
      })

      // Extract instructions
      const directions: string[] = []
      recipeEl.find('[itemprop="recipeInstructions"]').each((_, el) => {
        // Check if this element contains list items
        const listItems = $(el).find("li")
        if (listItems.length > 0) {
          listItems.each((_, li) => {
            const text = cleanText($(li).text().trim())
            if (text) directions.push(text)
          })
        } else {
          const text = cleanText($(el).text().trim())
          if (text) directions.push(text)
        }
      })

      // Extract categories
      const categories: string[] = []
      recipeEl.find('[itemprop="recipeCategory"]').each((_, el) => {
        const text = cleanText($(el).text().trim())
        if (text) categories.push(text)
      })

      // Extract times
      const cookTime = recipeEl.find('[itemprop="cookTime"]').attr("content") || ""
      const prepTime = recipeEl.find('[itemprop="prepTime"]').attr("content") || ""
      const totalTime = recipeEl.find('[itemprop="totalTime"]').attr("content") || ""

      // Extract yield - improved handling
      let recipeYield = ""

      // Try multiple ways to get the yield
      const yieldElements = recipeEl.find('[itemprop="recipeYield"]')
      if (yieldElements.length > 0) {
        // Try content attribute first
        recipeYield = $(yieldElements[0]).attr("content") || $(yieldElements[0]).text().trim()
      }

      // Clean up the yield string
      recipeYield = cleanYieldString(recipeYield)

      if (title && (ingredients.length > 0 || directions.length > 0)) {
        return {
          id: generateId(),
          url: recipeEl.find('[itemprop="url"]').attr("href") || "",
          title,
          description,
          image,
          ingredients:
            ingredients.length > 0 ? ingredients : ["Ingredients not found. Please check the original recipe."],
          directions: directions.length > 0 ? directions : ["Directions not found. Please check the original recipe."],
          categories: categories.length > 0 ? categories : ["Recipe"],
          dateAdded: new Date().toISOString(),
          cookTime,
          prepTime,
          totalTime,
          yield: recipeYield,
        }
      }
    }
  } catch (e) {
    console.error("Error extracting microdata:", e)
  }

  return null
}

// Parse from HTML as a last resort
function parseFromHTML($: cheerio.CheerioAPI, url: string): Recipe {
  // Extract title
  const title = cleanText($("h1").first().text().trim() || $("title").text().trim() || new URL(url).hostname + " Recipe")

  // Extract description
  let description = cleanText($('meta[name="description"]').attr("content") || "")
  if (!description) {
    // Try to find a description in common places
    const possibleDescriptions = [
      $('p[class*="description"], div[class*="description"]').first().text().trim(),
      $('p[class*="summary"], div[class*="summary"]').first().text().trim(),
      $('p[class*="intro"], div[class*="intro"]').first().text().trim(),
      $("p").first().text().trim(),
    ]

    for (const desc of possibleDescriptions) {
      if (desc && desc.length > 20 && desc.length < 500) {
        description = cleanText(desc)
        break
      }
    }
  }

  // IMPROVED IMAGE EXTRACTION FROM HTML
  let image = ""

  // Strategy 1: Check meta tags (most reliable)
  image =
    $('meta[property="og:image"]').attr("content") ||
    $('meta[name="twitter:image"]').attr("content") ||
    $('meta[property="og:image:secure_url"]').attr("content") ||
    ""

  // Strategy 2: Look for specific recipe image patterns
  if (!image) {
    const possibleImageSelectors = [
      'img[class*="hero"]',
      'img[class*="featured"]',
      'img[class*="recipe-image"]',
      'img[class*="recipeImage"]',
      'img[class*="recipe_image"]',
      'img[class*="mainImage"]',
      'img[class*="main-image"]',
      'img[id*="recipe-image"]',
      "img[data-pin-media]",
      ".recipe-image img",
      ".recipeImage img",
      ".recipe_image img",
      ".hero-photo img",
      ".post-thumbnail img",
      ".featured-image img",
      ".entry-image img",
      "figure img",
    ]

    for (const selector of possibleImageSelectors) {
      const img = $(selector).first()
      if (img.length > 0) {
        // Try different attributes where the image URL might be stored
        image = img.attr("src") || img.attr("data-src") || img.attr("data-lazy-src") || img.attr("data-pin-media") || ""
        if (image) break
      }
    }
  }

  // Strategy 3: Look for the first large image in the content area
  if (!image) {
    const contentSelectors = [
      "article",
      ".post-content",
      ".entry-content",
      ".content",
      ".recipe-content",
      "main",
      "#content",
      ".main-content",
    ]

    for (const selector of contentSelectors) {
      const contentArea = $(selector)
      if (contentArea.length > 0) {
        contentArea.find("img").each((_, img) => {
          if (!image) {
            const imgEl = $(img)
            const src = imgEl.attr("src") || imgEl.attr("data-src") || imgEl.attr("data-lazy-src") || ""
            const width = Number.parseInt(imgEl.attr("width") || "0", 10)
            const height = Number.parseInt(imgEl.attr("height") || "0", 10)

            // Only use images that are reasonably large
            if (src && ((width > 300 && height > 200) || !width || !height)) {
              image = src
            }
          }
        })
        if (image) break
      }
    }
  }

  // Strategy 4: Fall back to any image that seems large enough
  if (!image) {
    $("img").each((_, img) => {
      if (!image) {
        const imgEl = $(img)
        const src = imgEl.attr("src") || imgEl.attr("data-src") || ""
        const width = Number.parseInt(imgEl.attr("width") || "0", 10)
        const height = Number.parseInt(imgEl.attr("height") || "0", 10)

        // Only use images that are reasonably large and not icons
        if (src && src.match(/\.(jpe?g|png|webp)($|\?)/i) && ((width > 300 && height > 200) || !width || !height)) {
          image = src
        }
      }
    })
  }

  // Strategy 5: Last resort - use any image
  if (!image) {
    image = $("img").first().attr("src") || ""
  }

  // Make sure image URL is absolute
  if (image && !image.startsWith("http") && !image.startsWith("data:") && !image.startsWith("/placeholder")) {
    try {
      const baseUrl = new URL(url)
      // Handle both absolute and relative paths
      if (image.startsWith("/")) {
        image = `${baseUrl.origin}${image}`
      } else {
        // Get the directory path of the current URL
        const pathParts = baseUrl.pathname.split("/")
        pathParts.pop() // Remove the last part (file or empty string)
        const dirPath = pathParts.join("/")
        image = `${baseUrl.origin}${dirPath}/${image}`
      }
    } catch (e) {
      console.error("Error converting relative URL to absolute:", e)
    }
  }

  // If we still don't have an image, use a placeholder
  if (!image) {
    image = `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(title)}`
  }

  // Extract ingredients - try multiple strategies
  const ingredients: string[] = []

  // Strategy 1: Look for common ingredient section identifiers
  const ingredientSections = $('section[class*="ingredient"], div[class*="ingredient"], ul[class*="ingredient"]')
  if (ingredientSections.length > 0) {
    ingredientSections.each((_, section) => {
      $(section)
        .find("li")
        .each((_, li) => {
          const text = cleanText($(li).text().trim())
          if (text && !ingredients.includes(text)) ingredients.push(text)
        })
    })
  }

  // Strategy 2: Look for lists near headers that mention ingredients
  if (ingredients.length === 0) {
    $("h2, h3, h4").each((_, header) => {
      const headerText = $(header).text().toLowerCase()
      if (headerText.includes("ingredient")) {
        let list = $(header).next("ul, ol")
        if (list.length === 0) {
          list = $(header).parent().find("ul, ol").first()
        }

        list.find("li").each((_, li) => {
          const text = cleanText($(li).text().trim())
          if (text && !ingredients.includes(text)) ingredients.push(text)
        })
      }
    })
  }

  // Strategy 3: Look for any list items that might be ingredients
  if (ingredients.length === 0) {
    $("ul li").each((_, li) => {
      const text = cleanText($(li).text().trim())
      if (text && text.length > 3 && text.length < 200 && !text.includes("http")) {
        ingredients.push(text)
      }
    })
  }

  // Extract directions - try multiple strategies
  const directions: string[] = []

  // Strategy 1: Look for common direction section identifiers
  const directionSections = $(
    'section[class*="instruction"], section[class*="direction"], div[class*="instruction"], div[class*="direction"], div[class*="method"]',
  )
  if (directionSections.length > 0) {
    directionSections.each((_, section) => {
      $(section)
        .find("li, p")
        .each((_, el) => {
          const text = cleanText($(el).text().trim())
          if (text && text.length > 10 && !directions.includes(text)) directions.push(text)
        })
    })
  }

  // Strategy 2: Look for lists near headers that mention directions
  if (directions.length === 0) {
    $("h2, h3, h4").each((_, header) => {
      const headerText = $(header).text().toLowerCase()
      if (
        headerText.includes("instruction") ||
        headerText.includes("direction") ||
        headerText.includes("method") ||
        headerText.includes("preparation")
      ) {
        let list = $(header).next("ol, ul")
        if (list.length === 0) {
          list = $(header).parent().find("ol, ul").first()
        }

        if (list.length === 0) {
          // If no list, try paragraphs
          const paragraphs = $(header).nextAll("p").slice(0, 10)
          paragraphs.each((_, p) => {
            const text = $(p).text().trim()
            if (text && text.length > 10) directions.push(text)
          })
        } else {
          list.find("li").each((_, li) => {
            const text = $(li).text().trim()
            if (text && text.length > 10) directions.push(text)
          })
        }
      }
    })
  }

  // Strategy 3: Look for ordered lists that might be directions
  if (directions.length === 0) {
    $("ol li").each((_, li) => {
      const text = $(li).text().trim()
      if (text && text.length > 10 && text.length < 500) {
        directions.push(text)
      }
    })
  }

  // Try to determine categories
  const categories: string[] = []
  const lowerTitle = title.toLowerCase()

  // Extract categories from meta keywords
  const keywords = $('meta[name="keywords"]').attr("content")
  if (keywords) {
    keywords.split(",").forEach((keyword) => {
      const trimmed = keyword.trim()
      if (trimmed && trimmed.length < 20) {
        categories.push(trimmed)
      }
    })
  }

  // Add some categories based on the title and ingredients
  if (lowerTitle.includes("dinner") || lowerTitle.includes("meal")) categories.push("Dinner")
  if (lowerTitle.includes("dessert") || lowerTitle.includes("cake") || lowerTitle.includes("cookie"))
    categories.push("Dessert")
  if (lowerTitle.includes("quick") || lowerTitle.includes("easy") || lowerTitle.includes("simple"))
    categories.push("Quick & Easy")

  // Check ingredients for vegetarian status
  const meatIngredients = ["chicken", "beef", "pork", "meat", "fish", "salmon", "tuna", "shrimp"]
  const hasNoMeat = !ingredients.some((ingredient) =>
    meatIngredients.some((meat) => ingredient.toLowerCase().includes(meat)),
  )
  if (hasNoMeat) categories.push("Vegetarian")

  // If we couldn't determine any categories, add a default
  if (categories.length === 0) {
    categories.push("Recipe")
  }

  // Try to extract cook time, prep time, and yield
  let cookTime = ""
  let prepTime = ""
  let totalTime = ""
  let recipeYield = ""

  // Look for time information in text
  $("*:contains('Cook time'), *:contains('Cooking time'), *:contains('Cook Time')").each((_, el) => {
    const text = $(el).text().trim()
    if (text.length < 100) {
      const match = text.match(/cook(?:ing)?\s*time:?\s*(\d+\s*(?:min|minute|hour|hr)s?)/i)
      if (match && match[1]) cookTime = match[1]
    }
  })

  $("*:contains('Prep time'), *:contains('Preparation time'), *:contains('Prep Time')").each((_, el) => {
    const text = $(el).text().trim()
    if (text.length < 100) {
      const match = text.match(/prep(?:aration)?\s*time:?\s*(\d+\s*(?:min|minute|hour|hr)s?)/i)
      if (match && match[1]) prepTime = match[1]
    }
  })

  $("*:contains('Total time'), *:contains('Total Time')").each((_, el) => {
    const text = $(el).text().trim()
    if (text.length < 100) {
      const match = text.match(/total\s*time:?\s*(\d+\s*(?:min|minute|hour|hr)s?)/i)
      if (match && match[1]) totalTime = match[1]
    }
  })

  // Look for serving information using multiple strategies
  const yieldPatterns = [
    /serves:?\s*(\d+(?:-\d+)?(?:\s*(?:people|persons|servings))?)/i,
    /servings:?\s*(\d+(?:-\d+)?)/i,
    /yield:?\s*(\d+(?:-\d+)?(?:\s*(?:servings|portions))?)/i,
    /makes:?\s*(\d+(?:-\d+)?(?:\s*(?:servings|portions|people))?)/i,
    /for:?\s*(\d+(?:-\d+)?(?:\s*(?:people|persons|servings))?)/i,
  ]

  // First try to find elements that specifically mention servings
  $("*:contains('Serves'), *:contains('Servings'), *:contains('Yield'), *:contains('Makes')").each((_, el) => {
    if (recipeYield) return // Skip if we already found yield

    const text = $(el).text().trim()
    if (text.length < 100) {
      // Avoid long paragraphs
      for (const pattern of yieldPatterns) {
        const match = text.match(pattern)
        if (match && match[1]) {
          recipeYield = match[1].trim()
          break
        }
      }
    }
  })

  // Strategy 2: Look for elements with specific classes or IDs
  if (!recipeYield) {
    $('[class*="yield"], [class*="serving"], [id*="yield"], [id*="serving"]').each((_, el) => {
      if (recipeYield) return // Skip if we already found yield

      const text = $(el).text().trim()
      if (text.length < 100) {
        // Try to extract just the number if the text contains a number
        const numberMatch = text.match(/\d+(?:-\d+)?/)
        if (numberMatch) {
          recipeYield = numberMatch[0]
        } else {
          recipeYield = text
        }
      }
    })
  }

  // Strategy 3: Look for data attributes that might contain serving info
  if (!recipeYield) {
    $("[data-serves], [data-yield], [data-servings]").each((_, el) => {
      if (recipeYield) return // Skip if we already found yield

      recipeYield = $(el).attr("data-serves") || $(el).attr("data-yield") || $(el).attr("data-servings") || ""
    })
  }

  // Strategy 4: Look for meta tags
  if (!recipeYield) {
    recipeYield = $('meta[name="servings"], meta[property="servings"]').attr("content") || ""
  }

  // Clean up the yield string
  recipeYield = cleanYieldString(recipeYield)

  // Ensure we have at least some content
  if (ingredients.length === 0) ingredients.push("Ingredients not found. Please check the original recipe.")
  if (directions.length === 0) directions.push("Directions not found. Please check the original recipe.")

  return {
    id: generateId(),
    url,
    title,
    description,
    image,
    ingredients,
    directions,
    categories: [...new Set(categories)], // Remove duplicates
    dateAdded: new Date().toISOString(),
    cookTime,
    prepTime,
    totalTime,
    yield: recipeYield,
  }
}

// Helper function to clean up yield strings
function cleanYieldString(yieldStr: string): string {
  if (!yieldStr) return ""

  // Convert to string if it's not already
  yieldStr = String(yieldStr)

  // Remove common prefixes
  yieldStr = yieldStr.replace(/^(?:yield|serves|servings|makes|for)s?:?\s*/i, "")

  // Clean up the string
  yieldStr = yieldStr.trim()

  // If it's just a number, add "servings"
  if (/^\d+$/.test(yieldStr)) {
    yieldStr = `${yieldStr} servings`
  }

  // If it's a range like "4-6", add "servings"
  if (/^\d+-\d+$/.test(yieldStr)) {
    yieldStr = `${yieldStr} servings`
  }

  // Handle special cases
  if (yieldStr.toLowerCase() === "one" || yieldStr === "1") {
    yieldStr = "1 serving"
  }

  return yieldStr
}
