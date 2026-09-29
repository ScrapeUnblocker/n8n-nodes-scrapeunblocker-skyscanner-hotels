# n8n-nodes-scrapeunblocker-skyscanner-hotels

This is an n8n community node. It lets you search **live hotel prices on Skyscanner** for any city and dates in your n8n workflows and get them as JSON: nightly and total price, star rating, guest score and review count, location, image and a booking link.

The node runs the [Skyscanner Hotels Scraper](https://apify.com/scrapeunblocker/skyscanner-hotels-scraper) Actor by ScrapeUnblocker on the [Apify](https://apify.com) platform with **your own Apify account**, waits for the run to finish and returns every scraped record as an n8n item.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

[Installation](#installation)
[Credentials](#credentials)
[Operations](#operations)
[Output](#output)
[Example workflow](#example-workflow)
[Pricing](#pricing)
[Compatibility](#compatibility)
[Resources](#resources)
[Version history](#version-history)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation. The npm package name is `n8n-nodes-scrapeunblocker-skyscanner-hotels`.

## Credentials

The node authenticates with an **Apify API token**. Every run starts on the Apify account that owns the token and is billed to that account (see [Pricing](#pricing)).

### 1. Create an Apify account (skip if you already have one)

1. Go to [console.apify.com/sign-up](https://console.apify.com/sign-up) and sign up with email, Google or GitHub.
2. Confirm your email address if Apify asks you to.

The free Apify plan needs no credit card and includes a monthly usage credit, which is enough to try the node. Current plan limits are listed on [apify.com/pricing](https://apify.com/pricing).

### 2. Get your API token

1. Open [Apify Console](https://console.apify.com) and go to **Settings** → **API & Integrations**, or open [console.apify.com/settings/integrations](https://console.apify.com/settings/integrations) directly.
2. Find the **Personal API tokens** section.
3. Either use the existing token (the one marked *Default API token created on sign up*): click the eye icon to reveal it or the copy icon to copy it.
4. Or create a dedicated token for n8n (recommended, so you can revoke it without affecting anything else):
   1. Click **+ Add new token** (the button may read **Create new token**).
   2. In the **Create a new personal API token** dialog, enter a **Description** such as `n8n`.
   3. Optionally switch on **Set expiration date** and pick a date.
   4. Leave **Limit token permissions** switched off. A token with limited permissions may not be allowed to run this Actor or read its results.
   5. Click **Create** and copy the new token.

The token starts with `apify_api_`. Treat it like a password: anyone who has it can run Actors on your account. You can revoke or rotate it on the same page at any time.

> Working in an Apify **organization**? Switch to the organization in Apify Console first and copy a token from its **API & Integrations** page, so runs are billed to the organization.

### 3. Add the credential in n8n

1. Add the **Skyscanner Hotels Scraper** node to a workflow and open it.
2. In **Credential to connect with**, choose **Create new credential**. (You can also create an **Apify API** credential from the n8n credentials list.)
3. Paste the token into **API Key** and click **Save**. n8n checks the token right away; an invalid token shows *Authorization failed - please check your credentials*.

Already have an **Apify API** credential in n8n (for example from the official Apify node)? This node uses the same credential type, so you can simply select it.

## Operations

Pick a **Resource** and an **Operation**. Each n8n input item starts one Apify run. List fields accept several values separated by commas or new lines, or an array returned by an expression.

| Resource | Operation | Fields | Returns |
|---|---|---|---|
| **Hotel** | Search | **Destination** (required) - City or place to search hotels in, e.g. 'London' or 'Paris'<br>**Max Results** - Maximum number of hotels to return, cheapest first (1-300). Results come in pages of about 35, so a smaller value can still return a full first page | One item per hotel, cheapest first |

### Options

| Option | Description |
|---|---|
| **Adults** | Number of adult guests (1-16) |
| **Check-In Date** | Check-in date as YYYY-MM-DD. Leave blank for about 30 days from today. |
| **Check-Out Date** | Check-out date as YYYY-MM-DD. Leave blank for 2 nights after check-in. |
| **Currency** | Currency of the prices (ISO code, e.g. EUR, USD or GBP). Defaults to EUR. |
| **Locale** | Language of the results (e.g. en-GB or de-DE). Defaults to en-GB. |
| **Market** | Country you are booking from (e.g. UK, US or DE). It affects prices. Defaults to UK. |
| **Rooms** | Number of rooms (1-8) |
| **Timeout (Seconds)** | Maximum run time of the Apify run. `0` keeps the Actor default. A run that times out fails the node. |

### How a run works

1. The node starts the Actor on your Apify account with the fields you set.
2. It waits for the run to finish.
3. It returns every record from the run's dataset as a separate n8n item.

The run is also visible in Apify Console under **Runs**. If a run fails or times out, the node error links to the run log and tells you whether any results were saved before it stopped.

Stopping the n8n execution only stops the node from waiting: the Apify run keeps going and its results are still charged. To stop it, abort the run in Apify Console under **Runs**, and use **Timeout (Seconds)** to cap long runs up front.

### Use as an AI Agent tool

The node can be attached to an n8n **AI Agent** as a tool, so the agent can call it on its own.

## Output

- One item per hotel, cheapest first, with hotel ID, name and Skyscanner URL, price per night (number and formatted) and total price for the stay, currency, star rating, guest rating with its description and review count, area or distance from the centre, and an image.

Fields of a returned item: `name`, `price`, `priceFormatted`, `currency`, `priceType`, `priceTotal`, `stars`, `rating`, `ratingDescription`, `reviews`, `distance`, `image`, `url`, `id`.

Example item (shortened):

```json
{
  "name": "Novotel London West",
  "price": 104,
  "priceFormatted": "€104",
  "currency": "EUR",
  "priceType": "per_night",
  "priceTotal": 208,
  "stars": 4,
  "rating": 4.1,
  "ratingDescription": "Very good",
  "reviews": 3101,
  "distance": "London Borough of Hammersmith and Fulham, London",
  "image": "https://content.skyscnr.com/available/2204795658/2204795658_WxH.jpg",
  "url": "https://www.skyscanner.net/hotels/united-kingdom/london-hotels/novotel-london...",
  "id": "71783371"
}
```

## Example workflow

To try the node in a minute, copy the workflow below, paste it into the n8n editor (Ctrl+V / Cmd+V), open the **Skyscanner Hotels Scraper** node, select your **Apify API** credential and click **Execute workflow**.

```json
{
  "nodes": [
    {
      "parameters": {},
      "name": "When clicking 'Execute workflow'",
      "type": "n8n-nodes-base.manualTrigger",
      "typeVersion": 1,
      "position": [
        0,
        0
      ]
    },
    {
      "parameters": {
        "resource": "hotel",
        "operation": "search",
        "destination": "London",
        "maxResults": 5,
        "options": {}
      },
      "name": "Skyscanner Hotels Scraper",
      "type": "n8n-nodes-scrapeunblocker-skyscanner-hotels.skyscannerHotelsScraper",
      "typeVersion": 1,
      "position": [
        220,
        0
      ]
    }
  ],
  "connections": {
    "When clicking 'Execute workflow'": {
      "main": [
        [
          {
            "node": "Skyscanner Hotels Scraper",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

## Pricing

The node itself is free. The Actor is paid per result on Apify: **$0.90 per 1,000 hotels** plus a tiny start fee per run ($0.00005), charged to the Apify account of your token. Every item the node returns counts as one result. The current price is always shown on the [Actor page](https://apify.com/scrapeunblocker/skyscanner-hotels-scraper), and your spending is visible in Apify Console.

## Compatibility

Tested with n8n 2.40 (self-hosted).

## Resources

- [Skyscanner Hotels Scraper Actor on Apify](https://apify.com/scrapeunblocker/skyscanner-hotels-scraper)
- [Apify API tokens documentation](https://docs.apify.com/platform/integrations/api#api-token)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [ScrapeUnblocker](https://www.scrapeunblocker.com/?utm_source=n8n&utm_medium=integration&utm_campaign=n8n-skyscanner-hotels-node) - the anti-bot scraping API behind the Actor

## Version history

- 0.1.0: Initial release
- 0.1.1: First release published from GitHub Actions with an npm provenance statement
