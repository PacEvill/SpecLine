# frozen_string_literal: true

class Rack::Attack
  # Use in-memory cache to avoid database reads/writes during attacks
  Rack::Attack.cache.store = ActiveSupport::Cache::MemoryStore.new(size: 16.megabytes)

  # ---------------------------------------------------------------------
  # 0. SAFELIST LOCALHOST IN DEV & TEST
  # ---------------------------------------------------------------------
  safelist("allow-localhost") do |req|
    (Rails.env.development? || Rails.env.test?) && (req.ip == "127.0.0.1" || req.ip == "::1") && !(req.user_agent =~ /libwww-perl|nikto|sqlmap|python-requests|curl\/7\.[0-5]|dirbuster|gobuster/i)
  end

  # ---------------------------------------------------------------------
  # 1. MALICIOUS USER-AGENTS BLOCKLIST
  # ---------------------------------------------------------------------
  bad_agents = /libwww-perl|nikto|sqlmap|python-requests|curl\/7\.[0-5]|dirbuster|gobuster/i
  blocklist("block/bad-user-agents") do |req|
    req.user_agent =~ bad_agents
  end

  # ---------------------------------------------------------------------
  # 2. RATE LIMITING (THROTTLING)
  # ---------------------------------------------------------------------

  # General limit per IP (100 requests per minute)
  throttle("req/ip", limit: 100, period: 1.minute) do |req|
    req.ip unless req.path.start_with?("/assets", "/up", "/rails/active_storage")
  end

  # Devise Login Protection (/users/sign_in) - Max 5 attempts per 20 seconds
  throttle("logins/ip", limit: 5, period: 20.seconds) do |req|
    if req.path == "/users/sign_in" && req.post?
      req.ip
    end
  end

  # Registration Protection (/users) - Max 3 accounts per hour per IP
  throttle("registrations/ip", limit: 3, period: 1.hour) do |req|
    if req.path == "/users" && req.post?
      req.ip
    end
  end

  # Password Reset Requests - Max 2 per hour per IP
  throttle("password_resets/ip", limit: 2, period: 1.hour) do |req|
    if req.path == "/users/password" && req.post?
      req.ip
    end
  end

  # WebSockets Connection Protection (/cable) - Max 10 connections every 10s
  throttle("cable/ip", limit: 10, period: 10.seconds) do |req|
    if req.path == "/cable"
      req.ip
    end
  end

  # ---------------------------------------------------------------------
  # 3. STANDARDIZED BLOCKED RESPONSE (HTTP 429)
  # ---------------------------------------------------------------------
  self.throttled_responder = lambda do |env|
    match_data = env["rack.attack.match_data"]
    now = match_data[:epoch_time]
    retry_after = (match_data[:period] - (now % match_data[:period])).to_s

    headers = {
      "Content-Type" => "application/json",
      "Retry-After" => retry_after,
      "X-RateLimit-Limit" => match_data[:limit].to_s,
      "X-RateLimit-Remaining" => "0",
      "X-RateLimit-Reset" => (now + (match_data[:period] - (now % match_data[:period]))).to_s
    }

    body = {
      error: "Rate limit exceeded. Please wait #{retry_after} seconds."
    }.to_json

    [ 429, headers, [ body ] ]
  end
end
