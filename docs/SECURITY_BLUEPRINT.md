# SpecLine — Security Hardening, Offensive Testing & Autonomous Remediation Master Blueprint

**Project:** SpecLine — Unified Product Engineering Workspace  
**Architecture:** Ruby on Rails 8 Modular Monolith (Solid Stack, Hotwire, Thruster, Docker)  
**Target Infrastructure:** Render Free Tier (512MB RAM / 0.1 vCPU), Neon PostgreSQL (500MB SSD), Cloudflare R2/CDN, Resend  
**Budget:** $0.00  

## 1. Hardening Architecture & Controls

Given the strict constraints of the free infrastructure (512 MB RAM on Render and 500 MB database storage on Neon), all defensive measures are designed for high performance without computational overhead.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                          EDGE LAYER (EDGE)                             │
│  Cloudflare Free WAF + Bot Fight Mode + TLS 1.3 + DDoS Protection      │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ HTTPS / WSS
┌──────────────────────────────────▼─────────────────────────────────────┐
│                     APPLICATION EXECUTION LAYER                        │
│  Render Web Service (Docker + jemalloc + Thruster Proxy + Puma)        │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Rack::Attack Middleware (IP Throttling & Brute-Force Protection) │  │
│  └────────────────────────────────┬─────────────────────────────────┘  │
│                                   │                                    │
│  ┌────────────────────────────────▼─────────────────────────────────┐  │
│  │ Native Rails 8 Controls                                           │  │
│  │  • Devise (Bcrypt Cost: 12)    • ActiveStorage (Marcel Validation)│  │
│  │  • CSP & Strict Headers        • ActionController::Sanitizer     │  │
│  │  • Strict Tenant Scoping       • WebSockets Lock Guard           │  │
│  └────────────────────────────────┬─────────────────────────────────┘  │
└───────────────────────────────────┼────────────────────────────────────┘
                                    │ SSL Mode: Require
┌───────────────────────────────────▼────────────────────────────────────┐
│                   PERSISTENCE & DATA (DATABASE)                        │
│  Neon Postgres (PgBouncer Pooling) + Solid Stack (Cache/Queue/Cable)   │
│  • Storage Trimming: Max 30MB Cache + Auto Job Deletion                │
└────────────────────────────────────────────────────────────────────────┘
```

### 1.1 Edge Controls and Rate Limiting (Rack::Attack)

Blocks brute-force, credential-stuffing, and DoS attacks at the application layer before they consume Puma threads or database queries.

Create `config/initializers/rack_attack.rb`:

```ruby
# frozen_string_literal: true

class Rack::Attack
  # Use in-memory cache to avoid database reads/writes during attacks
  Rack::Attack.cache.store = ActiveSupport::Cache::MemoryStore.new(size: 16.megabytes)

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

    [429, headers, [body]]
  end
end
```

### 1.2 Security Headers and Content Security Policy (CSP)

Configure `config/environments/production.rb` and `config/initializers/content_security_policy.rb`:

```ruby
# config/environments/production.rb
Rails.application.configure do
  config.force_ssl = true
  config.ssl_options = {
    hsts: { subdomains: true, preload: true, expires: 1.year },
    redirect: { exclude: ->(request) { request.path == "/up" } } # Exception for Health Check
  }

  config.action_dispatch.default_headers = {
    "X-Frame-Options" => "DENY",
    "X-Content-Type-Options" => "nosniff",
    "X-XSS-Protection" => "0", # Disabled in favor of CSP
    "X-Permitted-Cross-Domain-Policies" => "none",
    "Referrer-Policy" => "strict-origin-when-cross-origin",
    "Permissions-Policy" => "camera=(), microphone=(), geolocation=(), payment=()"
  }
end
```

```ruby
# config/initializers/content_security_policy.rb
Rails.application.configure do
  config.content_security_policy do |policy|
    policy.default_src :self
    policy.font_src    :self, :https, :data, "https://fonts.gstatic.com"
    policy.img_src     :self, :https, :data, "https://*.r2.cloudflarestorage.com"
    policy.object_src  :none
    policy.script_src  :self, "https://cdn.jsdelivr.net"
    policy.style_src   :self, :https, "'unsafe-inline'", "https://fonts.googleapis.com"
    policy.connect_src :self, :wss, "https://*.neon.tech", "https://*.r2.cloudflarestorage.com"
    policy.frame_ancestors :none
    policy.base_uri    :self
    policy.form_action :self
  end

  # Dynamic nonces for Hotwire / Inline scripts
  config.content_security_policy_nonce_generator = ->(request) { request.session.id.to_s }
  config.content_security_policy_nonce_directives = %w[script-src]
end
```

### 1.3 Active Storage + Cloudflare R2 Protection (Magic Bytes Validation)

Prevents malicious file uploads by inspecting the actual binary header via the Marcel gem.
Create `app/models/concerns/secure_attachable.rb`:

```ruby
# frozen_string_literal: true

