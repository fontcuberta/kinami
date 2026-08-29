export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
};

export type Circle = {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  created_by: string;
  created_at: string;
};

export type CircleMember = {
  circle_id: string;
  user_id: string;
  role: "admin" | "member";
  joined_at: string;
  profiles?: Profile;
};

export type Home = {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  city: string;
  country: string;
  photos: string[];
  created_at: string;
  profiles?: Profile;
};

export type Availability = {
  id: string;
  home_id: string;
  start_date: string;
  end_date: string;
  notes: string | null;
  created_at: string;
};

export type SwapStatus = "pending" | "accepted" | "declined" | "cancelled";

export type SwapRequest = {
  id: string;
  home_id: string;
  circle_id: string;
  requester_id: string;
  start_date: string;
  end_date: string;
  status: SwapStatus;
  created_at: string;
  homes?: Home;
  profiles?: Profile;
};

export type Message = {
  id: string;
  swap_request_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  profiles?: Profile;
};
