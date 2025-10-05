export type MockAIResponse = {
  prompt: string;
  content: string; // Now markdown content instead of separate fields
  images?: string[];
  sources?: string[];
};

export const mockAIResponses: MockAIResponse[] = [
  {
    prompt: "How do I verify if sneakers are authentic?",
    content: `Authentication is crucial in the sneaker resale market. The Air Jordan 1 'Chicago' is one of the most replicated sneakers, making verification essential before any purchase.

## Key Authentication Points

1. **Check the Swoosh** - Must be smooth, properly positioned, and symmetrical with clean edges
2. **Inspect Wings Logo** - Should have crisp embossing with clear 'AIR JORDAN' text and ® symbol
3. **Examine Stitching** - Look for consistent, straight lines with no loose threads or irregular spacing
4. **Verify Box Label** - Style code, production dates, and size must match the shoes exactly
5. **Assess Leather Quality** - Authentic pairs use premium leather with natural grain patterns

## Pro Tips

- Use professional authentication services like **CheckCheck** or **Legit App** ($10-30)
- Compare with verified authentic pairs on StockX or GOAT reference images
- Meet sellers at reputable sneaker stores that offer authentication services
- Request detailed photos of all angles, especially heel shape and toe box curve`,
    images: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=300&h=300&auto=format&fit=crop&q=60"
    ],
    sources: [
      "https://stockx.com/authentication-101",
      "https://www.goat.com/editorial/how-to-authenticate-jordans",
      "https://checkcheck.app/en/guide"
    ],
  },
  {
    prompt: "What's the current market value for Air Jordan 1 Chicago 2015?",
    content: `The 2015 Air Jordan 1 Retro High OG 'Chicago' remains one of the most valuable and sought-after sneakers in the resale market, with prices varying significantly based on condition, size, and seller platform.

## Current Market Prices

- **Size 9-11 (Most Popular)** - RM1,200 to RM1,500 for deadstock condition
- **Size 8 & 12-13** - RM900 to RM1,200 depending on condition
- **Smaller/Larger Sizes** - RM800 to RM1,000, typically more available
- **Lightly Worn Pairs** - Save RM200-400 compared to deadstock versions
- **Box Condition** - Original box with all accessories adds RM100-200 to value

## Market Tips

- Avoid listings under **RM700** - these are almost always replicas
- StockX and GOAT offer authentication but charge 10-15% service fees
- **Best time to buy**: Late December/January when many sellers liquidate inventory
- Price dropped 15% in 2024 due to market saturation - good time for buyers`,
    images: [
      "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=300&h=300&auto=format&fit=crop&q=60"
    ],
    sources: [
      "https://stockx.com/air-jordan-1-retro-high-og-chicago",
      "https://www.goat.com/sneakers/air-jordan-1-retro-high-og-chicago",
      "https://www.stadiumgoods.com/shopping/jordan-1-chicago"
    ],
  },
  {
    prompt: "Should I invest in sneakers as collectibles?",
    content: `Sneaker investing has evolved into a legitimate alternative asset class, with the resale market valued at over **$6 billion globally**. However, like any investment, it requires research, market knowledge, and careful strategy.

## Investment Considerations

- **ROI Potential** - Top-tier releases can appreciate 200-500% within first year
- **Market Volatility** - Prices fluctuate based on trends, celebrity endorsements, and supply
- **Liquidity** - Popular models sell quickly on platforms like StockX, GOAT, and Stadium Goods
- **Storage Requirements** - Proper storage away from sunlight and humidity is essential
- **Authentication Risk** - Counterfeit market is sophisticated; always verify authenticity

## Investment Strategy

1. Focus on **limited collaborations** (Nike x Off-White, Travis Scott, etc.)
2. Diversify across multiple brands and styles rather than going all-in on one pair
3. Keep original boxes, receipts, and all accessories to maximize resale value
4. Track market trends using StockX price charts and historical data
5. Consider selling fees (10-15%) when calculating potential profit margins`,
    sources: [
      "https://www.cowen.com/insights/sneaker-resale-market-research/",
      "https://stockx.com/news/2024-sneaker-investment-guide/",
      "https://www.bloomberg.com/news/articles/sneaker-resale-market"
    ],
  },
  {
    prompt: "What are the best places to buy authentic sneakers in Malaysia?",
    content: `Malaysia has a growing sneaker culture with both physical stores and online platforms offering authentic products. Knowing where to shop safely is essential to avoid counterfeits.

## Trusted Retailers

- **Foot Locker & JD Sports** - Official retailers with guaranteed authenticity
- **Sole What** - Malaysia's leading sneaker consignment store with authentication
- **Sneaker LAB MY** - Trusted local marketplace with verification services
- **Limited Edt** - Premium streetwear and sneaker boutique in KL
- **Online**: StockX, GOAT, eBay Authenticity Guarantee - Ship to Malaysia with authentication

## Shopping Tips

- Join Facebook groups like **'Sneaker Head Malaysia'** for community deals
- Attend sneaker conventions like **Sole Superior** for networking and purchases
- Use **PayPal Goods & Services** for buyer protection on peer-to-peer sales
- Beware of Instagram sellers without verified track records or escrow services`,
    images: [
      "https://images.unsplash.com/photo-1465479423260-c2bcd53b3d4e?w=300&h=300&auto=format&fit=crop&q=60"
    ],
    sources: [
      "https://solekl.com/",
      "https://www.footlocker.com.my/",
      "https://sneakerlab.my/"
    ],
  },
];
