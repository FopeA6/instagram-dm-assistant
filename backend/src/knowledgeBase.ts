/**
 * Knowledge base content pulled directly from https://byadunni.com on
 * 2026-10-02 (FAQ page, shipping policy, and two product pages). This is
 * real, current content — not invented — captured as a static snapshot
 * for this demo rather than live-fetched on every request. See README
 * for why, and what a production version would do differently.
 */

export interface KnowledgeChunk {
  id: string;
  title: string;
  text: string;
  sourceUrl: string;
}

export const knowledgeBase: KnowledgeChunk[] = [
  {
    id: "faq_processing_time",
    title: "Order processing time",
    text: "All orders are generally processed within 3-5 working days. If you have placed an order during busiest periods such as restock days, orders can take 5-10 working days to process.",
    sourceUrl: "https://byadunni.com/pages/faqs",
  },
  {
    id: "faq_final_sale",
    title: "Returns policy",
    text: "We are unable to accept returns due to the handmade nature of our bags. Should an issue arise please contact us at info@byadunni.com.",
    sourceUrl: "https://byadunni.com/pages/faqs",
  },
  {
    id: "faq_worldwide_shipping",
    title: "Do you ship worldwide?",
    text: "We ship worldwide with tracked delivery services to most countries. Shipping costs are calculated at checkout based on your region. If you are unable to checkout to your location, contact info@byadunni.com to see what other options may be available.",
    sourceUrl: "https://byadunni.com/pages/faqs",
  },
  {
    id: "faq_manufacturing",
    title: "Where products are made",
    text: "Our beads are sourced from Lagos, Nigeria and the bags are produced in London, England.",
    sourceUrl: "https://byadunni.com/pages/faqs",
  },
  {
    id: "faq_custom_orders",
    title: "Custom orders",
    text: "We occasionally accept custom orders depending on materials and availability. Reach out to info@byadunni.com and we'll let you know if it's possible.",
    sourceUrl: "https://byadunni.com/pages/faqs",
  },
  {
    id: "faq_phone_fit",
    title: "Will my phone fit?",
    text: "Our bags are statement pieces, not designed to carry everything. Most styles will not fit a standard phone like an iPhone. Check the 'What Fits Inside' section on each product page before purchasing.",
    sourceUrl: "https://byadunni.com/pages/faqs",
  },
  {
    id: "shipping_uk",
    title: "UK shipping rates",
    text: "UK Mainland: Standard Shipping is 2-4 business days for £4.99, free on orders over £100.",
    sourceUrl: "https://byadunni.com/pages/shipping-policy",
  },
  {
    id: "shipping_usa_canada",
    title: "USA & Canada shipping rates",
    text: "USA & Canada (excluding US Virgin Islands): Express Shipping (customs & duties included, nothing more to pay on delivery) is 3-5 business days for £38.50. Standard Shipping (you pay customs on delivery) is 3-5 business days for £24.99.",
    sourceUrl: "https://byadunni.com/pages/shipping-policy",
  },
  {
    id: "shipping_europe",
    title: "Europe shipping rates",
    text: "Europe: Standard International Tracked is 5-10 business days for £17.99. Express International Tracked is 3-5 business days for £23.99.",
    sourceUrl: "https://byadunni.com/pages/shipping-policy",
  },
  {
    id: "shipping_rest_of_world",
    title: "Rest of world shipping rates",
    text: "Rest of the World: Standard International Tracked is 5-10 business days for £28.00. Express International Tracked is 2-5 business days for £35.00. Africa: Standard International Tracked is 6-12 business days for £30.00. Caribbean: Standard International Tracked is 5-10 business days for £30.00.",
    sourceUrl: "https://byadunni.com/pages/shipping-policy",
  },
  {
    id: "shipping_customs",
    title: "Customs and duties",
    text: "International orders (including EU) may be subject to customs duties, VAT, or import fees not included in the shipping cost, charged by the destination country and the customer's responsibility. US customers can select the Express Shipping option to have all customs charges included upfront instead.",
    sourceUrl: "https://byadunni.com/pages/shipping-policy",
  },
  {
    id: "product_platinum_barrel",
    title: "Platinum Barrel",
    text: "Platinum Barrel is a silver-toned hand-beaded barrel bag, £140.00 in the THICC carry option (Standard is a shorter handle variant, priced from £110.00). Hand-strung acrylic beads with a satin-lined interior, made by hand in London in small batches. Standard dimensions: 7in length x 9in height x 4in width, 5.5in handle drop. THICC dimensions: 9in length x 9in height x 4.5in width, 4in handle drop. What fits inside: keys, lip gloss, credit cards. Only 1 left in stock. Hand-beaded to order, ready to ship in 3-5 business days.",
    sourceUrl: "https://byadunni.com/products/platinum-barrel",
  },
  {
    id: "product_coffee",
    title: "Coffee",
    text: "Coffee is our best-selling bag, £95.00, featuring marbled swirls in brown, terracotta and white tones — perfect for an evening event. Hand-strung acrylic beads with a satin-lined interior, made by hand in London. Dimensions: 8in length x 8.5in height x 2.5in width, 4.7in handle drop. What fits inside: makeup, keys, cash, mini perfume. Only 1 left in stock. Hand-beaded to order, ready to ship in 3-5 business days.",
    sourceUrl: "https://byadunni.com/products/coffee",
  },
  {
    id: "brand_general",
    title: "About byAdunni",
    text: "byAdunni creates handmade beaded statement bags rooted in slow fashion and intentional design. Every bag is hand-beaded in London, bead by bead, made in small batches so no two are exactly alike. Rated 4.9/5, loved by 300+ customers.",
    sourceUrl: "https://byadunni.com/",
  },
  {
    id: "care_instructions",
    title: "Bag care",
    text: "If stains or marks appear on the satin lining, dab with a washcloth. The bags are not made from an elastic material, so avoid overloading them as this can alter the shape. Do not cut or remove the internal wiring.",
    sourceUrl: "https://byadunni.com/products/platinum-barrel",
  },
];
