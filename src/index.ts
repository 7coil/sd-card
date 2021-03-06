import fetch from 'node-fetch';
import { parse, X2jOptions } from "fast-xml-parser";
import { RootObject } from './SubscriptionData';
import { readFileSync, writeFileSync } from 'fs';
import { decode as decodeHTML } from 'html-entities';

const sleep = (time: number) => new Promise((resolve) => setTimeout(resolve, time))

const parserOptions = {
  parseAttributeValue: true,
  parseNodeValue: true,
  ignoreAttributes: false,
  attributeNamePrefix: "",
  arrayMode: /^item$/g,
} as Partial<X2jOptions>;

const GUID: string[] = []
const WEBHOOK = process.env.WEBHOOK as string

// Read existing GUID from file
try {
  const guidFile = readFileSync('guid.txt', { encoding: 'utf-8' })
  for (const link of guidFile.split('\n')) {
    if (link.length) GUID.push(link)
  }
} catch {}

const update = async () => {
  console.log('Performing update...', new Date())
  // Remove the front post if array too big
  while (GUID.length > 100) {
    GUID.shift()
  }

  const xml = await fetch('https://www.hotukdeals.com/rss/hot').then(data => data.text())
  const parsed = (await parse(xml, parserOptions)) as RootObject

  for (const item of parsed.rss.channel.item) {
    if (!GUID.includes(item.guid)) {
      console.log('Found:', item.guid)
      GUID.push(item.guid)

      let text = item.link + '\n\nsd card'

      if (item['pepper:merchant']) {
        const merchant = item['pepper:merchant'];
        if (merchant.name) text += ` @ ${decodeHTML(decodeHTML(item['pepper:merchant'].name))}`
        if (merchant.price) text += ` for ${item['pepper:merchant'].price}`
      }

      while(true) {
        const req = await fetch(WEBHOOK, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: text
          })
        })
  
        if (req.status === 200) {
          // Hurrah!
          break;
        } else {
          try {
            const errorDetails = await req.json();
            if (errorDetails.retry_after) {
              await sleep(errorDetails.retry_after);
            }
          } catch(e) {
            await sleep(5000)
          }
        }
      }
    } else {
      console.log('Skipping:', item.guid)
    }
  }

  // Save GUID to file
  writeFileSync('guid.txt', GUID.join('\n') + '\n')
}

// Update every 5 minutes
setInterval(update, 5 * 60 * 1000)
update();
