import axios from "axios";

interface GitHubUser {
  id: number;
  name: string;
  email: string;
  avatar_url: string;
}

interface AccessTokenResponse {
  access_token: string;
}

// interface UserResponse {
//   id: number;
//   name: string;
// }

const TOKEN_URL = "https://github.com/login/oauth/access_token";
const USER_URL = "https://api.github.com/user";

async function getGitHubUser(code: string) {
  const token = await getAccessToken(code);
  return getUser(token);
}

async function getAccessToken(code: string) {
  const response = await axios.post<AccessTokenResponse>(
    TOKEN_URL,
    {
      client_id: process.env.AUTH_GITHUB_ID,
      client_secret: process.env.AUTH_GITHUB_SECRET,
      code,
    },
    {
      headers: { Accept: "application/json" },
    }
  );

  return response.data.access_token;
}

async function getUser(token: string) {
  const response = await axios.get<GitHubUser>(USER_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
}

export { getGitHubUser };
