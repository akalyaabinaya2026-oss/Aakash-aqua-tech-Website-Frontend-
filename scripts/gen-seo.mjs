/* Runs automatically before `npm run build`: writes public/sitemap.xml and public/robots.txt from the product data.
   Set your real domain:  SITE_URL=https://www.yourdomain.com npm run build */
import { writeFileSync } from 'node:fs'
import { products, cats, groups, catBrands, hrefOf } from '../src/data.js'
import { BLOG_POSTS, postHref } from '../src/blogData.js'

const SITE = (process.env.SITE_URL || 'https://aakashaquatech.in').replace(/\/$/, '')
    const urls = new Set(['/', '/about', '/contact', '/zones-we-serve', '/testimonials', '/privacy-policy', '/terms-and-conditions', '/disclaimer', '/shipping-and-cancellation', '/blog'])
Object.keys(groups).forEach((g) => urls.add('/shop/' + g))
Object.keys(cats).forEach((c) => {
  urls.add(hrefOf(c))
  ;(catBrands[c] || []).forEach(
    (b) => products.some((p) => p.cat === c && p.brand === b) && urls.add(hrefOf(c) + '/' + b),
  )
})
products.forEach((p) => urls.add('/product/' + p.slug))
BLOG_POSTS.forEach((p) => p.body && urls.add(postHref(p))) /* in-app blog articles */

const today = new Date().toISOString().slice(0, 10)
const prio = (u) => (u === '/' ? '1.0' : u.startsWith('/product') ? '0.6' : u.startsWith('/shop') ? '0.8' : '0.7')
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...urls].map((u) => `  <url><loc>${SITE}${u === '/' ? '/' : u}</loc><lastmod>${today}</lastmod><priority>${prio(u)}</priority></url>`).join('\n')}
</urlset>
`
writeFileSync(new URL('../public/sitemap.xml', import.meta.url), xml)
writeFileSync(
  new URL('../public/robots.txt', import.meta.url),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`,
)
console.log(`SEO: ${urls.size} URLs written to public/sitemap.xml (site: ${SITE})`)
