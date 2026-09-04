# Pixel Perfect Retail

Use this strict master prompt with Claude/Cursor/Lovable/Bolt. I recommend saying “pixel-accurate reference matching” rather than “100% identical”, because AI-generated images and browser rendering can never guarantee literal pixel equality—but this prompt pushes for maximum fidelity.





---



MASTER PROMPT — PIXEL-ACCURATE JAMSHEDPURWALA WEBAPP



I have uploaded 5 reference screenshots of a mobile ecommerce application.



Your task is to build a complete, functional Jamshedpurwala ecommerce web application that matches the uploaded screenshots with maximum possible pixel-level visual accuracy.



🚨 MOST IMPORTANT RULE



THE UPLOADED SCREENSHOTS ARE THE ABSOLUTE DESIGN SOURCE OF TRUTH.



Do NOT:



Redesign anything



Improve the design according to your own opinion



Change spacing



Change product card dimensions



Change colors



Change typography hierarchy



Increase whitespace



Make cards larger



Simplify sections



Add unnecessary UI



Use a generic ecommerce template



Replace the compact layout with a modern spacious layout





Your job is NOT to create a similar ecommerce website.



Your job is to REPRODUCE THE REFERENCE DESIGN AS ACCURATELY AS POSSIBLE.





---



PROJECT NAME



JAMSHEDPURWALA



A mobile-first ecommerce marketplace.





---



REFERENCE SCREENS



Study all uploaded screenshots carefully before writing any code.



The screenshots represent:



1. Home Page





2. Category Page





3. Store Profile Page





4. Search Results Page





5. Product Details Page







Extract the following from the screenshots:



Exact layout hierarchy



Approximate pixel spacing



Component dimensions



Grid columns



Product card proportions



Image ratios



Border radius



Shadows



Font sizes



Icon sizes



Header heights



Bottom navigation dimensions



Section spacing



Color palette



Visual density





Do not guess when a screenshot provides the answer.





---



TECH STACK



Use:



HTML5

CSS3

Vanilla JavaScript

Font Awesome Icons

Google Fonts



Do not use Bootstrap.



Do not use a heavy UI framework.



Build clean reusable components.





---



REQUIRED FILE STRUCTURE



/index.html

/categories.html

/search.html

/product.html

/store.html

/cart.html



/css/style.css

/js/script.js

/js/data.js



All pages must be interconnected and functional.





---



🎯 PRIMARY DESIGN PHILOSOPHY



The entire application must feel like:



> A premium, compact, dense, modern Indian ecommerce mobile application.







The reference design shows a large amount of information inside one mobile screen.



This is extremely important.



DO NOT create excessive whitespace.



The UI should be:



Compact

Dense

Organized

Easy to scan

Product-focused

Mobile-first





---



MOBILE CONTAINER



The main design target is:



width: 100%;

max-width: 430px;

margin: 0 auto;

min-height: 100vh;

background: #ffffff;



Primary reference width:



375px – 430px



Test specifically at:



375px

390px

393px

412px

430px





---



GLOBAL CSS RULES



* {

  box-sizing: border-box;

  margin: 0;

  padding: 0;

}



html,

body {

  width: 100%;

  min-height: 100%;

  overflow-x: hidden;

}



img {

  max-width: 100%;

  display: block;

}



button {

  font: inherit;

}



Never allow accidental horizontal page overflow.





---



🎨 EXACT DESIGN THEME



Background



Main:



#FFFFFF



Soft background:



#F8F9FA



Card background:



#FFFFFF



Primary Green



Use approximately:



#168A43



Accent greens:



#1A9B4A

#EAF8EF



Text



Primary:



#1F2937



Secondary:



#6B7280



Muted:



#9CA3AF



Borders



#E8E8E8



Use subtle borders.





---



BORDER RADIUS SYSTEM



Follow screenshot proportions.



Approximately:



Small: 8px

Medium: 12px

Large cards: 16px

Hero banners: 18px

Round buttons: 50%



Do not randomly use different radius values.





---



TYPOGRAPHY



Use:



Inter



or a visually close clean sans-serif.



Typography must be compact.



Suggested hierarchy:



Hero Title: 32–38px

Section Heading: 18–20px

Product Title: 13–14px

Brand: 11–12px

Price: 16–18px

Small Labels: 10–12px



Do not make normal text unnecessarily large.





---



=====================================================



PAGE 1 — HOME PAGE



=====================================================



Match the Home Page screenshot exactly.





---



TOP HEADER



Compact header.



Left:



Location icon



Jamshedpur ▼



Bistupur, 831001



