import puppeteer, { Browser, BrowserWorker } from "@cloudflare/puppeteer";

export async function getBrowser(
  BROWSER: BrowserWorker,
  wsEndpoint?: string,
): Promise<Browser | undefined> {
  let browser: Browser | undefined = undefined;
  if (BROWSER) {
    const sessions = await puppeteer.sessions(BROWSER);
    const sessionIds = sessions
      .filter(({ connectionId }) => !connectionId)
      .map(({ sessionId }) => sessionId);
    for (const sessionId of sessionIds) {
      try {
        console.log("Connecting to existing session: ", sessionId);
        browser = await puppeteer.connect(BROWSER, sessionId);
        break;
      } catch (error) {
        console.error(error);
        continue;
      }
    }
    if (!browser) {
      const limitsResp = await puppeteer.limits(BROWSER);
      const activitySessionIds = limitsResp.activeSessions.map(({ id }) => id);
      for (const sessionId of activitySessionIds) {
        try {
          console.log("Connecting to active session: ", sessionId);
          browser = await puppeteer.connect(BROWSER, sessionId);
          break;
        } catch (error) {
          console.error(error);
          continue;
        }
      }
    }
    if (!browser) {
      try {
        console.log("Launching new browser");
        browser = await puppeteer.launch(BROWSER, {
          keep_alive: 600000,
        });
      } catch (error) {
        console.error(error);
      }
    }
  }
  return browser;
}

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.ico', '.svg'];

// Check if URL is potentially an image based on extension
function isImageUrl(url: string): boolean {
  const urlLower = url.toLowerCase();
  return IMAGE_EXTENSIONS.some(ext => urlLower.endsWith(ext));
}

export async function extractImagesUrlsFromURL(
    browser: Browser,
    url: string,        
  ): Promise<string[]> {
    try {
      let images: string[] = [];
      const page = await browser.newPage();
      page.on("response", async (response) => {
        const responseUrl = response.url();
        const contentType = response.headers()["content-type"];
        const isImage = contentType?.startsWith("image") || isImageUrl(responseUrl);
        if (isImage) {
          images.push(responseUrl);
        }
      });
      await page.goto(url);
      await page.screenshot();
      await page.close();
      return images;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }