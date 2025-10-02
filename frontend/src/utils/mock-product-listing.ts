// Mock product listing data for testing and development purposes in the product listing page.
// Product data type
export interface Product {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  currency: string;
  description: string;
  images: string[];
  tags: string[];
  seller: {
    name: string;
    location: string;
    verified: boolean;
    timePosted: string;
  };
  views: number;
  forSale: boolean;
  protected: boolean;
  gallery?: string[];
}


// Example product data
export const productData: Product = {
  id: "1",
  title: "Gaming PC Setup",
  subtitle: "RTX 4070",
  price: 3500.0,
  currency: "RM",
  description:
    'Complete gaming setup with RTX 4070, 32GB RAM, and 27" 144Hz monitor.',
  tags: ["gaming", "rtx-4070", "complete-setup", "like-new"],
  seller: {
    name: "Gamer_Girl_2024",
    location: "Sungai Besi, Kuala Lumpur",
    verified: true,
    timePosted: "5 hours ago",
  },
  views: 234,
  forSale: true,
  protected: true,
  images: [], 
  gallery: [
    "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=600&q=80",
    "https://images.unsplash.com/photo-1614624532983-4ce03382d63d?q=80&w=1331&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=600&q=80",
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80",
  ],
};