Right:



Notification icon + red badge

Cart icon + red badge



Header should have approximately the same height as the screenshot.





---



SEARCH BAR



Full width rounded search bar.



Placeholder:



Search for products, brands or stores...



Left:



Search icon



Right:



Scan icon

Microphone icon



Keep exact compact height.





---



HERO SALE BANNER



Large rounded banner matching reference proportions.



Content:



BIG SAVINGS



Monsoon

Mega Sale



Up to 60% OFF



on Top Brands



Shop Now →



Visual elements:



Green umbrella



Headphones



Backpack



Bottle



Shoe



Green decorative elements



Countdown circle





Carousel dots below.



The banner should occupy approximately the same vertical space as the reference.





---



TRUST / SERVICE BAR



One horizontal card containing exactly 4 items:



🚚 Free Delivery

On Orders above ₹299



⚡ Quick Delivery

10–30 mins



🔄 Easy Returns

7 days return



🛡 Secure Payment

100% safe



Use separators.



Keep compact.





---



QUICK CATEGORY ROW



Horizontal category rail:



All

Grocery

Electronics

Fashion

Beauty

Home

Toys

More



Each category:



Small rounded square



Product/category icon



Small label





The active category uses green.



Must horizontally scroll smoothly.





---



THREE PROMOTIONAL CARDS



Three compact equal-width cards:



Card 1



GROCERY SAVER



Up to 50% OFF



On Daily Essentials



Shop Now →



Card 2



BEAUTY FEST



Up to 40% OFF



Glow Up This Season



Shop Now →



Card 3



ELECTRONICS DEALS



Up to 70% OFF



Latest & Bestsellers



Shop Now →



Use pastel backgrounds matching the reference.





---



FLASH SALE



Dark navy/black container.



Left side:



⚡ FLASH SALE



Limited Time Offer



02 : 18 : 47

HRS  MINS  SECS



Right:



Horizontal compact mini product cards.



Products:



Headphones



Watch



Shoe



Perfume





Each mini product card must be SMALL.



Do not make this section tall.





---



SHOP BY CATEGORY



Header:



Shop by Category



View All →



Compact grid.



Exactly similar visual density.



Categories:



Fruits & Veg

Dairy & Eggs

Snacks

Beverages

Personal Care

Home & Kitchen

Mobiles

Laptops

Footwear

Watches

Bags & Luggage

More



Use image-based small category tiles.





---



BEST DEALS FOR YOU



Horizontal product cards.



Each product card:



Discount badge



Product Image



Brand



Product Name



Rating



Price



Old Price



Green Add Button



Product cards should be SHORT and COMPACT.





---



BOTTOM OFFER BANNERS



Two side-by-side cards:



Left



Extra 10% OFF



On ICICI Cards



ICICI Bank



Right



Refer & Earn



Get ₹100 Cashback



Refer Now →





---



=====================================================



PAGE 2 — CATEGORY PAGE



=====================================================



Match reference screenshot.





---



HEADER



← Categories



Search

Wishlist

Cart + badge



Compact single-row layout.





---



CATEGORY HERO BANNER



Content:



Super Savings



Big Deals



On Top Categories



Up to 60% OFF



Shop Now →



Products:



Headphones



Grocery basket



Detergent



Chips





Purple offer badge:



Limited

Time Offer



Carousel dots.





---



TOP CATEGORIES



Horizontal row:



All

Grocery

Electronics

Fashion

Beauty

Home

Toys

More





---



SHOP BY CATEGORY GRID



This section is extremely important.



EXACTLY 3 COLUMNS.



Cards should have the same approximate size and aspect ratio as the reference.



Categories:



Fruits & Vegetables

Dairy & Eggs

Beverages



Snacks & Munchies

Personal Care

Home & Kitchen



Electronics

Mobiles & Accessories

Fashion



Footwear

Watches

Bags & Luggage



Toys & Baby

Books & Stationery

Sports & Fitness



Every card:



Category Name



Item Count



Small Arrow



Large Product Image



Use pastel backgrounds.



Example:



Green pastel

Blue pastel

Pink pastel

Purple pastel

Orange pastel

Grey pastel



Images must remain prominent.





---



CATEGORY DEAL BANNER



Bottom:



Category Deals



Extra 10% OFF



On All Orders Above ₹999



Shop Now →





---



=====================================================



PAGE 3 — STORE PROFILE



=====================================================



Store:



SHREEJI ARADHYA



Personal Care & Wellness





---



STORE HERO



Dark luxury banner.



Large typography:



SHREEJI



ARADHYA



PERSONAL CARE



