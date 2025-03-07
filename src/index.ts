import { WorkerEntrypoint } from "cloudflare:workers";
import { ProxyToSelf } from "workers-mcp";
import { extractImagesUrlsFromURL, getBrowser } from "./extract";

export default class MyWorker extends WorkerEntrypoint<Env> {
	/**
	 * Generate an image using the `flux-1-schnell` model. Works best with 8 steps.
	 *
	 * @param {string} prompt - A text description of the image you want to generate.
	 * @param {number} steps - The number of diffusion steps; higher values can improve quality but take longer. Must be between 4 and 8, inclusive.
	 * @return {string} the url of the image.
	 * */
	async generateImage(prompt: string, steps: number) {
		const response = await this.env.AI.run(
			"@cf/black-forest-labs/flux-1-schnell",
			{
				prompt,
				steps,
			},
		);
		const binaryString = atob(response.image!);
		const img = Uint8Array.from(binaryString, (m) => m.codePointAt(0)!);
		const key = `${crypto.randomUUID()}.png`;
		await this.env.R2_BUCKET.put(key, new Blob([img], { type: "image/png" }));
		return `${this.env.BUCKET_CDN}/${key}`;
	}

	/**
	 * Screenshot a URL.
	 * @param {string} url - The url of the page you want to screenshot.
	 * @return {string} the url of the image.
	 * */
	async screenshotURL(url: string) {
		const browser = await getBrowser(this.env.BROWSER);
		if (!browser) {
			return Response.json({ error: "Failed to get browser" }, { status: 500 });
		}
		const page = await browser.newPage();
		await page.setViewport({ width: 1920, height: 1080 });
		await page.goto(url);
		const screenshot = await page.screenshot();
		await page.close();
		const key = `${crypto.randomUUID()}.png`;
		await this.env.R2_BUCKET.put(
			key,
			new Blob([screenshot], { type: "image/png" }),
		);
		return `${this.env.BUCKET_CDN}/${key}`;
	}

	/**
	 * Extract images from a URL.
	 * @param {string} url - The url of the page you want to extract images from.
	 * @return {string} the images urls, separated by commas.
	 * */
	async extractImagesFromURL(url: string) {
		try {
			const browser = await getBrowser(this.env.BROWSER);
			if (!browser) {
				return Response.json(
					{ error: "Failed to get browser" },
					{ status: 500 },
				);
			}
			const images = await extractImagesUrlsFromURL(browser, url);
			return images.join(",");
		} catch (error) {
			console.error(error);
			return Response.json(
				{ error: "Failed to extract images from URL" },
				{ status: 500 },
			);
		}
	}

	/**
	 * @ignore
	 **/
	async fetch(request: Request): Promise<Response> {
		return new ProxyToSelf(this).fetch(request);
	}
}
