Feature: Cloudflare Worker proxy
  The Worker is a thin CORS-enabled proxy between the browser and the Anthropic API.
  It holds the ANTHROPIC_API_KEY as a Worker secret — never exposed to the client.
  It accepts a POST request with a built system prompt and a user message.
  It returns the Claude response as plain text.
  It enforces CORS so only the authorised origin can call it.

  # ---------------------------------------------------------------------------
  # Happy path
  # ---------------------------------------------------------------------------

  Scenario: POST with valid payload returns Claude commentary
    Given the Worker is deployed with a valid ANTHROPIC_API_KEY secret
    When a POST request is made to /commentary with:
      | Field        | Value                              |
      | systemPrompt | a non-empty string                 |
      | userMessage  | "What is your reaction?"           |
    Then the response status is 200
    And the response body contains a non-empty commentary string

  Scenario: Response uses the correct Claude model
    When a valid POST request is made to /commentary
    Then the Anthropic API is called with model "claude-sonnet-4-6"

  # ---------------------------------------------------------------------------
  # CORS
  # ---------------------------------------------------------------------------

  Scenario: OPTIONS preflight request returns correct CORS headers
    When an OPTIONS request is made to /commentary
    Then the response status is 204
    And the response includes header "Access-Control-Allow-Origin"
    And the response includes header "Access-Control-Allow-Methods" containing "POST"
    And the response includes header "Access-Control-Allow-Headers" containing "Content-Type"

  Scenario: POST response includes CORS header
    When a valid POST request is made to /commentary
    Then the response includes header "Access-Control-Allow-Origin"

  # ---------------------------------------------------------------------------
  # Validation
  # ---------------------------------------------------------------------------

  Scenario: Missing systemPrompt returns 400
    When a POST request is made to /commentary without "systemPrompt"
    Then the response status is 400
    And the response body contains an error message

  Scenario: Missing userMessage returns 400
    When a POST request is made to /commentary without "userMessage"
    Then the response status is 400
    And the response body contains an error message

  Scenario: Empty systemPrompt returns 400
    When a POST request is made to /commentary with systemPrompt ""
    Then the response status is 400

  Scenario: Non-POST method returns 405
    When a GET request is made to /commentary
    Then the response status is 405

  # ---------------------------------------------------------------------------
  # API key
  # ---------------------------------------------------------------------------

  Scenario: Missing ANTHROPIC_API_KEY secret returns 500
    Given the Worker is deployed without the ANTHROPIC_API_KEY secret
    When a valid POST request is made to /commentary
    Then the response status is 500
    And the response body contains a readable error message
    And the API key value is not present in the response body

  # ---------------------------------------------------------------------------
  # Anthropic API errors
  # ---------------------------------------------------------------------------

  Scenario: Anthropic API rate limit error is surfaced as 429
    Given the Anthropic API returns a 429 rate limit response
    When a valid POST request is made to /commentary
    Then the Worker response status is 429
    And the response body contains a readable error message

  Scenario: Anthropic API error does not leak raw API response to client
    Given the Anthropic API returns an error
    When a valid POST request is made to /commentary
    Then the response body does not contain the ANTHROPIC_API_KEY value
    And the response body does not contain raw Anthropic error internals