Subtitle:



Pure Ingredients. Powerful Results.



Product bottles on the right.



Botanical dark background.



Feature icons:



Paraben Free

Sulfate Free

Cruelty Free

100% Vegan





---



TOP OVERLAY



←



Search in this store



Share



More





---



STORE PROFILE CARD



Overlapping the banner.



Store logo.



Shreeji Aradhya ✓



Personal Care & Wellness



⭐ 4.7 (12.6K reviews)



25K+ orders



Follow





---



TRUST ROW



100% Original Products



Easy Returns



On-time Delivery





---



DESCRIPTION



Shreeji Aradhya is all about purity and care.

Our products are made with natural ingredients

for a healthy you.



Read more.





---



STORE STATS



4-column compact stats card:



3+

Years on platform



25K+

Happy customers



4.7 ★

Store rating



24 hrs

Avg. response time





---



TOP STORE CATEGORIES



Horizontal:



Hair Care

Skin Care

Serums

Face Wash

Moisturizers

More



Small image tiles.





---



PRODUCT TABS



All Products

Bestsellers

New Launches



Green active underline.





---



FILTER + SORT ROW



Filter



Sort by: Popular





---



STORE PRODUCT GRID



Important:



EXACTLY 2 COLUMNS



Products:



Hair Maintenance Oil

Charcoal Face Wash

Anti Dandruff Shampoo

Vitamin C Face Serum

Acne Control Face Wash

Hydrating Moisturizer

Body Lotion

Hair Growth Serum



Maintain same product card dimensions as reference.





---



=====================================================



PAGE 4 — SEARCH RESULTS



=====================================================



Match reference.





---



SEARCH HEADER



←



🔍 wireless earbuds



×

🎤



Cart + badge





---



RESULTS HEADER



Results for "wireless earbuds"



128 results



Sort by Relevance ▼





---



FILTER ROW



Horizontal chips:



Filter

Brands

Price

Discount

Ratings

Delivery



Second row:



All



boAt ×



Noise ×



Realme ×



OnePlus ×



Clear all





---



PROMOTIONAL SEARCH BANNER



🏷



Best Deals on



Wireless Earbuds



Grab now before the offer ends!



UP TO 60% OFF



Earbuds image.



Green theme.





---



SEARCH PRODUCTS



EXACTLY 3 COLUMNS



This is critical.



The reference search page displays 3 compact product cards per row.



Do NOT use 2 columns.



Products:



boAt Airdopes 161 Pro

Noise Buds VS104 Pro

realme Buds T300



OnePlus Buds Z2

JBL Wave 200TWS

pTron Bassbuds Pro



Each card:



Discount Badge



Wishlist Icon



Large Product Image



Brand



Product Name



Rating + Reviews



Current Price



Original Price



Free Delivery



Round Green Cart Button



Maintain the exact compact card proportions.





---



REQUEST PRODUCT CARD



Can't find what you're looking for?



Tell us and we'll help you find it!



Request Product





---



=====================================================



PAGE 5 — PRODUCT DETAILS PAGE



=====================================================



Match screenshot.





---



LARGE PRODUCT HERO



The upper part of the screen is dominated by the product image.



Product:



boAt Rockerz 450 Pro

Bluetooth Wireless

Over Ear Headphones



Background:



Soft green/grey gradient.



Large product image centered.





---



TOP BUTTONS



←



Share



Wishlist



Floating rounded buttons.





---



PRODUCT BADGES



Left:



-43%



🔥 Bestseller



🛡 1 Year Warranty



Right:



View in 3D





---



IMAGE DOTS



Carousel indicators.





---



IMAGE THUMBNAILS



Horizontal thumbnails.



Image 1

Image 2

Image 3

Image 4

Image 5

+3 More





---



PRODUCT INFORMATION



Brand:



boAt



Product:



boAt Rockerz 450 Pro Bluetooth Wireless

Over Ear Headphones



Rating:



⭐ 4.6



(12,548 reviews)



Badge:



#1 Best Seller

in Headphones





---



PRICE



₹1,699



₹2,999



43% OFF



Below:



Inclusive of all taxes





---



FEATURES CARD



4 columns:



50mm Drivers

Deep Bass



Bluetooth 5.3

Fast Connection



Up to 15H Playtime

Long Battery



Built-in Mic

Clear Calls





---



OFFERS CARD



🏷 Offers & Discounts



Bank Offer:

10% Instant Discount on ICICI Cards



T&C





---



DELIVERY CARD



🚚 Delivery



Get it by Tomorrow, 31 May



Free Delivery on orders above ₹299





