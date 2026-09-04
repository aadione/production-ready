import headphones from "@/assets/p-headphones.png";
import earbudsBlack from "@/assets/p-earbuds-black.png";
import earbudsWhite from "@/assets/p-earbuds-white.png";
import watch from "@/assets/p-watch.png";
import sneaker from "@/assets/p-sneaker.png";
import perfume from "@/assets/p-perfume.png";
import veggies from "@/assets/p-veggies.png";
import dairy from "@/assets/p-dairy.png";
import beverage from "@/assets/p-beverage.png";
import phone from "@/assets/p-phone.png";
import laptop from "@/assets/p-laptop.png";
import fashion from "@/assets/p-fashion.png";
import snacks from "@/assets/p-snacks.png";
import personalcare from "@/assets/p-personalcare.png";
import kitchen from "@/assets/p-kitchen.png";
import toys from "@/assets/p-toys.png";
import luggage from "@/assets/p-luggage.png";
import serum from "@/assets/p-serum.png";
import facewash from "@/assets/p-facewash.png";
import shampoo from "@/assets/p-shampoo.png";
import moisturizer from "@/assets/p-moisturizer.png";
import aloe from "@/assets/p-aloe.png";
import books from "@/assets/p-books.png";
import fitness from "@/assets/p-fitness.png";
import homeSofa from "@/assets/p-home.png";

export const img = {
  headphones,
  earbudsBlack,
  earbudsWhite,
  watch,
  sneaker,
  perfume,
  veggies,
  dairy,
  beverage,
  phone,
  laptop,
  fashion,
  snacks,
  personalcare,
  kitchen,
  toys,
  luggage,
  serum,
  facewash,
  shampoo,
  moisturizer,
  aloe,
  books,
  fitness,
  homeSofa,
};

export type Product = {
  id: string;
  brand: string;
  name: string;
  price: number;
  mrp: number;
  rating: number;
  reviews: string;
  image: string;
  category: string;
  tag?: "Bestseller" | "New";
  store?: string;
  tab?: "bestsellers" | "new";
};

export const inr = (n: number) => "₹" + n.toLocaleString("en-IN");
export const off = (p: Product) => Math.round(((p.mrp - p.price) / p.mrp) * 100);

export const quickCategories = [
  { name: "All", image: null },
  { name: "Grocery", image: veggies },
  { name: "Electronics", image: headphones },
  { name: "Fashion", image: fashion },
  { name: "Beauty", image: aloe },
  { name: "Home", image: homeSofa },
  { name: "Toys", image: toys },
];

export const shopCategories = [
  { name: "Fruits & Vegetables", short: "Fruits & Veg", items: "320+ items", image: veggies, tone: "green" },
  { name: "Dairy & Eggs", short: "Dairy & Eggs", items: "120+ items", image: dairy, tone: "blue" },
  { name: "Beverages", short: "Beverages", items: "150+ items", image: beverage, tone: "pink" },
  { name: "Snacks & Munchies", short: "Snacks", items: "250+ items", image: snacks, tone: "orange" },
  { name: "Personal Care", short: "Personal Care", items: "180+ items", image: personalcare, tone: "pink" },
  { name: "Home & Kitchen", short: "Home & Kitchen", items: "300+ items", image: kitchen, tone: "teal" },
  { name: "Electronics", short: "Electronics", items: "450+ items", image: headphones, tone: "blue" },
  { name: "Mobiles & Accessories", short: "Mobiles", items: "220+ items", image: phone, tone: "purple" },
  { name: "Fashion", short: "Fashion", items: "500+ items", image: fashion, tone: "orange" },
  { name: "Footwear", short: "Footwear", items: "200+ items", image: sneaker, tone: "blue" },
  { name: "Watches", short: "Watches", items: "120+ items", image: watch, tone: "grey" },
  { name: "Bags & Luggage", short: "Bags & Luggage", items: "150+ items", image: luggage, tone: "orange" },
  { name: "Toys & Baby", short: "Toys & Baby", items: "180+ items", image: toys, tone: "pink" },
  { name: "Books & Stationery", short: "Books", items: "200+ items", image: books, tone: "blue" },
  { name: "Sports & Fitness", short: "Sports", items: "160+ items", image: fitness, tone: "green" },
  { name: "Laptops", short: "Laptops", items: "90+ items", image: laptop, tone: "grey" },
];

