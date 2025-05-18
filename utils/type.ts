export interface Post {
  id: string;                   // UUID
  country: string | null;
  city: string | null;
  longitude: string | null;
  latitude: string | null;
  visit_date: Date | null;
  reason_for_visit: string | null;
  overall_rating: number;       // 1-5
  experience: string | null;
  cost_rating: number;          // 1-5
  safety_rating: number;        // 1-5
  food_rating: number;          // 1-5
  like_count: number;
  comment_count: number;
  user_id: string;              // UUID
  createdAt: number;            // BIGINT timestamp
  updatedAt: number;
  user?: User;                  // Associated user
  photos?: Photo[];             // Associated photos
  created_at_formatted?: string;
  visit_date_formatted?: string;
}

export interface Photo {
  id: string;                // UUID
  post_id: string;           // UUID, foreign key to Post
  image_url: string;         // Required image URL
  createdAt: number;         // BIGINT timestamp
  updatedAt: number;         // BIGINT timestamp
  post?: Post;               // Associated post
}

export interface User {
  id: string;                         // UUID
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string;
  password?: string;                  // Optional in responses
  phone: string | null;
  image: string | null;
  address: string | null;
  is_verified: boolean;               // Default: false
  block: boolean;                     // Default: false
  instagram_sync: boolean;            // Default: false
  contact_sync: boolean;              // Default: false
  notification_type: string;          // Default: '0'                                      // 1:new follower, 2:message, 3:like and comment, 4:email
  public_profile: boolean;            // Default: false
  message_request: boolean;           // Default: false
  location_sharing: boolean;          // Default: false
  account_type: 'admin' | 'user';     // Default: 'user'
  createdAt: number;                  // BIGINT timestamp
  updatedAt: number;
  posts?: Post[];                     // User's posts
  followers?: User[];                 // Users following this user
  following?: User[];
  TopDestination?: TopDestination[];
  Wishlist?: Wishlist[];
  Highlight?: Highlight[];
  created_at_formatted?: string;
}

export interface Wishlist {
  id: string;                // UUID
  user_id: string;           // UUID, foreign key to User
  destination: string;       // Required destination string
  createdAt: number;         // BIGINT timestamp
  updatedAt: number;
  user?: User;
  created_at_formatted?: string;
}

export interface Highlight {
  id: string;                // UUID
  user_id: string;           // UUID, foreign key to User
  type: string;              // Type of highlight (e.g., "continent", "country", "city")
  value: string;             // Value of highlight (e.g., "North America", "USA", "San Francisco")
  createdAt: number;         // BIGINT timestamp
  updatedAt: number;
  user?: User;
  created_at_formatted?: string;
}

export interface TopDestination {
  id: string;                // UUID
  user_id: string;           // UUID, foreign key to User
  name: string;              // Name of destination (e.g., "Niagara Falls")
  image: string | null;      // URL of the destination image
  rating: number;            // Rating of destination (e.g., 4.5)
  createdAt: number;         // BIGINT timestamp
  updatedAt: number;
  user?: User;
  created_at_formatted?: string;
}

export interface Comment {
  id: string;                // UUID
  user_id: string;           // UUID, foreign key to User
  post_id: string;           // UUID, foreign key to Post
  comment: string;           // Required comment text
  createdAt: number;         // BIGINT timestamp
  updatedAt: number;
  user?: User;               // Associated user who made the comment
  post?: Post;
  created_at_formatted?: string;
}

export interface CreateCommentInput {
  post_id: string;
  comment: string;
}