---



STICKY PURCHASE BAR



Above bottom navigation.



Left:



Cart icon button



Center:



Add to Cart



Right:



⚡ Buy Now



Buy Now = solid green.





---



=====================================================



PRODUCT CARD SYSTEM — STRICT



=====================================================



Create reusable product card classes.



There are different density modes:



.product-card.small

.product-card.grid-2

.product-card.grid-3

.product-card.horizontal



But visually all must belong to the same design system.





---



SEARCH PRODUCT CARD



Approximate visual structure:



┌──────────────┐

│ -43%     ♡   │

│              │

│    IMAGE     │

│              │

│ Brand        │

│ Product Name │

│ ⭐ 4.6       │

│ ₹1,499       │

│ Free Delivery│

│          🛒  │

└──────────────┘



Important:



Do not increase card height unnecessarily.



Images should occupy the largest portion.



Text must be compact.





---



=====================================================



BOTTOM NAVIGATION



=====================================================



Fixed bottom navigation.



Exactly 5 items:



Home

Categories

Search

Orders

Account



On store page:



Home

Categories

Search

Cart

Account



Visual requirements:



White background



Subtle top border



Fixed



Compact



Active item green



Icons outlined



Labels small



Safe-area padding





Approximate structure:



position: fixed;

bottom: 0;

left: 0;

right: 0;

height: 72px;

background: white;

border-top: 1px solid #eeeeee;



Adjust for mobile safe area.



Page content must have enough bottom padding.





---



=====================================================



FUNCTIONAL REQUIREMENTS



=====================================================



Implement working interactions.



Navigation



All pages connected.



Product click



Product Card → product.html



Category click



Category → filtered products



Store click



Store → store.html



Cart



Add Product

Update Cart Badge

Remove Product



Wishlist



Toggle heart.



Search



Search:



Products

Brands

Stores



Tabs



Store:



All Products

Bestsellers

New Launches



Must switch products.



Filters



Search page:



Brand

Price

Discount

Rating



Functional filtering.





---



IMAGE HANDLING



Use high-quality product images.



Requirements:



Transparent PNG style preferred

Centered product

Consistent scale

No random backgrounds

Object-fit contain



Example:



.product-image {

    width: 100%;

    height: 130px;

    object-fit: contain;

}



Adjust separately for grid sizes.



Do not crop important parts of products.





---



RESPONSIVE GRID RULES



Mobile



Home categories:



grid-template-columns: repeat(6, 1fr);



Category page:



grid-template-columns: repeat(3, 1fr);



Store products:



grid-template-columns: repeat(2, 1fr);



Search products:



grid-template-columns: repeat(3, 1fr);



These grid densities must remain consistent with the reference.





---



MICRO DETAILS



Pay close attention to:



Shadows



Very subtle:



box-shadow: 0 2px 8px rgba(0,0,0,.05);



Do not use heavy floating shadows.



Borders



Light:



border: 1px solid #eeeeee;



Buttons



Rounded but not pill-shaped unless shown in reference.



Icons



Thin outline style.



Badges



Small, colorful, compact.



Examples:



Red = high discount

Orange = bestseller

Pink = new

Green = offer

Purple = discount





---



PERFORMANCE



Ensure:



Fast loading



Lazy load images



No layout shift



Smooth horizontal scrolling



No broken images



No console errors



No unused dependencies







---



FINAL VISUAL VALIDATION PROCESS



Before considering the project complete:



Step 1



Render every page at:



390px × mobile viewport



Step 2



Compare against the uploaded screenshots.



Step 3



Check:



Header height

Search bar height

Banner height

Category icon size

Section gaps

Product card width

Product card height

Image scale

Font size

Bottom navigation height

Button positions

Border radius

Colors



Step 4



If any implementation looks more spacious than the screenshot:



Reduce spacing.



If product cards are larger:



Reduce them.



If images are smaller:



Increase image visibility.



If the UI looks like a generic website:



Refine until it feels like the supplied mobile app reference.





---



FINAL ABSOLUTE REQUIREMENT



> Build the application by treating every uploaded screenshot as a strict visual blueprint.







The final result should feel like one single cohesive Jamshedpurwala ecommerce mobile application, with the same compact theme, visual density, green accent system, card proportions, product box sizes, banners, spacing, navigation, and layout structure shown in the reference images.



Do not stop after generating basic code. Complete all pages, connect all navigation, and perform a final visual refinement pass against the screenshots. Or use supabase as a database

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://aradhyanta.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/df7dbfce-f436-473f-8dd1-2f19ec6abd86).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