export const products: Product[] = [
  {
    id: "boat-rockerz-450-pro",
    brand: "boAt",
    name: "boAt Rockerz 450 Pro Bluetooth Wireless Over Ear Headphones",
    price: 1699,
    mrp: 2999,
    rating: 4.6,
    reviews: "12,548",
    image: headphones,
    category: "Electronics",
    tag: "Bestseller",
  },
  {
    id: "boat-airdopes-161-pro",
    brand: "boAt",
    name: "Airdopes 161 Pro Wireless Earbuds",
    price: 1499,
    mrp: 2599,
    rating: 4.6,
    reviews: "12.5K",
    image: earbudsBlack,
    category: "Electronics",
    tag: "Bestseller",
  },
  {
    id: "noise-buds-vs104-pro",
    brand: "Noise",
    name: "Buds VS104 Pro True Wireless Earbuds",
    price: 1299,
    mrp: 1999,
    rating: 4.4,
    reviews: "8.2K",
    image: earbudsBlack,
    category: "Electronics",
  },
  {
    id: "realme-buds-t300",
    brand: "realme",
    name: "Buds T300 True Wireless Earbuds",
    price: 1399,
    mrp: 1999,
    rating: 4.5,
    reviews: "9.1K",
    image: earbudsWhite,
    category: "Electronics",
  },
  {
    id: "oneplus-buds-z2",
    brand: "OnePlus",
    name: "Buds Z2 Wireless Earbuds",
    price: 1999,
    mrp: 3499,
    rating: 4.6,
    reviews: "10.3K",
    image: earbudsBlack,
    category: "Electronics",
  },
  {
    id: "jbl-wave-200tws",
    brand: "JBL",
    name: "Wave 200TWS Wireless Earbuds",
    price: 1799,
    mrp: 2499,
    rating: 4.3,
    reviews: "7.6K",
    image: earbudsBlack,
    category: "Electronics",
  },
  {
    id: "ptron-bassbuds-pro",
    brand: "pTron",
    name: "Bassbuds Pro Wireless Earbuds",
    price: 999,
    mrp: 1449,
    rating: 4.2,
    reviews: "6.2K",
    image: earbudsWhite,
    category: "Electronics",
  },
  {
    id: "mamaearth-aloe-gel",
    brand: "Mamaearth",
    name: "Aloe Vera Gel 150 ml",
    price: 229,
    mrp: 299,
    rating: 4.6,
    reviews: "10K+",
    image: aloe,
    category: "Beauty",
  },
  {
    id: "minimalist-niacinamide",
    brand: "Minimalist",
    name: "Niacinamide 10% Face Serum",
    price: 382,
    mrp: 449,
    rating: 4.7,
    reviews: "12K+",
    image: serum,
    category: "Beauty",
  },
  {
    id: "puma-smashic",
    brand: "Puma",
    name: "Smashic Sneakers",
    price: 2099,
    mrp: 2999,
    rating: 4.4,
    reviews: "6K+",
    image: sneaker,
    category: "Footwear",
  },
  {
    id: "titan-classic-watch",
    brand: "Titan",
    name: "Classic Analog Watch",
    price: 1299,
    mrp: 2999,
    rating: 4.5,
    reviews: "4.1K",
    image: watch,
    category: "Watches",
  },
  {
    id: "engage-perfume",
    brand: "Engage",
    name: "Signature Eau De Parfum 100ml",
    price: 699,
    mrp: 1499,
    rating: 4.3,
    reviews: "3.2K",
    image: perfume,
    category: "Beauty",
  },
];

