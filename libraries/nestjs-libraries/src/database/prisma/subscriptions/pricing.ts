export interface PricingInnerInterface {
  current: string;
  month_price: number;
  year_price: number;
  channel?: number;
  posts_per_month: number;
  team_members: boolean;
  community_features: boolean;
  featured_by_gitroom: boolean;
  ai: boolean;
  import_from_channels: boolean;
  image_generator?: boolean;
  image_generation_count: number;
  generate_videos: number;
  clipping_minutes: number;
  // posts to channels whose API bills us per post (see SocialProvider.meteredPosts)
  metered_posts_per_month: number;
  // fair-use cap on AI writing requests (assistant, agent, post generator)
  ai_text_count: number;
  public_api: boolean;
  webhooks: number;
  autoPost: boolean;
}
export interface PricingInterface {
  [key: string]: PricingInnerInterface;
}
export const pricing: PricingInterface = {
  FREE: {
    current: 'FREE',
    month_price: 0,
    year_price: 0,
    channel: 0,
    image_generation_count: 0,
    posts_per_month: 0,
    team_members: false,
    community_features: false,
    featured_by_gitroom: false,
    ai: false,
    import_from_channels: false,
    image_generator: false,
    public_api: false,
    webhooks: 0,
    autoPost: false,
    generate_videos: 0,
    clipping_minutes: 0,
    metered_posts_per_month: 0,
    ai_text_count: 0,
  },
  STANDARD: {
    current: 'STANDARD',
    month_price: 29,
    year_price: 278,
    channel: 5,
    posts_per_month: 1000000,
    image_generation_count: 20,
    team_members: false,
    ai: true,
    community_features: false,
    featured_by_gitroom: false,
    import_from_channels: true,
    image_generator: false,
    public_api: true,
    webhooks: 2,
    autoPost: false,
    generate_videos: 3,
    clipping_minutes: 0,
    metered_posts_per_month: 100,
    ai_text_count: 200,
  },
  TEAM: {
    current: 'TEAM',
    month_price: 39,
    year_price: 374,
    channel: 10,
    posts_per_month: 1000000,
    image_generation_count: 100,
    community_features: true,
    team_members: true,
    featured_by_gitroom: true,
    ai: true,
    import_from_channels: true,
    image_generator: true,
    public_api: true,
    webhooks: 10,
    autoPost: true,
    generate_videos: 10,
    clipping_minutes: 0,
    metered_posts_per_month: 200,
    ai_text_count: 500,
  },
  PRO: {
    current: 'PRO',
    month_price: 49,
    year_price: 470,
    channel: 30,
    posts_per_month: 1000000,
    image_generation_count: 300,
    community_features: true,
    team_members: true,
    featured_by_gitroom: true,
    ai: true,
    import_from_channels: true,
    image_generator: true,
    public_api: true,
    webhooks: 30,
    autoPost: true,
    generate_videos: 30,
    clipping_minutes: 0,
    metered_posts_per_month: 300,
    ai_text_count: 1000,
  },
  ULTIMATE: {
    current: 'ULTIMATE',
    month_price: 99,
    year_price: 950,
    channel: 100,
    posts_per_month: 1000000,
    image_generation_count: 500,
    community_features: true,
    team_members: true,
    featured_by_gitroom: true,
    ai: true,
    import_from_channels: true,
    image_generator: true,
    public_api: true,
    webhooks: 10000,
    autoPost: true,
    generate_videos: 60,
    clipping_minutes: 0,
    metered_posts_per_month: 500,
    ai_text_count: 2000,
  },
};