module SecureAttachable
  extend ActiveSupport::Concern

  ALLOWED_MIME_TYPES = %w[
    image/png
    image/jpeg
    image/webp
    application/pdf
  ].freeze

  MAX_FILE_SIZE = 5.megabytes

  included do
    def validate_secure_attachment(attachment_field)
      return unless public_send(attachment_field).attached?

      blob = public_send(attachment_field).blob

      # 1. Strict Size Restriction
      if blob.byte_size > MAX_FILE_SIZE
        errors.add(attachment_field, "file size exceeds maximum allowed limit of 5MB")
        blob.purge_later
        return
      end

      # 2. Magic Byte Inspection (Protection against extension spoofing)
      blob.open do |file|
        detected_type = Marcel::MimeType.for(file, name: blob.filename.to_s)
        
        unless ALLOWED_MIME_TYPES.include?(detected_type)
          errors.add(attachment_field, "contains invalid or unsafe content-type (#{detected_type})")
          blob.purge_later
        end
      end
    end
  end
end
```

### 1.4 Rich Text Sanitization (TipTap / Markdown)

Prevents Stored XSS attacks in collaborative document editing.
Create `app/models/concerns/html_sanitizer.rb`:

```ruby
# frozen_string_literal: true

module HtmlSanitizer
  extend ActiveSupport::Concern

  ALLOWED_TAGS = %w[
    p br strong em u h1 h2 h3 h4 ul ol li
    blockquote code pre a span div table thead tbody tr th td
  ].freeze

  ALLOWED_ATTRIBUTES = {
    "a" => %w[href target rel title],
    "span" => %w[class data-type data-id],
    "code" => %w[class],
    "pre" => %w[class]
  }.freeze

  def sanitize_html_field(content_str)
    return "" if content_str.blank?

    ActionController::Base.helpers.sanitize(
      content_str,
      tags: ALLOWED_TAGS,
      attributes: ALLOWED_ATTRIBUTES
    ).scrub!(:strip)
  end
end
```

### 1.5 Multi-Tenant Authorization & IDOR Protection

Ensures that requests never access resources outside the authenticated user's workspace.

```ruby
# app/controllers/application_controller.rb
class ApplicationController < ActionController::Base
  before_action :authenticate_user!
  before_action :set_current_workspace

  private

  def set_current_workspace
    return unless user_signed_in?

    # Resolve workspace scoped strictly to user permissions
    @current_workspace = current_user.workspaces.find(session[:workspace_id])
  rescue ActiveRecord::RecordNotFound
    @current_workspace = current_user.workspaces.first
    session[:workspace_id] = @current_workspace&.id
  end

  def current_workspace
    @current_workspace
  end
  helper_method :current_workspace
end
```

```ruby
# app/controllers/cards_controller.rb
class CardsController < ApplicationController
  before_action :set_card, only: %i[show edit update destroy]

  def show; end

  private

  def set_card
    # STRICT IDOR PROTECTION: Mandatory query scoped by current_workspace
    @card = current_workspace.cards.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Resource not found or unauthorized" }, status: :not_found
  end
end
```

### 1.6 Solid Stack Retention and Trimming (500 MB Limit on Neon)

Prevents cache tables and background queues from exceeding the free storage quota.

```yaml
# config/solid_cache.yml
default: &default
  store_options:
    max_age: <%= 3.days.to_i %>
    max_size: 30.megabytes
  clear_frequency: 1.hour

production:
  <<: *default
```

```yaml
# config/solid_queue.yml
production:
  dispatchers:
    - polling_interval: 2
      batch_size: 100
  workers:
    - queues: [ default, mailers ]
      threads: 2
      polling_interval: 2
```

## 2. Local Offensive Testing Roadmap (DAST, SAST, and Stress)

Run this test suite on your local machine against the development environment (`http://localhost:3000`) to stress-test the application before deploying to production.

### Phase 1: Static Code Analysis and Secrets Scanning (SAST)

```bash
# 1. Check for API keys or hardcoded passwords in the repository
gitleaks detect --source . --report-format json --report-path gitleaks-report.json -v

# 2. Audit known vulnerabilities in dependencies (Gems)
bundle exec bundle-audit check --update

# 3. Static security analysis focused on the Rails ecosystem
bundle exec brakeman -f json -o brakeman-report.json --ensure-latest -w1

# 4. OWASP Top 10 rule scan via Semgrep
semgrep scan --config=p/ruby --config=p/owasp-top-ten --json --output=semgrep-report.json
```

### Phase 2: Dynamic Runtime Attacks (DAST)

Start the application locally in terminal:

```bash
RAILS_ENV=development bin/rails server -p 3000
```

In another terminal tab, run:

#### A. Directory and Route Fuzzing (ffuf)

```bash
# Download the standard web route wordlist
curl -s -o wordlist.txt https://raw.githubusercontent.com/danielmiessler/SecLists/master/Discovery/Web-Content/common.txt

# Test hidden routes and unmapped admin panels
ffuf -w wordlist.txt -u http://localhost:3000/FUZZ -mc 200,301,302,401,403,500 -o ffuf-results.json
```