export const storeProducts: Product[] = [
  {
    id: "sa-hair-oil",
    brand: "Shreeji Aradhya",
    name: "Hair Maintenance Oil (100ml)",
    price: 349,
    mrp: 499,
    rating: 4.6,
    reviews: "2.1K",
    image: serum,
    category: "Hair Care",
    tag: "Bestseller",
    tab: "bestsellers",
  },
  {
    id: "sa-charcoal-facewash",
    brand: "Shreeji Aradhya",
    name: "Charcoal Face Wash (100ml)",
    price: 249,
    mrp: 349,
    rating: 4.5,
    reviews: "1.6K",
    image: facewash,
    category: "Face Wash",
    tag: "New",
    tab: "new",
  },
  {
    id: "sa-anti-dandruff",
    brand: "Shreeji Aradhya",
    name: "Anti Dandruff Shampoo (200ml)",
    price: 299,
    mrp: 449,
    rating: 4.6,
    reviews: "1.8K",
    image: shampoo,
    category: "Hair Care",
    tag: "Bestseller",
    tab: "bestsellers",
  },
  {
    id: "sa-vitc-serum",
    brand: "Shreeji Aradhya",
    name: "Vitamin C Face Serum (30ml)",
    price: 399,
    mrp: 599,
    rating: 4.7,
    reviews: "1.2K",
    image: serum,
    category: "Serums",
    tag: "New",
    tab: "new",
  },
  {
    id: "sa-acne-facewash",
    brand: "Shreeji Aradhya",
    name: "Acne Control Face Wash (100ml)",
    price: 269,
    mrp: 359,
    rating: 4.4,
    reviews: "980",
    image: facewash,
    category: "Face Wash",
  },
  {
    id: "sa-moisturizer",
    brand: "Shreeji Aradhya",
    name: "Hydrating Moisturizer (50ml)",
    price: 329,
    mrp: 449,
    rating: 4.6,
    reviews: "1.4K",
    image: moisturizer,
    category: "Moisturizers",
    tag: "Bestseller",
    tab: "bestsellers",
  },
  {
    id: "sa-body-lotion",
    brand: "Shreeji Aradhya",
    name: "Body Lotion (250ml)",
    price: 299,
    mrp: 399,
    rating: 4.5,
    reviews: "1.1K",
    image: shampoo,
    category: "Moisturizers",
    tag: "New",
    tab: "new",
  },
  {
    id: "sa-hair-growth",
    brand: "Shreeji Aradhya",
    name: "Hair Growth Serum (30ml)",
    price: 449,
    mrp: 649,
    rating: 4.7,
    reviews: "870",
    image: serum,
    category: "Serums",
  },
];

export const allProducts = [...products, ...storeProducts];

export const findProduct = (id: string) => allProducts.find((p) => p.id === id);

export const storeCategories = [
  { name: "Hair Care", image: shampoo },
  { name: "Skin Care", image: moisturizer },
  { name: "Serums", image: serum },
  { name: "Face Wash", image: facewash },
  { name: "Moisturizers", image: moisturizer },
];

export type Store = {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: string;
  orders: string;
  products: number;
  image: string;
  verified?: boolean;
};

export const stores: Store[] = [
  {
    id: "shreeji-aradhya",
    name: "Shreeji Aradhya",
    category: "Personal Care & Wellness",
    rating: 4.7,
    reviews: "12.6K",
    orders: "25K+",
    products: storeProducts.length,
    image: serum,
    verified: true,
  },
  {
    id: "sound-hub",
    name: "Sound Hub Electronics",
    category: "Audio & Wearables",
    rating: 4.5,
    reviews: "8.4K",
    orders: "18K+",
    products: 128,
    image: headphones,
    verified: true,
  },
  {
    id: "daily-bazaar",
    name: "Daily Bazaar Kirana",
    category: "Grocery & Essentials",
    rating: 4.4,
    reviews: "6.1K",
    orders: "40K+",
    products: 320,
    image: dairy,
  },
  {
    id: "glow-house",
    name: "Glow House Beauty",
    category: "Beauty & Skincare",
    rating: 4.6,
    reviews: "4.9K",
    orders: "12K+",
    products: 96,
    image: moisturizer,
  },
];