#### B. Web Vulnerability Scanning (Nuclei)

```bash
nuclei -u http://localhost:3000 \
  -tags cve,exposure,auth,xss,sqli,config \
  -severity critical,high,medium \
  -json-export nuclei-report.json
```

#### C. SQL Injection Testing (SQLmap)

```bash
sqlmap -u "http://localhost:3000/cards?search=test" \
  --batch \
  --level=3 \
  --risk=2 \
  --dbs
```

### Phase 3: Stress, Load, and Memory Testing

#### A. Rate Limiting Verification via Apache Bench

```bash
# Fire 100 simultaneous requests at login (Rack::Attack should block after 5 requests)
ab -n 100 -c 10 http://localhost:3000/users/sign_in
```

#### B. Load & Concurrency Testing via k6

Create `stress_test.js`:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 concurrent users
    { duration: '1m',  target: 50 }, // Peak at 50 concurrent users
    { duration: '30s', target: 0 },  // Ramp down
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'], // Error rate below 5%
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
  },
};

export default function () {
  const res1 = http.get('http://localhost:3000/');
  check(res1, { 'status 200 or 302': (r) => r.status === 200 || r.status === 302 });

  const res2 = http.get('http://localhost:3000/up');
  check(res2, { 'healthcheck ok': (r) => r.status === 200 });

  sleep(1);
}
```

Run the stress test:

```bash
k6 run stress_test.js
```

In parallel, monitor Puma's RAM consumption:

```bash
ps aux | grep puma | awk '{print $6/1024 " MB"}'
```

## 3. Automated Security Pipeline (GitHub Actions $0.00)

Create `.github/workflows/security.yml`:

```yaml
name: SpecLine Security Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  static-security-analysis:
    name: SAST and Dependency Audit
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.4'
          bundler-cache: true

      - name: Audit Vulnerabilities in Gems
        run: |
          gem install bundler-audit
          bundle-audit check --update

      - name: Run Brakeman (Rails SAST)
        run: |
          gem install bundler-audit brakeman
          brakeman -q -o brakeman-output.json --exit-on-warn

      - name: Secret Detection (Gitleaks)
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Code Scanning (Semgrep)
        uses: returntocorp/semgrep-action@v1
        with:
          config: >-
            p/ruby
            p/owasp-top-ten
            p/security-audit
```

## 4. Unified Master Prompt for CLI AI Agents (Claude Code / Antigravity)

This prompt is designed to be executed by an AI agent in the terminal. It commands the execution of scanning tools, reads structured JSON outputs, applies required refactorings to the codebase, and validates them via regression tests.

> You are a Principal Software Security Engineer specialized in the Ruby on Rails 8 framework.  
> Your objective is to run a complete security audit on the SpecLine project, identify vulnerabilities, and apply all fixes directly to the source code.
>
> **STEP 1: SCANNER EXECUTION (SAST & SECRETS)**  
> Run the following commands in the terminal and capture structured JSON outputs:  
>
> 1. `gitleaks detect --report-format json --report-path leaks.json -v`  
> 2. `bundle exec bundle-audit check --update`  
> 3. `bundle exec brakeman -f json -o brakeman.json --ensure-latest -w1`  
> 4. `semgrep scan --config=p/ruby --config=p/owasp-top-ten --json --output=semgrep.json`  
>
> **STEP 2: AUTOMATED ANALYSIS & REMEDIATION**  
> Read the generated JSON files (`brakeman.json`, `semgrep.json`, `leaks.json`) and the `bundle-audit` log, applying the following refactoring rules:  
>
> - **For SQL Injection:** Convert raw SQL string concatenations into parameterized ActiveRecord queries or use `ActiveRecord::Base.sanitize_sql`.  
> - **For IDOR (Insecure Direct Object References):** Ensure all Controller queries are strictly scoped through `current_workspace` or `current_user`.  
> - **For XSS / Stored HTML:** Apply strict whitelist sanitization on the document model (TipTap fields) using `ActionController::Base.helpers.sanitize`.  
> - **For Uploads:** Ensure Active Storage models include validation for maximum file size (5 MB) and content type verified via Magic Bytes (`Marcel`).  
> - **For Secret Leaks:** Remove exposed keys from code, move them to environment variables (`ENV['...']`), and add placeholders to `.env.example`.  
> - **For Vulnerable Gems:** Update dependencies using `bundle update <gem_name>`.  
>
> **STEP 3: VALIDATION AND CLEANUP**  
>
> 1. Run the project test suite: `bin/rails test`. Ensure all features continue to work as expected.  
> 2. Re-run `bundle exec brakeman -q` to confirm 0 remaining warnings.  
> 3. Delete all temporary JSON reports created (`leaks.json`, `brakeman.json`, `semgrep.json`).
